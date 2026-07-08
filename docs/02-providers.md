# 02 — Provider 与 BYOK

> 状态：⬜ 未开始 · 对应 Lab：03, 06

## 要解决什么问题

同一应用支持多家模型；用户 **自配 Key**，平台不代付。

## 核心概念

- OpenAI-compatible API
- `baseURL` + `apiKey` + `model`
- Credential 加密存储

## 关键问题

1. 如何用一套接口接 Ollama 和 OpenAI？
2. API Key 为什么不能放前端？
3. Provider 工厂模式怎么设计？

## 我的笔记

（Lab 03/06 完成后填写）
