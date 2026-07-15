# Lab 08 — Artifact 事件流 UI

| 项 | 内容 |
|----|------|
| **阶段** | 三 · Agent |
| **预计** | 第 8 周 · 8～12 小时 |
| **状态** | 🟡 进行中 |

## 目标

仿 Navos：**reasoning → thinking → task → final_answer** 分块 SSE + React 组件。

## 参考

- [references/lobe-chat.md](../../references/lobe-chat.md)
- [AI SDK Streaming Custom Data](https://ai-sdk.dev/docs/ai-sdk-ui/streaming-data)
- [labs/07-agent-state-machine/demo](../07-agent-state-machine/demo) — Agent 流水线基线

## 交付清单

- [x] 从 Lab 07 copy demo
- [x] 自定义 SSE data part：`data-artifact`
- [x] 4 种 Artifact 组件（reasoning / thinking / task / final_answer）
- [x] Agent pipeline `onStep` → `writer.write` 事件
- [x] `createUIMessageStream` 合并 artifact + `streamText` 最终回答
- [ ] 可选：Mermaid / Tool 结果卡片化

## 依赖

- Lab 07

## 初始化

```bash
cd labs/08-artifact-stream/demo
pnpm install
cp .env.local.example .env.local   # 或从 Lab 07 复制
pnpm dev
```

打开对话页 → 开启 **Agent 开** → 发消息 → 界面应分块显示分析/规划/执行，最后流式最终回答。

> **切换 Lab 注意**：每个 Lab 有独立 `data/lab.db`。切到 Lab 08 后需**重新注册/登录**，或复制数据库：`cp ../07-agent-state-machine/demo/data/lab.db data/lab.db`

## 架构

```
用户消息
  → analyze  → data-artifact reasoning
  → plan     → data-artifact thinking
  → execute  → data-artifact task
  → answer   → data-artifact final_answer + text 流式
  → message.parts 落库（含 artifact + text）
```

## 通过标准

- [ ] Agent 开时 UI 可见 4 个分块 Artifact
- [ ] 每步 running → ok 状态切换
- [ ] 最终回答仍流式输出并持久化
- [ ] 刷新后历史消息仍显示 Artifact 分块

## 复盘

（完成后填写）

## 下一步

→ [Lab 09 — RAG 基础](../09-rag-basics/)
