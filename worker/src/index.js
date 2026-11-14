// Top Notch AI relay (Cloudflare Worker). Holds the platform's NEAR AI Cloud key so the browser never
// sees it, and decides who may spend it:
//   free tier: an activated NEAR wallet (exists on-chain, holds >= 0.1 NEAR, proves ownership with a
//              NEP-413 signed message) gets FREE_PER_WALLET generations on the TEE model;
//   pro tier:  any wallet that paid 0.01 NEAR to top-notch.near in a transaction we haven't seen before.
// Bindings: secret NEAR_AI_API_KEY, KV namespace USAGE. Optional var ALLOWED_ORIGINS (comma separated).
import { generate, MODELS, STYLES, FILTERS, FREE_PER_WALLET, PRO_PRICE_YOCTO, PAY_TO, AUTH_RECIPIENT, authMessage } from '../../lib/aiBuilder.js';

const RPCS = ['https://rpc.mainnet.fastnear.com', 'https://rpc.mainnet.near.org'];
const MIN_BALANCE = 10n ** 23n; // 0.1 NEAR
const DEFAULT_ORIGINS = ['https://s111s.github.io', 'http://localhost:3000', 'http://localhost:8123'];

const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function b58decode(s) {
  let n = 0n; for (const c of s) { const i = B58.indexOf(c); if (i < 0) throw new Error('bad base58'); n = n * 58n + BigInt(i); }
  const out = []; while (n > 0n) { out.unshift(Number(n % 256n)); n /= 256n; }
  for (const c of s) { if (c !== '1') break; out.unshift(0); }
  return Uint8Array.from(out);
}
const b64decode = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const u32 = (n) => { const b = new Uint8Array(4); new DataView(b.buffer).setUint32(0, n, true); return b; };
const str = (s) => { const t = new TextEncoder().encode(s); return concat(u32(t.length), t); };
function concat(...parts) { const out = new Uint8Array(parts.reduce((s, p) => s + p.length, 0)); let o = 0; for (const p of parts) { out.set(p, o); o += p.length; } return out; }

/** NEP-413: the wallet signs sha256(borsh(2^31 + 413) || borsh({ message, nonce, recipient, callbackUrl: None })). */
async function verifyNep413({ publicKey, signature, message, nonce, recipient }) {
  const payload = concat(u32(2 ** 31 + 413), str(message), b64decode(nonce), str(recipient), new Uint8Array([0]));
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', payload));
  const key = await crypto.subtle.importKey('raw', b58decode(publicKey.replace(/^ed25519:/, '')), { name: 'Ed25519' }, false, ['verify']);
  return crypto.subtle.verify({ name: 'Ed25519' }, key, b64decode(signature), hash);
}

async function rpc(method, params) {
  let last;
  for (const url of RPCS) {
    try {
      const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) }).then((x) => x.json());
      if (r.error) { last = new Error(r.error.cause?.name || r.error.message || 'rpc error'); if (r.error.cause?.name) throw last; continue; }
      return r.result;
    } catch (e) { last = e; if (/UNKNOWN_|INVALID_/.test(String(e.message))) throw e; }
  }
  throw last;
}

/** Who is calling: checks the signed message, that the key belongs to the account, and that the account is activated. */
async function identify(auth) {
  if (!auth?.accountId || !auth.publicKey || !auth.signature || !auth.nonce) throw httpError(401, 'Sign in with your NEAR wallet first.');
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  if (![authMessage(auth.accountId, today), authMessage(auth.accountId, yesterday)].includes(auth.message)) throw httpError(401, 'Sign-in message expired; sign in again.');
  if (!(await verifyNep413({ ...auth, recipient: AUTH_RECIPIENT }))) throw httpError(401, 'Wallet signature did not verify.');
  await rpc('query', { request_type: 'view_access_key', finality: 'final', account_id: auth.accountId, public_key: auth.publicKey })
    .catch(() => { throw httpError(401, 'That key is not a key of this account.'); });
  const acct = await rpc('query', { request_type: 'view_account', finality: 'final', account_id: auth.accountId })
    .catch(() => { throw httpError(403, 'This account is not activated on NEAR mainnet yet. Send it some NEAR first.'); });
  return { accountId: auth.accountId, balance: BigInt(acct.amount) };
}

