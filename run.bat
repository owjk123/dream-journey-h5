@echo off
REM 造梦江湖H5 - Windows快速运行脚本

echo ========================================
echo   造梦江湖1 H5复刻版
echo ========================================
echo.

cd /d "%~dp0"

REM 检查npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 错误: npm 未安装
    pause
    exit /b 1
)

REM 安装依赖
if not exist "node_modules" (
    echo 安装依赖...
    call npm install
)

REM 检查Phaser
if not exist "node_modules\phaser" (
    echo 安装Phaser...
    call npm install phaser
)

REM 运行开发服务器
echo.
echo 启动开发服务器...
echo 访问 http://localhost:3000
echo 按 Ctrl+C 停止服务器
echo.
npm run dev

pause
