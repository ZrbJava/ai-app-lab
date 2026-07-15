# Lab 06 实施备忘

> 与 [README](../README.md) 配套；记录「从 Lab 05 到 Lab 06」要动哪些文件。

## 从 Lab 05 带过来的（不删、只改）

| 模块 | 文件 | Lab 06 改动 |
|------|------|-------------|
| 会话注册表 | `lib/sessionChats.ts` | 保留；可选按 `userId` 清理 |
| 持久化 | `lib/sessions.ts` | 所有查询加 `userId` |
| 聊天面板 | `components/chat/ChatPanel.tsx` | `renderPart` text → `MarkdownContent` |
| API | `api/chat/route.ts` | 读登录用户 Provider，不再用全局 env Key |
| API | `api/sessions/*` | 鉴权 + `userId` 过滤 |

## 新增

| 模块 | 文件 |
|------|------|
| Auth | `auth.ts`、`app/api/auth/[...nextauth]/route.ts` |
| 登录页 | `app/login/page.tsx`、`app/register/page.tsx` |
| 设置页 | `app/settings/providers/page.tsx` |
| DB | `users`、`user_providers` 表；`sessions.user_id` 迁移 |
| 加密 | `lib/crypto.ts`（AES encrypt/decrypt api_key） |
| Markdown | `components/chat/MarkdownContent.tsx` |
| 代码块 | `components/chat/CodeBlock.tsx` |

## Markdown 技术栈（已定）

```
react-markdown
remark-gfm
shiki（或 react-syntax-highlighter，二选一）
```

## 流式 Markdown 策略（Lab 06 先简单）

**方案 A（推荐）**：`status === 'streaming'` 时 assistant 最后一条用 `whitespace-pre-wrap`；`ready` 后切 `MarkdownContent`。

**方案 B**：全程流式 MD（防抖 re-render）— 留到 Lab 08 与 Artifact UI 一起优化。

## 验收用例

1. 注册 A、B 两个账号，各建会话，互不可见
2. A 配置 Groq Key，B 配置 Ollama，各自对话走自己的 Provider
3. 让 AI 回复含 Markdown + 代码块，检查高亮与复制
4. 刷新页面：登录态、会话、Markdown 渲染均正常
