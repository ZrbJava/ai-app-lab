import { deleteSession, getSession } from '@/lib/sessions'

type Params = { params: Promise<{ id: string }> }

export async function DELETE(_req: Request, { params }: Params) {
	const { id } = await params
	const session = getSession(id)
	if (!session) {
		return Response.json({ error: '会话不存在' }, { status: 404 })
	}

	deleteSession(id)
	return Response.json({ ok: true })
}
