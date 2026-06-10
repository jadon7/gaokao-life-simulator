const outlineData = {
  acts: [
    {
      name: "第一幕：开局被动入场",
      cards: [
        { year: 1, mainTrack: "life", phase: "开局被动入场", conflict: "新生群刚建，室友已经把你拉进一个面向高考生的小工具项目。你还没适应大学节奏，就得决定大学开局是先冲还是先稳。", characters: ["室友/同伴", "导师背景声"], abType: "先做自己 / 先顾期待", summaryTask: "", callbacks: ["新生群", "小工具项目", "室友第一次拉你上桌"] },
        { year: 2, mainTrack: "life", phase: "开局被动入场", conflict: "项目资料临时出事故，展示前关键文件不见了。你得决定是先现场补锅，还是先把问题源头查清。", characters: ["室友/同伴", "团队群像"], abType: "先动手补 / 先分析清", summaryTask: "有人开始记住你是会不会兜底的人；关系线第一次种下有人在注意你", callbacks: ["硬盘事故", "第一次社死"] },
        { year: 3, mainTrack: "relationship", phase: "开局被动入场", conflict: "一次活动后，对方发来合照和一句轻轻的调侃。你明知道只是回句话，却开始犹豫：是顺势往前一点，还是先守住边界。", characters: ["关系线核心角色"], abType: "先公开表达 / 先私下处理", summaryTask: "现实线同步推进：老师或同学开始默认你能干活", callbacks: ["合照", "没发出去的消息"] }
      ]
    },
    {
      name: "第二幕：第一次上头",
      cards: [
        { year: 4, mainTrack: "life", phase: "第一次上头", conflict: "学长看中你们的小工具，想直接带你去参加校外比赛，还暗示后面可能接上创业园资源。你得决定要不要先抢机会。", characters: ["学长/前辈", "室友/同伴"], abType: "抢机会 / 守底盘", summaryTask: "关系线推进：你们之间的客气感开始变少", callbacks: ["校外比赛", "创业园机会"] },
        { year: 5, mainTrack: "life", phase: "第一次上头", conflict: "路演公开高光后，合作方追着要更快交付。你第一次发现被看见并不只是爽，还会立刻带来新的压力。", characters: ["外部机会角色", "学长/前辈"], abType: "先赌增长 / 先控风险", summaryTask: "关系线推进：有人在默默替你补漏、替你留位置", callbacks: ["路演高光", "第一次被夸懂用户"] },
        { year: 6, mainTrack: "relationship", phase: "第一次上头", conflict: "一顿本来约好的饭因为你的临时工作撞掉了。对方嘴上说没事，但你能感觉到这次真的有一点后撤。", characters: ["关系线核心角色", "外部机会角色背景压力"], abType: "先回应人 / 先完成事", summaryTask: "现实线推进：合作和课程已经一起开始向你收税", callbacks: ["没吃成的饭", "撤回过的消息"] }
      ]
    },
    {
      name: "第三幕：第一次付代价",
      cards: [
        { year: 7, mainTrack: "life", phase: "第一次付代价", conflict: "导师把学院里最难的一段展示压给你，而外部项目也卡在交付前夜。你必须选一边先保，另一边一定会出问题。", characters: ["导师/老师", "外部机会角色"], abType: "先保体面 / 先保结果", summaryTask: "关系线推进：有人开始不再无条件等你", callbacks: ["老师默认你能兜底", "之前答应过的事开始撞车"] },
        { year: 8, mainTrack: "relationship", phase: "第一次付代价", conflict: "对方终于认真问你一句：你最近到底是在忙，还是在躲？你知道这不是撒个娇就能过去的那种问题。", characters: ["关系线核心角色"], abType: "先回应人 / 先完成事", summaryTask: "现实线推进：项目、成绩或工作并没有因为你处理关系而暂停", callbacks: ["那句你最近到底怎么了"] },
        { year: 9, mainTrack: "life", phase: "第一次付代价", conflict: "一场失误眼看要被放大。你可以继续自己扛，也可以第一次主动把别人叫进来一起收拾残局。", characters: ["室友/同伴", "团队群像"], abType: "先独自扛 / 先拉人一起", summaryTask: "关系线推进：对方开始重新判断你到底是可靠还是封闭", callbacks: ["第一次翻车事故的回响"] }
      ]
    },
    {
      name: "第四幕：双线翻面",
      cards: [
        { year: 10, mainTrack: "relationship", phase: "双线翻面", conflict: "你们的关系来到一个很现实的岔路：要不要把态度摆到台面上。继续含糊是安全的，但也是在继续消耗。", characters: ["关系线核心角色"], abType: "先公开表达 / 先私下处理", summaryTask: "现实线推进：生活线传来新的稳定机会或现实压力", callbacks: ["合照", "撤回过的消息", "没吃成的饭"] },
        { year: 11, mainTrack: "life", phase: "双线翻面", conflict: "你面前出现一个更大的现实岔路：换城市、换赛道、换平台，或者继续守住现在已经搭起来的一切。", characters: ["家庭型角色", "外部机会角色"], abType: "抢机会 / 守底盘", summaryTask: "关系线推进：你和那个人的站位开始发生变化", callbacks: ["家里最开始说过的话", "前辈给过的机会"] },
        { year: 12, mainTrack: "relationship", phase: "双线翻面", conflict: "一次误会或一次晚到，把很多没说透的东西同时翻了出来。你可以先守住体面，也可以先把结果救回来。", characters: ["关系线核心角色", "群像环境压力"], abType: "先保体面 / 先保结果", summaryTask: "现实线推进：你手里的角色身份已经和以前不一样了", callbacks: ["那次没解释清的事"] }
      ]
    },
    {
      name: "第五幕：压力做实，能力成型",
      cards: [
        { year: 13, mainTrack: "life", phase: "压力做实，能力成型", conflict: "一个更大但也更贵的机会摆在你面前：继续放大，可能彻底改写路线；先控风险，至少能保住现在的一切。", characters: ["外部机会角色", "家庭型角色"], abType: "先赌增长 / 先控风险", summaryTask: "关系线推进：某个人开始决定自己还要不要继续站在你旁边", callbacks: ["第一次外部认可的回收"] },
        { year: 14, mainTrack: "life", phase: "压力做实，能力成型", conflict: "你发现自己已经不是不会做事，而是太习惯自己扛了。问题是，这次再独自扛，可能真的会把自己压坏。", characters: ["室友/同伴", "家庭型角色", "团队群像"], abType: "先独自扛 / 先拉人一起", summaryTask: "关系线推进：有人第一次看见你的极限或脆弱", callbacks: ["最开始你总能兜底的形象被反向照见"] },
        { year: 15, mainTrack: "relationship", phase: "压力做实，能力成型", conflict: "这次已经不是有空再说能混过去的阶段。你要决定，关系和现实之间，自己到底准备拿出多大的真诚和行动。", characters: ["关系线核心角色"], abType: "先回应人 / 先完成事", summaryTask: "现实线推进：你已经开始像一个真正的大人，而不是那个嘴硬的新生", callbacks: ["前面所有关系线小细节集中回收一次"] }
      ]
    },
    {
      name: "第六幕：回收与落点",
      cards: [
        { year: 16, mainTrack: "life", phase: "回收与落点", conflict: "一个最终成型机会出现：你可以用成熟后的新方式再赌一次，也可以用长出来的边界感重新定义成功。", characters: ["前辈/导师/外部机会角色"], abType: "重用前面最代表你的一类对立", summaryTask: "关系线进入最后结算前夜", callbacks: ["第一次抢机会/守底盘的终极回响"] },
        { year: 17, mainTrack: "relationship", phase: "回收与落点", conflict: "关系线给出最终姿态。不是一定在一起，而是不能再模糊。你要决定这一次是把话说出来，还是承认有些人真的只能陪你走到这里。", characters: ["关系线核心角色"], abType: "先公开表达 / 先私下处理 或 先回应人 / 先完成事", summaryTask: "生活线同步给出最后的现实定位", callbacks: ["所有关系线callback回收"] },
        { year: 18, mainTrack: "life", phase: "回收与落点", conflict: "最后一次选择不是决定你会不会成功，而是决定你会成为什么样的大人。你要继续按别人熟悉的路线走，还是按自己已经长出来的方式去活。", characters: ["家庭型角色", "导师/前辈", "主角自己"], abType: "先做自己 / 先顾期待 的终局版 或 抢机会 / 守底盘 的终局版", summaryTask: "不再铺新线，只为结果页做自然过渡", callbacks: ["开局身份", "家里说过的话", "第一次被推上场", "第一次错过与第一次高光"] }
      ]
    }
  ]
};

