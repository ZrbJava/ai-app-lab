'use client'

import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import CodeBlock from '@/components/chat/CodeBlock'

type MarkdownContentProps = {
	content: string
}

const components: Components = {
	h1: ({ children }) => (
		<h1 className='mb-3 mt-4 text-xl font-semibold text-neutral-900'>
			{children}
		</h1>
	),
	h2: ({ children }) => (
		<h2 className='mb-2 mt-4 text-lg font-semibold text-neutral-900'>
			{children}
		</h2>
	),
	h3: ({ children }) => (
		<h3 className='mb-2 mt-3 text-base font-semibold text-neutral-900'>
			{children}
		</h3>
	),
	p: ({ children }) => (
		<p className='mb-3 text-[15px] leading-7 text-neutral-800 last:mb-0'>
			{children}
		</p>
	),
	ul: ({ children }) => (
		<ul className='mb-3 list-disc space-y-1 pl-5 text-[15px] leading-7 text-neutral-800'>
			{children}
		</ul>
	),
	ol: ({ children }) => (
		<ol className='mb-3 list-decimal space-y-1 pl-5 text-[15px] leading-7 text-neutral-800'>
			{children}
		</ol>
	),
	li: ({ children }) => <li className='pl-1'>{children}</li>,
	a: ({ href, children }) => (
		<a
			href={href}
			target='_blank'
			rel='noreferrer'
			className='text-emerald-700 underline underline-offset-2 hover:text-emerald-900'
		>
			{children}
		</a>
	),
	blockquote: ({ children }) => (
		<blockquote className='my-3 border-l-4 border-neutral-300 pl-4 text-neutral-600'>
			{children}
		</blockquote>
	),
	table: ({ children }) => (
		<div className='my-3 overflow-x-auto'>
			<table className='min-w-full border-collapse text-sm'>{children}</table>
		</div>
	),
	th: ({ children }) => (
		<th className='border border-neutral-200 bg-neutral-50 px-3 py-2 text-left font-medium'>
			{children}
		</th>
	),
	td: ({ children }) => (
		<td className='border border-neutral-200 px-3 py-2'>{children}</td>
	),
	code: ({ className, children }) => {
		const match = /language-(\w+)/.exec(className ?? '')
		const code = String(children).replace(/\n$/, '')
		const isBlock = match || code.includes('\n')

		if (isBlock) {
			return <CodeBlock language={match?.[1]}>{code}</CodeBlock>
		}

		return (
			<code className='rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[13px] text-neutral-800'>
				{children}
			</code>
		)
	},
	pre: ({ children }) => <>{children}</>,
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
	return (
		<div className='markdown-content'>
			<ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
				{content}
			</ReactMarkdown>
		</div>
	)
}
