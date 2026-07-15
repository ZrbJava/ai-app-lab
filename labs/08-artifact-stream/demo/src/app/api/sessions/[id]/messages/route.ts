import type { UIMessage } from 'ai'
import { z } from 'zod'

import { authErrorResponse, requireUser } from '@/lib/auth-utils'
import {
	getSession,
	listMessages,
	maybeUpdateSessionTitle,
	touchSession,
	upsertMessage,
} from '@/lib/sessions'

type Params = { params: Promise<{ id: string }> }

const messageSchema = z.object({
	id: z.string().min(1),
	role: z.enum(['user', 'assistant', 'system']),
	parts: z.array(z.unknown()),
})

export async function GET(_req: Request, { params }: Params) {
	try {
		const user = await requireUser()
		const { id } = await params
		const session = getSession(id, user.id)
		if (!session) {
			return Response.json({ error: '会话不存在' }, { status: 404 })
		}

		const messages = listMessages(id)
		return Response.json({ messages, session })
	} catch (error) {
		return authErrorResponse(error) ?? Response.json({ error: '服务器错误' }, { status: 500 })
	}
}

export async function POST(req: Request, { params }: Params) {
	try {
		const user = await requireUser()
		const { id } = await params
		const session = getSession(id, user.id)
		if (!session) {
			return Response.json({ error: '会话不存在' }, { status: 404 })
		}

		const body = await req.json().catch(() => null)
		const parsed = z.object({ message: messageSchema }).safeParse(body)
		if (!parsed.success) {
			return Response.json({ error: '消息无效' }, { status: 400 })
		}

		const message = parsed.data.message as UIMessage
		upsertMessage(id, message)
		if (message.role === 'user') {
			maybeUpdateSessionTitle(id, message)
		}
		touchSession(id)

		return Response.json({ ok: true })
	} catch (error) {
		return authErrorResponse(error) ?? Response.json({ error: '服务器错误' }, { status: 500 })
	}
}
