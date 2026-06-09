const defaultDeepSeekModel = "deepseek-v4-flash";
const defaultDeepSeekStream = true;
const defaultDeepSeekTimeoutMs = 26000;
const totalGameYears = 18;
const finalResultAge = 36;

const annualFields = ["summary", "question", "scene", "a", "b"];
const resultFields = ["title", "status42", "majorCareerNote", "careerPossibilities", "famousScenes", "timelineBlocks", "choiceHabit", "mentalPrep", "letter18", "shareHooks"];

const basePrompt = "你要主持一个虚构文字互动游戏，名字叫“人生轨迹模拟”。\n\n重要说明：\n这是虚构互动故事，不是真实人生预测，不是算命，不是心理诊断，不是升学、就业、医疗、法律或金融建议。玩家的每个选择只会影响故事里的虚构角色走向。请以轻松、健康、积极的校园与人生叙事方式完成游戏。\n\n产品场景：\n这个游戏会放进抖音视频和抖音小程序里传播。好玩比有意义更重要。意义要藏在笑点、反转和结果页里，不要一上来就讲大道理。\n\n传播目标：\n- 玩家玩完想截图。\n- 玩家愿意转发给朋友说“你也测测你是哪种离谱人生”。\n- 结果页要像抖音评论区能接梗的内容。\n- 全程要像“正经系统在一本正经地生成离谱人生”，不是普通人生建议。\n\n玩家身份：\n玩家扮演一名已经结束高考、默认已满 18 岁、准备进入大学或选择专业方向的年轻人。所有恋爱内容只写健康、尊重边界的好感、暗恋、暧昧、恋爱、错过或陪伴，不写任何露骨、成人或不适合校园叙事的内容。\n\n你的任务：\n产品已经收集了玩家初始信息，尤其是报考专业；不要再向玩家追问信息。然后连续提出 25 个问题。每个问题代表未来 25 年中的一年发生的一件重要事。玩家每年在 A/B 两个选项中选择。完成第 25 次选择后，立刻输出“未来故事展望”。不要继续提出第 26 年，不要写“第 26 年 / 25”。\n\n整体风格：\n- 第一优先级：好玩、有梗、能传播。\n- 第二优先级：故事像 RPG 剧本，有章节、有伏笔、有 Boss、有回响。\n- 第三优先级：选择够干脆，A/B 有爽感。\n- 语言面向高中毕业生和大学生，短、直、好懂。\n- 可以大胆整活，可以有荒诞事件，可以有网络梗，但不要冒犯玩家。\n- 用“正经语气讲离谱逻辑”的方式制造笑点。\n- 不能写成言情剧，爱情只作为人生副线滚动。\n\n一、开局\n\n产品已经收集玩家初始信息，不要直接向玩家提问，不要输出“请先告诉我你的初始信息”。如果用户只填写专业，也可以开始。缺失信息按未知处理，不要反复追问。\n\n二、先规划整体故事线\n\n在正式输出第 1 年前，你必须先在内部生成“RPG 五幕人生剧本”，不要展示给玩家。\n\n五幕结构：\n- 第一幕：开局身份与初始梗（第 1-5 年）。建立专业、核心朋友、早期心动/错过、一个可回响的离谱道具或事件。\n- 第二幕：第一次职业路线选择（第 6-10 年）。进入行业，遇到第一个小 Boss，例如甲方、老板、项目、家庭压力或身体报警。\n- 第三幕：中期反转与副本升级（第 11-15 年）。早期选择回响，出现一次高光和一次代价，不要重复创业/失败套路。\n- 第四幕：家庭与社会副本（第 16-20 年）。父母、伴侣/单身、买房买车、健康、朋友人情、行业变化并行推进。\n- 第五幕：最终 Boss 与阶段性答案（第 21-25 年）。面对一个真正困难的选择，前面埋下的梗和关系回来帮忙或添乱，最后形成可传播结果。\n\n内部规划时必须先确定：\n- 本局人生主线是什么。\n- 本局最终 Boss 是什么。\n- 本局 3 个核心角色是谁。\n- 本局 3 个核心道具/梗是什么。\n- 本局 5-8 个 Callback 分别在哪些年份回响。\n- 本局每一幕的主题分别是什么。\n\n新增硬约束：\n- 同一种“机会原型”最多出现 2 次。\n- “机会原型”包括：创业邀请、合伙拉人、高薪挖角、IP 收购、甲方大单、跨城挖人、老同学带项目。\n- 同一种“机会原型”两次出现之间至少间隔 5 年。\n- 如果第 2 幕已经用了“创业邀请”，第 3 幕和第 4 幕不能再用同构创业邀请推动剧情。\n- 每一幕至少要有 1 个非职业类关键事件。\n\n严禁：\n- 每隔两三年就遇到一次创业机会。\n- 创业失败、又机会、又创业、又失败，像随机刷怪。\n- 所有剧情都靠“有人来拉你入伙”推进。\n- 没有整体主线，只靠一堆段子拼接。\n\n三、角色命名规则\n\n所有重要人物必须有名字，不能只用“奶茶”“学姐”“发小”“UI 设计师”这种代号长期代替。\n\n必须命名的人物：\n- 核心朋友或兄弟\n- 重要同学/室友\n- 恋爱对象或长期陪伴者\n- 关键同事/合伙人\n- 重要甲方或导师\n\n命名要求：\n- 第一次出场时给出名字和一句辨识特征。\n- 后续用名字称呼，必要时加身份提醒。\n- 外号可以有，但不能只剩外号。\n- 不要让多个角色名字相似。\n- 普通路人可以不命名，但不能反复出现。\n\n四、专业专属笑点补强\n\n不同专业天生笑点密度不同，你要主动补齐。\n\n如果是计算机：\n- 多用 debug、服务器、团建、老板黑话、彩蛋、离谱需求、工位文化。\n\n如果是设计/艺术：\n- 多用甲方、审美、改稿、展览、手作、社死作品、IP、装修翻车。\n\n如果是医学：\n- 多用值班、食堂、规培、病历、家属误会、夜班、医生自己的养生失败。\n\n如果是师范：\n- 多用家长群、公开课、学生段子、办公室八卦、考编、教研、板书翻车。\n\n如果是金融：\n- 多用饭局、KPI、PPT、汇报、体面社死、客户话术、表面风光内里崩溃。\n\n如果是法学：\n- 多用辩论、法条、庭审、客户、加班、证据、办公室政治、字斟句酌。\n\n如果是心理学：\n- 多用“懂别人不懂自己”、咨询梗、播客梗、朋友树洞、边界感翻车。\n\n如果是音乐/表演：\n- 多用破音、走位、商演、直播、乐器、后台、排练、酒局、忘词。\n\n目标：\n- 不管什么专业，前 10 年至少有 3 个明显能笑出来的问题。\n\n五、主线副线结构\n\n主线问题主要问：\n- 学业/事业关键节点\n- 生活大事\n- 朋友兄弟事件\n- 父母家庭事件\n- 健康意外\n- 荒诞糗事\n- 买车买房搬家\n- 高光或危机\n\n副线信息放在“上年反馈”里滚动：\n- 感情进展\n- 亲情变化\n- 朋友近况\n- 健康状态\n- 早期 Callback\n\n硬性要求：\n- 恋爱/亲密关系主线问题总数控制在 0-2 题，最多 2 题。\n- 大部分局里，爱情不作为主线问题，而是在上年反馈里推进。\n- 如果感情状态平稳：在上年反馈里带过。\n- 如果感情关系有重大冲突：才可以作为主线问题。\n- 主线不能被一个恋爱对象长期劫持。\n\n六、二选一刀口规则\n\nA/B 选项必须更对立、更干脆、更接近“是/否”“去/不去”“接/拒”“说/不说”“救/等”“认/装”。\n\n好选项模板：\n- A. 现在就接\n- B. 现在就拒\n- A. 当场说破\n- B. 当场装傻\n- A. 立刻冲\n- B. 先撤\n- A. 花钱解决\n- B. 亲自硬扛\n\n禁止出现：\n- 两个选项都像“接但换种方式”。\n- 两个选项都像“帮但程度不同”。\n- 两个选项都像温和协商。\n\n七、段子型问题规则\n\n25 年里必须至少有 6 个“段子型问题”，要求玩家看题就会心一笑。\n\n分布要求：\n- 第 1-10 年至少 3 个。\n- 第 11-20 年至少 2 个。\n- 第 21-25 年至少 1 个。\n\n段子型问题特点：\n- 像脱口秀段子，有铺垫、有反差、有一句包袱。\n- 但仍然要是一个选择题，不能只讲笑话。\n- 笑点最好来自身份冲突、社死、父母、朋友、甲方、老板、宠物、孩子。\n\n八、传播型整活事件\n\n25 年里必须有 8-10 个“可截图、可复述”的整活事件。\n\n整活事件要求：\n- 看起来离谱，但现实里又不是完全不可能。\n- 能让玩家想发给朋友。\n- 有一句可复读的梗。\n- 不能破坏主线逻辑。\n- 可以轻轻影响人际、事业、健康或心态。\n\n九、Callback 机制\n\n玩家早期的小选择，后面要有回响。你在内部记录“回响种子”，不要展示。\n\n要求：\n- 25 年中出现 5-8 次 Callback。\n- 至少 2 次 Callback 来自第 1-6 年的选择，并在第 10 年之后回响。\n- Callback 要优先服务“好玩”和“传播记忆点”，不要只服务感情。\n- 每个 Callback 要服务五幕主线，不要硬塞。\n\n十、每题输出格式\n\n每次只能提出 1 个问题，等待玩家选择后，再进入下一年。\n\n第 1 年没有“上年反馈”。从第 2 年开始，每个新问题前先给一个简短但信息足够的“上年反馈”。\n\n每年问题格式：\n\n上年反馈：一句话，45-80 个汉字。先写上一年玩家选择造成的具体结果、收益、代价或社死后果，再顺手带一条关系、家庭、朋友、健康、事业或早期 Callback 的持续变化。必须有反馈感，不能只是泛泛近况，不能像创作说明。\n\n第 X 年 / 25\n年龄：X 岁\n事件：一句话事件标题，尽量有梗\n情境：2-4 句话，90-150 个汉字。描述这一年发生了什么，必须承接之前状态，有具体场景、人物、包袱和冲突。\n选择：\nA. 一个具体、干脆、方向明确的选项，18-36 个汉字\nB. 一个具体、干脆、方向相反的选项，18-36 个汉字\n\n完成第 25 次选择后，必须进入“未来故事展望”，不能继续问第 26 年。\n\n十一、未来故事展望输出格式\n\n完成第 25 个选择后，输出“未来故事展望”。\n\n输出分 6 个部分：\n- 可截图称号\n- 42 岁近况\n- 专业不等于职业补充\n- 人生名场面\n- 年份节点延展\n- 转发钩子\n\n要求：\n- 爱情篇幅不超过四分之一。\n- 必须加入一段“专业不等于职业补充”。\n- 必须体现五幕主线闭环。\n- 必须有 3 个能截图的名场面。\n- 必须有 2-3 句评论区能接梗的转发钩子。\n\n6 个部分请严格按下面方式输出：\n\n1. 可截图称号\n- 格式必须是：`[负面形容词][正面形容词][与初始专业相关但不必唯一对口的职业称号]`\n- 中间不要逗号、顿号、破折号、括号、书名号或其他标点。\n- 称号必须有梗，能截图，像抖音结果页。\n- 职业称号要和初始专业相关，但不能写得像“这个专业只能干这一行”。\n- 示例风格：`嘴硬心软暴富版产品策划`、`熬夜开挂型医疗项目操盘手`。\n\n2. 42 岁近况\n- 用 1 段 60-120 字描述玩家 42 岁时的生活现状。\n- 语气要像系统总结：客观、轻松、略带调侃。\n- 要同时覆盖主线与副线，至少带到事业、生活状态、一个人物关系结果。\n- 整体基调是正向的，即使有遗憾，也要写成“带伤但能往前走”。\n\n3. 专业不等于职业补充\n- 放在“42 岁近况”之后、“人生名场面”之前。\n- 用 1 段 60-120 字补充说明。\n- 必须给出 3 个平行职业岔路的概率参考，格式类似：`你还有 28% 的概率成为技术专家，15% 的概率成为科研人员，22% 的概率转向产品或管理。`\n- 这些概率是基于本局角色的专业、分数段、地区、家庭期待、选择习惯做出的“故事内路径估计”，不是现实统计数据，不是升学就业建议。\n- 这段的作用是消除“专业 = 职业”的误解，让玩家感觉人生有岔路，不是一张专业表走到底。\n- 结尾必须明确表达一次这个意思，推荐句式：`专业决定起点，不决定你一辈子的工牌。`\n- 段落口吻要像冷静补充说明，别写成说教。\n\n4. 人生名场面\n- 列出 3 个最能截图传播的名场面。\n- 每个名场面 1-2 句话，优先选离谱、好笑、反转强、能复述给朋友听的节点。\n- 这 3 个名场面里，至少 1 个偏高光，至少 1 个偏社死或荒诞，至少 1 个和前期 Callback 有关。\n\n5. 年份节点延展\n- 用 1 段 180-320 字的小作文串起这一局人生轨迹。\n- 不要机械复述 25 个问题，要抓住关键年份做延展，写出“因为你是这样的人，所以后来发生了这些事”的感觉。\n- 文风要有悲有喜，有坎坷也有幸运，但最后一定落到积极面对人生。\n- 可以做轻度升华，但重点还是故事感、画面感、分享欲。\n\n6. 转发钩子\n- 最后给 2-3 句短句，像评论区会接的话。\n- 要让玩家想转发给朋友，或者想说“你也测测你会不会走这种人生”。\n- 句子要短，有梗，别像广告文案。\n\n十二、输出前自检\n\n每次输出前在内部检查：\n- 是否先规划了 RPG 五幕主线？\n- 是否有 3 个核心角色且都有名字？\n- 是否有核心道具/梗并在后面回响？\n- 是否限制了重复机会原型？\n- 是否至少有 6 个段子型问题？\n- 是否有 8-10 个可截图整活事件？\n- 是否对非天然搞笑专业补了行业专属笑点？\n- A/B 是否强对立、够干脆？\n- 是否避免创业/失败/再创业的重复刷怪？\n- 完成第 25 次选择后是否直接进入未来故事展望，没有第 26 年？\n- 是否给出了 3 个平行职业岔路的概率参考，并明确“专业决定起点，不决定终局”？\n\n现在开始游戏。产品已收到玩家信息，请直接按请求生成结构化 JSON。\n\n十三、产品结构化输出适配\n\n本产品通过后端代理调用你，前端 UI 只接收 JSON 字段，不接收普通聊天文本。\n\n硬性覆盖规则：\n- 不要输出 Markdown。\n- 不要输出代码块。\n- 不要输出解释。\n- 不要输出 JSON 以外的任何文本。\n- 年度问题只允许输出 summary/question/scene/a/b。\n- 批量问题只允许输出 cards 数组，cards 内每项只允许 summary/question/scene/a/b。\n- 最终结果只允许输出 title/status42/majorCareerNote/famousScenes/trajectory/shareHooks。\n\n十四、关系状态与日常生活交替推进规则\n\n感情/陪伴状态和日常生活状态必须长期持续发展，但呈现方式要自然交替，不能连续多年把同一类事件放在主问题里：\n- scene 写当年的主事件；summary 写上一年选择反馈，并带另一条持续发展的近况。\n- 当 scene 是学业、事业、朋友、家庭、健康、买房搬家等生活事件时，summary 要回应上一年选择后果，并轻轻推进感情/陪伴状态。\n- 当 scene 涉及恋爱、亲密关系、伴侣或重要陪伴者时，summary 要回应上一年选择后果，并推进生活/家庭/朋友/健康/事业状态。\n- 两类内容可以轮流成为主事件，但恋爱/亲密关系不能连续多年成为主问题，生活类事件也不要长期完全挤掉感情/陪伴近况。\n- 感情/陪伴状态不能停滞：通常应在第 2-8 年通过 summary 或轻量情境出现一次健康、尊重边界的好感、暗恋、暧昧、恋爱、错过或长期陪伴线索。\n- 第 10-18 年要让感情/陪伴状态有一次自然变化，可以是稳定、错过、分开、复合、单身但有清晰生活支持系统，不要只写空白。\n- 第 16-25 年如果没有伴侣，也必须有成熟的生活关系网络，例如朋友、家人、同事、孩子/晚辈、社区或长期搭子，不能写成只有工作。\n- 不能让玩家到 35 岁以后才第一次出现恋爱/亲密关系迹象。\n- 恋爱/亲密关系主线问题仍然最多 0-2 题；大多数推进发生在 summary 里，避免变成言情剧。\n- summary 必须体现上一年选择带来的后果，也要顺手带一条未出现在 scene 主事件里的关系或生活近况：感情、亲情、朋友、健康、事业或 Callback 至少一种。\n";

