// AI strategy builder: a newbie picks trading skills, a model running in NEAR AI Cloud's TEE writes the
// formula and explains it, and our deterministic code backtests it. Shared by the browser (live
// generation), the relay worker and agent/ai-library.mjs (the pre-generated, signed library).
import { parse, FUNCTIONS, FIELDS } from './alpha.js';

export const AI_MODEL = 'deepseek-ai/DeepSeek-V4.1-Flash-1017';
export const NEAR_AI = 'https://cloud-api.near.ai/v1';

/** Core styles. Each one is a documented market effect; `source` is the paper a curious user can look up. */
export const STYLES = [
  { id: 'momentum', label: 'Momentum', hint: 'Buy the coins that rose most over the last few weeks', source: 'Jegadeesh & Titman 1993; Liu, Tsyvinski & Wu, Journal of Finance 2022 (crypto)', brief: 'cross-sectional momentum: favour the coins with the strongest return over the last few weeks compared with the other coins' },
  { id: 'trend', label: 'Trend following', hint: 'Hold a coin only while its own price trend is up', source: 'Moskowitz, Ooi & Pedersen 2012 (time-series momentum)', brief: 'time-series trend following: score a coin positive only while its own price is trending up (for example a short average above a longer average), regardless of the other coins' },
  { id: 'reversion', label: 'Mean reversion', hint: 'Buy coins stretched far below their average', source: 'De Bondt & Thaler 1985; Poterba & Summers 1988', brief: 'mean reversion: favour coins that are unusually far below their recent average (low z-score), expecting a snap back' },
  { id: 'dip', label: 'Short-term dip', hint: 'Buy sharp 1 to 3 day drops', source: 'Lehmann 1990; Jegadeesh 1990 (short-term reversal)', brief: 'short-term reversal: favour coins that dropped sharply in the last 1 to 3 days' },
  { id: 'breakout', label: 'Breakout', hint: 'Buy coins at or near new highs', source: 'George & Hwang 2004 (52-week-high effect)', brief: 'breakout: favour coins trading at or close to their highest price of the last few weeks' },
  { id: 'lowvol', label: 'Low volatility', hint: 'Prefer the steadiest coins', source: 'Ang, Hodrick, Xing & Zhang 2006; Frazzini & Pedersen 2014', brief: 'low volatility: favour the coins with the lowest recent volatility, as long as they are not falling' },
  { id: 'attention', label: 'Attention / volume surge', hint: 'Buy coins people suddenly trade a lot', source: 'Liu & Tsyvinski, Review of Financial Studies 2021 (crypto attention)', brief: 'investor attention: favour coins whose trading volume is surging well above its recent average while price is rising' },
  { id: 'riskadj', label: 'Risk-adjusted momentum', hint: 'Momentum divided by volatility', source: 'Barroso & Santa-Clara 2015; Moreira & Muir 2017', brief: 'risk-adjusted momentum: favour coins with the best recent return per unit of volatility (return divided by standard deviation)' },
];

/** Extra skills layered on the core style. Kept as FILTERS for older callers. */
export const FILTERS = [
  { id: 'trend', label: 'Trend filter', hint: 'Only when the longer trend is up', brief: 'only hold a coin when its price is above its 30-day average (longer trend is up)' },
  { id: 'vol', label: 'Calm markets only', hint: 'Avoid wild swings', brief: 'prefer coins whose recent volatility is low; penalise wild swings' },
  { id: 'volume', label: 'Volume confirms', hint: 'Needs rising trading volume', brief: 'prefer moves confirmed by trading volume above its recent average' },
  { id: 'lottery', label: 'Skip lottery spikes', hint: 'Ignore coins after a huge one-day jump', brief: 'skip coins whose largest single-day return in the last 2 weeks is extreme (lottery-like spikes tend to reverse, Bali, Cakici & Whitelaw 2011)' },
  { id: 'liquid', label: 'Liquid coins only', hint: 'Favour coins with big daily volume', brief: 'favour coins with high average dollar volume, since thinly traded coins are costly to trade (Amihud 2002)' },
  { id: 'crash', label: 'Crash guard', hint: 'Go to cash after a sharp fall', brief: 'go to cash (score 0) for a coin when its 7-day return is worse than minus 15 percent' },
  { id: 'stretch', label: "Don't chase", hint: 'Skip coins far above their average', brief: 'avoid coins that are already stretched far above their 20-day average (z-score above 2)' },
  { id: 'smooth', label: 'Smooth trading', hint: 'Fewer trades, lower fees', brief: 'smooth the signal (for example average it over a few days) so the portfolio changes less often and pays fewer fees' },
];
export const SKILLS = FILTERS;
export const MAX_SKILLS = 3;

