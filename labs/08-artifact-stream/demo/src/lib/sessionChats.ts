'use client'

/**
 * 按会话隔离的 Chat 实例注册表
 *
 * ## 要解决的问题
 *
 * 默认 `useChat({ id: sessionId })` 在切换会话时会销毁旧 Chat、新建新 Chat，
 * 导致：
 * 1. 正在流式生成的请求被遗弃，assistant 消息无法完整落库
 * 2. 切回原会话时看不到刚才的流式状态
 *
 * ## 设计思路（对标 ChatGPT / LibreChat 的简化版）
 *
 * - **切换会话 ≠ 停止生成**：每个 sessionId 对应一个常驻 `Chat` 实例
 * - **服务端 + 客户端双写**：流结束后客户端 `onFinish` 与服务端 `onEnd` 都会 upsert
 * - **侧栏生成状态**：通过 `generatingSessions` 告知用户哪个会话还在后台回复
 *
 * ## 与 Vue 心智模型对比
 *
 * Vue 里 `route.query.session` 变了只换视图，不会销毁正在跑的 `fetch`。
 * 这里用模块级 `Map` 达到类似效果：Chat 实例活在 registry 里，不随 React re-render 销毁。
 */

import { Chat } from '@ai-sdk/react'
import type { ChatStatus } from 'ai'

import type { LabUIMessage } from '@/lib/chat-types'

/** 每个 sessionId → 一个 AI SDK Chat 实例（切换会话时不销毁） */
const chatRegistry = new Map<string, Chat<LabUIMessage>>()

/** 当前正在生成回复的 sessionId 集合，供侧栏显示「生成中…」 */
const generatingSessions = new Set<string>()

/** useSyncExternalStore 的订阅者列表 */
const listeners = new Set<() => void>()

/** 流结束后刷新侧栏会话列表（更新 updated_at 排序） */
let refreshSessions: (() => void) | undefined

/**
 * useSyncExternalStore 要求 getSnapshot 在数据未变时返回**同一引用**。
 * 若每次 `Array.from(set)` 都会触发无限 re-render，因此缓存快照。
 */
const EMPTY_SNAPSHOT: string[] = []
let cachedSnapshot: string[] = EMPTY_SNAPSHOT

function rebuildSnapshot() {
	if (generatingSessions.size === 0) {
		cachedSnapshot = EMPTY_SNAPSHOT
		return
	}
	cachedSnapshot = Array.from(generatingSessions).sort()
}

function notify() {
	rebuildSnapshot()
	listeners.forEach(listener => listener())
}

/**
 * 根据 Chat.status 同步 generatingSessions。
 * 仅在「是否在生成」状态真正变化时才 notify，避免无意义渲染。
 */
function syncGenerating(sessionId: string, status: ChatStatus) {
	const shouldGenerate = status === 'streaming' || status === 'submitted'
	const had = generatingSessions.has(sessionId)

	if (shouldGenerate) generatingSessions.add(sessionId)
	else generatingSessions.delete(sessionId)

	if (had === generatingSessions.has(sessionId)) return
	notify()
}

/** 注册侧栏刷新回调，在 onFinish 后更新会话列表 */
export function registerSessionsRefresh(fn: () => void) {
	refreshSessions = fn
}

export function getSessionChat(sessionId: string): Chat<LabUIMessage> | undefined {
	return chatRegistry.get(sessionId)
}

/**
 * 客户端持久化 assistant 消息（onFinish 兜底）。
 *
 * 为什么不能只依赖服务端 onEnd？
 * - 用户刷新页面时 HTTP 连接断开，服务端 onEnd 可能不执行
 * - 多步 tool calling 场景下，客户端 onFinish 更可靠
 *
 * sessionId 绑定在 Chat 实例创建时，不会随 UI 切换而错乱。
 */
async function persistAssistantMessage(
	sessionId: string,
	message: LabUIMessage,
) {
	if (message.role !== 'assistant' || !message.parts?.length) return

	await fetch(`/api/sessions/${sessionId}/messages`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ message }),
	}).catch(() => undefined)
}

/**
 * 获取或创建指定会话的 Chat 实例。
 *
 * 关键：ChatPanel 使用 `useChat({ chat })` 而非 `useChat({ id })`，
 * 这样切换 sessionId 时不会重建 Chat，后台流式请求继续运行。
 */
export function getOrCreateSessionChat(sessionId: string): Chat<LabUIMessage> {
	const existing = chatRegistry.get(sessionId)
	if (existing) return existing

	const chat = new Chat<LabUIMessage>({
		id: sessionId,
		onFinish: ({ message, isError }) => {
			syncGenerating(sessionId, chat.status)
			// 流正常结束 → 客户端写入 SQLite（与服务端 onEnd 形成双保险）
			if (!isError) {
				void persistAssistantMessage(sessionId, message)
			}
			refreshSessions?.()
		},
	})

	// 监听 status 变化，驱动侧栏「生成中」指示（即使当前不在该会话页面）
	chat['~registerStatusCallback'](() => {
		syncGenerating(sessionId, chat.status)
	})

	chatRegistry.set(sessionId, chat)
	return chat
}

/**
 * 删除会话时清理 registry。
 * 若该会话仍在生成，先 stop() 再移除，避免孤儿请求。
 */
export function removeSessionChat(sessionId: string) {
	const chat = chatRegistry.get(sessionId)
	if (chat && (chat.status === 'streaming' || chat.status === 'submitted')) {
		void chat.stop()
	}
	chatRegistry.delete(sessionId)
	generatingSessions.delete(sessionId)
	notify()
}

export function isSessionGenerating(sessionId: string) {
	const chat = chatRegistry.get(sessionId)
	if (chat) {
		return chat.status === 'streaming' || chat.status === 'submitted'
	}
	return generatingSessions.has(sessionId)
}

export function subscribeGeneratingSessions(onStoreChange: () => void) {
	listeners.add(onStoreChange)
	return () => {
		listeners.delete(onStoreChange)
	}
}

/** 客户端快照：必须返回稳定引用，见 cachedSnapshot */
export function getGeneratingSessionIds(): string[] {
	return cachedSnapshot
}

/** SSR 快照：服务端无 generating 状态，返回常量空数组 */
export function getServerGeneratingSessionIds(): string[] {
	return EMPTY_SNAPSHOT
}
