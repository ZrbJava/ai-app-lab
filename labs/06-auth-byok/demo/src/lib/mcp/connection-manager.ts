import { createMCPClient, type MCPClient } from '@ai-sdk/mcp'
import type { ToolSet } from 'ai'

import { validateMcpUrl } from '@/lib/mcp/url-validator'
import type { McpServerRuntime } from '@/lib/mcp/types'

function buildHeaders(apiKey?: string): Record<string, string> | undefined {
	if (!apiKey?.trim()) return undefined
	return { Authorization: `Bearer ${apiKey.trim()}` }
}

function prefixTools(tools: ToolSet, serverId: string): ToolSet {
	const prefixed: ToolSet = {}
	for (const [name, toolDef] of Object.entries(tools)) {
		prefixed[`${serverId}__${name}`] = toolDef
	}
	return prefixed
}

export async function testMcpServer(
	server: McpServerRuntime
): Promise<{ toolCount: number; toolNames: string[] }> {
	const validated = validateMcpUrl(server.url)
	if (!validated.ok) throw new Error(validated.error)

	const client = await createMcpClientForServer(server)
	try {
		const tools = await client.tools()
		console.log('tools', tools)
		const toolNames = Object.keys(tools)
		return { toolCount: toolNames.length, toolNames }
	} finally {
		await client.close()
	}
}

async function createMcpClientForServer(
	server: McpServerRuntime
): Promise<MCPClient> {
	const validated = validateMcpUrl(server.url)
	if (!validated.ok) throw new Error(validated.error)

	const headers = buildHeaders(server.apiKey)
	const transport =
		server.transport === 'sse'
			? { type: 'sse' as const, url: validated.url.toString(), headers }
			: { type: 'http' as const, url: validated.url.toString(), headers }

	return createMCPClient({ transport })
}

export async function resolveMcpTools(servers: McpServerRuntime[]): Promise<{
	tools: ToolSet
	clients: MCPClient[]
}> {
	if (servers.length === 0) return { tools: {}, clients: [] }

	const clients: MCPClient[] = []
	let merged: ToolSet = {}

	for (const server of servers) {
		const client = await createMcpClientForServer(server)
		clients.push(client)
		const tools = await client.tools()
		merged = { ...merged, ...prefixTools(tools, server.id) }
	}

	return { tools: merged, clients }
}

export async function closeMcpClients(clients: MCPClient[]) {
	await Promise.all(clients.map(c => c.close().catch(() => undefined)))
}