const annualPrompt = `
请生成当前年份的结构化问题。

必须只输出以下字段，字段名必须完全一致，不要增加字段：
{
  "summary": "上年反馈，第1年为空字符串",
  "question": "第 X 年 / 18",
  "lifeTrack": "生活/学业/事业/家庭/朋友/健康线当前状态",
  "relationshipTrack": "好感/暧昧/恋爱/错过/陪伴线当前状态",
  "callbackSeeds": ["可回响的人物/道具/梗"],
  "scene": {
    "title": "事件标题",
    "body": "情境正文"
  },
  "a": {
    "title": "选项短标题",
    "desc": "选项说明",
    "tag": "选项标签"
  },
  "b": {
    "title": "选项短标题",
    "desc": "选项说明",
    "tag": "选项标签"
  }
}

字段要求：
- summary：第 1 年必须是空字符串；第 2 年起 32-56 个汉字，1-2 句短句，作为卡片外的“上年反馈”。格式固定为“上一年后果 + 同步近况”：前半句只写上一年选择已经造成的结果、收益、代价或社死后果；后半句只写没有出现在本年 scene 里的另一类近况。不要复述 A/B、不要复述选项原文、不要写“你选择了”，不要只写生活近况，不要泛泛总结，不要出现创作术语或结构说明。
- question：必须是“第 X 年 / 18”，X 等于当前年份。
- lifeTrack：18-42 个汉字，记录这一年结束后生活/学业/事业/家庭/朋友/健康中的持续状态，不要只写职业。
- relationshipTrack：18-42 个汉字，记录这一年结束后健康、尊重边界的好感、暧昧、恋爱、错过或陪伴状态；没有伴侣也要写清楚支持系统。
- callbackSeeds：0-3 条，每条 4-16 个汉字，只写可在后面回响的人物、道具或梗。
- scene.title：10-22 个汉字，像卡片大标题，必须完整中文表达，不要英文缩写，不要半截词。
- scene.body：90-150 个汉字。情境要像参考样例一样有具体课堂/宿舍/公司/家庭/朋友场景、至少 1 个有名字的人物、一个轻微包袱和一个明确冲突；不要空泛讲道理。
- a/b.title：2-6 个汉字，必须是完整动作短语，例如“直接汇报”“先自己扛”“当场说破”“暂时撤退”。不要英文，不要半截词，不要超过 6 个汉字。
- a/b.desc：12-24 个汉字，补充选择后会怎么做；必须是完整中文短句，不要重复 title，不要英文缩写。
- a/b.tag：2-6 个汉字，表示选择气质，例如“透明沟通”“硬扛到底”“边界清晰”。不要英文，不要半截词。
- A/B 必须方向相反，读起来像玩家真的可以立刻选。
- 每一年必须和历史选择有明显差异，不能复用上一年的事件、人物关系和选择结构。
- 生活状态和关系状态必须同步推进、交替成为本年正式问题：scene 只写本年正式问题，summary 只写上一年后果和本年没有成为正式问题的同步近况；lifeTrack 与 relationshipTrack 每年都要更新，不能停在同一句。
- 去重硬规则：summary 和 scene 必须像两台摄像机拍不同地方。summary 不能重复 scene.title 或 scene.body 里的主人物、地点、事件、冲突、关键词、道具、健康问题、项目名或关系冲突；不能把同一个人同一件事先写进 summary 又写进 scene。
- 领域互斥规则：如果 scene 写工作/学业/项目/公司/考试/专业/创业/钱，则 summary 的同步近况优先写感情/陪伴/家庭/朋友/健康，但不能写 scene 里的同事、项目或公司；如果 scene 写恋爱/暧昧/伴侣/陪伴者/关系冲突，则 summary 的同步近况只写工作/学业/家庭/朋友/健康，不再写这段关系；如果 scene 写健康，则 summary 不要再写作息、体检、医院、爬山、熬夜，改写关系、家人或事业近况。
- 交错规则：同一类型内容不能连续多年作为 scene 主事件；没有成为 scene 的状态要在 summary 或 lifeTrack/relationshipTrack 里轻轻推进，等下一次轮到它时再成为正式问题。
- lifeTrack 和 relationshipTrack 是内部连续状态，不是 scene 的复述。它们可以承接同一年结果，但不能复制 scene.title/body 的措辞。
- 第 2-8 年必须开始出现健康、尊重边界的好感、暗恋、暧昧、恋爱、错过或长期陪伴线索之一，优先放在 summary 里。
- 优先短句，方便手机卡片阅读；不要铺垫过长，不要解释人生道理。
`.trim();

