# Cloudflare 国内访问加速方案

> 「高考人生模拟器」部署在 Cloudflare Workers（生产域名 `gaokao.dsxzai.com`）。
> 本文档记录用 [CloudflareSpeedTest](https://github.com/XIU2/CloudflareSpeedTest) 思路给国内访客提速的实测、已落地改动与后续方案。
> 基线日期：2026-06-27（itdog 全国 127 节点拨测）。

---

## 1. 实测基线（2026-06-27，itdog 127 节点，运营商 DNS + 直连）

| 运营商 | 平均首屏总耗时 | 最快 | 最慢 |
|---|---|---|---|
| 联通 | **0.80s** | 上海 AS9929 0.21s | 四川成都 1.14s |
| 电信 | **1.00s** | 上海 0.54s | 西安 3.23s |
| 移动 | **1.78s** | 深圳 0.58s | 四川成都 4.48s |
| 全国 | **1.27s** | 香港 0.11s | — |

- 现状「能用但偏慢」：无不可达（127 点中 2 个超时——江西九江电信、新疆乌鲁木齐移动）；移动 + 内陆省份最差。
- 当前 CF 给国内只返回两个 IP：`104.21.34.182`、`172.67.163.183`（免费版「减速」anycast IP）。
- **瓶颈拆解**（决定优选 IP 值不值得的关键）：
  - 「建连」普遍 0.15–0.26s（最优 0.04s）→ 这是优选 IP 能优化的部分，每用户约省 0.05–0.15s。
  - 「下载 / TTFB」才是大头（移动多个节点 1–2.4s）→ 来自 ① 首页 468KB 单文件（br 后 104KB），② 移动链路到 CF 边缘的吞吐/拥塞。**换入口 IP 改不动这部分。**

---

## 2. 已落地 — 阶段一：静态资源缓存（零架构风险，已上线）

- 文件：`public/_headers`
  ```
  /assets/*
    Cache-Control: public, max-age=2592000
  ```
- 背景：CF Workers Assets 默认对静态资源发 `max-age=0, must-revalidate`，浏览器零本地缓存、每次回源校验。卡片插画 / Rive 动画 / 角色图在游戏中反复加载，零缓存在移动弱网下是明显卡顿来源。
- 效果：`/assets/*` 改为 30 天浏览器缓存 + etag 兜底，二次访问与游戏内重复资源本地直接命中、零回源。
- 首页 HTML 保持 `max-age=0`（H5 需每次拿最新逻辑；br 后 104KB + etag 304 协商已最优）。
- 已部署生产并 curl 验证生效（`/assets/*` → `max-age=2592000`）。
- 注意：`/assets` 文件名不带内容哈希，故用 30 天而非 `immutable`；更新某资源且需立即生效时，**改其文件名**或临时调小 `max-age`。

> 评估暂缓：首页 468KB 拆分瘦身。br 后 104KB 几乎全是首屏必需代码，拆出的 JS 首次访问仍需下载（仅二次访问命中缓存、首屏可交互略快），收益有限；而巨石拆分有回归风险 + 根目录/`public` 双份手动同步负担。性价比低于阶段二，暂不做。

---

## 3. 为什么不能「直接优选 IP」——Error 1000

优选 IP 的本质：把域名解析到「国内直连更快的 CF 边缘 IP」。但本项目：

- `gaokao.dsxzai.com` 是 **Workers custom domain**，zone `dsxzai.com` **全托管在 Cloudflare**。
- CF 禁止给自己托管的域名设「灰云（DNS only）A 记录指向 CF 自己的 IP」→ 报 [**Error 1000「DNS points to prohibited IP」**](https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1000/)。
- 直接灰云 A 记录的老办法自 2024 年起被 CF 反制、基本失效。

→ 必须改用 **Cloudflare for SaaS（自定义主机名）+ 分线路 DNS** 绕开。

---

## 4. 阶段二架构：优选 IP 分线路（绕开 Error 1000）

```
国内访客 ── 访问「对外域名」(DNS 托管在 DNSPod / 腾讯云 DNS，支持分线路)
              ├─ 境内线路: CNAME → 优选域名(cf.090227.xyz 等，持续更新"国内快的 CF 入口 IP")
              └─ 境外/默认: CNAME → 回源域名(gaokao.dsxzai.com，走 CF 默认 anycast)
                            │
                            ▼
        请求携带「对外域名」的 Host / SNI 抵达 CF 边缘节点
                            │
                            ▼
        CF 识别其为已配置的 Custom Hostname → 回源到 Worker(fallback origin)
                            │
                            ▼
                       返回游戏内容
```

关键点：

- 优选 IP = **CF 自己的边缘 IP**，只是「国内直连更快的那几个」；不需要灰云指向 → **不触发 Error 1000**。
- **Custom Hostname** 让 CF 接受这个「不在 CF 托管」的对外域名的 HTTPS 请求并签发证书。
- **fallback origin 用 Worker**（route `*/*`）：所有 custom hostname 流量交给现有 Worker 处理。

---

## 5. 前置决策点（动手前先定）

**决策一：对外域名用哪个？**

| 选项 | 做法 | 代价 |
|---|---|---|
| **a（推荐）** | 另备一个域名作对外入口，DNS 放 DNSPod。`gaokao.dsxzai.com` 不动，继续作回源 / 海外入口 | 需要有/愿用另一个域名；改动最小、风险最低、可随时回滚 |
| b | 用 `dsxzai.com` 的子域作对外 | 必须把整个 `dsxzai.com` 的 DNS 从 CF 迁到 DNSPod（影响该域名下所有记录），工程大、风险高 |

**决策二：分线路 DNS 商** — DNSPod（腾讯云）或阿里云 DNS，均支持「境内 / 境外 / 默认」分线路解析，免费版基本够用。

---

## 6. 配置要点（具体 Dashboard 步骤以官方文档为准，UI 会变）

1. **对外域名接入 DNSPod**：在 DNSPod 添加该域名，按提示改 NS 到 DNSPod。这条链路不经 CF DNS。
2. **Cloudflare for SaaS（在 `dsxzai.com` zone）**：
   - SSL/TLS → Custom Hostnames，开启。
   - 设置 **fallback origin = Worker**：参考官方 [Workers as your fallback origin](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/start/advanced-settings/worker-as-origin/)（用 route `*/*` 捕获 custom hostname 流量交给本 Worker）。
   - 添加 **custom hostname = 对外域名**；按提示在 DNSPod 加 TXT / CNAME 验证记录，等证书签发。参考 [Configuring Cloudflare for SaaS](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/start/getting-started/)。
3. **DNSPod 分线路 CNAME**（对外域名）：
   - 境内（默认/国内）：CNAME → 优选域名（如 `cf.090227.xyz`）。**关闭任何代理**。
   - 境外 + 默认兜底：CNAME → `gaokao.dsxzai.com`。
4. **SSL/TLS 模式**：Full（CF 边缘 ↔ Worker）。

---

## 7. 优选域名来源与维护

- 社区持续更新的优选域名（扫描 CF IP 段、挑国内低延迟、自动更新）：`cf.090227.xyz`、`cf.cname.vvhan.com` 等。
- **风险**：第三方维护，可能失效 / 被污染 / 质量波动。
- **建议**：定期用 itdog 复测对外域名；必要时换源，或自建——在一台国内云服务器（无代理）跑 `CloudflareSpeedTest` 产出自己的优选 IP，放进自己维护的解析里，最可控。

---

## 8. 验证

- 改造后用 itdog 全国复测**对外域名**，对比本文 §1 基线（全国均 1.27s / 移动 1.78s）。
- 重点看移动 + 内陆的「建连」是否下降；「下载」大概率变化不大（见 §1 瓶颈拆解）。

---

## 9. 风险与回滚

- 链路多了 custom hostname + 优选域名一层，排障更复杂。
- 优选域名失效 → 国内访问异常。**回滚**：DNSPod 境内线路 CNAME 改回 `gaokao.dsxzai.com` 即恢复。
- 证书：custom hostname 证书依赖验证记录，删除验证记录会导致证书失效。

---

## 10. 成本 / 收益（诚实评估）

- **收益（实测见 §11）**：电信 / 移动建连 RTT 中位从 ~215ms 降到 ~80ms，首屏首字节理论快 **0.3–0.4s**；但同一社区源对**联通可能负优化**（187→583ms），尾部超时增多。对「下载慢 / 拥塞」无效。
- **成本**：接 / 迁 DNS、开 SaaS、长期维护优选域名、多一层回源排障；要分运营商选源 + 持续监测才能稳定拿到收益。
- **结论**：阶段一（已完成）的缓存收益先吃满；阶段二适合「确实在意电信/移动首屏那 0.3–0.4s，且愿意持续运营优选源」的场景。若目标只是「别太慢」、或不想长期维护，阶段一可能已经够用。

## 11. 阶段二收益实测（itdog 全国 TCPing，2026-06-27）

对比「当前默认 IP」与「社区优选域名 cf.090227.xyz」到 CF 边缘的 TCP 握手延迟（443 端口，128 节点）：

| 运营商 | 默认 IP `104.21.34.182` | 优选域名 `cf.090227.xyz` | 变化 |
|---|---|---|---|
| 中国电信 | 343ms | 82ms | ↓ 76% |
| 中国移动 | 316ms（中位 ~215） | 267ms（中位 ~75） | 中位 ↓ ~65% |
| 中国联通 | 187ms | 583ms | ↑ 负优化 |
| 全部节点 | 306ms | 223ms | ↓ 27% |

解读：

- 电信 / 移动建连 RTT 中位从 ~215ms 降到 ~80ms；HTTPS 首字节约 3 个 RTT，折算首屏首字节理论快 **0.3–0.4s**。
- 同一社区源对**联通反而负优化**（解析到 104.26 段，对联通不友好），尾部超时从 1 个增至 8 个（优选域名解析出 74 个 IP，质量参差）。
- 启示：优选 IP 收益**高度依赖「运营商 × 源」的匹配**，「全部节点平均」会掩盖差异。要稳定拿到收益必须分运营商选源 + 持续监测，必要时自建优选 IP（国内服务器跑 CloudflareSpeedTest）。
- 复核：另测社区源 `cf.cname.vvhan.com`，128 节点 **100% 解析失败**（该域名已失效）——直接印证「社区源会漂移 / 失效、不可盲选」。**要照顾联通、求稳定，结论是自建优选 IP 按运营商分别选，而非依赖免费社区源。**

---

## 参考

- CloudflareSpeedTest：https://github.com/XIU2/CloudflareSpeedTest
- XIU2 自选 IP 教程（Workers/Pages）：https://github.com/XIU2/CloudflareSpeedTest/discussions/310
- Cloudflare for SaaS 入门：https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/start/getting-started/
- Workers as fallback origin：https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/start/advanced-settings/worker-as-origin/
- Error 1000：https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1000/
- DNSPod + Cloudflare 国内外分流：https://cloud.tencent.com/developer/article/2555497
