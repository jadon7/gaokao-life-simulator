# 年度 user prompt 原始可读版

## 口径

- 来源：`deepseek-prompt-vnext.js` 里的 `vNextAnnualTaskPrompt`、`annualTaskPromptForYear(year, history)`、`getOutlineCard(year)`。
- 正式游戏第 1 年不走年度 user prompt；第 1 年由 `/api/game/start` 调用 `opening-cards-data.js` 的预置开局卡。
- 第 2-18 年走年度 user prompt；服务端会把 `{{INPUT_JSON}}` 替换成 `buildAnnualInput(...)` 生成的运行时 JSON。
- 下面保留原始 prompt 句子，不做摘要改写；为了可读，末尾 JSON 输出字段块不展开。
- 没有具体玩家 profile/history 时，不存在唯一的完整原始 user prompt；专业、历史选择、伴侣称呼、孩子分支都会进入运行时输入。

## 年度 user prompt 公共原文

```text
生成 1 张 StoryStateCard，只输出 1 个 JSON 对象。

长度：
- summary 20-42 字；lifeTrack 12-22 字；relationshipTrack 14-30 字，格式“阶段：具体信号”。
- scene.body 约 50-70 字，三句以内。
- A/B label 8-16 字，tag 2-4 字，consequence 12-28 字。
- 可见文案：常见口语、专业词少、无生僻简称、无强行缩写。

剧情：
- 使用 outlineCard 的 conflict/hook/twist/choiceContrast/sideBeat/comedyDevice/riasecAxis/pressureMode/reliefSignal。
- pressureMode=relief 时：第一句给明确好结果；选项只承接收获，如继续/休整、放大/打磨、稳定/边界。
- 有 stateHints.reliefMode 时，scene 第一落点写被认可、关系稳定、做成事、收到感谢、获得技能或发现喜欢方向。
【第 1 年才会插入：- 使用 stateHints.openingFrame，和 profile.major 明确联动。正式游戏第 1 年不走这里。第 2-18 年为空。】
- 按 stateHints.timeFrame / careerRoute 判断阶段；题面不写当前年份、当前年龄。
- 按 stateHints.routeState 承接选择惯性。
- 按 stateHints.majorAnchor / stateHints.currentIncident 落专业语境。
- 有 stateHints.currentIncident 时，scene.body 以它为本年事件。
- lifeTrack 写本年新状态。
- relationshipTrack 只写背景信号；除 mainTrack=relationship 外，不把伴侣写成冲突中心。
- mainTrack=relationship 时写共同生活选择，不写男女对立或伴侣拖事业后腿。
- 有 stateHints.relationshipPressure 时，只写在 relationshipTrack 或 summary，不进入 scene.body/A/B/consequence。
- relationshipTrack 阶段使用 stateHints.relationshipStage，并写 stateHints.relationshipBeat 的信号。
- 新恋情阶段只在关系主线写 stateHints.newRelation，不生成姓名。
- stateHints.childRoute=未选择生小孩 时，只写是否进入育儿线；=已选择生小孩 时，才写孩子生病/照护/教育。
- 有 stateHints.closingFrame 时，scene.body 按它收尾，不开新事件。
- 阶段约束：【见下方每年原文】
- 题面只写事件；scene.body/A/B/consequence 不写当前年份、当前年龄。
- 每年是一年后的新大事，不写上一年同一事件续集。
- scene.body 只写本年新事件，不把上一年消息、电话、邀约写成下集。
- scene.body 只出现本卡主事件的关键角色；非关键角色放 relationshipTrack 或 summary。
- 只有固定伴侣有姓名；有 stateHints.castIntroRule 时，scene/relationshipTrack 首次写伴侣用完整称呼；其他角色只用关系称呼。
- 有 stateHints.year2RelationEntry 时，题面和 relationshipTrack 必须出现该称呼。
- summary 写上一年余波；scene.body 写本年事件。
- stateHints.lastYear / history / repeatGuard 只用于 summary 和避重，不进入 scene.body/A/B。
- relationshipTrack 换具体信号。
- 不复用 stateHints.recentSceneTitles / recentIncidents / usedIncidents；相邻卡换压力源和人物关系。
- 不写 stateHints.recentSceneObjects 里的道具。
- 有 stateHints.choiceBalance 时，A/B 按它分属两端。
- A/B 只处理 scene.body 的当前事件，不引入新场景、新邀约或非关键角色。
- A/B 只用 label 写具体动作，不写类型名；A 对 outlineCard.riasecAxis[0]，B 对 outlineCard.riasecAxis[1]；两个选项必须排他。

输入数据：
【运行时 JSON：profile、storyCast、gameMeta、outlineCard、history、stateHints。固定 outlineCard 原文见下方；profile/history/stateHints 会随玩家和选择变化。】

输出字段：
【JSON 输出字段格式要求已省略。】
```