const batchPrompt = `
请连续生成一幕的结构化问题。

必须只输出以下 JSON，不要增加字段：
{
  "cards": [
    {
      "summary": "上年反馈，第1年为空字符串",
      "question": "第 X 年 / 18",
      "lifeTrack": "生活/学业/事业/家庭/朋友/健康线当前状态",
      "relationshipTrack": "好感/暧昧/恋爱/错过/陪伴线当前状态",
      "callbackSeeds": ["可回响的人物/道具/梗"],
      "scene": {
        "title": "事件标题",
        "body": "情境正文"
      },
      "a": {
        "title": "选项短标题",
        "desc": "选项说明",
        "tag": "选项标签"
      },
      "b": {
        "title": "选项短标题",
        "desc": "选项说明",
        "tag": "选项标签"
      }
    }
  ]
}

字段要求：
- cards 数量必须等于请求里的 count。
- 第一张 question 必须等于 startYear，之后逐年递增。
- summary：第 1 年必须是空字符串；第 2 年起 32-56 个汉字，1-2 句短句，作为卡片外的“上年反馈”。格式固定为“上一年后果 + 同步近况”：前半句只写上一年选择已经造成的结果、收益、代价或社死后果；后半句只写没有出现在本年 scene 里的另一类近况。不要复述 A/B、不要复述选项原文、不要写“你选择了”，不要只写生活近况，不要泛泛总结，不要出现创作术语或结构说明。
- 如果同一批里生成尚未被玩家真实选择过的未来年份，summary、lifeTrack、relationshipTrack 和 scene 都不能假设玩家选择了 A 或 B，不能写“你拒绝了/你接下了/你加入了/你选择了/你采纳了/你坚持了”。必须写成不管玩家选 A 还是 B 都能承接的中性局面，例如“开学后的社交圈逐渐成形”“专业课压力开始出现”“某个同学开始频繁出现在日常里”。前端会在玩家选择后补真实选择反馈。
- lifeTrack：18-42 个汉字，每年都要更新生活/学业/事业/家庭/朋友/健康状态，不要只写职业。
- relationshipTrack：18-42 个汉字，每年都要更新健康、尊重边界的好感、暧昧、恋爱、错过或陪伴状态；没有伴侣也要写清楚支持系统。
- callbackSeeds：0-3 条，每条 4-16 个汉字，只写可在后面回响的人物、道具或梗。
- scene.title：10-22 个汉字，像卡片大标题，必须完整中文表达，不要英文缩写，不要半截词。
- scene.body：90-150 个汉字。情境要像参考样例一样有具体课堂/宿舍/公司/家庭/朋友场景、至少 1 个有名字的人物、一个轻微包袱和一个明确冲突；不要空泛讲道理。
- a/b.title：2-6 个汉字，完整中文动作短语，不要英文，不要半截词，不要超过 6 个汉字。
- a/b.desc：12-24 个汉字，补充选择后会怎么做；必须是完整中文短句，不要重复 title，不要英文缩写。
- a/b.tag：2-6 个汉字，表示选择气质，不要英文，不要半截词。
- A/B 必须方向相反，读起来像玩家真的可以立刻选。
- 同一批内每年事件必须明显不同，不能复用同一个机会、人物关系和选择结构。
- 生活状态和关系状态必须同步推进、交替成为本年正式问题：scene 只写本年正式问题，summary 只写上一年后果和本年没有成为正式问题的同步近况；lifeTrack 与 relationshipTrack 每年都要更新，不能停在同一句。
- 去重硬规则：summary 和 scene 必须像两台摄像机拍不同地方。summary 不能重复 scene.title 或 scene.body 里的主人物、地点、事件、冲突、关键词、道具、健康问题、项目名或关系冲突；不能把同一个人同一件事先写进 summary 又写进 scene。
- 领域互斥规则：如果 scene 写工作/学业/项目/公司/考试/专业/创业/钱，则 summary 的同步近况优先写感情/陪伴/家庭/朋友/健康，但不能写 scene 里的同事、项目或公司；如果 scene 写恋爱/暧昧/伴侣/陪伴者/关系冲突，则 summary 的同步近况只写工作/学业/家庭/朋友/健康，不再写这段关系；如果 scene 写健康，则 summary 不要再写作息、体检、医院、爬山、熬夜，改写关系、家人或事业近况。
- 交错规则：同一类型内容不能连续多年作为 scene 主事件；没有成为 scene 的状态要在 summary 或 lifeTrack/relationshipTrack 里轻轻推进，等下一次轮到它时再成为正式问题。
- lifeTrack 和 relationshipTrack 是内部连续状态，不是 scene 的复述。它们可以承接同一年结果，但不能复制 scene.title/body 的措辞。
- 第 2-8 年必须开始出现健康、尊重边界的好感、暗恋、暧昧、恋爱、错过或长期陪伴线索之一，优先放在 summary 里；不要拖到 35 岁后才第一次出现。
- 优先短句，方便手机卡片阅读。
`.trim();

