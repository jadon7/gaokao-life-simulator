// One real /api/game/result call against production to inspect the generated 三段式 title.
const BASE = process.env.BASE || "https://gaokao.dsxzai.com";

const profile = {
  name: "林予安", gender: "女生", province: "江苏", score: "570",
  major: "computer_science", majorLabel: "计算机科学与技术",
  hope: "稳定且体面", keywords: "技术、表达、城市机会", dream: "做出被很多人用的产品"
};

// A coherent CS arc that leans E/I/A (enterprise + investigative + a bit artistic).
const beats = [
  ["开学拉群", "主动接话，先露脸再说", "被推去当小组联系人，杂活也扛了", { S: 1.2, E: 1.4 }],
  ["第一次翻车", "通宵把 bug 修完", "作息从此没稳过，但项目保住了", { I: 1.6, C: 1.0 }],
  ["要不要转方向", "留在原方向继续啃", "底子更硬，也更累", { I: 1.5, R: 0.8 }],
  ["接私活", "接了，边学边做", "钱够花了，时间被吃掉", { E: 1.6, A: 0.9 }],
  ["比赛还是实习", "选了能出作品的比赛", "拿了名次，简历有了亮点", { A: 1.4, E: 1.2 }],
  ["导师 push", "扛下来按时交", "习惯了硬扛，不太会喊停", { C: 1.3, I: 1.1 }],
  ["要不要考研", "直接就业", "早点上桌，早点踩坑", { E: 1.5, S: 0.8 }],
  ["第一份工作选择", "去了节奏快的产品团队", "成长猛，加班也猛", { E: 1.7, A: 1.0 }],
  ["关系线", "把约会一再推给工作", "关系一次次冷下来", { S: 1.3, E: 0.7 }],
  ["要不要带团队", "接了带人的活", "从写代码转去定方向", { E: 1.8, S: 1.2 }],
  ["副业回血", "做了个小工具上线", "有点收入也有点名气", { A: 1.5, E: 1.3 }],
  ["行业下行", "稳住主业不乱跳", "保住饭碗，错过一波机会", { C: 1.4, E: 0.9 }],
  ["升职还是跳槽", "跳去做产品策划", "薪资涨，重新证明自己", { E: 1.9, I: 0.9 }],
  ["要不要创业", "先在大厂内部孵化", "稳一点，但不够爽", { E: 1.6, C: 1.0 }],
  ["第 15 年房贷", "重新排了预算扛下来", "现实账本紧但没塌", { C: 1.6, E: 0.8 }],
  ["老同学合伙邀约", "谨慎参与不全押", "留了退路也留了机会", { E: 1.4, I: 1.0 }],
  ["健康警告", "开始强制休息", "学会提前说这周排满了", { S: 1.1, C: 1.2 }],
  ["第 18 年坦白", "和家人摊牌想做产品", "选了想要的，也认了代价", { E: 1.7, A: 1.2 }]
];

const history = beats.map(([sceneTitle, choiceText, consequence, holland], i) => ({
  year: i + 1, index: i, sceneTitle, scene: sceneTitle,
  choice: i % 2 ? "right" : "left", choiceText, choiceTitle: choiceText,
  consequence, tag: "承担", delta: {}, holland
}));

const res = await fetch(`${BASE}/api/game/result`, {
  method: "POST", headers: { "content-type": "application/json" },
  body: JSON.stringify({ profile, history })
});
const data = await res.json();
const title = data?.result?.title || "(empty)";
const segs = title.split(/[，,]/).map(s => s.trim()).filter(Boolean);
console.log("HTTP", res.status, "degraded:", !!data?.degraded, "model:", data?.model || "");
console.log("TITLE:", title);
console.log("SEGMENTS:", segs.map(s => `${s}(${[...s].length}字)`).join("  /  "));
console.log("status42:", data?.result?.status42 || "");
