import { decrypt, encrypt, maskApiKey } from '@/lib/crypto'
import { getDb } from '@/lib/db'
import { getProviderPreset, type ProviderId } from '@/lib/providers'

export type UserProviderRow = {
	id: string
	user_id: string
	provider: ProviderId
	api_key_encrypted: string
	base_url: string | null
	model: string | null
	created_at: string
}

export type UserProviderPublic = {
	id: string
	provider: ProviderId
	label: string
	maskedKey: string
	baseURL: string
	model: string
	created_at: string
}

export type UserProviderConfig = {
	provider: ProviderId
	apiKey: string
	baseURL: string
	model: string
}

function nowIso() {
	return new Date().toISOString()
}

function toPublic(row: UserProviderRow): UserProviderPublic {
	const preset = getProviderPreset(row.provider)
	return {
		id: row.id,
		provider: row.provider,
		label: preset.label,
		maskedKey: maskApiKey(decrypt(row.api_key_encrypted)),
		baseURL: row.base_url ?? preset.baseURL,
		model: row.model ?? preset.defaultModel,
		created_at: row.created_at,
	}
}

export function listUserProviders(userId: string): UserProviderPublic[] {
	const rows = getDb()
		.prepare(
			`SELECT id, user_id, provider, api_key_encrypted, base_url, model, created_at
			 FROM user_providers
			 WHERE user_id = ?
			 ORDER BY created_at ASC`,
		)
		.all(userId) as UserProviderRow[]

	return rows.map(toPublic)
}

export function getUserProviderConfig(
	userId: string,
	providerId: ProviderId,
): UserProviderConfig | null {
	const row = getDb()
		.prepare(
			`SELECT id, user_id, provider, api_key_encrypted, base_url, model, created_at
			 FROM user_providers
			 WHERE user_id = ? AND provider = ?`,
		)
		.get(userId, providerId) as UserProviderRow | undefined

	if (!row) return null

	const preset = getProviderPreset(row.provider)
	return {
		provider: row.provider,
		apiKey: decrypt(row.api_key_encrypted),
		baseURL: row.base_url ?? preset.baseURL,
		model: row.model ?? preset.defaultModel,
	}
}

export function upsertUserProvider(
	userId: string,
	input: {
		provider: ProviderId
		apiKey: string
		baseURL?: string
		model?: string
	},
): UserProviderPublic {
	const preset = getProviderPreset(input.provider)
	const apiKey = input.apiKey.trim()
	if (!apiKey && input.provider !== 'ollama') {
		throw new Error('API Key 不能为空')
	}

	const encrypted = encrypt(apiKey || 'ollama')
	const baseUrl = input.baseURL?.trim() || null
	const model = input.model?.trim() || null
	const createdAt = nowIso()

	const existing = getDb()
		.prepare('SELECT id FROM user_providers WHERE user_id = ? AND provider = ?')
		.get(userId, input.provider) as { id: string } | undefined

	if (existing) {
		getDb()
			.prepare(
				`UPDATE user_providers
				 SET api_key_encrypted = ?, base_url = ?, model = ?
				 WHERE id = ? AND user_id = ?`,
			)
			.run(encrypted, baseUrl, model, existing.id, userId)

		const row = getDb()
			.prepare(
				`SELECT id, user_id, provider, api_key_encrypted, base_url, model, created_at
				 FROM user_providers WHERE id = ?`,
			)
			.get(existing.id) as UserProviderRow
		return toPublic(row)
	}

	const id = crypto.randomUUID()
	getDb()
		.prepare(
			`INSERT INTO user_providers
			 (id, user_id, provider, api_key_encrypted, base_url, model, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`,
		)
		.run(
			id,
			userId,
			input.provider,
			encrypted,
			baseUrl,
			model,
			createdAt,
		)

	const row = getDb()
		.prepare(
			`SELECT id, user_id, provider, api_key_encrypted, base_url, model, created_at
			 FROM user_providers WHERE id = ?`,
		)
		.get(id) as UserProviderRow
	return toPublic(row)
}

export function deleteUserProvider(userId: string, providerId: ProviderId) {
	getDb()
		.prepare('DELETE FROM user_providers WHERE user_id = ? AND provider = ?')
		.run(userId, providerId)
}
