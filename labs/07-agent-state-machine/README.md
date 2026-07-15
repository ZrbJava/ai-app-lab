# Lab 07 — Agent 状态机

| 项 | 内容 |
|----|------|
| **阶段** | 三 · Agent |
| **预计** | 第 7 周 · 8～12 小时 |
| **状态** | 🟡 进行中 |

## 目标

多步骤 Agent：**analyze → plan → execute → answer**（显式 TypeScript 状态机）。

## 参考

- [references/langgraph.md](../../references/langgraph.md)
- [docs/05-agents.md](../../docs/05-agents.md)
- [labs/06-auth-byok/demo](../06-auth-byok/demo) — 基线工程

## 交付清单

- [x] 从 Lab 06 copy demo
- [x] `lib/agent/`：types、prompts、pipeline（显式状态机）
- [x] 4 步流水线：analyze → plan → execute → answer
- [x] 每步 `console.log` 可追踪
- [x] 任一步失败进入 `error` 态 + fallback 最终回答
- [x] ChatPanel「Agent 开/关」开关
- [ ] 可选：LangGraph StateGraph 对照实现

## 依赖

- Lab 06

## 初始化

```bash
cd labs/07-agent-state-machine/demo
pnpm install
cp .env.local.example .env.local   # 或从 Lab 06 复制
pnpm dev
```

打开对话页 → 开启 **Agent 开** → 发消息 → 终端查看 `[agent] step 1/3` 日志。

> **切换 Lab 注意**：每个 Lab 有独立 `data/lab.db`。从 Lab 06 切到 Lab 07 后需**重新注册/登录**，或复制数据库：`cp ../06-auth-byok/demo/data/lab.db data/lab.db`

## 架构

```
用户消息
  → analyze (generateText)
  → plan    (generateText)
  → execute (generateText + tools)
  → answer  (streamText 汇总)
  → 一条 assistant 回复落库
```

## 通过标准

- [ ] 终端可见 `step 1/3 analyze`、`2/3 plan`、`3/3 execute`
- [ ] 最终仍是一条 assistant 流式回复
- [ ] 某步失败时有 `[agent] xxx failed` 与 fallback 回答

## 复盘

（完成后填写）

## 下一步

→ [Lab 08 — Artifact 事件流 UI](../08-artifact-stream/)
