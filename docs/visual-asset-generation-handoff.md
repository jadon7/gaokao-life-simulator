# 生图交接文档：人生卡片视觉资产

本文档用于交接给其他 Codex/生图 Agent，继续生成《高考人生模拟器》的卡片插画。核心目标是：**风格不跑偏、批次可验收、后续能稳定接入网页**。

## 当前任务

先生成 18 张 `pressure` 压力套图片，每 3 张一组给用户确认。确认一组后再继续下一组。不要一次性生成全部 18 张。

当前已用于风格确认的三张样图：

- `assets/preview_pressure_batch_01_glass/age_18_pressure_glass.png`
- `assets/preview_pressure_batch_01_glass/age_19_pressure_glass.png`
- `assets/preview_pressure_batch_01_glass/age_20_pressure_glass.png`

这三张是后续所有图的风格锚点。继续生图前先打开查看。

## 已定风格

### 总体风格

- 高质量三维动画电影感，不是手绘、不是水彩、不是平面插画。
- 明亮、白天、偏阳光，整体不要暗。
- 场景要更贴近中国实际生活和公共环境，不要泛泛欧美校园/办公室感。
- 画面有电影语言：广角、特写、中景、远景、高机位、低机位、过肩、纵深构图可以混用。
- 每张图的取景应明显不同，避免“一个人站在画面中央”的重复感。

### 人物设定

人物是符号化剪影，不是具体角色：

- 无性别。
- 无五官。
- 无发型。
- 无服饰细节。
- 不要像真实人，也不要像鬼。
- 人物可以全身、半身、背影、侧影、近景局部，按剧情张力选择镜头。

人物材质：

- 半透明磨砂玻璃。
- 有柔和折射和边缘模糊。
- 彩色虹彩渐变：浅青、天蓝、薰衣草紫、柔粉、暖橙。
- 质感参考：柔雾玻璃、珍珠、半透明树脂，不是金属，不是霓虹。
- 人物周围允许少量弥散雾气，像阳光里的柔雾，必须克制。

### 场景设定

场景要真实中国化：

- 中国高中、大学宿舍、大学图书馆、食堂、校门、地铁、写字楼、出租屋、小区、医院、办公区、家庭客厅等。
- 可出现红色公告栏、瓷砖地、铝合金窗、普通课桌、铁架床、热水瓶、塑料收纳箱、文件夹、电脑、工牌、地铁口、小区楼道等现实细节。
- 不要出现可读文字、学校名、公司名、logo。
- 可以出现 NPC，但 NPC 只能作为背景或剧情压力来源，不要抢主角。

## 禁止项

所有图片都必须避免：

- 可读文字，包括中文、英文、数字编号、学校名、公司名。
- logo、品牌、真实机构名称。
- 明显性别化人物特征。
- 主角出现清晰脸、头发、衣服、五官。
- 黑夜恐怖氛围、鬼魂感、灵异感。
- 重霓虹、赛博朋克、科幻盔甲。
- 欧美校园/欧美办公室作为默认环境。
- 每张都同样中景居中站立。
- UI、边框、标题、按钮、水印。

## 图片尺寸与安全区

目标网页会使用 `background-size: cover`，所以构图必须考虑裁切。

推荐输出画布：

```text
1200 x 1410 px
```

核心安全区：

```text
x: 220 - 980
y: 180 - 1160
```

主体人物、关键动作、关键道具放在安全区内。左右边缘、顶部、底部可以放环境氛围，不要放必须读懂的信息。

如果生成工具输出不是精确 `1200 x 1410`，先保存原图，再可另存标准化版本；但预览给用户时优先展示原始生成图，避免补边影响判断。

## 批次流程

每次只生成 3 张：

1. 生成当前批次的 3 张 pressure 图。
2. 保存到独立预览目录。
3. 发给用户确认。
4. 用户确认“不修改”后，再生成下一批。

建议批次：

```text
batch_01: 18, 19, 20
batch_02: 21, 22, 23
batch_03: 24, 25, 26
batch_04: 27, 28, 29
batch_05: 30, 31, 32
batch_06: 33, 34, 35
```

当前产品主流程是 18 张卡。如果需要覆盖 35 岁，建议把 35 岁作为结果页/最终回响图另行生成，不混入这 18 张 pressure 卡。

## 命名规范

预览阶段：

```text
assets/preview_pressure_batch_XX/
  age_18_pressure.png
  age_19_pressure.png
  age_20_pressure.png
```

如果是改版，可以加后缀：

```text
age_18_pressure_glass.png
age_18_pressure_revised.png
```

最终接入阶段建议：

```text
assets/character_scenes/neutral/glass_avatar/year_01/scene_01.png
assets/character_scenes/neutral/glass_avatar/year_02/scene_01.png
...
```

其中：

- `year_01` 对应 18 岁。
- `year_02` 对应 19 岁。
- `scene_01` 对应 pressure。
- 后续 `scene_02` 可用于 relation。
- 后续 `scene_03` 可用于 choice。

## 提示词模板

下面是稳定模板。每张图只改 `Age`、`Scene`、`Camera and framing`、`Mood`。

