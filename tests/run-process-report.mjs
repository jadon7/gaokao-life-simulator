import fs from "node:fs";
import { execSync } from "node:child_process";

const defaultChoices = [
  "left", "left", "left", "right", "right", "left",
  "left", "left", "right", "left", "left", "right",
  "right", "right", "left", "left", "left", "left"
];

const args = Object.fromEntries(process.argv.slice(2).map(arg => {
  const [key, ...rest] = arg.replace(/^--/, "").split("=");
  return [key, rest.join("=") || "1"];
}));

const baseUrl = args.base || "https://gaokao.dsxzai.com";
const model = args.model || "deepseek-v4-flash";
const choices = (args.choices ? args.choices.split(",") : defaultChoices).map(item => item.trim()).filter(Boolean);
const commit = safeCommand("git rev-parse --short HEAD") || "";
const profile = {
  name: args.name || "测试员",
  gender: args.gender || "女生",
  province: args.province || "浙江",
  score: args.score || "588",
  hope: args.hope || "稳定且体面",
  keywords: args.keywords || "观察中",
  major: args.major || "视觉传达设计",
  majorLabel: args.majorLabel || args.major || "视觉传达设计",
  dream: args.dream || "暂未填写"
};

const trace = [];
const cards = [];
const history = [];
const apiProfile = { ...profile };

