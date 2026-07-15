# Lab 06 — Auth + BYOK + 消息 Markdown 基础

| 项 | 内容 |
|----|------|
| **阶段** | 二 · 工程化 |
| **预计** | 第 6 周 · 8～12 小时 |
| **状态** | 🟡 进行中 |

## 目标

1. **注册登录**；用户配置 **加密存储** 的 API Key；数据按用户隔离（本章核心）
2. 从 Lab 05 copy 代码后，升级聊天 **Markdown 基础渲染**（本章 UI 增强，非持久化范畴）

## 参考

- [references/librechat.md](../../references/librechat.md) — 多用户、BYOK、会话隔离
- [references/lobe-chat.md](../../references/lobe-chat.md) — 流式 Markdown 组件（先读笔记，实现基础版）
- [docs/02-providers.md](../../docs/02-providers.md)
- [docs/04-sessions.md](../../docs/04-sessions.md) — 会话模型加 `userId`

---

## 一、核心交付（必须通过）

### Auth

- [x] Auth.js（NextAuth v5）Credentials 注册 / 登录
- [x] `users` 表：`id`、`email`、`password_hash`、`created_at`
- [x] 未登录访问 `/` → 重定向登录页
- [x] 登录态 session 可在 Route Handler 读取（`requireUser()`）

### BYOK（Bring Your Own Key）

- [x] `user_providers` 表：`userId`、`provider`、`api_key_encrypted`、`base_url`、`model`、`created_at`
- [x] API Key **AES 加密**存库，设置页**掩码展示**
- [x] 设置页：添加 / 删除 Provider（`/settings/providers`）
- [x] `/api/chat` 优先读用户 BYOK，env Key 作开发 fallback

### 多用户数据隔离

- [x] `sessions` 表加 `user_id` 外键
- [x] 所有 sessions / messages API 查询带 `userId`
- [ ] MCP 配置按用户隔离（本章仍用 localStorage，待后续）
- [x] 用户 A 看不到用户 B 的会话、消息、Provider Key

---

## 二、UI 增强（从 Lab 05 延续，本章完成）

> Lab 05 只管「存得住」；Lab 06 copy 代码时顺手升级「看得清」。
> **Mermaid、图片上传、Artifact 分块** 留给 Lab 08 / 10，本章不做。

### Markdown 基础渲染

- [x] 新建 `components/chat/MarkdownContent.tsx`
- [x] 依赖：`react-markdown` + `remark-gfm`
- [x] `ChatPanel` text part 走 `MarkdownContent`
- [x] 基础排版样式（手写 Tailwind）

### 代码块

- [x] 新建 `components/chat/CodeBlock.tsx`
- [x] 语法高亮：`react-syntax-highlighter`
- [x] 语言标签 + **一键复制**按钮
- [x] 流式策略：生成中纯文本，结束后 Markdown

### 明确不做（留给后续 Lab）

| 能力 | 留给 |
|------|------|
| Mermaid / 流程图渲染、下载 | Lab 08 |
| Artifact 分块 SSE UI | Lab 08 |
| Tool 结果卡片化（非 JSON） | Lab 08 |
| 图片 / 视频 part、异步生成 | Lab 10 |
| LaTeX、消息导出 | Lab 12 |

---

## 依赖

- Lab 05

## 初始化

```bash
cd labs/06-auth-byok/demo
pnpm install
cp .env.local.example .env.local
# 填写 AUTH_SECRET、ENCRYPTION_KEY（各 ≥32 字符）
# 可选：ZHIPU_API_KEY 作为开发 fallback
pnpm dev
```

打开 http://localhost:3000 → 注册账号 → 「Provider 设置」添加 Key → 开始对话。

> **开发模式说明**：`pnpm dev` 默认使用 **Webpack**（`--webpack`），避免 Turbopack 对 `better-sqlite3` 原生模块创建 symlink 失败导致 HMR 死循环卡死。若要用 Turbopack 可 `pnpm dev:turbo`，但需先 `rm -rf .next`。

## 建议实施顺序

```
Day 1-2  copy Lab 05 → 跑通
Day 2-3  users 表 + Auth.js 注册登录
Day 3-4  user_providers + 加密 + 设置页
Day 4-5  sessions 加 userId，API 全链路隔离
Day 5-6  MarkdownContent + CodeBlock（可并行于 Auth 后端）
Day 6    联调 + 复盘
```

## 通过标准

### 核心

- [ ] 未登录不能 chat
- [ ] 用户 A 看不到用户 B 的会话和 Key
- [ ] 用户 A 的 Provider Key 加密存库，界面掩码显示
- [ ] 刷新页面：登录态 + 会话历史仍在

### UI 增强

- [ ] AI 回复中的 `## 标题`、列表、链接、表格正常渲染
- [ ] ` ```js ` 代码块有语法高亮且可复制
- [ ] 历史消息从 DB 加载后 Markdown 显示正确（parts JSON 无需改表）

## 复盘

### 懂了什么

（完成后填写）

### 还不懂什么

（完成后填写）

### 下一步

→ [Lab 07 — Agent 状态机](../07-agent-state-machine/)