## 每年阶段约束原文

| 年份 | 阶段约束原文 |
| --- | --- |
| 第 1 年 | 正式流程不走年度 user prompt；走预置开局卡。 |
| 第 2 年 | 阶段约束：校园开放日：把专业小事讲给高中生听懂；伴侣作为第一年有过相处的人在场。 |
| 第 3 年 | 阶段约束：异地表态：实习和城市机会第一次分岔。 |
| 第 4 年 | 阶段约束：毕业分流：考研、项目、实习二选一。 |
| 第 4 年，分数低于 300 | 阶段约束：就业分流：只写实习、校园招聘、第一份工作三类选择。 |
| 第 5 年 | 阶段约束：项目跑通：做成一件小事，被看见。 |
| 第 5 年，读研分支 | 阶段约束：读研开局：导师、课题和同门分工成为主压力。 |
| 第 6 年 | 阶段约束：生活落地：学生身份转向工作身份。 |
| 第 6 年，读研分支 | 阶段约束：课题推进：论文、实验/作品和实习预备同时挤压。 |
| 第 7 年 | 阶段约束：职场入口：转正、客户和收入第一次压身。 |
| 第 7 年，读研分支 | 阶段约束：毕业分流：毕业论文、校招/读博和城市落点一起拍板。 |
| 第 8 年 | 阶段约束：关系稳定：不用救火的共同日常。 |
| 第 8 年，读研分支 | 阶段约束：研究生毕业第一站：入职、读博或规培落点定下来。 |
| 第 9 年 | 阶段约束：口碑危机：一次职业失误影响后续机会。 |
| 第 10 年 | 阶段约束：首付换城：钱、城市和长期关系一起落地。 |
| 第 11 年 | 阶段约束：技能成型：被正式邀请，不是被催救火。 |
| 第 12 年 | 阶段约束：搬家截稿：家庭任务和工作节点撞上。 |
| 第 13 年 | 阶段约束：收到感谢：成年责任里有正反馈。 |
| 第 14 年 | 阶段约束：低谷验账：升职落空、项目被砍或客户撤单。 |
| 第 15 年 | 阶段约束：家庭责任：是否进入育儿线、照护或房贷重新排位。 |
| 第 16 年 | 阶段约束：早年回援：前文人物带回帮助。 |
| 第 17 年 | 阶段约束：责任结算：养老、共同事业，或已选育儿线后的教育问题给出答案。 |
| 第 18 年 | 阶段约束：回顾收尾：回收开局、关键选择、职业代价和关系结果；像最后一张牌，不开新坑。 |

## 每年固定 outlineCard 原文

这些内容会进入运行时 `input.outlineCard`，也是 DeepSeek user prompt 的一部分。下面保留代码里的原句。

### 第 2 年

- mainTrack：life
- phase：开局上桌
- comedyDevice：第一次被认可
- pressureMode：relief
- reliefSignal：第一次被认可
- riasecAxis：R / I
- conflict：校园开放日，你把专业体验摊上的小任务讲清楚，来参观的高中生真的听懂了，老师也当场夸你。第一年有过相处的同学也在现场，你要把讲法整理成入门小教程，还是先一起休息复盘。
- sideBeat：关系线核心角色确认自己和你有了稳定默契
- choiceContrast：做成教程 / 休息复盘
- callbacks：校园开放日、高中生听懂、第一次被看见

### 第 3 年

- mainTrack：relationship
- phase：关系定调
- comedyDevice：异地表态
- riasecAxis：S / I
- conflict：暑期实习名单出来，本地项目和外地平台第一次同时招手，你们也第一次认真谈异地。你要把异地节奏说清，还是先把实习窗口拿下。
- sideBeat：关系第一次从顺手帮忙变成异地约定
- choiceContrast：说清异地 / 拿下窗口
- callbacks：暑期实习、异地约定、第一次表态

### 第 4 年

