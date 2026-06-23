// Measure rendered display sizes of image elements at the shell's max width.
import { spawn } from "node:child_process";
import fs from "node:fs"; import os from "node:os";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9337, WIDTH = 430;
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

async function go(url, expr){
  await send("Page.navigate",{url});
  await waitEvent("Page.loadEventFired");
  await sleep(1200);
  const r = await send("Runtime.evaluate",{expression:expr,awaitPromise:true,returnByValue:true});
  if (r.result.exceptionDetails) return "EXC "+JSON.stringify(r.result.exceptionDetails).slice(0,200);
  return r.result.result.value;
}
const measure = sel => `(()=>{const el=document.querySelector('${sel}');if(!el)return '${sel}: (none)';const b=el.getBoundingClientRect();return '${sel}: '+Math.round(b.width)+'x'+Math.round(b.height);})()`;

console.log("DPR(real devices vary; here forced 2)");
console.log(await go("http://127.0.0.1:8765/?flow=play", `(async()=>{for(let i=0;i<60;i++){if(document.querySelector('.card-illustration'))break;await new Promise(r=>setTimeout(r,100));} return ${measure('.card-illustration')};})()`));
console.log(await go("http://127.0.0.1:8765/?flow=result", `(async()=>{for(let i=0;i<60;i++){if(document.querySelector('.ability-section'))break;await new Promise(r=>setTimeout(r,100));}
  const out=[];
  for (const s of ['.ability-figure','.ability-figure img','.ability-portrait','.ability-portrait img','.ability-top img','.ability-section img']){const el=document.querySelector(s);if(el){const b=el.getBoundingClientRect();out.push(s+': '+Math.round(b.width)+'x'+Math.round(b.height));}}
  return out.join('\\n')||'(no ability img found)';})()`));
console.log(await go("http://127.0.0.1:8765/?flow=setup", `(async()=>{for(let i=0;i<60;i++){if(document.querySelector('.avatar-grid, .avatar-coverflow, #avatarGrid'))break;await new Promise(r=>setTimeout(r,100));}
  const out=[];
  for (const s of ['#avatarGrid .avatar-card','.avatar-coverflow .avatar-card','.avatar-photo','[class*=avatar] img','.profile-portrait','#portrait']){const el=document.querySelector(s);if(el){const b=el.getBoundingClientRect();out.push(s+': '+Math.round(b.width)+'x'+Math.round(b.height));}}
  return out.join('\\n')||'(no avatar el found)';})()`));
ws.close(); chrome.kill(); fs.rmSync(userDir,{recursive:true,force:true}); process.exit(0);
