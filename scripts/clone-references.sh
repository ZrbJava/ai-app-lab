#!/usr/bin/env bash
# 将参考开源项目 clone 到 ~/Desktop/bobo/oss/（浅克隆，不进 ai-app-lab 仓库）

set -euo pipefail

OSS_DIR="${OSS_DIR:-$HOME/Desktop/bobo/oss}"
mkdir -p "$OSS_DIR"

repos=(
  "https://github.com/vercel/ai.git"
  "https://github.com/ChatGPTNextWeb/ChatGPT-Next-Web.git"
  "https://github.com/BerriAI/litellm.git"
  "https://github.com/danny-avila/LibreChat.git"
  "https://github.com/langchain-ai/langgraphjs.git"
  "https://github.com/langgenius/dify.git"
  "https://github.com/lobehub/lobe-chat.git"
  "https://github.com/infiniflow/ragflow.git"
)

echo "→ 目标目录: $OSS_DIR"
cd "$OSS_DIR"

for url in "${repos[@]}"; do
  name=$(basename "$url" .git)
  if [ -d "$name" ]; then
    echo "✓ 已存在: $name（跳过）"
  else
    echo "↓ clone: $name"
    git clone --depth 1 "$url" "$name"
  fi
done

echo ""
echo "完成。阅读笔记见 ai-app-lab/references/"
