# Lab 04 — Tool Calling

| 项 | 内容 |
|----|------|
| **阶段** | 二 · 工程化 |
| **预计** | 第 4 周 · 6～10 小时 |
| **状态** | ⬜ 未开始 |

## 目标

LLM **调用工具函数**，基于返回结果生成最终答案。

## 参考

- [references/vercel-ai-sdk.md](../../references/vercel-ai-sdk.md) — tools 章节
- [docs/03-tool-calling.md](../../docs/03-tool-calling.md)

## 交付清单

- [ ] 定义 2 个 tool：`getWeather(city)`、`calc(expression)`（mock 即可）
- [ ] AI SDK `tools` + `maxSteps`
- [ ] UI 展示「正在调用工具 xxx」（可选）

## 依赖

- Lab 03

## 通过标准

- [ ] 问「北京天气」会触发 getWeather
- [ ] 最终回答包含 tool 返回的数据

## 复盘

（完成后填写）
