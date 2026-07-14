export type ProviderId = 'zhipu' | 'qwen' | 'ollama' | 'groq'

export type ProviderPreset = {
	id: ProviderId
	label: string
	baseURL: string
	defaultModel: string
	apiKeyEnv: string
	defaultApiKey?: string
}

export const PROVIDER_PRESETS: ProviderPreset[] = [
	{
		id: 'zhipu',
		label: '智谱 GLM',
		baseURL: 'https://open.bigmodel.cn/api/paas/v4',
		defaultModel: 'glm-4-flash',
		apiKeyEnv: 'ZHIPU_API_KEY',
	},
	{
		id: 'qwen',
		label: '通义千问',
		baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
		defaultModel: 'qwen-plus',
		apiKeyEnv: 'DASHSCOPE_API_KEY',
	},
	{
		id: 'ollama',
		label: 'Ollama 本地',
		baseURL: 'http://localhost:11434/v1',
		defaultModel: 'qwen2.5:7b',
		apiKeyEnv: 'OLLAMA_API_KEY',
		defaultApiKey: 'ollama',
	},
	{
		id: 'groq',
		label: 'Groq 云',
		baseURL: 'https://api.groq.com/openai/v1',
		defaultModel: 'llama-3.1-8b-instant',
		apiKeyEnv: 'GROQ_API_KEY',
	},
]

export function getProviderPreset(id: ProviderId): ProviderPreset {
	const preset = PROVIDER_PRESETS.find(p => p.id === id)
	if (!preset) {
		throw new Error(`Unknown provider: ${id}`)
	}
	return preset
}
