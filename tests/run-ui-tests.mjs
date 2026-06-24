// 前端 UI 验收测试（headless Chrome DOM 断言，TDD red-green）。
// 用法：先在 $BASE（默认 http://127.0.0.1:8788，建议 DEEPSEEK_MOCK=1）启动服务，再 `node tests/run-ui-tests.mjs [jad80]`。
import { execFileSync } from "node:child_process";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = process.env.BASE || "http://127.0.0.1:8788";
const only = process.argv[2];

function decode(s) {
  return s.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

function probe(name) {
  const html = execFileSync(CHROME, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars",
    "--force-device-scale-factor=2", "--window-size=412,915",
    "--virtual-time-budget=9000", "--dump-dom", `${BASE}/?selftest=${name}`
  ], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const m = html.match(/<title>SELFTEST:(.*?)<\/title>/s);
  if (!m) throw new Error(`未拿到 SELFTEST 标题（页面可能没加载或探针未运行）`);
  return JSON.parse(decode(m[1]));
}

const suites = {
  // JAD-80：测试卡片页年龄/年份文案格式
  jad80: d => [
    ["文案顺序为「{age}岁·{N}/total年」、紧凑·、无空格", d.orderOk === true],
    [`年龄主字号 > 年份小字号（age=${d.ageFont} / count=${d.countFont}）`, d.fontOk === true],
    ["文案不换行、不溢出容器", d.nowrap === true],
    [`实际文案=${d.text}`, /^\d+岁·\d+\/\d+年$/.test(d.text || "")]
  ],
  retryError: d => [
    ["失败态渲染错误卡", d.hasErrorCard === true],
    ["只出现一个操作按钮", d.buttonCount === 1],
    [`按钮是重试当前题：${d.buttonText}`, /^重试这一题/.test(d.buttonText || "")],
    ["重试按钮可点击", d.retryEnabled === true],
    ["文案说明前面选择已保存", d.mentionsSaved === true],
    ["不出现返回开局入口", d.noReturn === true]
  ],
  authorCta: d => [
    ["结果页作者入口展示作者和账号名", d.linkText === "作者大师的AI小灶"],
    ["作者入口跳转抖音主页", d.href === "https://www.douyin.com/user/MS4wLjABAAAAohe8JB4RvITJitJ69b7cV4NTaYTMYrVI43C-3SUnPPc"],
    ["作者入口新窗口打开", d.target === "_blank"],
    ["原结果操作按钮仍保留", JSON.stringify(d.buttonTexts) === JSON.stringify(["分享结果", "查看过程", "重新测试"])],
    ["分享图作者署名使用 @ 文案", d.footerText === "@大师的AI小灶"],
    ["分享图作者署名不可点击", d.footerClickable === false]
  ],
  maintenanceError: d => [
    ["维护态标题明确", d.title === "模型服务临时维护中"],
    ["维护态按钮不暗示立即成功", d.buttonText === "稍后重试"],
    ["说明前面选择不会丢", /前面7次选择已经保存/.test(d.text || "")]
  ]
};

let failed = 0;
for (const name of Object.keys(suites)) {
  if (only && only !== name) continue;
  console.log(`\n[${name}]`);
  let data;
  try {
    data = probe(name);
  } catch (err) {
    console.log("  ✗ 探针失败:", err.message);
    failed += 1;
    continue;
  }
  for (const [desc, ok] of suites[name](data)) {
    console.log(`  ${ok ? "✓" : "✗"} ${desc}`);
    if (!ok) failed += 1;
  }
}
console.log(failed ? `\nFAIL（${failed} 项未通过）` : "\nPASS（全部通过）");
process.exit(failed ? 1 : 0);
