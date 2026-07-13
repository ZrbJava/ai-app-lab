# LiteLLM — 阅读笔记

- **仓库**：https://github.com/BerriAI/litellm
- **本地路径**：`~/Desktop/bobo/oss/litellm`
- **相关 Lab**：03

## 解决什么问题

一个 OpenAI 格式 API 代理 **100+ 模型**，用统一 `model` 字符串切换厂商。

## 建议阅读

1. 文档：Provider 列表
2. `litellm/` 下 provider 注册方式（浏览即可）

## 与 Lab 03 的对比

| | Lab 03（AI SDK 工厂） | LiteLLM |
|---|---|---|
| 切换方式 | `createModel('zhipu')` + env Key | `completion(model="groq/llama-3.1-8b-instant")` |
| 部署 | 应用内，无额外服务 | 可独立部署为代理网关 |
| 适合 | 学习、小应用 | 生产、100+ 模型、fallback 路由 |

Lab 03 的 `PROVIDER_PRESETS` 表本质上就是 LiteLLM「Provider 注册」的简化版。

## 可借鉴

- [x] 统一 completion 接口（我们用 `createModel` + `streamText` 实现）
- [ ] fallback / 路由概念（Lab 03 未实现，生产可参考）

## 复盘

- LiteLLM 是「网关级」统一，Lab 03 是「应用级」工厂，思路相通、复杂度不同
- 两者都依赖 OpenAI-compatible 协议作为通用方言
