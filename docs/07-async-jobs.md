# 07 — 异步任务

> 状态：⬜ 未开始 · 对应 Lab：10

## 要解决什么问题

视频生成等耗时 **数十秒～数分钟**，不能阻塞 HTTP。

## 核心概念

- job 状态机：pending → processing → completed
- 队列 Redis + Worker
- poll / webhook

## 关键问题

1. 为何不用同步 API 等视频生成完？
2. 用户关页面后 job 如何继续？
3. 失败重试策略？

## 我的笔记

（Lab 10 完成后填写）
