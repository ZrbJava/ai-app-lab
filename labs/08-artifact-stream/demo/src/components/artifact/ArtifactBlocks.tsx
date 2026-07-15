'use client'

import MarkdownContent from '@/components/chat/MarkdownContent'
import type { ArtifactData } from '@/lib/artifact/types'

const KIND_STYLES: Record<
	ArtifactData['kind'],
	{ border: string; bg: string; badge: string; label: string }
> = {
	reasoning: {
		border: 'border-violet-200',
		bg: 'bg-violet-50/80',
		badge: 'bg-violet-100 text-violet-800',
		label: '分析',
	},
	thinking: {
		border: 'border-sky-200',
		bg: 'bg-sky-50/80',
		badge: 'bg-sky-100 text-sky-800',
		label: '规划',
	},
	task: {
		border: 'border-amber-200',
		bg: 'bg-amber-50/80',
		badge: 'bg-amber-100 text-amber-800',
		label: '执行',
	},
	final_answer: {
		border: 'border-emerald-200',
		bg: 'bg-emerald-50/80',
		badge: 'bg-emerald-100 text-emerald-800',
		label: '回答',
	},
}

function StatusDot({ status }: { status: ArtifactData['status'] }) {
	if (status === 'running') {
		return (
			<span className='inline-block h-2 w-2 animate-pulse rounded-full bg-current opacity-70' />
		)
	}
	if (status === 'error') {
		return <span className='text-red-500'>✕</span>
	}
	return <span className='text-emerald-600'>✓</span>
}

export function ReasoningArtifact({ data }: { data: ArtifactData }) {
	return <ArtifactShell data={data} />
}

export function ThinkingArtifact({ data }: { data: ArtifactData }) {
	return <ArtifactShell data={data} />
}

export function TaskArtifact({ data }: { data: ArtifactData }) {
	return <ArtifactShell data={data} />
}

export function FinalAnswerArtifact({ data }: { data: ArtifactData }) {
	return <ArtifactShell data={data} compact />
}

function ArtifactShell({
	data,
	compact = false,
}: {
	data: ArtifactData
	compact?: boolean
}) {
	const style = KIND_STYLES[data.kind]

	return (
		<div
			className={`mt-3 rounded-xl border ${style.border} ${style.bg} px-3.5 py-3`}
		>
			<div className='flex items-center gap-2 text-xs font-medium text-neutral-700'>
				<span
					className={`rounded-md px-2 py-0.5 ${style.badge}`}
				>
					{data.title || style.label}
				</span>
				<StatusDot status={data.status} />
				{data.stepIndex && data.stepTotal ? (
					<span className='text-neutral-500'>
						{data.stepIndex}/{data.stepTotal}
					</span>
				) : null}
				{data.status === 'running' ? (
					<span className='text-neutral-500'>进行中…</span>
				) : null}
			</div>

			{data.error ? (
				<p className='mt-2 text-sm text-red-700'>{data.error}</p>
			) : null}

			{data.content ? (
				<div
					className={`mt-2 text-sm leading-6 text-neutral-800 ${
						compact ? '' : 'whitespace-pre-wrap'
					}`}
				>
					{compact ? (
						<p className='text-neutral-600'>见下方流式回答</p>
					) : (
						<MarkdownContent content={data.content} />
					)}
				</div>
			) : data.status === 'running' ? (
				<div className='mt-2 flex items-center gap-1.5 text-xs text-neutral-500'>
					<span className='h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.2s]' />
					<span className='h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.1s]' />
					<span className='h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400' />
				</div>
			) : null}
		</div>
	)
}

export function ArtifactRenderer({ data }: { data: ArtifactData }) {
	switch (data.kind) {
		case 'reasoning':
			return <ReasoningArtifact data={data} />
		case 'thinking':
			return <ThinkingArtifact data={data} />
		case 'task':
			return <TaskArtifact data={data} />
		case 'final_answer':
			return <FinalAnswerArtifact data={data} />
		default:
			return null
	}
}
