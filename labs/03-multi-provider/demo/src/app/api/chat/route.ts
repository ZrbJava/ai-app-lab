import {
	convertToModelMessages,
	createUIMessageStreamResponse,
	streamText,
	toUIMessageStream,
	type UIMessage,
} from 'ai'

import { createModel } from '@/lib/ai'
import type { ProviderId } from '@/lib/providers'

export const maxDuration = 30

export async function POST(req: Request) {
	const body = await req.json()
	const { messages, provider } = body as {
		messages: UIMessage[]
		provider?: ProviderId
	}

	const { model } = createModel(provider)

	const result = streamText({
		model,
		messages: await convertToModelMessages(messages),
	})

	return createUIMessageStreamResponse({
		stream: toUIMessageStream({ stream: result.stream }),
	})
}
