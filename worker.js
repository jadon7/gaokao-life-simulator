import {
  annualTaskPromptForYear,
  batchTaskPromptForStartYear,
  buildAnnualInput,
  buildBatchInput,
  buildResultInput,
  getOutlineCard,
  vNextResultTaskPrompt,
  vNextSystemPrompt
} from "./deepseek-prompt-vnext.js";
import { buildOpeningCard } from "./opening-cards-data.js";

const defaultDeepSeekModel = "deepseek-v4-flash";
const defaultMiniMaxModel = "MiniMax-M2.7-highspeed";
const defaultDeepSeekBaseUrl = "https://api.deepseek.com";
const defaultMiniMaxBaseUrl = "https://api.minimax.io/v1";
const defaultLlmStream = true;
const defaultLlmTimeoutMs = 26000;
const totalGameYears = 18;
const finalResultAge = 35;
const riasecTypes = ["R", "I", "A", "S", "E", "C"];

const annualFields = ["summary", "question", "scene", "a", "b"];
const resultFields = ["title", "status42", "majorCareerNote", "careerPossibilities", "famousScenes", "timelineBlocks", "choiceHabit", "mentalPrep", "letter18", "innerYearning", "shareHooks"];

function systemPrompt() {
  return vNextSystemPrompt;
}

function currentModel(env) {
  const requested = env?.LLM_MODEL || env?.DEEPSEEK_MODEL || env?.MINIMAX_MODEL;
  const configs = buildModelConfigs(env);
  if (configs.some(config => config.id === requested)) return requested;
  return defaultDeepSeekModel;
}

function buildModelConfigs(env) {
  const deepseekBaseUrl = env?.DEEPSEEK_BASE_URL || defaultDeepSeekBaseUrl;
  const minimaxBaseUrl = env?.MINIMAX_BASE_URL || defaultMiniMaxBaseUrl;
  return [
    {
      id: "deepseek-v4-flash",
      label: "DeepSeek V4 Flash",
      provider: "deepseek",
      baseUrl: deepseekBaseUrl,
      apiKey: env?.DEEPSEEK_API_KEY,
      authHeader: "authorization",
      maxTokensField: "max_tokens",
      supportsThinking: true,
      supportsResponseFormat: true
    },
    {
      id: "deepseek-v4-pro",
      label: "DeepSeek V4 Pro",
      provider: "deepseek",
      baseUrl: deepseekBaseUrl,
      apiKey: env?.DEEPSEEK_API_KEY,
      authHeader: "authorization",
      maxTokensField: "max_tokens",
      supportsThinking: true,
      supportsResponseFormat: true
    },
    {
      id: defaultMiniMaxModel,
      label: "MiniMax M2.7 Highspeed",
      provider: "minimax",
      baseUrl: minimaxBaseUrl,
      apiKey: env?.MINIMAX_API_KEY,
      authHeader: "authorization",
      maxTokensField: "max_completion_tokens",
      supportsThinking: false,
      supportsResponseFormat: false
    }
  ];
}

function modelIsConfigured(config, env) {
  return env?.LLM_MOCK === "1" || env?.DEEPSEEK_MOCK === "1" || isUsableApiKey(config?.apiKey);
}

function publicModelOptions(env) {
  return buildModelConfigs(env).map(config => ({
    id: config.id,
    label: config.label,
    provider: config.provider,
    configured: modelIsConfigured(config, env)
  }));
}

function resolveModelConfig(env, value) {
  const requested = String(value || currentModel(env)).trim();
  const configs = buildModelConfigs(env);
  return configs.find(config => config.id === requested) || configs.find(config => config.id === currentModel(env)) || configs[0];
}

function sendJson(status, data) {
  return Response.json(data, {
    status,
    headers: { "cache-control": "no-store" }
  });
}

async function readJson(request) {
  const raw = await request.text();
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
    majorLabel: clean(profile.majorLabel, clean(profile.major, "未选专业")),
    relationName: clean(profile.relationName, clean(profile.openingRelationName, "")),
    relationGender: clean(profile.relationGender, clean(profile.openingRelationGender, "")),
    relationIntro: clean(profile.relationIntro, clean(profile.openingRelationIntro, ""))
  };
}

function compactHistory(history = []) {
  return history.slice(-totalGameYears).map(item => ({
    year: item.year,
    scene: item.scene,
    sceneTitle: item.sceneTitle,
    sceneBody: item.sceneBody,
    summary: item.summary,
    phase: item.phase,
    mainTrack: item.mainTrack,
    lifeTrack: item.lifeTrack,
    relationshipTrack: item.relationshipTrack,
    callbackSeeds: item.callbackSeeds,
    appearedRoles: Array.isArray(item.appearedRoles) ? item.appearedRoles.slice(0, 8) : [],
    choice: item.choice,
    choiceText: item.choiceText,
    consequence: item.consequence,
    tag: item.tag,
    holland: item.holland,
    offeredHolland: item.offeredHolland
  }));
}

