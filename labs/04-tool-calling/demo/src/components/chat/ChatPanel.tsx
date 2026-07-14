'use client'

import { useChat } from '@ai-sdk/react'
import { getToolName, isToolUIPart, type UIMessage } from 'ai'
import { useState } from 'react'

import { useMcpServers } from '@/hooks/useMcpServers'
import { PROVIDER_PRESETS, type ProviderId } from '@/lib/providers'

function renderPart(part: UIMessage['parts'][number]) {
	if (part.type === 'text') {
		return part.text ? (
			<p className='whitespace-pre-wrap text-sm leading-relaxed text-slate-800'>
				{part.text}
			</p>
		) : null
	}

	if (isToolUIPart(part)) {
		const name = getToolName(part)
		if (part.state === 'output-available') {
			return (
				<div className='mt-2 rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-2 text-xs text-amber-900'>
					<span className='font-medium'>Tool</span> {name}
					<pre className='mt-1 overflow-x-auto whitespace-pre-wrap font-mono text-[11px] opacity-80'>
						{JSON.stringify(part.output, null, 2)}
					</pre>
				</div>
			)
		}
		if (part.state === 'output-error') {
			return (
				<div className='mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700'>
					✗ {name}：{part.errorText}
				</div>
			)
		}
		return (
			<div className='mt-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700'>
				🔧 正在调用 {name}
				{part.state === 'input-available' && part.input
					? ` ${JSON.stringify(part.input)}`
					: '…'}
			</div>
		)
	}

	return null
}

export default function ChatPanel() {
	const [input, setInput] = useState('')
	const [provider, setProvider] = useState<ProviderId>('zhipu')
	const { messages, sendMessage, status, error } = useChat()
	const { servers, enabledRuntime } = useMcpServers()

	const isLoading = status === 'streaming' || status === 'submitted'
	const enabledServers = servers.filter(s => s.enabled)

	return (
		<div className='mx-auto flex h-full max-w-3xl flex-col px-4 py-4 md:px-6'>
			<div className='mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
				<div className='flex flex-wrap items-center gap-3'>
					<label className='text-xs font-medium text-slate-500'>Provider</label>
					<select
						value={provider}
						onChange={e => setProvider(e.target.value as ProviderId)}
						disabled={isLoading}
						className='rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm disabled:opacity-50'
					>
						{PROVIDER_PRESETS.map(p => (
							<option key={p.id} value={p.id}>
								{p.label}
							</option>
						))}
					</select>
				</div>

				<div className='mt-3 border-t border-slate-100 pt-3'>
					<p className='mb-2 text-xs font-medium text-slate-500'>
						已启用 MCP ({enabledServers.length})
					</p>
					{enabledServers.length === 0 ? (
						<p className='text-xs text-slate-400'>
							未启用 MCP · 前往「MCP 连接器」添加并启用
						</p>
					) : (
						<div className='flex flex-wrap gap-2'>
							{enabledServers.map(s => (
								<span
									key={s.id}
									className='inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600'
								>
									<span
										className={`h-1.5 w-1.5 rounded-full ${
											s.status === 'ok' ? 'bg-emerald-500' : 'bg-slate-300'
										}`}
									/>
									{s.name}
								</span>
							))}
						</div>
					)}
				</div>
			</div>

			<ul className='mb-4 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1'>
				{messages.length === 0 && (
					<li className='rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-10 text-center text-sm text-slate-400'>
						试试「北京天气怎么样」或启用 DeepWiki 后问「vercel/ai 的 wiki 结构」
					</li>
				)}
				{messages.map(message => (
					<li
						key={message.id}
						className={`rounded-2xl px-4 py-3 ${
							message.role === 'user'
								? 'ml-8 border border-slate-200 bg-white shadow-sm'
								: 'mr-8 border border-slate-100 bg-slate-50'
						}`}
					>
						<span className='text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
							{message.role}
						</span>
						{message.parts.map((part, index) => (
							<div key={`${message.id}-${index}`}>{renderPart(part)}</div>
						))}
					</li>
				))}
			</ul>

			{error && (
				<p className='mb-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600' role='alert'>
					{error.message}
				</p>
			)}

			<form
				onSubmit={e => {
					e.preventDefault()
					const text = input.trim()
					if (!text || isLoading) return
					sendMessage(
						{ text },
						{
							body: {
								provider,
								mcpServers: enabledRuntime(),
							},
						},
					)
					setInput('')
				}}
				className='flex gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm'
			>
				<input
					className='flex-1 bg-transparent px-3 py-2 text-sm outline-none disabled:opacity-50'
					value={input}
					onChange={e => setInput(e.target.value)}
					placeholder='输入消息…'
					disabled={isLoading}
				/>
				<button
					type='submit'
					disabled={isLoading || !input.trim()}
					className='rounded-xl bg-slate-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-40'
				>
					{isLoading ? '生成中' : '发送'}
				</button>
			</form>
		</div>
	)
}