export const vNextSystemPrompt = `你是一个互动剧情游戏的结构化内容引擎，负责生成“18 张牌的人生短剧”。

重要定位：
- 这是虚构互动故事，不是真实人生预测，不是心理诊断，不是升学就业建议。
- 玩家是刚结束高考、准备进入大学或选择专业方向的年轻人。
- 18 张牌的首要目标是：好看、好选、好截图、好传播。
- 霍兰德结果只是从 18 次选择里观察出的兴趣倾向侧写，不是严格人格测验。

你的唯一任务：
- 根据系统给出的玩家信息、剧情骨架、历史选择和当前年份，输出结构化卡牌或结构化结果页。
- 你的输出必须可以被产品直接渲染。

长期叙事规则：
- 18 张牌不是 18 个独立问题，而是 18 集连续短剧。
- 必须有反转、代价、回收、人物关系变化和阶段性正向落点。
- 前面埋下的人、事、道具、承诺，后面必须至少回收 2-4 次。
- 不要写成鸡汤，不要写成普通人生建议。
- 行文要面向 18 岁用户：短、直、清楚、轻松、略带幽默。
- 不要写成文学散文，不要让人像在做阅读理解。

双线规则：
- 你必须始终同时维护两条线：
  - lifeTrack：学业、事业、家庭、朋友、健康、财务、居住等现实生活线
  - relationshipTrack：好感、暧昧、恋爱、错过、陪伴、搭子、支持系统等关系线
- scene 只拍一条主线。
- summary 只写上一年后果 + 另一条线的同步近况。
- 如果 scene 写生活线，summary 就推进关系线。
- 如果 scene 写关系线，summary 就推进生活线。
- 恋爱或亲密关系不能连续多年都作为主问题。
- 生活线也不能长期完全挤掉关系线。

反空话规则：
- 每一句都尽量回答“谁、做了什么、造成了什么变化”。
- 能具体就不要概括，能点名就不要泛指，能写动作就不要写感受总结。
- 如果涉及已出场关键角色，优先直接写名字，不要用“有人”“某个人”。
- 如果没有足够新的剧情信息，宁可更短，不要拿空话补满字数。
- 禁止写这类空话：
  - “有人开始关心你的饭点和心情”
  - “你把事情往前推进了一步”
  - “新的机会和压力一起冒了出来”
  - “局面变了，旁边的人和节奏也跟着动了”
  - “留下了后果”

选项规则：
- A/B 必须方向明确，像玩家真的可以立刻选。
- 不能都像温和协商。
- A/B 可以稍长，但更长必须承担更多判断信息。
- 每个选项至少要让人看出以下 4 层中的 3 层：
  - 先保什么
  - 准备怎么做
  - 愿意冒什么风险
  - 从什么角度在判断局势
- 每个选项除了展示文案，还必须带一个隐藏 riasec 对象。
- 每个选项还必须带一个隐藏 consequence 字段。
- consequence 代表“如果玩家选了这个选项，下一张牌便签最该继承的直接后果”。
- consequence 必须具体写出后果，优先包含人物名、动作、结果变化。
- consequence 不能复述选项原文，不要写“你选择了……”。
- consequence 长度 18-34 个汉字，1-2 句，必须能单独成立。
- 可见文案必须和隐藏 riasec 一致，不能出现“文案像 C，计分却给 E”这种割裂。

霍兰德规则：
- 不要从文案里解释霍兰德。
- 不要输出“你就是某种人格”。
- riasec 只作为隐藏字段输出。

输出纪律：
- 只输出 JSON。
- 不要输出 Markdown。
- 不要输出代码块。
- 不要输出解释。
- 不要增加未要求字段。`;

