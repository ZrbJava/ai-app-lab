import type { AgentContext } from '@/lib/agent/types'

export function analyzePrompt(query: string) {
	return `你是 Agent 的分析模块。用 2～4 句话分析用户问题：
- 用户真正想要什么？
- 是否需要实时数据或计算？
- 有无歧义？

用户问题：${query}`
}

export function planPrompt(ctx: AgentContext) {
	return `你是 Agent 的规划模块。根据分析结果，列出 2～4 条可执行步骤（编号列表）。
若需要工具（天气 getWeather、计算 calc），在步骤中注明。

【分析】
${ctx.analysis}

【用户问题】
${ctx.userQuery}`
}

export function executePrompt(ctx: AgentContext, toolHint: string) {
	return `你是 Agent 的执行模块。按计划执行并记录结果。
${toolHint}
需要工具时主动调用；完成后用要点列出执行结果。

【计划】
${ctx.plan}

【用户问题】
${ctx.userQuery}`
}

export function answerPrompt(ctx: AgentContext) {
	const trace = ctx.steps
		.filter(s => s.phase !== 'answer')
		.map(s => `- ${s.phase}: ${s.status}${s.error ? ` (${s.error})` : ''}`)
		.join('\n')

	return `你是 Agent 的汇总模块。根据以下流水线结果，给用户一条清晰、完整的最终回答。
不要暴露内部术语；若某步失败，诚实说明并基于已有信息回答。

【流水线 trace】
${trace}

【分析】
${ctx.analysis || '（跳过）'}

【计划】
${ctx.plan || '（跳过）'}

【执行】
${ctx.execution || '（跳过）'}

【用户问题】
${ctx.userQuery}`
}

export function fallbackAnswerPrompt(ctx: AgentContext) {
	return `Agent 流水线在「${ctx.phase}」阶段失败：${ctx.error ?? '未知错误'}。
请根据已有信息给用户一个简短、诚实的回复，并建议如何重试。

【已完成步骤】
${ctx.steps.map(s => `${s.phase}: ${s.output?.slice(0, 200) ?? s.error ?? s.status}`).join('\n')}

【用户问题】
${ctx.userQuery}`
}
