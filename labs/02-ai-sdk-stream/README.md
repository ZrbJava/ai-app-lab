# Lab 02 — AI SDK 流式 SSE

| 项 | 内容 |
|----|------|
| **阶段** | 一 · 基础 |
| **预计** | 第 2 周 · 5～8 小时 |
| **状态** | ✅ 已完成 |

## 目标

用 **Vercel AI SDK** 实现真实 LLM **流式回复**。

## 参考

- [references/vercel-ai-sdk.md](../../references/vercel-ai-sdk.md)
- [docs/01-streaming.md](../../docs/01-streaming.md)
- [notes/request-flow.md](./notes/request-flow.md) — 流式请求链路
- [notes/ai-sdk-packages.md](./notes/ai-sdk-packages.md) — 三个 npm 包与 useChat 原理

## 交付清单

- [x] 安装 `ai` `@ai-sdk/openai` `@ai-sdk/react`
- [x] `streamText` + Route Handler 返回 SSE
- [x] 前端逐字显示（`useChat`）
- [x] 用 **智谱 API** 跑通流式对话

## 依赖

- 完成 Lab 01

## 初始化

```bash
# 从 Lab 01 复制 demo
cp -r labs/01-minimal-chat/demo labs/02-ai-sdk-stream/demo
cd labs/02-ai-sdk-stream/demo

pnpm add ai @ai-sdk/openai @ai-sdk/react
cp .env.local.example .env.local
```

编辑 `.env.local`（[智谱开放平台](https://open.bigmodel.cn) 申请 API Key）：

```bash
LLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4
LLM_API_KEY=你的智谱API_KEY
LLM_MODEL=glm-4-flash
```

```bash
pnpm dev
```

## 通过标准

- [x] 回复逐 token 出现
- [x] Response Content-Type 含 event-stream
- [x] 更新 [docs/01-streaming.md](../../docs/01-streaming.md)

## 复盘

### 懂了什么

- 流式 = SSE 长连接 + 多次 `data:` 事件，不是一次性 JSON
- 服务端：`streamText` → `toUIMessageStream` → `createUIMessageStreamResponse`
- 前端：`useChat` 替代 Lab 01 手写 fetch，内部用 `useSyncExternalStore` 订阅消息
- 消息结构从 `content: string` 升级为 `parts[]`，流式时 text part 逐步变长
- Provider 适配：`@ai-sdk/openai` + 改 `baseURL` 可接智谱；必须用 `llm.chat(model)`

### 还不懂什么

- `processUIMessageStream` 内部每种 chunk type 的完整处理逻辑——Lab 04 tool 时会再深入
- 如何实现断线重连（`resumeStream`）——生产环境才需要
- token 用量统计与上下文裁剪策略——Lab 03+ 涉及

### 下一步

→ [Lab 03 — 多 Provider](../03-multi-provider/)
