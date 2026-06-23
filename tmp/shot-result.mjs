// Render the CURRENT result page with realistic faked state and screenshot it.
// Drives system/cached Chrome over CDP (node v25 native WebSocket). No deps.
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9333;
const APP = process.env.APP || "http://127.0.0.1:8788/";
const OUT = process.env.OUT || "/tmp/gaokao-result-current.png";
const WIDTH = 430;

const userDir = fs.mkdtempSync(os.tmpdir() + "/cdp-");
const chrome = spawn(CHROME, [
  "--headless=new", `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${userDir}`,
  "--hide-scrollbars", "--no-first-run", "--no-default-browser-check",
  "--force-device-scale-factor=2",
  `--window-size=${WIDTH},2400`,
  "about:blank"
], { stdio: "ignore" });

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function getJSON(path) {
  const res = await fetch(`http://127.0.0.1:${PORT}${path}`);
  return res.json();
}

// wait for devtools + a page target
let target;
for (let i = 0; i < 50; i++) {
  try {
    const list = await getJSON("/json");
    target = list.find(t => t.type === "page");
    if (target?.webSocketDebuggerUrl) break;
  } catch {}
  await sleep(200);
}
if (!target) { console.error("no page target"); chrome.kill(); process.exit(1); }

const ws = new WebSocket(target.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
const events = [];
ws.addEventListener("message", ev => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  else if (msg.method) events.push(msg);
});
await new Promise(r => ws.addEventListener("open", r));

function send(method, params = {}) {
  const myId = ++id;
  return new Promise(resolve => { pending.set(myId, resolve); ws.send(JSON.stringify({ id: myId, method, params })); });
}
const waitEvent = (method, ms = 8000) => new Promise((resolve, reject) => {
  const t0 = Date.now();
  const tick = () => {
    const e = events.find(x => x.method === method);
    if (e) return resolve(e);
    if (Date.now() - t0 > ms) return reject(new Error("timeout " + method));
    setTimeout(tick, 50);
  };
  tick();
});

await send("Page.enable");
await send("Runtime.enable");
await send("Page.navigate", { url: APP });
await waitEvent("Page.loadEventFired");
await sleep(400);

const setup = `(async () => {
  state.profile = { name:'周屿', gender:'男生', province:'河南', score:'612', hope:'考研深造', keywords:'责任感、硬核训练、确定路径' };
  state.major = 'clinical_medicine';
  state.entryMajorText = '临床医学';
  state.avatar = '男2';
  state.totalYears = 18;
  state.history = Array.from({length:18}, (_,i)=>({ year:i+1, index:i, choice:'A', choiceText:'先上桌-莽就完了', tag:'承担', delta:{}, holland:{S:2,C:1.4,E:1.2,A:0.9,R:0.6,I:0.5} }));
  await showResult();
  for (let i=0;i<80;i++){ if(document.querySelector('.ability-section') && document.querySelector('.result-card.is-revealed') && document.querySelector('.career-card')) break; await new Promise(r=>setTimeout(r,100)); }
  const sheet = document.querySelector('.result-sheet'); if (sheet) sheet.scrollTop = 0;
  await new Promise(r=>setTimeout(r,500));
  return document.querySelector('.result-card').getBoundingClientRect().height;
})()`;

const evalRes = await send("Runtime.evaluate", { expression: setup, awaitPromise: true, returnByValue: true });
if (evalRes.result?.exceptionDetails || evalRes.exceptionDetails) {
  console.error("eval error:", JSON.stringify(evalRes.exceptionDetails || evalRes.result));
}
const height = Math.ceil((evalRes.result?.value || 3200)) + 80;
console.log("result-card height:", height);

await send("Emulation.setDeviceMetricsOverride", { width: WIDTH, height, deviceScaleFactor: 2, mobile: true });
await sleep(300);

const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: WIDTH, height, scale: 1 } });
fs.writeFileSync(OUT, Buffer.from(shot.result.data, "base64"));
console.log("saved", OUT);

ws.close();
chrome.kill();
fs.rmSync(userDir, { recursive: true, force: true });
process.exit(0);
