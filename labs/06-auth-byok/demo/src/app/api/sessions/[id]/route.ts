import { authErrorResponse, requireUser } from '@/lib/auth-utils'
import { deleteSession, getSession } from '@/lib/sessions'

type Params = { params: Promise<{ id: string }> }

export async function DELETE(_req: Request, { params }: Params) {
	try {
		const user = await requireUser()
		const { id } = await params
		const session = getSession(id, user.id)
		if (!session) {
			return Response.json({ error: '会话不存在' }, { status: 404 })
		}

		deleteSession(id, user.id)
		return Response.json({ ok: true })
	} catch (error) {
		return authErrorResponse(error) ?? Response.json({ error: '服务器错误' }, { status: 500 })
	}
}