/** A paid generation: a Transfer of >= 0.01 NEAR from the caller to PAY_TO, used once. */
async function checkPayment(env, accountId, txHash) {
  if (!txHash) throw httpError(402, 'Pay 0.01 NEAR to use the frontier model.');
  if (await env.USAGE.get(`tx:${txHash}`)) throw httpError(409, 'That payment was already used.');
  const tx = await rpc('EXPERIMENTAL_tx_status', { tx_hash: txHash, sender_account_id: accountId, wait_until: 'EXECUTED_OPTIMISTIC' }).catch(() => null);
  const t = tx?.transaction;
  const paid = t && t.signer_id === accountId && t.receiver_id === PAY_TO && t.actions.some((a) => a.Transfer && BigInt(a.Transfer.deposit) >= BigInt(PRO_PRICE_YOCTO));
  const ok = tx?.status && 'SuccessValue' in tx.status;
  if (!paid || !ok) throw httpError(402, 'Could not find a successful 0.01 NEAR payment from your account to top-notch.near in that transaction.');
  await env.USAGE.put(`tx:${txHash}`, accountId);
}

function httpError(status, message) { const e = new Error(message); e.status = status; return e; }

function cors(req, env) {
  const allowed = (env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',') : DEFAULT_ORIGINS).map((s) => s.trim());
  const origin = req.headers.get('origin') || '';
  return { 'access-control-allow-origin': allowed.includes(origin) ? origin : allowed[0], 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': 'content-type', vary: 'origin' };
}
const json = (body, status, headers) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });

export default {
  async fetch(req, env) {
    const h = cors(req, env);
    if (req.method === 'OPTIONS') return new Response(null, { headers: h });
    const url = new URL(req.url);
    try {
      if (url.pathname === '/' || url.pathname === '/health') return json({ ok: true, models: MODELS, free_per_wallet: FREE_PER_WALLET }, 200, h);
      const body = req.method === 'POST' ? await req.json() : {};
      if (url.pathname === '/quota') {
        const who = await identify(body.auth);
        const used = Number((await env.USAGE.get(`free:${who.accountId}`)) || 0);
        return json({ accountId: who.accountId, used, left: Math.max(0, FREE_PER_WALLET - used), eligible: who.balance >= MIN_BALANCE }, 200, h);
      }
      if (url.pathname === '/generate') {
        const { style, filters = [], tier = 'free', payTx } = body;
        if (!STYLES.some((s) => s.id === style) || !Array.isArray(filters) || filters.some((f) => !FILTERS.some((x) => x.id === f))) throw httpError(400, 'Unknown skills.');
        const model = MODELS.find((m) => m.tier === tier);
        if (!model) throw httpError(400, 'Unknown tier.');
        const who = await identify(body.auth);
        let used = 0;
        if (tier === 'free') {
          if (who.balance < MIN_BALANCE) throw httpError(403, 'The free tier is for activated wallets holding at least 0.1 NEAR.');
          used = Number((await env.USAGE.get(`free:${who.accountId}`)) || 0);
          if (used >= FREE_PER_WALLET) throw httpError(429, `You've used your ${FREE_PER_WALLET} free generations. Try the frontier model for 0.01 NEAR.`);
          await env.USAGE.put(`free:${who.accountId}`, String(used + 1)); // count before calling, so parallel requests can't overspend
        } else {
          await checkPayment(env, who.accountId, payTx);
        }
        try {
          const g = await generate(style, filters, { apiKey: env.NEAR_AI_API_KEY, model: model.id });
          return json({ ...g, tier, accountId: who.accountId, free_left: tier === 'free' ? FREE_PER_WALLET - used - 1 : undefined }, 200, h);
        } catch (e) {
          if (tier === 'free') await env.USAGE.put(`free:${who.accountId}`, String(used)); // refund a failed attempt
          else await env.USAGE.delete(`tx:${payTx}`); // let the paid transaction be retried
          throw httpError(502, `NEAR AI Cloud: ${e.message}`);
        }
      }
      return json({ error: 'not found' }, 404, h);
    } catch (e) {
      return json({ error: e.message }, e.status || 500, h);
    }
  },
};
