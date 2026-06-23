import fs from "node:fs";
const { maleOpeningCards, femaleOpeningCards } = await import("./oc.mjs");
const esc = s => String(s || "").trim();
function cardBlock(c) {
  const lines = [];
  lines.push(`### ${c.index}. ${esc(c.major)}　·　${esc(c.category)}`);
  lines.push(`**场景〔${esc(c.scene.title)}〕**`);
  lines.push(esc(c.scene.body));
  lines.push("");
  lines.push(`- **A｜${esc(c.a.title)}**（${esc(c.a.tag)}）：${esc(c.a.desc)} → ${esc(c.a.consequence)}`);
  lines.push(`- **B｜${esc(c.b.title)}**（${esc(c.b.tag)}）：${esc(c.b.desc)} → ${esc(c.b.consequence)}`);
  if (c.relationshipTrack) lines.push(`> 关系线：${esc(c.relationshipTrack)}`);
  return lines.join("\n");
}
function section(title, cards) {
  return `## ${title}（共 ${cards.length} 张）\n\n` + cards.map(cardBlock).join("\n\n");
}
const md = [
  "# 人生扭蛋机 · 预置第一题（开场牌）总览",
  "",
  "> 第 1 年开场牌为**本地预置**（不调用大模型），运行时按「**性别 + 专业**」匹配一张返回。",
  `> 下表覆盖全部 **${maleOpeningCards.length + femaleOpeningCards.length}** 张（男 ${maleOpeningCards.length} / 女 ${femaleOpeningCards.length}），每个专业各一张，供团队可视化校对。`,
  "",
  section("👦 男生开场牌", maleOpeningCards),
  "",
  section("👧 女生开场牌", femaleOpeningCards),
  ""
].join("\n");
fs.writeFileSync("docs/preset-opening-cards.md", md);
console.log("wrote docs/preset-opening-cards.md");
console.log("bytes:", md.length, "| male:", maleOpeningCards.length, "female:", femaleOpeningCards.length);
