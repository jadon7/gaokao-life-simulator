// Verify required-field gating on entry + setup screens.
import { spawn } from "node:child_process";
import fs from "node:fs"; import os from "node:os";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9345, WIDTH = 430;
const userDir = fs.mkdtempSync(os.tmpdir() + "/cdp-");
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${userDir}`,
  "--hide-scrollbars","--no-first-run","--no-default-browser-check","--force-device-scale-factor=2",`--window-size=${WIDTH},900`,"about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const getJSON = async p => (await fetch(`http://127.0.0.1:${PORT}${p}`)).json();
let target; for (let i=0;i<50;i++){ try{const l=await getJSON("/json");target=l.find(t=>t.type==="page");if(target?.webSocketDebuggerUrl)break;}catch{} await sleep(200);}
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id=0; const pending=new Map(), events=[], errors=[];
ws.addEventListener("message",ev=>{const m=JSON.parse(ev.data);if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);}else if(m.method){events.push(m);if(m.method==="Runtime.exceptionThrown")errors.push(m.params?.exceptionDetails?.exception?.description||"exc");}});
await new Promise(r=>ws.addEventListener("open",r));
const send=(method,params={})=>{const myId=++id;return new Promise(res=>{pending.set(myId,res);ws.send(JSON.stringify({id:myId,method,params}));});};
const waitEvent=(m,ms=8000)=>new Promise((res,rej)=>{const t0=Date.now();const tk=()=>{const e=events.find(x=>x.method===m);if(e)return res(e);if(Date.now()-t0>ms)return rej(new Error("t/o"));setTimeout(tk,50);};tk();});
await send("Page.enable"); await send("Runtime.enable");
await send("Page.navigate",{url:"http://127.0.0.1:8765/"});
await waitEvent("Page.loadEventFired"); await sleep(1500);

const expr = `(() => {
  const steps = [];
  const entryBtn = () => document.querySelector('#entryStart').disabled;
  const setupBtn = () => document.querySelector('#applyProfile').disabled;
  const fireInput = (el, val) => { el.value = val; el.dispatchEvent(new Event('input', {bubbles:true})); };
  steps.push(['initial flow', document.body.dataset.flow]);
  steps.push(['entry btn disabled @ start', entryBtn()]);
  steps.push(['active gender cards @ start', document.querySelectorAll('.gender-card.is-active').length]);
  // pick gender
  selectAvatarById('男1', false);
  steps.push(['entry btn after gender (no name)', entryBtn()]);
  // type name
  fireInput(document.querySelector('#entryName'), '阿测');
  steps.push(['entry btn after gender+name', entryBtn()]);
  // go to setup
  enterSetupFromCover();
  steps.push(['flow after entry', document.body.dataset.flow]);
  steps.push(['placeholder card text', (document.querySelector('.major-chip-empty .cf-body b')||{}).textContent]);
  steps.push(['state.major @ setup start', JSON.stringify(window.state ? state.major : 'n/a')]);
  steps.push(['setup btn disabled @ start', setupBtn()]);
  // select a real major (index 1 = first real major in majorCardKeys)
  selectMajorByIndex(1, false);
  steps.push(['setup btn after major (no prov/score)', setupBtn()]);
  // fill province + score
  fireInput(document.querySelector('#province'), '浙江');
  fireInput(document.querySelector('#score'), '588');
  steps.push(['setup btn after major+prov+score', setupBtn()]);
  // invalid score
  fireInput(document.querySelector('#score'), '999');
  steps.push(['setup btn with invalid score(999)', setupBtn()]);
  fireInput(document.querySelector('#score'), '588');
  steps.push(['setup btn valid, no hope (want true)', setupBtn()]);
  document.querySelector('#familyHopeOptions button[data-value="稳定且体面"]').click();
  steps.push(['setup btn after hope picked (want false)', setupBtn()]);
  return JSON.stringify(steps);
})()`;
const r = await send("Runtime.evaluate",{expression:expr,returnByValue:true});
if (r.result.exceptionDetails) console.error("EXC", JSON.stringify(r.result.exceptionDetails).slice(0,400));
const steps = JSON.parse(r.result.result.value||"[]");
for (const [k,v] of steps) console.log("  "+k+":", v);
console.log("JS errors:", errors.length ? errors : "none");
ws.close(); chrome.kill(); try{fs.rmSync(userDir,{recursive:true,force:true});}catch(e){} process.exit(0);
