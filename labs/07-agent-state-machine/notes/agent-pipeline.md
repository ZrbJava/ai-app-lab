# Lab 07 Agent 流水线备忘

## 关键文件

| 文件 | 作用 |
|------|------|
| `lib/agent/types.ts` | AgentContext、StepLog 类型 |
| `lib/agent/prompts.ts` | 各阶段 prompt |
| `lib/agent/pipeline.ts` | analyze → plan → execute 状态机 |
| `api/chat/route.ts` | `agentMode` 分支 + 最终 streamText |
| `ChatPanel.tsx` | Agent 开关，localStorage 记忆 |

## 与 Lab 06 差异

- **普通模式**：单轮 `streamText` + tools（同 Lab 06）
- **Agent 模式**：先 3 次 `generateText` 再 1 次 `streamText` 汇总

## 验证

```bash
# 终端应出现
[agent] pipeline start: ...
[agent] step 1/3: analyze
[agent] analyze ok (...)
[agent] step 2/3: plan
...
[agent] pipeline done, phase=answer steps=3
```

## 后续 Lab 08

把每步输出改成自定义 SSE `artifact` 事件，UI 分块展示（reasoning / task / answer）。
