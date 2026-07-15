import { z } from 'zod'

import { createUser } from '@/lib/users'

const schema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
})

export async function POST(req: Request) {
	const body = await req.json().catch(() => null)
	const parsed = schema.safeParse(body)
	if (!parsed.success) {
		return Response.json({ error: '邮箱或密码格式无效' }, { status: 400 })
	}

	try {
		const user = createUser(parsed.data.email, parsed.data.password)
		return Response.json({ user }, { status: 201 })
	} catch (error) {
		const message = error instanceof Error ? error.message : '注册失败'
		return Response.json({ error: message }, { status: 400 })
	}
}