export const vNextAnnualTaskPrompt = `请根据以下输入，生成 1 张 StoryStateCard。

你必须严格遵守：
- 只输出 1 个 JSON 对象
- 字段必须完全符合约定
- 只输出要求字段，不要输出任何解释

硬性字数规则：
- summary：34-48 个汉字，1-2 句；必须具体，不要空话
- lifeTrack：20-32 个汉字
- relationshipTrack：20-32 个汉字
- scene.title：10-16 个汉字
- scene.body：54-72 个汉字，2 句短句；每句都要提供新信息
- a.title / b.title：4-8 个汉字
- a.desc / b.desc：16-24 个汉字
- a.tag / b.tag：2-4 个汉字
- a.consequence / b.consequence：24-36 个汉字
- callbacks：0-3 条，每条 4-12 个汉字

便签规则：
- summary 只能写：上一年后果 + 另一条线同步近况
- 如果 history 里有上一题的 consequence，summary 第一分句优先继承并自然改写它，不要另起炉灶写空泛概括
- summary 不要重复 scene 的人物、地点、冲突和关键词
- summary 如果涉及关键角色，优先直接写名字

结构规则：
- mainTrack 只能是 life 或 relationship
- scene 只拍一条主线
- scene.title / scene.body 不能复用 history.recentSceneTitles 里的事件，也不能把旧冲突换同义词再讲一遍
- 不要连续使用同一组人物关系、地点和抉择结构；如果上一题是“搭子/朋友离开”，本题必须换成完全不同的压力源
- A/B 必须属于两种不同的人生打法
- 如果两个选项的 riasec 差异不明显，这一题不合格
- A/B 的 consequence 也必须明显不同，不能只是同一句换说法

输入数据：
{{INPUT_JSON}}

输出字段：
{
  "year": 0,
  "phase": "",
  "mainTrack": "",
  "lifeTrack": "",
  "relationshipTrack": "",
  "summary": "",
  "scene": {
    "title": "",
    "body": ""
  },
  "a": {
    "title": "",
    "desc": "",
    "tag": "",
    "consequence": "",
    "riasec": { "R": 0, "I": 0, "A": 0, "S": 0, "E": 0, "C": 0 }
  },
  "b": {
    "title": "",
    "desc": "",
    "tag": "",
    "consequence": "",
    "riasec": { "R": 0, "I": 0, "A": 0, "S": 0, "E": 0, "C": 0 }
  },
  "callbacks": []
}`;

