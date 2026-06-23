// Capture the play-screen header to confirm the "人生扭蛋机" label.
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9336, WIDTH = 430, APP = "http://127.0.0.1:8765/?flow=play";
const userDir = fs.mkdtempSync(os.tmpdir() + "/cdp-");
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${userDir}`,
  "--hide-scrollbars", "--no-first-run", "--no-default-browser-check", "--force-device-scale-factor=2",
  `--window-size=${WIDTH},900`, "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const getJSON = async p => (await fetch(`http://127.0.0.1:${PORT}${p}`)).json();
let target;
for (let i = 0; i < 50; i++) { try { const l = await getJSON("/json"); target = l.find(t => t.type === "page"); if (target?.webSocketDebuggerUrl) break; } catch {} await sleep(200); }
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id = 0; const pending = new Map(); const events = [];
ws.addEventListener("message", ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } else if (m.method) events.push(m); });
await new Promise(r => ws.addEventListener("open", r));
const send = (method, params = {}) => { const myId = ++id; return new Promise(res => { pending.set(myId, res); ws.send(JSON.stringify({ id: myId, method, params })); }); };
const waitEvent = (m, ms = 8000) => new Promise((resolve, reject) => { const t0 = Date.now(); const tick = () => { const e = events.find(x => x.method === m); if (e) return resolve(e); if (Date.now() - t0 > ms) return reject(new Error("timeout " + m)); setTimeout(tick, 50); }; tick(); });
await send("Page.enable"); await send("Runtime.enable");
await send("Page.navigate", { url: APP });
await waitEvent("Page.loadEventFired");
const probe = `(async () => {
  for (let i=0;i<100;i++){ const ps=document.querySelector('.play-screen'); if(ps && getComputedStyle(ps).display!=='none' && document.querySelector('.play-brand small')) break; await new Promise(r=>setTimeout(r,100)); }
  const h = document.querySelector('.play-head'); const b = h?.getBoundingClientRect();
  return JSON.stringify({ label: document.querySelector('.play-brand small')?.textContent||'', h: b? Math.ceil(b.bottom)+16 : 160 });
})()`;
const r = await send("Runtime.evaluate", { expression: probe, awaitPromise: true, returnByValue: true });
const info = JSON.parse(r.result.result.value);
console.log("play-brand label:", info.label);
await send("Emulation.setDeviceMetricsOverride", { width: WIDTH, height: info.h, deviceScaleFactor: 2, mobile: true });
await sleep(300);
const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: WIDTH, height: info.h, scale: 1 } });
fs.writeFileSync("/tmp/gaokao-play-head.png", Buffer.from(shot.result.data, "base64"));
console.log("saved /tmp/gaokao-play-head.png");
ws.close(); chrome.kill(); fs.rmSync(userDir, { recursive: true, force: true }); process.exit(0);
