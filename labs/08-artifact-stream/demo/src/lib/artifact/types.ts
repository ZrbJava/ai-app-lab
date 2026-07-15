import type { AgentPhase } from '@/lib/agent/types'

/** Navos 风格 Artifact 分块类型 */
export type ArtifactKind =
	| 'reasoning'
	| 'thinking'
	| 'task'
	| 'final_answer'

export type ArtifactStatus = 'running' | 'ok' | 'error'

export type ArtifactData = {
	kind: ArtifactKind
	status: ArtifactStatus
	title: string
	content?: string
	error?: string
	stepIndex?: number
	stepTotal?: number
}

export const ARTIFACT_TITLES: Record<ArtifactKind, string> = {
	reasoning: '分析',
	thinking: '规划',
	task: '执行',
	final_answer: '最终回答',
}

/** Lab 07 pipeline 阶段 → Lab 08 Artifact 类型 */
export function phaseToArtifactKind(
	phase: AgentPhase,
): ArtifactKind | undefined {
	switch (phase) {
		case 'analyze':
			return 'reasoning'
		case 'plan':
			return 'thinking'
		case 'execute':
			return 'task'
		default:
			return undefined
	}
}
