// Verify the built-in ?flow=result shortcut renders the result page (no state injection).
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9334;
const APP = "http://127.0.0.1:8765/?flow=result";
const OUT = "/tmp/gaokao-flow-result.png";
const WIDTH = 430;

const userDir = fs.mkdtempSync(os.tmpdir() + "/cdp-");
const chrome = spawn(CHROME, [
  "--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${userDir}`,
  "--hide-scrollbars", "--no-first-run", "--no-default-browser-check",
  "--force-device-scale-factor=2", `--window-size=${WIDTH},2400`, "about:blank"
], { stdio: "ignore" });

const sleep = ms => new Promise(r => setTimeout(r, ms));
const getJSON = async p => (await fetch(`http://127.0.0.1:${PORT}${p}`)).json();

let target;
for (let i = 0; i < 50; i++) {
  try { const l = await getJSON("/json"); target = l.find(t => t.type === "page"); if (target?.webSocketDebuggerUrl) break; } catch {}
  await sleep(200);
}
if (!target) { console.error("no target"); chrome.kill(); process.exit(1); }

const ws = new WebSocket(target.webSocketDebuggerUrl);
let id = 0; const pending = new Map(); const events = [];
ws.addEventListener("message", ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } else if (m.method) events.push(m); });
await new Promise(r => ws.addEventListener("open", r));
const send = (method, params = {}) => { const myId = ++id; return new Promise(res => { pending.set(myId, res); ws.send(JSON.stringify({ id: myId, method, params })); }); };
const waitEvent = (method, ms = 8000) => new Promise((resolve, reject) => { const t0 = Date.now(); const tick = () => { const e = events.find(x => x.method === method); if (e) return resolve(e); if (Date.now() - t0 > ms) return reject(new Error("timeout " + method)); setTimeout(tick, 50); }; tick(); });

await send("Page.enable");
await send("Runtime.enable");
await send("Page.navigate", { url: APP });
await waitEvent("Page.loadEventFired");

const probe = `(async () => {
  for (let i=0;i<100;i++){ if(document.querySelector('.result-card.is-revealed') && document.querySelector('.ability-section')) break; await new Promise(r=>setTimeout(r,100)); }
  const card = document.querySelector('.result-card');
  return JSON.stringify({
    flow: document.body.dataset.flow,
    revealed: !!document.querySelector('.result-card.is-revealed'),
    title: document.querySelector('#resultTitle')?.textContent?.slice(0,40) || '',
    ability: !!document.querySelector('.ability-section'),
    careerCards: document.querySelectorAll('.career-card').length,
    scenes: document.querySelectorAll('.result-scene').length,
    chronicle: document.querySelectorAll('.result-chronicle-item').length,
    height: card ? Math.round(card.getBoundingClientRect().height) : 0
  });
})()`;
const r = await send("Runtime.evaluate", { expression: probe, awaitPromise: true, returnByValue: true });
if (r.exceptionDetails) console.error("EXC", JSON.stringify(r.exceptionDetails));
console.log("PROBE:", r.result?.value);

const info = JSON.parse(r.result?.value || "{}");
const height = (info.height || 3200) + 80;
await send("Emulation.setDeviceMetricsOverride", { width: WIDTH, height, deviceScaleFactor: 2, mobile: true });
await sleep(300);
const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: WIDTH, height, scale: 1 } });
fs.writeFileSync(OUT, Buffer.from(shot.result.data, "base64"));
console.log("saved", OUT);
ws.close(); chrome.kill(); fs.rmSync(userDir, { recursive: true, force: true }); process.exit(0);
