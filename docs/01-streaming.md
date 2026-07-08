# 01 — 流式输出（Streaming / SSE）

> 状态：⬜ 未开始 · 对应 Lab：02

## 要解决什么问题

LLM 生成慢，用户等整段 JSON 体验差；流式让用户 **边生成边看到**。

## 核心概念

- HTTP 长连接 / `text/event-stream`
- `ReadableStream` 在 Node 与浏览器中的角色
- AI SDK 的 `streamText` 与 `textStream`

## 关键问题（学完后能回答）

1. SSE 和普通 HTTP POST 响应有何不同？
2. 前端如何消费 stream 并更新 React state？
3. 流中断 / 报错时 UI 如何处理？

## 我的笔记

（Lab 02 完成后填写）
