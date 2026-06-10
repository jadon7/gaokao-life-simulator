# 高考人生模拟器

这是一个带 DeepSeek 代理的网页产品包。前端保留翻牌 UI，内容由后端调用 DeepSeek 分幕批量生成，降低翻牌等待感。

当前主流程按 `18` 张牌设计。新的结构化协议、字数预算、双线推进规则和霍兰德隐藏计分方式，见 [docs/story-state-card-protocol.md](./docs/story-state-card-protocol.md)。

## 打开方式

1. 复制 `.env.example` 为 `.env`，填入 `DEEPSEEK_API_KEY`。
2. 双击 `启动本地预览.command`。
3. 打开终端里显示的本地地址，例如 `http://127.0.0.1:8765/`。

也可以在终端运行：

```bash
DEEPSEEK_API_KEY=your-deepseek-api-key npm start
```

本地不想调用 DeepSeek 时，可用 mock 模式测试 UI：

```bash
DEEPSEEK_MOCK=1 npm start
```

## 文件说明

- `index.html`: 网页入口。
- `server.js`: Node 本地服务与 DeepSeek API 代理。
- `.env.example`: 环境变量示例，真实 API key 不要写入前端。
- `assets/`: 页面所需图片资源。
- `启动本地预览.command`: macOS 本地启动脚本。

## API

- `POST /api/game/start`: 生成第 1 年问题。
- `POST /api/game/next`: 根据历史生成下一年问题。
- `POST /api/game/batch`: 按 `startYear/count` 批量生成一幕卡牌，前端主流程使用这个接口预缓存牌堆。
- `POST /api/game/result`: 根据 18 年历史生成最终结果。
