'use client'

/**
 * 聊天主面板
 *
 * 会话切换与流式持久化相关逻辑见：
 * - `lib/sessionChats.ts`：按会话隔离 Chat 实例
 * - 下方 `useChat({ chat })` 与 `useEffect` 历史加载策略
 */

import { useChat } from '@ai-sdk/react'
import { getToolName, isToolUIPart, type UIMessage } from 'ai'
import { useEffect, useMemo, useRef, useState } from 'react'

import { useMcpServers } from '@/hooks/useMcpServers'
import MarkdownContent from '@/components/chat/MarkdownContent'
import {
	getOrCreateSessionChat,
	getSessionChat,
	isSessionGenerating,
} from '@/lib/sessionChats'
import { PROVIDER_PRESETS, type ProviderId } from '@/lib/providers'

const SUGGESTIONS = [
	'北京天气怎么样',
	'计算 (12+8)*3',
	'vercel/ai 的 wiki 结构',
]

function renderPart(
	part: UIMessage['parts'][number],
	options?: { plainText?: boolean }
) {
	if (part.type === 'text') {
		if (!part.text) return null
		if (options?.plainText) {
			return (
				<div className='whitespace-pre-wrap text-[15px] leading-7 text-neutral-800'>
					{part.text}
				</div>
			)
		}
		return <MarkdownContent content={part.text} />
	}

	if (isToolUIPart(part)) {
		const name = getToolName(part)
		if (part.state === 'output-available') {
			return (
				<div className='mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-950'>
					<span className='font-medium'>工具 · {name}</span>
					<pre className='mt-1.5 overflow-x-auto whitespace-pre-wrap font-mono text-[11px] opacity-75'>
						{JSON.stringify(part.output, null, 2)}
					</pre>
				</div>
			)
		}
		if (part.state === 'output-error') {
			return (
				<div className='mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700'>
					{name} 失败：{part.errorText}
				</div>
			)
		}
		return (
			<div className='mt-3 flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800'>
				<span className='inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500' />
				正在调用 {name}
				{part.state === 'input-available' && part.input
					? ` · ${JSON.stringify(part.input)}`
					: '…'}
			</div>
		)
	}

	return null
}

function AssistantAvatar() {
	return (
		<div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-emerald-600 text-white'>
			<svg className='h-4 w-4' viewBox='0 0 24 24' fill='currentColor'>
				<path d='M12 2a7 7 0 00-5.6 11.2L4 22l8.8-2.3A7 7 0 1012 2zm0 2a5 5 0 110 10 5 5 0 010-10z' />
			</svg>
		</div>
	)
}

function MessageRow({
	message,
	isStreaming = false,
}: {
	message: UIMessage
	isStreaming?: boolean
}) {
	const isUser = message.role === 'user'
	// const textOptions = isStreaming ? { plainText: true } : undefined
	const textOptions = undefined

	if (isUser) {
		return (
			<div className='flex justify-end py-3'>
				<div className='max-w-[85%] rounded-2xl bg-neutral-100 px-4 py-2.5'>
					{message.parts.map((part, index) => (
						<div key={`${message.id}-${index}`}>
							{renderPart(part, textOptions)}
						</div>
					))}
				</div>
			</div>
		)
	}

	return (
		<div className='flex gap-4 py-4'>
			<AssistantAvatar />
			<div className='min-w-0 flex-1 pt-0.5'>
				{message.parts.map((part, index) => (
					<div key={`${message.id}-${index}`}>
						{renderPart(part, textOptions)}
					</div>
				))}
			</div>
		</div>
	)
}

type ChatPanelProps = {
	sessionId: string | null
	sessionTitle?: string | null
	/** 来自侧栏 sessions 列表，避免切换会话时重复请求 provider */
	sessionProvider?: ProviderId
	onSessionsChange?: () => void
}

