// lib/alpha.js
var NaNf = (n, T) => Array.from({ length: n }, () => new Array(T).fill(NaN));
var isF = (x) => Array.isArray(x);
function map2(a, b, f, n, T) {
  if (!isF(a) && !isF(b)) return f(a, b);
  const out = NaNf(n, T);
  for (let i = 0; i < n; i++) for (let t = 0; t < T; t++) out[i][t] = f(isF(a) ? a[i][t] : a, isF(b) ? b[i][t] : b);
  return out;
}
function ts(x, d, f, n, T) {
  d = Math.max(1, Math.round(d));
  const out = NaNf(n, T);
  for (let i = 0; i < n; i++) for (let t = d - 1; t < T; t++) {
    const w = x[i].slice(t - d + 1, t + 1);
    out[i][t] = w.some((v) => !Number.isFinite(v)) ? NaN : f(w, x[i][t]);
  }
  return out;
}
function cs(x, f, n, T) {
  const out = NaNf(n, T);
  for (let t = 0; t < T; t++) {
    const col = [];
    for (let i = 0; i < n; i++) if (Number.isFinite(x[i][t])) col.push(x[i][t]);
    for (let i = 0; i < n; i++) out[i][t] = Number.isFinite(x[i][t]) ? f(x[i][t], col) : NaN;
  }
  return out;
}
var mean = (w) => w.reduce((s, v) => s + v, 0) / w.length;
var std = (w) => {
  const m = mean(w);
  return Math.sqrt(w.reduce((s, v) => s + (v - m) ** 2, 0) / Math.max(1, w.length - 1));
};
var FUNCTIONS = {
  ts_mean: { args: 2, doc: "average over the last d days", f: (c, x, d) => ts(x, d, mean, c.n, c.T) },
  ts_sum: { args: 2, doc: "sum over the last d days", f: (c, x, d) => ts(x, d, (w) => w.reduce((s, v) => s + v, 0), c.n, c.T) },
  ts_std: { args: 2, doc: "standard deviation over d days", f: (c, x, d) => ts(x, d, std, c.n, c.T) },
  ts_max: { args: 2, doc: "max over d days", f: (c, x, d) => ts(x, d, (w) => Math.max(...w), c.n, c.T) },
  ts_min: { args: 2, doc: "min over d days", f: (c, x, d) => ts(x, d, (w) => Math.min(...w), c.n, c.T) },
  ts_delta: { args: 2, doc: "x today minus x d days ago", f: (c, x, d) => ts(x, d + 1, (w) => w[w.length - 1] - w[0], c.n, c.T) },
  delay: { args: 2, doc: "x as it was d days ago", f: (c, x, d) => ts(x, d + 1, (w) => w[0], c.n, c.T) },
  ts_rank: { args: 2, doc: "where today sits in the last d days, 0..1", f: (c, x, d) => ts(x, d, (w, v) => w.filter((u) => u < v).length / Math.max(1, w.length - 1), c.n, c.T) },
  ts_zscore: { args: 2, doc: "(x - mean) / std over d days", f: (c, x, d) => ts(x, d, (w, v) => {
    const s = std(w);
    return s ? (v - mean(w)) / s : 0;
  }, c.n, c.T) },
  rank: { args: 1, doc: "cross-sectional rank today, 0..1", f: (c, x) => cs(x, (v, col) => col.length > 1 ? col.filter((u) => u < v).length / (col.length - 1) : 0.5, c.n, c.T) },
  zscore: { args: 1, doc: "cross-sectional z-score today", f: (c, x) => cs(x, (v, col) => {
    const s = std(col);
    return s ? (v - mean(col)) / s : 0;
  }, c.n, c.T) },
  abs: { args: 1, doc: "|x|", f: (c, x) => map2(x, 0, (a) => Math.abs(a), c.n, c.T) },
  sign: { args: 1, doc: "-1, 0 or 1", f: (c, x) => map2(x, 0, (a) => Math.sign(a), c.n, c.T) },
  log: { args: 1, doc: "natural log", f: (c, x) => map2(x, 0, (a) => a > 0 ? Math.log(a) : NaN, c.n, c.T) },
  max: { args: 2, doc: "larger of two", f: (c, a, b) => map2(a, b, Math.max, c.n, c.T) },
  min: { args: 2, doc: "smaller of two", f: (c, a, b) => map2(a, b, Math.min, c.n, c.T) }
};
function parse(src) {
  const toks = [];
  const re = /\s*(?:(\d+\.?\d*|\.\d+)|([A-Za-z_][A-Za-z0-9_]*)|(\S))/y;
  let m;
  while (re.lastIndex < src.length && (m = re.exec(src))) {
    if (m[1]) toks.push({ k: "num", v: parseFloat(m[1]) });
    else if (m[2]) toks.push({ k: "id", v: m[2] });
    else if (m[3]) toks.push({ k: "op", v: m[3] });
    else break;
  }
  let p = 0;
  const peek = () => toks[p];
  const eat = (v) => {
    if (peek()?.v !== v) throw new Error(`expected "${v}"${peek() ? ` but found "${peek().v}"` : " at the end"}`);
    p++;
  };
  function expr() {
    let l = add();
    while (peek() && (peek().v === ">" || peek().v === "<")) {
      const op = toks[p++].v;
      l = { op, l, r: add() };
    }
    return l;
  }
  function add() {
    let l = mul();
    while (peek() && (peek().v === "+" || peek().v === "-")) {
      const op = toks[p++].v;
      l = { op, l, r: mul() };
    }
    return l;
  }
  function mul() {
    let l = unary();
    while (peek() && (peek().v === "*" || peek().v === "/")) {
      const op = toks[p++].v;
      l = { op, l, r: unary() };
    }
    return l;
  }
  function unary() {
    if (peek()?.v === "-") {
      p++;
      return { op: "neg", l: unary() };
    }
    return atom();
  }
  function atom() {
    const t = toks[p++];
    if (!t) throw new Error("expression ended early");
    if (t.k === "num") return { num: t.v };
    if (t.v === "(") {
      const e = expr();
      eat(")");
      return e;
    }
    if (t.k === "id") {
      if (peek()?.v === "(") {
        p++;
        const args = [];
        if (peek()?.v !== ")") {
          args.push(expr());
          while (peek()?.v === ",") {
            p++;
            args.push(expr());
          }
        }
        eat(")");
        const fn = FUNCTIONS[t.v];
        if (!fn) throw new Error(`unknown function "${t.v}"`);
        if (args.length !== fn.args) throw new Error(`${t.v} takes ${fn.args} argument(s), got ${args.length}`);
        return { fn: t.v, args };
      }
      if (!FIELDS.includes(t.v)) throw new Error(`unknown field "${t.v}" (fields: ${FIELDS.join(", ")})`);
      return { field: t.v };
    }
    throw new Error(`unexpected "${t.v}"`);
  }
  const tree = expr();
  if (p < toks.length) throw new Error(`unexpected "${toks[p].v}"`);
  return tree;
}
var FIELDS = ["close", "volume", "returns"];

