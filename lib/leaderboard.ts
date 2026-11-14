// Leaderboards for strategies and investors, plus the Top Notch score that combines every stat.
//
// Live rows come straight from NEAR mainnet (registry + vault contracts + 1Click prices).
// Simulated rows are clearly tagged: each one is a vault that would have followed a real strategy
// from a given start date, computed from that strategy's published backtest curve. They exist so the
// ranking logic can be judged with more than one real vault; the switch on the page hides them.
import { asset, DEMO_VAULT } from './config';
import { loadMarket } from './market';
import { loadVault } from './vault';
import { prices } from './oneclick';

export type Source = 'live' | 'simulated';

export type InvestorRow = {
  id: string; source: Source; strategy: string; strategyName: string; since: string; days: number;
  deposit: number; value: number; profitPct: number; profitUsd: number; traded: number; trades: number;
  winRate: number; maxDrawdown: number; audit: string | null; score?: number; confidence?: number;
};

export type StrategyRow = {
  key: string; account: string; id: string; name: string; visibility: string; audit: string | null;
  sharpe: number; oosSharpe: number; maxDrawdown: number; totalReturn: number; feeBps: number; signals: number;
  trustedLive: number; trustedSim: number; fundsLive: number; fundsSim: number; score?: number;
};

type Curve = { id: string; points: [string, number, number][] };

// ---------- scoring ----------

/** Percentile rank in [0, 1] of each value (ties share the average rank). Higher value = higher rank. */
function pctRank(vals: number[]): number[] {
  if (vals.length <= 1) return vals.map(() => 0.5);
  const sorted = [...vals].sort((a, b) => a - b);
  return vals.map((v) => {
    const lo = sorted.indexOf(v), hi = sorted.lastIndexOf(v);
    return ((lo + hi) / 2) / (vals.length - 1);
  });
}

export const INVESTOR_WEIGHTS = [
  { key: 'riskAdj', label: 'Return per unit of drawdown', w: 0.3 },
  { key: 'profitPct', label: 'Profit %', w: 0.2 },
  { key: 'winRate', label: 'Win rate', w: 0.2 },
  { key: 'profitUsd', label: 'Profit $ (log scale)', w: 0.15 },
  { key: 'traded', label: 'Amount traded (log scale)', w: 0.15 },
] as const;

/**
 * Investor score, 0–100. Percentile-rank each stat, weight them, then shrink toward 50 by how much
 * evidence there is: confidence = days/(days+30) × trades/(trades+10). A lucky week with three trades
 * can't outrank five months of steady results.
 */
export function scoreInvestors(rows: InvestorRow[]): InvestorRow[] {
  const sl = (x: number) => Math.sign(x) * Math.log10(1 + Math.abs(x));
  const stats: Record<string, number[]> = {
    riskAdj: rows.map((r) => r.profitPct / Math.max(Math.abs(r.maxDrawdown), 0.05)),
    profitPct: rows.map((r) => r.profitPct),
    winRate: rows.map((r) => r.winRate),
    profitUsd: rows.map((r) => sl(r.profitUsd)),
    traded: rows.map((r) => sl(r.traded)),
  };
  const ranks = Object.fromEntries(Object.entries(stats).map(([k, v]) => [k, pctRank(v)]));
  return rows.map((r, i) => {
    const raw = INVESTOR_WEIGHTS.reduce((s, w) => s + w.w * ranks[w.key][i], 0);
    const confidence = (r.days / (r.days + 30)) * (r.trades / (r.trades + 10));
    return { ...r, confidence, score: Math.round(100 * (confidence * raw + (1 - confidence) * 0.5)) };
  });
}

export const STRATEGY_WEIGHTS = [
  { key: 'oos', label: 'Out-of-sample Sharpe (unseen data)', w: 0.25 },
  { key: 'dd', label: 'Lowest drawdown', w: 0.2 },
  { key: 'sharpe', label: 'Sharpe', w: 0.15 },
  { key: 'trusted', label: 'Trusted investors', w: 0.15 },
  { key: 'audit', label: 'Audit opinion', w: 0.15 },
  { key: 'funds', label: 'Funds invested', w: 0.1 },
] as const;

/** Strategy score, 0–100: weighted percentile ranks, with the audit as an absolute 1 / 0.5 / 0. */
export function scoreStrategies(rows: StrategyRow[], withSim: boolean): StrategyRow[] {
  const trusted = rows.map((r) => r.trustedLive + (withSim ? r.trustedSim : 0));
  const funds = rows.map((r) => Math.log10(1 + r.fundsLive + (withSim ? r.fundsSim : 0)));
  const ranks: Record<string, number[]> = {
    oos: pctRank(rows.map((r) => r.oosSharpe)),
    dd: pctRank(rows.map((r) => r.maxDrawdown)), // drawdowns are negative: closer to 0 ranks higher
    sharpe: pctRank(rows.map((r) => r.sharpe)),
    trusted: pctRank(trusted),
    audit: rows.map((r) => (r.audit === 'clean' ? 1 : r.audit === 'qualified' ? 0.5 : 0)),
    funds: pctRank(funds),
  };
  return rows.map((r, i) => ({ ...r, score: Math.round(100 * STRATEGY_WEIGHTS.reduce((s, w) => s + w.w * ranks[w.key][i], 0)) }));
}

// ---------- data ----------

