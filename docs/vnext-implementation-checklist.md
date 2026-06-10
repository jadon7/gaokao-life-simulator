# vNext 落地清单

这份清单只服务一个目标：

把当前项目从“旧卡片协议 + 文案反推霍兰德”迁移到：

- `StoryStateCard`
- 隐藏 `riasec`
- 双线强制切镜头
- 18 张连续短剧

## 一、迁移原则

1. 不一次性推翻现有 UI
2. 先兼容接收新协议，再逐步删旧逻辑
3. 先验证 6 张实验幕，再切整局

## 二、后端

### 阶段 1：新增 vNext 输出能力

- [ ] 在 [worker.js](/Users/meet/CodexWork/gaokao-life-simulator-deepseek/worker.js) 增加 `StoryStateCard` 校验
- [ ] 在 [server.js](/Users/meet/CodexWork/gaokao-life-simulator-deepseek/server.js) 增加同构校验
- [ ] 新增 `vnext=1` 或 `schema=vnext` 的请求开关
- [ ] 保留旧协议，避免当前页面立刻失效

### 阶段 2：实验幕接口

- [ ] 新增一个只用于试播的接口，例如 `POST /api/game/pilot`
- [ ] 支持直接返回 [pilot-arc-6-cards.sample.json](./pilot-arc-6-cards.sample.json) 作为 mock
- [ ] 支持之后切到真实 DeepSeek 输出

### 阶段 3：结果页分工调整

- [ ] 结果页接口不再要求模型输出霍兰德代码
- [ ] 模型只返回剧情总结块
- [ ] 霍兰德字母和百分比由前端聚合隐藏 `riasec`

## 三、前端

### 阶段 1：兼容新字段

- [ ] 在 [index.html](/Users/meet/CodexWork/gaokao-life-simulator-deepseek/index.html) 里增加 `StoryStateCard` 解析器
- [ ] `scene.title` 对应当前卡片主标题
- [ ] `scene.body` 对应当前卡片正文
- [ ] `summary` 对应当前便利贴
- [ ] `a.title/desc/tag`、`b.title/desc/tag` 对应左右选项

### 阶段 2：保留旧 UI 壳，换新数据源

- [ ] 不先大改版式
- [ ] 先确保新协议内容能完整显示
- [ ] 先以“可读、不卡、无重复”为目标

### 阶段 3：删除旧兼容逻辑

- [ ] 删除从 `scene` 字符串里拆 `事件/情境` 的旧逻辑
- [ ] 删除用 `question` 字段做年数展示的依赖
- [ ] 删除靠旧 `summary/context/prompt` 兜底的多层 fallback

## 四、霍兰德

### 阶段 1：双轨并行

- [ ] 暂时保留旧霍兰德计算函数
- [ ] 新增只吃 `riasec` 的新聚合函数
- [ ] 在调试模式下同时打印新旧结果做对比

### 阶段 2：切主逻辑

- [ ] 结果页只使用隐藏 `riasec` 聚合
- [ ] 删除“左偏 C / 右偏 E”的位置偏置
- [ ] 删除从选项文案关键词反推 RIASEC 的主逻辑

### 阶段 3：结果文案降判决感

- [ ] 结果页避免“你就是 XX”
- [ ] 改成“这局更偏向……”
- [ ] 让霍兰德卡更像“观察结果”，不是“人生判决书”

## 五、内容验证

### 先验收 6 张实验幕

- [ ] 第 2 张前关系线开始可感知
- [ ] 第 3 张关系线第一次当主问题
- [ ] 第 6 张出现第一次轻失去
- [ ] 每张 `summary` 和 `scene` 不重复
- [ ] 不同路径的前三个霍兰德字母能拉开

### 再扩到 18 张整局

- [ ] 1-3 张完成入场
- [ ] 4-6 张完成第一次上头
- [ ] 7-9 张开始付代价
- [ ] 10-12 张主副线换镜头
- [ ] 13-15 张回收前期种子
- [ ] 16-18 张形成正向落点

## 六、建议执行顺序

推荐顺序：

1. 接入 `pilot-arc-6-cards.sample.json`
2. 前端跑通 6 张实验幕 UI
3. 霍兰德只吃隐藏 `riasec`
4. 再把 `worker.js / server.js` 切到真实 vNext prompt
5. 最后扩到完整 18 张