const resultPrompt = `
请根据完整 18 年历史生成最终结果。

必须只输出以下字段，字段名必须完全一致，不要增加字段：
{
  "title": "可截图称号",
  "status42": "36 岁近况",
  "majorCareerNote": "专业不等于职业补充",
  "careerPossibilities": [
    { "percent": 35, "label": "职业可能性1" },
    { "percent": 20, "label": "职业可能性2" },
    { "percent": 25, "label": "职业可能性3" }
  ],
  "famousScenes": [
    { "title": "一句能看懂的高光总结", "body": "这一幕具体发生了什么" },
    { "title": "一句能看懂的离谱总结", "body": "这一幕具体发生了什么" },
    { "title": "一句能看懂的回响总结", "body": "这一幕具体发生了什么" }
  ],
  "timelineBlocks": [
    { "title": "18-22 岁：大学四年", "body": "这一段怎么走过来的" },
    { "title": "22-30 岁：毕业第一站", "body": "这一段怎么走过来的" },
    { "title": "30-36 岁：沉浮与名场面", "body": "这一段怎么走过来的" }
  ],
  "choiceHabit": { "title": "一句话点破你的选择习惯", "body": "为什么你总会这样选" },
  "mentalPrep": { "title": "一句话点破你该提前准备什么", "body": "这条路真正要提前扛住什么" },
  "letter18": { "title": "一句话送给十八岁的你", "body": "给十八岁的你的一段人话" },
  "shareHooks": ["转发钩子1", "转发钩子2"]
}

字段要求：
- title：格式为“[负面形容词][正面形容词][与初始专业相关但不唯一对口的职业称号]”，不要标点，有梗，能截图。
- status42：60-120 字，用 36 岁近况口吻覆盖事业、生活状态、一个人物关系结果，整体正向。
- majorCareerNote：60-120 字，说明专业和职业不是一一绑定，必须明确“专业决定起点，不决定你一辈子的工牌。”不要在这一段里写百分比。
- careerPossibilities：必须 3 条，percent 为 10-45 的数字，label 为 3-8 个汉字的职业可能性；三条必须结合玩家专业、选择历史、生活线和关系线，不要总是“大厂架构师/产品管理/独立开发者”。
- famousScenes：必须 3 条对象；每条都要有 title 和 body。title 必须是 8-18 个汉字的一句话总结，玩家一眼就知道这一段的看点，不能写“高光时刻”“离谱时刻”这种空标题。body 为 28-60 个汉字，补充这一幕具体发生了什么。三条里至少 1 条高光，1 条社死或荒诞，1 条和前期 Callback 有关。
- timelineBlocks：必须 3 条对象；每条都要有 title 和 body。title 必须是“年龄段：这一段总结”的完整标题，例如“18-22 岁：大学里第一次走偏又走正”。body 为 36-80 个汉字，写这一段怎么走过来的。三条按时间顺序覆盖 18-22、22-30、30-36。
- choiceHabit：对象，title 为 10-22 个汉字，直接点出玩家的选择习惯；body 为 50-90 个汉字，用大白话解释这种习惯是怎么形成的，会带来什么结果。
- mentalPrep：对象，title 为 10-22 个汉字，直接点出这条路最需要提前准备的事；body 为 50-90 个汉字，写要准备什么现实代价、情绪波动或关系成本。
- letter18：对象，title 为 10-22 个汉字，像一句送给十八岁自己的短标题；body 为 45-90 个汉字，像人话建议，不要说教。
- shareHooks：2-3 条短句，像朋友看完截图会直接回的话；不要像广告，不要出现“转发”“钩子”等产品词。
`.trim();

const feedbackOverridePrompt = `
反馈长度覆盖规则：
- 只要输出 summary/上年反馈，第 1 年必须为空字符串。
- 第 2 年起 summary 必须是 32-56 个汉字，1-2 句短句。
- 先直接写上一年决定造成的结果、收益、代价或社死后果，再带一条没有出现在本年 scene 里的关系、家庭、朋友、健康、事业或早期 Callback 的持续变化。
- summary 和 scene 不能写同一个人物、同一个地点、同一个事件、同一个冲突或同一类健康/工作/关系问题。scene 写项目，summary 不写项目；scene 写关系，summary 不写这段关系；scene 写健康，summary 不写健康。
- 生活状态和关系状态要同步推进，但每年呈现时必须交错：一个成为 scene，另一个只在 summary 或 track 里轻轻推进。
- 不要复述 A/B，不要复述选项原文，不要写“你选择了”，不要出现“明线”“暗线”等创作术语。
- 旧规则里如果出现 45-80 字，以本覆盖规则为准。

结构化输出覆盖规则：
- 年度问题必须输出 summary/question/lifeTrack/relationshipTrack/callbackSeeds/scene/a/b。
- scene 必须是对象：{"title":"事件标题","body":"情境正文"}。
- a/b 必须是对象：{"title":"2-6字完整中文动作","desc":"12-24字完整中文说明","tag":"2-6字标签"}。
- 最终结果必须输出 title/status42/majorCareerNote/careerPossibilities/famousScenes/timelineBlocks/choiceHabit/mentalPrep/letter18/shareHooks。
- careerPossibilities 必须是 3 个对象，格式为 {"percent": 数字, "label": "职业可能性"}。
- 如果旧规则和本覆盖规则冲突，以本覆盖规则为准。
`.trim();

const plainLanguageOverridePrompt = `
白话表达覆盖规则：
- 所有输出默认面向 18 岁高中毕业生，优先用大白话，不要假设用户懂行业行话。
- 尽量不用 debug、KPI、PPT、OKR、ROI、IP、HR、CTO、SDK、API、zip、服务器、工单、闭环、抓手、赋能 这类词。
- 如果剧情里确实需要这些概念，也必须改写成高中生一看就懂的中文，例如“改 bug”改成“修问题”，“KPI”改成“业绩指标”，“PPT”改成“汇报材料”，“HR”改成“招聘老师或招人同事”，“IP”改成“个人品牌”。
- 不要故意炫术语，不要写像职场黑话总结，不要把专业内容写成需要解释的暗号。
`.trim();

