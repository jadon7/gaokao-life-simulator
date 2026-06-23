// Verify extractResultStreamFields yields sections top-to-bottom with the new schema order.
import { spawn } from "node:child_process";
import fs from "node:fs"; import os from "node:os";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9342;
const userDir = fs.mkdtempSync(os.tmpdir() + "/cdp-");
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${userDir}`,
  "--hide-scrollbars","--no-first-run","--no-default-browser-check","about:blank"], { stdio: "ignore" });
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
await waitEvent("Page.loadEventFired"); await sleep(1500);

const expr = `(() => {
  const full = JSON.stringify({
    title:"嘴硬心软，项目救场，产品经理", status42:"靠几次救场站稳脚跟，也留下关系旧账",
    majorCareerNote:"这只是故事内估计，不是现实建议，专业是起点。",
    careerPossibilities:[{percent:55,label:"主治医师"},{percent:25,label:"科研"},{percent:20,label:"管理"}],
    innerYearning:{keyword:"家庭",core:"向往一个锚点。",evidence:"18次里家庭14次。",sacrifice:"牺牲了陪伴。",temperament:"沉默的承担。"},
    famousScenes:[{title:"表情包危机",body:"翻车被截图。"},{title:"合照起哄",body:"没否认。"},{title:"关系补考",body:"这周排满了。"}],
    timelineBlocks:[{title:"第一波活",body:"先露脸。"},{title:"第一次付代价",body:"通宵。"},{title:"关系线收束",body:"体面告别。"}],
    shareHooks:["这条线像我","原来专业只是新手村"],
    choiceHabit:{title:"先上桌",body:"先救场。"}, mentalPrep:{title:"学会说不",body:"别熬夜。"}, letter18:{title:"给十八岁",body:"留点时间。"}
  });
  const ready = (p) => ({
    title: !!p.title, summary: !!p.status42, overview: !!p.majorCareerNote,
    yearning: !!(p.innerYearning && (p.innerYearning.keyword||p.innerYearning.core||p.innerYearning.evidence)),
    scenes: (p.famousScenes||[]).length>0, timeline:(p.timelineBlocks||[]).length>0, hooks:(p.shareHooks||[]).length>0,
    guides: !!((p.choiceHabit&&p.choiceHabit.title)||(p.mentalPrep&&p.mentalPrep.title)||(p.letter18&&p.letter18.title))
  });
  const sections = ["title","summary","overview","yearning","scenes","timeline","hooks","guides"];
  const firstReady = {};
  for (let cut=20; cut<=full.length; cut+=15){
    const r = ready(extractResultStreamFields(full.slice(0,cut)));
    sections.forEach(s=>{ if(r[s] && firstReady[s]==null) firstReady[s]=cut; });
  }
  // also a targeted check: yearning present but scenes not -> yearning fields clean (not bled)
  const yIdx = full.indexOf('"famousScenes"');
  const pY = extractResultStreamFields(full.slice(0, yIdx));
  const order = sections.filter(s=>firstReady[s]!=null).sort((a,b)=>firstReady[a]-firstReady[b]);
  return JSON.stringify({ order, yearningBeforeScenes: { kw: pY.innerYearning.keyword, scenes:(pY.famousScenes||[]).length } });
})()`;
const r = await send("Runtime.evaluate",{expression:expr,returnByValue:true});
if (r.result.exceptionDetails) console.error("EXC", JSON.stringify(r.result.exceptionDetails).slice(0,300));
console.log(r.result.result.value);
ws.close(); chrome.kill(); try{fs.rmSync(userDir,{recursive:true,force:true});}catch(e){} process.exit(0);
