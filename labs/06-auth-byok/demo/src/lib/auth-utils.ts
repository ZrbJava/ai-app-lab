import { auth } from '@/auth'

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
	return session.user
}

export function authErrorResponse(error: unknown) {
	if (error instanceof AuthError) {
		return Response.json({ error: error.message }, { status: error.status })
	}
	return null
}