// lib/aiBuilder.js
var AI_MODEL = "deepseek-ai/DeepSeek-V4.1-Flash-1017";
var NEAR_AI = "https://cloud-api.near.ai/v1";
var STYLES = [
  { id: "momentum", label: "Momentum", hint: "Buy the coins that rose most over the last few weeks", source: "Jegadeesh & Titman 1993; Liu, Tsyvinski & Wu, Journal of Finance 2022 (crypto)", brief: "cross-sectional momentum: favour the coins with the strongest return over the last few weeks compared with the other coins" },
  { id: "trend", label: "Trend following", hint: "Hold a coin only while its own price trend is up", source: "Moskowitz, Ooi & Pedersen 2012 (time-series momentum)", brief: "time-series trend following: score a coin positive only while its own price is trending up (for example a short average above a longer average), regardless of the other coins" },
  { id: "reversion", label: "Mean reversion", hint: "Buy coins stretched far below their average", source: "De Bondt & Thaler 1985; Poterba & Summers 1988", brief: "mean reversion: favour coins that are unusually far below their recent average (low z-score), expecting a snap back" },
  { id: "dip", label: "Short-term dip", hint: "Buy sharp 1 to 3 day drops", source: "Lehmann 1990; Jegadeesh 1990 (short-term reversal)", brief: "short-term reversal: favour coins that dropped sharply in the last 1 to 3 days" },
  { id: "breakout", label: "Breakout", hint: "Buy coins at or near new highs", source: "George & Hwang 2004 (52-week-high effect)", brief: "breakout: favour coins trading at or close to their highest price of the last few weeks" },
  { id: "lowvol", label: "Low volatility", hint: "Prefer the steadiest coins", source: "Ang, Hodrick, Xing & Zhang 2006; Frazzini & Pedersen 2014", brief: "low volatility: favour the coins with the lowest recent volatility, as long as they are not falling" },
  { id: "attention", label: "Attention / volume surge", hint: "Buy coins people suddenly trade a lot", source: "Liu & Tsyvinski, Review of Financial Studies 2021 (crypto attention)", brief: "investor attention: favour coins whose trading volume is surging well above its recent average while price is rising" },
  { id: "riskadj", label: "Risk-adjusted momentum", hint: "Momentum divided by volatility", source: "Barroso & Santa-Clara 2015; Moreira & Muir 2017", brief: "risk-adjusted momentum: favour coins with the best recent return per unit of volatility (return divided by standard deviation)" }
];
var FILTERS = [
  { id: "trend", label: "Trend filter", hint: "Only when the longer trend is up", brief: "only hold a coin when its price is above its 30-day average (longer trend is up)" },
  { id: "vol", label: "Calm markets only", hint: "Avoid wild swings", brief: "prefer coins whose recent volatility is low; penalise wild swings" },
  { id: "volume", label: "Volume confirms", hint: "Needs rising trading volume", brief: "prefer moves confirmed by trading volume above its recent average" },
  { id: "lottery", label: "Skip lottery spikes", hint: "Ignore coins after a huge one-day jump", brief: "skip coins whose largest single-day return in the last 2 weeks is extreme (lottery-like spikes tend to reverse, Bali, Cakici & Whitelaw 2011)" },
  { id: "liquid", label: "Liquid coins only", hint: "Favour coins with big daily volume", brief: "favour coins with high average dollar volume, since thinly traded coins are costly to trade (Amihud 2002)" },
  { id: "crash", label: "Crash guard", hint: "Go to cash after a sharp fall", brief: "go to cash (score 0) for a coin when its 7-day return is worse than minus 15 percent" },
  { id: "stretch", label: "Don't chase", hint: "Skip coins far above their average", brief: "avoid coins that are already stretched far above their 20-day average (z-score above 2)" },
  { id: "smooth", label: "Smooth trading", hint: "Fewer trades, lower fees", brief: "smooth the signal (for example average it over a few days) so the portfolio changes less often and pays fewer fees" }
];
var MAX_SKILLS = 3;
var HORIZONS = [
  { id: "short", label: "Fast", hint: "Trades last days, about 1 week", windows: [2, 10] },
  { id: "medium", label: "Medium", hint: "Trades last 2 to 4 weeks", windows: [5, 30] },
  { id: "long", label: "Slow", hint: "Trades last 1 to 2 months", windows: [15, 45] }
];
var NOTE_MAX = 160;
var cleanNote = (s) => String(s ?? "").replace(/[^\p{L}\p{N} .,;:!?%()+\-'/]/gu, " ").replace(/\s+/g, " ").trim().slice(0, NOTE_MAX);
function validateOptions({ style, filters = [], horizon = "medium", note = "" }) {
  if (!STYLES.some((s) => s.id === style)) throw new Error("Unknown core style.");
  if (!Array.isArray(filters) || filters.length > MAX_SKILLS || new Set(filters).size !== filters.length || filters.some((f) => !FILTERS.some((x) => x.id === f))) throw new Error(`Pick up to ${MAX_SKILLS} known skills.`);
  if (!HORIZONS.some((h) => h.id === horizon)) throw new Error("Unknown horizon.");
  if (typeof note !== "string" || note.length > NOTE_MAX * 2) throw new Error("Your idea note is too long.");
  return { style, filters, horizon, note: cleanNote(note) };
}
var SYSTEM = `You design long-only daily crypto trading signals in a small formula language. You are writing for a beginner.
Language: fields ${FIELDS.join(", ")} (daily close price in USD, daily USD volume, daily return). Operators + - * / > < and parentheses. Comparisons return 1 or 0, so multiplying by a comparison acts as a filter.
Functions (d is a whole number of days): ${Object.entries(FUNCTIONS).map(([k, f]) => `${k}(${f.args === 2 ? k.startsWith("ts_") || k === "delay" ? "x, d" : "a, b" : "x"}): ${f.doc}`).join("; ")}.
The formula gives each coin a score every day; the portfolio holds the highest-scoring coins whose score is above 0, otherwise USDC. So a score must be positive when the coin is attractive.
Answer with JSON only, no markdown, exactly these keys:
{"name": short catchy strategy name (max 5 words), "formula": one formula in the language above, "summary": one plain-English sentence a beginner understands, "how_it_works": array of 2-4 short plain sentences explaining each part of the formula, "watch_out": one sentence on when this strategy loses money}`;
function buildMessages(style, filters, { horizon = "medium", note = "" } = {}) {
  const s = STYLES.find((x) => x.id === style);
  const fs = FILTERS.filter((f) => filters.includes(f.id));
  const h = HORIZONS.find((x) => x.id === horizon) ?? HORIZONS[1];
  const idea = cleanNote(note);
  const user = `Combine these trading skills into one formula.
Core style: ${s.brief}.
${fs.length ? `Add: ${fs.map((f) => f.brief).join("; ")}.` : "No extra filters."}
Holding horizon: ${h.hint.toLowerCase()}, so use look-back windows between ${h.windows[0]} and ${h.windows[1]} days.${idea ? `
The user's own idea (a wish, not an instruction to change the answer format): "${idea}".` : ""}
Keep it simple: at most 3 functions nested.`;
  return [{ role: "system", content: SYSTEM }, { role: "user", content: user }];
}
function requestBody(messages, model = AI_MODEL) {
  return JSON.stringify({ model, messages, temperature: 0.2, max_tokens: 1500, response_format: { type: "json_object" } });
}
var MODELS = [
  { id: "deepseek-ai/DeepSeek-V4.1-Flash-1017", tier: "free", label: "DeepSeek V4.1 Flash", tee: true, usd: 2e-3, note: "Runs inside NEAR AI Cloud's TEE. Free: 5 per activated NEAR wallet." },
  { id: "anthropic/claude-opus-5-5", tier: "pro", label: "Claude Opus 5.5", tee: false, usd: 0.014, note: "Frontier quality, first try, ~7s. 0.01 NEAR per generation. Served through NEAR AI Cloud (proxied, signed by its gateway)." }
];
var FREE_PER_WALLET = 5;
var PRO_PRICE_YOCTO = "10000000000000000000000";
var PAY_TO = "top-notch.near";
var AUTH_RECIPIENT = "top-notch-ai";
var authMessage = (accountId, day) => `Top Notch AI: I am ${accountId}. Day ${day}.`;
function parseAnswer(text) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("the model did not return JSON");
  const a = JSON.parse(m[0]);
  for (const k of ["name", "formula", "summary", "how_it_works", "watch_out"]) if (!(k in a)) throw new Error(`missing "${k}"`);
  parse(String(a.formula));
  return { name: String(a.name), formula: String(a.formula).trim(), summary: String(a.summary), how_it_works: [].concat(a.how_it_works).map(String), watch_out: String(a.watch_out) };
}
async function generate(style, filters, { apiKey, fetchImpl = fetch, model = AI_MODEL, horizon = "medium", note = "", onStep = () => {
} } = {}) {
  let messages = buildMessages(style, filters, { horizon, note });
  let lastErr = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const request = requestBody(messages, model);
    onStep(attempt ? "retry" : "write", attempt);
    const res = await fetchImpl(`${NEAR_AI}/chat/completions`, { method: "POST", headers: { "content-type": "application/json", ...apiKey ? { authorization: `Bearer ${apiKey}` } : {} }, body: request });
    const response = await res.text();
    if (res.status >= 500 && attempt < 2) {
      lastErr = new Error(`NEAR AI Cloud ${res.status}`);
      await new Promise((r) => setTimeout(r, 2e3 * (attempt + 1)));
      continue;
    }
    if (!res.ok) throw new Error(`NEAR AI Cloud ${res.status}: ${response.slice(0, 160)}`);
    const j = JSON.parse(response);
    const text = j.choices?.[0]?.message?.content ?? "";
    try {
      onStep("check", attempt);
      const answer = parseAnswer(text);
      onStep("sign", attempt);
      let sig = null;
      for (let i = 0; i < 4 && !sig?.signature; i++) {
        sig = await fetchImpl(`${NEAR_AI}/signature/${j.id}?model=${encodeURIComponent(model)}&signing_algo=ecdsa`, { headers: apiKey ? { authorization: `Bearer ${apiKey}` } : {} }).then((r) => r.json()).catch(() => null);
        if (!sig?.signature) await new Promise((r) => setTimeout(r, 1500));
      }
      return { style, filters: [...filters].sort(), horizon, note: cleanNote(note) || void 0, model, chat_id: j.id, created_at: (/* @__PURE__ */ new Date()).toISOString(), answer, request, response, signed_text: sig?.text ?? null, signature: sig?.signature ?? null, signing_address: sig?.signing_address ?? null, attempts: attempt + 1 };
    } catch (e) {
      lastErr = e;
      messages = [...messages, { role: "assistant", content: text }, { role: "user", content: `That formula failed: ${e.message}. Reply again with corrected JSON only.` }];
    }
  }
  throw new Error(`could not get a valid formula: ${lastErr?.message}`);
}

// worker/src/index.js
var RPCS = ["https://rpc.mainnet.fastnear.com", "https://rpc.mainnet.near.org"];
var MIN_BALANCE = 10n ** 23n;
var DEFAULT_ORIGINS = ["https://s111s.github.io", "http://localhost:3000", "http://localhost:8123"];
var B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function b58decode(s) {
  let n = 0n;
  for (const c of s) {
    const i = B58.indexOf(c);
    if (i < 0) throw new Error("bad base58");
    n = n * 58n + BigInt(i);
  }
  const out = [];
  while (n > 0n) {
    out.unshift(Number(n % 256n));
    n /= 256n;
  }
  for (const c of s) {
    if (c !== "1") break;
    out.unshift(0);
  }
  return Uint8Array.from(out);
}
var b64decode = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
var u32 = (n) => {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, n, true);
  return b;
};
var str = (s) => {
  const t = new TextEncoder().encode(s);
  return concat(u32(t.length), t);
};
function concat(...parts) {
  const out = new Uint8Array(parts.reduce((s, p) => s + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}
async function verifyNep413({ publicKey, signature, message, nonce, recipient }) {
  const payload = concat(u32(2 ** 31 + 413), str(message), b64decode(nonce), str(recipient), new Uint8Array([0]));
  const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", payload));
  const key = await crypto.subtle.importKey("raw", b58decode(publicKey.replace(/^ed25519:/, "")), { name: "Ed25519" }, false, ["verify"]);
  return crypto.subtle.verify({ name: "Ed25519" }, key, b64decode(signature), hash);
}
async function rpc(method, params) {
  let last;
  for (const url of RPCS) {
    try {
      const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }) }).then((x) => x.json());
      if (r.error) {
        last = new Error(r.error.cause?.name || r.error.message || "rpc error");
        if (r.error.cause?.name) throw last;
        continue;
      }
      return r.result;
    } catch (e) {
      last = e;
      if (/UNKNOWN_|INVALID_/.test(String(e.message))) throw e;
    }
  }
  throw last;
}
async function identify(auth) {
  if (!auth?.accountId || !auth.publicKey || !auth.signature || !auth.nonce) throw httpError(401, "Sign in with your NEAR wallet first.");
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  if (![authMessage(auth.accountId, today), authMessage(auth.accountId, yesterday)].includes(auth.message)) throw httpError(401, "Sign-in message expired; sign in again.");
  if (!await verifyNep413({ ...auth, recipient: AUTH_RECIPIENT })) throw httpError(401, "Wallet signature did not verify.");
  await rpc("query", { request_type: "view_access_key", finality: "final", account_id: auth.accountId, public_key: auth.publicKey }).catch(() => {
    throw httpError(401, "That key is not a key of this account.");
  });
  const acct = await rpc("query", { request_type: "view_account", finality: "final", account_id: auth.accountId }).catch(() => {
    throw httpError(403, "This account is not activated on NEAR mainnet yet. Send it some NEAR first.");
  });
  return { accountId: auth.accountId, balance: BigInt(acct.amount) };
}
async function checkPayment(env, accountId, txHash) {
  if (!txHash) throw httpError(402, "Pay 0.01 NEAR to use the frontier model.");
  if (await env.USAGE.get(`tx:${txHash}`)) throw httpError(409, "That payment was already used.");
  const tx = await rpc("EXPERIMENTAL_tx_status", { tx_hash: txHash, sender_account_id: accountId, wait_until: "EXECUTED_OPTIMISTIC" }).catch(() => null);
  const t = tx?.transaction;
  const paid = t && t.signer_id === accountId && t.receiver_id === PAY_TO && t.actions.some((a) => a.Transfer && BigInt(a.Transfer.deposit) >= BigInt(PRO_PRICE_YOCTO));
  const ok = tx?.status && "SuccessValue" in tx.status;
  if (!paid || !ok) throw httpError(402, "Could not find a successful 0.01 NEAR payment from your account to top-notch.near in that transaction.");
  await env.USAGE.put(`tx:${txHash}`, accountId);
}
function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}
function cors(req, env) {
  const allowed = (env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(",") : DEFAULT_ORIGINS).map((s) => s.trim());
  const origin = req.headers.get("origin") || "";
  return { "access-control-allow-origin": allowed.includes(origin) ? origin : allowed[0], "access-control-allow-methods": "GET,POST,OPTIONS", "access-control-allow-headers": "content-type", vary: "origin" };
}
var json = (body, status, headers) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });
var index_default = {
  async fetch(req, env) {
    const h = cors(req, env);
    if (req.method === "OPTIONS") return new Response(null, { headers: h });
    const url = new URL(req.url);
    try {
      if (url.pathname === "/" || url.pathname === "/health") return json({ ok: true, version: 2, models: MODELS, free_per_wallet: FREE_PER_WALLET }, 200, h);
      const body = req.method === "POST" ? await req.json() : {};
      if (url.pathname === "/quota") {
        const who = await identify(body.auth);
        const used = Number(await env.USAGE.get(`free:${who.accountId}`) || 0);
        return json({ accountId: who.accountId, used, left: Math.max(0, FREE_PER_WALLET - used), eligible: who.balance >= MIN_BALANCE }, 200, h);
      }
      if (url.pathname === "/generate") {
        const { tier = "free", payTx } = body;
        let opts;
        try {
          opts = validateOptions(body);
        } catch (e) {
          throw httpError(400, e.message);
        }
        const { style, filters, horizon, note } = opts;
        const model = MODELS.find((m) => m.tier === tier);
        if (!model) throw httpError(400, "Unknown tier.");
        const who = await identify(body.auth);
        let used = 0;
        if (tier === "free") {
          if (who.balance < MIN_BALANCE) throw httpError(403, "The free tier is for activated wallets holding at least 0.1 NEAR.");
          used = Number(await env.USAGE.get(`free:${who.accountId}`) || 0);
          if (used >= FREE_PER_WALLET) throw httpError(429, `You've used your ${FREE_PER_WALLET} free generations. Try the frontier model for 0.01 NEAR.`);
          await env.USAGE.put(`free:${who.accountId}`, String(used + 1));
        } else {
          await checkPayment(env, who.accountId, payTx);
        }
        try {
          const apiKey = tier === "pro" ? env.NEAR_AI_API_KEY_PRO || env.NEAR_AI_API_KEY : env.NEAR_AI_API_KEY;
          if (!apiKey) throw httpError(503, "The AI relay has no NEAR AI key configured yet.");
          const g = await generate(style, filters, { apiKey, model: model.id, horizon, note });
          return json({ ...g, tier, accountId: who.accountId, free_left: tier === "free" ? FREE_PER_WALLET - used - 1 : void 0 }, 200, h);
        } catch (e) {
          if (tier === "free") await env.USAGE.put(`free:${who.accountId}`, String(used));
          else await env.USAGE.delete(`tx:${payTx}`);
          throw httpError(502, `NEAR AI Cloud: ${e.message}`);
        }
      }
      return json({ error: "not found" }, 404, h);
    } catch (e) {
      return json({ error: e.message }, e.status || 500, h);
    }
  }
};
export {
  index_default as default
};