function truncateLogText(value, max = 160) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function redactSensitiveText(value) {
  return String(value ?? "")
    .replace(/sk-[A-Za-z0-9_-]{8,}/g, "sk-***")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer ***")
    .replace(/(["']?(?:api[_-]?key|authorization|token|secret)["']?\s*[:=]\s*["']?)[^"',}\s]+/gi, "$1***");
}

function safeLogValue(value, max = 1200) {
  if (value == null || value === "") return "";
  let text = "";
  try {
    text = typeof value === "string" ? value : JSON.stringify(value);
  } catch {
    text = String(value);
  }
  return truncateLogText(redactSensitiveText(text), max);
}

function profileLogSummary(profile = {}) {
  const p = normalizeProfile(profile);
  return {
    name: truncateLogText(p.name, 32),
    gender: p.gender,
    province: p.province,
    score: p.score,
    major: p.majorLabel || p.major,
    hope: p.hope,
    keywords: truncateLogText(p.keywords, 80),
    dream: truncateLogText(p.dream, 80),
    relation: truncateLogText([p.relationIntro, p.relationName].filter(Boolean).join(" "), 80)
  };
}

function historyLogSummary(history = []) {
  const list = Array.isArray(history) ? history : [];
  return {
    count: list.length,
    lastYear: list.length ? Number(list[list.length - 1]?.year || list.length) : 0,
    recent: list.slice(-4).map(item => ({
      year: Number(item?.year || 0) || undefined,
      phase: truncateLogText(item?.phase, 40),
      scene: truncateLogText(item?.sceneTitle || item?.scene, 80),
      choice: truncateLogText(item?.choiceText || item?.choice || item?.tag, 80),
      tag: truncateLogText(item?.tag, 40),
      holland: item?.holland || undefined
    }))
  };
}

function apiYearFor(pathname, body = {}, history = []) {
  const path = String(pathname || "");
  const historyLength = Array.isArray(history) ? history.length : 0;
  if (path.includes("/start")) return 1;
  if (path.includes("/next")) return Math.min(Math.max(Number(body.year || historyLength + 1) || 1, 2), totalGameYears);
  if (path.includes("/batch")) return Math.min(Math.max(Number(body.startYear || historyLength + 1) || 1, 1), totalGameYears);
  if (path.includes("/result")) return "result";
  return null;
}

function buildApiLogContext({ pathname, body, profile, history, model }) {
  return {
    pathname,
    year: apiYearFor(pathname, body, history),
    model,
    profile: profileLogSummary(profile),
    history: historyLogSummary(history)
  };
}

function classifyApiError(error) {
  const message = String(error?.message || error || "");
  if (error?.status === 499) return "client_aborted";
  if (/维护|暂停/.test(message)) return "maintenance";
  if (/API Key|Secret|key/i.test(message)) return "model_config";
  if (/timeout|超时|abort/i.test(message)) return "timeout";
  if (/invalid JSON|Invalid .*JSON|Model returned invalid JSON/i.test(message)) return "model_output_invalid";
  if (error?.status >= 500) return "upstream_5xx";
  if (error?.status >= 400) return "upstream_4xx";
  return "runtime_error";
}

function errorLogSummary(error) {
  return {
    name: error?.name || "Error",
    status: error?.status || undefined,
    reason: classifyApiError(error),
    message: truncateLogText(redactSensitiveText(error?.message || error || ""), 300),
    modelRawError: safeLogValue(error?.modelRawError || error?.rawError || "", 1200) || undefined
  };
}

function logApiEvent(level, evt, context = {}, error = null, extra = {}) {
  const payload = {
    evt,
    level,
    api: context.pathname,
    year: context.year,
    model: context.model,
    profile: context.profile,
    history: context.history,
    ...extra,
    error: error ? errorLogSummary(error) : undefined
  };
  Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

const analyticsEventNames = new Set([
  "page_view",
  "flow_view",
  "profile_submit",
  "game_start_success",
  "card_view",
  "choice_click",
  "card_load_start",
  "card_load_success",
  "card_load_fail",
  "card_retry_click",
  "result_load_start",
  "result_load_success",
  "result_load_fail",
  "result_view",
  "game_complete",
  "restart_click",
  "share_click",
  "share_image_generated",
  "share_image_fail",
  "author_cta_click",
  "save_share_page_view",
  "api_request",
  "session_exit"
]);

function cleanAnalyticsText(value, max = 80) {
  return truncateLogText(redactSensitiveText(value), max);
}

function cleanAnalyticsNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function cleanAnalyticsBoolean(value) {
  return value === true || value === "true" ? true : value === false || value === "false" ? false : undefined;
}

function analyticsBodySummary(body = {}, meta = {}) {
  const event = analyticsEventNames.has(String(body.event || "")) ? String(body.event) : "unknown";
  const payload = {
    evt: "analytics",
    level: "info",
    event,
    session_id: cleanAnalyticsText(body.session_id, 64),
    run_id: cleanAnalyticsText(body.run_id, 64),
    timestamp: cleanAnalyticsText(body.timestamp, 40),
    flow: cleanAnalyticsText(body.flow, 20),
    year: cleanAnalyticsText(body.year, 16),
    history_count: cleanAnalyticsNumber(body.history_count),
    completed: cleanAnalyticsBoolean(body.completed),
    bounced: cleanAnalyticsBoolean(body.bounced),
    duration_ms: cleanAnalyticsNumber(body.duration_ms),
    endpoint: cleanAnalyticsText(body.endpoint, 48),
    status: cleanAnalyticsNumber(body.status),
    error_type: cleanAnalyticsText(body.error_type, 40),
    transport: cleanAnalyticsText(body.transport, 16),
    score_band: cleanAnalyticsText(body.score_band, 16),
    major_label: cleanAnalyticsText(body.major_label, 40),
    holland_primary: cleanAnalyticsText(body.holland_primary, 4),
    scene_title: cleanAnalyticsText(body.scene_title, 80),
    phase: cleanAnalyticsText(body.phase, 40),
    main_track: cleanAnalyticsText(body.main_track, 32),
    choice_side: cleanAnalyticsText(body.choice_side, 12),
    choice_tag: cleanAnalyticsText(body.choice_tag, 40),
    choice_riasec_top: cleanAnalyticsText(body.choice_riasec_top, 4),
    is_postgrad: cleanAnalyticsBoolean(body.is_postgrad),
    child_birth: cleanAnalyticsBoolean(body.child_birth),
    child_care: cleanAnalyticsBoolean(body.child_care),
    positive_scene: cleanAnalyticsBoolean(body.positive_scene),
    pressure_scene: cleanAnalyticsBoolean(body.pressure_scene),
    degraded: cleanAnalyticsBoolean(body.degraded),
    share_mode: cleanAnalyticsText(body.share_mode, 16),
    source: cleanAnalyticsText(body.source, 32),
    exit_reason: cleanAnalyticsText(body.exit_reason, 20),
    path: cleanAnalyticsText(body.path, 80),
    referrer_host: cleanAnalyticsText(body.referrer_host, 80),
    ua: cleanAnalyticsText(meta.ua, 120)
  };
  Object.keys(payload).forEach(key => payload[key] === undefined || payload[key] === "" ? delete payload[key] : null);
  return payload;
}

function logAnalyticsEvent(body = {}, meta = {}) {
  console.log(JSON.stringify(analyticsBodySummary(body, meta)));
}

function attachModelError(error, metadata = {}) {
  if (!error || typeof error !== "object") return error;
  if (metadata.status && !error.status) error.status = metadata.status;
  if (metadata.modelRawError && !error.modelRawError) error.modelRawError = metadata.modelRawError;
  if (metadata.provider && !error.modelProvider) error.modelProvider = metadata.provider;
  if (metadata.model && !error.model) error.model = metadata.model;
  return error;
}

function maintenanceMessage(env) {
  return clean(env?.MAINTENANCE_MESSAGE, "模型服务正在临时维护，前面的选择不会丢，请稍后再试。");
}

function isMaintenanceMode(env) {
  return String(env?.MAINTENANCE_MODE || "").trim() === "1";
}

function taskPromptWithInput(taskPrompt, input) {
  const inputJson = JSON.stringify(input);
  return taskPrompt.includes("{{INPUT_JSON}}")
    ? taskPrompt.replace("{{INPUT_JSON}}", inputJson)
    : `${taskPrompt}\n\n${inputJson}`;
}

function buildAnnualMessages({ profile, history, year }) {
  const historyDigest = compactHistory(history);
  const input = buildAnnualInput({ profile: normalizeProfile(profile), history: historyDigest, year, totalGameYears });
  return [
    { role: "system", content: systemPrompt() },
    {
      role: "user",
      content: taskPromptWithInput(annualTaskPromptForYear(year, historyDigest, normalizeProfile(profile)), input)
    }
  ];
}

function buildBatchMessages({ profile, history, startYear, count }) {
  const normalizedProfile = normalizeProfile(profile);
  const historyDigest = compactHistory(history);
  const input = buildBatchInput({
    profile: normalizedProfile,
    history: historyDigest,
    startYear,
    count,
    totalGameYears
  });
  return [
    { role: "system", content: systemPrompt() },
    {
      role: "user",
      content: taskPromptWithInput(batchTaskPromptForStartYear(startYear, count, historyDigest, normalizedProfile).replaceAll("{{count}}", String(count)), input)
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

function clientAbortError() {
  const error = new Error("请求已取消");
  error.status = 499;
  return error;
}

async function callModel(messages, validator, env, model = currentModel(env), onDelta = null, debug = false, onDiscard = null, clientSignal = null, logContext = null) {
  const config = resolveModelConfig(env, model);
  if (env?.LLM_MOCK === "1" || env?.DEEPSEEK_MOCK === "1") {
    const raw = mockResponse(messages);
    return attachModelDebug(validator(raw), debug, {
      request: requestBody(config, messages, false),
      rawOutput: JSON.stringify(raw, null, 2)
    });
  }
  const llmStream = (env?.LLM_STREAM || env?.DEEPSEEK_STREAM || "1") === "0" ? false : defaultLlmStream;
  const llmTimeoutMs = Math.max(8000, Math.min(55000, Number(env?.LLM_TIMEOUT_MS || env?.DEEPSEEK_TIMEOUT_MS || defaultLlmTimeoutMs)));
  if (!isUsableApiKey(config?.apiKey)) {
    const secretName = config?.provider === "minimax" ? "MINIMAX_API_KEY" : "DEEPSEEK_API_KEY";
    const error = new Error(`${config?.label || model} API Key 未配置或格式不正确。请在 Cloudflare Worker Secret 中设置 ${secretName}。`);
    error.status = 500;
    throw error;
  }

  const useInitialStream = llmStream && typeof onDelta === "function";
  const maxAttempts = useInitialStream ? 2 : 1;
  let lastError;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const useStream = useInitialStream && attempt === 0;
    let streamedAny = false;
    let clientAborted = false;
    const controller = new AbortController();
    const abortFromClient = () => {
      clientAborted = true;
      controller.abort("client aborted");
    };
    if (clientSignal?.aborted) throw clientAbortError();
    clientSignal?.addEventListener("abort", abortFromClient, { once: true });
    let timeout = null;
    try {
      timeout = setTimeout(() => controller.abort(`${config.label} request timeout`), llmTimeoutMs);
      const body = requestBody(config, messages, useStream);
      const response = await fetch(`${String(config.baseUrl).replace(/\/+$/g, "")}/chat/completions`, {
        method: "POST",
        headers: requestHeaders(config),
        signal: controller.signal,
        body: JSON.stringify(body)
      });
      if (!response.ok) {
        const rawBody = await response.text().catch(() => "");
        let payload = {};
        try {
          payload = rawBody ? JSON.parse(rawBody) : {};
        } catch {
          payload = rawBody;
        }
        const error = new Error(payload?.error?.message || `${config.label} request failed: ${response.status}`);
        error.status = response.status;
        attachModelError(error, {
          provider: config.provider,
          model: config.id,
          modelRawError: payload || rawBody
        });
        throw error;
      }
      const content = useStream
        ? await readChatStream(response, text => {
            streamedAny = true;
            onDelta?.(text);
          })
        : (await response.json().catch(() => ({})))?.choices?.[0]?.message?.content;
      if (!content) throw new Error(`${config.label} returned empty content`);
      let parsed;
      try {
        parsed = parseJsonContent(content);
      } catch (error) {
        attachModelError(error, { provider: config.provider, model: config.id, modelRawError: content });
        throw error;
      }
      try {
        return attachModelDebug(validator(parsed), debug, { request: body, rawOutput: content });
      } catch (error) {
        attachModelError(error, { provider: config.provider, model: config.id, modelRawError: content });
        throw error;
      }
    } catch (error) {
      if (clientAborted || clientSignal?.aborted) throw clientAbortError();
      lastError = error;
      attachModelError(error, { provider: config.provider, model: config.id });
      logApiEvent("warn", "llm_attempt_failed", logContext || {}, error, {
        provider: config.provider,
        attempt: attempt + 1,
        attempts: maxAttempts,
        stream: useStream,
        status: error?.status || undefined
      });
      if (useStream && streamedAny) {
        onDiscard?.();
        continue;
      }
    } finally {
      clearTimeout(timeout);
      clientSignal?.removeEventListener("abort", abortFromClient);
    }
  }
  logApiEvent("error", "llm_degraded_fallback", logContext || {}, lastError, {
    provider: config.provider,
    attempts: maxAttempts
  });
  const raw = mockResponse(messages);
  const fallback = validator(raw);
  return attachModelDebug({ ...fallback, degraded: true }, debug, {
    request: requestBody(config, messages, false),
    rawOutput: JSON.stringify(raw, null, 2)
  });
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

function requestBody(config, messages, stream) {
  const body = {
    model: config.id,
    messages,
    temperature: 0.95,
    stream
  };
  body[config.maxTokensField || "max_tokens"] = maxTokensForMessages(messages);
  if (config.supportsResponseFormat) body.response_format = { type: "json_object" };
  if (config.supportsThinking) body.thinking = { type: "disabled" };
  return body;
}

function maxTokensForMessages(messages) {
  const task = String(messages?.[1]?.content || "");
  if (task.includes('"cards"')) return 3200;
  if (task.includes('"careerPossibilities"')) return 2400;
  return 1200;
}

function attachModelDebug(value, enabled, debug) {
  if (enabled && value && typeof value === "object") {
    Object.defineProperty(value, "__debug", { value: debug, enumerable: false, configurable: true });
  }
  return value;
}

async function readChatStream(response, onDelta = null) {
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";
  const readLine = line => {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) return;
    const data = trimmed.slice(5).trim();
    if (!data || data === "[DONE]") return;
    const payload = JSON.parse(data);
    const delta = payload?.choices?.[0]?.delta?.content || "";
    if (!delta) return;
    content += delta;
    onDelta?.(delta);
  };
  for await (const chunk of response.body) {
    buffer += decoder.decode(chunk, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || "";
    lines.forEach(readLine);
  }
  buffer += decoder.decode();
  buffer.split(/\r?\n/).forEach(readLine);
  return content.trim();
}

function annualStreamResponse({ pathname, profile, history, body, env, model, debug = false, clientSignal = null, logContext = null }) {
  const startedAt = Date.now();
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = data => controller.enqueue(encoder.encode(`${JSON.stringify(data)}\n`));
      send({ type: "meta", model });
      try {
        if (pathname === "/api/game/start/stream") {
          const data = buildOpeningCard(profile, totalGameYears);
          logApiEvent("info", "api_success", logContext || {}, null, { status: 200, ms: Date.now() - startedAt, stream: true, preset: true });
          send({ type: "done", ok: true, model, preset: true, card: annualCardFromData(data) });
          return;
        }
        const year = Math.min(Math.max(Number(body.year || history.length + 1), 2), totalGameYears);
        const data = await callModel(
          buildAnnualMessages({ profile, history, year }),
          value => validateAnnual(value, history, history, year, profile),
          env,
          model,
          text => send({ type: "delta", text }),
          debug,
          () => send({ type: "reset" }),
          clientSignal,
          logContext
        );
        logApiEvent("info", "api_success", logContext || {}, null, { status: 200, ms: Date.now() - startedAt, stream: true, degraded: !!data.degraded });
        send({ type: "done", ok: true, model, degraded: !!data.degraded, card: annualCardFromData(data), ...debugField(data) });
      } catch (error) {
        logApiEvent(error?.status === 499 ? "warn" : "error", "api_stream_failed", logContext || {}, error, { status: error?.status || 500 });
        send({ type: "error", ok: false, error: error.message || "Request failed" });
      } finally {
        controller.close();
      }
    }
  });
  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff"
    }
  });
}

