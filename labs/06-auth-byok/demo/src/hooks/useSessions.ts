'use client'

import { useCallback, useEffect, useState } from 'react'

import type { ProviderId } from '@/lib/providers'

export type SessionSummary = {
	id: string
	title: string
	provider: ProviderId
	created_at: string
	updated_at: string
}

export function useSessions() {
	const [sessions, setSessions] = useState<SessionSummary[]>([])
	const [loading, setLoading] = useState(true)

	const refresh = useCallback(async () => {
		const res = await fetch('/api/sessions')
		if (!res.ok) return
		const data = (await res.json()) as { sessions: SessionSummary[] }
		setSessions(data.sessions)
	}, [])

	useEffect(() => {
		refresh().finally(() => setLoading(false))
	}, [refresh])

	const createSession = useCallback(
		async (input?: { title?: string; provider?: ProviderId }) => {
			const res = await fetch('/api/sessions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(input ?? {}),
			})
			if (!res.ok) return null
			const data = (await res.json()) as { session: SessionSummary }
			await refresh()
			return data.session
		},
		[refresh],
	)

	const deleteSession = useCallback(
		async (id: string) => {
			const res = await fetch(`/api/sessions/${id}`, { method: 'DELETE' })
			if (!res.ok) return false
			await refresh()
			return true
		},
		[refresh],
	)

	return {
		sessions,
		loading,
		refresh,
		createSession,
		deleteSession,
	}
}
