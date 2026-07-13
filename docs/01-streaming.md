# 01 — 流式输出（Streaming / SSE）

> 状态：✅ 已完成 · 对应 Lab：02

## 要解决什么问题

LLM 生成一段回复可能需要数秒到数十秒。如果等整段 JSON 一次性返回，用户只能盯着空白 loading；**流式（Streaming）** 让模型每生成一个 token 就推给前端，用户能 **边生成边看到**，体验和 ChatGPT 一致。

## 核心概念

| 概念 | 一句话 |
|------|--------|
| **SSE** | Server-Sent Events，HTTP 长连接，服务端单向推事件到浏览器 |
| **Content-Type** | 流式响应为 `text/event-stream`，普通 JSON 为 `application/json` |
| **ReadableStream** | Web 标准流对象；Node（服务端）和浏览器都能读/写 |
| **streamText** | AI SDK 服务端函数，调用 LLM 并返回可迭代的 text stream |
| **useChat** | AI SDK React Hook，自动发请求、读 SSE、更新 `messages` |
| **UIMessage.parts** | v6+ 消息结构，流式时 `text` part 逐步变长 |

## Lab 01 vs Lab 02

```
Lab 01:  POST /api/chat → 一次性 JSON { role, content }
Lab 02:  POST /api/chat → SSE 长连接，持续推送 data: {...}
```

## 关键问题（学完后能回答）

### 1. SSE 和普通 HTTP POST 响应有何不同？

| | 普通 POST（Lab 01） | SSE 流式（Lab 02） |
|---|---|---|
| Content-Type | `application/json` | `text/event-stream` |
| 连接 | 请求 → 等完整响应 → 关闭 | 请求 → 保持连接 → 多次推送 → 结束关闭 |
| 数据格式 | 一个 JSON 对象 | 多行 `data: {json}\n\n` |
| 前端读取 | `await res.json()` 一次拿完 | 读 `response.body` 的 ReadableStream，逐 chunk 处理 |
| 用户体验 | 整段文字一次出现 | 逐 token 出现 |

SSE 事件示例（Network 面板可见）：

```
data: {"type":"text-start","id":"txt-0"}

data: {"type":"text-delta","id":"txt-0","delta":"你"}

data: {"type":"text-delta","id":"txt-0","delta":"好"}

data: {"type":"text-end","id":"txt-0"}

data: {"type":"finish","finishReason":"stop"}
```

### 2. 前端如何消费 stream 并更新 React state？

Lab 02 用 `useChat`，内部流程：

1. `sendMessage({ text })` → 立刻 `pushMessage` 追加 user 消息
2. `DefaultChatTransport` → `fetch POST /api/chat`
3. 读 `response.body` 流 → `parseJsonEventStream` 解析 SSE
4. `processUIMessageStream` 把每个 `text-delta` 拼进 `assistant.parts[0].text`
5. 每次更新调用 `replaceMessage` → `useSyncExternalStore` 通知 React 重渲染

手写等价逻辑（理解用，实际用 useChat）：

```typescript
const res = await fetch('/api/chat', { method: 'POST', body: ... })
const reader = res.body!.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break
  const chunk = decoder.decode(value)
  // 解析 data: {...} 行，追加到 assistant 文本
  setMessages(prev => /* 更新最后一条 assistant */)
}
```

渲染时用 `message.parts`（不是 `message.content`）：

```tsx
message.parts
  .filter(part => part.type === 'text')
  .map(part => part.text)
  .join('')
```

### 3. 流中断 / 报错时 UI 如何处理？

| 场景 | useChat 行为 | 本 Lab UI |
|------|-------------|-----------|
| API 返回 4xx/5xx | `status → 'error'`，`error` 有值 | 显示红色 `error.message` |
| 网络断开 | `onFinish({ isDisconnect: true })` | 保留已生成的 partial 文本 |
| 用户点停止 | `stop()` → `AbortController.abort()` | 保留已生成部分 |
| 请求进行中 | `status: 'submitted' \| 'streaming'` | 禁用输入和按钮 |

```tsx
const isLoading = status === 'streaming' || status === 'submitted'

{error && <p role="alert">{error.message}</p>}
```

## 服务端关键代码（Lab 02）

```typescript
// route.ts
const result = streamText({
  model: llm.chat(defaultModel),  // 兼容接口必须用 .chat()
  messages: await convertToModelMessages(messages),
})

return createUIMessageStreamResponse({
  stream: toUIMessageStream({ stream: result.stream }),
})
```

## 三个 npm 包分工

| 包 | 跑在哪 | 职责 |
|----|--------|------|
| `ai` | 服务端 | `streamText`、`createUIMessageStreamResponse` |
| `@ai-sdk/openai` | 服务端 | `createOpenAI` Provider，HTTP 调智谱/Ollama |
| `@ai-sdk/react` | 浏览器 | `useChat` Hook，消费 SSE、管 messages |

## 验收清单

- [ ] 发消息后回复逐字出现
- [ ] Network → `POST /api/chat` → Response Headers 含 `text/event-stream`
- [ ] 连续多轮对话正常
- [ ] API Key 错误时页面显示 error 提示

## 我的笔记

（学习过程中自行追加）
