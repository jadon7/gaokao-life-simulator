import fs from "node:fs";
const raw = JSON.parse(fs.readFileSync("/Users/jadon7/.claude/projects/-Users-jadon7-Documents-SynologyDrive-code-gaokao-life-simulator-20260616/d94988d6-eb7f-4183-8688-698c1a6c339a/tool-results/toolu_01TgsCDLN9XNeAKqAHgxzjTo.json","utf8"));
const text = raw.map(x => x.text || "").join("\n");
// all tag pill backgrounds in the tags container region (idx of 558:670 .. career note)
const i = text.indexOf('data-node-id="558:670"');
const j = text.indexOf("临床医学专业"); // start of career card text
const seg = text.slice(i, j).replace(/\s+/g," ");
// pull bg-[#...] and text-[#...] and the tag words
console.log("TAG PILLS bg:", [...seg.matchAll(/bg-\[#?[0-9a-fA-F]+\]/g)].map(m=>m[0]));
console.log("TAG text colors:", [...seg.matchAll(/text-\[#[0-9a-fA-F]+\]/g)].map(m=>m[0]));
console.log("TAG words:", [...seg.matchAll(/>([^<>]{2,8})<\/p>/g)].map(m=>m[1]));
