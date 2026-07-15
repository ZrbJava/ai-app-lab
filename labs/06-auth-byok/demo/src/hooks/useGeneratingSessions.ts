'use client'

/**
 * 订阅「正在后台生成回复」的会话 ID 列表。
 *
 * 用于 AppShell 侧栏：在非当前会话旁显示「生成中…」。
 *
 * 使用 useSyncExternalStore 而非 useState + context，因为：
 * - 数据源在模块级 sessionChats.ts（跨组件共享）
 * - 不需要 Provider 包裹
 * - 与 React 18+ 外部 store 模式一致
 */

import { useSyncExternalStore } from 'react'

import {
	getGeneratingSessionIds,
	getServerGeneratingSessionIds,
	subscribeGeneratingSessions,
} from '@/lib/sessionChats'

export function useGeneratingSessions() {
	return useSyncExternalStore(
		subscribeGeneratingSessions,
		getGeneratingSessionIds,
		// SSR / hydration 期间使用稳定空数组，避免 hydration mismatch
		getServerGeneratingSessionIds,
	)
}
