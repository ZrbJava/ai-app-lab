# Lab 01 — 最小 Chat API

| 项 | 内容 |
|----|------|
| **阶段** | 一 · 基础 |
| **预计** | 第 1 周 · 4～6 小时 |
| **状态** | ⬜ 未开始 |

## 目标

理解 Chat 应用骨架：**输入 → API → 消息列表**，暂不接真实 LLM。

## 参考

- [references/nextchat.md](../../references/nextchat.md)
- [docs/00-glossary.md](../../docs/00-glossary.md)

## 交付清单

- [ ] Next.js App Router 项目（本目录）
- [ ] 页面：输入框 + 发送按钮 + 消息列表
- [ ] `POST /api/chat` 返回 `{ role: 'assistant', content: 'echo: ...' }`
- [ ] 支持多轮对话（前端维护 messages 数组）

## 初始化

```bash
cd labs/01-minimal-chat
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack
```

## 通过标准

- [ ] 连续发送 3 条消息，UI 正确展示 user/assistant
- [ ] Network 面板能看到 POST `/api/chat`

## 复盘

### 懂了什么

（完成后填写）

### 还不懂什么

（完成后填写）

### 下一步

→ [Lab 02 — AI SDK 流式](../02-ai-sdk-stream/)
