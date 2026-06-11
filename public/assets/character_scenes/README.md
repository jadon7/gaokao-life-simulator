角色剧情配图目录
================

选择入口页的角色形象后，18 张问题卡会优先读取该角色目录下的配图；如果图片不存在，会自动回退到现有 `assets/card_interaction/question_sketch_*.png`，页面不会空白。

目录规则：

```text
assets/character_scenes/
  female/
    female_01/
      year_01/scene_01.png
      year_01/scene_02.png
      year_01/scene_03.png
      ...
      year_18/scene_01.png
    female_02/
    female_03/
  male/
    male_01/
    male_02/
    male_03/
```

命名规则：

- `female_01`：清醒新生
- `female_02`：外放女孩
- `female_03`：温和女孩
- `male_01`：稳住少年
- `male_02`：锋利少年
- `male_03`：整活少年
- 每年最多放 3 张图：`scene_01.png`、`scene_02.png`、`scene_03.png`
- 前端会按年份和卡片序号自动轮换这 3 张图。
