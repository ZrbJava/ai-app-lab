import type { McpServerConfig } from '@/lib/mcp/types'

/** 运营方可预置的推荐 MCP（对标 LobeChat 市场一键安装） */
export const MCP_CATALOG: Omit<
	McpServerConfig,
	'id' | 'enabled' | 'status'
>[] = [
	{
		name: 'DeepWiki',
		transport: 'streamable-http',
		url: 'https://mcp.deepwiki.com/mcp',
		source: 'catalog',
		statusMessage: 'GitHub 仓库文档检索，免 API Key',
	},
	{
		name: 'Boar Blockchain',
		transport: 'streamable-http',
		url: 'https://mcp.boar.network/basic',
		source: 'catalog',
		statusMessage: '以太坊等链上只读查询，免 API Key',
	},
]