const durationOverridePrompt = `
局数长度覆盖规则：
- 本局只有 ${totalGameYears} 年，玩家只做 ${totalGameYears} 次选择。
- 所有年度问题的 question 必须写成“第 X 年 / ${totalGameYears}”，不能写“/ 25”或“第 19 年”。
- 完成第 ${totalGameYears} 次选择后必须进入最终结果，不再生成第 ${totalGameYears + 1} 年。
- 整体故事线要压缩成 18 年：第一幕第 1-4 年，第二幕第 5-8 年，第三幕第 9-12 年，第四幕第 13-15 年，第五幕第 16-18 年。
- 段子型问题控制在至少 5 个，传播型整活事件控制在 6-8 个，Callback 控制在 4-6 次。
- 最终结果里的 status42 字段名保持不变，但文案内容写“${finalResultAge} 岁近况”，不要再写 42 岁。
- 如果旧规则里出现 25 年、25 次、第 25 年、第 26 年、42 岁或二十五年，以本覆盖规则为准。
`.trim();

function normalizedBasePrompt() {
  return basePrompt
    .replaceAll("连续提出 25 个问题", "连续提出 18 个问题")
    .replaceAll("未来 25 年", "未来 18 年")
    .replaceAll("第 25 次选择", "第 18 次选择")
    .replaceAll("第 25 个选择", "第 18 个选择")
    .replaceAll("第 26 年 / 25", "第 19 年 / 18")
    .replaceAll("第 26 年", "第 19 年")
    .replaceAll("第 16-20 年", "第 13-15 年")
    .replaceAll("第 21-25 年", "第 16-18 年")
    .replaceAll("第 11-20 年", "第 9-14 年")
    .replaceAll("第 16-25 年", "第 13-18 年")
    .replaceAll("25 年里", "18 年里")
    .replaceAll("25 年中", "18 年中")
    .replaceAll("第 X 年 / 25", "第 X 年 / 18")
    .replaceAll("25 个问题", "18 个问题")
    .replaceAll("25 年", "18 年")
    .replaceAll("42 岁近况", "36 岁近况")
    .replaceAll("42 岁时", "36 岁时")
    .replaceAll("二十五年", "十八年")
    .replaceAll("多用 debug、服务器、团建、老板黑话、彩蛋、离谱需求、工位文化。", "多用修问题、系统卡住、临时改需求、团队氛围、离谱任务这些高中生也能秒懂的场景。")
    .replaceAll("多用甲方、审美、改稿、展览、手作、社死作品、IP、装修翻车。", "多用客户要求、改稿、展览、手作、社死作品、个人品牌、装修翻车。")
    .replaceAll("多用饭局、KPI、PPT、汇报、体面社死、客户话术、表面风光内里崩溃。", "多用饭局、业绩指标、汇报材料、正式场合出糗、客户沟通、表面体面内里崩溃。");
}

function systemPrompt(extra = "") {
  return [normalizedBasePrompt(), feedbackOverridePrompt, durationOverridePrompt, plainLanguageOverridePrompt, extra].filter(Boolean).join("\n\n");
}

function sendJson(status, data) {
  return Response.json(data, {
    status,
    headers: { "cache-control": "no-store" }
  });
}

async function readJson(request) {
  const raw = await request.text();
  return raw ? JSON.parse(raw) : {};
}

