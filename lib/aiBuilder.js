// AI strategy builder: a newbie picks trading skills, a model running in NEAR AI Cloud's TEE writes the
// formula and explains it, and our deterministic code backtests it. Shared by the browser (live
// generation) and agent/ai-library.mjs (the pre-generated, signed library).
import { parse, FUNCTIONS, FIELDS } from './alpha.js';

export const AI_MODEL = 'deepseek-ai/DeepSeek-V4.1-Flash-1017';
export const NEAR_AI = 'https://cloud-api.near.ai/v1';

export const STYLES = [
  { id: 'momentum', label: 'Momentum', hint: 'Buy what has been rising', brief: 'momentum: favour tokens whose price has been rising over the last few weeks' },
  { id: 'reversion', label: 'Mean reversion', hint: 'Buy what has stretched too far down from its average', brief: 'mean reversion: favour tokens that are unusually far below their recent average, expecting a snap back' },
  { id: 'dip', label: 'Dip buying', hint: 'Buy sharp short drops', brief: 'dip buying: favour tokens that dropped sharply in the last 1 to 3 days' },
  { id: 'breakout', label: 'Breakout', hint: 'Buy new highs', brief: 'breakout: favour tokens making new multi-week highs' },
];

export const FILTERS = [
  { id: 'trend', label: 'Trend filter', hint: 'Only when the longer trend is up', brief: 'only hold a token when its price is above its 30-day average (longer trend is up)' },
  { id: 'vol', label: 'Calm markets only', hint: 'Avoid wild swings', brief: 'prefer tokens whose recent volatility is low; penalise wild swings' },
  { id: 'volume', label: 'Volume confirms', hint: 'Needs rising trading volume', brief: 'prefer moves confirmed by trading volume above its recent average' },
];

export const RISKS = [
  { id: 'careful', label: 'Careful', hint: 'Spread over 4 tokens, cash when unsure', settings: { top_n: 4, max_weight: 0.3, cash_if_negative: true } },
  { id: 'balanced', label: 'Balanced', hint: 'Top 3 tokens', settings: { top_n: 3, max_weight: 0.5, cash_if_negative: true } },
  { id: 'bold', label: 'Bold', hint: 'Concentrate in the top 2', settings: { top_n: 2, max_weight: 1, cash_if_negative: true } },
];

export const comboKey = (style, filters) => [style, ...[...filters].sort()].join('+');

const SYSTEM = `You design long-only daily crypto trading signals in a small formula language. You are writing for a beginner.
Language: fields ${FIELDS.join(', ')} (daily close price in USD, daily USD volume, daily return). Operators + - * / > < and parentheses. Comparisons return 1 or 0, so multiplying by a comparison acts as a filter.
Functions (d is a whole number of days): ${Object.entries(FUNCTIONS).map(([k, f]) => `${k}(${f.args === 2 ? (k.startsWith('ts_') || k === 'delay' ? 'x, d' : 'a, b') : 'x'}): ${f.doc}`).join('; ')}.
The formula gives each token a score every day; the portfolio holds the highest-scoring tokens whose score is above 0, otherwise USDC. So a score must be positive when the token is attractive.
Answer with JSON only, no markdown, exactly these keys:
{"name": short catchy strategy name (max 5 words), "formula": one formula in the language above, "summary": one plain-English sentence a beginner understands, "how_it_works": array of 2-3 short plain sentences explaining each part of the formula, "watch_out": one sentence on when this strategy loses money}`;

export function buildMessages(style, filters) {
  const s = STYLES.find((x) => x.id === style);
  const fs = FILTERS.filter((f) => filters.includes(f.id));
  const user = `Combine these trading skills into one formula.\nCore style: ${s.brief}.\n${fs.length ? `Add: ${fs.map((f) => f.brief).join('; ')}.` : 'No extra filters.'}\nKeep it simple: at most 3 functions nested. Use windows between 2 and 30 days.`;
  return [{ role: 'system', content: SYSTEM }, { role: 'user', content: user }];
}

export function requestBody(messages) {
  return JSON.stringify({ model: AI_MODEL, messages, temperature: 0.2, max_tokens: 1500, response_format: { type: 'json_object' } });
}

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
export async function generate(style, filters, { apiKey, fetchImpl = fetch } = {}) {
  let messages = buildMessages(style, filters);
  let lastErr = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const request = requestBody(messages);
    const res = await fetchImpl(`${NEAR_AI}/chat/completions`, { method: 'POST', headers: { 'content-type': 'application/json', ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}) }, body: request });
    const response = await res.text();
    if (!res.ok) throw new Error(`NEAR AI Cloud ${res.status}: ${response.slice(0, 160)}`);
    const j = JSON.parse(response);
    const text = j.choices?.[0]?.message?.content ?? '';
    try {
      const answer = parseAnswer(text);
      let sig = null;
      for (let i = 0; i < 4 && !sig?.signature; i++) {
        sig = await fetchImpl(`${NEAR_AI}/signature/${j.id}?model=${encodeURIComponent(AI_MODEL)}&signing_algo=ecdsa`, { headers: apiKey ? { authorization: `Bearer ${apiKey}` } : {} }).then((r) => r.json()).catch(() => null);
        if (!sig?.signature) await new Promise((r) => setTimeout(r, 1500));
      }
      return { style, filters: [...filters].sort(), model: AI_MODEL, chat_id: j.id, created_at: new Date().toISOString(), answer, request, response, signed_text: sig?.text ?? null, signature: sig?.signature ?? null, signing_address: sig?.signing_address ?? null, attempts: attempt + 1 };
    } catch (e) {
      lastErr = e;
      // Show the model its mistake and ask again: the formula must parse in our language.
      messages = [...messages, { role: 'assistant', content: text }, { role: 'user', content: `That formula failed: ${e.message}. Reply again with corrected JSON only.` }];
    }
  }
  throw new Error(`could not get a valid formula: ${lastErr?.message}`);
}
