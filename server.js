import { createServer } from "node:http";
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildAnnualInput,
  buildBatchInput,
  buildResultInput,
  getOutlineCard,
  vNextAnnualTaskPrompt,
  vNextBatchTaskPrompt,
  vNextResultTaskPrompt,
  vNextSystemPrompt
} from "./deepseek-prompt-vnext.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const rootDir = resolve(__dirname);
const port = Number(process.env.PORT || loadEnvValue("PORT") || 8765);
const host = process.env.HOST || loadEnvValue("HOST") || "127.0.0.1";
const mockMode = (process.env.LLM_MOCK || loadEnvValue("LLM_MOCK") || process.env.DEEPSEEK_MOCK || loadEnvValue("DEEPSEEK_MOCK")) === "1";
const llmStream = (process.env.LLM_STREAM || loadEnvValue("LLM_STREAM") || process.env.DEEPSEEK_STREAM || loadEnvValue("DEEPSEEK_STREAM") || "1") !== "0";
const modelConfigs = buildModelConfigs();
const defaultModel = resolveDefaultModel();
const totalGameYears = 18;
const finalResultAge = 36;
const riasecTypes = ["R", "I", "A", "S", "E", "C"];
const relationshipStagePattern = /(暧昧升温|确定关系|冷战后撤|分手收束|体面告别|新恋情萌芽|订婚结婚|生儿育女)/;
const promptLabRealProxyBase = "https://gaokao.dsxzai.com";
const promptLabRealProxyModel = "deepseek-v4-flash";

const annualFields = ["summary", "question", "scene", "a", "b"];
const resultFields = ["title", "status42", "majorCareerNote", "careerPossibilities", "famousScenes", "timelineBlocks", "choiceHabit", "mentalPrep", "letter18", "shareHooks"];
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml; charset=utf-8"
};

function systemPrompt() {
  return vNextSystemPrompt;
}

function loadEnvValue(key) {
  const envPath = join(rootDir, ".env");
  if (!existsSync(envPath)) return "";
  const line = readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .find(item => item.trim().startsWith(`${key}=`));
  if (!line) return "";
  return line.slice(line.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "");
}

function envValue(key, fallback = "") {
  return process.env[key] || loadEnvValue(key) || fallback;
}

function buildModelConfigs() {
  const mimoApiKey = envValue("MIMO_API_KEY");
  const deepseekApiKey = envValue("DEEPSEEK_API_KEY");
  const mimoBaseUrl = envValue("MIMO_BASE_URL", "https://api.xiaomimimo.com/v1");
  const deepseekBaseUrl = envValue("DEEPSEEK_BASE_URL", "https://api.deepseek.com");
  return [
    {
      id: "mimo-v2.5-pro",
      label: "Xiaomi MiMo V2.5 Pro",
      provider: "mimo",
      baseUrl: mimoBaseUrl,
      apiKey: mimoApiKey,
      authHeader: "api-key",
      maxTokensField: "max_completion_tokens",
      supportsThinking: true,
      supportsResponseFormat: true
    },
    {
      id: "deepseek-v4-pro",
      label: "DeepSeek V4 Pro",
      provider: "deepseek",
      baseUrl: deepseekBaseUrl,
      apiKey: deepseekApiKey,
      authHeader: "authorization",
      maxTokensField: "max_tokens",
      supportsThinking: true,
      supportsResponseFormat: true
    },
    {
      id: "deepseek-v4-flash",
      label: "DeepSeek V4 Flash",
      provider: "deepseek",
      baseUrl: deepseekBaseUrl,
      apiKey: deepseekApiKey,
      authHeader: "authorization",
      maxTokensField: "max_tokens",
      supportsThinking: true,
      supportsResponseFormat: true
    }
  ];
}

function modelIsConfigured(config) {
  return mockMode || isUsableApiKey(config?.apiKey);
}

function resolveDefaultModel() {
  const requested = envValue("LLM_MODEL") || envValue("MIMO_MODEL") || envValue("DEEPSEEK_MODEL");
  if (modelConfigs.some(config => config.id === requested)) return requested;
  return modelConfigs.find(modelIsConfigured)?.id || modelConfigs[0]?.id || "mimo-v2.5-pro";
}

function publicModelOptions() {
  return modelConfigs.map(config => ({
    id: config.id,
    label: config.label,
    provider: config.provider,
    configured: modelIsConfigured(config)
  }));
}

function availableModelIds() {
  const configured = publicModelOptions().filter(option => option.configured).map(option => option.id);
  return configured.length ? configured : publicModelOptions().map(option => option.id);
}

function promptLabProxyModelOptions() {
  return [{
    id: promptLabRealProxyModel,
    label: "DeepSeek V4 Flash",
    provider: "deepseek",
    configured: true
  }];
}

function resolveModelConfig(value) {
  const requested = String(value || "").trim();
  const selected = modelConfigs.find(config => config.id === requested) || modelConfigs.find(config => config.id === defaultModel) || modelConfigs[0];
  return selected;
}

