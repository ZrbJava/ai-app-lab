# Lab 06 — Auth + BYOK

| 项 | 内容 |
|----|------|
| **阶段** | 二 · 工程化 |
| **预计** | 第 6 周 · 8～12 小时 |
| **状态** | ⬜ 未开始 |

## 目标

**注册登录**；用户配置 **加密存储** 的 API Key；数据按用户隔离。

## 参考

- [references/librechat.md](../../references/librechat.md)
- [docs/02-providers.md](../../docs/02-providers.md)

## 交付清单

- [ ] Auth.js Credentials 注册/登录
- [ ] `user_providers` 表 + AES 加密 api_key
- [ ] 设置页：添加/删除 Provider，掩码显示 Key
- [ ] 所有 session 查询带 `userId`

## 依赖

- Lab 05

## 通过标准

- [ ] 未登录不能 chat
- [ ] 用户 A 看不到用户 B 的会话

## 复盘

（完成后填写）
