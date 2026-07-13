'use client'

import { useChat } from '@ai-sdk/react'
import { useState } from 'react'

export default function Chat() {
	const [input, setInput] = useState('')
	const { messages, sendMessage, status, error } = useChat()

	const isLoading = status === 'streaming' || status === 'submitted'

	return (
		<div className='flex flex-col h-screen max-w-2xl mx-auto p-4'>
			<ul className='flex-1 overflow-y-auto space-y-3 mb-4'>
				{messages.map(message => (
					<li
						key={message.id}
						className={`p-3 rounded-lg ${
							message.role === 'user' ? 'bg-blue-100 ml-8' : 'bg-gray-100 mr-8'
						}`}
					>
						<span className='text-xs text-gray-500'>{message.role}</span>
						<p className='whitespace-pre-wrap'>
							{message.parts
								.map(part => (part.type === 'text' ? part.text : ''))
								.join('')}
						</p>
					</li>
				))}
			</ul>

			{error && (
				<p className='mb-2 text-sm text-red-600' role='alert'>
					{error.message}
				</p>
			)}

			<form
				onSubmit={e => {
					e.preventDefault()
					const text = input.trim()
					if (!text || isLoading) return
					sendMessage({ text })
					setInput('')
				}}
				className='flex gap-2'
			>
				<input
					className='flex-1 border rounded-lg px-3 py-2 disabled:opacity-50'
					value={input}
					onChange={e => setInput(e.target.value)}
					placeholder='输入消息...'
					disabled={isLoading}
				/>
				<button
					type='submit'
					disabled={isLoading || !input.trim()}
					className='px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50'
				>
					{isLoading ? '生成中...' : '发送'}
				</button>
			</form>
		</div>
	)
}
