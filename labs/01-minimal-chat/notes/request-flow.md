# Lab 01 请求链路

## 时序图

```mermaid
sequenceDiagram
    participant User as 用户
    participant Chat as Chat.tsx
    participant API as POST /api/chat

    User->>Chat: 输入并点击发送
    Chat->>Chat: 追加 user 消息到 messages
    Chat->>API: { messages: [...] }
    API->>API: 取最后一条 user 消息
    API-->>Chat: { role: "assistant", content: "echo: ..." }
    Chat->>Chat: 追加 assistant 消息
    Chat->>User: 渲染多轮对话
```

## 核心文件

| 文件 | 职责 |
|------|------|
| `demo/src/types/chat.ts` | `Message` 类型定义 |
| `demo/src/components/Chat.tsx` | 前端 state + UI + fetch |
| `demo/src/app/api/chat/route.ts` | Echo API，模拟后端 |

## 和 NextChat 的对应

| NextChat | Lab 01 |
|----------|--------|
| `useChatStore` + `session.messages` | `useState<Message[]>` |
| `onUserInput()` | `handleSend()` |
| `api.llm.chat({ messages })` | `fetch('/api/chat')` |
| `app/api/openai.ts` | `app/api/chat/route.ts` |

## 踩坑记录

- `create-next-app` 不能在含 `README.md` 的 lab 根目录直接初始化，项目在 `demo/` 子目录
- 发送时要把**完整 messages 历史**带给 API，才能支持多轮对话
- `Chat.tsx` 需要 `"use client"`，因为用到了 `useState`
