# Lab 02 — AI SDK 流式 SSE

| 项 | 内容 |
|----|------|
| **阶段** | 一 · 基础 |
| **预计** | 第 2 周 · 5～8 小时 |
| **状态** | ⬜ 未开始 |

## 目标

用 **Vercel AI SDK** 实现真实 LLM **流式回复**。

## 参考

- [references/vercel-ai-sdk.md](../../references/vercel-ai-sdk.md)
- [docs/01-streaming.md](../../docs/01-streaming.md)

## 交付清单

- [ ] 安装 `ai` `@ai-sdk/openai`
- [ ] `streamText` + Route Handler 返回 SSE
- [ ] 前端逐字显示（`useChat` 或自读 stream）
- [ ] 先用 **Ollama** 或 mock，再 optional 云 API

## 依赖

- 完成 Lab 01

## 通过标准

- [ ] 回复逐 token 出现
- [ ] Response Content-Type 含 event-stream
- [ ] 更新 [docs/01-streaming.md](../../docs/01-streaming.md)

## 复盘

（完成后填写）
