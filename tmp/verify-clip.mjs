// Run captureShare('full'), then render the resulting image full-height and screenshot to check for clipping.
import { spawn } from "node:child_process";
import fs from "node:fs"; import os from "node:os";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9348, WIDTH = 430;
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
const waitEvent=(m,ms=8000)=>new Promise((res,rej)=>{const t0=Date.now();const tk=()=>{const e=events.find(x=>x.method===m);if(e)return res(e);if(Date.now()-t0>ms)return rej(new Error("t/o"));setTimeout(tk,50);};tk();});
await send("Page.enable"); await send("Runtime.enable");
await send("Page.navigate",{url:"http://127.0.0.1:8765/?flow=result"});
await waitEvent("Page.loadEventFired"); await sleep(2000);
const expr = `(async()=>{
  for(let i=0;i<80;i++){ if(document.querySelector('.result-card.is-revealed')&&document.querySelector('.ability-section')) break; await new Promise(r=>setTimeout(r,100)); }
  await captureShare('full');
  for(let i=0;i<60;i++){ const im=document.querySelector('#shareViewerBody img'); if(im&&im.naturalWidth) return JSON.stringify({w:im.naturalWidth,h:im.naturalHeight}); await new Promise(r=>setTimeout(r,100)); }
  return JSON.stringify({fail:true});
})()`;
const r = await send("Runtime.evaluate",{expression:expr,awaitPromise:true,returnByValue:true,timeout:60000});
const info = JSON.parse(r.result.result.value); console.log("img:", info);
// the viewer body shows the img at max-width 480; compute display height, set tall viewport, screenshot
const dispW = Math.min(480, WIDTH); const dispH = Math.ceil(info.h * dispW / info.w) + 80;
await send("Emulation.setDeviceMetricsOverride",{width:WIDTH,height:Math.min(dispH,2400),deviceScaleFactor:1,mobile:true});
await sleep(400);
const shot = await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:true,clip:{x:0,y:0,width:WIDTH,height:Math.min(dispH,2400),scale:1}});
fs.writeFileSync("/tmp/gaokao-clipcheck.png", Buffer.from(shot.result.data,"base64"));
console.log("saved /tmp/gaokao-clipcheck.png  (full img h="+dispH+")");
ws.close(); chrome.kill(); try{fs.rmSync(userDir,{recursive:true,force:true});}catch(e){} process.exit(0);
