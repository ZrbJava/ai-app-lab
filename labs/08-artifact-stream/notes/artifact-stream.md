# Lab 08 Artifact 流备忘

## 关键文件

| 文件 | 作用 |
|------|------|
| `lib/artifact/types.ts` | ArtifactKind、ArtifactData |
| `lib/artifact/stream.ts` | pipeline 事件 → `writer.write` |
| `lib/chat-types.ts` | `LabUIMessage` 含 `data-artifact` |
| `components/artifact/ArtifactBlocks.tsx` | 4 种 Artifact UI |
| `api/chat/route.ts` | Agent 模式用 `createUIMessageStream` |
| `ChatPanel.tsx` | 渲染 `message.parts` 中的 artifact |

## 阶段映射

| Lab 07 pipeline | Lab 08 Artifact |
|-----------------|-----------------|
| analyze | reasoning |
| plan | thinking |
| execute | task |
| answer | final_answer + text |

## SSE 事件

AI SDK 自定义 data part，type 为 `data-artifact`：

```ts
writer.write({
  type: 'data-artifact',
  id: 'artifact-reasoning',  // 同 id 可 reconciliation 更新
  data: { kind: 'reasoning', status: 'running', title: '分析' },
})
```

## 验证

1. Agent 开 → 发「北京天气怎么样」
2. UI 依次出现：分析 → 规划 → 执行（带 loading）→ 最终回答流式
3. Network → SSE 可见 `data-artifact` 事件
4. 刷新页面，历史消息仍保留分块

## 与 Lab 07 差异

- Lab 07：仅终端 `[agent] step` 日志，用户只见一条回复
- Lab 08：每步 artifact 推到前端，`message.parts` 同时含 artifact 与 text