function sendJson(res, status, data) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function clean(value, fallback) {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function normalizeProfile(profile = {}) {
  return {
    name: clean(profile.name, "未命名考生"),
    gender: clean(profile.gender, "不限定"),
    province: clean(profile.province, "未知省份"),
    score: clean(profile.score, "未知分数"),
    dream: clean(profile.dream, "暂未填写"),
    hope: clean(profile.hope, "未知"),
    keywords: clean(profile.keywords, "观察中"),
    major: clean(profile.major, "未选专业"),
    majorLabel: clean(profile.majorLabel, clean(profile.major, "未选专业"))
  };
}

function compactHistory(history = []) {
  return history.slice(-totalGameYears).map(item => ({
    year: item.year,
    scene: item.scene,
    sceneTitle: item.sceneTitle,
    summary: item.summary,
    phase: item.phase,
    mainTrack: item.mainTrack,
    lifeTrack: item.lifeTrack,
    relationshipTrack: item.relationshipTrack,
    callbackSeeds: item.callbackSeeds,
    choice: item.choice,
    choiceText: item.choiceText,
    consequence: item.consequence,
    tag: item.tag,
    holland: item.holland
  }));
}

function taskPromptWithInput(taskPrompt, input) {
  const inputJson = JSON.stringify(input);
  return taskPrompt.includes("{{INPUT_JSON}}")
    ? taskPrompt.replace("{{INPUT_JSON}}", inputJson)
    : `${taskPrompt}\n\n${inputJson}`;
}

function buildAnnualMessages({ profile, history, year }) {
  const input = buildAnnualInput({ profile: normalizeProfile(profile), history: compactHistory(history), year, totalGameYears });
  return [
    { role: "system", content: systemPrompt() },
    {
      role: "user",
      content: taskPromptWithInput(vNextAnnualTaskPrompt, input)
    }
  ];
}

function buildBatchMessages({ profile, history, startYear, count }) {
  const input = buildBatchInput({
    profile: normalizeProfile(profile),
    history: compactHistory(history),
    startYear,
    count,
    totalGameYears
  });
  return [
    { role: "system", content: systemPrompt() },
    {
      role: "user",
      content: taskPromptWithInput(vNextBatchTaskPrompt.replaceAll("{{count}}", String(count)), input)
    }
  ];
}

function buildResultMessages({ profile, history }) {
  const input = buildResultInput({
    profile: normalizeProfile(profile),
    history: compactHistory(history),
    totalGameYears,
    finalResultAge
  });
  return [
    { role: "system", content: systemPrompt() },
    {
      role: "user",
      content: taskPromptWithInput(vNextResultTaskPrompt, input)
    }
  ];
}

async function callModel(messages, validator, model = defaultModel, onDelta = null, debug = false, onDiscard = null) {
  if (mockMode) {
    const raw = mockResponse(messages);
    return attachModelDebug(validator(raw), debug, {
      request: requestBody(resolveModelConfig(model), messages, false),
      rawOutput: JSON.stringify(raw, null, 2)
    });
  }
  const config = resolveModelConfig(model);
  if (!isUsableApiKey(config?.apiKey)) {
    const error = new Error(`${config?.label || model} API Key 未配置或格式不正确。请在 .env 中填写对应 provider 的 sk- key，或用 LLM_MOCK=1 npm start 先测试 UI。`);
    error.status = 500;
    throw error;
  }

  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const useStream = llmStream && attempt === 0;
    let streamedAny = false;
    try {
      const body = requestBody(config, messages, useStream);
      const response = await fetch(`${String(config.baseUrl).replace(/\/+$/g, "")}/chat/completions`, {
        method: "POST",
        headers: requestHeaders(config),
        body: JSON.stringify(body)
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error?.message || `${config.label} request failed: ${response.status}`);
      }
      const content = useStream
        ? await readChatStream(response, text => {
            streamedAny = true;
            onDelta?.(text);
          })
        : (await response.json().catch(() => ({})))?.choices?.[0]?.message?.content;
      if (!content) throw new Error(`${config.label} returned empty content`);
      return attachModelDebug(validator(parseJsonContent(content)), debug, { request: body, rawOutput: content });
    } catch (error) {
      lastError = error;
      if (useStream && streamedAny) onDiscard?.();
    }
  }
  console.error(`${config.label} unavailable, using fallback content:`, lastError?.message || lastError);
  const raw = mockResponse(messages);
  const fallback = validator(raw);
  return attachModelDebug({ ...fallback, degraded: true }, debug, {
    request: requestBody(config, messages, false),
    rawOutput: JSON.stringify(raw, null, 2)
  });
}

function attachModelDebug(value, enabled, debug) {
  if (enabled && value && typeof value === "object") {
    Object.defineProperty(value, "__debug", { value: debug, enumerable: false, configurable: true });
  }
  return value;
}

function requestHeaders(config) {
  const headers = { "content-type": "application/json" };
  if (config.authHeader === "api-key") {
    headers["api-key"] = config.apiKey;
  } else {
    headers.authorization = `Bearer ${config.apiKey}`;
  }
  return headers;
}

function requestBody(config, messages, useStream) {
  const body = {
    model: config.id,
    messages,
    temperature: 0.95,
    stream: useStream
  };
  body[config.maxTokensField || "max_tokens"] = 3200;
  if (config.supportsResponseFormat) body.response_format = { type: "json_object" };
  if (config.supportsThinking) body.thinking = { type: "disabled" };
  return body;
}

async function readChatStream(response, onDelta = null) {
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";
  for await (const chunk of response.body) {
    buffer += decoder.decode(chunk, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      const payload = JSON.parse(data);
      const delta = payload?.choices?.[0]?.delta?.content || "";
      if (!delta) continue;
      content += delta;
      onDelta?.(delta);
    }
  }
  content += decoder.decode();
  return content.trim();
}

function sendNdjson(res, data) {
  res.write(`${JSON.stringify(data)}\n`);
}