export const vNextBatchTaskPrompt = `请根据以下输入，连续生成 {{count}} 张 StoryStateCard。

你必须严格遵守：
- 只输出一个 JSON 对象
- 顶层只能有 cards
- cards 数量必须等于 {{count}}
- 每张卡必须符合 StoryStateCard 结构
- 后续年份逐年递增

特别规则：
- 这些卡片用于预生成，所以你不能假设未来玩家一定会选 A 或 B。
- 未发生年份的 summary 只能写“当前趋势 + 另一条线同步近况”，不能写死未来具体后果。
- 未发生年份可以埋人物、关系、压力和冲突，但不能把未来选择写成既成事实。
- 本批次内每张 scene.title / scene.body 必须讲不同事件；不得复用 history.recentSceneTitles 或本批次前面已经写过的事件。
- 不要连续使用同一组人物关系、地点和抉择结构；相邻卡的压力源必须明显不同。
- 不要写空话，不要拿总结腔凑句子。
- 每张卡的 a.consequence / b.consequence 仍然必须填写，因为它们描述的是“如果玩家此刻选了这项，下一张牌便签要继承的直接后果”。
- batch 输出质量必须和单张 annual 输出一致，不能因为预生成就省略 phase、lifeTrack、relationshipTrack、callbacks、consequence。

输入数据：
{{INPUT_JSON}}

输出字段：
{
  "cards": [
    {
      "year": 0,
      "phase": "",
      "mainTrack": "",
      "lifeTrack": "",
      "relationshipTrack": "",
      "summary": "",
      "scene": {
        "title": "",
        "body": ""
      },
      "a": {
        "title": "",
        "desc": "",
        "tag": "",
        "consequence": "",
        "riasec": { "R": 0, "I": 0, "A": 0, "S": 0, "E": 0, "C": 0 }
      },
      "b": {
        "title": "",
        "desc": "",
        "tag": "",
        "consequence": "",
        "riasec": { "R": 0, "I": 0, "A": 0, "S": 0, "E": 0, "C": 0 }
      },
      "callbacks": []
    }
  ]
}`;

