import { spawn } from "node:child_process";
import fs from "node:fs"; import os from "node:os";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9347, WIDTH = 393, H = 852;
const userDir = fs.mkdtempSync(os.tmpdir() + "/cdp-");
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${userDir}`,
  "--hide-scrollbars","--no-first-run","--no-default-browser-check","--force-device-scale-factor=2",`--window-size=${WIDTH},${H}`,"about:blank"], { stdio: "ignore" });
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
await send("Emulation.setDeviceMetricsOverride",{width:WIDTH,height:H,deviceScaleFactor:2,mobile:true});
await send("Page.navigate",{url:"http://127.0.0.1:8765/?flow=play"});
await waitEvent("Page.loadEventFired");
// wait for a real card (title + choices)
const probe = `(async()=>{ for(let i=0;i<100;i++){ const t=document.querySelector('.card-title'); const c=document.querySelectorAll('.choice-pill').length; if(t && t.textContent && t.textContent!=='' && c>=2 && !document.querySelector('.loading-card')) return JSON.stringify({title:t.textContent.slice(0,20), pills:c, pillHTML:(document.querySelector('.choice-pill')||{}).outerHTML?.slice(0,200), year:(document.querySelector('.play-year')||{}).textContent, note: !!document.querySelector('.previous-note')}); await new Promise(r=>setTimeout(r,100)); } return JSON.stringify({timeout:true, hasLoading:!!document.querySelector('.loading-card'), anyCard:!!document.querySelector('.life-card')}); })()`;
const r = await send("Runtime.evaluate",{expression:probe,awaitPromise:true,returnByValue:true});
console.log("PROBE:", r.result.result.value);
await sleep(400);
const shot = await send("Page.captureScreenshot",{format:"png"});
fs.writeFileSync("/tmp/gaokao-play2.png", Buffer.from(shot.result.data,"base64"));
console.log("saved /tmp/gaokao-play2.png");
ws.close(); chrome.kill(); try{fs.rmSync(userDir,{recursive:true,force:true});}catch(e){} process.exit(0);
