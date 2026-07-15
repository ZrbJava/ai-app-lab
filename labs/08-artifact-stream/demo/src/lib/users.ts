import bcrypt from 'bcryptjs'

import { getDb } from '@/lib/db'

export type UserRow = {
	id: string
	email: string
	password_hash: string
	created_at: string
}

export type PublicUser = {
	id: string
	email: string
	created_at: string
}

function nowIso() {
	return new Date().toISOString()
}

export function getUserByEmail(email: string): UserRow | undefined {
	return getDb()
		.prepare('SELECT id, email, password_hash, created_at FROM users WHERE email = ?')
		.get(email.trim().toLowerCase()) as UserRow | undefined
}

export function getUserById(id: string): PublicUser | undefined {
	return getDb()
		.prepare('SELECT id, email, created_at FROM users WHERE id = ?')
		.get(id) as PublicUser | undefined
}

export function createUser(email: string, password: string): PublicUser {
	const normalized = email.trim().toLowerCase()
	if (!normalized || password.length < 6) {
		throw new Error('邮箱无效或密码不足 6 位')
	}
	if (getUserByEmail(normalized)) {
		throw new Error('该邮箱已注册')
	}

	const id = crypto.randomUUID()
	const createdAt = nowIso()
	const passwordHash = bcrypt.hashSync(password, 10)

	getDb()
		.prepare(
			`INSERT INTO users (id, email, password_hash, created_at)
			 VALUES (?, ?, ?, ?)`,
		)
		.run(id, normalized, passwordHash, createdAt)

	return { id, email: normalized, created_at: createdAt }
}

export function verifyUser(
	email: string,
	password: string,
): PublicUser | null {
	const user = getUserByEmail(email)
	if (!user) return null
	if (!bcrypt.compareSync(password, user.password_hash)) return null
	return {
		id: user.id,
		email: user.email,
		created_at: user.created_at,
	}
}
