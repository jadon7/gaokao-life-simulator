const outlineData = {
  acts: [
    {
      name: "第一幕：开局上桌",
      cards: [
        { year: 1, mainTrack: "life", phase: "开局上桌", comedyDevice: "被迫营业", riasecAxis: ["E", "C"], conflict: "新生群刚安静三分钟，室友就把你拉进第一个小项目。你要决定先上桌露脸，还是先把大学地图摸清。", sideBeat: "关系线核心角色第一次记住你在群里的反应", characters: ["室友/同伴", "辅导员/导师背景声", "关系线核心角色"], abType: "主动上桌 / 稳住边界", summaryTask: "", callbacks: ["新生群", "第一波活", "第一次被拉上桌"] },
        { year: 2, mainTrack: "life", phase: "开局上桌", comedyDevice: "领导一句自由发挥", riasecAxis: ["C", "I"], conflict: "展示材料临时失踪，群里全在发问号。你要决定先按流程救场，还是先查清到底谁动了文件。", sideBeat: "关系线核心角色开始顺手给你留座", characters: ["室友/同伴", "团队群像", "关系线核心角色"], abType: "先立边界 / 先查原因", summaryTask: "便签写上一年选择的直接余波 + 关系线一个小动作", callbacks: ["展示材料", "群里问号", "第一次补锅"] },
        { year: 3, mainTrack: "relationship", phase: "开局上桌", comedyDevice: "关系错位", riasecAxis: ["S", "I"], conflict: "对方发来合照和一句调侃，你想讲清逻辑，她像是在等态度。你要决定接住人，还是先把话说准确。", sideBeat: "现实线里老师或同学默认你能继续干活", characters: ["关系线核心角色", "室友/同伴"], abType: "顾人情 / 讲逻辑", summaryTask: "现实线同步推进，但不要抢走当前关系主线", callbacks: ["合照", "没发出的消息", "第一次误会"] }
      ]
    },
    {
      name: "第二幕：第一次上头",
      cards: [
        { year: 4, mainTrack: "life", phase: "第一次上头", comedyDevice: "群聊制造焦虑", riasecAxis: ["I", "E"], conflict: "考研群、保研绩点和校外项目同一天冒泡。你要决定先闭门深造，还是把项目机会继续做大。", sideBeat: "关系线核心角色看见你开始为长期路线做取舍", characters: ["学长/前辈", "导师/老师", "关系线核心角色"], abType: "考研深造 / 项目机会", summaryTask: "便签写上一年关系选择的余波 + 学业/项目线的小变化", callbacks: ["考研群", "保研绩点", "校外项目"] },
        { year: 5, mainTrack: "life", phase: "第一次上头", comedyDevice: "小事突然出圈", riasecAxis: ["A", "E"], conflict: "你随手做的展示被转发，合作方立刻追问能不能加速。你要决定放大声量，还是先把质量打磨住。", sideBeat: "关系线核心角色默默替你补漏或提醒你吃饭", characters: ["外部机会角色", "学长/前辈", "关系线核心角色"], abType: "做作品出圈 / 抢机会增长", summaryTask: "关系线只写一个具体动作，不要写成关心空话", callbacks: ["展示出圈", "合作方催更", "第一次被看见"] },
        { year: 6, mainTrack: "relationship", phase: "第一次上头", comedyDevice: "约饭撞车", riasecAxis: ["S", "C"], conflict: "约好的饭被临时工作撞掉，对方说没事，语气却像已读不回。你要决定先回应人，还是先把任务交稳。", sideBeat: "现实线里合作和课程一起向你收税", characters: ["关系线核心角色", "外部机会角色背景压力"], abType: "先接住人 / 先保交付", summaryTask: "现实线同步推进，写清哪件工作开始收账", callbacks: ["没吃成的饭", "已读不回", "第一次后撤"] }
      ]
    },
    {
      name: "第三幕：第一次付代价",
      cards: [
        { year: 7, mainTrack: "life", phase: "第一次付代价", comedyDevice: "两头夹击", riasecAxis: ["E", "C"], conflict: "导师点你上台，项目群同时爆雷。你要决定先保体面，还是今晚先救交付。", sideBeat: "关系线核心角色开始不再无条件等你", characters: ["导师/老师", "外部项目群", "关系线核心角色"], abType: "公开承担 / 交付优先", summaryTask: "便签写上一年工作撞饭的余波 + 关系线后撤", callbacks: ["导师点名", "项目群爆雷", "两头夹击"] },
        { year: 8, mainTrack: "relationship", phase: "第一次付代价", comedyDevice: "成年人沉默成本", riasecAxis: ["S", "E"], conflict: "对方问你最近是在忙，还是在躲。你要决定当面说清，还是继续用忙当挡箭牌。", sideBeat: "现实线里的项目和成绩没有因为谈关系暂停", characters: ["关系线核心角色"], abType: "当面回应 / 继续推进", summaryTask: "现实线只写一个具体压力，不要泛泛说项目继续推进", callbacks: ["那句你在躲吗", "第一次摊牌"] },
        { year: 9, mainTrack: "life", phase: "第一次付代价", comedyDevice: "低成本社死", riasecAxis: ["R", "S"], conflict: "一次失误被群聊截图放大，你再硬扛就要成表情包。你要决定自己修，还是拉人一起收拾。", sideBeat: "关系线核心角色重新判断你是可靠还是封闭", characters: ["室友/同伴", "团队群像", "关系线核心角色"], abType: "动手补锅 / 拉人协作", summaryTask: "关系线同步写一个判断变化", callbacks: ["群聊截图", "第一次翻车", "表情包危机"] }
      ]
    },
    {
      name: "第四幕：双线翻面",
      cards: [
        { year: 10, mainTrack: "relationship", phase: "双线翻面", comedyDevice: "态度上桌", riasecAxis: ["A", "S"], conflict: "一张合照被朋友起哄，含糊突然不够用了。你要决定公开表达，还是私下把话说稳。", sideBeat: "现实线传来新的平台或城市压力", characters: ["关系线核心角色", "朋友群像"], abType: "公开表达 / 私下处理", summaryTask: "现实线同步给一个具体外部压力", callbacks: ["合照起哄", "公开还是私下", "关系上桌"] },
        { year: 11, mainTrack: "life", phase: "双线翻面", comedyDevice: "体面和钱打架", riasecAxis: ["E", "I"], conflict: "一个新平台给你更大机会，家里却把稳定两个字发成连环消息。你要决定换挡，还是守住底盘。", sideBeat: "关系线核心角色开始进入你的长期规划或被挤到旁边", characters: ["家庭型角色", "外部机会角色", "关系线核心角色"], abType: "抢机会 / 算清账", summaryTask: "关系线写站位变化，不要只写关心", callbacks: ["连环消息", "换平台", "长期规划"] },
        { year: 12, mainTrack: "relationship", phase: "双线翻面", comedyDevice: "晚到引爆旧账", riasecAxis: ["C", "A"], conflict: "你迟到十分钟，对方翻出三个月旧账。你要决定先把责任理清，还是先把情绪接住。", sideBeat: "现实线里你的角色身份已经变重", characters: ["关系线核心角色", "群像环境压力"], abType: "按事理清 / 先给表达", summaryTask: "现实线同步写你的责任变重到哪一步", callbacks: ["迟到十分钟", "旧账翻出", "没解释清"] }
      ]
    },
    {
      name: "第五幕：压力做实，能力成型",
      cards: [
        { year: 13, mainTrack: "life", phase: "压力做实，能力成型", comedyDevice: "家庭会议开场", riasecAxis: ["S", "E"], conflict: "家里把你的选择开成小型董事会，每个人都爱你，也都想改你剧本。你要决定先安抚，还是自己拍板。", sideBeat: "关系线核心角色开始决定还要不要站在你旁边", characters: ["家庭型角色", "关系线核心角色"], abType: "照顾关系 / 主动拍板", summaryTask: "关系线写站不站在你旁边的具体动作", callbacks: ["家庭董事会", "改你剧本", "自己拍板"] },
        { year: 14, mainTrack: "life", phase: "压力做实，能力成型", comedyDevice: "稳定开始反噬", riasecAxis: ["I", "C"], conflict: "你投出去的东西没人回，只有学长指出描述太空。你要决定重写证据，还是继续用数量撞门。", sideBeat: "关系线核心角色第一次看见你的低谷", characters: ["学长/前辈", "关系线核心角色"], abType: "分析证据 / 继续流程", summaryTask: "关系线同步写看见低谷后的动作", callbacks: ["简历没人回", "描述太空", "低谷被看见"] },
        { year: 15, mainTrack: "relationship", phase: "压力做实，能力成型", comedyDevice: "成年人补考感情", riasecAxis: ["S", "C"], conflict: "对方不再问你忙不忙，只问这段关系有没有她的位置。你要决定拿出行动，还是先把现实排稳。", sideBeat: "现实线里你已经开始像真正的大人", characters: ["关系线核心角色"], abType: "给行动 / 排现实", summaryTask: "现实线同步写一个成年责任，不要空泛说成熟", callbacks: ["有没有她的位置", "关系补考", "成年责任"] }
      ]
    },
    {
      name: "第六幕：回收与落点",
      cards: [
        { year: 16, mainTrack: "life", phase: "回收与落点", comedyDevice: "你成了参考答案", riasecAxis: ["I", "S"], conflict: "有个年轻人拿着截图来问你怎么选，你突然发现自己也成了别人的参考答案。你要讲原则，还是讲代价。", sideBeat: "关系线进入最后结算前夜", characters: ["学弟/新人", "关系线核心角色"], abType: "讲清逻辑 / 接住人", summaryTask: "关系线只写最后结算前夜的一个具体信号", callbacks: ["别人来问路", "参考答案", "讲代价"] },
        { year: 17, mainTrack: "relationship", phase: "回收与落点", comedyDevice: "不能再模糊", riasecAxis: ["E", "A"], conflict: "关系线不能再靠默认续费。你要决定把话说出来，还是承认有些人只能陪你走到这里。", sideBeat: "生活线同步给出最后现实定位", characters: ["关系线核心角色"], abType: "说出来 / 体面告别", summaryTask: "生活线同步给出一个最终定位，不要铺新冲突", callbacks: ["默认续费", "体面告别", "最后表态"] },
        { year: 18, mainTrack: "life", phase: "回收与落点", comedyDevice: "给年轻人一句真话", riasecAxis: ["R", "A", "S", "E", "I", "C"], conflict: "最后一张牌不是问你成没成功，而是问你愿意把哪句真话留给十八岁的自己。你要讲体面路线，还是讲真实代价。", sideBeat: "关系线只收束，不再制造新误会", characters: ["家庭型角色", "导师/前辈", "关系线核心角色", "主角自己"], abType: "体面路线 / 真实代价", summaryTask: "不再铺新线，只给结果页做自然过渡", callbacks: ["开局身份", "第一次上桌", "关系线收束", "最后一句真话"] }
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
- 必须有短剧感：开场立刻出事故，第二句给反差、吐槽或代价。
- 每张牌只拍一个事故，不写一整年流水账。
- 必须有反转、代价、回收、人物关系变化和阶段性正向落点。
- 前面埋下的人、事、道具、承诺，后面必须至少回收 2-4 次。
- 不要写成鸡汤，不要写成普通人生建议。
- 行文要面向 18 岁用户：短、直、清楚、轻松、略带幽默。
- 不要写成文学散文，不要让人像在做阅读理解。
- 题目要像手机短剧分镜：3 秒入戏，4-6 行内看完，读完知道“谁、为什么、跟上一件事有什么关系”。

手机卡片预算：
- 这张牌会在手机卡片里渲染，不能靠用户读长文。
- scene.title 是图片标题，6-10 个汉字，像短剧集名。
- scene.body 建议 60-110 个汉字，最多 130 个汉字，2-3 句；必须交代人物身份、事件起因、和前一选择/副线的关系。
- scene.body 第一层讲清剧情，第二层给现实荒诞或网络梗式反差；不要为了短而让人看不懂。
- A/B 标题 3-5 个汉字，必须像按钮动作，不要像价值观口号。
- A/B desc 12-22 个汉字，写清动作和直接代价。
- A/B tag 2-4 个汉字，像弹幕梗或行为标签。
- consequence 16-36 个汉字，只写直接后果，能被下一张便签接住。
- summary 28-52 个汉字，写成“上一年后果 + 副线/另一线小动作”，要像便签回声，不能长篇复述。

短剧锚点规则：
- 每张牌必须至少带齐 4 个锚点：历史锚点、人物锚点、事故锚点、喜剧锚点。
- 历史锚点：让人知道这件事和上一年选择、上一张便签、或长期主线有什么联系。
- 人物锚点：关键角色第一次出现时必须写清身份，例如“隔壁班女生许闻笙”“室友周越”“导师林知夏”。
- 事故锚点：必须有一个具体麻烦、误会、催更、群聊、通知、饭局、展示、家里电话等可拍出来的事件。
- 喜剧锚点：喜剧感可以来自网络梗、群聊感、现实荒诞、反差、自嘲、弹幕感；不要恶趣味、羞辱、低俗或拿专业开涮。
- 不要求每张都有“可截图金句”，清楚和好笑优先于硬凹金句。

双线规则：
- 你必须始终同时维护两条线：
  - lifeTrack：学业、事业、家庭、朋友、健康、财务、居住等现实生活线
  - relationshipTrack：好感、暧昧、恋爱、错过、陪伴、搭子、支持系统等关系线
- scene 只拍一条主线。
- 副线不是装饰，是连续追剧感来源；但副线不能把题干写长。
- summary 只写上一年后果 + 另一条线的同步近况，必须像便签回声。
- 如果 scene 写生活线，summary 就推进关系线。
- 如果 scene 写关系线，summary 就推进生活线。
- 恋爱或亲密关系不能连续多年都作为主问题。
- 生活线也不能长期完全挤掉关系线。
- 副线出现位置优先级：summary / consequence > scene 第 2 或第 3 句 > 大节点正面上桌。
- 不要每年都写“关心你”，要写具体动作：留座、撤回、盯饭点、没回消息、把你排进周末、把话说开。

反空话规则：
- 每一句都尽量回答“谁、做了什么、造成了什么变化”。
- 能具体就不要概括，能点名就不要泛指，能写动作就不要写感受总结。
- 如果涉及已出场关键角色，优先直接写名字，不要用“有人”“某个人”。
- outlineCard.characters 里的“关系线核心角色/外部机会角色/家庭型角色”等是导演占位词，绝对不能原样输出。
- 如果没有具体名字，关系线核心角色默认写“许闻笙”，她是隔壁班女生，常在机房靠窗位自习，后来成为长期关系线核心角色；室友/同伴默认写“周越”，导师/老师默认写“林知夏”。
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
- A/B 必须是动作，不是抽象价值观。
- 不要写“选择长期主义/选择稳定路径”，要写“今晚救火/先冲展示/当面说清/重写证据”。
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
- consequence 长度 16-36 个汉字，1 句，必须能单独成立。
- consequence 要像下一张便签正文，不要像总结报告。
- 可见文案必须和隐藏 riasec 一致，不能出现“文案像 C，计分却给 E”这种割裂。

霍兰德规则：
- 不要从文案里解释霍兰德。
- 不要输出“你就是某种人格”。
- riasec 只作为隐藏字段输出。
- 必须优先遵守 outlineCard.riasecAxis。
- A/B 的 riasec 要围绕 riasecAxis 拉开差异，不要每题都写成 C/E 稳定题。
- C 不是“成熟”的默认答案；稳定、谨慎、流程只能在确实对应时给 C。
- 如果 outlineCard.riasecAxis 有两个类型，A/B 的主分必须分别落在这两个类型上。
- 如果是综合终局，可以让前三名来自 history，但不能凭空重置人格。

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
- summary：28-52 个汉字，1-2 句；必须具体，不要空话
- lifeTrack：16-26 个汉字
- relationshipTrack：16-26 个汉字
- scene.title：6-10 个汉字
- scene.body：60-110 个汉字，最多 130 个汉字，2-3 句；必须写清人物身份、事件起因、前后联系和喜剧反差
- a.title / b.title：3-5 个汉字
- a.desc / b.desc：12-22 个汉字
- a.tag / b.tag：2-4 个汉字
- a.consequence / b.consequence：16-36 个汉字
- callbacks：0-3 条，每条 4-12 个汉字

便签规则：
- summary 是下一张牌右上角便签的正文，必须短。
- summary 只能写：上一年后果 + 另一条线同步近况。
- 如果 history 里有上一题的 consequence，summary 第一分句优先继承并自然改写它，不要另起炉灶写空泛概括
- summary 不要重复 scene 的人物、地点、冲突和关键词
- summary 如果涉及关键角色，优先直接写名字
- summary 不要超过两个逗号，不要堆三层因果。
- summary 不要写“有人开始关心你”，要写具体动作。
- 如果副线信息会让 scene.body 超过 130 字，必须放弃写进 scene.body，改写到 summary 或 consequence。

短剧与喜剧规则：
- scene.body 必须至少带齐：历史锚点、人物锚点、事故锚点、喜剧锚点。
- 第一次写关系线角色时，必须用“隔壁班女生许闻笙”或同等清楚的身份标注；后续可以只写“许闻笙”。
- 喜剧感优先来自网络梗、群聊感、现实荒诞、反差、自嘲、弹幕感；不要求每张都有可截图金句。
- 不要为了搞笑牺牲剧情清楚度，不要恶趣味、羞辱、低俗或拿专业开涮。

结构规则：
- mainTrack 只能是 life 或 relationship
- scene 只拍一条主线
- scene.title / scene.body 不能复用 history.recentSceneTitles 里的事件，也不能把旧冲突换同义词再讲一遍
- 不要连续使用同一组人物关系、地点和抉择结构；如果上一题是“搭子/朋友离开”，本题必须换成完全不同的压力源
- A/B 必须属于两种不同的人生打法
- 如果两个选项的 riasec 差异不明显，这一题不合格
- A/B 的 consequence 也必须明显不同，不能只是同一句换说法
- 必须使用 outlineCard.comedyDevice 的喜剧机制。
- 必须使用 outlineCard.sideBeat 维护副线，但不要把副线塞成长题干。

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
- 每张卡都必须遵守手机卡片预算：scene.body 60-110 字、最多 130 字，选项短，summary 短。
- 每张卡都必须使用对应 outlineCard 的 comedyDevice、sideBeat、riasecAxis。
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
- title 总长度 14-21 个汉字，最多 24 个汉字；宁可短，不要解释。
- 三段各 4-7 个汉字；第三段必须是短职业身份，不要写“某某方向的人”。
- title 只写称号，不要塞入 status42 的人生总结，不要出现冒号、括号、分号。
- 用中文逗号分成 3 段，三段分别对应：
  1. 精神/情商状态：来自情商、人文、抗压、人际关系、中年危机处理方式。
  2. 物质/现实处境：来自商业、技术、行业周期、收入稳定性、生活代价。
  3. 专业衍生职业：必须结合初始专业和长期选择收敛，落到具体职业出口。
- title 至少包含一个专业相关出口，不能只写抽象人格词。
- 有戏剧冲突：好笑但不空，扎心但不冒犯，底层承载专业信息和人生取舍。
- 三秒能理解，朋友能在评论区接话。
- 禁止包含排名、贬损、疾病化判断、对真实专业的绝对化评价。
- 示例风格：嘴硬心软，存款能打，架构师
- 示例风格：桃李满袋，腰椎抗议，明星教师
- 示例风格：方案八版，还能笑，IP 主理人
- 示例风格：精神富足，钱包薄，新闻人
- 示例风格：秩序嘴硬，项目上桌，生物 PM

18 年后状态规则：
- status42 不是流水账，不要写“你走了18年，从A到B”。
- status42 是 18 年后职业和人生状态的一句补充，像“墓志铭，但人还在且嘴还挺硬”。
- 必须从 18 张牌里提纯 1-2 个高光时刻或代价，写出有好有坏的当前状态。
- 24-36 个汉字，1 句，必须幽默、具体、有反差，但不必硬凑金句。
- 不要重复 title 里的职业身份；优先写“高光 + 代价 + 关系余味”里的 2 个点。
- 示例风格：靠几次救场混成靠谱大人，手机一响还是心慌

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
    storyCast: {
      relationName: "许闻笙",
      relationGender: "女生",
      relationIntro: "隔壁班女生，常在机房靠窗位自习，后来成了长期关系线核心角色",
      roommateName: "周越",
      mentorName: "林知夏",
      externalName: "合作方",
      familyName: "家里"
    },
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
    storyCast: {
      relationName: "许闻笙",
      relationGender: "女生",
      relationIntro: "隔壁班女生，常在机房靠窗位自习，后来成了长期关系线核心角色",
      roommateName: "周越",
      mentorName: "林知夏",
      externalName: "合作方",
      familyName: "家里"
    },
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
        comedyDevice: card.comedyDevice,
        riasecAxis: card.riasecAxis,
        conflict: card.conflict,
        sideBeat: card.sideBeat,
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
    storyCast: {
      relationName: "许闻笙",
      relationGender: "女生",
      relationIntro: "隔壁班女生，常在机房靠窗位自习，后来成了长期关系线核心角色",
      roommateName: "周越",
      mentorName: "林知夏",
      externalName: "合作方",
      familyName: "家里"
    },
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
