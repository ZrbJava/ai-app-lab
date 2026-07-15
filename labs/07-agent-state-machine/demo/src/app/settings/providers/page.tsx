'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { PROVIDER_PRESETS, type ProviderId } from '@/lib/providers'

type UserProvider = {
	id: string
	provider: ProviderId
	label: string
	maskedKey: string
	baseURL: string
	model: string
}

export default function ProviderSettingsPage() {
	const [providers, setProviders] = useState<UserProvider[]>([])
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState('')

	const [provider, setProvider] = useState<ProviderId>('zhipu')
	const [apiKey, setApiKey] = useState('')
	const [baseURL, setBaseURL] = useState('')
	const [model, setModel] = useState('')

	const preset = PROVIDER_PRESETS.find(p => p.id === provider)!

	const refresh = async () => {
		const res = await fetch('/api/user-providers')
		if (!res.ok) return
		const data = (await res.json()) as { providers: UserProvider[] }
		setProviders(data.providers)
	}

	useEffect(() => {
		refresh().finally(() => setLoading(false))
	}, [])

	useEffect(() => {
		setBaseURL('')
		setModel('')
	}, [provider])

	const save = async (e: React.FormEvent) => {
		e.preventDefault()
		setSaving(true)
		setError('')

		const res = await fetch('/api/user-providers', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				provider,
				apiKey,
				baseURL: baseURL.trim() || undefined,
				model: model.trim() || undefined,
			}),
		})

		setSaving(false)
		if (!res.ok) {
			const data = (await res.json()) as { error?: string }
			setError(data.error ?? '保存失败')
			return
		}

		setApiKey('')
		await refresh()
	}

	const remove = async (providerId: ProviderId) => {
		const res = await fetch(`/api/user-providers?provider=${providerId}`, {
			method: 'DELETE',
		})
		if (res.ok) await refresh()
	}

	return (
		<div className='min-h-screen bg-neutral-50'>
			<header className='border-b border-neutral-200 bg-white px-6 py-4'>
				<div className='mx-auto flex max-w-3xl items-center justify-between'>
					<div>
						<h1 className='text-lg font-semibold text-neutral-900'>Provider 设置</h1>
						<p className='text-sm text-neutral-500'>BYOK：配置你自己的 API Key</p>
					</div>
					<Link
						href='/'
						className='rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50'
					>
						返回对话
					</Link>
				</div>
			</header>

			<main className='mx-auto max-w-3xl space-y-6 px-6 py-8'>
				<section className='rounded-2xl border border-neutral-200 bg-white p-6'>
					<h2 className='text-sm font-medium text-neutral-900'>已配置的 Provider</h2>
					{loading ? (
						<p className='mt-3 text-sm text-neutral-500'>加载中…</p>
					) : providers.length === 0 ? (
						<p className='mt-3 text-sm text-neutral-500'>
							尚未配置。请先在下方添加 API Key，或在 .env.local 设置全局 Key 作为开发 fallback。
						</p>
					) : (
						<ul className='mt-4 space-y-3'>
							{providers.map(item => (
								<li
									key={item.id}
									className='flex items-center justify-between rounded-lg border border-neutral-100 bg-neutral-50 px-4 py-3'
								>
									<div>
										<p className='text-sm font-medium text-neutral-900'>{item.label}</p>
										<p className='text-xs text-neutral-500'>
											Key: {item.maskedKey} · {item.model}
										</p>
									</div>
									<button
										type='button'
										onClick={() => remove(item.provider)}
										className='text-xs text-red-600 hover:underline'
									>
										删除
									</button>
								</li>
							))}
						</ul>
					)}
				</section>

				<section className='rounded-2xl border border-neutral-200 bg-white p-6'>
					<h2 className='text-sm font-medium text-neutral-900'>添加 / 更新 Provider</h2>
					<form onSubmit={save} className='mt-4 space-y-4'>
						<div>
							<label className='mb-1 block text-sm text-neutral-600'>Provider</label>
							<select
								value={provider}
								onChange={e => setProvider(e.target.value as ProviderId)}
								className='w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm'
							>
								{PROVIDER_PRESETS.map(p => (
									<option key={p.id} value={p.id}>
										{p.label}
									</option>
								))}
							</select>
						</div>
						<div>
							<label className='mb-1 block text-sm text-neutral-600'>API Key</label>
							<input
								type='password'
								value={apiKey}
								onChange={e => setApiKey(e.target.value)}
								placeholder={provider === 'ollama' ? 'ollama' : 'sk-...'}
								className='w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-mono'
								required={provider !== 'ollama'}
							/>
						</div>
						<div>
							<label className='mb-1 block text-sm text-neutral-600'>
								Base URL（可选，默认 {preset.baseURL}）
							</label>
							<input
								type='url'
								value={baseURL}
								onChange={e => setBaseURL(e.target.value)}
								placeholder={preset.baseURL}
								className='w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-mono'
							/>
						</div>
						<div>
							<label className='mb-1 block text-sm text-neutral-600'>
								模型（可选，默认 {preset.defaultModel}）
							</label>
							<input
								type='text'
								value={model}
								onChange={e => setModel(e.target.value)}
								placeholder={preset.defaultModel}
								className='w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-mono'
							/>
						</div>

						{error && (
							<p className='rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600'>{error}</p>
						)}

						<button
							type='submit'
							disabled={saving}
							className='rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50'
						>
							{saving ? '保存中…' : '保存'}
						</button>
					</form>
				</section>
			</main>
		</div>
	)
}
