# LibreChat — 阅读笔记

- **仓库**：https://github.com/danny-avila/LibreChat
- **本地路径**：`~/oss/LibreChat`
- **相关 Lab**：05, 06, 11

## 解决什么问题

全栈 Chat + 多用户 + BYOK + Docker 私有化。

## 建议阅读路径

1. `docker-compose.yml` — 先跑起来
2. `api/` — 后端如何代理 LLM
3. 用户 endpoint / key 配置相关代码

## 一条链路：发消息

```
Browser → POST /api/ask
  → 鉴权 session
  → 读用户 model 配置
  → 转发 OpenAI compatible
  → SSE 回前端
```

## 可借鉴

- [ ] docker-compose 结构
- [ ] BYOK 配置模型
- [ ] 多用户会话隔离

## 复盘

（读完后填写）