- mainTrack：life
- phase：第一次上头
- comedyDevice：群聊制造焦虑
- riasecAxis：I / E
- conflict：考研群、保研绩点和校外项目同一天冒泡。你第一次认真面对要不要考研：锁定备考窗口就退出项目，抢项目机会就放弃今年完整备考。
- sideBeat：你开始为长期路线做取舍
- choiceContrast：锁定考研窗口 / 放弃备考抢项目
- callbacks：考研群、保研绩点、校外项目

### 第 4 年，分数低于 300 分支

- mainTrack：life
- phase：就业分流
- comedyDevice：提前就业
- riasecAxis：E / C
- conflict：实习面试、校园招聘群和第一份工作机会同时摆上桌。你要先争取能入职的岗位，还是先把简历和投递节奏排稳。
- sideBeat：你开始把现实路线从校园转向就业
- choiceContrast：争取入职机会 / 排稳投递节奏
- callbacks：实习面试、校园招聘群、第一份工作

### 第 5 年

- mainTrack：life
- phase：第一次上头
- comedyDevice：项目跑通
- pressureMode：relief
- reliefSignal：做成小项目
- riasecAxis：A / C
- conflict：毕业前的小作品/项目真的跑通了，还被外部机会转发。你要把这次成果讲出去，还是先收住节奏把质量打磨稳。
- sideBeat：你第一次尝到做成一件事的踏实感
- choiceContrast：讲出成果 / 打磨质量
- callbacks：项目跑通、外部转发、毕业后第一关

### 第 6 年

- mainTrack：life
- phase：第一次上头
- comedyDevice：租房合约见真章
- riasecAxis：S / R
- conflict：租房合同、通勤成本和试用期考核同一天摆上桌。你要先把生活底盘理顺，还是先保住眼前工作。
- sideBeat：现实状态里工作身份第一次压过学生身份
- choiceContrast：理顺生活 / 先保工作
- callbacks：租房合同、试用期考核、生活底盘

### 第 7 年

- mainTrack：life
- phase：第一次付代价
- comedyDevice：两头夹击
- riasecAxis：E / R
- conflict：主管让你在客户会上解释方案，交付材料同时出错。你要决定先公开承担，还是今晚动手补救。
- sideBeat：朋友开始发现你习惯一个人硬扛
- choiceContrast：公开承担 / 动手补救
- callbacks：客户会点名、交付材料出错、两头夹击

### 第 8 年

- mainTrack：relationship
- phase：第一次付代价
- comedyDevice：稳定周末
- pressureMode：relief
- reliefSignal：关系变稳定
- riasecAxis：S / C
- conflict：转正答辩结束，你们终于有一个不用救火的周末，城市续约也有了初步答案。你要把共同生活排进日常，还是先把各自节奏说清。
- sideBeat：关系稳定感第一次超过误会感
- choiceContrast：排进日常 / 说清节奏
- callbacks：稳定周末、城市续约、共同日常

### 第 9 年

- mainTrack：life
- phase：第一次付代价
- comedyDevice：低成本社死
- riasecAxis：R / S
- conflict：一次交付失误被客户群截图放大，你再硬扛就要影响口碑。你要决定自己修，还是拉人一起收拾。
- sideBeat：身边人重新判断你是可靠还是封闭
- choiceContrast：动手补锅 / 拉人协作
- callbacks：群聊截图、第一次翻车、口碑危机

### 第 10 年

- mainTrack：relationship
- phase：长期承诺
- comedyDevice：首付和城市二选一
- riasecAxis：A / C
- conflict：首付预算、换城市机会和双方家里意见同时压来。你要把未来落到钱和城市上，还是先把生活边界说清。
- sideBeat：生活选择开始和职业选择绑定
- choiceContrast：落钱落城市 / 先定边界
- callbacks：首付预算、换城市、长期落点

### 第 11 年

- mainTrack：life
- phase：双线翻面
- comedyDevice：技能成型
- pressureMode：relief
- reliefSignal：获得新技能
- riasecAxis：E / I
- conflict：你靠前几年的交付长出一项新技能，新平台不是催你救火，而是正式邀请你试一段。你要接下试跑窗口，还是先算清条件再换挡。
- sideBeat：能力第一次变成可谈的筹码
- choiceContrast：接试跑窗口 / 算清条件
- callbacks：新技能、试跑邀请、能力筹码

### 第 12 年

