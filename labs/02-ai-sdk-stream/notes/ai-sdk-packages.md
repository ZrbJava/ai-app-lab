# AI SDK 三个 npm 包与 useChat 原理

## 包分工

```
Chat.tsx
  └── @ai-sdk/react     useChat()           浏览器：订阅状态、渲染 UI
        └── ai          AbstractChat          逻辑：发消息、读流、更新 messages
              └── @ai-sdk/openai  createOpenAI   适配：HTTP 调智谱 API
```

| 包 | 运行环境 | 核心导出 | 本 Lab 用法 |
|----|----------|----------|-------------|
| `ai` | 服务端 | `streamText`, `createUIMessageStreamResponse` | `route.ts` |
| `@ai-sdk/openai` | 服务端 | `createOpenAI`, `llm.chat()` | `lib/ai.ts` |
| `@ai-sdk/react` | 浏览器 | `useChat` | `Chat.tsx` |

## createOpenAI 的模型工厂方法

```typescript
const llm = createOpenAI({ baseURL, apiKey })

llm.chat('glm-4-flash')     // /chat/completions  ← 智谱、Ollama 用这个
llm('gpt-4o')               // /responses         ← 仅 OpenAI 官方
llm.completion('...')       // /completions       ← 老式 API，已淘汰
llm.embedding('...')        // /embeddings        ← Lab 09 RAG 用
```

## useChat 内部结构（简化）

```typescript
function useChat(options) {
  const chatRef = useRef(new Chat(options))  // 只创建一次

  // 用 useSyncExternalStore 订阅 Chat 内部 Store
  const messages = useSyncExternalStore(
    chatRef.current['~registerMessagesCallback'],
    () => chatRef.current.messages,
  )
  const status = useSyncExternalStore(...)
  const error = useSyncExternalStore(...)

  return { messages, status, error, sendMessage: chatRef.current.sendMessage }
}
```

### sendMessage 流程

1. 把 `{ text }` 包装成 `{ parts: [{ type: 'text', text }] }`
2. `pushMessage` 追加 user 消息（乐观更新）
3. `fetch POST /api/chat` 发完整 messages
4. 读 SSE 流，`processUIMessageStream` 解析 chunk
5. 每个 `text-delta` → `replaceMessage` 更新 assistant.parts
6. 结束 → `status = 'ready'`

## message.parts 结构

```typescript
// 简单对话
parts: [{ type: 'text', text: '你好' }]

// 流式生成中
parts: [{ type: 'text', text: '你好，我是', state: 'streaming' }]

// Lab 04 会有 tool part
parts: [
  { type: 'text', text: '让我查一下...' },
  { type: 'tool-weather', toolCallId: '...', state: 'output-available', ... },
]
```

## 和 Lab 01 手写代码的映射

| Lab 01 | useChat 内部 |
|--------|-------------|
| `useState<Message[]>` | `ReactChatState.#messages` |
| `handleSend` | `AbstractChat.sendMessage` |
| `fetch('/api/chat')` | `DefaultChatTransport.sendMessages` |
| `await res.json()` | `consumeStream` + `processUIMessageStream` |
| `loading` state | `status` 状态机 |
| `try/catch` | `error` + `onError` |

## 源码阅读顺序

1. `@ai-sdk/react/src/use-chat.ts`
2. `@ai-sdk/react/src/chat.react.ts`
3. `ai/packages/ai/src/ui/chat.ts`（`sendMessage`, `makeRequest`）
4. `ai/packages/ai/src/ui/http-chat-transport.ts`
5. `ai/packages/ai/src/ui/process-ui-message-stream.ts`
