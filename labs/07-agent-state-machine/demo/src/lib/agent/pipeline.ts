import { generateText, stepCountIs, type LanguageModel, type ToolSet } from 'ai'

import {
	analyzePrompt,
	answerPrompt,
	executePrompt,
	fallbackAnswerPrompt,
	planPrompt,
} from '@/lib/agent/prompts'
import type { AgentContext, AgentPhase, AgentStepLog } from '@/lib/agent/types'
import { createAgentContext } from '@/lib/agent/types'

function logStep(phase: AgentPhase, index: number, total: number) {
	console.log(`[agent] step ${index}/${total}: ${phase}`)
}

function startStep(ctx: AgentContext, phase: AgentPhase): AgentStepLog {
	ctx.phase = phase
	const entry: AgentStepLog = {
		phase,
		status: 'running',
		startedAt: new Date().toISOString(),
	}
	ctx.steps.push(entry)
	return entry
}

function finishStep(entry: AgentStepLog, output: string) {
	entry.status = 'ok'
	entry.output = output
	entry.endedAt = new Date().toISOString()
}

function failStep(entry: AgentStepLog, error: unknown, ctx: AgentContext) {
	entry.status = 'error'
	entry.error = error instanceof Error ? error.message : String(error)
	entry.endedAt = new Date().toISOString()
	ctx.phase = 'error'
	ctx.error = entry.error
}

/**
 * 显式状态机：analyze → plan → execute
 * 任一步失败则进入 error，不再执行后续步。
 */
export async function runAgentPipeline(input: {
	model: LanguageModel
	userQuery: string
	tools: ToolSet
	toolHint: string
}): Promise<AgentContext> {
	const ctx = createAgentContext(input.userQuery)
	const phases: Array<{
		phase: AgentPhase
		run: () => Promise<string>
	}> = [
		{
			phase: 'analyze',
			run: async () => {
				const { text } = await generateText({
					model: input.model,
					prompt: analyzePrompt(input.userQuery),
				})
				return text
			},
		},
		{
			phase: 'plan',
			run: async () => {
				const { text } = await generateText({
					model: input.model,
					prompt: planPrompt(ctx),
				})
				return text
			},
		},
		{
			phase: 'execute',
			run: async () => {
				const { text } = await generateText({
					model: input.model,
					tools: input.tools,
					stopWhen: stepCountIs(5),
					prompt: executePrompt(ctx, input.toolHint),
				})
				return text
			},
		},
	]

	for (let i = 0; i < phases.length; i++) {
		const { phase, run } = phases[i]
		logStep(phase, i + 1, phases.length)
		const entry = startStep(ctx, phase)
		try {
			const output = await run()
			finishStep(entry, output)
			if (phase === 'analyze') ctx.analysis = output
			if (phase === 'plan') ctx.plan = output
			if (phase === 'execute') ctx.execution = output
			console.log(`[agent] ${phase} ok (${output.length} chars)`)
		} catch (error) {
			failStep(entry, error, ctx)
			console.error(`[agent] ${phase} failed:`, entry.error)
			break
		}
	}

	return ctx
}

export function buildFinalInstructions(ctx: AgentContext): string {
	if (ctx.phase === 'error') {
		return fallbackAnswerPrompt(ctx)
	}
	ctx.phase = 'answer'
	return answerPrompt(ctx)
}
