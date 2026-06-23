// Navigate ?flow=result, then capture focused clips of the hero + 真实的你 regions.
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9335;
const APP = "http://127.0.0.1:8765/?flow=result";
const WIDTH = 430;

const userDir = fs.mkdtempSync(os.tmpdir() + "/cdp-");
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${userDir}`,
  "--hide-scrollbars", "--no-first-run", "--no-default-browser-check", "--force-device-scale-factor=2",
  `--window-size=${WIDTH},2400`, "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const getJSON = async p => (await fetch(`http://127.0.0.1:${PORT}${p}`)).json();

let target;
for (let i = 0; i < 50; i++) { try { const l = await getJSON("/json"); target = l.find(t => t.type === "page"); if (target?.webSocketDebuggerUrl) break; } catch {} await sleep(200); }
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id = 0; const pending = new Map(); const events = [];
ws.addEventListener("message", ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } else if (m.method) events.push(m); });
await new Promise(r => ws.addEventListener("open", r));
const send = (method, params = {}) => { const myId = ++id; return new Promise(res => { pending.set(myId, res); ws.send(JSON.stringify({ id: myId, method, params })); }); };
const waitEvent = (method, ms = 8000) => new Promise((resolve, reject) => { const t0 = Date.now(); const tick = () => { const e = events.find(x => x.method === method); if (e) return resolve(e); if (Date.now() - t0 > ms) return reject(new Error("timeout " + method)); setTimeout(tick, 50); }; tick(); });

await send("Page.enable"); await send("Runtime.enable");
await send("Page.navigate", { url: APP });
await waitEvent("Page.loadEventFired");

const rectsExpr = `(async () => {
  for (let i=0;i<100;i++){ if(document.querySelector('.result-card.is-revealed') && document.querySelector('.yearning-section')) break; await new Promise(r=>setTimeout(r,100)); }
  const cardH = Math.ceil(document.querySelector('.result-card').getBoundingClientRect().height) + 80;
  return JSON.stringify({ cardH });
})()`;
const r0 = await send("Runtime.evaluate", { expression: rectsExpr, awaitPromise: true, returnByValue: true });
if (r0.result.exceptionDetails) console.error("EXC0", JSON.stringify(r0.result.exceptionDetails).slice(0, 500));
const { cardH } = JSON.parse(r0.result.result.value);
await send("Emulation.setDeviceMetricsOverride", { width: WIDTH, height: cardH, deviceScaleFactor: 2, mobile: true });
await sleep(400);

const rectExpr = `(() => {
  const r = el => { if(!el) return null; const b = el.getBoundingClientRect(); return { x:Math.max(0,b.x-12), y:Math.max(0,b.y-12), w:b.width+24, h:b.height+24 }; };
  const card = document.querySelector('.result-card');
  const hero = document.querySelector('.result-hero');
  const overview = document.querySelector('#resultOverview');
  const cb = card.getBoundingClientRect(), ob = overview.getBoundingClientRect();
  const topClip = { x: 0, y: Math.max(0, cb.y-8), w: WIDTH, h: (ob.bottom - cb.y) + 24 };
  return JSON.stringify({ top: topClip, yearning: r(document.querySelector('.yearning-section')) });
})()`.replace("WIDTH", WIDTH);
const rr = await send("Runtime.evaluate", { expression: rectExpr, returnByValue: true });
if (rr.result.exceptionDetails) console.error("EXC1", JSON.stringify(rr.result.exceptionDetails).slice(0, 500));
const rects = JSON.parse(rr.result.result.value);

async function clip(name, c) {
  if (!c) { console.log("no rect for", name); return; }
  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: c.x, y: c.y, width: c.w || c.width, height: c.h || c.height, scale: 1 } });
  const out = `/tmp/gaokao-${name}.png`;
  fs.writeFileSync(out, Buffer.from(shot.result.data, "base64"));
  console.log("saved", out, JSON.stringify(c));
}
await clip("top", rects.top);
await clip("yearning", rects.yearning);

ws.close(); chrome.kill(); fs.rmSync(userDir, { recursive: true, force: true }); process.exit(0);
