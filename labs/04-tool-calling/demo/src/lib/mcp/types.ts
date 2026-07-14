export type McpTransport = 'streamable-http' | 'sse'

export type McpServerStatus = 'idle' | 'ok' | 'error' | 'testing'

/** 用户可配置的 MCP Server（对标 LibreChat user-tier） */
export type McpServerConfig = {
	id: string
	name: string
	transport: McpTransport
	url: string
	apiKey?: string
	enabled: boolean
	source: 'user' | 'catalog'
	toolCount?: number
	toolNames?: string[]
	lastTestedAt?: string
	status: McpServerStatus
	statusMessage?: string
}

/** 发往 API 的运行时配置（仅启用的 Server） */
export type McpServerRuntime = Pick<
	McpServerConfig,
	'id' | 'name' | 'transport' | 'url' | 'apiKey'
>

export const MCP_STORAGE_KEY = 'mcp-servers-v1'
