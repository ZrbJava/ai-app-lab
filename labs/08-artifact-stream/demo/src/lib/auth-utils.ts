import { auth } from '@/auth'
import { getUserById } from '@/lib/users'

export class AuthError extends Error {
	status: number

	constructor(message: string, status = 401) {
		super(message)
		this.status = status
	}
}

export async function requireUser() {
	const session = await auth()
	if (!session?.user?.id) {
		throw new AuthError('未登录')
	}

	// JWT 有效但 users 表无记录（常见于切换 Lab / 新 data 目录）→ 避免 FK 500
	const dbUser = getUserById(session.user.id)
	if (!dbUser) {
		throw new AuthError(
			'登录已失效，请退出后重新注册或登录（每个 Lab 使用独立 SQLite 数据库）',
		)
	}

	return { id: dbUser.id, email: dbUser.email }
}

export function authErrorResponse(error: unknown) {
	if (error instanceof AuthError) {
		return Response.json({ error: error.message }, { status: error.status })
	}
	return null
}