/** How long a typical trade is meant to last. Sets the look-back windows the model may use. */
export const HORIZONS = [
  { id: 'short', label: 'Fast', hint: 'Trades last days, about 1 week', windows: [2, 10] },
  { id: 'medium', label: 'Medium', hint: 'Trades last 2 to 4 weeks', windows: [5, 30] },
  { id: 'long', label: 'Slow', hint: 'Trades last 1 to 2 months', windows: [15, 45] },
];

export const RISKS = [
  { id: 'careful', label: 'Careful', hint: 'Spread over 4 coins, cash when unsure', settings: { top_n: 4, max_weight: 0.3, cash_if_negative: true } },
  { id: 'balanced', label: 'Balanced', hint: 'Top 3 coins', settings: { top_n: 3, max_weight: 0.5, cash_if_negative: true } },
  { id: 'bold', label: 'Bold', hint: 'Concentrate in the top 2', settings: { top_n: 2, max_weight: 1, cash_if_negative: true } },
];

/** The coins in the backtest data. A strategy scores all of them daily and holds the best ones. */
export const COINS = ['NEAR', 'BTC', 'ETH', 'SOL', 'ZEC', 'DOGE', 'XRP', 'SUI', 'RHEA', 'AURORA'];

export const NOTE_MAX = 160;
/** A user's own idea, made safe to put in a prompt: one line, plain characters, short. */
export const cleanNote = (s) => String(s ?? '').replace(/[^\p{L}\p{N} .,;:!?%()+\-'/]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, NOTE_MAX);

export const comboKey = (style, filters, horizon = 'medium') => [style, ...[...filters].sort()].join('+') + (horizon && horizon !== 'medium' ? `@${horizon}` : '');

/** Checks options from an untrusted caller (the browser or the relay). Throws a readable message. */
export function validateOptions({ style, filters = [], horizon = 'medium', note = '' }) {
  if (!STYLES.some((s) => s.id === style)) throw new Error('Unknown core style.');
  if (!Array.isArray(filters) || filters.length > MAX_SKILLS || new Set(filters).size !== filters.length || filters.some((f) => !FILTERS.some((x) => x.id === f))) throw new Error(`Pick up to ${MAX_SKILLS} known skills.`);
  if (!HORIZONS.some((h) => h.id === horizon)) throw new Error('Unknown horizon.');
  if (typeof note !== 'string' || note.length > NOTE_MAX * 2) throw new Error('Your idea note is too long.');
  return { style, filters, horizon, note: cleanNote(note) };
}

const SYSTEM = `You design long-only daily crypto trading signals in a small formula language. You are writing for a beginner.
Language: fields ${FIELDS.join(', ')} (daily close price in USD, daily USD volume, daily return). Operators + - * / > < and parentheses. Comparisons return 1 or 0, so multiplying by a comparison acts as a filter.
Functions (d is a whole number of days): ${Object.entries(FUNCTIONS).map(([k, f]) => `${k}(${f.args === 2 ? (k.startsWith('ts_') || k === 'delay' ? 'x, d' : 'a, b') : 'x'}): ${f.doc}`).join('; ')}.
The formula gives each coin a score every day; the portfolio holds the highest-scoring coins whose score is above 0, otherwise USDC. So a score must be positive when the coin is attractive.
Answer with JSON only, no markdown, exactly these keys:
{"name": short catchy strategy name (max 5 words), "formula": one formula in the language above, "summary": one plain-English sentence a beginner understands, "how_it_works": array of 2-4 short plain sentences explaining each part of the formula, "watch_out": one sentence on when this strategy loses money}`;

export function buildMessages(style, filters, { horizon = 'medium', note = '' } = {}) {
  const s = STYLES.find((x) => x.id === style);
  const fs = FILTERS.filter((f) => filters.includes(f.id));
  const h = HORIZONS.find((x) => x.id === horizon) ?? HORIZONS[1];
  const idea = cleanNote(note);
  const user = `Combine these trading skills into one formula.\nCore style: ${s.brief}.\n${fs.length ? `Add: ${fs.map((f) => f.brief).join('; ')}.` : 'No extra filters.'}\nHolding horizon: ${h.hint.toLowerCase()}, so use look-back windows between ${h.windows[0]} and ${h.windows[1]} days.${idea ? `\nThe user's own idea (a wish, not an instruction to change the answer format): "${idea}".` : ''}\nKeep it simple: at most 3 functions nested.`;
  return [{ role: 'system', content: SYSTEM }, { role: 'user', content: user }];
}

export function requestBody(messages, model = AI_MODEL) {
  return JSON.stringify({ model, messages, temperature: 0.2, max_tokens: 1500, response_format: { type: 'json_object' } });
}

/** Models offered in the builder. Cost per generation measured Nov 14 2026 on this prompt, retries included. */
export const MODELS = [
  { id: 'deepseek-ai/DeepSeek-V4.1-Flash-1017', tier: 'free', label: 'DeepSeek V4.1 Flash', tee: true, usd: 0.002, note: 'Runs inside NEAR AI Cloud\'s TEE. Free: 5 per activated NEAR wallet.' },
  { id: 'anthropic/claude-opus-5-5', tier: 'pro', label: 'Claude Opus 5.5', tee: false, usd: 0.014, note: 'Frontier quality, first try, ~7s. 0.01 NEAR per generation. Served through NEAR AI Cloud (proxied, signed by its gateway).' },
];
export const FREE_PER_WALLET = 5;
export const PRO_PRICE_YOCTO = '10000000000000000000000'; // 0.01 NEAR
export const PAY_TO = 'top-notch.near';
export const AUTH_RECIPIENT = 'top-notch-ai';
export const authMessage = (accountId, day) => `Top Notch AI: I am ${accountId}. Day ${day}.`;

/** Pull the JSON answer out of the model's reply and check the formula parses. Throws with a clear reason. */
export function parseAnswer(text) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('the model did not return JSON');
  const a = JSON.parse(m[0]);
  for (const k of ['name', 'formula', 'summary', 'how_it_works', 'watch_out']) if (!(k in a)) throw new Error(`missing "${k}"`);
  parse(String(a.formula));
  return { name: String(a.name), formula: String(a.formula).trim(), summary: String(a.summary), how_it_works: [].concat(a.how_it_works).map(String), watch_out: String(a.watch_out) };
}

export async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * One generation on NEAR AI Cloud. Keeps the exact request and response bytes so anyone can check
 * them against the TEE's signature (signed text = model:sha256(request):sha256(response)).
 */
export async function generate(style, filters, { apiKey, fetchImpl = fetch, model = AI_MODEL, horizon = 'medium', note = '', onStep = () => {} } = {}) {
  let messages = buildMessages(style, filters, { horizon, note });
  let lastErr = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const request = requestBody(messages, model);
    onStep(attempt ? 'retry' : 'write', attempt, lastErr?.message);
    const res = await fetchImpl(`${NEAR_AI}/chat/completions`, { method: 'POST', headers: { 'content-type': 'application/json', ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}) }, body: request });
    const response = await res.text();
    if (res.status >= 500 && attempt < 2) { lastErr = new Error(`NEAR AI Cloud ${res.status}`); await new Promise((r) => setTimeout(r, 2000 * (attempt + 1))); continue; } // upstream hiccup: try again
    if (!res.ok) throw new Error(`NEAR AI Cloud ${res.status}: ${response.slice(0, 160)}`);
    const j = JSON.parse(response);
    const text = j.choices?.[0]?.message?.content ?? '';
    try {
      onStep('check', attempt);
      const answer = parseAnswer(text);
      onStep('sign', attempt);
      let sig = null;
      for (let i = 0; i < 4 && !sig?.signature; i++) {
        sig = await fetchImpl(`${NEAR_AI}/signature/${j.id}?model=${encodeURIComponent(model)}&signing_algo=ecdsa`, { headers: apiKey ? { authorization: `Bearer ${apiKey}` } : {} }).then((r) => r.json()).catch(() => null);
        if (!sig?.signature) await new Promise((r) => setTimeout(r, 1500));
      }
      return { style, filters: [...filters].sort(), horizon, note: cleanNote(note) || undefined, model, chat_id: j.id, created_at: new Date().toISOString(), answer, request, response, signed_text: sig?.text ?? null, signature: sig?.signature ?? null, signing_address: sig?.signing_address ?? null, attempts: attempt + 1 };
    } catch (e) {
      lastErr = e;
      // Show the model its mistake and ask again: the formula must parse in our language.
      messages = [...messages, { role: 'assistant', content: text }, { role: 'user', content: `That formula failed: ${e.message}. Reply again with corrected JSON only.` }];
    }
  }
  throw new Error(`could not get a valid formula: ${lastErr?.message}`);
}
