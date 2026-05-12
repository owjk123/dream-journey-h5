#!/bin/bash
# 造梦江湖1 Godot Web导出脚本

set -e

echo "=== 造梦江湖1 Web构建 ==="

# 导出为Web
echo "导出Web版本..."
godot --headless --export-release "Web" ../dream-journey-h5/index.html

echo "导出完成！"
echo "输出目录: dream-journey-h5/"
