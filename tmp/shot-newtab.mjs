// Drive captureShare with REAL window.open, then attach to the opened tab and screenshot it.
import { spawn } from "node:child_process";
import fs from "node:fs"; import os from "node:os";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9339, WIDTH = 430;
const MODE = process.env.MODE || "key";
const userDir = fs.mkdtempSync(os.tmpdir() + "/cdp-");
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${userDir}`,
  "--hide-scrollbars","--no-first-run","--no-default-browser-check","--force-device-scale-factor=2",`--window-size=${WIDTH},900`,"about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const getJSON = async p => (await fetch(`http://127.0.0.1:${PORT}${p}`)).json();

function connect(wsUrl){
  const ws = new WebSocket(wsUrl);
  let id=0; const pending=new Map(), events=[];
  ws.addEventListener("message",ev=>{const m=JSON.parse(ev.data);if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);}else if(m.method)events.push(m);});
  const ready = new Promise(r=>ws.addEventListener("open",r));
  const send=(method,params={})=>{const myId=++id;return new Promise(res=>{pending.set(myId,res);ws.send(JSON.stringify({id:myId,method,params}));});};
  return { ws, ready, send };
}

let target; for (let i=0;i<50;i++){ try{const l=await getJSON("/json");target=l.find(t=>t.type==="page");if(target?.webSocketDebuggerUrl)break;}catch{} await sleep(200);}
const origUrl = target.webSocketDebuggerUrl;
const a = connect(origUrl); await a.ready;
await a.send("Page.enable"); await a.send("Runtime.enable");
await a.send("Page.navigate",{url:"http://127.0.0.1:8765/?flow=result"});
await sleep(2500);
// kick off capture (real window.open). Don't await fully-block forever; give it time.
const expr = `(async () => {
  for (let i=0;i<80;i++){ if(document.querySelector('.ability-section')&&document.querySelector('.result-card.is-revealed')) break; await new Promise(r=>setTimeout(r,100)); }
  try { await captureShare(${JSON.stringify(MODE)}); return "done"; } catch(e){ return "err:"+e; }
})()`;
const res = await a.send("Runtime.evaluate",{expression:expr,awaitPromise:true,returnByValue:true,timeout:60000});
console.log("captureShare ->", res.result?.result?.value || JSON.stringify(res.result?.exceptionDetails||{}).slice(0,200));
await sleep(1500);

// find the new tab (blob: url or not the original result page)
const list = await getJSON("/json");
const pages = list.filter(t=>t.type==="page");
const newTab = pages.find(t => t.url.startsWith("blob:") || (t.url==="about:blank")) || pages.find(t=>!t.url.includes("flow=result"));
console.log("tabs:", pages.map(p=>p.url.slice(0,60)));
if (!newTab) { console.log("NO NEW TAB FOUND"); a.ws.close(); chrome.kill(); process.exit(1); }

const b = connect(newTab.webSocketDebuggerUrl); await b.ready;
await b.send("Page.enable"); await b.send("Runtime.enable");
await sleep(800);
const dim = await b.send("Runtime.evaluate",{expression:`(()=>{const im=document.querySelector('img');return JSON.stringify({hasImg:!!im, w: im?im.naturalWidth:0, h: im?im.naturalHeight:0, bodyText: document.body? document.body.innerText.slice(0,40):''});})()`,returnByValue:true});
console.log("newtab content:", dim.result?.result?.value);
const info = JSON.parse(dim.result.result.value||"{}");
const H = info.h ? Math.min(1600, Math.ceil(info.w? (WIDTH*info.h/info.w):800)+40) : 700;
await b.send("Emulation.setDeviceMetricsOverride",{width:WIDTH,height:H,deviceScaleFactor:2,mobile:true});
await sleep(400);
const shot = await b.send("Page.captureScreenshot",{format:"png",captureBeyondViewport:true,clip:{x:0,y:0,width:WIDTH,height:H,scale:1}});
const out = `/tmp/gaokao-newtab-${MODE}.png`;
fs.writeFileSync(out, Buffer.from(shot.result.data,"base64"));
console.log("saved", out);
a.ws.close(); b.ws.close(); chrome.kill(); fs.rmSync(userDir,{recursive:true,force:true}); process.exit(0);
