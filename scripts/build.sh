#!/bin/bash
set -e

# ========================================================
# PwdNote 一键本地构建脚本
# ========================================================

echo "🚀 [1/4] 检查构建环境..."
command -v node >/dev/null 2>&1 || { echo "❌ 请先安装 Node.js"; exit 1; }
command -v cargo >/dev/null 2>&1 || { echo "❌ 请先安装 Rust (cargo)"; exit 1; }

echo "📦 [2/4] 安装前端依赖..."
npm install

echo "🔨 [3/4] 开始编译并打包 Release 版本..."
npm run tauri build

echo "✨ [4/4] 整理产物..."
mkdir -p dist-release
if [ -d "src-tauri/target/release/bundle/dmg" ]; then
  cp src-tauri/target/release/bundle/dmg/*.dmg dist-release/ 2>/dev/null || true
fi
if [ -d "src-tauri/target/release/bundle/macos" ]; then
  cp -r src-tauri/target/release/bundle/macos/*.app dist-release/ 2>/dev/null || true
fi

echo ""
echo "🎉 构建完成！安装包已放置在 dist-release/ 目录下："
ls -lh dist-release/
