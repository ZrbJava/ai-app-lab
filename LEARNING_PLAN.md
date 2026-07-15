# AI 应用开发 — 完整学习计划（12 周）

> 配套仓库：`ai-app-lab` · 每周 1 个 Lab · 每个 Lab 约 5～10 小时

---

## 总目标

12 周后你应该能够：

1. 独立实现 **流式 Chat + 多 Provider + Tool Calling**
2. 理解 **Agent 编排、Artifact UI、RAG、异步媒体任务**
3. 完成 **BYOK + 登录 + Docker 部署** 的最小产品
4. 读懂 LibreChat / Dify / AI SDK 的核心代码路径

---

## 阶段一：基础（第 1～3 周）

### Lab 01 — 最小 Chat API（第 1 周）

| 项 | 内容 |
|----|------|
| **目标** | 理解 Chat 应用 = 前端 + `/api/chat` + 消息列表 |
| **交付** | 输入框发消息，API 返回固定 JSON（无 AI） |
| **参考** | NextChat 产品流程 |
| **概念** | HTTP POST、messages 数组、role: user/assistant |
| **通过标准** | 连续对话 UI 能展示多轮消息 |

### Lab 02 — AI SDK 流式 SSE（第 2 周）

| 项 | 内容 |
|----|------|
| **目标** | 掌握 LLM **流式输出** 与前端逐字渲染 |
| **交付** | `streamText` + `useChat` 或自读 SSE |
| **参考** | Vercel AI SDK `examples/next-openai` |
| **概念** | SSE、ReadableStream、token、finish reason |
| **通过标准** | 回复逐字出现，可中断，Network 里看到 event-stream |

### Lab 03 — 多 Provider / Ollama（第 3 周）

| 项 | 内容 |
|----|------|
| **目标** | 同一套代码切换 **Ollama / OpenAI 兼容 API** |
| **交付** | 环境变量或 UI 下拉切换 model + baseURL |
| **参考** | LiteLLM provider 概念、AI SDK `@ai-sdk/openai` |
| **概念** | Provider 抽象、OpenAI-compatible、BYOK 雏形 |
| **通过标准** | 本地 Ollama 与 Groq/Gemini 免费档至少各通一次 |

---

## 阶段二：工程化（第 4～6 周）

### Lab 04 — Tool Calling（第 4 周）

| 项 | 内容 |
|----|------|
| **目标** | LLM **主动调用函数** 并基于结果回答 |
| **交付** | 至少 2 个 tool：如 `getWeather`、`searchDocs` |
| **参考** | AI SDK tools 文档、LangGraph tool node 概念 |
| **概念** | tool schema、tool_call、tool_result、多轮 |
| **通过标准** | 模型在需要时调 tool，最终答案引用 tool 结果 |

### Lab 05 — 会话持久化（第 5 周）

| 项 | 内容 |
|----|------|
| **目标** | 刷新页面后 **历史对话仍在** |
| **交付** | SQLite 或 Postgres：sessions + messages 表 |
| **参考** | LibreChat 消息存储（笔记即可） |
| **概念** | sessionId、migration、CRUD、分页历史 |
| **通过标准** | 左侧会话列表，点击可加载历史消息 |

### Lab 06 — Auth + BYOK + Markdown 基础（第 6 周）

| 项 | 内容 |
|----|------|
| **目标** | **登录用户** 配置自己的 API Key，服务端代调用；聊天消息支持基础 Markdown |
| **交付** | Auth.js 注册登录 + `user_providers` 表 + Key 加密掩码 + `sessions.userId` 隔离 + `MarkdownContent` / `CodeBlock` |
| **参考** | LibreChat 多用户 BYOK；LobeChat 消息 Markdown（基础版） |
| **概念** | Session、加密存储、多用户隔离、remark/rehype 渲染管道 |
| **通过标准** | A 用户看不到 B 的会话和 Key；AI 回复 Markdown + 代码高亮正常 |
| **不做** | Mermaid、图片上传、Artifact 分块 → Lab 08 / 10 |

---

