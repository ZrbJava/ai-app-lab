import { createOpenAI } from '@ai-sdk/openai'
import type { LanguageModel } from 'ai'

import {
	getProviderPreset,
	type ProviderId,
	type ProviderPreset,
} from '@/lib/providers'

export type ModelConfig = {
	model: LanguageModel
	provider: ProviderPreset | 'env'
}

/** HTTP Header 只允许 Latin-1，中文占位符会导致 ByteString 报错 */
function isValidApiKey(key: string | undefined): key is string {
	if (!key?.trim()) return false
	for (let i = 0; i < key.length; i++) {
		if (key.charCodeAt(i) > 255) return false
	}
	return true
}

function resolveApiKey(preset: ProviderPreset): string | undefined {
	const candidates = [
		process.env[preset.apiKeyEnv],
		process.env.LLM_API_KEY,
		preset.defaultApiKey,
	]
	return candidates.find(isValidApiKey)
}

/**
 * Provider 工厂：根据 preset 或环境变量创建 model 实例。
 *
 * - 请求体带 `provider` → 用预设 + 对应 API Key 环境变量
 * - 无 `provider` → 读 LLM_BASE_URL / LLM_API_KEY / LLM_MODEL（改 .env 即可切换）
 */
export function createModel(providerId?: ProviderId): ModelConfig {
	if (!providerId && process.env.LLM_BASE_URL) {
		const apiKey = isValidApiKey(process.env.LLM_API_KEY)
			? process.env.LLM_API_KEY
			: undefined
		const llm = createOpenAI({
			baseURL: process.env.LLM_BASE_URL,
			apiKey,
		})
		return {
			model: llm.chat(process.env.LLM_MODEL ?? 'glm-4-flash'),
			provider: 'env',
		}
	}

	const id = providerId ?? (process.env.LLM_PROVIDER as ProviderId) ?? 'zhipu'
	const preset = getProviderPreset(id)
	const apiKey = resolveApiKey(preset)

	if (!apiKey && id !== 'ollama') {
		throw new Error(
			`Missing API key: set ${preset.apiKeyEnv} or LLM_API_KEY (ASCII only, no Chinese placeholders)`,
		)
	}

	const llm = createOpenAI({
		baseURL: preset.baseURL,
		apiKey: apiKey ?? 'ollama',
	})

	return {
		model: llm.chat(preset.defaultModel),
		provider: preset,
	}
}