function clean(value, fallback) {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function normalizeProfile(profile = {}) {
  return {
    name: clean(profile.name, "未命名考生"),
    gender: clean(profile.gender, "不限定"),
    province: clean(profile.province, "未知省份"),
    score: clean(profile.score, "未知分数"),
    dream: clean(profile.dream, "暂未填写"),
    hope: clean(profile.hope, "未知"),
    keywords: clean(profile.keywords, "观察中"),
    major: clean(profile.major, "未选专业"),
    majorLabel: clean(profile.majorLabel, clean(profile.major, "未选专业"))
  };
}

function compactHistory(history = []) {
  return history.slice(-totalGameYears).map(item => ({
    year: item.year,
    scene: item.scene,
    summary: item.summary,
    lifeTrack: item.lifeTrack,
    relationshipTrack: item.relationshipTrack,
    callbackSeeds: item.callbackSeeds,
    choice: item.choice,
    choiceText: item.choiceText
  }));
}

function buildAnnualMessages({ profile, history, year }) {
  return [
    { role: "system", content: systemPrompt() },
    {
      role: "user",
      content: [
        annualPrompt,
        "",
        `当前年份：第 ${year} 年 / ${totalGameYears}`,
        `玩家信息 JSON：${JSON.stringify(normalizeProfile(profile))}`,
        `已发生历史 JSON：${JSON.stringify(compactHistory(history))}`,
        "",
        "请严格生成这一年的 JSON。"
      ].join("\n")
    }
  ];
}

function buildBatchMessages({ profile, history, startYear, count }) {
  return [
    { role: "system", content: systemPrompt("可以按请求连续生成一幕的问题。") },
    {
      role: "user",
      content: [
        batchPrompt,
        "",
        `startYear：${startYear}`,
        `count：${count}`,
        `年份范围：第 ${startYear} 年 / ${totalGameYears} 到第 ${startYear + count - 1} 年 / ${totalGameYears}`,
        `玩家信息 JSON：${JSON.stringify(normalizeProfile(profile))}`,
        `已发生历史 JSON：${JSON.stringify(compactHistory(history))}`,
        "",
        "请严格生成这一批 cards JSON。"
      ].join("\n")
    }
  ];
}

function buildResultMessages({ profile, history }) {
  return [
    { role: "system", content: systemPrompt() },
    {
      role: "user",
      content: [
        resultPrompt,
        "",
        `玩家信息 JSON：${JSON.stringify(normalizeProfile(profile))}`,
        `完整 ${totalGameYears} 年历史 JSON：${JSON.stringify(compactHistory(history))}`,
        "",
        "请严格生成最终结果 JSON。"
      ].join("\n")
    }
  ];
}

async function callDeepSeek(messages, validator, env) {
  if (env?.DEEPSEEK_MOCK === "1") return validator(mockResponse(messages));
  const deepseekApiKey = env?.DEEPSEEK_API_KEY;
  const deepseekModel = env?.DEEPSEEK_MODEL || defaultDeepSeekModel;
  const deepseekStream = env?.DEEPSEEK_STREAM === "0" ? false : defaultDeepSeekStream;
  const deepseekTimeoutMs = Math.max(8000, Math.min(55000, Number(env?.DEEPSEEK_TIMEOUT_MS || defaultDeepSeekTimeoutMs)));
  if (!isUsableDeepSeekKey(deepseekApiKey)) {
    const error = new Error("DeepSeek API Key 未配置或格式不正确。请在 Cloudflare Worker Secret 中设置 DEEPSEEK_API_KEY。");
    error.status = 500;
    throw error;
  }

  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const useStream = deepseekStream && attempt === 0;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort("DeepSeek request timeout"), deepseekTimeoutMs);
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${deepseekApiKey}`
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: deepseekModel,
          messages,
          response_format: { type: "json_object" },
          thinking: { type: "disabled" },
          temperature: 0.95,
          stream: useStream,
          max_tokens: 3200
        })
      });
      clearTimeout(timeout);
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const error = new Error(payload?.error?.message || `DeepSeek request failed: ${response.status}`);
        error.status = response.status;
        throw error;
      }
      const content = useStream
        ? await readDeepSeekStream(response)
        : (await response.json().catch(() => ({})))?.choices?.[0]?.message?.content;
      if (!content) throw new Error("DeepSeek returned empty content");
      return validator(parseJsonContent(content));
    } catch (error) {
      lastError = error;
    }
  }
  console.error("DeepSeek unavailable, using fallback content:", lastError?.message || lastError);
  const fallback = validator(mockResponse(messages));
  return { ...fallback, degraded: true };
}

async function readDeepSeekStream(response) {
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";
  for await (const chunk of response.body) {
    buffer += decoder.decode(chunk, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      const payload = JSON.parse(data);
      content += payload?.choices?.[0]?.delta?.content || "";
    }
  }
  content += decoder.decode();
  return content.trim();
}

function isUsableDeepSeekKey(value) {
  const key = String(value || "").trim();
  return /^sk-[A-Za-z0-9_-]{20,}$/.test(key);
}

function parseJsonContent(content) {
  const text = String(content).trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(text.slice(start, end + 1));
    throw new Error("DeepSeek returned invalid JSON");
  }
}

function validateAnnual(data, history = []) {
  const normalized = {};
  if (typeof data?.summary !== "string") throw new Error("Invalid annual JSON: missing summary");
  if (typeof data?.question !== "string") throw new Error("Invalid annual JSON: missing question");
  normalized.summary = data.summary.trim();
  normalized.question = data.question.trim();
  normalized.lifeTrack = optionalCleanText(data.lifeTrack);
  normalized.relationshipTrack = optionalCleanText(data.relationshipTrack);
  normalized.callbackSeeds = Array.isArray(data.callbackSeeds)
    ? data.callbackSeeds.map(item => optionalCleanText(item)).filter(Boolean).slice(0, 3)
    : [];
  normalized.scene = normalizeSceneData(data.scene);
  normalized.a = normalizeChoiceData(data.a, "A");
  normalized.b = normalizeChoiceData(data.b, "B");
  if (!new RegExp(`^第\\s*\\d+\\s*年\\s*\\/\\s*${totalGameYears}$`).test(normalized.question)) {
    throw new Error("Invalid annual JSON: bad question field");
  }
  const yearNumber = Number(normalized.question.match(/\d+/)?.[0] || 1);
  normalized.summary = yearNumber === 1 ? "" : deDuplicateSummary(normalized, history);
  if (yearNumber > 1 && !normalized.summary) {
    const sceneText = [normalized.scene?.title, normalized.scene?.body].filter(Boolean).join("");
    normalized.summary = mergeFeedbackParts(buildHistoryConsequence(history), buildOffstageFallback(textCategories(sceneText)));
  }
  if (!normalized.scene.title || !normalized.scene.body || !normalized.a.title || !normalized.b.title) {
    throw new Error("Invalid annual JSON: empty required field");
  }
  return normalized;
}

function deDuplicateSummary(card, history = []) {
  const summary = optionalCleanText(card.summary);
  if (!summary) return "";
  const sceneText = [card.scene?.title, card.scene?.body].filter(Boolean).join("");
  const sceneCategories = textCategories(sceneText);
  if (!hasCategoryOverlap(textCategories(summary), sceneCategories) && textSimilarityScore(summary, sceneText) < 0.34) return summary;
  const preferRelationship = !sceneCategories.has("relationship");
  const candidates = [
    { value: card.lifeTrack, type: "life" },
    { value: card.relationshipTrack, type: "relationship" }
  ]
    .map(item => ({ ...item, value: optionalCleanText(item.value) }))
    .filter(item => item.value)
    .map(item => ({
      ...item,
      score: textSimilarityScore(item.value, sceneText),
      categoryOverlap: hasCategoryOverlap(textCategories(item.value), sceneCategories)
    }))
    .filter(item => !item.categoryOverlap)
    .sort((a, b) => {
      const aPreferred = preferRelationship ? a.type === "relationship" : a.type === "life";
      const bPreferred = preferRelationship ? b.type === "relationship" : b.type === "life";
      if (aPreferred !== bPreferred) return aPreferred ? -1 : 1;
      return a.score - b.score;
    });
  const best = candidates[0];
  const consequence = extractConsequenceClause(summary, sceneText) || buildHistoryConsequence(history);
  const offstage = best && best.score < 0.34 ? best.value : buildOffstageFallback(sceneCategories);
  return mergeFeedbackParts(consequence, offstage);
}

function buildOffstageFallback(sceneCategories) {
  if (sceneCategories.has("relationship")) {
    return "工作节奏和家里期待都往前推了一步";
  }
  if (sceneCategories.has("health")) {
    return "有人开始稳定关心你的饭点和心情";
  }
  if (sceneCategories.has("work") || sceneCategories.has("study")) {
    return "身边关系也在日常里慢慢靠近";
  }
  return "生活里的关系和节奏都往前走了一步";
}

function extractConsequenceClause(summary, sceneText) {
  const clauses = optionalCleanText(summary)
    .split(/[，。！？!?；;]/)
    .map(item => item.trim())
    .filter(Boolean);
  const first = clauses[0] || "";
  if (first.length >= 8 && textSimilarityScore(first, sceneText) < 0.56) {
    return first.slice(0, 26);
  }
  return "";
}

function buildHistoryConsequence(history = []) {
  const last = Array.isArray(history) ? history.at(-1) : null;
  const text = optionalCleanText([last?.choice, last?.choiceText].filter(Boolean).join("，"));
  if (/拒|不|撤|稳|等|缓|谈判|排|守|边界|暂时|冷静/.test(text)) {
    return "上一年节奏被你稳住，压力少了一点";
  }
  if (/接|冲|说|救|扛|硬|通宵|主动|推进|承担|当场|立刻/.test(text)) {
    return "上一年局面被你推开，机会和压力一起变大";
  }
  return "上一年的决定开始改变局面";
}

function mergeFeedbackParts(consequence, offstage) {
  const left = optionalCleanText(consequence).replace(/[，。！？!?；;]+$/g, "");
  const right = optionalCleanText(offstage).replace(/^(上一年|上一年的决定|这一年)[，,]*/g, "").replace(/[，。！？!?；;]+$/g, "");
  const merged = [left, right].filter(Boolean).join("，");
  return `${merged.slice(0, 64)}。`;
}

function textCategories(value) {
  const text = String(value || "");
  const categories = new Set();
  const rules = [
    ["relationship", /恋|爱|暧昧|暗恋|表白|伴侣|陪伴|对象|结婚|分手|复合|喜欢|心动|搭子|约会/],
    ["health", /健康|身体|体检|医院|医生|熬夜|作息|胸闷|心律|生病|焦虑|睡眠|运动|爬山|休息/],
    ["family", /父母|家里|家庭|亲戚|妈妈|爸爸|孩子|老人|婚礼|买房|房贷/],
    ["friend", /朋友|室友|同学|同事|群|饭搭子|兄弟|闺蜜|聚会/],
    ["work", /工作|项目|上线|老板|领导|甲方|公司|岗位|调岗|职场|代码|产品|需求|汇报|团队|加班/],
    ["study", /课程|考试|作业|社团|导师|竞赛|保研|考研|论文|实习|专业课|学校|大学/]
  ];
  rules.forEach(([category, pattern]) => {
    if (pattern.test(text)) categories.add(category);
  });
  return categories;
}

function hasCategoryOverlap(left, right) {
  for (const item of left) {
    if (right.has(item)) return true;
  }
  return false;
}

function textSimilarityScore(a, b) {
  const left = uniqueTextTokens(a);
  const right = uniqueTextTokens(b);
  if (!left.size || !right.size) return 0;
  let shared = 0;
  for (const token of left) {
    if (right.has(token)) shared += 1;
  }
  return shared / Math.max(1, Math.min(left.size, right.size));
}

function uniqueTextTokens(value) {
  const text = String(value || "")
    .replace(/[，。！？!?；;：:\s"'“”‘’、（）()《》]/g, "")
    .trim();
  const tokens = new Set();
  for (let size = 2; size <= 3; size += 1) {
    for (let index = 0; index <= text.length - size; index += 1) {
      const token = text.slice(index, index + size);
      if (!/[的一是在和了有就把也都而及与或你我他她它这那]/.test(token)) {
        tokens.add(token);
      }
    }
  }
  return tokens;
}

function optionalCleanText(value) {
  return String(value || "").trim();
}

function normalizeSceneData(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return {
      title: optionalCleanText(value.title).slice(0, 28),
      body: optionalCleanText(value.body)
    };
  }
  const raw = optionalCleanText(value);
  const eventMatch = raw.match(/(?:^|\n)\s*事件[:：]\s*([^\n]+)/);
  const contextMatch = raw.match(/(?:^|\n)\s*情境[:：]\s*([\s\S]+)/);
  if (eventMatch || contextMatch) {
    return {
      title: optionalCleanText(eventMatch?.[1] || "这一年的岔路口").slice(0, 28),
      body: optionalCleanText(contextMatch?.[1] || raw.replace(eventMatch?.[0] || "", ""))
    };
  }
  const sentenceMatch = raw.match(/^(.{8,28}?[。！？!?])([\s\S]*)$/);
  return {
    title: optionalCleanText(sentenceMatch?.[1]?.replace(/[。！？!?]$/g, "") || "这一年的岔路口").slice(0, 28),
    body: optionalCleanText(sentenceMatch?.[2] || raw)
  };
}

function normalizeChoiceData(value, prefix) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const title = normalizeChoiceTitle(value.title || value.label || "", prefix);
    const desc = normalizeChoiceDesc(value.desc || value.description || value.label || "", title, prefix);
    const tag = normalizeChoiceTag(value.tag || title, prefix);
    return { title, desc, tag, label: `${title}，${desc}` };
  }
  const raw = optionalCleanText(value).replace(new RegExp(`^${prefix}[.。]\\s*`), "");
  const title = normalizeChoiceTitle(raw, prefix);
  const desc = normalizeChoiceDesc(raw, title, prefix);
  const tag = normalizeChoiceTag(title, prefix);
  return { title, desc, tag, label: `${title}，${desc}` };
}

function normalizeChoiceTitle(value, prefix) {
  const text = optionalCleanText(value)
    .replace(new RegExp(`^${prefix}[.。]\\s*`), "")
    .replace(/[，,。.!！?？；;].*$/g, "")
    .replace(/\s+/g, "");
  if (text) return text.slice(0, 6);
  return prefix === "A" ? "直接推进" : "先稳住";
}

function normalizeChoiceDesc(value, title, prefix) {
  const text = optionalCleanText(value)
    .replace(new RegExp(`^${prefix}[.。]\\s*`), "")
    .replace(title, "")
    .replace(/^[，,。.!！?？；;\s]+/, "")
    .trim();
  if (text.length >= 8) return text.slice(0, 28);
  return prefix === "A" ? "把问题摊开当场处理" : "留出余地再判断";
}

function normalizeChoiceTag(value, prefix) {
  const text = optionalCleanText(value).replace(new RegExp(`^${prefix}[.。]\\s*`), "").replace(/\s+/g, "");
  if (text && text !== "A" && text !== "B") return text.slice(0, 6);
  return prefix === "A" ? "主动处理" : "稳住节奏";
}

function validateBatch(data, expectedCount, startYear, history = []) {
  if (!Array.isArray(data?.cards) || data.cards.length !== expectedCount) {
    throw new Error("Invalid batch JSON: bad cards count");
  }
  return {
    cards: data.cards.map((card, index) => {
      const normalized = validateAnnual(card, history);
      const expectedYear = startYear + index;
      if (Number(normalized.question.match(/\d+/)?.[0]) !== expectedYear) {
        throw new Error(`Invalid batch JSON: expected year ${expectedYear}`);
      }
      return normalized;
    })
  };
}

function validateResult(data) {
  const normalized = {};
  for (const field of resultFields) {
    if (field === "careerPossibilities") {
      if (!Array.isArray(data?.[field])) throw new Error(`Invalid result JSON: missing ${field}`);
      normalized[field] = data[field].map(normalizeCareerPossibility).filter(Boolean).slice(0, 3);
    } else if (field === "famousScenes") {
      normalized[field] = normalizeResultBlocks(data?.[field], 3, normalizeSceneCardBlock);
    } else if (field === "timelineBlocks") {
      normalized[field] = normalizeResultBlocks(data?.[field], 3, normalizeTimelineBlock);
    } else if (field === "choiceHabit" || field === "mentalPrep" || field === "letter18") {
      normalized[field] = normalizeResultCard(data?.[field], fallbackResultCard(field));
    } else if (field === "shareHooks") {
      if (!Array.isArray(data?.[field])) throw new Error(`Invalid result JSON: missing ${field}`);
      normalized[field] = data[field].map(item => String(item).trim()).filter(Boolean);
    } else {
      if (typeof data?.[field] !== "string" || !data[field].trim()) throw new Error(`Invalid result JSON: missing ${field}`);
      normalized[field] = data[field].trim();
    }
  }
  normalized.famousScenes = normalized.famousScenes.slice(0, 3);
  normalized.timelineBlocks = normalized.timelineBlocks.slice(0, 3);
  normalized.shareHooks = normalized.shareHooks.slice(0, 3);
  if (
    normalized.careerPossibilities.length < 3 ||
    normalized.famousScenes.length < 3 ||
    normalized.timelineBlocks.length < 3 ||
    normalized.shareHooks.length < 2
  ) {
    throw new Error("Invalid result JSON: insufficient list items");
  }
  return normalized;
}

function normalizeResultBlocks(value, count, normalizer) {
  const source = Array.isArray(value) ? value : [];
  return source.map((item, index) => normalizer(item, index)).filter(Boolean).slice(0, count);
}

function normalizeSceneCardBlock(item, index) {
  if (item && typeof item === "object" && !Array.isArray(item)) {
    const title = optionalCleanText(item.title || item.headline || item.name).slice(0, 24);
    const body = optionalCleanText(item.body || item.desc || item.text);
    if (title || body) return { title: title || `第 ${index + 1} 个片段`, body: body || title };
  }
  const text = optionalCleanText(item);
  if (!text) return null;
  const title = text.split(/[，,。.!！?？]/).map(part => part.trim()).find(Boolean) || text;
  return { title: title.slice(0, 24), body: text };
}

function normalizeTimelineBlock(item, index) {
  const fallbackTitles = ["18-22 岁：大学四年", "22-30 岁：毕业第一站", "30-36 岁：沉浮与名场面"];
  if (item && typeof item === "object" && !Array.isArray(item)) {
    const title = optionalCleanText(item.title || item.headline || item.name).slice(0, 28);
    const body = optionalCleanText(item.body || item.desc || item.text);
    if (title || body) return { title: title || fallbackTitles[index], body: body || title };
  }
  const text = optionalCleanText(item);
  if (!text) return null;
  return { title: fallbackTitles[index] || `第 ${index + 1} 段`, body: text };
}

function normalizeResultCard(item, fallback) {
  if (item && typeof item === "object" && !Array.isArray(item)) {
    const title = optionalCleanText(item.title || item.headline || item.name).slice(0, 30);
    const body = optionalCleanText(item.body || item.desc || item.text);
    if (title || body) return { title: title || fallback.title, body: body || fallback.body };
  }
  const text = optionalCleanText(item);
  if (text) return { title: fallback.title, body: text };
  return fallback;
}

function fallbackResultCard(field) {
  const map = {
    choiceHabit: {
      title: "你习惯先看后果，再决定往哪边压",
      body: "你不是乱冲，也不是只会求稳。你会先判断代价，再决定是往前推一步，还是先把底盘守住。"
    },
    mentalPrep: {
      title: "高回报的路，也要准备更高波动",
      body: "这条路的难点不是一次选择对不对，而是你要更早准备情绪起伏、关系协调和现实成本。"
    },
    letter18: {
      title: "志愿只是起点，后面的改写更重要",
      body: "真正决定你会变成谁的，不是某一张志愿表，而是你之后每次愿不愿意继续修正和往前走。"
    }
  };
  return map[field];
}

function normalizeCareerPossibility(item) {
  if (!item || typeof item !== "object") return null;
  const percent = Math.max(1, Math.min(99, Number(item.percent || 0)));
  const label = optionalCleanText(item.label).slice(0, 10);
  if (!percent || !label) return null;
  return { percent, label };
}

function annualCardFromData(data) {
  const yearNumber = Number(data.question.match(/\d+/)?.[0] || 1);
  const sceneText = `事件：${data.scene.title}\n情境：${data.scene.body}`;
  return {
    ...data,
    yearNumber,
    year: data.question,
    scene: sceneText,
    sceneTitle: data.scene.title,
    sceneBody: data.scene.body,
    prompt: sceneText,
    context: data.summary,
    leftHint: "A",
    rightHint: "B",
    left: { label: data.a.label, title: data.a.title, desc: data.a.desc, tag: data.a.tag, delta: { stability: 3, discipline: 2, explore: -1 } },
    right: { label: data.b.label, title: data.b.title, desc: data.b.desc, tag: data.b.tag, delta: { explore: 3, ambition: 2, stability: -1 } }
  };
}

function mockResponse(messages) {
  const content = messages.at(-1).content;
  if (content.includes("最终结果 JSON")) {
    return {
      title: "嘴硬心软整活型人生策划",
      status42: `${finalResultAge} 岁的你把专业当成起点，把选择当成素材，事业不算一路平坦，但已经有了自己的节奏。老朋友还在群里接梗，家人也终于学会把担心说得像支持。`,
      majorCareerNote: "这只是故事内估计，不是现实建议。你的专业提供了第一套工具，但后面每次选择都会改写路标。专业决定起点，不决定你一辈子的工牌。",
      careerPossibilities: [
        { percent: 28, label: "专业骨干" },
        { percent: 19, label: "内容产品" },
        { percent: 23, label: "项目统筹" }
      ],
      famousScenes: [
        { title: "临时救场讲成代表作", body: "你在一次没人想接的场合硬着头皮上，结果反而把自己讲成了全场记住的人。" },
        { title: "一条语音听出半句废话", body: "别人都在点头时，你先把含糊要求翻成人话，少走了最冤的一大段弯路。" },
        { title: "早年小道具救了大场面", body: "第 3 年留下的小东西到第 18 年突然派上用场，像人生自己给自己留了后手。" }
      ],
      timelineBlocks: [
        { title: "18-22 岁：大学四年", body: "你一边试方向一边认人，专业没有立刻锁死你，反而逼着你更早想清楚自己适合哪种节奏。" },
        { title: "22-30 岁：毕业第一站", body: "你先在现实里练基本功，再慢慢找到更像自己的位置。看上去像绕路，其实是在补未来会用上的底子。" },
        { title: "30-36 岁：沉浮与名场面", body: "前面的选择开始一起回响，高光和社死都变得更有分量，你也终于学会把离谱日子过成自己的版本。" }
      ],
      choiceHabit: {
        title: "你习惯先算后果，再决定要不要冲",
        body: "你不是那种为了热血就盲冲的人。多数时候你会先看代价，再判断值不值得往前推，所以你的路更像稳着提速。"
      },
      mentalPrep: {
        title: "好机会常常带着压力一起上门",
        body: "你真正要准备的，不只是能力跟不跟得上，还有关系怎么协调、节奏怎么稳住、累的时候怎么别一个人硬扛。"
      },
      letter18: {
        title: "志愿不是判决书，顶多算开局说明书",
        body: "十八岁的你不用急着一次选对。真正拉开差距的，是你以后每次愿不愿意修正路线，继续往前走。"
      },
      shareHooks: ["这条线像我，但比我会复盘。", "原来专业只是新手村。", "测完想给志愿表道个歉。"]
    };
  }
  if (content.includes("这一批 cards JSON")) {
    const startYear = Number(content.match(/startYear：(\d+)/)?.[1] || 1);
    const count = Number(content.match(/count：(\d+)/)?.[1] || 5);
    return {
      cards: Array.from({ length: count }, (_, index) => {
        const year = startYear + index;
        return {
          summary: year === 1 ? "" : `上一年你把剧情拐了个弯，朋友群多了新梗，家里也开始悄悄关心你的作息。`,
          question: `第 ${year} 年 / ${totalGameYears}`,
          lifeTrack: "项目节奏变紧，朋友群还在持续接梗",
          relationshipTrack: "有个熟人开始稳定出现在日常里",
          callbackSeeds: ["朋友群新梗"],
          scene: {
            title: `第${year}年的新机会弹窗`,
            body: "你在一次普通会议里被点名，项目负责人许青禾把一个看起来很香的机会推到你面前。机会写着成长，代价写着加班，旁边同事小声说这题像人生强制更新。你必须当场表态。"
          },
          a: { title: "先接下来", desc: "边做边摸清真实代价", tag: "机会试探" },
          b: { title: "当场拒绝", desc: "把时间留给确定方向", tag: "边界清晰" }
        };
      })
    };
  }
  const year = Number(content.match(/当前年份：第\s*(\d+)\s*年/)?.[1] || 1);
  return {
    summary: year === 1 ? "" : `上一年你选了路，朋友群多了第 ${year - 1} 个梗，有人也开始稳定出现在你的日常里。`,
    question: `第 ${year} 年 / ${totalGameYears}`,
    lifeTrack: "生活节奏被新机会打乱，朋友还在旁边吐槽",
    relationshipTrack: "一个熟人开始记住你的饭点和作息",
    callbackSeeds: ["茶水间吐槽"],
    scene: {
      title: `第${year}年的人生弹窗`,
      body: "你刚把上一轮麻烦收拾完，朋友许青禾又带来一个新岔路。机会来得很响，代价也写在脸上，连茶水间的饮水机都像在等你做决定。你知道这次选完，后面几年的节奏都会变。"
    },
    a: { title: "立刻接下", desc: "把自己推到更大场面", tag: "主动推进" },
    b: { title: "当场拒绝", desc: "先守住成形的节奏", tag: "稳住生活" }
  };
}

async function handleApi(request, env, pathname) {
  try {
    if (pathname === "/api/health") {
      return sendJson(200, {
        ok: true,
        service: "gaokao-life-simulator",
        runtime: "cloudflare-worker",
        hasDeepSeekKey: isUsableDeepSeekKey(env?.DEEPSEEK_API_KEY),
        model: env?.DEEPSEEK_MODEL || defaultDeepSeekModel,
        time: new Date().toISOString()
      });
    }

    const body = await readJson(request);
    const profile = normalizeProfile(body.profile);
    const history = Array.isArray(body.history) ? body.history : [];

    if (pathname === "/api/game/start") {
      const data = await callDeepSeek(buildAnnualMessages({ profile, history: [], year: 1 }), value => validateAnnual(value, []), env);
      return sendJson(200, { ok: true, card: annualCardFromData(data) });
    }
    if (pathname === "/api/game/next") {
      const year = Math.min(Math.max(Number(body.year || history.length + 1), 2), totalGameYears);
      const data = await callDeepSeek(buildAnnualMessages({ profile, history, year }), value => validateAnnual(value, history), env);
      return sendJson(200, { ok: true, card: annualCardFromData(data) });
    }
    if (pathname === "/api/game/batch") {
      const startYear = Math.min(Math.max(Number(body.startYear || history.length + 1), 1), totalGameYears);
      const count = Math.min(Math.max(Number(body.count || 5), 1), totalGameYears - startYear + 1, 5);
      const data = await callDeepSeek(
        buildBatchMessages({ profile, history, startYear, count }),
        value => validateBatch(value, count, startYear, history),
        env
      );
      return sendJson(200, { ok: true, cards: data.cards.map(annualCardFromData) });
    }
    if (pathname === "/api/game/result") {
      const result = await callDeepSeek(buildResultMessages({ profile, history }), validateResult, env);
      return sendJson(200, { ok: true, result });
    }
    return sendJson(404, { ok: false, error: "API route not found" });
  } catch (error) {
    return sendJson(error.status || 500, { ok: false, error: error.message || "Request failed" });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      if (url.pathname === "/api/health") {
        return handleApi(request, env, url.pathname);
      }
      if (request.method !== "POST") {
        return sendJson(405, { ok: false, error: "Method not allowed" });
      }
      return handleApi(request, env, url.pathname);
    }
    return env.ASSETS.fetch(request);
  }
};