/** 从 SQLite 加载指定会话的完整历史 */
async function fetchSessionMessages(sessionId: string) {
	const res = await fetch(`/api/sessions/${sessionId}/messages`)
	if (!res.ok) throw new Error('加载历史失败')
	return res.json() as Promise<{
		messages: UIMessage[]
		session: { provider: ProviderId; title: string }
	}>
}

const AGENT_MODE_KEY = 'lab07-agent-mode'

export default function ChatPanel({
	sessionId,
	sessionTitle,
	sessionProvider,
	onSessionsChange,
}: ChatPanelProps) {
	const [input, setInput] = useState('')
	const [provider, setProvider] = useState<ProviderId>(
		sessionProvider ?? 'zhipu'
	)
	const [historyLoading, setHistoryLoading] = useState(false)
	const [agentMode, setAgentMode] = useState(false)
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	/**
	 * 从 registry 取当前会话的 Chat 实例。
	 * useMemo 保证同一 sessionId 在 re-render 时返回同一引用。
	 */
	const sessionChat = useMemo(
		() => (sessionId ? getOrCreateSessionChat(sessionId) : null),
		[sessionId]
	)

	/**
	 * 绑定已有 Chat 实例，而非 `useChat({ id: sessionId })`。
	 *
	 * 区别：
	 * - `{ id }`：sessionId 变化 → 销毁旧 Chat → 流式中断
	 * - `{ chat }`：切换会话只换订阅对象，旧会话 Chat 在 registry 里继续跑
	 */
	const { messages, sendMessage, setMessages, status, error } = useChat(
		sessionChat ? { chat: sessionChat } : { id: 'draft' }
	)
	const { servers, enabledRuntime } = useMcpServers()

	const isLoading = status === 'streaming' || status === 'submitted'
	const enabledServers = servers.filter(s => s.enabled)

	useEffect(() => {
		if (sessionProvider) setProvider(sessionProvider)
	}, [sessionProvider])

	useEffect(() => {
		try {
			setAgentMode(localStorage.getItem(AGENT_MODE_KEY) === '1')
		} catch {
			// ignore
		}
	}, [])

	const toggleAgentMode = () => {
		setAgentMode(prev => {
			const next = !prev
			try {
				localStorage.setItem(AGENT_MODE_KEY, next ? '1' : '0')
			} catch {
				// ignore
			}
			return next
		})
	}

	/**
	 * 切换会话时加载历史消息（智能合并策略）。
	 *
	 * 三种情况：
	 * 1. 该会话正在流式生成 → 不 fetch，直接用 registry 里 Chat 的内存消息
	 * 2. 正常进入 → fetch 一次 DB 历史
	 * 3. 后台生成完毕但 DB 尚未同步 → 条件轮询（见 applyHistory 内）
	 *
	 * 合并规则：DB 条数 > 内存条数时才 setMessages，避免覆盖正在流式的内容。
	 */
	useEffect(() => {
		if (!sessionId) {
			setMessages([])
			return
		}

		const chat = getSessionChat(sessionId)
		const isGenerating =
			chat?.status === 'streaming' || chat?.status === 'submitted'

		// 情况 1：流式进行中，内存状态比 DB 更新，不要用 DB 覆盖
		if (isGenerating) {
			setHistoryLoading(false)
			return
		}

		let cancelled = false
		let pollTimer: ReturnType<typeof setInterval> | undefined
		let pollAttempts = 0
		setHistoryLoading(true)

		const applyHistory = (data: {
			messages: UIMessage[]
			session: { provider: ProviderId; title: string }
		}) => {
			if (cancelled) return
			const liveChat = getSessionChat(sessionId)
			const liveMessages = liveChat?.messages ?? []
			const liveCount = liveMessages.length
			const liveLast = liveMessages.at(-1)

			// 仅当 DB 比内存更完整时才覆盖（防止切回时抹掉流式状态）
			if (data.messages.length > liveCount || liveCount === 0) {
				setMessages(data.messages)
			}
			setProvider(data.session.provider)

			// 内存已有 assistant → 无需轮询
			if (liveLast?.role === 'assistant') return

			const lastDb = data.messages.at(-1)
			const liveGenerating =
				liveChat?.status === 'streaming' || liveChat?.status === 'submitted'

			/**
			 * 情况 3：条件轮询。
			 *
			 * 触发条件（同时满足）：
			 * - DB 最后一条是 user（assistant 还没落库）
			 * - 当前视图不在流式中
			 * - registry 标记该会话仍在后台生成（isSessionGenerating）
			 *
			 * 停止条件：
			 * - DB 出现 assistant / 内存出现 assistant / 生成结束 / 超过 20 次
			 */
			if (
				lastDb?.role === 'user' &&
				!liveGenerating &&
				isSessionGenerating(sessionId) &&
				!pollTimer
			) {
				pollTimer = setInterval(() => {
					if (cancelled || pollAttempts >= 20) {
						if (pollTimer) clearInterval(pollTimer)
						return
					}
					pollAttempts += 1

					const live = getSessionChat(sessionId)
					if (live?.messages.at(-1)?.role === 'assistant') {
						if (pollTimer) clearInterval(pollTimer)
						return
					}
					if (live?.status === 'streaming' || live?.status === 'submitted') {
						if (pollTimer) clearInterval(pollTimer)
						return
					}
					if (!isSessionGenerating(sessionId)) {
						if (pollTimer) clearInterval(pollTimer)
						return
					}

					void fetchSessionMessages(sessionId)
						.then(next => {
							applyHistory(next)
							if (next.messages.at(-1)?.role === 'assistant' && pollTimer) {
								clearInterval(pollTimer)
							}
						})
						.catch(() => undefined)
				}, 2000)
			}
		}

		// 情况 2：首次进入，拉一次 DB
		fetchSessionMessages(sessionId)
			.then(applyHistory)
			.catch(() => {
				if (!cancelled) setMessages([])
			})
			.finally(() => {
				if (!cancelled) setHistoryLoading(false)
			})

		return () => {
			cancelled = true
			if (pollTimer) clearInterval(pollTimer)
		}
	}, [sessionId, setMessages])

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages, isLoading])

	const submit = (text: string) => {
		const trimmed = text.trim()
		if (!trimmed || isLoading || !sessionId) return
		sendMessage(
			{ text: trimmed },
			{
				body: {
					sessionId,
					provider,
					mcpServers: enabledRuntime(),
					agentMode,
				},
			}
		)
		setInput('')
		if (textareaRef.current) textareaRef.current.style.height = 'auto'
		onSessionsChange?.()
	}

	return (
		<div className='flex h-full flex-col bg-white'>
			<div className='flex shrink-0 items-center justify-between border-b border-neutral-200 px-4 py-3 md:px-6'>
				<div className='min-w-0'>
					<h1 className='truncate text-sm font-medium text-neutral-900'>
						{sessionId ? (sessionTitle ?? '对话') : '选择或新建对话'}
					</h1>
					{enabledServers.length > 0 && (
						<p className='mt-0.5 truncate text-xs text-neutral-500'>
							MCP：{enabledServers.map(s => s.name).join('、')}
						</p>
					)}
					{agentMode && (
						<p className='mt-0.5 truncate text-xs text-violet-600'>
							Agent：analyze → plan → execute → answer
						</p>
					)}
				</div>
				<div className='flex shrink-0 items-center gap-2'>
					<button
						type='button'
						onClick={toggleAgentMode}
						disabled={!sessionId}
						className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
							agentMode
								? 'border-violet-300 bg-violet-50 text-violet-800'
								: 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
						}`}
					>
						{agentMode ? 'Agent 开' : 'Agent 关'}
					</button>
					<select
					value={provider}
					onChange={e => setProvider(e.target.value as ProviderId)}
					disabled={isLoading || !sessionId}
					className='rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-900 outline-none disabled:opacity-50'
				>
					{PROVIDER_PRESETS.map(p => (
						<option key={p.id} value={p.id}>
							{p.label}
						</option>
					))}
				</select>
				</div>
			</div>

			<div className='min-h-0 flex-1 overflow-y-auto'>
				<div className='chat-thread px-4 md:px-6'>
					{!sessionId && (
						<div className='flex min-h-[50vh] flex-col items-center justify-center py-16 text-center'>
							<div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100'>
								<svg
									className='h-6 w-6 text-neutral-400'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='1.5'
								>
									<path
										d='M8 10h8M8 14h5M12 3c5 0 9 3.6 9 8 0 2.2-1 4.2-2.6 5.6L21 21l-4.5-1.5'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
								</svg>
							</div>
							<p className='text-sm text-neutral-500'>
								从左侧新建对话，或选择已有会话
							</p>
						</div>
					)}

					{sessionId && historyLoading && (
						<div className='py-16 text-center text-sm text-neutral-500'>
							加载历史消息…
						</div>
					)}

					{sessionId && !historyLoading && messages.length === 0 && (
						<div className='flex min-h-[40vh] flex-col items-center justify-center py-12'>
							<h2 className='mb-2 text-2xl font-semibold text-neutral-900'>
								有什么可以帮你的？
							</h2>
							<p className='mb-8 text-sm text-neutral-500'>
								支持 Tool Calling 与 MCP 外部工具
							</p>
							<div className='flex flex-wrap justify-center gap-2'>
								{SUGGESTIONS.map(s => (
									<button
										key={s}
										type='button'
										onClick={() => submit(s)}
										className='rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-900'
									>
										{s}
									</button>
								))}
							</div>
						</div>
					)}

					{messages.map((message, index) => (
						<MessageRow
							key={message.id}
							message={message}
							isStreaming={
								isLoading &&
								index === messages.length - 1 &&
								message.role === 'assistant'
							}
						/>
					))}

					{isLoading && messages.at(-1)?.role !== 'assistant' && (
						<div className='flex gap-4 py-4'>
							<AssistantAvatar />
							<div className='flex items-center gap-1.5 pt-2'>
								<span className='h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.3s]' />
								<span className='h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.15s]' />
								<span className='h-2 w-2 animate-bounce rounded-full bg-neutral-400' />
							</div>
						</div>
					)}

					<div ref={messagesEndRef} className='h-4' />
				</div>
			</div>

			<div className='shrink-0 border-t border-neutral-200 bg-white px-4 py-4 md:px-6'>
				<div className='chat-thread'>
					{error && (
						<p
							className='mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600'
							role='alert'
						>
							{error.message}
						</p>
					)}

					<form
						onSubmit={e => {
							e.preventDefault()
							submit(input)
						}}
						className='relative flex items-end rounded-2xl border border-neutral-200 bg-white shadow-sm transition focus-within:border-neutral-300'
					>
						<textarea
							ref={textareaRef}
							rows={1}
							className='max-h-40 min-h-[52px] flex-1 resize-none bg-transparent px-4 py-3.5 text-[15px] outline-none placeholder:text-neutral-400 disabled:opacity-50'
							value={input}
							onChange={e => {
								setInput(e.target.value)
								e.target.style.height = 'auto'
								e.target.style.height = `${e.target.scrollHeight}px`
							}}
							onKeyDown={e => {
								if (e.key === 'Enter' && !e.shiftKey) {
									e.preventDefault()
									submit(input)
								}
							}}
							placeholder={sessionId ? '输入消息，Enter 发送' : '请先选择会话'}
							disabled={isLoading || !sessionId}
						/>
						<button
							type='submit'
							disabled={isLoading || !input.trim() || !sessionId}
							className='m-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white transition hover:opacity-80 disabled:bg-neutral-200 disabled:text-neutral-400'
							aria-label='发送'
						>
							<svg
								className='h-4 w-4'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
							>
								<path
									d='M12 19V5M5 12l7-7 7 7'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
							</svg>
						</button>
					</form>
					<p className='mt-2 text-center text-[11px] text-neutral-400'>
						AI 可能出错，请核实重要信息
					</p>
				</div>
			</div>
		</div>
	)
}
