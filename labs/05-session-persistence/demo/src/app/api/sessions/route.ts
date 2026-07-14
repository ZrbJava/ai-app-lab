import { z } from 'zod'

import { createSession, listSessions } from '@/lib/sessions'
import { PROVIDER_PRESETS, type ProviderId } from '@/lib/providers'

const providerIds = PROVIDER_PRESETS.map(p => p.id) as [ProviderId, ...ProviderId[]]

const createSchema = z.object({
	title: z.string().trim().max(80).optional(),
	provider: z.enum(providerIds).optional(),
})

export async function GET() {
	const sessions = listSessions()
	return Response.json({ sessions })
}

export async function POST(req: Request) {
	const body = await req.json().catch(() => ({}))
	const parsed = createSchema.safeParse(body)
	if (!parsed.success) {
		return Response.json({ error: '请求无效' }, { status: 400 })
	}

	const session = createSession(parsed.data)
	return Response.json({ session }, { status: 201 })
}
