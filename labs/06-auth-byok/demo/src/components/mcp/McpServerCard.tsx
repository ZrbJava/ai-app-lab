'use client'

import type { McpServerConfig } from '@/lib/mcp/types'

type McpServerCardProps = {
	server: McpServerConfig
	testing: boolean
	onToggle: (enabled: boolean) => void
	onTest: () => void
	onRemove: () => void
}

function StatusDot({ status }: { status: McpServerConfig['status'] }) {
	const color =
		status === 'ok'
			? 'bg-emerald-500'
			: status === 'error'
				? 'bg-red-500'
				: status === 'testing'
					? 'bg-amber-400 animate-pulse'
					: 'bg-slate-300'
	return <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />
}

export default function McpServerCard({
	server,
	testing,
	onToggle,
	onTest,
	onRemove,
}: McpServerCardProps) {
	return (
		<div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300'>
			<div className='flex flex-wrap items-start justify-between gap-4'>
				<div className='min-w-0 flex-1'>
					<div className='flex items-center gap-2'>
						<StatusDot status={server.status} />
						<h4 className='font-semibold text-slate-900'>{server.name}</h4>
						<span className='rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500'>
							{server.source === 'catalog' ? '推荐' : '自定义'}
						</span>
					</div>
					<p className='mt-1 truncate font-mono text-xs text-slate-400'>
						{server.url}
					</p>
					<p className='mt-2 text-xs text-slate-500'>
						{server.statusMessage ?? '尚未测试连接'}
						{server.toolCount != null && ` · ${server.toolCount} tools`}
					</p>
					{server.toolNames && server.toolNames.length > 0 && (
						<p className='mt-2 line-clamp-2 text-xs text-slate-400'>
							{server.toolNames.slice(0, 6).join(', ')}
							{server.toolNames.length > 6 ? '…' : ''}
						</p>
					)}
				</div>

				<div className='flex items-center gap-2'>
					<label className='flex cursor-pointer items-center gap-2 text-xs text-slate-600'>
						<input
							type='checkbox'
							checked={server.enabled}
							onChange={e => onToggle(e.target.checked)}
							className='h-4 w-4 rounded border-slate-300'
						/>
						启用
					</label>
					<button
						type='button'
						onClick={onTest}
						disabled={testing}
						className='rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50'
					>
						{testing ? '测试中…' : '测试连接'}
					</button>
					<button
						type='button'
						onClick={onRemove}
						className='rounded-lg px-2 py-1.5 text-xs text-red-600 transition hover:bg-red-50'
					>
						删除
					</button>
				</div>
			</div>
		</div>
	)
}
