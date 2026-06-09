#!/bin/zsh
cd "$(dirname "$0")"
PORT=8765

while lsof -nP -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

export PORT

echo "高考人生模拟器本地服务已启动"
echo "请在浏览器打开: http://127.0.0.1:$PORT/"
echo "按 Control+C 可停止服务"
echo "如需调用 DeepSeek，请先设置 DEEPSEEK_API_KEY 环境变量或在 .env 中配置"

node server.js
