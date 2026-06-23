// Drive the new share flow (captureShare) for a given MODE, intercept the generated
// image (via a stubbed window.open), render it, and screenshot it.
import { spawn } from "node:child_process";
import fs from "node:fs"; import os from "node:os";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9338, WIDTH = 430;
const MODE = process.env.MODE || "key";
const userDir = fs.mkdtempSync(os.tmpdir() + "/cdp-");
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${userDir}`,
  "--hide-scrollbars","--no-first-run","--no-default-browser-check","--force-device-scale-factor=2",`--window-size=${WIDTH},900`,"about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const getJSON = async p => (await fetch(`http://127.0.0.1:${PORT}${p}`)).json();
let target; for (let i=0;i<50;i++){ try{const l=await getJSON("/json");target=l.find(t=>t.type==="page");if(target?.webSocketDebuggerUrl)break;}catch{} await sleep(200);}
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id=0; const pending=new Map(), events=[];
ws.addEventListener("message",ev=>{const m=JSON.parse(ev.data);if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);}else if(m.method)events.push(m);});
await new Promise(r=>ws.addEventListener("open",r));
const send=(method,params={})=>{const myId=++id;return new Promise(res=>{pending.set(myId,res);ws.send(JSON.stringify({id:myId,method,params}));});};
const waitEvent=(m,ms=8000)=>new Promise((resolve,reject)=>{const t0=Date.now();const tick=()=>{const e=events.find(x=>x.method===m);if(e)return resolve(e);if(Date.now()-t0>ms)return reject(new Error("timeout "+m));setTimeout(tick,50);};tick();});
await send("Page.enable"); await send("Runtime.enable");
await send("Page.navigate",{url:"http://127.0.0.1:8765/?flow=result"});
await waitEvent("Page.loadEventFired");

const expr = `(async () => {
  for (let i=0;i<80;i++){ if(document.querySelector('.ability-section') && document.querySelector('.result-card.is-revealed')) break; await new Promise(r=>setTimeout(r,100)); }
  window.__shot = { html: "" };
  const realOpen = window.open;
  window.open = function(){ return { closed:false, document:{ open(){}, close(){}, write(s){ window.__shot.html += s; } }, close(){ this.closed=true; } }; };
  try { await captureShare(${JSON.stringify(MODE)}); } catch(e){ window.open=realOpen; return JSON.stringify({ok:false, err:String(e)}); }
  window.open = realOpen;
  const m = window.__shot.html.match(/src=\\"(data:image\\/png;base64,[^\\"]+)\\"/);
  if(!m) return JSON.stringify({ok:false, htmlLen: window.__shot.html.length, head: window.__shot.html.slice(0,200)});
  const url = m[1];
  document.body.style.margin='0';
  document.body.innerHTML = '<img id="__cap" src="'+url+'" style="display:block;width:'+${WIDTH}+'px">';
  const im = document.getElementById('__cap');
  await new Promise(r=>{ im.complete && im.naturalWidth ? r() : (im.onload=r, im.onerror=r); });
  const rect = im.getBoundingClientRect();
  return JSON.stringify({ok:true, w: im.naturalWidth, h: im.naturalHeight, dispH: Math.ceil(rect.height)});
})()`;
const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true, timeout: 60000 });
if (r.result.exceptionDetails) { console.error("EXC", JSON.stringify(r.result.exceptionDetails).slice(0,400)); }
const info = JSON.parse(r.result.result.value);
console.log("MODE="+MODE, info.ok ? `capture OK: natural ${info.w}x${info.h}, displayH ${info.dispH}` : `FAIL: ${JSON.stringify(info)}`);
if (info.ok) {
  const H = info.dispH + 20;
  await send("Emulation.setDeviceMetricsOverride", { width: WIDTH, height: H, deviceScaleFactor: 2, mobile: true });
  await sleep(300);
  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x:0,y:0,width:WIDTH,height:H,scale:1 } });
  const out = `/tmp/gaokao-share-${MODE}.png`;
  fs.writeFileSync(out, Buffer.from(shot.result.data, "base64"));
  console.log("saved", out);
}
ws.close(); chrome.kill(); fs.rmSync(userDir,{recursive:true,force:true}); process.exit(0);
