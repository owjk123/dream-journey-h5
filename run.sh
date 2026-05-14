#!/bin/bash
# 造梦江湖H5 - 快速运行脚本

echo "========================================"
echo "  造梦江湖1 H5复刻版"
echo "========================================"
echo ""

cd "$(dirname "$0")"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "错误: npm 未安装"
    exit 1
fi

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "安装依赖..."
    npm install
fi

# 检查node_modules
if [ ! -d "node_modules/phaser" ]; then
    echo "安装Phaser..."
    npm install phaser
fi

# 运行开发服务器
echo ""
echo "启动开发服务器..."
echo "访问 http://localhost:3000"
echo "按 Ctrl+C 停止服务器"
echo ""
npm run dev