function safeCommand(command) {
  try {
    return execSync(command, { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeCard(raw) {
  return raw?.card || raw?.state || raw?.data?.card || raw?.data?.state || raw;
}

function pickedChoice(card, direction) {
  return direction === "right" ? card.right || card.b : card.left || card.a;
}

function stripDebug(response = {}) {
  const { debug, ...rest } = response;
  return rest;
}

function parseModelInput(modelRequest = {}) {
  const userContent = modelRequest.messages?.find(message => message.role === "user")?.content || "";
  const match = userContent.match(/输入数据：\n([\s\S]*?)\n\n输出字段：/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function collectRoles(card, modelInput, known = []) {
  const text = [
    card.sceneBody,
    card.summary,
    card.lifeTrack,
    card.relationshipTrack,
    card.a?.consequence,
    card.b?.consequence,
    card.left?.consequence,
    card.right?.consequence
  ].filter(Boolean).join(" ");
  const names = new Set(known);
  const storyCast = modelInput?.storyCast || {};
  [
    card.openingRelationName,
    apiProfile.openingRelationName,
    apiProfile.relationName,
    storyCast.relationName,
    storyCast.secondaryRelationName,
    storyCast.roommateName,
    storyCast.friendName,
    storyCast.externalName,
    storyCast.familyName
  ].filter(Boolean).forEach(name => {
    if (text.includes(name)) names.add(name);
  });
  return [...names];
}

function toHistoryItem(card, picked, year, appearedRoles) {
  return {
    year,
    sceneTitle: card.sceneTitle || card.scene?.title || "",
    choice: picked?.tag || picked?.title || "",
    choiceText: picked?.label || [picked?.title, picked?.desc].filter(Boolean).join("，"),
    consequence: picked?.consequence || "",
    tag: picked?.tag || "",
    lifeTrack: card.lifeTrack || "",
    relationshipTrack: card.relationshipTrack || "",
    callbackSeeds: card.callbackSeeds || [],
    holland: picked?.riasec || {},
    appearedRoles
  };
}

async function post(endpoint, payload) {
  const started = Date.now();
  const requestPayload = clone(payload);
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-prompt-lab-debug": "1"
    },
    body: JSON.stringify(payload)
  });
  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { parseError: text.slice(0, 1000) };
  }
  const debug = json?.debug || {};
  const modelRequest = debug.request || null;
  const modelInput = parseModelInput(modelRequest || {});
  trace.push({
    endpoint,
    ok: response.ok,
    status: response.status,
    ms: Date.now() - started,
    payload: requestPayload,
    modelRequest,
    modelInput,
    modelRawOutput: debug.rawOutput || "",
    response: stripDebug(json)
  });
  if (!response.ok) throw new Error(`${endpoint} ${response.status}: ${text.slice(0, 500)}`);
  return json;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[char]);
}

const labels = {
  endpoint: "接口",
  status: "状态码",
  ms: "耗时",
  payload: "接口入参",
  response: "接口返回",
  modelRequest: "模型请求",
  modelInput: "模型输入",
  modelRawOutput: "模型原始输出",
  profile: "用户档案",
  history: "历史",
  year: "年份",
  model: "模型",
  storyCast: "角色表",
  gameMeta: "局内信息",
  outlineCard: "本年题纲",
  stateHints: "状态提示",
  phase: "阶段",
  mainTrack: "主拍内容",
  conflict: "冲突",
  hook: "钩子",
  choiceContrast: "选项对照",
  sideBeat: "旁线推进",
  riasecAxis: "选项轴",
  currentIncident: "本年事故",
  timeFrame: "时间",
  educationState: "考研选择",
  relationshipStage: "关系阶段",
  relationshipBeat: "关系事实",
  recentSceneObjects: "禁用道具",
  introducedRoles: "已出场角色",
  sceneTitle: "场景标题",
  sceneBody: "场景正文",
  summary: "便签",
  lifeTrack: "现实状态",
  relationshipTrack: "关系状态",
  a: "选项 A",
  b: "选项 B",
  left: "左选项",
  right: "右选项",
  title: "标题",
  desc: "描述",
  tag: "标签",
  consequence: "后果",
  picked: "已选项",
  pickedDirection: "选择方向",
  historyItem: "写入历史",
  result: "结果页"
};

function label(key) {
  return labels[key] || key;
}

function visual(value, key = "") {
  if (value == null || value === "") return `<span class="muted">空</span>`;
  if (typeof value !== "object") return `<span>${escapeHtml(value)}</span>`;
  if (Array.isArray(value)) {
    if (!value.length) return `<span class="muted">空数组</span>`;
    return `<div class="array">${value.map((item, index) => `
      <div class="array-item">
        <div class="array-label">${escapeHtml(`${label(key)} ${index + 1}`)}</div>
        ${visual(item)}
      </div>
    `).join("")}</div>`;
  }
  return `<div class="visual">${Object.entries(value).map(([childKey, childValue]) => `
    <div class="line">
      <span class="key">${escapeHtml(label(childKey))}</span>
      <div class="value">${visual(childValue, childKey)}</div>
    </div>
  `).join("")}</div>`;
}

function promptBlock(title, text) {
  if (!text) return "";
  return `<details class="prompt-block"><summary>${escapeHtml(title)}</summary><pre>${escapeHtml(text)}</pre></details>`;
}

function choiceText(choice = {}) {
  return [choice.title, choice.desc, choice.tag && `#${choice.tag}`, choice.consequence].filter(Boolean).join(" / ");
}

function mini(rows) {
  return `<div class="mini">${rows.filter(([, value]) => value !== undefined && value !== null && value !== "").map(([key, value]) => `
    <div><b>${escapeHtml(key)}</b><span>${escapeHtml(value)}</span></div>
  `).join("")}</div>`;
}

function cardSummary(card = {}) {
  return mini([
    ["标题", card.sceneTitle || card.scene?.title],
    ["正文", card.sceneBody || card.scene?.body || card.prompt],
    ["便签", card.summary || card.context],
    ["现实", card.lifeTrack],
    ["关系", card.relationshipTrack],
    ["A", choiceText(card.left || card.a)],
    ["B", choiceText(card.right || card.b)]
  ]);
}

function inputSummary(item = {}) {
  const payload = item.payload || {};
  const modelInput = item.modelInput || {};
  const historyItems = Array.isArray(payload.history) ? payload.history : [];
  const modelHistory = Array.isArray(modelInput.history) ? modelInput.history : [];
  const last = historyItems.at(-1) || {};
  const stateHints = modelInput.stateHints || {};
  const outline = modelInput.outlineCard || {};
  const profileInput = modelInput.profile || payload.profile || {};
  return mini([
    ["接口", item.endpoint],
    ["状态", `${item.status} / ${item.ms}ms`],
    ["模型", payload.model || model],
    ["专业", profileInput.major],
    ["年份", modelInput.gameMeta?.currentYear || payload.year],
    ["历史", `${modelHistory.length || historyItems.length} 条模型摘要 / ${historyItems.length} 条接口记录`],
    ["时间", stateHints.timeFrame],
    ["关系阶段", stateHints.relationshipStage],
    ["关系事实", stateHints.relationshipBeat],
    ["本年事故", stateHints.currentIncident],
    ["禁用道具", stateHints.recentSceneObjects],
    ["本年冲突", outline.conflict],
    ["上一年", last.sceneTitle],
    ["上一选择", last.choiceText || last.choice],
    ["上一后果", last.consequence]
  ]);
}

function outputSummary(item = {}) {
  const card = item.response?.card;
  const result = item.response?.result;
  if (card) return cardSummary(card);
  if (result) {
    return mini([
      ["标题", result.title],
      ["状态", result.status42],
      ["出口", Array.isArray(result.careerPossibilities) ? result.careerPossibilities.map(item => item.label).join(" / ") : ""]
    ]);
  }
  return visual(item.response, "response");
}

function traceTitle(item = {}, index = 0) {
  if (item.endpoint === "/api/game/result") return "结果页";
  const year = item.payload?.year || item.response?.card?.yearNumber || index + 1;
  const title = item.response?.card?.sceneTitle;
  return title ? `第 ${year} 年：${title}` : `第 ${year} 年`;
}

function buildHtml(report) {
  const timeline = report.cards.map(({ year, card, pickedDirection, picked, historyItem }) => `
    <article class="card-item">
      <div class="item-head">
        <b>第 ${year} 年：${escapeHtml(card.sceneTitle || "")}</b>
        <span>选择 ${pickedDirection === "right" ? "B" : "A"}：${escapeHtml(picked?.title || picked?.tag || "")}</span>
      </div>
      ${cardSummary(card)}
      <details><summary>写入单线历史</summary>${visual(historyItem, "historyItem")}</details>
    </article>
  `).join("");

  const traceItems = report.trace.map((item, index) => {
    const systemPrompt = item.modelRequest?.messages?.find(message => message.role === "system")?.content || "";
    const userPrompt = item.modelRequest?.messages?.find(message => message.role === "user")?.content || "";
    const hasModelDialogue = !!item.modelRequest?.messages?.length;
    return `
      <article class="process-item">
        <div class="item-head">
          <b>${escapeHtml(traceTitle(item, index))}</b>
          <span>${escapeHtml(item.endpoint)} · ${escapeHtml(item.status)} · ${escapeHtml(item.ms)}ms</span>
        </div>
        <div class="io-grid">
          <section>
            <h3>输入摘要</h3>
            ${inputSummary(item)}
          </section>
          <section>
            <h3>输出摘要</h3>
            ${outputSummary(item)}
          </section>
        </div>
        <div class="dialogue">
          <h3>模型对话</h3>
          ${hasModelDialogue ? `
            ${promptBlock("系统提示词", systemPrompt)}
            ${promptBlock("用户提示词", userPrompt)}
            <details><summary>输入数据（从用户提示词解析）</summary>${visual(item.modelInput, "modelInput")}</details>
            ${promptBlock("模型原始输出", item.modelRawOutput)}
          ` : `<p class="no-model">预置卡或本地结果，无模型请求。</p>`}
        </div>
        <div class="raw">
          <details><summary>接口入参完整 JSON</summary>${visual(item.payload, "payload")}</details>
          <details><summary>接口返回完整 JSON</summary>${visual(item.response, "response")}</details>
        </div>
      </article>
    `;
  }).join("");

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>高考人生生成过程报告</title>
<style>
:root{color-scheme:light;--bg:#f5f7fb;--card:#fff;--line:#e5e9f2;--text:#182230;--muted:#667085;--blue:#175cd3;--soft:#f8fafc}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,"PingFang SC","Microsoft YaHei",sans-serif}.wrap{max-width:1180px;margin:0 auto;padding:30px 24px 60px}.top{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:18px}.top h1{margin:0 0 8px;font-size:30px}.top p{margin:0;color:var(--muted);line-height:1.6}.badge{display:inline-flex;background:#eef4ff;color:var(--blue);border-radius:999px;padding:5px 10px;font-size:12px;font-weight:800}.stats{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin:20px 0}.stat{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px}.stat b{display:block;font-size:18px;word-break:break-all}.stat span{display:block;margin-top:4px;color:var(--muted);font-size:12px}.nav{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 24px}.nav a{color:#344054;text-decoration:none;background:white;border:1px solid var(--line);border-radius:999px;padding:7px 11px;font-size:13px}h2{margin:28px 0 12px;font-size:22px}.process-item,.card-item{background:var(--card);border:1px solid var(--line);border-radius:16px;margin:14px 0;padding:18px;box-shadow:0 8px 22px #1018280f}.item-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;border-bottom:1px solid #eef2f7;padding-bottom:11px;margin-bottom:13px}.item-head b{font-size:18px}.item-head span{color:var(--muted);font-size:13px;text-align:right}.io-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.io-grid section{background:var(--soft);border:1px solid #e2e8f0;border-radius:13px;padding:13px}h3{margin:0 0 10px;font-size:15px}.mini{display:grid;gap:8px}.mini>div{display:grid;grid-template-columns:96px minmax(0,1fr);gap:10px}.mini b,.key,.array-label{color:#475467;font-size:12px;font-weight:800}.mini span,.value{line-height:1.58;word-break:break-word}.visual{display:grid;gap:8px}.line{display:grid;grid-template-columns:160px minmax(0,1fr);gap:10px;padding:7px 0;border-bottom:1px solid #eef2f7}.array{display:grid;gap:10px}.array-item{border:1px solid #e5e7eb;background:white;border-radius:11px;padding:10px}.muted{color:#98a2b3}.dialogue,.raw{margin-top:14px}.no-model{margin:0;color:#667085;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px}details{margin-top:10px;border-top:1px solid #edf0f5;padding-top:10px}summary{cursor:pointer;font-weight:800;color:#344054}pre{white-space:pre-wrap;word-break:break-word;background:#111827;color:#e5e7eb;border-radius:12px;padding:14px;line-height:1.55;max-height:620px;overflow:auto}.prompt-block summary{color:#175cd3}@media(max-width:880px){.top{display:block}.stats,.io-grid{grid-template-columns:1fr}.item-head{display:block}.item-head span{display:block;text-align:left;margin-top:6px}.mini>div,.line{grid-template-columns:1fr}.wrap{padding:22px 14px}}
</style>
</head>
<body>
<main class="wrap">
  <div class="top">
    <div>
      <span class="badge">固定模板 · 单线过程报告</span>
      <h1>高考人生生成过程报告</h1>
      <p>每一轮按“输入摘要 / 输出摘要 / 模型对话 / 完整 JSON”呈现。报告由调试头获取模型请求与原始输出。</p>
    </div>
    <p>${escapeHtml(report.generatedAt)}<br>${escapeHtml(report.baseUrl)}</p>
  </div>
  <div class="stats">
    <div class="stat"><b>${escapeHtml(report.commit || "-")}</b><span>提交</span></div>
    <div class="stat"><b>${escapeHtml(report.model)}</b><span>模型</span></div>
    <div class="stat"><b>${escapeHtml(report.profile.major)}</b><span>专业</span></div>
    <div class="stat"><b>${report.cards.length}</b><span>卡片</span></div>
    <div class="stat"><b>${report.trace.length}</b><span>请求</span></div>
  </div>
  <nav class="nav">
    <a href="#timeline">单线剧情</a>
    <a href="#trace">每轮模型对话</a>
    <a href="#result">结果页</a>
  </nav>
  <h2 id="timeline">单线剧情</h2>
  ${timeline}
  <h2 id="trace">每轮模型对话</h2>
  ${traceItems}
  <h2 id="result">结果页</h2>
  <article class="process-item">${visual(report.result, "result")}</article>
</main>
</body>
</html>`;
}

if (args.fromJson) {
  const report = JSON.parse(fs.readFileSync(args.fromJson, "utf8"));
  const htmlPath = args.html || args.fromJson.replace(/\\.json$/i, ".html");
  fs.writeFileSync(htmlPath, buildHtml(report));
  console.log("HTML", htmlPath);
  process.exit(0);
}

console.log("run start", baseUrl, model, commit);

for (let year = 1; year <= 18; year += 1) {
  const endpoint = year === 1 ? "/api/game/start" : "/api/game/next";
  const json = await post(endpoint, { model, profile: apiProfile, history, year });
  const card = normalizeCard(json);
  if (year === 1) {
    [
      ["openingRelationName", "relationName"],
      ["openingRelationGender", "relationGender"],
      ["openingRelationIntro", "relationIntro"]
    ].forEach(([openingKey, relationKey]) => {
      if (card[openingKey]) {
        apiProfile[openingKey] = card[openingKey];
        apiProfile[relationKey] = card[openingKey];
      }
    });
  }
  const pickedDirection = choices[year - 1] || "left";
  const picked = pickedChoice(card, pickedDirection);
  const modelInput = trace.at(-1)?.modelInput;
  const appearedRoles = collectRoles(card, modelInput, history.flatMap(item => item.appearedRoles || []));
  const historyItem = toHistoryItem(card, picked, year, appearedRoles);
  history.push(historyItem);
  cards.push({ year, card, pickedDirection, picked, historyItem });
  console.log(`${year}. ${card.sceneTitle} | ${card.lifeTrack} | ${card.relationshipTrack} | ${pickedDirection}:${picked?.tag || picked?.title || ""}`);
}

const resultJson = await post("/api/game/result", { model, profile: apiProfile, history });
const result = resultJson.result || resultJson;
console.log("result", result.title || "");

const stamp = new Date().toISOString().replace(/[-:]/g, "").replace("T", "-").slice(0, 15);
const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  commit,
  model,
  profile: apiProfile,
  choices,
  cards,
  chosenHistory: history,
  trace,
  result
};

const jsonPath = args.json || `/Users/jadon7/Downloads/gaokao-dialogue-report-${stamp}.json`;
const htmlPath = args.html || `/Users/jadon7/Downloads/gaokao-dialogue-report-${stamp}.html`;
fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
fs.writeFileSync(htmlPath, buildHtml(report));
console.log("JSON", jsonPath);
console.log("HTML", htmlPath);
