# Lab 03 — 多 Provider / Ollama

| 项 | 内容 |
|----|------|
| **阶段** | 一 · 基础 |
| **预计** | 第 3 周 · 5～8 小时 |
| **状态** | ✅ 已完成 |

## 目标

同一应用通过 **环境变量或 UI** 切换多家 OpenAI 兼容 API。

## 参考

- [references/litellm.md](../../references/litellm.md)
- [docs/02-providers.md](../../docs/02-providers.md)
- [notes/provider-switch.md](./notes/provider-switch.md)

## 交付清单

- [x] `createModel()` 工厂函数
- [x] 支持 `LLM_BASE_URL` + `LLM_API_KEY` + `LLM_MODEL`
- [x] UI 下拉切换 Provider（智谱 / 千问 / Groq / Ollama）
- [ ] Ollama `qwen2.5:7b` 跑通（可选，需本地安装 Ollama）

## 依赖

- Lab 02

## 初始化

```bash
cp -r labs/02-ai-sdk-stream/demo labs/03-multi-provider/demo
cd labs/03-multi-provider/demo
pnpm install
cp .env.local.example .env.local
```

编辑 `.env.local`，按 Provider 填入 Key：

```bash
ZHIPU_API_KEY=xxx
DASHSCOPE_API_KEY=sk-xxx    # 通义千问
GROQ_API_KEY=gsk_xxx
# OLLAMA_API_KEY=ollama       # 本地 Ollama
```

```bash
pnpm dev
```

## 通过标准

- [x] 改 env 不改业务代码即可换模型
- [x] UI 下拉切换 Provider 能正常对话
- [x] 更新 [docs/02-providers.md](../../docs/02-providers.md)

## 复盘

### 懂了什么

- 多家 LLM 可以用同一套 **OpenAI 兼容接口** + `createOpenAI({ baseURL })` 接入
- **Provider 工厂**把「选哪家模型」从业务代码里剥离，加 Provider 只改预设表
- API Key 必须放服务端 `.env.local`，前端只传 `provider` 标识
- 各家 baseURL 格式不同，不能照搬；必须用 `llm.chat()` 而非 `llm()`
- UI 切换用 `sendMessage({ text }, { body: { provider } })` 把选择传给 API

### 还不懂什么

- LiteLLM 代理网关与工厂模式在生产环境的取舍——大规模多模型时可能用网关
- Lab 06 BYOK 如何把用户 Key 加密存库、按用户隔离 Provider
- Provider 级别的 fallback（A 挂了自动切 B）——需额外工程

### 下一步

→ [Lab 04 — Tool Calling](../04-tool-calling/)
