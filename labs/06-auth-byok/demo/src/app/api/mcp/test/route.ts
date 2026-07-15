import { flattenError, z } from 'zod'

import { testMcpServer } from '@/lib/mcp/connection-manager'

const runtimeSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	transport: z.enum(['streamable-http', 'sse']),
	url: z.string().url(),
	apiKey: z.string().optional(),
})

export async function POST(req: Request) {
	const body = await req.json()
	const parsed = runtimeSchema.safeParse(body)
	if (!parsed.success) {
		return Response.json(
			{ ok: false, error: '参数无效', details: flattenError(parsed.error) },
			{ status: 400 },
		)
	}

	try {
		const result = await testMcpServer(parsed.data)
		return Response.json({ ok: true, ...result })
	} catch (err) {
		const message = err instanceof Error ? err.message : '连接失败'
		return Response.json({ ok: false, error: message }, { status: 502 })
	}
}
