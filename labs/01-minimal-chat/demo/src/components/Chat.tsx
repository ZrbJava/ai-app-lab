/*
 * @Description:
 * @Author: zhaorubo
 * @Email: zrbjava@gmail.com
 * @Date: 2026-07-09 19:16:44
 * @LastEditTime: 2026-07-13 20:11:00
 * @LastEditors: zhaorubo
 */
'use client'

import { useState } from 'react'
import type { Message } from '@/types/chat'

export default function Chat() {
	const [messages, setMessages] = useState<Message[]>([])
	const [input, setInput] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	async function handleSend(e: React.FormEvent) {
		e.preventDefault()
		const text = input.trim()
		if (!text || loading) return

		setError(null)

		const userMsg: Message = {
			id: crypto.randomUUID(),
			role: 'user',
			content: text,
		}
		const nextMessages = [...messages, userMsg]
		setMessages(nextMessages)
		setInput('')
		setLoading(true)

		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ messages: nextMessages }),
			})

			if (!res.ok) {
				throw new Error(`请求失败 (${res.status})`)
			}

			const assistantMsg: Message = await res.json()
			setMessages(prev => [...prev, assistantMsg])
		} catch (err) {
			setError(err instanceof Error ? err.message : '发送失败，请重试')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='flex flex-col h-screen max-w-2xl mx-auto p-4'>
			<ul className='flex-1 overflow-y-auto space-y-3 mb-4'>
				{messages.map(msg => (
					<li
						key={msg.id}
						className={`p-3 rounded-lg ${
							msg.role === 'user' ? 'bg-blue-100 ml-8' : 'bg-gray-100 mr-8'
						}`}
					>
						<span className='text-xs text-gray-500'>{msg.role}</span>
						<p>{msg.content}</p>
					</li>
				))}
			</ul>

			{error && (
				<p className='mb-2 text-sm text-red-600' role='alert'>
					{error}
				</p>
			)}

			<form onSubmit={handleSend} className='flex gap-2'>
				<input
					className='flex-1 border rounded-lg px-3 py-2 disabled:opacity-50'
					value={input}
					onChange={e => setInput(e.target.value)}
					placeholder='输入消息...'
					disabled={loading}
				/>
				<button
					type='submit'
					disabled={loading || !input.trim()}
					className='px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50'
				>
					{loading ? '发送中...' : '发送'}
				</button>
			</form>
		</div>
	)
}
