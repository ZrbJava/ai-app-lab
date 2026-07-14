'use client'

import type { ReactNode } from 'react'

type View = 'chat' | 'mcp'

type AppShellProps = {
	view: View
	onViewChange: (view: View) => void
	children: ReactNode
}

const NAV = [
	{ id: 'chat' as const, label: '对话', icon: '💬' },
	{ id: 'mcp' as const, label: 'MCP 连接器', icon: '🔌' },
]

export default function AppShell({ view, onViewChange, children }: AppShellProps) {
	return (
		<div className='flex h-screen bg-[#f8fafc] text-slate-900'>
			<aside className='hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white md:flex'>
				<div className='border-b border-slate-200 px-5 py-5'>
					<p className='text-xs font-medium uppercase tracking-wider text-slate-400'>
						AI App Lab
					</p>
					<h1 className='mt-1 text-lg font-semibold text-slate-900'>
						Workbench
					</h1>
					<p className='mt-1 text-xs text-slate-500'>
						Provider · Tools · MCP
					</p>
				</div>

				<nav className='flex-1 space-y-1 p-3'>
					{NAV.map(item => {
						const active = view === item.id
						return (
							<button
								key={item.id}
								type='button'
								onClick={() => onViewChange(item.id)}
								className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
									active
										? 'bg-slate-900 text-white shadow-sm'
										: 'text-slate-600 hover:bg-slate-100'
								}`}
							>
								<span className='text-base'>{item.icon}</span>
								<span className='font-medium'>{item.label}</span>
							</button>
						)
					})}
				</nav>

				<div className='border-t border-slate-200 p-4 text-xs text-slate-400'>
					对标 LibreChat / LobeChat MCP 配置
				</div>
			</aside>

			<div className='flex min-w-0 flex-1 flex-col'>
				<header className='flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-6'>
					<div className='flex gap-2 md:hidden'>
						{NAV.map(item => (
							<button
								key={item.id}
								type='button'
								onClick={() => onViewChange(item.id)}
								className={`rounded-lg px-3 py-1.5 text-sm ${
									view === item.id
										? 'bg-slate-900 text-white'
										: 'bg-slate-100 text-slate-600'
								}`}
							>
								{item.label}
							</button>
						))}
					</div>
					<p className='hidden text-sm text-slate-500 md:block'>
						{view === 'chat' ? '多 Provider 对话 + Tool Calling' : '管理 MCP Server 连接'}
					</p>
				</header>

				<main className='min-h-0 flex-1 overflow-hidden'>{children}</main>
			</div>
		</div>
	)
}
