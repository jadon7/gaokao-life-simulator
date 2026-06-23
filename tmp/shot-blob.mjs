// Verify the blob-URL viewer renders the image (navigate the tab to the generated blob page).
import { spawn } from "node:child_process";
import fs from "node:fs"; import os from "node:os";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9340, WIDTH = 430; const MODE = process.env.MODE || "key";
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
await waitEvent("Page.loadEventFired"); await sleep(1500);

const expr = `(async () => {
  for (let i=0;i<80;i++){ if(document.querySelector('.ability-section')&&document.querySelector('.result-card.is-revealed')) break; await new Promise(r=>setTimeout(r,100)); }
  window.__pageUrl=null;
  const realOpen = window.open;
  window.open = () => ({ closed:false, document:{open(){},write(){},close(){}}, location:{ replace(u){ window.__pageUrl=u; } } });
  try { await captureShare(${JSON.stringify(MODE)}); } catch(e){ window.open=realOpen; return "err:"+e; }
  window.open = realOpen;
  // sanity: fetch the page blob + the inner img blob
  let info = { pageUrl: window.__pageUrl };
  try { const html = await (await fetch(window.__pageUrl)).text(); const m = html.match(/src=\\"(blob:[^\\"]+)\\"/); const ib = await (await fetch(m[1])).blob(); info.imgType=ib.type; info.imgKB=Math.round(ib.size/1024); } catch(e){ info.fetchErr=String(e); }
  return JSON.stringify(info);
})()`;
const r = await send("Runtime.evaluate",{expression:expr,awaitPromise:true,returnByValue:true,timeout:60000});
console.log("result:", r.result?.result?.value || JSON.stringify(r.result?.exceptionDetails||{}).slice(0,200));
const info = JSON.parse(r.result.result.value);
if (!info.pageUrl) { console.log("no pageUrl"); ws.close(); chrome.kill(); process.exit(1); }
// navigate this tab to the generated blob page and screenshot
await send("Page.navigate",{url: info.pageUrl});
await sleep(1500);
const dim = await send("Runtime.evaluate",{expression:`(()=>{const im=document.querySelector('img');return JSON.stringify({hasImg:!!im,w:im?im.naturalWidth:0,h:im?im.naturalHeight:0});})()`,returnByValue:true});
console.log("viewer:", dim.result.result.value);
const d = JSON.parse(dim.result.result.value);
const H = d.w ? Math.ceil(WIDTH * d.h / d.w) + 60 : 800;
await send("Emulation.setDeviceMetricsOverride",{width:WIDTH,height:Math.min(H,1700),deviceScaleFactor:2,mobile:true});
await sleep(400);
const shot = await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:true,clip:{x:0,y:0,width:WIDTH,height:Math.min(H,1700),scale:1}});
fs.writeFileSync(`/tmp/gaokao-newtab-${MODE}.png`, Buffer.from(shot.result.data,"base64"));
console.log("saved /tmp/gaokao-newtab-"+MODE+".png");
ws.close(); chrome.kill(); fs.rmSync(userDir,{recursive:true,force:true}); process.exit(0);
