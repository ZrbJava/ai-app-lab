#!/usr/bin/env bash
# 创建新的 lab 目录
# 用法: ./scripts/new-lab.sh 13 experiment-name

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NUM="${1:?用法: new-lab.sh <编号> <slug>}"
SLUG="${2:?用法: new-lab.sh <编号> <slug>}"

LAB_DIR="$ROOT/labs/${NUM}-${SLUG}"
mkdir -p "$LAB_DIR/notes"

cat > "$LAB_DIR/README.md" << EOF
# Lab ${NUM} — ${SLUG}

| 项 | 内容 |
|----|------|
| **状态** | ⬜ 未开始 |

## 目标

（描述本实验目标）

## 参考

- 

## 交付清单

- [ ] 

## 通过标准

- [ ] 

## 复盘

（完成后填写）
EOF

touch "$LAB_DIR/notes/.gitkeep"
echo "已创建: $LAB_DIR"
