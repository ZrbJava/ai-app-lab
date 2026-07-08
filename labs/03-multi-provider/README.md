# Lab 03 — 多 Provider / Ollama

| 项 | 内容 |
|----|------|
| **阶段** | 一 · 基础 |
| **预计** | 第 3 周 · 5～8 小时 |
| **状态** | ⬜ 未开始 |

## 目标

同一应用通过 **环境变量或 UI** 切换 Ollama / OpenAI 兼容 API。

## 参考

- [references/litellm.md](../../references/litellm.md)
- [docs/02-providers.md](../../docs/02-providers.md)

## 交付清单

- [ ] `createModel()` 工厂函数
- [ ] 支持 `LLM_BASE_URL` + `LLM_API_KEY` + `LLM_MODEL`
- [ ] 设置页或 `.env` 切换 Provider
- [ ] Ollama `qwen2.5:7b` 跑通

## 依赖

- Lab 02

## 通过标准

- [ ] 改 env 不改业务代码即可换模型
- [ ] 更新 [docs/02-providers.md](../../docs/02-providers.md)

## 复盘

（完成后填写）
