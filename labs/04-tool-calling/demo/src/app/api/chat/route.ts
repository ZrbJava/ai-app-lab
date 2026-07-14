import {
	convertToModelMessages,
	createUIMessageStreamResponse,
	stepCountIs,
	streamText,
	toUIMessageStream,
	type UIMessage,
} from 'ai'
import { z } from 'zod'

import { createModel } from '@/lib/ai'
import {
	closeMcpClients,
	resolveMcpTools,
} from '@/lib/mcp/connection-manager'
import type { ProviderId } from '@/lib/providers'
import { chatTools } from '@/lib/tools'

export const maxDuration = 60

const mcpServerSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	transport: z.enum(['streamable-http', 'sse']),
	url: z.string().url(),
	apiKey: z.string().optional(),
})

export async function POST(req: Request) {
	const body = await req.json()
	const { messages, provider, mcpServers } = body as {
		messages: UIMessage[]
		provider?: ProviderId
		mcpServers?: unknown
	}

	const parsedMcp = z.array(mcpServerSchema).safeParse(mcpServers ?? [])
	if (!parsedMcp.success) {
		return Response.json({ error: 'MCP 配置无效' }, { status: 400 })
	}

	const { model } = createModel(provider)
	let mcpClients: Awaited<ReturnType<typeof resolveMcpTools>>['clients'] = []
	let tools = chatTools

	if (parsedMcp.data.length > 0) {
		const mcp = await resolveMcpTools(parsedMcp.data)
		mcpClients = mcp.clients
		tools = { ...chatTools, ...mcp.tools }
	}

	const mcpNames = parsedMcp.data.map(s => s.name).join('、')
	const toolHint =
		parsedMcp.data.length > 0
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

	return createUIMessageStreamResponse({
		stream: toUIMessageStream({ stream: result.stream }),
	})
}
