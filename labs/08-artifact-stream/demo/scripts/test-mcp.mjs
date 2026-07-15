/**
 * 快速探测 MCP Server 是否可用（不经过 LLM）
 * 用法：node scripts/test-mcp.mjs deepwiki
 */
import { createMCPClient } from '@ai-sdk/mcp'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PRESETS = {
	deepwiki: {
		transport: { type: 'http', url: 'https://mcp.deepwiki.com/mcp' },
	},
	boar: {
		transport: { type: 'http', url: 'https://mcp.boar.network/basic' },
	},
	everything: {
		stdio: {
			command: 'npx',
			args: ['-y', '@modelcontextprotocol/server-everything'],
		},
	},
	filesystem: {
		stdio: {
			command: 'npx',
			args: [
				'-y',
				'@modelcontextprotocol/server-filesystem',
				path.join(path.dirname(fileURLToPath(import.meta.url)), '..'),
			],
		},
	},
}

const id = process.argv[2] ?? 'deepwiki'
const preset = PRESETS[id]
if (!preset) {
	console.error(`Unknown preset: ${id}. Use: ${Object.keys(PRESETS).join(', ')}`)
	process.exit(1)
}

const client = preset.stdio
	? await createMCPClient({
			transport: new StdioClientTransport(preset.stdio),
		})
	: await createMCPClient({ transport: preset.transport })

try {
	const tools = await client.tools()
	const names = Object.keys(tools)
	console.log(`✓ ${id}: connected, ${names.length} tools`)
	console.log(names.slice(0, 10).join(', ') + (names.length > 10 ? '...' : ''))
} finally {
	await client.close()
}
