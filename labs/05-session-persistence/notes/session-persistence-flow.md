# Lab 05 会话持久化链路

## 时序图

```mermaid
sequenceDiagram
    participant User as 用户
    participant UI as ChatPanel
    participant Sessions as /api/sessions
    participant Chat as /api/chat
    participant DB as SQLite

    User->>UI: 新建会话
    UI->>Sessions: POST /api/sessions
    Sessions->>DB: INSERT sessions
    Sessions-->>UI: { id, title }
    UI->>UI: router ?session=id

    User->>UI: 发送消息
    UI->>Chat: POST { sessionId, messages, provider }
    Chat->>DB: INSERT user message
    Chat->>Chat: streamText + tools
    Chat->>DB: onEnd INSERT assistant message
    Chat-->>UI: SSE stream
    UI->>Sessions: refresh 列表标题

    User->>UI: 刷新页面
    UI->>Sessions: GET /api/sessions/:id/messages
    Sessions->>DB: SELECT messages
    Sessions-->>UI: UIMessage[]
    UI->>UI: setMessages 恢复历史
```

## 表结构

```mermaid
erDiagram
    sessions ||--o{ messages : contains
    sessions {
        text id PK
        text title
        text provider
        text created_at
        text updated_at
    }
    messages {
        text id PK
        text session_id FK
        text role
        text parts
        text created_at
    }
```

## 核心文件

| 文件 | 职责 |
|------|------|
| `lib/db.ts` | SQLite 连接与建表 |
| `lib/sessions.ts` | sessions/messages CRUD |
| `app/api/sessions/route.ts` | 列表 / 新建 |
| `app/api/sessions/[id]/messages/route.ts` | 加载历史 |
| `app/api/chat/route.ts` | 流式对话 + 持久化 |
| `hooks/useSessions.ts` | 前端会话列表 |
| `components/shell/AppShell.tsx` | 左侧会话栏 |

## 和 Lab 04 的变化

| Lab 04 | Lab 05 |
|--------|--------|
| 内存态 `useChat` | SQLite 持久化 |
| 无会话概念 | `sessions` + 左侧列表 |
| 刷新丢历史 | `?session=` 深链接恢复 |

## 踩坑记录

- `useChat` 的 `id` 必须跟 `sessionId` 绑定，切换会话时要 `setMessages` 重载
- assistant 消息在 `toUIMessageStream.onEnd` 保存，不要只靠客户端 `onFinish`
- `better-sqlite3` 需允许 pnpm build script（`.npmrc` + `onlyBuiltDependencies`）
- Next.js 流式响应下服务端 `onEnd` 不稳定，需客户端 `useChat.onFinish` 再 POST 一次（`messageExists` 去重）

## 验收

- [ ] 新建会话 → 发消息 → 刷新 → 历史仍在
- [ ] 新建第二个会话 → 切换 → 各自历史独立
- [ ] 首条消息后会话标题从「新对话」变为消息摘要
