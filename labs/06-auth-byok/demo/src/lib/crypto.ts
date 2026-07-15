import crypto from 'node:crypto'

const ALGO = 'aes-256-gcm'

function getKey(): Buffer {
	const raw = process.env.ENCRYPTION_KEY
	if (!raw || raw.length < 32) {
		throw new Error(
			'ENCRYPTION_KEY 未配置或不足 32 字符，请在 .env.local 中设置',
		)
	}
	return crypto.createHash('sha256').update(raw).digest()
}

export function encrypt(plaintext: string): string {
	const key = getKey()
	const iv = crypto.randomBytes(12)
	const cipher = crypto.createCipheriv(ALGO, key, iv)
	const encrypted = Buffer.concat([
		cipher.update(plaintext, 'utf8'),
		cipher.final(),
	])
	const tag = cipher.getAuthTag()
	return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

export function decrypt(ciphertext: string): string {
	const buf = Buffer.from(ciphertext, 'base64')
	const iv = buf.subarray(0, 12)
	const tag = buf.subarray(12, 28)
	const encrypted = buf.subarray(28)
	const key = getKey()
	const decipher = crypto.createDecipheriv(ALGO, key, iv)
	decipher.setAuthTag(tag)
	return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
		'utf8',
	)
}

export function maskApiKey(key: string): string {
	if (key.length <= 8) return '••••••••'
	return `${key.slice(0, 3)}…${key.slice(-4)}`
}
