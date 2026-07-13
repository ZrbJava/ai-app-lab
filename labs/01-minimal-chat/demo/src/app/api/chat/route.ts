/**
 * @Description:
 * @Author: zhaorubo
 * @Email: zrbjava@gmail.com
 * @Date: 2026-07-09 19:07:12
 * @LastEditTime: 2026-07-13 20:11:00
 * @LastEditors: zhaorubo
 */

import { NextRequest, NextResponse } from 'next/server'

import type { Message } from '@/types/chat'

export async function POST(req: NextRequest) {
	const body = await req.json()
	const messages: Message[] = body.messages ?? []

	const lastUser = [...messages].reverse().find(m => m.role === 'user')
	const userText = lastUser?.content ?? ''

	const reply: Message = {
		id: crypto.randomUUID(),
		role: 'assistant',
		content: `echo: ${userText}`,
	}

	return NextResponse.json(reply)
}
