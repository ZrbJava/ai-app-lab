# Lab 10 — 异步媒体任务

| 项 | 内容 |
|----|------|
| **阶段** | 四 · 产品化 |
| **预计** | 第 10 周 · 8～12 小时 |
| **状态** | ⬜ 未开始 |

## 目标

**视频/图片生成** = 异步 Job：submit → poll → 展示结果。

## 参考

- fal.ai / Replicate 文档
- [docs/07-async-jobs.md](../../docs/07-async-jobs.md)

## 交付清单

- [ ] `generation_jobs` 表
- [ ] Mock adapter：3 秒后返回 sample.mp4
- [ ] 可选：Redis + 简单 worker 进程
- [ ] UI：进度条 + 视频播放器

## 依赖

- Lab 09

## 通过标准

- [ ] 提交后 UI 轮询状态直至 completed
- [ ] 刷新页面 job 状态仍可查

## 复盘

（完成后填写）
