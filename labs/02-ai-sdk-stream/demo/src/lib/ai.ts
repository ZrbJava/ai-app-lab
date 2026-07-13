import { createOpenAI } from '@ai-sdk/openai'

// 智谱 OpenAI 兼容接口：https://open.bigmodel.cn/api/paas/v4
export const llm = createOpenAI({
	baseURL: process.env.LLM_BASE_URL ?? 'https://open.bigmodel.cn/api/paas/v4',
	apiKey: process.env.LLM_API_KEY,
})

export const defaultModel = process.env.LLM_MODEL ?? 'glm-4-flash'
