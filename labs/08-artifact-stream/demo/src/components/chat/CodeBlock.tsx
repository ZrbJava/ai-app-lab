'use client'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useState } from 'react'

type CodeBlockProps = {
	language?: string
	children: string
}

export default function CodeBlock({ language, children }: CodeBlockProps) {
	const [copied, setCopied] = useState(false)
	const code = children.replace(/\n$/, '')

	const copy = async () => {
		await navigator.clipboard.writeText(code)
		setCopied(true)
		setTimeout(() => setCopied(false), 1500)
	}

	return (
		<div className='group relative my-3 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50'>
			<div className='flex items-center justify-between border-b border-neutral-200 bg-neutral-100/80 px-3 py-1.5'>
				<span className='text-[11px] font-medium uppercase tracking-wide text-neutral-500'>
					{language || 'text'}
				</span>
				<button
					type='button'
					onClick={copy}
					className='rounded px-2 py-0.5 text-[11px] text-neutral-600 transition hover:bg-white hover:text-neutral-900'
				>
					{copied ? '已复制' : '复制'}
				</button>
			</div>
			<SyntaxHighlighter
				language={language || 'text'}
				style={oneLight}
				customStyle={{
					margin: 0,
					padding: '12px 16px',
					background: 'transparent',
					fontSize: '13px',
					lineHeight: '1.6',
				}}
				PreTag='div'
			>
				{code}
			</SyntaxHighlighter>
		</div>
	)
}
