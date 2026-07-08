# 03 — Tool Calling

> 状态：⬜ 未开始 · 对应 Lab：04

## 要解决什么问题

让 LLM **查实时数据、调 API**，而不只靠训练记忆。

## 核心概念

- tool schema（name, description, parameters）
- model 返回 tool_calls
- 执行 tool → tool_result → 继续对话

## 关键问题

1. 何时用 Tool，何时用 RAG？
2. 多 tool 一次调用怎么处理？
3. tool 执行失败如何反馈给模型？

## 我的笔记

（Lab 04 完成后填写）