function resultStreamResponse({ profile, history, env, model, debug = false, clientSignal = null, logContext = null }) {
  const startedAt = Date.now();
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = data => controller.enqueue(encoder.encode(`${JSON.stringify(data)}\n`));
      send({ type: "meta", model });
      try {
        const result = await callModel(
          buildResultMessages({ profile, history }),
          validateResult,
          env,
          model,
          text => send({ type: "delta", text }),
          debug,
          () => send({ type: "reset" }),
          clientSignal,
          logContext
        );
        logApiEvent("info", "api_success", logContext || {}, null, { status: 200, ms: Date.now() - startedAt, stream: true, degraded: !!result.degraded });
        send({ type: "done", ok: true, model, degraded: !!result.degraded, result, ...debugField(result) });
      } catch (error) {
        logApiEvent(error?.status === 499 ? "warn" : "error", "api_stream_failed", logContext || {}, error, { status: error?.status || 500 });
        send({ type: "error", ok: false, error: error.message || "Request failed" });
      } finally {
        controller.close();
      }
    }
  });
  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff"
    }
  });
}

function isPromptLabDebugRequest(request) {
  return request.headers.get("x-prompt-lab-real") === "1" || request.headers.get("x-prompt-lab-debug") === "1";
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

function validateAnnual(data, history = [], repeatHistory = history, expectedYear = null, profile = {}) {
  const normalized = {};
  if (typeof data?.summary !== "string") throw new Error("Invalid annual JSON: missing summary");
  normalized.summary = optionalCleanText(data.summary);
  const fallbackYear = Math.min(Math.max(Number(expectedYear || (Array.isArray(history) ? history.length + 1 : 1)) || 1, 1), totalGameYears);
  normalized.year = fallbackYear;
  normalized.question = `第 ${fallbackYear} 年 / ${totalGameYears}`;
  const outline = getOutlineCard(normalized.year, { profile, history });
  normalized.phase = optionalCleanText(data.phase) || optionalCleanText(outline?.phase);
  normalized.mainTrack = outline?.mainTrack || (/relationship/i.test(String(data.mainTrack || "").trim()) ? "relationship" : "life");
  normalized.lifeTrack = optionalCleanText(data.lifeTrack);
  normalized.relationshipTrack = optionalCleanText(data.relationshipTrack);
  const modelCallbacks = Array.isArray(data.callbackSeeds || data.callbacks)
    ? (data.callbackSeeds || data.callbacks).map(item => optionalCleanText(item)).filter(Boolean).slice(0, 3)
    : [];
  normalized.callbackSeeds = modelCallbacks.length ? modelCallbacks : (Array.isArray(outline?.callbacks) ? outline.callbacks.slice(0, 3) : []);
  normalized.scene = normalizeSceneData(data.scene);
  if (!normalized.scene.title) normalized.scene.title = fallbackSceneTitle(normalized.year, outline);
  normalized.a = normalizeChoiceData(data.a, "A");
  normalized.b = normalizeChoiceData(data.b, "B");
  applyOutlineRiasec(normalized, profile, history);
  const yearNumber = normalized.year;
  normalized.summary = yearNumber === 1 ? "" : optionalCleanText(normalized.summary);
  if (!normalized.scene.body || !normalized.a.title || !normalized.b.title) {
    throw new Error("Invalid annual JSON: empty required field");
  }
  enforceSecondYearRelationEntry(normalized, profile);
  return normalized;
}

function secondYearRelationIntro(profile = {}) {
  return "暧昧对象";
}

function ensureTextIncludesRelationIntro(value, intro) {
  const text = optionalCleanText(value).replaceAll("伴侣", intro).replaceAll("关系线核心角色", intro);
  if (!intro) return text;
  if (text.includes(intro)) return text;
  if (text.includes("第一年有过相处的同学")) return text.replaceAll("第一年有过相处的同学", intro);
  return `${text}${text.endsWith("。") ? "" : "。"}${intro}也在现场。`;
}

function ensureTrackIncludesRelationIntro(value, intro) {
  const text = optionalCleanText(value);
  if (!intro) return text;
  if (text.includes(intro)) return text;
  if (text.includes("：")) {
    const [stage, rest] = text.split(/：(.+)/);
    return `${stage}：${intro}${rest || "在现场接住你的节奏"}`;
  }
  return `暧昧升温：${intro}在现场接住你的节奏`;
}

function enforceSecondYearRelationEntry(card, profile = {}) {
  if (Number(card?.year) !== 2) return card;
  const intro = secondYearRelationIntro(profile);
  if (!intro) return card;
  card.scene.body = ensureTextIncludesRelationIntro(card.scene.body, intro);
  card.relationshipTrack = ensureTrackIncludesRelationIntro(card.relationshipTrack, intro);
  return card;
}

function applyOutlineRiasec(card, profile = {}, history = []) {
  const outline = getOutlineCard(card.year, { profile, history });
  const axis = Array.isArray(outline?.riasecAxis) ? outline.riasecAxis : [];
  if (axis[0]) card.a.riasec = mockRiasec(axis[0], "");
  if (axis[1]) card.b.riasec = mockRiasec(axis[1], "");
}

function buildHistoryConsequence(history = []) {
  const last = Array.isArray(history) ? history.at(-1) : null;
  if (last?.consequence) return optionalCleanText(last.consequence);
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
  return merged;
}

function optionalCleanText(value) {
  return String(value || "")
    .replace(/关系线核心角色/g, "对象")
    .replace(/室友\/同伴/g, "室友")
    .replace(/导师\/老师|辅导员\/导师背景声/g, "专业课老师")
    .replace(/外部机会角色背景压力|外部机会角色/g, "合作方")
    .replace(/家庭型角色/g, "家里")
    .replace(/团队群像/g, "项目群")
    .trim();
}

function stripYearPrefix(value) {
  return String(value || "").replace(/^第\s*[\d一二三四五六七八九十]+\s*年(?!级)[\s·•・:：，,。.、\-—_|]*/, "").trim();
}

function normalizeSceneData(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return {
      title: stripYearPrefix(optionalCleanText(value.title)),
      body: cleanSceneBody(value.body)
    };
  }
  const raw = optionalCleanText(value);
  const eventMatch = raw.match(/(?:^|\n)\s*事件[:：]\s*([^\n]+)/);
  const contextMatch = raw.match(/(?:^|\n)\s*情境[:：]\s*([\s\S]+)/);
  if (eventMatch || contextMatch) {
    return {
      title: optionalCleanText(eventMatch?.[1] || "这一年的岔路口"),
      body: cleanSceneBody(contextMatch?.[1] || raw.replace(eventMatch?.[0] || "", ""))
    };
  }
  const sentenceMatch = raw.match(/^(.{8,28}?[。！？!?])([\s\S]*)$/);
  return {
    title: optionalCleanText(sentenceMatch?.[1]?.replace(/[。！？!?]$/g, "") || "这一年的岔路口"),
    body: cleanSceneBody(sentenceMatch?.[2] || raw)
  };
}

