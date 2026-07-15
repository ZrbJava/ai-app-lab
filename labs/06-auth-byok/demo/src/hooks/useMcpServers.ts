'use client'

import { useEffect, useState } from 'react'

import { MCP_CATALOG } from '@/lib/mcp/catalog'
import {
	MCP_STORAGE_KEY,
	type McpServerConfig,
	type McpServerRuntime,
} from '@/lib/mcp/types'

function createId() {
	return crypto.randomUUID()
}

function saveServers(next: McpServerConfig[]) {
	localStorage.setItem(MCP_STORAGE_KEY, JSON.stringify(next))
}

function loadServers(): McpServerConfig[] {
	if (typeof window === 'undefined') return []
	try {
		const raw = localStorage.getItem(MCP_STORAGE_KEY)
		return raw ? (JSON.parse(raw) as McpServerConfig[]) : []
	} catch {
		return []
	}
}

export function useMcpServers() {
	const [servers, setServers] = useState<McpServerConfig[]>([])

	useEffect(() => {
		setServers(loadServers())
	}, [])

	const persist = (updater: (prev: McpServerConfig[]) => McpServerConfig[]) => {
		setServers(prev => {
			const next = updater(prev)
			saveServers(next)
			return next
		})
	}

	const addFromCatalog = (catalogIndex: number) => {
		const item = MCP_CATALOG[catalogIndex]
		if (!item) return
		persist(prev => {
			if (prev.some(s => s.url === item.url)) return prev
			return [
				...prev,
				{
					...item,
					id: createId(),
					enabled: true,
					status: 'idle' as const,
				},
			]
		})
	}

	const addCustom = (
		input: Omit<McpServerConfig, 'id' | 'source' | 'status' | 'enabled'> & {
			enabled?: boolean
		},
	): McpServerConfig => {
		const server: McpServerConfig = {
			...input,
			id: createId(),
			source: 'user',
			enabled: input.enabled ?? true,
			status: 'idle',
		}
		persist(prev => [...prev, server])
		return server
	}

	const updateServer = (id: string, patch: Partial<McpServerConfig>) => {
		persist(prev =>
			prev.map(s => (s.id === id ? { ...s, ...patch } : s)),
		)
	}

	const removeServer = (id: string) => {
		persist(prev => prev.filter(s => s.id !== id))
	}

	const enabledRuntime = (): McpServerRuntime[] => {
		return servers
			.filter(s => s.enabled)
			.map(({ id, name, transport, url, apiKey }) => ({
				id,
				name,
				transport,
				url,
				apiKey,
			}))
	}

	return {
		servers,
		addFromCatalog,
		addCustom,
		updateServer,
		removeServer,
		enabledRuntime,
	}
}
