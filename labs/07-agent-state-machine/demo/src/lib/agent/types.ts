/** Agent 流水线阶段（显式状态机） */
export type AgentPhase = 'analyze' | 'plan' | 'execute' | 'answer' | 'error' | 'done'

export type StepStatus = 'running' | 'ok' | 'error' | 'skipped'

export type AgentStepLog = {
	phase: AgentPhase
	status: StepStatus
	output?: string
	error?: string
	startedAt: string
	endedAt?: string
}

export type AgentContext = {
	userQuery: string
	analysis: string
	plan: string
	execution: string
	phase: AgentPhase
	steps: AgentStepLog[]
	error?: string
}

export function createAgentContext(userQuery: string): AgentContext {
	return {
		userQuery,
		analysis: '',
		plan: '',
		execution: '',
		phase: 'analyze',
		steps: [],
	}
}
