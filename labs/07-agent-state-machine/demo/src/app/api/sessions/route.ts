import { z } from 'zod'

import { authErrorResponse, requireUser } from '@/lib/auth-utils'
import { createSession, listSessions } from '@/lib/sessions'
import { PROVIDER_PRESETS, type ProviderId } from '@/lib/providers'

const providerIds = PROVIDER_PRESETS.map(p => p.id) as [
	ProviderId,
	...ProviderId[],
]

const createSchema = z.object({
	title: z.string().trim().max(80).optional(),
	provider: z.enum(providerIds).optional(),
})

export async function GET() {
	try {
		const user = await requireUser()
		const sessions = listSessions(user.id)
		return Response.json({ sessions })
	} catch (error) {
		const authRes = authErrorResponse(error)
		if (authRes) return authRes
		console.error('[GET /api/sessions]', error)
		const message = error instanceof Error ? error.message : '服务器错误'
		return Response.json({ error: message }, { status: 500 })
	}
}

export async function POST(req: Request) {
	try {
		const user = await requireUser()
		const body = await req.json().catch(() => ({}))
		const parsed = createSchema.safeParse(body)
		if (!parsed.success) {
			return Response.json({ error: '请求无效' }, { status: 400 })
		}

		const session = createSession(user.id, parsed.data)
		return Response.json({ session }, { status: 201 })
	} catch (error) {
		const authRes = authErrorResponse(error)
		if (authRes) return authRes
		console.error('[POST /api/sessions]', error)
		const message = error instanceof Error ? error.message : '服务器错误'
		return Response.json({ error: message }, { status: 500 })
	}
}