```text
Use case: stylized-concept
Asset type: mobile browser story-card artwork for a Chinese life simulation game.
Canvas and composition: portrait 1200 x 1410 px aspect ratio. Keep the symbolic figure and key story objects inside x 220-980, y 180-1160. Edges may be cropped by CSS background-size cover.

Primary request:
Age <AGE> pressure scene. <ONE SENTENCE ABOUT LIFE STAGE AND PRESSURE>.

Camera and framing:
<CHOOSE ONE DISTINCT FILM-LANGUAGE SHOT: wide-angle establishing shot / close medium over-the-shoulder / high-angle long shot / low-angle corridor shot / tabletop close-up / reflective glass shot / side-profile medium shot / distant silhouette in large space. Make this different from nearby images.>

Human silhouette material:
One symbolic genderless human silhouette, no facial features, no hair, no visible clothing details, no gender. Semi-transparent frosted glass body with soft refraction and edge blur, pearlescent gradients of pale cyan, sky blue, lavender, soft pink, and warm orange. Smooth matte-glass surface, translucent edges, subtle internal light. Add a very small amount of diffuse mist/haze gently dispersed around the figure, like soft vapor catching daylight; elegant and minimal, not smoke-heavy, not ghostly.

NPCs:
Background NPCs are allowed when useful: ordinary Chinese students, parents, roommates, coworkers, teachers, family members, or passersby. Keep them soft, secondary, and with no clear faces.

Scene/backdrop:
<SPECIFIC CHINESE REAL-LIFE LOCATION AND DETAILS>. Use realistic local details. No readable text, no logos.

Visual style:
High-end 3D animated film still, bright daytime, realistic materials, soft global illumination, clean optimistic color grading, polished modern 3D animation quality.

Mood:
Bright, realistic, quietly pressured, with hope still present.

Avoid:
Readable Chinese characters, school/company names, logos, dark/night horror mood, cyberpunk, smoke cloud, heavy fog, detailed face/hair/clothes on the main silhouette, western default environment, UI, text overlay, frame.
```

## 18 张 pressure 场景建议

| 年龄 | 场景主题 | 推荐镜头 |
|---|---|---|
| 18 | 高考后，公告栏/志愿填报/人生第一次重大选择 | 广角环境，人物较小 |
| 19 | 大一宿舍，课程、社团、适应压力堆到桌面 | 过肩近景，桌面前景 |
| 20 | 图书馆/自习室，绩点、竞赛、项目证明自己 | 高机位中远景 |
| 21 | 实习投递、考试、未来方向同时压来 | 电脑屏幕反光或侧面中景 |
| 22 | 毕业季，行李、简历、毕业材料混在一起 | 低机位行李/门口构图 |
| 23 | 第一份工作，工位、工牌、群消息压力 | 办公区纵深中景 |
| 24 | 汇报前，会议室外等待 | 走廊长焦，门缝透光 |
| 25 | 项目出错，白板/数据/会议桌混乱 | 桌面广角或俯拍 |
| 26 | 加班与生活失衡，通勤/办公室/出租屋 | 夜晚不宜太暗，可用傍晚暖光 |
| 27 | 晋升、存款、关系责任开始叠加 | 玻璃幕墙反射镜头 |
| 28 | 身体和精神疲惫，体检单/通勤压力 | 医院走廊或地铁站远景 |
| 29 | 项目翻车/路线受挫 | 空会议室高机位 |
| 30 | 平台机会与家庭稳定诉求拉扯 | 城市路口或写字楼大厅 |
| 31 | 简历/项目材料无人回复，重新证明自己 | 办公桌近景或邮箱冷光 |
| 32 | 房租、家庭、长期责任具体化 | 小区楼道/家庭餐桌 |
| 33 | 职业中段瓶颈，看似稳定但被卡住 | 会议室玻璃反射 |
| 34 | 疲惫到需要停下来，身体发出提醒 | 体检中心/清晨办公室 |
| 35 | 被后辈请教，开始面对自己的路线 | 工作坊/讲台边缘中远景 |

## 镜头变化规则

连续三张不要重复同一种取景。每组至少包含：

- 1 张环境广角或中远景。
- 1 张近景/桌面/过肩。
- 1 张高机位、低机位、反射、长焦或特殊构图。

主角不必永远居中。可以小，可以背对，可以只出现上半身或手臂，但必须仍然是清晰的虹彩玻璃剪影符号。

## 验收标准

每张图交付前自检：

- 是否明亮、阳光、三维动画电影感？
- 人物是否是无性别、无五官、无头发服饰的符号剪影？
- 人物是否有半透明磨砂玻璃、虹彩折射、边缘柔化？
- 人物周围是否只有少量柔雾，而不是大烟雾？
- 场景是否像真实中国环境？
- 是否没有可读文字、logo、学校名、公司名？
- 三张之间镜头是否明显不同？
- 主体和关键道具是否落在安全区？
- 是否适合被网页卡片 `cover` 裁切？

## 当前风格备注

用户已经明确认可的方向：

- “风格对了”
- “挺好，都是我想要的结果”
- “特别好”

用户后续追加要求：

- 整体更亮，不要为了体现发光就都做暗场景。
- 人物可以是彩色虹彩剪影。
- 人物带点透明，带玻璃的模糊特效。
- 人物周围有轻微少量弥散雾。
- 场景和场地更多参考中国实际情况。
- 取景要随机灵活，参考电影语言，避免重复。

这些要求优先级高于早期“白色发光人影”“铅笔水彩”等旧方向。不要回到旧风格。
