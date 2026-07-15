import { z } from 'zod'

import { authErrorResponse, requireUser } from '@/lib/auth-utils'
import { PROVIDER_PRESETS, type ProviderId } from '@/lib/providers'
import {
	deleteUserProvider,
	listUserProviders,
	upsertUserProvider,
} from '@/lib/user-providers'

const providerIds = PROVIDER_PRESETS.map(p => p.id) as [
	ProviderId,
	...ProviderId[],
]

const upsertSchema = z.object({
	provider: z.enum(providerIds),
	apiKey: z.string(),
	baseURL: z.string().url().optional(),
	model: z.string().trim().optional(),
})

export async function GET() {
	try {
		const user = await requireUser()
		const providers = listUserProviders(user.id)
		return Response.json({ providers })
	} catch (error) {
		return authErrorResponse(error) ?? Response.json({ error: '服务器错误' }, { status: 500 })
	}
}

export async function POST(req: Request) {
	try {
		const user = await requireUser()
		const body = await req.json().catch(() => null)
		const parsed = upsertSchema.safeParse(body)
		if (!parsed.success) {
			return Response.json({ error: '请求无效' }, { status: 400 })
		}

		const provider = upsertUserProvider(user.id, parsed.data)
		return Response.json({ provider }, { status: 201 })
	} catch (error) {
		const authRes = authErrorResponse(error)
		if (authRes) return authRes
		const message = error instanceof Error ? error.message : '保存失败'
		return Response.json({ error: message }, { status: 400 })
	}
}

export async function DELETE(req: Request) {
	try {
		const user = await requireUser()
		const { searchParams } = new URL(req.url)
		const provider = searchParams.get('provider')
		if (!provider || !providerIds.includes(provider as ProviderId)) {
			return Response.json({ error: 'Provider 无效' }, { status: 400 })
		}
		deleteUserProvider(user.id, provider as ProviderId)
		return Response.json({ ok: true })
	} catch (error) {
		return authErrorResponse(error) ?? Response.json({ error: '服务器错误' }, { status: 500 })
	}
}
