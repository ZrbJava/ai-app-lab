'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import ChatPanel from '@/components/chat/ChatPanel'
import McpSettings from '@/components/mcp/McpSettings'
import AppShell from '@/components/shell/AppShell'

function WorkbenchContent() {
	const searchParams = useSearchParams()
	const [view, setView] = useState<'chat' | 'mcp'>(
		searchParams.get('view') === 'mcp' ? 'mcp' : 'chat',
	)

	useEffect(() => {
		const v = searchParams.get('view')
		if (v === 'mcp' || v === 'chat') setView(v)
	}, [searchParams])

	const openAddDialog = searchParams.get('dialog') === 'add'

	return (
		<AppShell view={view} onViewChange={setView}>
			{view === 'chat' ? (
				<ChatPanel />
			) : (
				<McpSettings initialDialogOpen={openAddDialog} />
			)}
		</AppShell>
	)
}

export default function WorkbenchPage() {
	return (
		<Suspense fallback={<div className='p-8 text-sm text-slate-400'>加载中…</div>}>
			<WorkbenchContent />
		</Suspense>
	)
}
