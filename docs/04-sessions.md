# 04 — 会话与消息

> 状态：✅ Lab 05 已完成

## 要解决什么问题

对话 **持久化**、多会话管理、上下文加载。

## 核心概念

| 概念 | 一句话 |
|------|--------|
| **session** | 一次独立对话的容器（标题、provider、时间） |
| **message** | 单条 `UIMessage`（role + parts JSON） |
| **深链接** | `?session=<uuid>` 刷新后恢复当前会话 |
| **history 截断** | 加载历史时按 token 预算裁剪（本 Lab 未实现） |

## 表设计（SQLite）

```sql
sessions(id, title, provider, created_at, updated_at)
messages(id, session_id, role, parts, created_at)
```

- `parts` 存完整 `UIMessage.parts` JSON，兼容 tool calling UI
- 删除 session 级联删除 messages（`ON DELETE CASCADE`）

## 关键问题（学完后能回答）

### 1. sessions 和 messages 表如何设计？

- **sessions**：面向 UI 列表的元数据，按 `updated_at` 排序
- **messages**：面向 LLM 的完整对话记录，按 `created_at` 升序加载
- 一条 assistant 消息可含多个 part（text + tool-*）

### 2. 加载历史时如何控制 token 上限？

本 Lab 全量加载。生产环境常见策略：

1. 只取最近 N 条消息
2. 滑动窗口 + 摘要旧对话
3. 向量检索相关历史片段（RAG on history）

### 3. 新会话与继续会话 API 如何划分？

| API | 用途 |
|-----|------|
| `POST /api/sessions` | 新建空会话 |
| `GET /api/sessions` | 左侧列表 |
| `GET /api/sessions/[id]/messages` | 切换会话时加载历史 |
| `POST /api/chat` | 带 `sessionId` 发消息并持久化 |

## 代码模式

```typescript
// 服务端：流结束后写 assistant
return createUIMessageStreamResponse({
  stream: toUIMessageStream({
    stream: result.stream,
    originalMessages: messages,
    onEnd: async ({ responseMessage }) => {
      saveMessage(sessionId, responseMessage)
    },
  }),
})

// 客户端：切换会话
useEffect(() => {
  fetch(`/api/sessions/${sessionId}/messages`)
    .then(r => r.json())
    .then(d => setMessages(d.messages))
}, [sessionId])
```

## 验收清单

- [x] SQLite `sessions` + `messages` 表
- [x] 刷新后历史仍在
- [x] 左侧会话列表，新建 / 切换 / 删除

## 我的笔记

- [Lab 05 链路笔记](../labs/05-session-persistence/notes/session-persistence-flow.md)
