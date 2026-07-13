# Lab 03 Provider 切换链路

## 请求链路

```mermaid
flowchart LR
    UI["Chat.tsx 下拉选择 provider"]
    API["route.ts createModel(provider)"]
    Factory["lib/ai.ts 工厂"]
    Preset["lib/providers.ts 预设表"]
    LLM["智谱 / 千问 / Groq / Ollama"]

    UI -->|"POST body: { provider, messages }"| API
    API --> Factory
    Factory --> Preset
    Factory --> LLM
```

## Provider 工厂分支（OpenAI 兼容 vs 原生 SDK）

Lab 03 目前只用 `@ai-sdk/openai`（OpenAI **兼容**插头）。扩展 Anthropic / Gemini / Grok 时，工厂按 `sdk` 字段分支，**上层 `streamText` / `useChat` 不变**：

```mermaid
flowchart TB
    subgraph upper ["上层（不变）"]
        Route["route.ts\nstreamText({ model })"]
        Chat["Chat.tsx\nuseChat + 下拉"]
    end

    subgraph factory ["lib/ai.ts — createModel(provider)"]
        Preset["providers.ts 预设表\n{ id, sdk, baseURL, model, apiKeyEnv }"]
        Switch{"preset.sdk?"}
    end

    subgraph openai_compat ["sdk: openai — OpenAI 兼容"]
        OAI["@ai-sdk/openai\ncreateOpenAI({ baseURL, apiKey })"]
        OAI --> OAIChat["llm.chat(model)"]
        Zhipu["智谱"]
        Qwen["千问"]
        Groq["Groq"]
        Ollama["Ollama"]
        OAIChat --> Zhipu & Qwen & Groq & Ollama
    end

    subgraph native ["sdk: 原生协议 — 需专用包"]
        AnthropicSDK["@ai-sdk/anthropic\ncreateAnthropic()"]
        GoogleSDK["@ai-sdk/google\ncreateGoogle()"]
        XaiSDK["@ai-sdk/xai\ncreateXai()"]
        AnthropicSDK --> Claude["Claude"]
        GoogleSDK --> Gemini["Gemini"]
        XaiSDK --> Grok["Grok"]
    end

    subgraph gateway ["可选：统一网关"]
        Router["OpenRouter / LiteLLM\n仍用 createOpenAI + 一个 baseURL"]
        Router --> All["anthropic/...\ngoogle/...\nopenai/..."]
    end

    Chat --> Route
    Route --> Preset
    Preset --> Switch
    Switch -->|openai| OAI
    Switch -->|anthropic| AnthropicSDK
    Switch -->|google| GoogleSDK
    Switch -->|xai| XaiSDK
```

### 两类插头对照

| 类型 | npm 包 | 典型厂商 | Lab 03 |
|------|--------|----------|--------|
| **OpenAI 兼容** | `@ai-sdk/openai` | 智谱、千问、Groq、Ollama | ✅ 已实现 |
| **原生 SDK** | `@ai-sdk/anthropic` | Claude | 🔜 扩展 |
| **原生 SDK** | `@ai-sdk/google` | Gemini | 🔜 扩展 |
| **原生 SDK** | `@ai-sdk/xai` | Grok | 🔜 扩展 |
| **统一网关** | `@ai-sdk/openai` + 代理 baseURL | OpenRouter、LiteLLM | 可选 |

## 两种切换方式

### 方式 A：UI 下拉（默认）

- 前端 `sendMessage({ text }, { body: { provider } })`
- 服务端 `createModel(provider)` 读预设表 + `ZHIPU_API_KEY` 等环境变量
- API Key **只在服务端**，不传给浏览器

### 方式 B：纯 .env 切换

设置 `LLM_BASE_URL` + `LLM_API_KEY` + `LLM_MODEL`，请求不带 `provider`：

```bash
# 换 Provider 只改这三行，重启 pnpm dev
LLM_BASE_URL=http://localhost:11434/v1
LLM_API_KEY=ollama
LLM_MODEL=qwen2.5:7b
```

## 核心文件

| 文件 | 职责 |
|------|------|
| `lib/providers.ts` | Provider 预设表（智谱、千问、Ollama、Groq） |
| `lib/ai.ts` | `createModel()` 工厂 |
| `route.ts` | 从 body 取 `provider`，调用工厂 |
| `Chat.tsx` | Provider 下拉 + `sendMessage` 传 body |

## 踩坑记录

- OpenAI 兼容接口统一用 `llm.chat(model)`，不要用 `llm(model)`
- Ollama baseURL 是 `http://localhost:11434/v1`（带 `/v1`）
- 智谱 baseURL 是 `https://open.bigmodel.cn/api/paas/v4`（不是 `/v1`）
- 千问 baseURL 是 `https://dashscope.aliyuncs.com/compatible-mode/v1`，Key 环境变量 `DASHSCOPE_API_KEY`
- API Key 绝不能放前端或 commit 到 git
- `ZHIPU_API_KEY` 不能留中文占位符（如 `你的智谱API_KEY`），会触发 ByteString 报错；应填真实 Key，或与 `LLM_API_KEY` 保持一致
