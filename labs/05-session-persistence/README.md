# Lab 05 — 会话持久化

| 项 | 内容 |
|----|------|
| **阶段** | 二 · 工程化 |
| **预计** | 第 5 周 · 6～10 小时 |
| **状态** | ✅ 已完成 |

## 目标

**刷新不丢对话**；左侧会话列表。

## 参考

- [references/librechat.md](../../references/librechat.md)
- [docs/04-sessions.md](../../docs/04-sessions.md)
- [notes/session-persistence-flow.md](./notes/session-persistence-flow.md)

## 交付清单

- [x] `sessions` + `messages` 表（SQLite）
- [x] `GET/POST /api/sessions`
- [x] `GET /api/sessions/[id]/messages`
- [x] 发消息时写入 DB（user + assistant）
- [x] 左侧会话列表、新建、切换、删除

## 依赖

- Lab 04

## 初始化

```bash
cd labs/05-session-persistence/demo
pnpm install
cp .env.local.example .env.local   # 或从 Lab 04 复制并追加 DATABASE_URL
pnpm dev
```

首次运行会在 `demo/data/lab.db` 自动建表。

## 通过标准

- [x] 刷新页面历史仍在
- [x] 可新建会话并切换
- [x] 首条用户消息自动更新会话标题

## 复盘

### 懂了什么

- `sessions` 存元数据（标题、provider、时间），`messages` 存 `UIMessage.parts` JSON
- 服务端在 `toUIMessageStream.onEnd` 持久化 assistant 消息，user 消息在 stream 前写入
- `useChat({ id: sessionId })` + `setMessages` 加载历史，切换会话时重新 fetch
- URL `?session=<id>` 深链接当前会话，刷新可恢复

### 还不懂什么

- 长对话 history 截断策略（token 预算、摘要压缩）
- Postgres 迁移与多实例部署下的 SQLite 替代方案

### 下一步

→ [Lab 06 — Auth + BYOK](../06-auth-byok/)
