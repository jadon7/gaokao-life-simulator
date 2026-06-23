import { spawn } from "node:child_process";
import fs from "node:fs"; import os from "node:os";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9343, WIDTH = 430, H = 860;
const userDir = fs.mkdtempSync(os.tmpdir() + "/cdp-");
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${userDir}`,
  "--hide-scrollbars","--no-first-run","--no-default-browser-check","--force-device-scale-factor=2",`--window-size=${WIDTH},${H}`,"about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const getJSON = async p => (await fetch(`http://127.0.0.1:${PORT}${p}`)).json();
let target; for (let i=0;i<50;i++){ try{const l=await getJSON("/json");target=l.find(t=>t.type==="page");if(target?.webSocketDebuggerUrl)break;}catch{} await sleep(200);}
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id=0; const pending=new Map(), events=[], errors=[];
ws.addEventListener("message",ev=>{const m=JSON.parse(ev.data);if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);}else if(m.method){events.push(m);if(m.method==="Runtime.exceptionThrown")errors.push(m.params?.exceptionDetails?.exception?.description||m.params?.exceptionDetails?.text||"exc");if(m.method==="Log.entryAdded"&&m.params?.entry?.level==="error")errors.push("log:"+(m.params.entry.text||"").slice(0,80));}});
await new Promise(r=>ws.addEventListener("open",r));
const send=(method,params={})=>{const myId=++id;return new Promise(res=>{pending.set(myId,res);ws.send(JSON.stringify({id:myId,method,params}));});};
const waitEvent=(m,ms=8000)=>new Promise((res,rej)=>{const t0=Date.now();const tk=()=>{const e=events.find(x=>x.method===m);if(e)return res(e);if(Date.now()-t0>ms)return rej(new Error("t/o"));setTimeout(tk,50);};tk();});
await send("Page.enable"); await send("Runtime.enable"); await send("Log.enable");
await send("Emulation.setDeviceMetricsOverride",{width:WIDTH,height:H,deviceScaleFactor:2,mobile:true});
await send("Page.navigate",{url:"http://127.0.0.1:8765/"});
await waitEvent("Page.loadEventFired"); await sleep(1200);
await send("Runtime.evaluate",{expression:`selectAvatarById('男1',false); const n=document.querySelector('#entryName'); n.value='阿测'; n.dispatchEvent(new Event('input',{bubbles:true})); enterSetupFromCover();`,returnByValue:true});
await sleep(8000); // wait for rive CDN + wasm + render
const probe = `(()=>{
  const c=document.querySelector('#hintRiveCanvas');
  const fb=document.querySelector('.major-chip-hint svg.hint-arrow');
  let drawn=false, sampled=0;
  if(c){ try{ const ctx=c.getContext('2d'); const w=c.width,h=c.height; const d=ctx.getImageData(0,0,w,h).data; for(let i=3;i<d.length;i+=4){ if(d[i]>0){drawn=true; sampled++;} } }catch(e){ drawn='err:'+e.message; } }
  return JSON.stringify({ riveGlobal: !!(window.rive&&window.rive.Rive), canvasExists: !!c, canvasW: c?c.width:0, canvasH: c?c.height:0, riveInit: c?c.dataset.riveInit:null, fallbackSvg: !!fb, drawnPixels: sampled, drawn });
})()`;
const r = await send("Runtime.evaluate",{expression:probe,returnByValue:true});
console.log("PROBE:", r.result.result.value);
console.log("ERRORS:", errors.length?errors.slice(0,5):"none");
const shot = await send("Page.captureScreenshot",{format:"png"});
fs.writeFileSync("/tmp/gaokao-rive.png", Buffer.from(shot.result.data,"base64"));
console.log("saved /tmp/gaokao-rive.png");
ws.close(); chrome.kill(); try{fs.rmSync(userDir,{recursive:true,force:true});}catch(e){} process.exit(0);