export const vNextResultTaskPrompt = `请根据以下输入，生成这局 18 张牌结束后的结果页 JSON。

你必须严格遵守：
- 只输出 1 个 JSON 对象
- 不要输出解释
- 不要输出 Markdown
- 标题必须直接是内容总结，不要输出空标题词

风格要求：
- 面向 18 岁用户
- 大白话
- 轻松、顺口、略带幽默
- 有一点戏剧余韵
- 不装腔，不下判决

结尾页标题规则：
- title 必须是“三段式人生标签”，生成可传播、可截图、可评论接梗的人生称号。
- 固定结构：精神/情商状态 + 物质/现实处境 + 专业衍生职业。
- title 总长度 18-26 个汉字，最多 30 个汉字；宁可短，不要解释。
- 三段各 5-9 个汉字；第三段必须是短职业身份，不要写“某某方向的人”。
- title 只写称号，不要塞入 status42 的人生总结，不要出现冒号、括号、分号。
- 用中文逗号分成 3 段，三段分别对应：
  1. 精神/情商状态：来自情商、人文、抗压、人际关系、中年危机处理方式。
  2. 物质/现实处境：来自商业、技术、行业周期、收入稳定性、生活代价。
  3. 专业衍生职业：必须结合初始专业和长期选择收敛，落到具体职业出口。
- title 至少包含一个专业相关出口，不能只写抽象人格词。
- 有戏剧冲突：好笑但不空，扎心但不冒犯，底层承载专业信息和人生取舍。
- 三秒能理解，朋友能在评论区接话。
- 禁止包含排名、贬损、疾病化判断、对真实专业的绝对化评价。
- 示例风格：嘴硬心软，存款能打，资深架构师
- 示例风格：桃李满袋，腰椎抗议，明星教师
- 示例风格：方案八版，还能微笑，IP 主理人
- 示例风格：精神富足，钱包很薄，新闻理想家

18 年后状态规则：
- status42 不是流水账，不要写“你走了18年，从A到B”。
- status42 是 18 年后职业和人生状态的一句定语，像“墓志铭，但人还在且嘴还挺硬”。
- 必须从 18 张牌里提纯 1-2 个高光时刻或代价，写出有好有坏的当前状态。
- 32-48 个汉字，1 句，必须幽默、具体、可截图。
- 示例风格：靠几次救场混成了靠谱大人，代价是手机静音也会心虚

反空话要求：
- 每一块都要尽量提供具体信息
- famousScenes 不能只是情绪总结，要像能截图的具体片段
- timelineBlocks 不能只写“你成长了”，要写清这一路是怎么拐过来的

输入数据：
{{INPUT_JSON}}

输出字段：
{
  "title": "",
  "status42": "",
  "majorCareerNote": "",
  "careerPossibilities": [
    { "percent": 0, "label": "" },
    { "percent": 0, "label": "" },
    { "percent": 0, "label": "" }
  ],
  "famousScenes": [
    { "title": "", "body": "" },
    { "title": "", "body": "" },
    { "title": "", "body": "" }
  ],
  "timelineBlocks": [
    { "title": "", "body": "" },
    { "title": "", "body": "" },
    { "title": "", "body": "" }
  ],
  "choiceHabit": { "title": "", "body": "" },
  "mentalPrep": { "title": "", "body": "" },
  "letter18": { "title": "", "body": "" },
  "shareHooks": ["", ""]
}`;

const outlineCards = outlineData.acts.flatMap(act => act.cards.map(card => ({
  act: act.name,
  ...card
})));

function shortText(value, limit = 80) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, limit);
}

function normalizeChoiceHistoryItem(item) {
  return {
    year: Number(item?.year || 0) || 0,
    phase: shortText(item?.phase, 24),
    mainTrack: shortText(item?.mainTrack, 18),
    sceneTitle: shortText(item?.sceneTitle || item?.scene, 28),
    summary: shortText(item?.summary, 48),
    choiceTag: shortText(item?.tag || item?.choice, 18),
    choiceText: shortText(item?.choiceText, 40),
    consequence: shortText(item?.consequence, 40),
    lifeTrack: shortText(item?.lifeTrack, 42),
    relationshipTrack: shortText(item?.relationshipTrack, 42),
    callbackSeeds: Array.isArray(item?.callbackSeeds) ? item.callbackSeeds.map(seed => shortText(seed, 16)).filter(Boolean).slice(0, 3) : []
  };
}

function getRecentCallbacks(history = [], limit = 5) {
  const seen = new Set();
  const out = [];
  [...history].reverse().forEach(item => {
    const seeds = Array.isArray(item?.callbackSeeds) ? item.callbackSeeds : [];
    seeds.forEach(seed => {
      const value = shortText(seed, 16);
      if (!value || seen.has(value) || out.length >= limit) return;
      seen.add(value);
      out.push(value);
    });
  });
  return out;
}

