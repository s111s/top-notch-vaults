// Strategy usage and researcher earnings, from real data only:
// - who follows a strategy: vault policies read live from mainnet, plus agents whose latest registry
//   mandate is a "follow" of it;
// - swaps and fees: the agents' recorded 1Click swaps (each lists the appFees 1Click recorded), matched to
//   a strategy by the on-chain signal they traded on;
// - withdrawable: the researcher's live balance on intents.near, where 1Click credits app fees.
import { ASSETS, asset } from './config';
import { view } from './near';
import { KNOWN_VAULTS } from './vaults';

type Fee = { recipient: string; fee: number };
type Trade = { at: string; vault?: string; strategy?: { account: string; id: string }; signal_hash?: string; usd: number; status: string; txHash: string; appFees?: Fee[] };
export type Usage = { key: string; users: string[]; swaps: number; volume: number; fees: number; trades: (Trade & { fee: number; user: string })[] };

export async function loadUsage(market: { strategies: any[]; followers: any[] }): Promise<Record<string, Usage>> {
  const [vt, ft, vaults] = await Promise.all([
    fetch(asset('/data/vault-trades.json')).then((r) => r.json()).catch(() => []) as Promise<Trade[]>,
    fetch(asset('/data/follow-trades.json')).then((r) => r.json()).catch(() => []) as Promise<Trade[]>,
    Promise.all(KNOWN_VAULTS.map(async (id) => ({ id, strategy: (await view<{ strategy: string }>(id, 'get_policy').catch(() => null))?.strategy }))),
  ]);
  const bySignal: Record<string, string> = {};
  for (const s of market.strategies) for (const sig of s.signals) bySignal[sig.hash] = `${s.account}/${s.id}`;
  const out: Record<string, Usage> = {};
  const get = (k: string) => (out[k] ??= { key: k, users: [], swaps: 0, volume: 0, fees: 0, trades: [] });
  for (const s of market.strategies) get(`${s.account}/${s.id}`);
  for (const v of vaults) { if (!v.strategy) continue; const u = get(v.strategy); if (!u.users.includes(v.id)) u.users.push(v.id); }
  for (const f of market.followers) {
    const st = f.mandate.json.strategy; const u = get(`${st.account}/${st.id}`);
    if (!u.users.includes(f.agent)) u.users.push(f.agent);
  }
  for (const t of [...vt, ...ft]) {
    if (t.status !== 'SUCCESS') continue;
    const key = t.strategy ? `${t.strategy.account}/${t.strategy.id}` : t.signal_hash ? bySignal[t.signal_hash] : undefined;
    if (!key) continue;
    const acct = key.split('/')[0];
    const bps = t.appFees?.find((f) => f.recipient === acct)?.fee ?? 0;
    const fee = (Number(t.usd) * bps) / 1e4;
    const u = get(key);
    const user = t.vault ?? 'alpha-bot-demo.near';
    u.swaps += 1; u.volume += Number(t.usd); u.fees += fee; u.trades.push({ ...t, fee, user });
  }
  return out;
}

export type Balance = { tokenId: string; sym: string; contract: string; raw: string; amount: number; decimals: number };
/** The account's balances on intents.near (NEAR Intents), where 1Click app fees are credited. */
export async function intentsBalances(account: string): Promise<Balance[]> {
  const tokens = await view<{ token_id: string }[]>('intents.near', 'mt_tokens_for_owner', { account_id: account });
  if (!tokens.length) return [];
  const ids = tokens.map((t) => t.token_id);
  const raws = await view<string[]>('intents.near', 'mt_batch_balance_of', { account_id: account, token_ids: ids });
  return ids.map((id, i) => {
    const a = Object.values(ASSETS).find((x) => x.assetId === id);
    const decimals = a?.decimals ?? 0;
    return { tokenId: id, sym: a?.sym ?? id.replace(/^nep141:/, '').slice(0, 12), contract: id.replace(/^nep141:/, ''), raw: raws[i], decimals, amount: Number(raws[i]) / 10 ** decimals };
  }).filter((b) => b.raw !== '0');
}
