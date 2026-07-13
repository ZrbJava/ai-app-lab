#!/usr/bin/env bash
# 将参考开源项目 clone 到 ~/Desktop/bobo/oss/（浅克隆，不进 ai-app-lab 仓库）
# 用法:
#   ./scripts/clone-references.sh         # 跳过已完整 clone 的仓库
#   ./scripts/clone-references.sh --fresh # 删除后全部重新 clone

set -euo pipefail

FRESH=false
if [[ "${1:-}" == "--fresh" ]]; then
  FRESH=true
fi

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

is_complete() {
  local dir="$1"
  [ -d "$dir/.git" ] && [ "$(find "$dir" -maxdepth 1 -not -name '.git' -not -path "$dir" | wc -l | tr -d ' ')" -gt 0 ]
}

clone_repo() {
  local url="$1"
  local name
  name=$(basename "$url" .git)
  local attempt

  for attempt in 1 2 3; do
    rm -rf "$name"
    echo "[clone] $name (attempt $attempt/3)"
    if git clone --depth 1 --single-branch "$url" "$name"; then
      echo "[done] $name"
      return 0
    fi
    echo "[retry] $name failed, waiting 5s..."
    sleep 5
  done

  echo "[fail] $name"
  return 1
}

echo "→ 目标目录: $OSS_DIR"
if $FRESH; then
  echo "→ 模式: 全部重新 clone"
fi
cd "$OSS_DIR"

failed=()
for url in "${repos[@]}"; do
  name=$(basename "$url" .git)
  if $FRESH || ! is_complete "$name"; then
    if ! clone_repo "$url"; then
      failed+=("$name")
    fi
  else
    echo "[skip] $name already cloned"
  fi
done

echo ""
if [ ${#failed[@]} -eq 0 ]; then
  echo "完成。共 ${#repos[@]} 个仓库。"
else
  echo "部分失败: ${failed[*]}"
  echo "可重新运行: ./scripts/clone-references.sh --fresh"
  exit 1
fi
