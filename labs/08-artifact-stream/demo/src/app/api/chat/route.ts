import {
	convertToModelMessages,
	createUIMessageStream,
	createUIMessageStreamResponse,
	stepCountIs,
	streamText,
	toUIMessageStream,
	type UIMessage,
} from 'ai'
import { z } from 'zod'

import { buildFinalInstructions, runAgentPipeline } from '@/lib/agent/pipeline'
import {
	createArtifactStepWriter,
	writeFinalAnswerArtifact,
} from '@/lib/artifact/stream'
import { createModelForUser } from '@/lib/ai'
import { authErrorResponse, requireUser } from '@/lib/auth-utils'
import type { LabUIMessage } from '@/lib/chat-types'
import { closeMcpClients, resolveMcpTools } from '@/lib/mcp/connection-manager'
import type { ProviderId } from '@/lib/providers'
import { PROVIDER_PRESETS } from '@/lib/providers'
import {
	getSession,
	maybeUpdateSessionTitle,
	touchSession,
	upsertMessage,
} from '@/lib/sessions'
import { chatTools } from '@/lib/tools'

export const maxDuration = 120

const mcpServerSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	transport: z.enum(['streamable-http', 'sse']),
	url: z.string().url(),
	apiKey: z.string().optional(),
})

const bodySchema = z.object({
	messages: z.array(z.custom<UIMessage>()),
	sessionId: z.string().uuid().optional(),
	provider: z
		.enum(PROVIDER_PRESETS.map(p => p.id) as [ProviderId, ...ProviderId[]])
		.optional(),
	mcpServers: z.array(mcpServerSchema).optional(),
	/** Lab 07+：启用 analyze → plan → execute → answer 流水线 */
	agentMode: z.boolean().optional(),
})

function extractUserQuery(messages: UIMessage[]): string {
	const lastUser = [...messages].reverse().find(m => m.role === 'user')
	if (!lastUser) return ''
	return lastUser.parts
		.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
		.map(p => p.text)
		.join(' ')
}

async function persistAssistantReply(
	sessionId: string | undefined,
	responseMessage: UIMessage | undefined,
) {
	if (!sessionId || !responseMessage?.parts?.length) return
	if (responseMessage.role !== 'assistant') return
	upsertMessage(sessionId, responseMessage)
	touchSession(sessionId)
}

export async function POST(req: Request) {
	try {
		const user = await requireUser()
		const body = await req.json()
		const parsed = bodySchema.safeParse(body)
		if (!parsed.success) {
			return Response.json({ error: '请求无效' }, { status: 400 })
		}
		const { messages, sessionId, provider, mcpServers, agentMode } = parsed.data

		if (sessionId && !getSession(sessionId, user.id)) {
			return Response.json({ error: '会话不存在' }, { status: 404 })
		}

		const lastMessage = messages.at(-1)
		if (sessionId && lastMessage?.role === 'user') {
			upsertMessage(sessionId, lastMessage)
			maybeUpdateSessionTitle(sessionId, lastMessage)
		}

		const { model } = createModelForUser(user.id, provider)
		let mcpClients: Awaited<ReturnType<typeof resolveMcpTools>>['clients'] = []
		let tools = chatTools

		if ((mcpServers ?? []).length > 0) {
			const mcp = await resolveMcpTools(mcpServers!)
			mcpClients = mcp.clients
			tools = { ...chatTools, ...mcp.tools }
		}

		const mcpNames = (mcpServers ?? []).map(s => s.name).join('、')
		const toolHint =
			(mcpServers ?? []).length > 0
				? `已启用 MCP：${mcpNames}。外部工具名带 serverId__ 前缀。`
				: '可使用本地 getWeather / calc。'

		if (agentMode) {
			const userQuery = extractUserQuery(messages)
			console.log('[agent] pipeline start:', userQuery.slice(0, 80))

			return createUIMessageStreamResponse({
				stream: createUIMessageStream<LabUIMessage>({
					originalMessages: messages as LabUIMessage[],
					execute: async ({ writer }) => {
						const emitArtifact = createArtifactStepWriter(writer)

						const ctx = await runAgentPipeline({
							model,
							userQuery,
							tools,
							toolHint,
							onStep: emitArtifact,
						})

						const finalInstructions = buildFinalInstructions(ctx)
						console.log(
							'[agent] pipeline done, phase=%s steps=%d',
							ctx.phase,
							ctx.steps.length,
						)

						writeFinalAnswerArtifact(writer, 'running')

						const result = streamText({
							model,
							messages: await convertToModelMessages(messages),
							instructions: finalInstructions,
						})

						writer.merge(
							toUIMessageStream({ stream: result.stream }),
						)

						const answer = await result.text
						writeFinalAnswerArtifact(writer, 'ok', answer)
						await closeMcpClients(mcpClients)
					},
					onEnd: async ({ responseMessage }) => {
						await persistAssistantReply(sessionId, responseMessage)
					},
				}),
			})
		}

		const result = streamText({
			model,
			messages: await convertToModelMessages(messages),
			tools,
			stopWhen: stepCountIs(5),
			instructions: `你可以使用工具回答问题。${toolHint} 需要实时数据时优先调用工具，再根据结果回答。`,
			onEnd: async () => {
				await closeMcpClients(mcpClients)
			},
		})

		return result.toUIMessageStreamResponse({
			originalMessages: messages,
			onEnd: async ({ responseMessage, messages: allMessages }) => {
				if (!sessionId) return

				const assistant =
					responseMessage?.parts?.length &&
					responseMessage.role === 'assistant'
						? responseMessage
						: allMessages.filter(m => m.role === 'assistant').at(-1)

				await persistAssistantReply(sessionId, assistant)
			},
		})
	} catch (error) {
		const authRes = authErrorResponse(error)
		if (authRes) return authRes
		const message = error instanceof Error ? error.message : '服务器错误'
		return Response.json({ error: message }, { status: 500 })
	}
}
