import {
	convertToModelMessages,
	stepCountIs,
	streamText,
	type UIMessage,
} from 'ai'
import { z } from 'zod'

import { createModel } from '@/lib/ai'
import { closeMcpClients, resolveMcpTools } from '@/lib/mcp/connection-manager'
import type { ProviderId } from '@/lib/providers'
import { PROVIDER_PRESETS } from '@/lib/providers'
import {
	getSession,
	maybeUpdateSessionTitle,
	saveMessage,
	touchSession,
} from '@/lib/sessions'
import { chatTools } from '@/lib/tools'

export const maxDuration = 60

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
})

export async function POST(req: Request) {
	const body = await req.json()
	const parsed = bodySchema.safeParse(body)
	if (!parsed.success) {
		return Response.json({ error: '请求无效' }, { status: 400 })
	}
	const { messages, sessionId, provider, mcpServers } = parsed.data

	if (sessionId && !getSession(sessionId)) {
		return Response.json({ error: '会话不存在' }, { status: 404 })
	}

	const lastMessage = messages.at(-1)
	if (sessionId && lastMessage?.role === 'user') {
		saveMessage(sessionId, lastMessage)
		maybeUpdateSessionTitle(sessionId, lastMessage)
	}

	const { model } = createModel(provider)
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
		onEnd: async ({ responseMessage, isAborted }) => {
			if (!sessionId || isAborted) return
			saveMessage(sessionId, responseMessage)
			touchSession(sessionId)
		},
	})
}
