import type { UIMessage } from 'ai'

import { getDb } from '@/lib/db'
import type { ProviderId } from '@/lib/providers'

export type SessionRow = {
	id: string
	title: string
	provider: ProviderId
	created_at: string
	updated_at: string
}

export type MessageRow = {
	id: string
	session_id: string
	role: string
	parts: string
	created_at: string
}

function nowIso() {
	return new Date().toISOString()
}

function titleFromText(text: string) {
	const trimmed = text.trim().replace(/\s+/g, ' ')
	if (!trimmed) return '新对话'
	return trimmed.length > 40 ? `${trimmed.slice(0, 40)}…` : trimmed
}

function textFromParts(parts: UIMessage['parts']) {
	return parts
		.filter(part => part.type === 'text')
		.map(part => part.text)
		.join(' ')
}

export function listSessions(): SessionRow[] {
	return getDb()
		.prepare(
			`SELECT id, title, provider, created_at, updated_at
			 FROM sessions
			 ORDER BY updated_at DESC`,
		)
		.all() as SessionRow[]
}

export function getSession(id: string): SessionRow | undefined {
	return getDb()
		.prepare(
			`SELECT id, title, provider, created_at, updated_at
			 FROM sessions WHERE id = ?`,
		)
		.get(id) as SessionRow | undefined
}

export function createSession(input?: {
	title?: string
	provider?: ProviderId
}): SessionRow {
	const id = crypto.randomUUID()
	const createdAt = nowIso()
	const title = input?.title?.trim() || '新对话'
	const provider = input?.provider ?? 'zhipu'

	getDb()
		.prepare(
			`INSERT INTO sessions (id, title, provider, created_at, updated_at)
			 VALUES (?, ?, ?, ?, ?)`,
		)
		.run(id, title, provider, createdAt, createdAt)

	return {
		id,
		title,
		provider,
		created_at: createdAt,
		updated_at: createdAt,
	}
}

export function deleteSession(id: string) {
	getDb().prepare('DELETE FROM sessions WHERE id = ?').run(id)
}

export function touchSession(id: string, title?: string) {
	const updatedAt = nowIso()
	if (title) {
		getDb()
			.prepare('UPDATE sessions SET updated_at = ?, title = ? WHERE id = ?')
			.run(updatedAt, title, id)
		return
	}
	getDb()
		.prepare('UPDATE sessions SET updated_at = ? WHERE id = ?')
		.run(updatedAt, id)
}

export function listMessages(sessionId: string): UIMessage[] {
	const rows = getDb()
		.prepare(
			`SELECT id, role, parts
			 FROM messages
			 WHERE session_id = ?
			 ORDER BY created_at ASC`,
		)
		.all(sessionId) as Array<Pick<MessageRow, 'id' | 'role' | 'parts'>>

	return rows.map(row => ({
		id: row.id,
		role: row.role as UIMessage['role'],
		parts: JSON.parse(row.parts) as UIMessage['parts'],
	}))
}

export function messageExists(id: string) {
	const row = getDb()
		.prepare('SELECT 1 FROM messages WHERE id = ?')
		.get(id)
	return Boolean(row)
}

export function saveMessage(sessionId: string, message: UIMessage) {
	if (messageExists(message.id)) return

	const createdAt = nowIso()
	getDb()
		.prepare(
			`INSERT INTO messages (id, session_id, role, parts, created_at)
			 VALUES (?, ?, ?, ?, ?)`,
		)
		.run(
			message.id,
			sessionId,
			message.role,
			JSON.stringify(message.parts),
			createdAt,
		)
}

export function maybeUpdateSessionTitle(sessionId: string, message: UIMessage) {
	const session = getSession(sessionId)
	if (!session || session.title !== '新对话') return

	if (message.role !== 'user') return
	const text = textFromParts(message.parts)
	if (!text) return

	touchSession(sessionId, titleFromText(text))
}