- mainTrack：life
- phase：双线翻面
- comedyDevice：搬家和截稿撞车
- riasecAxis：C / A
- conflict：搬家、家里临时任务或正式退场撞上项目截稿。你要共同承担现实责任，还是把边界摊开。
- sideBeat：现实状态里你的角色身份已经变重
- choiceContrast：共同承担 / 摊开边界
- callbacks：搬家任务、项目截稿、现实责任

### 第 13 年

- mainTrack：life
- phase：压力做实，能力成型
- comedyDevice：收到感谢
- pressureMode：relief
- reliefSignal：收到感谢
- riasecAxis：S / C
- conflict：一次家里或照护安排被你处理顺了，家人第一次认真说谢谢。你要把陪伴时间补回来，还是趁状态好把责任分工写清。
- sideBeat：身边人看到你不是只会硬扛
- choiceContrast：补回陪伴 / 写清分工
- callbacks：收到感谢、陪伴补回、责任分摊

### 第 14 年

- mainTrack：life
- phase：压力做实，能力成型
- comedyDevice：职业低谷验账
- riasecAxis：I / R
- conflict：升职没轮到你、项目被砍或客户撤单，体面第一次明显掉价。你要重写证据争下一轮，还是动手做出新筹码。
- sideBeat：朋友第一次看见你的职业低谷
- choiceContrast：重写证据 / 做新筹码
- callbacks：升职落空、项目被砍、低谷被看见

### 第 15 年

- mainTrack：relationship
- phase：压力做实，能力成型
- comedyDevice：成年责任上桌
- riasecAxis：S / C
- conflict：父母照护、房贷或未来几年生活安排摆到桌面。你要和伴侣把要不要生小孩说清，还是先把现有现实排稳。
- sideBeat：是否进入育儿线由本卡选择决定
- choiceContrast：说清育儿计划 / 先稳现有生活
- callbacks：育儿选择、照护分工、成年责任

### 第 16 年

- mainTrack：life
- phase：回收与落点
- comedyDevice：早年回援
- pressureMode：relief
- reliefSignal：前几年的人回来帮忙
- riasecAxis：I / A
- conflict：前几年一起扛过事的人回来帮你牵线，团队扩张不再只靠你单打独斗。你要拆清合作账本，还是把这段经历讲成能拉人的故事。
- sideBeat：早年种下的人情第一次正向回援
- choiceContrast：拆清账本 / 讲成故事
- callbacks：早年回援、团队扩张、合伙账本

### 第 17 年

- mainTrack：life
- phase：回收与落点
- comedyDevice：长期责任结算
- riasecAxis：E / A
- conflict：父母养老或共同事业把长期责任推到最后一张账单。你要争取继续同队，还是承认各自路线更好。
- sideBeat：现实状态同步给出最后现实定位
- choiceContrast：争取同队 / 各自路线
- callbacks：长期责任、各自路线、最后表态

### 第 18 年

- mainTrack：life
- phase：回收与落点
- comedyDevice：最终落点拍板
- pressureMode：relief
- reliefSignal：发现真正喜欢什么
- riasecAxis：R / A
- conflict：最后不是写金句，而是发现你更愿意过哪种未来五年：扩张团队、回到稳定组织，或给家庭留出位置。你要摊开真实账本，还是体面收住。
- sideBeat：人际关系只收束，不再制造新误会
- choiceContrast：摊开账本 / 体面收住
- callbacks：最终落点、未来五年、关系收束

## 运行时 JSON 里会动态改变的内容

这些不是固定年度原文，但会进入同一条 user message：

- profile：玩家姓名、性别、省份、分数、目标、专业、开局关系角色。
- storyCast：关系主线才带固定伴侣姓名和完整称呼；没有固定姓名时不生成新姓名。
- history：之前每年卡片的 scene、sceneBody、summary、choiceText、consequence、relationshipTrack 等。
- stateHints.timeFrame：阶段判断，不直接写进题面。
- stateHints.routeState：根据历史选择生成的路线惯性。
- stateHints.relationshipStage / relationshipBeat：关系阶段和本年关系信号。
- stateHints.majorAnchor / currentIncident：按专业和年份生成的专业事件。
- stateHints.childRoute：是否已选择进入育儿线。
- stateHints.newRelation：只在关系主线的新恋情阶段写入。
- stateHints.reliefMode：正反馈年份写入“正反馈：...”。
- stateHints.closingFrame：第 18 年收尾框架。
- stateHints.recentSceneTitles / recentIncidents / usedIncidents / recentSceneObjects：防重复约束。
