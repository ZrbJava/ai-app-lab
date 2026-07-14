'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import ChatPanel from '@/components/chat/ChatPanel'
import McpSettings from '@/components/mcp/McpSettings'
import AppShell from '@/components/shell/AppShell'
import { useSessions } from '@/hooks/useSessions'

function WorkbenchContent() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { sessions, loading, refresh, createSession, deleteSession } =
		useSessions()

	const sessionId = searchParams.get('session')
	const openAddDialog = searchParams.get('dialog') === 'add'
	const view: 'chat' | 'mcp' =
		searchParams.get('view') === 'mcp' ? 'mcp' : 'chat'

	useEffect(() => {
		if (loading || view !== 'chat') return
		if (sessionId) return
		if (sessions.length === 0) return
		const params = new URLSearchParams(searchParams.toString())
		params.set('session', sessions[0].id)
		router.replace(`/?${params.toString()}`)
	}, [loading, view, sessionId, sessions, searchParams, router])

	const navigate = useCallback(
		(next: {
			view?: 'chat' | 'mcp'
			session?: string | null
			dialog?: string | null
		}) => {
			const params = new URLSearchParams(searchParams.toString())
			if (next.view) {
				if (next.view === 'chat') params.delete('view')
				else params.set('view', next.view)
			}
			if ('session' in next) {
				if (next.session) params.set('session', next.session)
				else params.delete('session')
			}
			if ('dialog' in next) {
				if (next.dialog) params.set('dialog', next.dialog)
				else params.delete('dialog')
			}
			router.push(`/?${params.toString()}`)
		},
		[router, searchParams]
	)

	const handleNewSession = async () => {
		const session = await createSession()
		if (!session) return
		navigate({ view: 'chat', session: session.id, dialog: null })
	}

	const handleDeleteSession = async (id: string) => {
		const ok = await deleteSession(id)
		if (!ok) return
		if (sessionId === id) {
			const remaining = sessions.filter(s => s.id !== id)
			navigate({
				view: 'chat',
				session: remaining[0]?.id ?? null,
				dialog: null,
			})
		}
	}

	return (
		<AppShell
			view={view}
			onViewChange={nextView => navigate({ view: nextView, dialog: null })}
			sessions={sessions}
			activeSessionId={sessionId}
			sessionsLoading={loading}
			onNewSession={handleNewSession}
			onSelectSession={id =>
				navigate({ view: 'chat', session: id, dialog: null })
			}
			onDeleteSession={handleDeleteSession}
		>
			{view === 'chat' ? (
				<ChatPanel
					sessionId={sessionId}
					sessionTitle={sessions.find(s => s.id === sessionId)?.title}
					onSessionsChange={refresh}
				/>
			) : (
				<McpSettings initialDialogOpen={openAddDialog} />
			)}
		</AppShell>
	)
}

export default function WorkbenchPage() {
	return (
		<Suspense
			fallback={
				<div className='flex h-screen items-center justify-center text-sm text-[var(--text-muted)]'>
					加载中…
				</div>
			}
		>
			<WorkbenchContent />
		</Suspense>
	)
}
