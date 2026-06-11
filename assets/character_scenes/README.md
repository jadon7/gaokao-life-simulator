角色剧情配图目录
================

问题卡会优先读取中性场景图；如果后续要给某个角色做专属剧情图，角色 ID 统一沿用开局头像命名：`男1`、`男2`、`男3`、`男4`、`女1`、`女2`、`女3`、`女4`、`女5`。

目录规则：

```text
assets/character_scenes/
  neutral/
    glow_avatar/
      year_01/scene_01.png
      year_01/scene_02.png
      year_01/scene_03.png
  male/
    男1/
      year_01/scene_01.png
      ...
  female/
    女1/
      year_01/scene_01.png
      ...
```

命名规则：

- 开局与结尾人物图放在 `assets/characters/`，例如 `男1-18.png`、`男1-39.png`。
- 剧情场景图如果要做角色专属，目录名必须等于角色 ID。
- 每年最多放 3 张图：`scene_01.png`、`scene_02.png`、`scene_03.png`。
- 如果角色专属场景图不存在，会回退到中性场景和 `assets/card_interaction/question_sketch_*.png`，页面不会空白。
