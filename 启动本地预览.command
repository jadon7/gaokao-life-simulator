#!/bin/zsh
cd "$(dirname "$0")"
PORT=8765

while lsof -nP -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

export PORT
export HOST=0.0.0.0

LAN_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)

echo "高考人生模拟器本地服务已启动"
echo "本机访问: http://127.0.0.1:$PORT/"
if [ -n "$LAN_IP" ]; then
  echo "手机同一 Wi-Fi 访问: http://$LAN_IP:$PORT/"
fi
echo "按 Control+C 可停止服务"
echo "如需调用 DeepSeek，请先设置 DEEPSEEK_API_KEY 环境变量或在 .env 中配置"

node server.js