function getRecentSceneTitles(history = [], limit = 8) {
  const seen = new Set();
  const out = [];
  [...history].reverse().forEach(item => {
    const value = shortText(item?.sceneTitle || item?.scene, 18);
    if (!value || seen.has(value) || out.length >= limit) return;
    seen.add(value);
    out.push(value);
  });
  return out;
}

function describeTrack(history = [], key, fallback) {
  const latest = [...history].reverse().map(item => shortText(item?.[key], 42)).find(Boolean);
  return latest || fallback;
}

function topHollandCode(history = []) {
  const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  history.forEach(item => {
    const holland = item?.holland || {};
    Object.keys(scores).forEach(key => {
      scores[key] += Number(holland[key] || 0);
    });
  });
  return Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([key]) => key).join("") || "ICE";
}

function dominantTheme(history = []) {
  const texts = history.map(item => `${item?.sceneTitle || ""} ${item?.choiceTag || item?.choice || ""} ${item?.choiceText || ""}`).join(" ");
  if (/抢|冲|主动|公开|扩大|争取/.test(texts)) return "先推局面，再学会处理代价";
  if (/稳|守|确认|边界|止损|谨慎/.test(texts)) return "先守住底盘，再找更大的出手机会";
  if (/沟通|陪伴|一起|接住|安抚/.test(texts)) return "先把人接住，再把事情往前推";
  return "一路修正，一路把自己长出来";
}

export function getOutlineCard(year) {
  return outlineCards.find(card => Number(card.year) === Number(year)) || null;
}

export function buildAnnualInput({ profile, history, year, totalGameYears = 18 }) {
  const outlineCard = getOutlineCard(year);
  return {
    profile,
    gameMeta: {
      totalYears: totalGameYears,
      currentYear: year
    },
    outlineCard,
    history: history.slice(-6).map(normalizeChoiceHistoryItem),
    stateHints: {
      recentCallbacks: getRecentCallbacks(history),
      recentSceneTitles: getRecentSceneTitles(history),
      relationshipStatus: describeTrack(history, "relationshipTrack", "关系线刚起步，还在试探和靠近之间"),
      lifeStatus: describeTrack(history, "lifeTrack", "生活线刚开局，节奏还没完全站稳")
    }
  };
}

export function buildBatchInput({ profile, history, startYear, count, totalGameYears = 18 }) {
  return {
    profile,
    gameMeta: {
      totalYears: totalGameYears,
      startYear,
      batchCount: count
    },
    outlineCards: outlineCards
      .filter(card => card.year >= startYear && card.year < startYear + count)
      .map(card => ({
        year: card.year,
        phase: card.phase,
        mainTrack: card.mainTrack,
        conflict: card.conflict,
        characters: card.characters,
        abType: card.abType,
        summaryTask: card.summaryTask,
        callbacks: card.callbacks
      })),
    history: history.slice(-6).map(normalizeChoiceHistoryItem),
    stateHints: {
      recentCallbacks: getRecentCallbacks(history),
      recentSceneTitles: getRecentSceneTitles(history),
      relationshipStatus: describeTrack(history, "relationshipTrack", "关系线在背景里持续推进"),
      lifeStatus: describeTrack(history, "lifeTrack", "现实线在连续推进"),
      batchMode: "prefetch"
    }
  };
}

export function buildResultInput({ profile, history, totalGameYears = 18, finalResultAge = 36 }) {
  return {
    profile,
    gameMeta: {
      totalYears: totalGameYears,
      resultAge: finalResultAge
    },
    history: history.slice(-totalGameYears).map(normalizeChoiceHistoryItem),
    hollandSummary: {
      code: topHollandCode(history),
      scores: history.reduce((acc, item) => {
        const holland = item?.holland || {};
        Object.keys(acc).forEach(key => {
          acc[key] += Number(holland[key] || 0);
        });
        return acc;
      }, { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 })
    },
    resultHints: {
      topCallbacks: getRecentCallbacks(history, 4),
      dominantTheme: dominantTheme(history),
      titleFormulaHints: {
        emotionalState: "从 history 的关系处理、抗压、人际沟通、最高/最低 RIASEC 项里提炼",
        realityState: "从商业机会、行业周期、稳定性、收入与生活代价里提炼",
        careerOutlet: "必须由 profile.major / profile.majorLabel 和 history 的长期选择收敛出具体职业"
      }
    }
  };
}
