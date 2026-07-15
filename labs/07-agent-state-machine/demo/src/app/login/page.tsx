'use client'

import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

function LoginForm() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const callbackUrl = searchParams.get('callbackUrl') ?? '/'

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	const submit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError('')

		const result = await signIn('credentials', {
			email,
			password,
			redirect: false,
		})

		setLoading(false)
		if (result?.error) {
			setError('邮箱或密码错误')
			return
		}
		router.push(callbackUrl)
		router.refresh()
	}

	return (
		<div className='flex min-h-screen items-center justify-center bg-neutral-50 px-4'>
			<div className='w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm'>
				<h1 className='text-xl font-semibold text-neutral-900'>登录</h1>
				<p className='mt-1 text-sm text-neutral-500'>Lab 06 · Auth + BYOK</p>

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
						<label className='mb-1 block text-sm text-neutral-600'>密码</label>
						<input
							type='password'
							value={password}
							onChange={e => setPassword(e.target.value)}
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
						{loading ? '登录中…' : '登录'}
					</button>
				</form>

				<p className='mt-4 text-center text-sm text-neutral-500'>
					还没有账号？{' '}
					<Link href='/register' className='text-emerald-700 hover:underline'>
						注册
					</Link>
				</p>
			</div>
		</div>
	)
}

export default function LoginPage() {
	return (
		<Suspense fallback={<div className='flex min-h-screen items-center justify-center'>加载中…</div>}>
			<LoginForm />
		</Suspense>
	)
}
