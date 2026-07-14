# Vercel AI SDK — 阅读笔记

- **仓库**：https://github.com/vercel/ai
- **本地路径**：`~/Desktop/bobo/oss/ai`（运行 `./scripts/clone-references.sh`）
- **相关 Lab**：02, 03, 04

## 解决什么问题

统一多 Provider 的 LLM 调用、流式、Tool Calling 的 TypeScript SDK。

## 建议阅读路径

1. `examples/next-openai-kasada-bot-protection/app/page.tsx` — 最小 useChat 示例
2. `packages/ai/src/ui/chat.ts` — AbstractChat / sendMessage
3. `packages/ai/src/stream-text.ts` — 流式核心
4. `content/docs/03-ai-sdk-core/` — 官方文档

## 一条链路：streamText + useChat

```
前端 useChat → DefaultChatTransport → POST /api/chat
  → Route Handler: streamText({ model: llm.chat(id), messages })
  → Provider HTTP → 智谱/Ollama/OpenAI
  → createUIMessageStreamResponse → SSE
  → useChat 读流 → message.parts 逐字更新
```

## Lab 02 实践要点

- [x] 三个包：`ai`（服务端）+ `@ai-sdk/openai`（Provider）+ `@ai-sdk/react`（useChat）
- [x] 兼容接口（智谱/Ollama）必须用 `llm.chat(model)`，不能用 `llm(model)`
- [x] 消息渲染用 `message.parts`，`message.content` 已废弃
- [x] `status` 替代 `isLoading`：`streaming | submitted | ready | error`

## 可借鉴

- [x] Provider 工厂（`createOpenAI` + 改 baseURL）
- [x] Tool 定义方式（Lab 04）
- [x] SSE 响应格式（`createUIMessageStreamResponse`）

## 不借鉴

- 整个 monorepo 结构（学习阶段）
- Responses API（`/v1/responses`）—— 仅 OpenAI 官方，智谱/Ollama 用 chat completions

## 复盘

- useChat 是薄 React 绑定，核心逻辑在 `AbstractChat` 类
- `useSyncExternalStore` 订阅 Chat 内部 Store，适合高频流式更新
- Transport 层可插拔，默认 `DefaultChatTransport` 走 `/api/chat`
