# Lab 01 — 最小 Chat API

| 项 | 内容 |
|----|------|
| **阶段** | 一 · 基础 |
| **预计** | 第 1 周 · 4～6 小时 |
| **状态** | ✅ 已完成 |

## 目标

理解 Chat 应用骨架：**输入 → API → 消息列表**，暂不接真实 LLM。

## 参考

- [references/nextchat.md](../../references/nextchat.md)
- [docs/00-glossary.md](../../docs/00-glossary.md)
- [notes/request-flow.md](./notes/request-flow.md) — 请求链路与踩坑记录

## 交付清单

- [x] Next.js App Router 项目（`demo/` 目录）
- [x] 页面：输入框 + 发送按钮 + 消息列表
- [x] `POST /api/chat` 返回 `{ role: 'assistant', content: 'echo: ...' }`
- [x] 支持多轮对话（前端维护 messages 数组）

## 初始化

```bash
cd labs/01-minimal-chat
npx create-next-app@latest demo --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack
cd demo
pnpm dev
```

## 通过标准

- [x] 连续发送 3 条消息，UI 正确展示 user/assistant
- [x] Network 面板能看到 POST `/api/chat`

## 复盘

### 懂了什么

- Chat 应用最小骨架：**前端 messages 数组 + POST API + 消息列表渲染**
- 乐观更新：用户消息先上屏，再等待 assistant 回复
- 多轮对话靠前端把完整 `messages` 历史发给 API
- NextChat 的 `onUserInput` 本质上也是这条链路，只是多了流式、Store、多 Provider

### 还不懂什么

- API 收到完整历史后，真实 LLM 如何裁剪上下文（token 限制）—— Lab 02+ 会涉及
- 为什么 NextChat 用 Zustand 而不是组件内 `useState`—— Lab 05 会话持久化时会体会

### 下一步

→ [Lab 02 — AI SDK 流式](../02-ai-sdk-stream/)
