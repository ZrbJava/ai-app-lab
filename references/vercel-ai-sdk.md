# Vercel AI SDK — 阅读笔记

- **仓库**：https://github.com/vercel/ai
- **本地路径**：`~/oss/ai`（运行 `./scripts/clone-references.sh`）
- **相关 Lab**：02, 03, 04

## 解决什么问题

统一多 Provider 的 LLM 调用、流式、Tool Calling 的 TypeScript SDK。

## 建议阅读路径

1. `examples/next-openai` — 跑起来
2. `packages/ai/src/stream-text.ts` — 流式核心
3. `content/docs/03-ai-sdk-core/` — 官方文档

## 一条链路：streamText

```
前端 useChat / fetch SSE
  → Route Handler 调用 streamText({ model, messages })
  → Provider 转发到 OpenAI/Ollama
  → textStream 逐 chunk 返回
```

## 可借鉴

- [ ] Provider 工厂
- [ ] Tool 定义方式
- [ ] SSE 响应格式

## 不借鉴

- 整个 monorepo 结构（学习阶段）

## 复盘

（读完后填写）
