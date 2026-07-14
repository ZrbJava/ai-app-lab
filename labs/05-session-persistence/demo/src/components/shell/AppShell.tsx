'use client'

import type { ReactNode } from 'react'

import type { SessionSummary } from '@/hooks/useSessions'

type View = 'chat' | 'mcp'

type AppShellProps = {
	view: View
	onViewChange: (view: View) => void
	children: ReactNode
	sessions?: SessionSummary[]
	activeSessionId?: string | null
	sessionsLoading?: boolean
	onNewSession?: () => void
	onSelectSession?: (id: string) => void
	onDeleteSession?: (id: string) => void
}

function IconChat({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75'>
			<path d='M12 3c5 0 9 3.6 9 8 0 2.2-1 4.2-2.6 5.6L21 21l-4.5-1.5C15.4 20.5 13.7 21 12 21 7 21 3 17.4 3 13S7 3 12 3z' strokeLinecap='round' strokeLinejoin='round' />
		</svg>
	)
}

function IconPlug({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75'>
			<path d='M12 22v-5M9 8V2h6v6M5 12H2v2a4 4 0 004 4h12a4 4 0 004-4v-2h-3' strokeLinecap='round' strokeLinejoin='round' />
		</svg>
	)
}

function IconPlus({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
			<path d='M12 5v14M5 12h14' strokeLinecap='round' />
		</svg>
	)
}

export default function AppShell({
	view,
	onViewChange,
	children,
	sessions = [],
	activeSessionId,
	sessionsLoading = false,
	onNewSession,
	onSelectSession,
	onDeleteSession,
}: AppShellProps) {
	return (
		<div className='app-shell bg-white text-neutral-900'>
			<aside className='app-sidebar'>
				<div className='p-3'>
					<button
						type='button'
						onClick={onNewSession}
						className='sb-btn sb-btn-ghost'
					>
						<IconPlus className='h-4 w-4 shrink-0' />
						新建对话
					</button>
				</div>

				<div className='min-h-0 flex-1 overflow-y-auto px-2 pb-2'>
					{sessionsLoading ? (
						<p className='sb-muted px-3 py-2 text-xs'>加载中…</p>
					) : sessions.length === 0 ? (
						<p className='sb-muted px-3 py-2 text-xs'>暂无对话记录</p>
					) : (
						<ul className='space-y-0.5'>
							{sessions.map(session => {
								const active =
									view === 'chat' && session.id === activeSessionId
								return (
									<li key={session.id} className='group relative'>
										<button
											type='button'
											onClick={() => onSelectSession?.(session.id)}
											className={`sb-btn pr-9 ${active ? 'sb-btn-active' : ''}`}
										>
											<p className='truncate'>{session.title}</p>
										</button>
										<button
											type='button'
											aria-label='删除对话'
											onClick={e => {
												e.stopPropagation()
												onDeleteSession?.(session.id)
											}}
											className='sb-muted absolute right-2 top-1/2 hidden -translate-y-1/2 rounded p-1 transition hover:bg-[var(--sb-hover)] hover:text-[var(--sb-text)] group-hover:block'
										>
											<svg className='h-3.5 w-3.5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
												<path d='M18 6L6 18M6 6l12 12' strokeLinecap='round' />
											</svg>
										</button>
									</li>
								)
							})}
						</ul>
					)}
				</div>

				<div className='sb-divider space-y-0.5 border-t p-2'>
					<button
						type='button'
						onClick={() => onViewChange('chat')}
						className={`sb-btn ${view === 'chat' ? 'sb-btn-active' : ''}`}
					>
						<IconChat className='h-4 w-4 shrink-0' />
						对话
					</button>
					<button
						type='button'
						onClick={() => onViewChange('mcp')}
						className={`sb-btn ${view === 'mcp' ? 'sb-btn-active' : ''}`}
					>
						<IconPlug className='h-4 w-4 shrink-0' />
						MCP 连接器
					</button>
				</div>

				<div className='sb-divider sb-muted border-t px-4 py-3 text-[11px]'>
					AI App Lab · Lab 05
				</div>
			</aside>

			<div className='app-main'>
				<main className='min-h-0 flex-1 overflow-hidden'>{children}</main>
			</div>
		</div>
	)
}
