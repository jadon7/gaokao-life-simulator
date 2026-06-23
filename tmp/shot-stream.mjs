// Verify progressive result rendering: load result, then simulate mid-stream prefixes.
import { spawn } from "node:child_process";
import fs from "node:fs"; import os from "node:os";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9341, WIDTH = 430;
const userDir = fs.mkdtempSync(os.tmpdir() + "/cdp-");
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${userDir}`,
  "--hide-scrollbars","--no-first-run","--no-default-browser-check","--force-device-scale-factor=2",`--window-size=${WIDTH},900`,"about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const getJSON = async p => (await fetch(`http://127.0.0.1:${PORT}${p}`)).json();
let target; for (let i=0;i<50;i++){ try{const l=await getJSON("/json");target=l.find(t=>t.type==="page");if(target?.webSocketDebuggerUrl)break;}catch{} await sleep(200);}
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id=0; const pending=new Map(), events=[], errors=[];
ws.addEventListener("message",ev=>{const m=JSON.parse(ev.data);
  if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);}
  else if(m.method){events.push(m); if(m.method==="Runtime.exceptionThrown") errors.push(m.params?.exceptionDetails?.exception?.description||m.params?.exceptionDetails?.text||"exc");}
});
await new Promise(r=>ws.addEventListener("open",r));
const send=(method,params={})=>{const myId=++id;return new Promise(res=>{pending.set(myId,res);ws.send(JSON.stringify({id:myId,method,params}));});};
const waitEvent=(m,ms=8000)=>new Promise((resolve,reject)=>{const t0=Date.now();const tick=()=>{const e=events.find(x=>x.method===m);if(e)return resolve(e);if(Date.now()-t0>ms)return reject(new Error("timeout "+m));setTimeout(tick,50);};tick();});
await send("Page.enable"); await send("Runtime.enable");
await send("Page.navigate",{url:"http://127.0.0.1:8765/?flow=result"});
await waitEvent("Page.loadEventFired"); await sleep(2000);

async function shoot(name){
  const h = JSON.parse((await send("Runtime.evaluate",{expression:`JSON.stringify({h: Math.ceil(document.querySelector('.result-card').getBoundingClientRect().height)+40})`,returnByValue:true})).result.result.value).h;
  await send("Emulation.setDeviceMetricsOverride",{width:WIDTH,height:Math.min(h,2000),deviceScaleFactor:2,mobile:true});
  await sleep(300);
  const shot = await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:true,clip:{x:0,y:0,width:WIDTH,height:Math.min(h,2000),scale:1}});
  fs.writeFileSync(`/tmp/gaokao-stream-${name}.png`, Buffer.from(shot.result.data,"base64"));
  console.log("saved /tmp/gaokao-stream-"+name+".png (h="+h+")");
}

// 1) final (done path) state
const finalState = await send("Runtime.evaluate",{expression:`(()=>{const c=document.querySelector('.result-card');return JSON.stringify({revealed:c.classList.contains('is-revealed'), streaming:c.classList.contains('is-streaming'), title:document.querySelector('#resultTitle')?.textContent?.slice(0,30), ability:!!document.querySelector('.ability-section'), scenes:document.querySelectorAll('.result-scene').length});})()`,returnByValue:true});
console.log("FINAL:", finalState.result.result.value);
await shoot("final");

// 2) simulate a mid-stream prefix (~45% of the JSON)
const sim = await send("Runtime.evaluate",{expression:`(()=>{
  const full = JSON.stringify(state.result);
  const cut = Math.floor(full.length*0.45);
  const partial = extractResultStreamFields(full.slice(0, cut));
  renderResultStreaming(partial);
  return JSON.stringify({cut, title:partial.title, status:!!partial.status42, note:!!partial.majorCareerNote, scenes:(partial.famousScenes||[]).length, yearningKw:partial.innerYearning?.keyword||"", streamingClass: document.querySelector('.result-card').classList.contains('is-streaming')});
})()`,returnByValue:true});
console.log("MIDSTREAM:", sim.result.result.value);
await shoot("mid");
console.log("JS ERRORS:", errors.length ? errors : "none");
ws.close(); chrome.kill(); try{fs.rmSync(userDir,{recursive:true,force:true});}catch(e){}
process.exit(0);