function fallbackSceneTitle(year, outline = null) {
  return optionalCleanText(outline?.phase || outline?.comedyDevice) || `第 ${year} 年事件`;
}

function cleanSceneBody(value) {
  return optionalCleanText(value);
}

function normalizeChoiceLabel(value, prefix) {
  const text = stripChoiceTypeNoise(value, prefix)
    .replace(/^(动手补救|查证判断|表达产出|沟通协作|争取拍板|流程保底)[，,、：:\s]*/g, "")
    .replace(/^[，,。.!！?？；;\s]+/, "")
    .trim();
  return balanceInlineQuote(text) || (prefix === "A" ? "当场接下这步" : "先稳住再判断");
}

function normalizeChoiceData(value, prefix) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const label = normalizeChoiceLabel(value.label || value.text || value.action || [value.title, value.desc || value.description].filter(Boolean).join("，"), prefix);
    const title = normalizeChoiceTitle(label, prefix);
    const desc = "";
    const tag = normalizeChoiceTag(value.tag || label || title, prefix);
    const consequence = normalizeChoiceConsequence(value.consequence || value.feedback || "");
    return { title, desc, tag, consequence, label, riasec: normalizeRiasecPayload(value.riasec) };
  }
  const raw = optionalCleanText(value).replace(new RegExp(`^${prefix}[.。]\\s*`), "");
  const label = normalizeChoiceLabel(raw, prefix);
  const title = normalizeChoiceTitle(label, prefix);
  const tag = normalizeChoiceTag(label, prefix);
  return { title, desc: "", tag, consequence: "", label, riasec: null };
}

