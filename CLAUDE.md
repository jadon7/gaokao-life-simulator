# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

「高考人生模拟器」：18 张牌的连续人生短剧 + 霍兰德（RIASEC）兴趣隐藏计分。前端是翻牌 UI，剧情内容由后端调用 DeepSeek 逐年生成，保证每一年的提示词都拿到玩家已经做出的完整历史选择。仓库内文档与文案均为中文。

## 常用命令

```bash
npm start                      # 本地开发服务（默认 http://127.0.0.1:8765/），需要 .env 里有 DEEPSEEK_API_KEY
DEEPSEEK_MOCK=1 npm start      # mock 模式，不调 DeepSeek，纯测 UI
npm run cf:dry-run             # wrangler deploy --dry-run 验证 Worker
npm run cf:deploy              # 部署到 Cloudflare（生产域名 gaokao.dsxzai.com）
```

没有构建步骤、测试和 lint。前端无框架、无打包，改完刷新浏览器即可。

环境变量从 `.env` 读取（`server.js` 自带解析器，不依赖 dotenv）：`DEEPSEEK_API_KEY`、`DEEPSEEK_MODEL`、`DEEPSEEK_MOCK`、`DEEPSEEK_STREAM`、`PORT`。生产环境的 `DEEPSEEK_API_KEY` 通过 Cloudflare Worker Secret 配置，不在仓库里。

## 架构

### 双后端 + 共享 Prompt 模块（必须保持一致）

同一套 API 有两份实现，逻辑大量重复，**改其一时必须同步改另一个**：

- `server.js` — Node 本地开发服务：静态托管仓库根目录（根 `index.html` + `assets/`）+ DeepSeek 代理。
- `worker.js` — Cloudflare Worker 生产版：静态资源走 `public/` 目录（wrangler ASSETS binding），API 逻辑与 server.js 平行。

两者都从 `deepseek-prompt-vnext.js` 导入 prompt 与输入构造器。该文件是 prompt 的唯一事实来源：`vNextSystemPrompt`、`vNextAnnualTaskPrompt`、`vNextBatchTaskPrompt`、`vNextResultTaskPrompt`，以及 `buildAnnualInput/buildBatchInput/buildResultInput`、18 张黄金题纲 `getOutlineCard`。

API 端点（两个后端一致）：

- `POST /api/game/start` — 生成第 1 年卡牌。
- `POST /api/game/next` — 根据当前完整 `history` 逐年生成下一张卡牌。**index.html 主流程和 prompt-lab.html 都必须使用这条逐年机制**。
- `POST /api/game/batch` — 按 `startYear/count` 批量生成多张卡牌。仅作为兼容/实验接口保留，不能在主流程里替代逐年机制。
- `POST /api/game/result` — 18 年结束后生成结果页 JSON。

### 提示词调用机制一致性（必须遵守）

`index.html` 和 `prompt-lab.html` 是同一套提示词效果的生产入口与测试入口。凡是修改提示词调用机制时，必须同时检查并同步两边：

- 请求节奏：第 1 年走 `/api/game/start`，之后每次只生成 1 年，走 `/api/game/next`。
- 历史输入：每次 `/api/game/next` 都必须传入当前已选择的完整 `history`。
- 模型选择、降级策略、结果页调用和请求 payload 字段，不能只改一边。
- 如果未来要重新启用批量生成、预热、桥接题或本地固定题，必须让 `prompt-lab.html` 也能用同一机制复现实验；否则不要接入 `index.html` 主流程。

DeepSeek 调用细节：`response_format: json_object`、流式 SSE 解析、超时控制、失败重试一次（第二次降级为非流式）。两次都失败后**不报错**，而是回落到 `mockResponse` 并在返回中标记 `degraded: true`。返回内容经 `validateAnnual/validateBatch/validateResult` 校验并补默认值后才返回前端。

### 前端：单文件巨石

`index.html` 约 1.2 万行，HTML/CSS/JS 全部内联。游戏状态、牌堆缓存、翻牌交互、结果页渲染都在这一个文件里。修改时用 grep 定位函数，不要整文件读取。

### 关键陷阱：根目录与 public/ 是两份拷贝

本地开发服务读根目录的 `index.html` 和 `assets/`；Cloudflare 部署只发 `public/` 下的 `index.html` 和 `public/assets/`。两份文件**会发散**（当前已不一致）。改了根目录的前端文件后，部署前必须把变更同步到 `public/`，没有自动同步脚本。

### 内容协议（docs/）

`docs/story-state-card-protocol.md` 是核心协议，统一三层模型：

- 故事层 StoryState：18 张牌连续剧情、生活线/关系线双线交替推进、回响种子（callbackSeeds）、每个选项的隐藏 RIASEC 分值。
- 展示层 CardView：固定 UI 的字数预算，不爆框。
- 测量层 HollandScore：RIASEC 从选项的隐藏 `holland` 字段计分，不从表层文案反推。

改 prompt、卡牌字段或结果页结构前，先读该协议和 `docs/18-card-route-map.md`（整局节奏蓝图：主线交替、每 3 张一个小回合）。卡牌 JSON 结构见 `docs/story-state-card-schema.json`，18 张题纲见 `docs/18-card-golden-outline.json`（已编译进 `deepseek-prompt-vnext.js`）。

结果页字段以 `resultFields` 数组为准（server.js / worker.js 中各有一份）：`title, status42, majorCareerNote, careerPossibilities, famousScenes, timelineBlocks, choiceHabit, mentalPrep, letter18, shareHooks`。

### 视觉资产

`assets/` 下是卡片插画（人物剪影=半透明磨砂玻璃材质、3D 电影感、中国生活场景）。生图规范与验收流程见 `docs/visual-asset-generation-handoff.md`，分批生成、每 3 张一组确认，不要一次性出全部。`prompts/` 和 `tmp/imagegen` 是生图工作文件。
