# Lab 09 — RAG 基础

| 项 | 内容 |
|----|------|
| **阶段** | 三 · Agent |
| **预计** | 第 9 周 · 8～12 小时 |
| **状态** | ⬜ 未开始 |

## 目标

上传 **txt/md** → 切片 → embedding → 检索 → 增强回答。

## 参考

- [references/dify.md](../../references/dify.md)
- [references/ragflow.md](../../references/ragflow.md)
- [docs/06-rag.md](../../docs/06-rag.md)

## 交付清单

- [ ] 文档上传 API
- [ ] chunk + embed（OpenAI embed 或本地 `@xenova/transformers`）
- [ ] 向量存 SQLite-vec / json / pgvector 择一
- [ ] chat 时 top-k 注入 context

## 依赖

- Lab 08

## 通过标准

- [ ] 文档内独有事实：无 RAG 答错，有 RAG 答对

## 复盘

（完成后填写）
