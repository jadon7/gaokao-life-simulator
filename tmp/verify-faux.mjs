// Verify six-dim gating + faux-stream: skeleton before career, faux-stream reveal after.
import { spawn } from "node:child_process";
import fs from "node:fs"; import os from "node:os";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9343, WIDTH = 430;
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
await waitEvent("Page.loadEventFired"); await sleep(1800);

// Phase 1: no career -> six-dim skeleton
const p1 = await send("Runtime.evaluate",{expression:`(()=>{
  renderResultLoading();
  renderResultStreaming(extractResultStreamFields('{"title":"硬扛成事，现实拉扯，项目统筹","status42":"靠几次救场站稳脚跟"'));
  const ins=document.querySelector('#resultInsights');
  return JSON.stringify({ability:!!ins.querySelector('.ability-section'), skeleton:!!ins.querySelector('.sk-card')});
})()`,returnByValue:true});
console.log("BEFORE career:", p1.result.result.value);

// Phase 2: career present -> six-dim revealed with faux-stream
const p2 = await send("Runtime.evaluate",{expression:`(()=>{
  renderResultStreaming(extractResultStreamFields('{"title":"硬扛成事，现实拉扯，项目统筹","status42":"靠几次救场站稳脚跟","majorCareerNote":"这只是故事内估计，专业是起点。","careerPossibilities":[{"percent":55,"label":"主治医师"},{"percent":25,"label":"科研"},{"percent":20,"label":"管理"}]'));
  const ab=document.querySelector('.ability-section');
  const bars=[...document.querySelectorAll('.ability-track span')].map(s=>s.style.width);
  return JSON.stringify({ability:!!ab, faux:ab?ab.classList.contains('is-faux-stream'):false, rows:document.querySelectorAll('.ability-row').length, bars});
})()`,returnByValue:true});
console.log("AFTER career:", p2.result.result.value);

await sleep(2000); // let faux animation finish
const h = JSON.parse((await send("Runtime.evaluate",{expression:`JSON.stringify({h:Math.ceil(document.querySelector('.result-card').getBoundingClientRect().height)+40})`,returnByValue:true})).result.result.value).h;
await send("Emulation.setDeviceMetricsOverride",{width:WIDTH,height:Math.min(h,2000),deviceScaleFactor:2,mobile:true});
await sleep(300);
const shot=await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:true,clip:{x:0,y:0,width:WIDTH,height:Math.min(h,2000),scale:1}});
fs.writeFileSync("/tmp/gaokao-faux.png", Buffer.from(shot.result.data,"base64"));
console.log("saved /tmp/gaokao-faux.png  | JS errors:", errors.length);
ws.close(); chrome.kill(); try{fs.rmSync(userDir,{recursive:true,force:true});}catch(e){} process.exit(0);
