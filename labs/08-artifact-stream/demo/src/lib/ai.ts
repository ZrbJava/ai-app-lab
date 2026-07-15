import { createOpenAI } from '@ai-sdk/openai'
import type { LanguageModel } from 'ai'

import {
	getProviderPreset,
	type ProviderId,
	type ProviderPreset,
} from '@/lib/providers'
import { getUserProviderConfig } from '@/lib/user-providers'

export type ModelConfig = {
	model: LanguageModel
	provider: ProviderPreset | 'env' | 'byok'
}

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

function createFromPreset(
	preset: ProviderPreset,
	apiKey: string | undefined,
	modelOverride?: string,
	baseURLOverride?: string,
): ModelConfig {
	const llm = createOpenAI({
		baseURL: baseURLOverride ?? preset.baseURL,
		apiKey: apiKey ?? 'ollama',
	})
	return {
		model: llm.chat(modelOverride ?? preset.defaultModel),
		provider: preset,
	}
}

/**
 * 优先读用户 BYOK 配置，其次环境变量（开发 fallback）。
 */
export function createModelForUser(
	userId: string,
	providerId?: ProviderId,
): ModelConfig {
	const id =
		providerId ?? (process.env.LLM_PROVIDER as ProviderId) ?? 'zhipu'

	const userConfig = getUserProviderConfig(userId, id)
	if (userConfig) {
		const preset = getProviderPreset(id)
		return {
			...createFromPreset(
				preset,
				userConfig.apiKey,
				userConfig.model,
				userConfig.baseURL,
			),
			provider: 'byok',
		}
	}

	return createModel(providerId)
}

/** 环境变量 fallback，无 userId 场景或开发用 */
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
			`未配置 ${preset.label} 的 API Key：请在设置页添加，或设置 ${preset.apiKeyEnv}`,
		)
	}

	return createFromPreset(preset, apiKey)
}
