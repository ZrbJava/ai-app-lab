const BLOCKED_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '[::1]'])

function isPrivateIp(hostname: string): boolean {
	if (/^10\./.test(hostname)) return true
	if (/^192\.168\./.test(hostname)) return true
	const match = hostname.match(/^172\.(\d+)\./)
	if (match) {
		const second = Number(match[1])
		if (second >= 16 && second <= 31) return true
	}
	return false
}

/** 基础 SSRF 防护：用户 MCP 只允许公网 HTTPS（对标 LibreChat allowedDomains） */
export function validateMcpUrl(rawUrl: string): { ok: true; url: URL } | { ok: false; error: string } {
	let parsed: URL
	try {
		parsed = new URL(rawUrl.trim())
	} catch {
		return { ok: false, error: 'URL 格式无效' }
	}

	if (parsed.protocol !== 'https:') {
		return { ok: false, error: '仅允许 HTTPS 远程 MCP（Web 产品不支持 stdio）' }
	}

	const host = parsed.hostname.toLowerCase()
	if (BLOCKED_HOSTS.has(host) || isPrivateIp(host)) {
		return { ok: false, error: '禁止连接内网或本机地址' }
	}

	return { ok: true, url: parsed }
}
