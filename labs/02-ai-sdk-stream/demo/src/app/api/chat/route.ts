import {
	convertToModelMessages,
	createUIMessageStreamResponse,
	streamText,
	toUIMessageStream,
} from 'ai'

import { defaultModel, llm } from '@/lib/ai'

export const maxDuration = 30

export async function POST(req: Request) {
	const { messages } = await req.json()

	const result = streamText({
		model: llm.chat(defaultModel),
		messages: await convertToModelMessages(messages),
	})

	return createUIMessageStreamResponse({
		stream: toUIMessageStream({ stream: result.stream }),
	})
}
