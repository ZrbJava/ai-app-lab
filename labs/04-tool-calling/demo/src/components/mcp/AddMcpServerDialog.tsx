'use client'

import { useState } from 'react'

import type { McpTransport } from '@/lib/mcp/types'

type FormState = {
	name: string
	url: string
	transport: McpTransport
	apiKey?: string
}

type AddMcpServerDialogProps = {
	open: boolean
	onClose: () => void
	onSave: (config: FormState & { enabled: boolean }) => void
	onSaveAndTest: (config: FormState & { enabled: boolean }) => void
}

const INITIAL: FormState = {
	name: '',
	url: '',
	transport: 'streamable-http',
}

export default function AddMcpServerDialog({
	open,
	onClose,
	onSave,
	onSaveAndTest,
}: AddMcpServerDialogProps) {
	const [form, setForm] = useState<FormState>(INITIAL)

	if (!open) return null

	const payload = {
		...form,
		name: form.name.trim() || 'Custom MCP',
		url: form.url.trim(),
		apiKey: form.apiKey?.trim() || undefined,
		enabled: true,
	}

	const resetClose = () => {
		setForm(INITIAL)
		onClose()
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm'>
			<div
				role='dialog'
				className='w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl'
			>
				<div className='border-b border-slate-100 px-6 py-4'>
					<h3 className='text-lg font-semibold text-slate-900'>
						添加 MCP Server
					</h3>
					<p className='mt-1 text-xs text-slate-500'>
						仅支持 HTTPS 远程连接（Web 产品标准，对标 LobeChat Streamable HTTP）
					</p>
				</div>

				<div className='space-y-4 px-6 py-5'>
					<label className='block'>
						<span className='text-xs font-medium text-slate-600'>名称</span>
						<input
							className='mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2'
							value={form.name}
							onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
							placeholder='例如：DeepWiki'
						/>
					</label>

					<label className='block'>
						<span className='text-xs font-medium text-slate-600'>MCP URL</span>
						<input
							className='mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm outline-none ring-slate-300 focus:ring-2'
							value={form.url}
							onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
							placeholder='https://mcp.example.com/mcp'
						/>
					</label>

					<label className='block'>
						<span className='text-xs font-medium text-slate-600'>传输协议</span>
						<select
							className='mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'
							value={form.transport}
							onChange={e =>
								setForm(f => ({
									...f,
									transport: e.target.value as McpTransport,
								}))
							}
						>
							<option value='streamable-http'>Streamable HTTP（推荐）</option>
							<option value='sse'>SSE</option>
						</select>
					</label>

					<label className='block'>
						<span className='text-xs font-medium text-slate-600'>
							API Key（可选）
						</span>
						<input
							type='password'
							className='mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2'
							value={form.apiKey ?? ''}
							onChange={e => setForm(f => ({ ...f, apiKey: e.target.value }))}
							placeholder='Bearer Token，留空则匿名访问'
						/>
					</label>
				</div>

				<div className='flex justify-end gap-2 border-t border-slate-100 px-6 py-4'>
					<button
						type='button'
						onClick={resetClose}
						className='rounded-xl px-4 py-2 text-sm text-slate-600 hover:bg-slate-100'
					>
						取消
					</button>
					<button
						type='button'
						onClick={() => {
							onSave(payload)
							setForm(INITIAL)
						}}
						disabled={!form.url.trim()}
						className='rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40'
					>
						保存
					</button>
					<button
						type='button'
						onClick={() => {
							onSaveAndTest(payload)
							setForm(INITIAL)
						}}
						disabled={!form.url.trim()}
						className='rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-40'
					>
						保存并测试
					</button>
				</div>
			</div>
		</div>
	)
}