const SIM_PLAN: { strategy: string; start: string; deposit: number }[] = [
  { strategy: 'dip-in-uptrend', start: '2026-06-20', deposit: 12000 },
  { strategy: 'dip-in-uptrend', start: '2026-08-15', deposit: 2500 },
  { strategy: 'dip-in-uptrend', start: '2026-10-01', deposit: 600 },
  { strategy: 'dip-in-uptrend', start: '2026-10-25', deposit: 25000 },
  { strategy: 'trend-5-20', start: '2026-06-15', deposit: 4000 },
  { strategy: 'trend-5-20', start: '2026-07-20', deposit: 900 },
  { strategy: 'trend-5-20', start: '2026-09-10', deposit: 15000 },
  { strategy: 'eco-reversal', start: '2026-06-15', deposit: 1500 },
  { strategy: 'eco-reversal', start: '2026-08-01', deposit: 7000 },
  { strategy: 'eco-reversal', start: '2026-10-10', deposit: 3000 },
];

function simulate(c: Curve, start: string, deposit: number, turnover: number) {
  const pts = c.points.filter((p) => p[0] >= start);
  const eq = pts.map((p) => p[1] / pts[0][1]);
  let peak = 1, dd = 0, ups = 0, active = 0;
  for (let i = 0; i < eq.length; i++) {
    peak = Math.max(peak, eq[i]); dd = Math.min(dd, eq[i] / peak - 1);
    if (i > 0 && eq[i] !== eq[i - 1]) { active++; if (eq[i] > eq[i - 1]) ups++; } // flat day = sitting in USDC
  }
  const days = pts.length - 1;
  const value = deposit * eq[eq.length - 1];
  return {
    since: pts[0][0], days, value, profitUsd: value - deposit, profitPct: value / deposit - 1, maxDrawdown: dd,
    winRate: active ? ups / active : 0, traded: deposit * turnover * active, trades: Math.round(active * turnover * 6),
  };
}

export async function loadLeaderboards() {
  const [market, vault, px] = await Promise.all([loadMarket(), loadVault(DEMO_VAULT), prices().catch(() => ({} as Record<string, { price: number }>))]);
  const curves: Record<string, Curve> = {};
  await Promise.all(market.strategies.map(async (s) => {
    curves[s.id] = await fetch(asset(`/data/curve-${s.id}.json`)).then((r) => r.json()).catch(() => null);
  }));
  const vt: { at: string; to: string; usd: number; amountOut?: string; status: string }[] =
    await fetch(asset('/data/vault-trades.json')).then((r) => r.json()).catch(() => []);

  const byKey = Object.fromEntries(market.strategies.map((s) => [`${s.account}/${s.id}`, s]));
  const followed = byKey[vault.policy.strategy];
  const agentAudit = market.followers.find((f) => f.agent === vault.agent)?.audit?.opinion ?? null;

  // The one real vault on mainnet: value is live, deposit is the investor's funding transfer.
  const DEPOSIT = 5.9;
  const sym: Record<string, string> = { NEAR: 'nep141:wrap.near', BTC: 'nep141:nbtc.bridge.near', ETH: 'nep141:eth.bridge.near' };
  const ok = vt.filter((t) => t.status === 'SUCCESS');
  const wins = ok.filter((t) => t.amountOut && Number(t.amountOut) * (px[sym[t.to]]?.price ?? 0) > t.usd).length;
  const firstDay = vt[0]?.at.slice(0, 10) ?? '2026-11-13';
  const live: InvestorRow = {
    id: vault.id, source: 'live', strategy: vault.policy.strategy, strategyName: followed?.card.json.name ?? vault.strategy.id,
    since: firstDay, days: Math.max(1, Math.round((Date.now() - Date.parse(firstDay)) / 864e5)),
    deposit: DEPOSIT, value: vault.equity, profitPct: vault.equity / DEPOSIT - 1, profitUsd: vault.equity - DEPOSIT,
    traded: ok.reduce((s, t) => s + Number(t.usd), 0), trades: ok.length, winRate: ok.length ? wins / ok.length : 0,
    maxDrawdown: Math.min(0, vault.equity / DEPOSIT - 1), audit: agentAudit,
  };

  const sims: InvestorRow[] = SIM_PLAN.flatMap((p, i) => {
    const s = market.strategies.find((x) => x.id === p.strategy);
    const c = curves[p.strategy];
    if (!s || !c) return [];
    const r = simulate(c, p.start, p.deposit, s.card.json.stats.turnover);
    return [{ id: `sim-${String(i + 1).padStart(2, '0')}`, source: 'simulated' as const, strategy: `${s.account}/${s.id}`, strategyName: s.card.json.name, deposit: p.deposit, audit: null, ...r }];
  });

  const strategies: StrategyRow[] = market.strategies.map((s) => {
    const key = `${s.account}/${s.id}`, st = s.card.json.stats;
    const liveF = live.strategy === key ? [live] : [];
    const simF = sims.filter((x) => x.strategy === key);
    return {
      key, account: s.account, id: s.id, name: s.card.json.name, visibility: s.card.json.visibility, audit: s.audit?.opinion ?? null,
      sharpe: st.sharpe, oosSharpe: st.oos_sharpe, maxDrawdown: st.max_drawdown, totalReturn: st.total_return, feeBps: s.card.json.fee.bps, signals: s.signals.length,
      trustedLive: liveF.filter((x) => x.audit === 'clean').length, trustedSim: simF.length,
      fundsLive: liveF.reduce((a, x) => a + x.value, 0), fundsSim: simF.reduce((a, x) => a + x.value, 0),
    };
  });

  return { investors: [live, ...sims], strategies };
}
