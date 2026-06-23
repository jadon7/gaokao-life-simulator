import fs from "node:fs";
const raw = JSON.parse(fs.readFileSync("/Users/jadon7/.claude/projects/-Users-jadon7-Documents-SynologyDrive-code-gaokao-life-simulator-20260616/d94988d6-eb7f-4183-8688-698c1a6c339a/tool-results/toolu_01TgsCDLN9XNeAKqAHgxzjTo.json","utf8"));
const text = raw.map(x => x.text || "").join("\n");
function around(kw, before=120, after=520){
  const i = text.indexOf(kw);
  if(i<0){ console.log(`\n### "${kw}" NOT FOUND`); return; }
  console.log(`\n### around "${kw}"\n` + text.slice(Math.max(0,i-before), i+after).replace(/\s+/g," "));
}
// section wrapper for 真实的你
around('data-node-id="558:761"', 60, 360);
// title (嘴硬心软) + subtitle + tags area
around("嘴硬心软", 260, 200);
around("拿过急诊抢救", 220, 120);
// tags container + first tag pill
around('data-node-id="558:670"', 40, 220);
around("临床医学", 240, 160);