async function sendAnnualStream(res, { pathname, profile, history, body, model }) {
  res.writeHead(200, {
    "content-type": "application/x-ndjson; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  });
  sendNdjson(res, { type: "meta", model });
  try {
    if (pathname === "/api/game/start/stream") {
      const data = await callModel(
        buildAnnualMessages({ profile, history: [], year: 1 }),
        value => validateAnnual(value, []),
        model,
        text => sendNdjson(res, { type: "delta", text }),
        false,
        () => sendNdjson(res, { type: "reset" })
      );
      sendNdjson(res, { type: "done", ok: true, model, degraded: !!data.degraded, card: annualCardFromData(data) });
      res.end();
      return;
    }
    const year = Math.min(Math.max(Number(body.year || history.length + 1), 2), totalGameYears);
    const data = await callModel(
      buildAnnualMessages({ profile, history, year }),
      value => validateAnnual(value, history),
      model,
      text => sendNdjson(res, { type: "delta", text }),
      false,
      () => sendNdjson(res, { type: "reset" })
    );
    sendNdjson(res, { type: "done", ok: true, model, degraded: !!data.degraded, card: annualCardFromData(data) });
  } catch (error) {
    sendNdjson(res, { type: "error", ok: false, error: error.message || "Request failed" });
  } finally {
    res.end();
  }
}

function shouldProxyPromptLabRealRequest(req, pathname) {
  return mockMode && req.headers["x-prompt-lab-real"] === "1" && /^\/api\/game\/(?:start|next|batch|result)$/.test(pathname);
}

async function proxyPromptLabRealRequest(res, pathname, body) {
  const response = await fetch(`${promptLabRealProxyBase}${pathname}`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-prompt-lab-real": "1", "x-prompt-lab-debug": "1" },
    body: JSON.stringify(body)
  });
  const text = await response.text();
  res.writeHead(response.status, {
    "content-type": response.headers.get("content-type") || "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  res.end(text);
}

function isPromptLabDebugRequest(req) {
  return req.headers["x-prompt-lab-real"] === "1" || req.headers["x-prompt-lab-debug"] === "1";
}

function debugField(data) {
  return data?.__debug ? { debug: data.__debug } : {};
}

function isUsableApiKey(value) {
  const key = String(value || "").trim();
  return /^sk-[A-Za-z0-9_-]{20,}$/.test(key);
}

function parseJsonContent(content) {
  const text = String(content).trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(text.slice(start, end + 1));
    throw new Error("Model returned invalid JSON");
  }
}

function validateAnnual(data, history = [], repeatHistory = history) {
  const normalized = {};
  if (typeof data?.summary !== "string") throw new Error("Invalid annual JSON: missing summary");
  if (typeof data?.question !== "string" && !Number.isFinite(Number(data?.year))) throw new Error("Invalid annual JSON: missing question");
  normalized.summary = clampTextBySentence(data.summary, 52, 2);
  const yearNumberFromData = Number(data?.year || 0);
  normalized.question = typeof data?.question === "string" && data.question.trim()
    ? data.question.trim()
    : `第 ${yearNumberFromData || 1} 年 / ${totalGameYears}`;
  normalized.year = Number(normalized.question.match(/\d+/)?.[0] || yearNumberFromData || 1);
  normalized.phase = optionalCleanText(data.phase);
  normalized.mainTrack = /relationship/i.test(String(data.mainTrack || "").trim()) ? "relationship" : "life";
  normalized.lifeTrack = optionalCleanText(data.lifeTrack);
  normalized.relationshipTrack = optionalCleanText(data.relationshipTrack);
  normalized.callbackSeeds = Array.isArray(data.callbackSeeds || data.callbacks)
    ? (data.callbackSeeds || data.callbacks).map(item => optionalCleanText(item)).filter(Boolean).slice(0, 3)
    : [];
  normalized.scene = normalizeSceneData(data.scene);
  normalized.a = normalizeChoiceData(data.a, "A");
  normalized.b = normalizeChoiceData(data.b, "B");
  validateRiasecAgainstOutline(normalized);
  if (!new RegExp(`^第\\s*\\d+\\s*年\\s*\\/\\s*${totalGameYears}$`).test(normalized.question)) {
    throw new Error("Invalid annual JSON: bad question field");
  }
  const yearNumber = normalized.year;
  normalized.summary = yearNumber === 1 ? "" : clampTextBySentence(deDuplicateSummary(normalized, history), 52, 2);
  normalized.summary = repairSummaryRelationshipStage(normalized.summary, normalized.relationshipTrack);
  if (yearNumber > 1 && !normalized.summary) {
    const sceneText = [normalized.scene?.title, normalized.scene?.body].filter(Boolean).join("");
    normalized.summary = clampTextBySentence(mergeFeedbackParts(buildHistoryConsequence(history), buildOffstageFallback(textCategories(sceneText))), 52, 2);
    normalized.summary = repairSummaryRelationshipStage(normalized.summary, normalized.relationshipTrack);
  }
  validateContinuityText(normalized, history);
  if (!normalized.scene.title || !normalized.scene.body || !normalized.a.title || !normalized.b.title) {
    throw new Error("Invalid annual JSON: empty required field");
  }
  ensureSceneNotRepeated(normalized, repeatHistory);
  return normalized;
}

function sceneTextForRepeatCheck(item) {
  if (!item) return "";
  const title = item.scene?.title || item.sceneTitle || item.eventTitle || item.scene || "";
  const body = item.scene?.body || item.sceneBody || item.prompt || "";
  return [title, body].filter(Boolean).join(" ");
}

function ensureSceneNotRepeated(card, history = []) {
  const currentTitle = optionalCleanText(card.scene?.title);
  const currentText = sceneTextForRepeatCheck(card);
  if (!currentText) return;
  const repeated = history.some(item => {
    const title = optionalCleanText(item?.sceneTitle || item?.eventTitle || item?.scene?.title || item?.scene);
    if (currentTitle && title && currentTitle === title) return true;
    const priorText = sceneTextForRepeatCheck(item);
    return priorText && textSimilarityScore(currentText, priorText) >= 0.68;
  });
  if (repeated) throw new Error("Invalid annual JSON: repeated scene");
}

function deDuplicateSummary(card, history = []) {
  const summary = optionalCleanText(card.summary);
  if (!summary) return "";
  const sceneText = [card.scene?.title, card.scene?.body].filter(Boolean).join("");
  const sceneCategories = textCategories(sceneText);
  if (!hasCategoryOverlap(textCategories(summary), sceneCategories) && textSimilarityScore(summary, sceneText) < 0.34) return summary;
  const preferRelationship = !sceneCategories.has("relationship");
  const candidates = [
    { value: card.lifeTrack, type: "life" },
    { value: card.relationshipTrack, type: "relationship" }
  ]
    .map(item => ({ ...item, value: optionalCleanText(item.value) }))
    .filter(item => item.value)
    .map(item => ({
      ...item,
      score: textSimilarityScore(item.value, sceneText),
      categoryOverlap: hasCategoryOverlap(textCategories(item.value), sceneCategories)
    }))
    .filter(item => !item.categoryOverlap)
    .sort((a, b) => {
      const aPreferred = preferRelationship ? a.type === "relationship" : a.type === "life";
      const bPreferred = preferRelationship ? b.type === "relationship" : b.type === "life";
      if (aPreferred !== bPreferred) return aPreferred ? -1 : 1;
      return a.score - b.score;
    });
  const best = candidates[0];
  const consequence = extractConsequenceClause(summary, sceneText) || buildHistoryConsequence(history);
  const offstage = best && best.score < 0.34 ? best.value : buildOffstageFallback(sceneCategories);
  return mergeFeedbackParts(consequence, offstage);
}

function buildOffstageFallback(sceneCategories) {
  if (sceneCategories.has("relationship")) {
    return "课表和项目没为你停下，家里那边也开始追问你接下来怎么打算";
  }
  if (sceneCategories.has("health")) {
    return "你把作息往回拽了一点，家里这才没继续追着问你几点睡";
  }
  if (sceneCategories.has("work") || sceneCategories.has("study")) {
    return "暧昧升温，沈晚晴已经会顺手给你留位置";
  }
  return "你这边刚处理完一头，另一头也没闲着，身边几个人对你的站位已经变了";
}

function repairSummaryRelationshipStage(summary, relationshipTrack) {
  const text = optionalCleanText(summary);
  if (!text || !/(关系|沈晚晴|沈晚晴|她)/.test(text) || relationshipStagePattern.test(text)) return text;
  const track = optionalCleanText(relationshipTrack);
  const match = track.match(relationshipStagePattern);
  if (!match) return text;
  const firstClause = text.split(/[，。！？!?；;]/).map(item => item.trim()).find(Boolean) || text;
  const signal = track
    .replace(new RegExp(`^${match[0]}[：:，,]?`), "")
    .replace(/[。！？!?；;]+$/g, "")
    .trim();
  const staged = signal ? `${match[0]}，${signal}` : match[0];
  return mergeFeedbackParts(firstClause, staged);
}

function extractConsequenceClause(summary, sceneText) {
  const clauses = optionalCleanText(summary)
    .split(/[，。！？!?；;]/)
    .map(item => item.trim())
    .filter(Boolean);
  const first = clauses[0] || "";
  if (first.length >= 8 && textSimilarityScore(first, sceneText) < 0.56) {
    return first.slice(0, 26);
  }
  return "";
}

function buildHistoryConsequence(history = []) {
  const last = Array.isArray(history) ? history.at(-1) : null;
  if (last?.consequence) return optionalCleanText(last.consequence).slice(0, 32);
  const text = optionalCleanText([last?.choice, last?.choiceText].filter(Boolean).join("，"));
  if (/拒|不|撤|稳|等|缓|谈判|排|守|边界|暂时|冷静/.test(text)) {
    return "你把上一年的乱节奏按住了，手头终于没再一起炸";
  }
  if (/接|冲|说|救|扛|硬|通宵|主动|推进|承担|当场|立刻/.test(text)) {
    return "你把上一年的事硬顶了过去，名气和压力一块追上来";
  }
  return "上一年的选择已经开始收账，眼前这局不是凭空掉下来的";
}

function mergeFeedbackParts(consequence, offstage) {
  const left = optionalCleanText(consequence).replace(/[，。！？!?；;]+$/g, "");
  const right = optionalCleanText(offstage).replace(/^(上一年|上一年的决定|这一年)[，,]*/g, "").replace(/[，。！？!?；;]+$/g, "");
  const merged = [left, right].filter(Boolean).join("，");
  return clampTextBySentence(merged, 52, 2);
}

function validateContinuityText(card, history = []) {
  if (card.year > 1) {
    const summary = optionalCleanText(card.summary);
    if (/(^|[^核])关系线|生活线|现实线|主线|副线|当前趋势/.test(summary)) {
      throw new Error("Invalid annual JSON: summary exposes internal track wording");
    }
    if (/接[住着下]?或错失|错失或接|错过或接|或错失|或错过|要么|无论|分叉|两条路|取决于|A或B|A\/B/.test(summary)) {
      throw new Error("Invalid annual JSON: summary contains parallel opposite outcomes");
    }
    if (/关系|沈晚晴|沈晚晴|她/.test(summary) && !relationshipStagePattern.test(summary)) {
      throw new Error("Invalid annual JSON: summary mentions relationship without a clear stage");
    }
    const lastConsequence = optionalCleanText(Array.isArray(history) ? history.at(-1)?.consequence : "");
    if (lastConsequence && textSimilarityScore(summary.slice(0, Math.min(24, summary.length)), lastConsequence) < 0.08) {
      throw new Error("Invalid annual JSON: summary does not inherit previous selected consequence");
    }
  }
  const relationshipTrack = optionalCleanText(card.relationshipTrack);
  if (relationshipTrack) {
    if (/(^|[^核])关系线|生活线|现实线|主线|副线/.test(relationshipTrack)) {
      throw new Error("Invalid annual JSON: relationshipTrack exposes internal wording");
    }
    if (!relationshipStagePattern.test(relationshipTrack)) {
      throw new Error("Invalid annual JSON: relationshipTrack missing clear relationship stage");
    }
  }
}

function validateRiasecAgainstOutline(card) {
  const outline = getOutlineCard(card.year);
  const axis = Array.isArray(outline?.riasecAxis) ? outline.riasecAxis : [];
  if (axis.length < 2) return;
  validateChoiceAxis(card.a, axis[0], "A");
  validateChoiceAxis(card.b, axis[1], "B");
}

function validateChoiceAxis(choice, expectedMain, label) {
  const scores = choice?.riasec;
  if (!scores) throw new Error(`Invalid annual JSON: ${label} missing riasec`);
  const keys = ["R", "I", "A", "S", "E", "C"];
  const ranked = keys.slice().sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
  const main = ranked[0];
  const mainScore = Number(scores[expectedMain] || 0);
  const positiveSecondary = keys.filter(key => key !== expectedMain && Number(scores[key] || 0) > 0);
  const total = keys.reduce((sum, key) => sum + Number(scores[key] || 0), 0);
  if (main !== expectedMain || mainScore < 4 || mainScore > 6) {
    throw new Error(`Invalid annual JSON: ${label} riasec main must be ${expectedMain} with 4-6 points`);
  }
  if (positiveSecondary.length > 1 || positiveSecondary.some(key => Number(scores[key] || 0) > 2) || total > 7) {
    throw new Error(`Invalid annual JSON: ${label} riasec secondary weights invalid`);
  }
}

function textCategories(value) {
  const text = String(value || "");
  const categories = new Set();
  const rules = [
    ["relationship", /恋|爱|暧昧|暗恋|表白|伴侣|陪伴|对象|结婚|分手|复合|喜欢|心动|搭子|约会/],
    ["health", /健康|身体|体检|医院|医生|熬夜|作息|胸闷|心律|生病|焦虑|睡眠|运动|爬山|休息/],
    ["family", /父母|家里|家庭|亲戚|妈妈|爸爸|孩子|老人|婚礼|买房|房贷/],
    ["friend", /朋友|室友|同学|同事|群|饭搭子|兄弟|闺蜜|聚会/],
    ["work", /工作|项目|上线|老板|领导|甲方|公司|岗位|调岗|职场|代码|产品|需求|汇报|团队|加班/],
    ["study", /课程|考试|作业|社团|导师|竞赛|保研|考研|论文|实习|专业课|学校|大学/]
  ];
  rules.forEach(([category, pattern]) => {
    if (pattern.test(text)) categories.add(category);
  });
  return categories;
}

function hasCategoryOverlap(left, right) {
  for (const item of left) {
    if (right.has(item)) return true;
  }
  return false;
}

function textSimilarityScore(a, b) {
  const left = uniqueTextTokens(a);
  const right = uniqueTextTokens(b);
  if (!left.size || !right.size) return 0;
  let shared = 0;
  for (const token of left) {
    if (right.has(token)) shared += 1;
  }
  return shared / Math.max(1, Math.min(left.size, right.size));
}

function uniqueTextTokens(value) {
  const text = String(value || "")
    .replace(/[，。！？!?；;：:\s"'“”‘’、（）()《》]/g, "")
    .trim();
  const tokens = new Set();
  for (let size = 2; size <= 3; size += 1) {
    for (let index = 0; index <= text.length - size; index += 1) {
      const token = text.slice(index, index + size);
      if (!/[的一是在和了有就把也都而及与或你我他她它这那]/.test(token)) {
        tokens.add(token);
      }
    }
  }
  return tokens;
}

function optionalCleanText(value) {
  return String(value || "")
    .replace(/关系线核心角色/g, "总坐靠窗位、笔记写得像攻略的同班女生沈晚晴")
    .replace(/室友\/同伴/g, "总在上课路上边走边吃早餐的吃货舍友周越")
    .replace(/导师\/老师|辅导员\/导师背景声/g, "辅导员兼专业导师林老师")
    .replace(/外部机会角色背景压力|外部机会角色/g, "合作方")
    .replace(/家庭型角色/g, "家里")
    .replace(/团队群像/g, "项目群")
    .trim();
}

function clampTextBySentence(value, maxLength, maxSentences = 1) {
  const text = optionalCleanText(value).replace(/\s+/g, "");
  if (!text) return "";
  const parts = text.match(/[^。！？!?；;]+[。！？!?；;]?/g) || [text];
  const joined = parts.slice(0, maxSentences).join("").replace(/[。！？!?；;]+$/g, "");
  if (joined.length <= maxLength) return joined;
  const clipped = joined.slice(0, maxLength);
  const boundary = Math.max(clipped.lastIndexOf("，"), clipped.lastIndexOf("、"), clipped.lastIndexOf("："));
  return (boundary >= Math.floor(maxLength * 0.55) ? clipped.slice(0, boundary) : clipped).replace(/[，、：。！？!?；;]+$/g, "");
}

function normalizeSceneData(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return {
      title: clampTextBySentence(value.title, 10, 1),
      body: clampTextBySentence(value.body, 130, 3)
    };
  }
  const raw = optionalCleanText(value);
  const eventMatch = raw.match(/(?:^|\n)\s*事件[:：]\s*([^\n]+)/);
  const contextMatch = raw.match(/(?:^|\n)\s*情境[:：]\s*([\s\S]+)/);
  if (eventMatch || contextMatch) {
    return {
      title: clampTextBySentence(eventMatch?.[1] || "这一年的岔路口", 10, 1),
      body: clampTextBySentence(contextMatch?.[1] || raw.replace(eventMatch?.[0] || "", ""), 130, 3)
    };
  }
  const sentenceMatch = raw.match(/^(.{8,28}?[。！？!?])([\s\S]*)$/);
  return {
    title: clampTextBySentence(sentenceMatch?.[1]?.replace(/[。！？!?]$/g, "") || "这一年的岔路口", 10, 1),
    body: clampTextBySentence(sentenceMatch?.[2] || raw, 130, 3)
  };
}

function normalizeChoiceData(value, prefix) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const title = normalizeChoiceTitle(value.title || value.label || "", prefix);
    const desc = normalizeChoiceDesc(value.desc || value.description || value.label || "", title, prefix);
    const tag = normalizeChoiceTag(value.tag || title, prefix);
    const consequence = normalizeChoiceConsequence(value.consequence || value.feedback || "");
    return { title, desc, tag, consequence, label: `${title}，${desc}`, riasec: normalizeRiasecPayload(value.riasec) };
  }
  const raw = optionalCleanText(value).replace(new RegExp(`^${prefix}[.。]\\s*`), "");
  const title = normalizeChoiceTitle(raw, prefix);
  const desc = normalizeChoiceDesc(raw, title, prefix);
  const tag = normalizeChoiceTag(title, prefix);
  return { title, desc, tag, consequence: "", label: `${title}，${desc}`, riasec: null };
}

function normalizeChoiceConsequence(value) {
  return clampTextBySentence(value, 36, 1);
}

function normalizeRiasecPayload(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const keys = ["R", "I", "A", "S", "E", "C"];
  const scores = {};
  let hasValue = false;
  keys.forEach(key => {
    const numeric = Math.max(0, Number(value[key]) || 0);
    scores[key] = numeric;
    if (numeric > 0) hasValue = true;
  });
  return hasValue ? scores : null;
}

function normalizeChoiceTitle(value, prefix) {
  const text = optionalCleanText(value)
    .replace(new RegExp(`^${prefix}[.。]\\s*`), "")
    .replace(/[，,。.!！?？；;].*$/g, "")
    .replace(/\s+/g, "");
  if (text) return text.slice(0, 5);
  return prefix === "A" ? "直接推进" : "先稳住";
}

function normalizeChoiceDesc(value, title, prefix) {
  const text = optionalCleanText(value)
    .replace(new RegExp(`^${prefix}[.。]\\s*`), "")
    .replace(title, "")
    .replace(/^[，,。.!！?？；;\s]+/, "")
    .trim();
  if (text.length >= 8) return clampTextBySentence(text, 22, 1);
  return prefix === "A" ? "把问题摊开当场处理" : "留出余地再判断";
}

function normalizeChoiceTag(value, prefix) {
  const text = optionalCleanText(value).replace(new RegExp(`^${prefix}[.。]\\s*`), "").replace(/\s+/g, "");
  if (text && text !== "A" && text !== "B") return text.slice(0, 4);
  return prefix === "A" ? "主动处理" : "稳住节奏";
}

function validateBatch(data, expectedCount, startYear, history = []) {
  if (!Array.isArray(data?.cards) || data.cards.length !== expectedCount) {
    throw new Error("Invalid batch JSON: bad cards count");
  }
  const seen = Array.isArray(history) ? [...history] : [];
  return {
    cards: data.cards.map((card, index) => {
      const normalized = validateAnnual(card, history, seen);
      const expectedYear = startYear + index;
      if (Number(normalized.question.match(/\d+/)?.[0]) !== expectedYear) {
        throw new Error(`Invalid batch JSON: expected year ${expectedYear}`);
      }
      seen.push({
        year: expectedYear,
        sceneTitle: normalized.scene.title,
        sceneBody: normalized.scene.body,
        prompt: normalized.scene.body
      });
      return normalized;
    })
  };
}

function validateResult(data) {
  const normalized = {};
  for (const field of resultFields) {
    if (field === "careerPossibilities") {
      if (!Array.isArray(data?.[field])) throw new Error(`Invalid result JSON: missing ${field}`);
      normalized[field] = data[field].map(normalizeCareerPossibility).filter(Boolean).slice(0, 3);
    } else if (field === "famousScenes") {
      normalized[field] = normalizeResultBlocks(data?.[field], 3, normalizeSceneCardBlock);
    } else if (field === "timelineBlocks") {
      normalized[field] = normalizeResultBlocks(data?.[field], 3, normalizeTimelineBlock);
    } else if (field === "choiceHabit" || field === "mentalPrep" || field === "letter18") {
      normalized[field] = normalizeResultCard(data?.[field], fallbackResultCard(field));
    } else if (field === "shareHooks") {
      if (!Array.isArray(data?.[field])) throw new Error(`Invalid result JSON: missing ${field}`);
      normalized[field] = data[field].map(item => String(item).trim()).filter(Boolean);
    } else {
      if (typeof data?.[field] !== "string" || !data[field].trim()) throw new Error(`Invalid result JSON: missing ${field}`);
      normalized[field] = field === "title"
        ? normalizeResultTitle(data[field])
        : field === "status42"
          ? normalizeResultStatus(data[field])
          : data[field].trim();
    }
  }
  normalized.famousScenes = normalized.famousScenes.slice(0, 3);
  normalized.timelineBlocks = normalized.timelineBlocks.slice(0, 3);
  normalized.shareHooks = normalized.shareHooks.slice(0, 3);
  if (
    normalized.careerPossibilities.length < 3 ||
    normalized.famousScenes.length < 3 ||
    normalized.timelineBlocks.length < 3 ||
    normalized.shareHooks.length < 2
  ) {
    throw new Error("Invalid result JSON: insufficient list items");
  }
  // title 第三段强制与 careerPossibilities[0] 对齐，杜绝“资深工程师”兜底化
  const topCareer = String(normalized.careerPossibilities[0]?.label || "").trim();
  if (topCareer && topCareer.length <= 10) {
    const parts = normalized.title.split(/[，,]/).map(part => part.trim()).filter(Boolean);
    if (parts.length === 3 && parts[2] !== topCareer) {
      normalized.title = `${parts[0]}，${parts[1]}，${topCareer}`;
    }
  }
  return normalized;
}

function normalizeResultBlocks(value, count, normalizer) {
  const source = Array.isArray(value) ? value : [];
  return source.map((item, index) => normalizer(item, index)).filter(Boolean).slice(0, count);
}

function normalizeSceneCardBlock(item, index) {
  if (item && typeof item === "object" && !Array.isArray(item)) {
    const title = optionalCleanText(item.title || item.headline || item.name).slice(0, 24);
    const body = optionalCleanText(item.body || item.desc || item.text);
    if (title || body) return { title: title || `第 ${index + 1} 个片段`, body: body || title };
  }
  const text = optionalCleanText(item);
  if (!text) return null;
  const title = text.split(/[，,。.!！?？]/).map(part => part.trim()).find(Boolean) || text;
  return { title: title.slice(0, 24), body: text };
}

function normalizeTimelineBlock(item, index) {
  const fallbackTitles = ["18-22 岁：大学四年", "22-30 岁：毕业第一站", "30-36 岁：沉浮与名场面"];
  if (item && typeof item === "object" && !Array.isArray(item)) {
    const title = optionalCleanText(item.title || item.headline || item.name).slice(0, 28);
    const body = optionalCleanText(item.body || item.desc || item.text);
    if (title || body) return { title: title || fallbackTitles[index], body: body || title };
  }
  const text = optionalCleanText(item);
  if (!text) return null;
  return { title: fallbackTitles[index] || `第 ${index + 1} 段`, body: text };
}

function normalizeResultCard(item, fallback) {
  if (item && typeof item === "object" && !Array.isArray(item)) {
    const title = optionalCleanText(item.title || item.headline || item.name).slice(0, 30);
    const body = optionalCleanText(item.body || item.desc || item.text);
    if (title || body) return { title: title || fallback.title, body: body || fallback.body };
  }
  const text = optionalCleanText(item);
  if (text) return { title: fallback.title, body: text };
  return fallback;
}

function normalizeResultTitle(value) {
  const raw = optionalCleanText(value)
    .replace(/[：:][^，,。！？!?；;]+的人/g, "")
    .replace(/[：:]/g, "，");
  const parts = raw.split(/[，,、｜|/]+/).map(item => item.trim()).filter(Boolean);
  if (parts.length >= 3) return parts.slice(0, 3).map((item, index) => cleanTitleSegment(item, index)).join("，").slice(0, 24);
  if (/但|且|的/.test(raw) && raw.length >= 10) return raw.slice(0, 21);
  return ["稳定嘴硬", "账本漂亮", "靠谱大人"].join("，");
}

function cleanTitleSegment(value, index = 0) {
  const fallback = ["稳定嘴硬", "账本漂亮", "靠谱大人"][index] || "靠谱大人";
  let text = optionalCleanText(value)
    .replace(/^(你是|一个|一种)/, "")
    .replace(/方向[:：]?$/, "")
    .replace(/的人$/, "");
  if (index === 0) {
    text = text
      .replace("秩序感强但心里加班", "秩序心累")
      .replace("情绪稳定但会嘴硬", "稳定嘴硬");
  }
  if (index === 1) {
    text = text
      .replace("靠资源把局面做大", "资源上桌")
      .replace("靠分析把坑绕过去", "分析避坑")
      .replace("现实账本还算漂亮", "账本漂亮");
  }
  if (index === 2) {
    text = normalizeCareerTitleSegment(text);
  }
  return text.slice(0, 7) || fallback;
}

function normalizeCareerTitleSegment(value) {
  const text = optionalCleanText(value);
  const rules = [
    [/心理|咨询/, "心理咨询师"],
    [/架构|算法|计算机|代码|工程师/, "资深工程师"],
    [/教师|教育|老师/, "明星教师"],
    [/新闻|传媒|内容/, "内容主理人"],
    [/法学|法律|律师/, "硬核法律人"],
    [/医学|医生|临床/, "靠谱医生"],
    [/生物|医药|制药|药企/, "生物PM"],
    [/金融|财务|会计/, "清醒财务人"],
    [/设计|艺术|创意/, "创意主理人"]
  ];
  const hit = rules.find(([pattern]) => pattern.test(text));
  return hit ? hit[1] : text;
}

function normalizeResultStatus(value) {
  const cleaned = optionalCleanText(value)
    .replace(/^你走了\d+年[，,]?/, "")
    .replace(/^从[^，。！？!?；;]{2,24}到[^，。！？!?；;]{2,24}[，,]?/, "")
    .replace(/18年/g, "这些年")
    .replace(/[。！？!?；;]+$/g, "");
  if (cleaned.length <= 36) return cleaned;
  const clipped = cleaned.slice(0, 36);
  const boundary = Math.max(clipped.lastIndexOf("，"), clipped.lastIndexOf("、"));
  return (boundary >= 20 ? clipped.slice(0, boundary) : clipped).replace(/[，。！？!?；;]+$/g, "");
}

function fallbackResultCard(field) {
  const map = {
    choiceHabit: {
      title: "你习惯先看后果，再决定往哪边压",
      body: "你不是乱冲，也不是只会求稳。你会先判断代价，再决定是往前推一步，还是先把底盘守住。"
    },
    mentalPrep: {
      title: "高回报的路，也要准备更高波动",
      body: "这条路的难点不是一次选择对不对，而是你要更早准备情绪起伏、关系协调和现实成本。"
    },
    letter18: {
      title: "志愿只是起点，后面的改写更重要",
      body: "真正决定你会变成谁的，不是某一张志愿表，而是你之后每次愿不愿意继续修正和往前走。"
    }
  };
  return map[field];
}

function normalizeCareerPossibility(item) {
  if (!item || typeof item !== "object") return null;
  const percent = Math.max(1, Math.min(99, Number(item.percent || 0)));
  const label = optionalCleanText(item.label).slice(0, 10);
  if (!percent || !label) return null;
  return { percent, label };
}

function annualCardFromData(data) {
  const yearNumber = Number(data.question.match(/\d+/)?.[0] || data.year || 1);
  const sceneText = `事件：${data.scene.title}\n情境：${data.scene.body}`;
  return {
    ...data,
    yearNumber,
    year: data.question,
    scene: sceneText,
    sceneTitle: data.scene.title,
    sceneBody: data.scene.body,
    prompt: sceneText,
    context: data.summary,
    leftHint: "A",
    rightHint: "B",
    left: { label: data.a.label, title: data.a.title, desc: data.a.desc, tag: data.a.tag, consequence: data.a.consequence || "", riasec: data.a.riasec || null, delta: { stability: 3, discipline: 2, explore: -1 } },
    right: { label: data.b.label, title: data.b.title, desc: data.b.desc, tag: data.b.tag, consequence: data.b.consequence || "", riasec: data.b.riasec || null, delta: { explore: 3, ambition: 2, stability: -1 } }
  };
}

function mockResponse(messages) {
  const content = messages.at(-1).content;
  if (content.includes("\"title\": \"\"") && content.includes("\"timelineBlocks\"")) {
    return {
      title: "稳定嘴硬，账本漂亮，项目统筹",
      status42: "靠几次救场混成靠谱大人，手机静音也会心虚。",
      majorCareerNote: "这只是故事内估计，不是现实建议。你的专业提供了第一套工具，但后面每次选择都会改写路标。专业决定起点，不决定你一辈子的工牌。",
      careerPossibilities: [
        { percent: 28, label: "专业骨干" },
        { percent: 19, label: "内容产品" },
        { percent: 23, label: "项目统筹" }
      ],
      famousScenes: [
        { title: "临时救场讲成代表作", body: "你在一次没人想接的场合硬着头皮上，结果反而把自己讲成了全场记住的人。" },
        { title: "一条语音听出半句废话", body: "别人都在点头时，你先把含糊要求翻成人话，少走了最冤的一大段弯路。" },
        { title: "早年小道具救了大场面", body: "第 3 年留下的小东西到第 18 年突然派上用场，像人生自己给自己留了后手。" }
      ],
      timelineBlocks: [
        { title: "18-22 岁：大学四年", body: "你一边试方向一边认人，专业没有立刻锁死你，反而逼着你更早想清楚自己适合哪种节奏。" },
        { title: "22-30 岁：毕业第一站", body: "你先在现实里练基本功，再慢慢找到更像自己的位置。看上去像绕路，其实是在补未来会用上的底子。" },
        { title: "30-36 岁：沉浮与名场面", body: "前面的选择开始一起回响，高光和社死都变得更有分量，你也终于学会把离谱日子过成自己的版本。" }
      ],
      choiceHabit: {
        title: "你习惯先算后果，再决定要不要冲",
        body: "你不是那种为了热血就盲冲的人。多数时候你会先看代价，再判断值不值得往前推，所以你的路更像稳着提速。"
      },
      mentalPrep: {
        title: "好机会常常带着压力一起上门",
        body: "你真正要准备的，不只是能力跟不跟得上，还有关系怎么协调、节奏怎么稳住、累的时候怎么别一个人硬扛。"
      },
      letter18: {
        title: "志愿不是判决书，顶多算开局说明书",
        body: "十八岁的你不用急着一次选对。真正拉开差距的，是你以后每次愿不愿意修正路线，继续往前走。"
      },
      shareHooks: ["这条线像我，但比我会复盘。", "原来专业只是新手村。", "测完想给志愿表道个歉。"]
    };
  }
  if (content.includes("\"batchCount\"")) {
    const parsed = parseJsonFromPrompt(content);
    const startYear = Number(parsed?.gameMeta?.startYear || 1);
    const count = Number(parsed?.gameMeta?.batchCount || 5);
    return {
      cards: Array.from({ length: count }, (_, index) => {
        const year = startYear + index;
        const outlineCard = getOutlineCard(year);
        const axis = Array.isArray(outlineCard?.riasecAxis) ? outlineCard.riasecAxis : ["E", "C"];
        return {
          year,
          phase: outlineCard?.phase || "试播阶段",
          mainTrack: outlineCard?.mainTrack || (year % 3 === 0 ? "relationship" : "life"),
          summary: mockSummary(year, parsed?.history, "暧昧升温，沈晚晴开始给你留座"),
          question: `第 ${year} 年 / ${totalGameYears}`,
          lifeTrack: "项目节奏更紧了，老师和同学开始把难活往你这里递",
          relationshipTrack: "暧昧升温：沈晚晴开始固定留座",
          callbacks: outlineCard?.callbacks?.slice(0, 3) || ["朋友群新梗"],
          scene: {
            title: mockSceneTitle(year, outlineCard),
            body: outlineCard?.conflict || "你在一次普通会议里被点名，项目负责人把一个看起来很香的机会推到你面前。沈晚晴刚问你晚上有没有空，机会写着成长，代价写着加班，旁边同事小声说这题像人生强制更新。"
          },
          a: { title: "先接下来", desc: "边做边摸清真实代价", tag: "机会试探", consequence: "你把活接住后，学长直接把你推上汇报位，后面一周的空闲也跟着清零了", riasec: mockRiasec(axis[0]) },
          b: { title: "当场拒绝", desc: "把时间留给确定方向", tag: "边界清晰", consequence: "你把时间从杂活里抢了回来，沈晚晴却开始认真记你到底在躲什么", riasec: mockRiasec(axis[1]) }
        };
      })
    };
  }
  const parsed = parseJsonFromPrompt(content);
  const year = Number(parsed?.gameMeta?.currentYear || 1);
  const outlineCard = getOutlineCard(year);
  const axis = Array.isArray(outlineCard?.riasecAxis) ? outlineCard.riasecAxis : ["E", "C"];
  return {
    year,
    phase: outlineCard?.phase || "试播阶段",
    mainTrack: outlineCard?.mainTrack || (year % 3 === 0 ? "relationship" : "life"),
    summary: mockSummary(year, parsed?.history, "冷战后撤，沈晚晴把见面时间往后挪"),
    question: `第 ${year} 年 / ${totalGameYears}`,
    lifeTrack: "新机会把你的日程重新排了一遍，老师默认你该顶上更难的位置",
    relationshipTrack: "冷战后撤：沈晚晴直接问你是不是在躲",
    callbacks: outlineCard?.callbacks?.slice(0, 3) || ["茶水间吐槽"],
    scene: {
      title: mockSceneTitle(year, outlineCard),
      body: outlineCard?.conflict || "你刚把上一轮麻烦收拾完，朋友又带来一个新岔路，沈晚晴的未读消息还挂在聊天顶上。机会来得很响，代价也写在脸上，连茶水间的饮水机都像在等你做决定。"
    },
    a: { title: "立刻接下", desc: "把自己推到更大场面", tag: "主动推进", consequence: "你一接手就被默认成这局负责人，机会确实更大了，但这周的觉也基本没了", riasec: mockRiasec(axis[0]) },
    b: { title: "当场拒绝", desc: "先守住成形的节奏", tag: "稳住生活", consequence: "你没再让自己多开一条战线，可沈晚晴那边也明显把手收了半步", riasec: mockRiasec(axis[1]) }
  };
}

function mockSceneTitle(year, outlineCard) {
  const seed = outlineCard?.callbacks?.[0] || outlineCard?.comedyDevice || outlineCard?.phase || "人生弹窗";
  return `第${year}年·${String(seed).slice(0, 6)}`;
}

function mockRiasec(mainType, secondaryType = "I") {
  const main = riasecTypes.includes(mainType) ? mainType : "E";
  const secondary = riasecTypes.includes(secondaryType) && secondaryType !== main ? secondaryType : "";
  const scores = Object.fromEntries(riasecTypes.map(key => [key, 0]));
  scores[main] = 4;
  if (secondary) scores[secondary] = 1;
  return scores;
}

function mockSummary(year, history, relationshipState) {
  if (Number(year) <= 1) return "";
  return mergeFeedbackParts(buildHistoryConsequence(history), relationshipState);
}

function parseJsonFromPrompt(content) {
  const inputMarker = "输入数据：";
  const outputMarker = "输出字段：";
  const inputStart = content.indexOf(inputMarker);
  const outputStart = content.indexOf(outputMarker, inputStart + inputMarker.length);
  if (inputStart >= 0 && outputStart > inputStart) {
    const inputText = content.slice(inputStart + inputMarker.length, outputStart).trim();
    try {
      return JSON.parse(inputText);
    } catch {}
  }
  const end = content.lastIndexOf("}");
  if (end < 0) return null;
  let start = content.indexOf("{");
  while (start >= 0 && start < end) {
    try {
      return JSON.parse(content.slice(start, end + 1));
    } catch {}
    start = content.indexOf("{", start + 1);
  }
  return null;
}

async function handleApi(req, res, pathname) {
  if (pathname === "/api/health") {
    const promptLabRealProxy = mockMode;
    const modelOptions = promptLabRealProxy ? promptLabProxyModelOptions() : publicModelOptions();
    sendJson(res, 200, {
      ok: true,
      service: "gaokao-life-simulator",
      runtime: "node-local",
      mock: mockMode,
      promptLabRealProxy,
      promptLabRealApiBase: promptLabRealProxy ? promptLabRealProxyBase : "",
      hasModelKey: promptLabRealProxy || modelIsConfigured(resolveModelConfig(defaultModel)),
      hasDeepSeekKey: modelConfigs.some(config => config.provider === "deepseek" && isUsableApiKey(config.apiKey)),
      hasMimoKey: modelConfigs.some(config => config.provider === "mimo" && isUsableApiKey(config.apiKey)),
      model: promptLabRealProxy ? promptLabRealProxyModel : defaultModel,
      availableModels: modelOptions.map(option => option.id),
      modelOptions,
      time: new Date().toISOString()
    });
    return;
  }
  let body = {};
  let profile = normalizeProfile();
  let history = [];
  let requestModel = defaultModel;
  const promptLabDebug = isPromptLabDebugRequest(req);
  try {
    body = await readJson(req);
    profile = normalizeProfile(body.profile);
    history = Array.isArray(body.history) ? body.history : [];
    requestModel = resolveModelConfig(body.model).id;

    if (shouldProxyPromptLabRealRequest(req, pathname)) {
      await proxyPromptLabRealRequest(res, pathname, body);
      return;
    }

    if (pathname === "/api/game/start/stream" || pathname === "/api/game/next/stream") {
      await sendAnnualStream(res, { pathname, profile, history, body, model: requestModel });
      return;
    }

    if (pathname === "/api/game/start") {
      const data = await callModel(buildAnnualMessages({ profile, history: [], year: 1 }), value => validateAnnual(value, []), requestModel, null, promptLabDebug);
      sendJson(res, 200, { ok: true, model: requestModel, card: annualCardFromData(data), ...debugField(data) });
      return;
    }
    if (pathname === "/api/game/next") {
      const year = Math.min(Math.max(Number(body.year || history.length + 1), 2), totalGameYears);
      const data = await callModel(buildAnnualMessages({ profile, history, year }), value => validateAnnual(value, history), requestModel, null, promptLabDebug);
      sendJson(res, 200, { ok: true, model: requestModel, card: annualCardFromData(data), ...debugField(data) });
      return;
    }
    if (pathname === "/api/game/batch") {
      const startYear = Math.min(Math.max(Number(body.startYear || history.length + 1), 1), totalGameYears);
      const count = Math.min(Math.max(Number(body.count || 5), 1), totalGameYears - startYear + 1, 5);
      const data = await callModel(
        buildBatchMessages({ profile, history, startYear, count }),
        value => validateBatch(value, count, startYear, history),
        requestModel,
        null,
        promptLabDebug
      );
      sendJson(res, 200, { ok: true, model: requestModel, cards: data.cards.map(annualCardFromData), ...debugField(data) });
      return;
    }
    if (pathname === "/api/game/result") {
      const result = await callModel(buildResultMessages({ profile, history }), validateResult, requestModel, null, promptLabDebug);
      sendJson(res, 200, { ok: true, model: requestModel, result, ...debugField(result) });
      return;
    }
    sendJson(res, 404, { ok: false, error: "API route not found" });
  } catch (error) {
    console.error(`API degraded fallback for ${pathname}:`, error?.message || error);
    try {
      if (pathname === "/api/game/start") {
        const data = validateAnnual(mockResponse(buildAnnualMessages({ profile, history: [], year: 1 })), []);
        sendJson(res, 200, { ok: true, model: requestModel, degraded: true, card: annualCardFromData(data) });
        return;
      }
      if (pathname === "/api/game/next") {
        const year = Math.min(Math.max(Number(body.year || history.length + 1), 2), totalGameYears);
        const data = validateAnnual(mockResponse(buildAnnualMessages({ profile, history, year })), history);
        sendJson(res, 200, { ok: true, model: requestModel, degraded: true, card: annualCardFromData(data) });
        return;
      }
      if (pathname === "/api/game/batch") {
        const startYear = Math.min(Math.max(Number(body.startYear || history.length + 1), 1), totalGameYears);
        const count = Math.min(Math.max(Number(body.count || 5), 1), totalGameYears - startYear + 1, 5);
        const data = validateBatch(mockResponse(buildBatchMessages({ profile, history, startYear, count })), count, startYear, history);
        sendJson(res, 200, { ok: true, model: requestModel, degraded: true, cards: data.cards.map(annualCardFromData) });
        return;
      }
      if (pathname === "/api/game/result") {
        const result = validateResult(mockResponse(buildResultMessages({ profile, history })));
        sendJson(res, 200, { ok: true, model: requestModel, degraded: true, result: { ...result, degraded: true } });
        return;
      }
    } catch (fallbackError) {
      console.error("API fallback failed:", fallbackError?.message || fallbackError);
    }
    sendJson(res, error.status || 500, { ok: false, error: error.message || "Request failed" });
  }
}

async function serveStatic(res, pathname) {
  const requested = pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
  const filePath = normalize(join(rootDir, requested));
  if (!filePath.startsWith(rootDir) || !existsSync(filePath)) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }
  res.writeHead(200, { "content-type": mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream" });
  createReadStream(filePath).pipe(res);
}

createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`);
  if (url.pathname.startsWith("/api/")) {
    if (url.pathname !== "/api/health" && req.method !== "POST") {
      sendJson(res, 405, { ok: false, error: "Method not allowed" });
      return;
    }
    await handleApi(req, res, url.pathname);
    return;
  }
  await serveStatic(res, url.pathname);
}).listen(port, host, () => {
  const displayHost = host === "0.0.0.0" ? "127.0.0.1" : host;
  console.log(`高考人生模拟器本地服务已启动: http://${displayHost}:${port}/`);
  if (mockMode) console.log("LLM_MOCK=1，当前使用本地模拟内容。");
  if (!mockMode) {
    const missingProviders = [...new Set(modelConfigs.filter(config => !isUsableApiKey(config.apiKey)).map(config => config.provider))];
    if (missingProviders.length) console.log(`未检测到这些 provider 的可用 API Key：${missingProviders.join(", ")}。相关模型会走降级内容。`);
  }
});