## 阶段三：Agent（第 7～9 周）

### Lab 07 — Agent 状态机（第 7 周）

| 项 | 内容 |
|----|------|
| **目标** | 多步骤 Agent：**plan → act → summarize** |
| **交付** | 显式状态机或 LangGraph 最小图 |
| **参考** | LangGraph.js examples |
| **概念** | state、node、edge、checkpoint、循环 |
| **通过标准** | 同一 user 输入走多步，每步状态可日志追踪 |

### Lab 08 — Artifact 事件流 UI（第 8 周）

| 项 | 内容 |
|----|------|
| **目标** | 仿 Navos：**reasoning / thinking / task / answer** 分块 UI |
| **交付** | 自定义 SSE 事件类型 + React 组件渲染 |
| **参考** | Navos 应用（你已调研的 artifact 类型） |
| **概念** | 自定义 stream event、UI 与模型输出解耦 |
| **通过标准** | 用户能看到分阶段 Artifact，最后汇总 final answer |

### Lab 09 — RAG 基础（第 9 周）

| 项 | 内容 |
|----|------|
| **目标** | **上传文档 → 检索 → 增强回答** |
| **交付** | txt/md 上传、切片、embedding、top-k 检索 |
| **参考** | Dify 知识库流程、RAGFlow 文档 |
| **概念** | chunk、embedding、vector、similarity、context injection |
| **通过标准** | 问文档内独有事实，无 RAG 答错、有 RAG 答对 |

---

## 阶段四：多模态与产品化（第 10～12 周）

### Lab 10 — 异步媒体任务（第 10 周）

| 项 | 内容 |
|----|------|
| **目标** | **视频/图片生成** = 异步 job，非同步 HTTP |
| **交付** | Mock 或 fal：submit → poll → 结果 URL |
| **参考** | fal/Replicate API 文档 |
| **概念** | job queue、status、webhook、超时、重试 |
| **通过标准** | 提交后 UI 显示进度，完成后 embed 视频/图 |

### Lab 11 — Docker 部署（第 11 周）

| 项 | 内容 |
|----|------|
| **目标** | **`docker compose up`** 别人能跑你的 Lab 08/12 |
| **交付** | Dockerfile + compose + `.env.example` + healthcheck |
| **参考** | LibreChat docker-compose |
| **概念** | 镜像分层、volume、secrets、standalone 构建 |
| **通过标准** | 新机器仅依赖 Docker 可访问 localhost:3000 |

### Lab 12 — Mini Navos 整合（第 12 周）

| 项 | 内容 |
|----|------|
| **目标** | 整合：**模块 Tab + Agent + BYOK + 会话 + Mock 视频** |
| **交付** | 可演示的最小「出海营销 Agent 工作台」 |
| **参考** | 本仓库 Lab 01～11 + navos-lite 经验 |
| **概念** | 产品化、模块边界、技术债清单 |
| **通过标准** | 注册 → 配 Key → 洞察/创作对话 → 创作可触发 mock 视频 |

---

## 每周时间分配建议

| 活动 | 时间 |
|------|------|
| 读概念 + 写 docs | 1h |
| 读开源 + 更新 references | 2h |
| 写 Lab 代码 | 4～6h |
| 复盘 + 看板更新 | 1h |

---

## 延伸学习（12 周之后）

| 主题 | 建议 |
|------|------|
| Monorepo + 开源发布 | 从 Lab 12 抽 `navos` 产品 repo |
| 真实 Seedance / GPT Image | 接 fal，替换 Lab 10 mock |
| 多租户 Org / RBAC | 参考 Dify workspace |
| 可观测性 | Langfuse / OpenTelemetry |
| 评估 | RAGAS、人工 eval 集 |

---

## 学习原则

1. **不跳 Lab** — 依赖是递进的  
2. **每个 Lab 独立 package.json** — 失败可删重来  
3. **笔记比代码更重要** — references 必须更新  
4. **先 Ollama 后云 API** — 控制成本  
5. **产品仓库后开** — 本仓库允许混乱  
