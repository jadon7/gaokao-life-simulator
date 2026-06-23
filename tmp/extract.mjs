import fs from "node:fs";
const raw = JSON.parse(fs.readFileSync("/Users/jadon7/.claude/projects/-Users-jadon7-Documents-SynologyDrive-code-gaokao-life-simulator-20260616/d94988d6-eb7f-4183-8688-698c1a6c339a/tool-results/toolu_01TgsCDLN9XNeAKqAHgxzjTo.json","utf8"));
const text = raw.map(x => x.text || "").join("\n");
function around(kw, before=420, after=900){
  const i = text.indexOf(kw);
  if(i<0){ console.log(`\n### "${kw}" NOT FOUND`); return; }
  console.log(`\n### around "${kw}" (idx ${i})\n` + text.slice(Math.max(0,i-before), i+after).replace(/\s+/g," "));
}
around("真实的你");
around("你内心真正渴望");
around("你的选择");
around("你放弃了");
around("你的底色");
