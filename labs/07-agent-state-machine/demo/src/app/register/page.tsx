'use client'

import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RegisterPage() {
	const router = useRouter()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	const submit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError('')

		const res = await fetch('/api/auth/register', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password }),
		})

		if (!res.ok) {
			const data = (await res.json()) as { error?: string }
			setError(data.error ?? '注册失败')
			setLoading(false)
			return
		}

		const signInResult = await signIn('credentials', {
			email,
			password,
			redirect: false,
		})

		setLoading(false)
		if (signInResult?.error) {
			setError('注册成功，但自动登录失败，请手动登录')
			return
		}

		router.push('/')
		router.refresh()
	}

	return (
		<div className='flex min-h-screen items-center justify-center bg-neutral-50 px-4'>
			<div className='w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm'>
				<h1 className='text-xl font-semibold text-neutral-900'>注册</h1>
				<p className='mt-1 text-sm text-neutral-500'>创建账号后即可配置自己的 API Key</p>

				<form onSubmit={submit} className='mt-6 space-y-4'>
					<div>
						<label className='mb-1 block text-sm text-neutral-600'>邮箱</label>
						<input
							type='email'
							value={email}
							onChange={e => setEmail(e.target.value)}
							className='w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400'
							required
						/>
					</div>
					<div>
						<label className='mb-1 block text-sm text-neutral-600'>密码（至少 6 位）</label>
						<input
							type='password'
							value={password}
							onChange={e => setPassword(e.target.value)}
							minLength={6}
							className='w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400'
							required
						/>
					</div>

					{error && (
						<p className='rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600'>{error}</p>
					)}

					<button
						type='submit'
						disabled={loading}
						className='w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50'
					>
						{loading ? '注册中…' : '注册'}
					</button>
				</form>

				<p className='mt-4 text-center text-sm text-neutral-500'>
					已有账号？{' '}
					<Link href='/login' className='text-emerald-700 hover:underline'>
						登录
					</Link>
				</p>
			</div>
		</div>
	)
}
