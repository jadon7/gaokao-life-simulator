// Verify: captureShare shows in-app viewer with the image; live result-card untouched; no window.open.
import { spawn } from "node:child_process";
import fs from "node:fs"; import os from "node:os";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9344, WIDTH = 430; const MODE = process.env.MODE || "key";
const userDir = fs.mkdtempSync(os.tmpdir() + "/cdp-");
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${userDir}`,
  "--hide-scrollbars","--no-first-run","--no-default-browser-check","--force-device-scale-factor=2",`--window-size=${WIDTH},900`,"about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const getJSON = async p => (await fetch(`http://127.0.0.1:${PORT}${p}`)).json();
let target; for (let i=0;i<50;i++){ try{const l=await getJSON("/json");target=l.find(t=>t.type==="page");if(target?.webSocketDebuggerUrl)break;}catch{} await sleep(200);}
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id=0; const pending=new Map(), events=[], errors=[];
ws.addEventListener("message",ev=>{const m=JSON.parse(ev.data);if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);}else if(m.method){events.push(m);if(m.method==="Runtime.exceptionThrown")errors.push("exc");}});
await new Promise(r=>ws.addEventListener("open",r));
const send=(method,params={})=>{const myId=++id;return new Promise(res=>{pending.set(myId,res);ws.send(JSON.stringify({id:myId,method,params}));});};
const waitEvent=(m,ms=8000)=>new Promise((res,rej)=>{const t0=Date.now();const tk=()=>{const e=events.find(x=>x.method===m);if(e)return res(e);if(Date.now()-t0>ms)return rej(new Error("t/o"));setTimeout(tk,50);};tk();});
await send("Page.enable"); await send("Runtime.enable");
await send("Page.navigate",{url:"http://127.0.0.1:8765/?flow=result"});
await waitEvent("Page.loadEventFired"); await sleep(2000);

const expr = `(async () => {
  let openedTab = false; const realOpen = window.open; window.open = function(){ openedTab = true; return realOpen.apply(this, arguments); };
  for (let i=0;i<80;i++){ if(document.querySelector('.result-card.is-revealed')&&document.querySelector('.ability-section')) break; await new Promise(r=>setTimeout(r,100)); }
  try { await captureShare(${JSON.stringify(MODE)}); } catch(e){ return JSON.stringify({err:String(e)}); }
  window.open = realOpen;
  const v = document.querySelector('#shareViewer');
  const img = document.querySelector('#shareViewerBody img');
  const live = document.querySelector('.result-card');
  return JSON.stringify({
    openedTab,
    viewerShown: v ? !v.hidden : false,
    hasImg: !!img,
    imgSrc: img ? img.src.slice(0,12) : '',
    liveHasFooter: !!live.querySelector('.share-qr-footer'),
    liveCapturing: live.classList.contains('is-capturing') || live.classList.contains('capture-key'),
    liveSections: { yearning: !!live.querySelector('.yearning-section'), highlights: !!live.querySelector('#resultHighlights'), guides: !!live.querySelector('#resultGuides') },
    holders: document.querySelectorAll('body > div[style*="-99999"]').length
  });
})()`;
const r = await send("Runtime.evaluate",{expression:expr,awaitPromise:true,returnByValue:true,timeout:60000});
if (r.result.exceptionDetails) console.error("EXC", JSON.stringify(r.result.exceptionDetails).slice(0,300));
console.log("MODE="+MODE, r.result.result.value, "| JS errors:", errors.length);
await sleep(400);
const shot = await send("Page.captureScreenshot",{format:"png"});
fs.writeFileSync(`/tmp/gaokao-viewer-${MODE}.png`, Buffer.from(shot.result.data,"base64"));
console.log("saved /tmp/gaokao-viewer-"+MODE+".png");
ws.close(); chrome.kill(); try{fs.rmSync(userDir,{recursive:true,force:true});}catch(e){} process.exit(0);
