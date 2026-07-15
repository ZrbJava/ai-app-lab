'use client'

import { useState } from 'react'

import AddMcpServerDialog from '@/components/mcp/AddMcpServerDialog'
import McpServerCard from '@/components/mcp/McpServerCard'
import { MCP_CATALOG } from '@/lib/mcp/catalog'
import type { McpServerConfig } from '@/lib/mcp/types'
import { useMcpServers } from '@/hooks/useMcpServers'

async function testServer(server: McpServerConfig) {
	const res = await fetch('/api/mcp/test', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			id: server.id,
			name: server.name,
			transport: server.transport,
			url: server.url,
			apiKey: server.apiKey,
		}),
	})
	return res.json() as Promise<{
		ok: boolean
		error?: string
		toolCount?: number
		toolNames?: string[]
	}>
}

export default function McpSettings({
	initialDialogOpen = false,
}: {
	initialDialogOpen?: boolean
}) {
	const {
		servers,
		addFromCatalog,
		addCustom,
		updateServer,
		removeServer,
	} = useMcpServers()
	const [dialogOpen, setDialogOpen] = useState(initialDialogOpen)
	const [testingId, setTestingId] = useState<string | null>(null)

	const handleTest = async (server: McpServerConfig) => {
		setTestingId(server.id)
		updateServer(server.id, { status: 'testing', statusMessage: '连接中…' })
		try {
			const result = await testServer(server)
			if (result.ok) {
				updateServer(server.id, {
					status: 'ok',
					statusMessage: `已连接 · ${result.toolCount} 个工具`,
					toolCount: result.toolCount,
					toolNames: result.toolNames,
					lastTestedAt: new Date().toISOString(),
				})
			} else {
				updateServer(server.id, {
					status: 'error',
					statusMessage: result.error ?? '连接失败',
				})
			}
		} catch (err) {
			updateServer(server.id, {
				status: 'error',
				statusMessage: err instanceof Error ? err.message : '连接失败',
			})
		} finally {
			setTestingId(null)
		}
	}

	return (
		<div className='h-full overflow-y-auto bg-neutral-50'>
			<div className='mx-auto max-w-5xl px-4 py-8 md:px-8'>
				<div className='mb-8 flex flex-wrap items-start justify-between gap-4'>
					<div>
						<h2 className='text-xl font-semibold text-[var(--text)]'>
							MCP 连接器
						</h2>
						<p className='mt-1 max-w-2xl text-sm text-[var(--text-muted)]'>
							配置外部 MCP Server，对话时按需启用。凭证仅存浏览器本地。
						</p>
					</div>
					<button
						type='button'
						onClick={() => setDialogOpen(true)}
						className='rounded-lg bg-[var(--text)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90'
					>
						+ 添加 MCP Server
					</button>
				</div>

				<section className='mb-8'>
					<h3 className='mb-3 text-sm font-medium text-[var(--text-muted)]'>
						推荐服务
					</h3>
					<div className='grid gap-3 sm:grid-cols-2'>
						{MCP_CATALOG.map((item, index) => {
							const installed = servers.some(s => s.url === item.url)
							return (
								<div
									key={item.url}
									className='rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4'
								>
									<div className='flex items-start justify-between gap-3'>
										<div>
											<p className='font-medium text-slate-900'>{item.name}</p>
											<p className='mt-1 text-xs text-slate-500'>
												{item.statusMessage}
											</p>
											<p className='mt-2 truncate font-mono text-xs text-slate-400'>
												{item.url}
											</p>
										</div>
										<button
											type='button'
											disabled={installed}
											onClick={() => addFromCatalog(index)}
											className='shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40'
										>
											{installed ? '已添加' : '一键添加'}
										</button>
									</div>
								</div>
							)
						})}
					</div>
				</section>

				<section>
					<div className='mb-3 flex items-center justify-between'>
						<h3 className='text-sm font-semibold text-slate-700'>
							我的连接器 ({servers.length})
						</h3>
					</div>

					{servers.length === 0 ? (
						<div className='rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center'>
							<p className='text-sm text-slate-500'>
								还没有 MCP Server。从推荐服务一键添加，或自定义 URL。
							</p>
						</div>
					) : (
						<div className='grid gap-4'>
							{servers.map(server => (
								<McpServerCard
									key={server.id}
									server={server}
									testing={testingId === server.id}
									onToggle={enabled => updateServer(server.id, { enabled })}
									onTest={() => handleTest(server)}
									onRemove={() => removeServer(server.id)}
								/>
							))}
						</div>
					)}
				</section>
			</div>

			<AddMcpServerDialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				onSave={config => {
					addCustom(config)
					setDialogOpen(false)
				}}
				onSaveAndTest={async config => {
					const server = addCustom(config)
					setDialogOpen(false)
					await handleTest({ ...server, status: 'testing' })
				}}
			/>
		</div>
	)
}