function normalizeChoiceConsequence(value) {
  return balanceInlineQuote(value);
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

function stripChoiceTypeNoise(value, prefix = "") {
  return optionalCleanText(value)
    .replace(new RegExp(`^${prefix}[.。]\\s*`), "")
    .replace(/\s+/g, "")
    .replace(/^[RIASEC][：:·.\-—_、]?/i, "")
    .replace(/^(现实型?|研究型?|艺术型?|社会型?|企业型?|常规型?)[：:·.\-—_、]?/g, "")
    .replace(/^型[：:·.\-—_、]?/g, "")
    .replace(/[RIASEC]$/i, "")
    .replace(/型$/g, "")
    .trim();
}

function normalizeChoiceTitle(value, prefix) {
  const text = stripChoiceTypeNoise(value, prefix)
    .replace(/[，,。.!！?？；;].*$/g, "")
    .replace(/\s+/g, "");
  if (/demo/i.test(text)) return "做Demo";
  if (/邮件.*告别|写信.*告别|写封邮件/.test(text)) return "写信告别";
  if (/金句收|体面金句/.test(text)) return "金句收尾";
  if (/简历证|证明/.test(text)) return "重写证据";
  if (/谁动文|谁动/.test(text)) return "查清去向";
  if (text) return text;
  return prefix === "A" ? "直接推进" : "先稳住";
}

function balanceInlineQuote(value) {
  const text = optionalCleanText(value).replace(/[，,、：:]+$/g, "");
  const openCount = (text.match(/“/g) || []).length;
  const closeCount = (text.match(/”/g) || []).length;
  const cornerOpenCount = (text.match(/「/g) || []).length;
  const cornerCloseCount = (text.match(/」/g) || []).length;
  const singleOpenCount = (text.match(/‘/g) || []).length;
  const singleCloseCount = (text.match(/’/g) || []).length;
  const asciiSingleCount = (text.match(/'/g) || []).length;
  if (openCount > closeCount) return `${text}”`;
  if (cornerOpenCount > cornerCloseCount) return `${text}」`;
  if (singleOpenCount > singleCloseCount) return `${text}’`;
  if (asciiSingleCount % 2 === 1) return `${text}'`;
  return text;
}

function normalizeChoiceTag(value, prefix) {
  const raw = optionalCleanText(value).replace(/\s+/g, "");
  if (/现实型?/.test(raw)) return "动手";
  if (/研究型?/.test(raw)) return "查证";
  if (/艺术型?/.test(raw)) return "表达";
  if (/社会型?/.test(raw)) return "沟通";
  if (/企业型?/.test(raw)) return "争取";
  if (/常规型?/.test(raw)) return "稳住";
  const text = stripChoiceTypeNoise(value, prefix);
  if (/动手|实干|修|做|赶|补|交付/.test(text)) return "动手";
  if (/查|证据|研究|反思|拆解|分析|逻辑/.test(text)) return "查证";
  if (/表达|创作|金句|段子|公开|讲|实话|真话/.test(text)) return "表达";
  if (/沟通|安抚|接人|接住|关系|情绪|陪/.test(text)) return "沟通";
  if (/争取|抢|主动|拍板|谈判|冲/.test(text)) return "争取";
  if (/流程|稳|保底|体面|排现实|边界|守|务实/.test(text)) return "稳住";
  if (text && text !== "A" && text !== "B") return text;
  return prefix === "A" ? "主动处理" : "稳住节奏";
}

function validateBatch(data, expectedCount, startYear, history = [], profile = {}) {
  if (!Array.isArray(data?.cards) || data.cards.length !== expectedCount) {
    throw new Error("Invalid batch JSON: bad cards count");
  }
  const seen = Array.isArray(history) ? [...history] : [];
  return {
    cards: data.cards.map((card, index) => {
      const expectedYear = startYear + index;
      const normalized = validateAnnual(card, history, seen, expectedYear, profile);
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
    } else if (field === "innerYearning") {
      normalized[field] = normalizeInnerYearning(data?.[field]);
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
  return normalized;
}

function normalizeResultBlocks(value, count, normalizer) {
  const source = Array.isArray(value) ? value : [];
  return source.map((item, index) => normalizer(item, index)).filter(Boolean).slice(0, count);
}

function normalizeSceneCardBlock(item, index) {
  if (item && typeof item === "object" && !Array.isArray(item)) {
    const title = stripYearPrefix(optionalCleanText(item.title || item.headline || item.name));
    const body = optionalCleanText(item.body || item.desc || item.text);
    if (title || body) return { title: title || `第 ${index + 1} 个片段`, body: body || title };
  }
  const text = optionalCleanText(item);
  if (!text) return null;
  const title = text.split(/[，,。.!！?？]/).map(part => part.trim()).find(Boolean) || text;
  return { title, body: text };
}

function normalizeTimelineBlock(item, index) {
  const fallbackTitles = ["18-22 岁：大学四年", "22-30 岁：毕业第一站", "30-35 岁：沉浮与名场面"];
  if (item && typeof item === "object" && !Array.isArray(item)) {
    const title = optionalCleanText(item.title || item.headline || item.name);
    const body = optionalCleanText(item.body || item.desc || item.text);
    if (title || body) return { title: title || fallbackTitles[index], body: body || title };
  }
  const text = optionalCleanText(item);
  if (!text) return null;
  return { title: fallbackTitles[index] || `第 ${index + 1} 段`, body: text };
}

function normalizeResultCard(item, fallback) {
  if (item && typeof item === "object" && !Array.isArray(item)) {
    const title = optionalCleanText(item.title || item.headline || item.name);
    const body = optionalCleanText(item.body || item.desc || item.text);
    if (title || body) return { title: title || fallback.title, body: body || fallback.body };
  }
  const text = optionalCleanText(item);
  if (text) return { title: fallback.title, body: text };
  return fallback;
}

function normalizeInnerYearning(item) {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    throw new Error("Invalid result JSON: missing innerYearning");
  }
  return {
    keyword: optionalCleanText(item.keyword),
    core: optionalCleanText(item.core),
    evidence: optionalCleanText(item.evidence),
    sacrifice: optionalCleanText(item.sacrifice),
    temperament: optionalCleanText(item.temperament)
  };
}

function normalizeResultTitle(value) {
  return optionalCleanText(value) || "这一路终于有了答案";
}

function normalizeResultStatus(value) {
  const cleaned = optionalCleanText(value)
    .replace(/^你走了\d+年[，,]?/, "")
    .replace(/^从[^，。！？!?；;]{2,24}到[^，。！？!?；;]{2,24}[，,]?/, "")
    .replace(/18年/g, "这些年")
    .replace(/[。！？!?；;]+$/g, "");
  return cleaned;
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
  const label = optionalCleanText(item.label);
  if (!percent || !label) return null;
  return { percent, label };
}

function annualCardFromData(data) {
  const yearNumber = Number(data.question.match(/\d+/)?.[0] || data.year || 1);
  const sceneData = data.openingPreset && data.scene && typeof data.scene === "object"
    ? {
        title: optionalCleanText(data.scene.title) || "第一年开局",
        body: optionalCleanText(data.scene.body) || "这一年的故事正在生成。"
      }
    : normalizeSceneData(data.scene || { title: data.sceneTitle, body: data.sceneBody || data.prompt });
  const sceneText = `事件：${sceneData.title}\n情境：${sceneData.body}`;
  const leftChoice = data.openingPreset ? normalizeOpeningChoiceData(data.a || data.left, "A") : normalizeChoiceData(data.a || data.left, "A");
  const rightChoice = data.openingPreset ? normalizeOpeningChoiceData(data.b || data.right, "B") : normalizeChoiceData(data.b || data.right, "B");
  return {
    ...data,
    yearNumber,
    year: data.question,
    scene: sceneText,
    sceneTitle: sceneData.title,
    sceneBody: sceneData.body,
    prompt: sceneText,
    context: data.summary,
    leftHint: "A",
    rightHint: "B",
    left: { label: leftChoice.label, title: leftChoice.title, desc: leftChoice.desc, tag: leftChoice.tag, consequence: leftChoice.consequence || "", riasec: leftChoice.riasec || null, delta: { stability: 3, discipline: 2, explore: -1 } },
    right: { label: rightChoice.label, title: rightChoice.title, desc: rightChoice.desc, tag: rightChoice.tag, consequence: rightChoice.consequence || "", riasec: rightChoice.riasec || null, delta: { explore: 3, ambition: 2, stability: -1 } }
  };
}

function normalizeOpeningChoiceData(value, prefix) {
  const normalized = normalizeChoiceData(value, prefix);
  if (!value || typeof value !== "object" || Array.isArray(value)) return normalized;
  const title = optionalCleanText(value.title) || normalized.title;
  const desc = optionalCleanText(value.desc || value.description);
  return {
    ...normalized,
    title,
    desc,
    label: desc ? `${title}，${desc}` : title,
    tag: optionalCleanText(value.tag) || normalized.tag,
    consequence: optionalCleanText(value.consequence) || normalized.consequence
  };
}

function mockResponse(messages) {
  const content = messages.at(-1).content;
  if (content.includes("\"title\": \"\"") && content.includes("\"timelineBlocks\"")) {
    return {
      title: "硬扛成事，现实拉扯，项目统筹",
      status42: "靠几次救场站稳脚跟，也留下关系旧账。",
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
        { title: "30-35 岁：沉浮与名场面", body: "前面的选择开始一起回响，高光和社死都变得更有分量，你也终于学会把离谱日子过成自己的版本。" }
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
      innerYearning: {
        keyword: "自由",
        core: "你想要的是能自己决定节奏，而不是被标准路线推着走。",
        evidence: "18 道题里，你多次把确定感让给了新的窗口和更大的选择权。",
        sacrifice: "为了它，你放下过稳一点的收入，也放下过别人眼里的体面。",
        temperament: "你做这些选择时的样子，是清醒、热忱、不太装。"
      },
      shareHooks: ["这条线像我，但比我会复盘。", "原来专业只是新手村。", "测完想给志愿表道个歉。"]
    };
  }
  if (content.includes("\"batchCount\"")) {
    const parsed = parseJsonFromPrompt(content);
    const relationName = mockRelationName(parsed);
    const relationLabel = mockRelationLabel(parsed, relationName);
    const startYear = Number(parsed?.gameMeta?.startYear || 1);
    const count = Number(parsed?.gameMeta?.batchCount || 5);
    return {
      cards: Array.from({ length: count }, (_, index) => {
        const year = startYear + index;
        const outlineCard = Array.isArray(parsed?.outlineCards) ? parsed.outlineCards[index] : getOutlineCard(year);
        const axis = Array.isArray(outlineCard?.riasecAxis) ? outlineCard.riasecAxis : ["E", "C"];
        return {
          year,
          phase: outlineCard?.phase || "试播阶段",
          mainTrack: outlineCard?.mainTrack || (year % 3 === 0 ? "relationship" : "life"),
          summary: mockSummary(year, parsed?.history, `暧昧升温，${relationLabel}开始给你留座`),
          question: `第 ${year} 年 / ${totalGameYears}`,
          lifeTrack: "项目节奏更紧了，老师和同学开始把难活往你这里递",
          relationshipTrack: `暧昧升温：${relationLabel}开始固定留座`,
          callbacks: outlineCard?.callbacks?.slice(0, 3) || ["朋友群新梗"],
          scene: {
            title: mockSceneTitle(year, outlineCard),
            body: outlineCard?.conflict || "你在一次普通会议里被点名，项目负责人把一个看起来很香的机会推到你面前。机会写着成长，代价写着加班，旁边同事小声说这题像人生强制更新。"
          },
          a: { title: "先接下来", desc: "边做边摸清真实代价", tag: "机会试探", consequence: "你把活接住后，学长直接把你推上汇报位，后面一周的空闲也跟着清零了", riasec: mockRiasec(axis[0]) },
          b: { title: "当场拒绝", desc: "把时间留给确定方向", tag: "边界清晰", consequence: "你把时间从杂活里抢了回来，手头节奏终于稳住一点", riasec: mockRiasec(axis[1]) }
        };
      })
    };
  }
  const parsed = parseJsonFromPrompt(content);
  const relationName = mockRelationName(parsed);
  const year = Number(parsed?.gameMeta?.currentYear || 1);
  const outlineCard = parsed?.outlineCard || getOutlineCard(year);
  const axis = Array.isArray(outlineCard?.riasecAxis) ? outlineCard.riasecAxis : ["E", "C"];
  return mockAnnualCard(parsed, year, outlineCard, relationName, axis);
}

function mockRelationName(parsed) {
  return optionalCleanText(parsed?.storyCast?.relationIntro) || "对象";
}

function mockSceneTitle(year, outlineCard) {
  const seed = outlineCard?.callbacks?.[0] || outlineCard?.comedyDevice || outlineCard?.phase || "人生弹窗";
  return `第${year}年·${String(seed)}`;
}

function mockAnnualCard(parsed, year, outlineCard, relationName, axis) {
  const [leftText, rightText] = String(outlineCard?.choiceContrast || "争取机会 / 稳住底盘").split(/\s*\/\s*/);
  const relationLabel = mockRelationLabel(parsed, relationName);
  const relationTrack = mockRelationshipTrack(parsed, year, relationLabel);
  const incident = mockIncidentText(parsed, outlineCard);
  const isRelief = outlineCard?.pressureMode === "relief";
  const isRelationshipCard = outlineCard?.mainTrack === "relationship";
  return {
    year,
    phase: outlineCard?.phase || "年度推进",
    mainTrack: outlineCard?.mainTrack || (year % 3 === 0 ? "relationship" : "life"),
    summary: mockSummary(year, parsed?.history, relationTrack.replace("：", "，")),
    question: `第 ${year} 年 / ${totalGameYears}`,
    lifeTrack: mockLifeTrack(parsed, year, incident),
    relationshipTrack: relationTrack,
    callbacks: outlineCard?.callbacks?.slice(0, 3) || [incident],
    scene: {
      title: mockSceneTitle(year, outlineCard),
      body: mockSceneBody(parsed, outlineCard, relationLabel, incident)
    },
    a: mockChoice(
      leftText,
      isRelief ? `先承接${incident}，把成果往前推` : `先处理${incident}，把局面往前推`,
      leftText,
      isRelief ? "你顺势把这次成果接住，身边人也更愿意把下一步交给你" : `你把${incident}推进一步，代价也马上追上来`,
      axis[0]
    ),
    b: mockChoice(
      rightText,
      isRelief ? "先稳住节奏，把收获消化清楚" : "先稳住节奏，再决定下一步",
      rightText,
      isRelationshipCard
        ? (isRelief ? `你把节奏稳住后，${relationLabel}第一次觉得这段路能一起走久一点` : `你守住眼前节奏，${relationLabel}把期待往回收`)
        : (isRelief ? "你把节奏稳住后，这次收获终于没有立刻变成新压力" : "你守住眼前节奏，手头局面没有继续扩散"),
      axis[1]
    )
  };
}

function mockRelationLabel(parsed, relationName) {
  return relationName || "对象";
}

function mockIncidentText(parsed, outlineCard) {
  return optionalCleanText(parsed?.stateHints?.currentIncident).replace(/^本年(?:事故|专业事件)：/, "")
    || outlineCard?.callbacks?.[0]
    || outlineCard?.phase
    || "年度大事";
}

function mockLifeTrack(parsed, year, incident) {
  const timeFrame = optionalCleanText(parsed?.stateHints?.timeFrame) || "阶段推进";
  return `${timeFrame}，${incident}落到台面`;
}

function mockRelationshipTrack(parsed, year, relationName) {
  const stage = optionalCleanText(parsed?.stateHints?.relationshipStage) || (year <= 2 ? "暧昧升温" : "订婚结婚");
  const fact = optionalCleanText(parsed?.stateHints?.relationshipBeat).replace(/^关系(?:事实|背景)：/, "");
  return `${stage}：${relationName}${fact || "主动问你下一步"}`;
}

function mockSceneBody(parsed, outlineCard, relationName, incident) {
  const conflict = (outlineCard?.conflict || `${incident}突然摆到你面前，你必须立刻做选择。`)
    .replaceAll("第一年有过相处的同学", relationName)
    .replaceAll("关系线核心角色", relationName)
    .replaceAll("伴侣", relationName);
  const relationTail = outlineCard?.mainTrack === "relationship" ? `${relationName}在旁边等你给一句准话。` : "";
  return `${conflict}${relationTail}`;
}

function mockChoice(source, desc, tag, consequence, mainType) {
  const title = String(source || "先处理").replace(/[，。！？!?；;：:].*$/g, "") || "先处理";
  return {
    title,
    desc,
    tag: tag || title,
    consequence,
    riasec: mockRiasec(mainType)
  };
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

async function handleApi(request, env, pathname) {
  if (pathname === "/api/health") {
    const modelOptions = publicModelOptions(env);
    const hasDeepSeekKey = buildModelConfigs(env).some(config => config.provider === "deepseek" && isUsableApiKey(config.apiKey));
    const hasMiniMaxKey = buildModelConfigs(env).some(config => config.provider === "minimax" && isUsableApiKey(config.apiKey));
    const model = currentModel(env);
    return sendJson(200, {
      ok: true,
      service: "gaokao-life-simulator",
      runtime: "cloudflare-worker",
      hasModelKey: modelIsConfigured(resolveModelConfig(env, model), env),
      hasDeepSeekKey,
      hasMiniMaxKey,
      model,
      maintenance: isMaintenanceMode(env),
      maintenanceMessage: isMaintenanceMode(env) ? maintenanceMessage(env) : "",
      availableModels: modelOptions.map(option => option.id),
      modelOptions,
      time: new Date().toISOString()
    });
  }

  if (pathname === "/api/analytics") {
    try {
      const body = await readJson(request);
      logAnalyticsEvent(body, { ua: request.headers.get("user-agent") || "" });
    } catch (error) {
      console.warn(JSON.stringify({
        evt: "analytics_parse_failed",
        level: "warn",
        error: truncateLogText(error?.message || error, 120)
      }));
    }
    return sendJson(200, { ok: true });
  }

  let body = {};
  let profile = normalizeProfile();
  let history = [];
  let model = currentModel(env);
  let logContext = buildApiLogContext({ pathname, body, profile, history, model });
  const apiStartedAt = Date.now();
  const logApiSuccess = (status = 200, extra = {}) => {
    logApiEvent("info", "api_success", logContext, null, {
      status,
      ms: Date.now() - apiStartedAt,
      ...extra
    });
  };
  const promptLabDebug = isPromptLabDebugRequest(request);
  try {
    body = await readJson(request);
    profile = normalizeProfile(body.profile);
    history = Array.isArray(body.history) ? body.history : [];
    model = resolveModelConfig(env, body.model).id;
    logContext = buildApiLogContext({ pathname, body, profile, history, model });
  } catch {}

  try {
    if (pathname.startsWith("/api/game/") && isMaintenanceMode(env)) {
      const message = maintenanceMessage(env);
      const error = new Error(message);
      error.status = 503;
      logApiEvent("warn", "api_maintenance", logContext, error, { status: 503 });
      return sendJson(503, { ok: false, maintenance: true, retryable: true, error: message });
    }

    if (pathname === "/api/game/start/stream" || pathname === "/api/game/next/stream") {
      return annualStreamResponse({ pathname, profile, history, body, env, model, debug: promptLabDebug, clientSignal: request.signal, logContext });
    }

    if (pathname === "/api/game/result/stream") {
      return resultStreamResponse({ profile, history, env, model, debug: promptLabDebug, clientSignal: request.signal, logContext });
    }

    if (pathname === "/api/game/start") {
      const data = buildOpeningCard(profile, totalGameYears);
      logApiSuccess(200, { preset: true });
      return sendJson(200, { ok: true, model, preset: true, card: annualCardFromData(data) });
    }
    if (pathname === "/api/game/next") {
      const requestedYear = Number(body.year || history.length + 1);
      if (requestedYear > totalGameYears || history.length >= totalGameYears) {
        logApiEvent("warn", "api_rejected", logContext, null, { status: 409, ms: Date.now() - apiStartedAt, reason: "game_finished" });
        return sendJson(409, { ok: false, error: "游戏已结束" });
      }
      const year = Math.min(Math.max(requestedYear, 2), totalGameYears);
      const data = await callModel(buildAnnualMessages({ profile, history, year }), value => validateAnnual(value, history, history, year, profile), env, model, null, promptLabDebug, null, request.signal, logContext);
      logApiSuccess(200, { degraded: !!data.degraded });
      return sendJson(200, { ok: true, model, card: annualCardFromData(data), ...debugField(data) });
    }
    if (pathname === "/api/game/batch") {
      const startYear = Math.min(Math.max(Number(body.startYear || history.length + 1), 1), totalGameYears);
      const count = Math.min(Math.max(Number(body.count || 5), 1), totalGameYears - startYear + 1, 5);
      const data = await callModel(
        buildBatchMessages({ profile, history, startYear, count }),
        value => validateBatch(value, count, startYear, history, profile),
        env,
        model,
        null,
        promptLabDebug,
        null,
        request.signal,
        logContext
      );
      logApiSuccess(200, { count, degraded: !!data.degraded });
      return sendJson(200, { ok: true, model, cards: data.cards.map(annualCardFromData), ...debugField(data) });
    }
    if (pathname === "/api/game/result") {
      const result = await callModel(buildResultMessages({ profile, history }), validateResult, env, model, null, promptLabDebug, null, request.signal, logContext);
      logApiSuccess(200, { degraded: !!result.degraded });
      return sendJson(200, { ok: true, model, result, ...debugField(result) });
    }
    return sendJson(404, { ok: false, error: "API route not found" });
  } catch (error) {
    if (error?.status === 499) {
      return sendJson(499, { ok: false, error: error.message || "请求已取消" });
    }
    // 兜底降级：任何异常都返回 200 + 本地模拟内容，避免把上游 5xx 透传给前端
    logApiEvent("error", "api_degraded_fallback", logContext, error, { status: error?.status || 500 });
    try {
      if (pathname === "/api/game/start") {
        const data = buildOpeningCard(profile, totalGameYears);
        logApiEvent("warn", "api_degraded_success", logContext, null, { status: 200, ms: Date.now() - apiStartedAt, preset: true });
        return sendJson(200, { ok: true, model, preset: true, card: annualCardFromData(data) });
      }
      if (pathname === "/api/game/next") {
        const requestedYear = Number(body.year || history.length + 1);
        if (requestedYear > totalGameYears || history.length >= totalGameYears) {
          return sendJson(409, { ok: false, error: "游戏已结束" });
        }
        const year = Math.min(Math.max(requestedYear, 2), totalGameYears);
        const data = validateAnnual(mockResponse(buildAnnualMessages({ profile, history, year })), history, history, year, profile);
        logApiEvent("warn", "api_degraded_success", logContext, null, { status: 200, ms: Date.now() - apiStartedAt, degraded: true });
        return sendJson(200, { ok: true, model, degraded: true, card: annualCardFromData(data) });
      }
      if (pathname === "/api/game/batch") {
        const startYear = Math.min(Math.max(Number(body.startYear || history.length + 1), 1), totalGameYears);
        const count = Math.min(Math.max(Number(body.count || 5), 1), totalGameYears - startYear + 1, 5);
        const data = validateBatch(mockResponse(buildBatchMessages({ profile, history, startYear, count })), count, startYear, history, profile);
        logApiEvent("warn", "api_degraded_success", logContext, null, { status: 200, ms: Date.now() - apiStartedAt, degraded: true, count });
        return sendJson(200, { ok: true, model, degraded: true, cards: data.cards.map(annualCardFromData) });
      }
      if (pathname === "/api/game/result") {
        const result = validateResult(mockResponse(buildResultMessages({ profile, history })));
        logApiEvent("warn", "api_degraded_success", logContext, null, { status: 200, ms: Date.now() - apiStartedAt, degraded: true });
        return sendJson(200, { ok: true, model, degraded: true, result: { ...result, degraded: true } });
      }
    } catch (fallbackError) {
      logApiEvent("error", "api_fallback_failed", logContext, fallbackError, {
        status: fallbackError?.status || 500,
        originalError: errorLogSummary(error)
      });
    }
    logApiEvent("error", "api_failed", logContext, error, { status: error?.status || 500 });
    return sendJson(error.status || 500, { ok: false, error: error.message || "Request failed" });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      if (url.pathname !== "/api/health" && request.method !== "POST") {
        return sendJson(405, { ok: false, error: "Method not allowed" });
      }
      const startedAt = Date.now();
      try {
        const response = await handleApi(request, env, url.pathname);
        console.log(JSON.stringify({
          evt: "api",
          level: "info",
          path: url.pathname,
          status: response.status,
          ms: Date.now() - startedAt,
          ua: (request.headers.get("user-agent") || "").slice(0, 60)
        }));
        return response;
      } catch (error) {
        // handleApi 内部已有兜底，这里是最后防线
        console.error(JSON.stringify({
          evt: "api_crash",
          level: "error",
          path: url.pathname,
          ms: Date.now() - startedAt,
          error: String(error?.message || error)
        }));
        return sendJson(500, { ok: false, error: "Internal error" });
      }
    }
    return env.ASSETS.fetch(request);
  }
};
