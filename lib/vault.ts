// Everything the investor sees about a vault, read live from NEAR mainnet, plus the agent's plan for
// its next move. The plan is the same rule the managed agent runs (scripts/managed-agent.mjs).
import { ASSETS, assetByContract, REGISTRY } from './config';
import { fromRaw, fullAccessKeys, view } from './near';
import { prices } from './oneclick';

export type Policy = { tokens: { token: string; max_per_trade: string }[]; max_trades_per_day: number; strategy: string };
export type Holding = { sym: string; contract: string; raw: string; amount: number; usd: number; price: number; cap: number };
export type Entry = { agent: string; mandate: string; mandate_hash: string; timestamp_ns: string; block_height: number; json: any };
export type VaultState = {
  id: string; owner: string; agent: string; policy: Policy; paused: boolean; swaps: number;
  fullKeys: string[]; holdings: Holding[]; equity: number;
  strategy: { account: string; id: string; card: Entry | null; signal: Entry | null };
};

export async function entries(account: string): Promise<Entry[]> {
  const list = await view<Omit<Entry, 'json'>[]>(REGISTRY, 'get_mandates', { agent: account });
  return list.map((m) => { let json = null; try { json = JSON.parse(m.mandate); } catch {} return { ...m, json }; });
}

export async function loadVault(id: string): Promise<VaultState> {
  const [owner, agent, policy, paused, swaps, fullKeys, px] = await Promise.all([
    view<string>(id, 'get_owner'), view<string>(id, 'get_agent'), view<Policy>(id, 'get_policy'),
    view<boolean>(id, 'is_paused'), view<number>(id, 'get_swap_count'), fullAccessKeys(id), prices().catch(() => ({} as Record<string, { price: number }>)),
  ]);
  const holdings = await Promise.all(policy.tokens.map(async (t) => {
    const a = assetByContract(t.token);
    const decimals = a?.decimals ?? 18;
    const raw = await view<string>(t.token, 'ft_balance_of', { account_id: id }).catch(() => '0');
    const amount = fromRaw(raw, decimals);
    const price = px[a?.assetId ?? `nep141:${t.token}`]?.price ?? 0;
    return { sym: a?.sym ?? t.token.slice(0, 8), contract: t.token, raw, amount, usd: amount * price, price, cap: fromRaw(t.max_per_trade, decimals) };
  }));
  const [account, sid] = policy.strategy.split('/');
  const all = await entries(account).catch(() => []);
  const card = all.filter((e) => e.json?.kind === 'strategy' && e.json.id === sid).at(-1) ?? null;
  const signal = all.filter((e) => e.json?.kind === 'signal' && e.json.id === sid).at(-1) ?? null;
  return { id, owner, agent, policy, paused, swaps, fullKeys, holdings, equity: holdings.reduce((s, h) => s + h.usd, 0), strategy: { account, id: sid, card, signal } };
}

export type PlannedTrade = { from: string; to: string; usd: number; raw: string };
const MAX_TRADE_USD = 4.75;
const BAND_USD = 0.5;

/** The agent's next move: trade toward the latest on-chain signal, sells first, each under the vault's cap. */
export function planTrades(v: VaultState): PlannedTrade[] {
  const w: Record<string, number> = v.strategy.signal?.json?.weights ?? {};
  const universe: string[] = v.strategy.card?.json?.settings?.universe ?? [];
  const by = Object.fromEntries(v.holdings.map((h) => [h.sym, h]));
  const out: PlannedTrade[] = [];
  for (const s of universe) {
    const h = by[s]; if (!h) continue;
    const diff = (w[s] || 0) * v.equity - h.usd;
    if (diff < -BAND_USD && h.price > 0) {
      const usd = Math.min(-diff, MAX_TRADE_USD);
      const all = !w[s] && -diff <= MAX_TRADE_USD;
      out.push({ from: s, to: 'USDC', usd, raw: all ? h.raw : BigInt(Math.floor((usd / h.price) * 10 ** Math.min(ASSETS[s].decimals, 15))).toString() + '0'.repeat(Math.max(0, ASSETS[s].decimals - 15)) });
    }
  }
  for (const s of universe) {
    const h = by[s]; if (!h) continue;
    const diff = (w[s] || 0) * v.equity - h.usd;
    if (diff > BAND_USD) { const usd = Math.min(diff, MAX_TRADE_USD); out.push({ from: 'USDC', to: s, usd, raw: BigInt(Math.floor(usd * 1e6)).toString() }); }
  }
  return out;
}
