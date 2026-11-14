'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { INVESTOR_WEIGHTS, STRATEGY_WEIGHTS, loadLeaderboards, scoreInvestors, scoreStrategies, type InvestorRow, type StrategyRow } from '@/lib/leaderboard';
import { explorerAccount } from '@/lib/config';

type Data = Awaited<ReturnType<typeof loadLeaderboards>>;
const money = (n: number) => `${n < 0 ? '−' : ''}$${Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: Math.abs(n) < 100 ? 2 : 0 })}`;
const pc = (n: number, d = 1) => `${n > 0 ? '+' : ''}${(n * 100).toFixed(d)}%`;
const Tag = ({ s }: { s: 'live' | 'simulated' }) => <span className={`pill ${s === 'live' ? 'ok' : ''}`}>{s === 'live' ? 'Live on mainnet' : 'Simulated'}</span>;

type SCol = { key: string; label: string; get: (r: StrategyRow, sim: boolean) => number; fmt: (r: StrategyRow, sim: boolean) => React.ReactNode; asc?: boolean };
const SCOLS: SCol[] = [
  { key: 'score', label: 'Top Notch score', get: (r) => r.score ?? 0, fmt: (r) => <b>{r.score}</b> },
  { key: 'trusted', label: 'Trusted investors', get: (r, s) => r.trustedLive + (s ? r.trustedSim : 0), fmt: (r, s) => <>{r.trustedLive}{s && r.trustedSim ? <span className="hint"> + {r.trustedSim} sim</span> : null}</> },
  { key: 'funds', label: 'Funds invested', get: (r, s) => r.fundsLive + (s ? r.fundsSim : 0), fmt: (r, s) => <>{money(r.fundsLive)}{s && r.fundsSim ? <span className="hint"> + {money(r.fundsSim)} sim</span> : null}</> },
  { key: 'dd', label: 'Lowest drawdown', get: (r) => r.maxDrawdown, fmt: (r) => <span className="neg">{pc(r.maxDrawdown)}</span> },
  { key: 'sharpe', label: 'Sharpe', get: (r) => r.sharpe, fmt: (r) => r.sharpe.toFixed(2) },
  { key: 'oos', label: 'Out-of-sample Sharpe', get: (r) => r.oosSharpe, fmt: (r) => <span className={r.oosSharpe >= 0 ? 'pos' : 'neg'}>{r.oosSharpe.toFixed(2)}</span> },
  { key: 'ret', label: 'Backtest return', get: (r) => r.totalReturn, fmt: (r) => pc(r.totalReturn, 0) },
];

type ICol = { key: string; label: string; get: (r: InvestorRow) => number; fmt: (r: InvestorRow) => React.ReactNode };
const ICOLS: ICol[] = [
  { key: 'score', label: 'Top Notch score', get: (r) => r.score ?? 0, fmt: (r) => <b title={`confidence ${((r.confidence ?? 0) * 100).toFixed(0)}%`}>{r.score}</b> },
  { key: 'profitPct', label: 'Profit %', get: (r) => r.profitPct, fmt: (r) => <span className={r.profitPct >= 0 ? 'pos' : 'neg'}>{pc(r.profitPct)}</span> },
  { key: 'profitUsd', label: 'Profit $', get: (r) => r.profitUsd, fmt: (r) => <span className={r.profitUsd >= 0 ? 'pos' : 'neg'}>{money(r.profitUsd)}</span> },
  { key: 'traded', label: 'Amount traded', get: (r) => r.traded, fmt: (r) => <>{money(r.traded)} <span className="hint">· {r.trades} swaps</span></> },
  { key: 'winRate', label: 'Win rate', get: (r) => r.winRate, fmt: (r) => `${(r.winRate * 100).toFixed(0)}%` },
  { key: 'dd', label: 'Max drawdown', get: (r) => r.maxDrawdown, fmt: (r) => <span className="neg">{pc(r.maxDrawdown)}</span> },
];

export default function Leaderboard() {
  const [d, setD] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<'strategies' | 'investors'>('strategies');
  const [sim, setSim] = useState(true);
  const [sSort, setSSort] = useState('score');
  const [iSort, setISort] = useState('score');
  useEffect(() => { loadLeaderboards().then(setD).catch((e) => setErr(String(e.message ?? e))); }, []);

  const strategies = useMemo(() => {
    if (!d) return [];
    const col = SCOLS.find((c) => c.key === sSort)!;
    return scoreStrategies(d.strategies, sim).sort((a, b) => col.get(b, sim) - col.get(a, sim));
  }, [d, sim, sSort]);
  const investors = useMemo(() => {
    if (!d) return [];
    const col = ICOLS.find((c) => c.key === iSort)!;
    return scoreInvestors(d.investors.filter((r) => sim || r.source === 'live')).sort((a, b) => col.get(b) - col.get(a));
  }, [d, sim, iSort]);

  return <>
    <div className="hero" style={{ paddingTop: 8 }}>
      <div className="eyebrow">Leaderboard</div>
      <h1 style={{ fontSize: 32 }}>Find the strategies that actually make money.</h1>
      <p className="lead" style={{ fontSize: 16 }}>Rank strategies and investors by profit, drawdown, investors or win rate, or by the Top Notch score, which weighs them all and discounts thin track records so luck doesn't win. Live rows are read from NEAR mainnet as you load the page.</p>
      <div className="row">
        <button className={tab === 'strategies' ? '' : 'ghost'} onClick={() => setTab('strategies')}>Top strategies</button>
        <button className={tab === 'investors' ? '' : 'ghost'} onClick={() => setTab('investors')}>Top investors</button>
        <label className="row hint" style={{ gap: 6, marginLeft: 8 }}><input type="checkbox" checked={sim} onChange={(e) => setSim(e.target.checked)} /> Include simulated vaults</label>
      </div>
    </div>

    <section className="card hint" style={{ fontSize: 14 }}>
      <b style={{ color: 'var(--ink)' }}>What's real here.</b> Strategies, their stats, signals and audits are all live from the <code>top-notch.near</code> registry. One investor vault is live on mainnet today: <code>vault-1.top-notch.near</code>. Rows tagged <b>Simulated</b> are vaults that would have followed a real strategy from the date shown, computed from that strategy's published backtest. They are there so the ranking can be judged with more than one vault. Untick the box to hide them.
    </section>

    {err && <section className="card">Could not load: {err}</section>}
    {!d && !err && <section className="card skeleton">Reading the registry, the vault and 1Click prices…</section>}

    {d && tab === 'strategies' && <section className="card">
      <div className="row" style={{ marginBottom: 12 }}><span className="hint">Rank by</span>{SCOLS.map((c) => <button key={c.key} className={sSort === c.key ? '' : 'ghost'} style={{ padding: '5px 10px', fontSize: 13 }} onClick={() => setSSort(c.key)}>{c.label}</button>)}</div>
      <div className="tbl"><table><thead><tr><th>#</th><th>Strategy</th>{SCOLS.map((c) => <th key={c.key} style={{ cursor: 'pointer', color: sSort === c.key ? 'var(--ink)' : undefined }} onClick={() => setSSort(c.key)}>{c.label}{sSort === c.key ? ' ↓' : ''}</th>)}</tr></thead><tbody>
        {strategies.map((r, i) => <tr key={r.key}><td>{i + 1}</td>
          <td><Link href={`/strategy/?a=${encodeURIComponent(r.account)}&id=${encodeURIComponent(r.id)}`}><b>{r.name}</b></Link><div className="hint">{r.visibility === 'hidden' ? 'hidden logic' : 'public logic'} · {r.audit ? `${r.audit} audit` : 'not audited'} · {r.feeBps} bps</div></td>
          {SCOLS.map((c) => <td key={c.key}>{c.fmt(r, sim)}</td>)}</tr>)}
      </tbody></table></div>
      <h3 style={{ marginTop: 18 }}>How the strategy score works</h3>
      <p className="hint" style={{ marginTop: 0 }}>Each stat is ranked against the other strategies (0 = worst, 1 = best), then weighted: {STRATEGY_WEIGHTS.map((w) => `${w.label} ${Math.round(w.w * 100)}%`).join(', ')}. The audit counts absolutely: Clean 1, Qualified 0.5, otherwise 0. Unseen-data performance and drawdown carry the most weight, because a great backtest that fails on new data is the classic trap. "Trusted investors" are vaults whose agent passed its audit.</p>
    </section>}

    {d && tab === 'investors' && <section className="card">
      <div className="row" style={{ marginBottom: 12 }}><span className="hint">Rank by</span>{ICOLS.map((c) => <button key={c.key} className={iSort === c.key ? '' : 'ghost'} style={{ padding: '5px 10px', fontSize: 13 }} onClick={() => setISort(c.key)}>{c.label}</button>)}</div>
      <div className="tbl"><table><thead><tr><th>#</th><th>Vault</th>{ICOLS.map((c) => <th key={c.key} style={{ cursor: 'pointer', color: iSort === c.key ? 'var(--ink)' : undefined }} onClick={() => setISort(c.key)}>{c.label}{iSort === c.key ? ' ↓' : ''}</th>)}</tr></thead><tbody>
        {investors.map((r, i) => <tr key={r.id}><td>{i + 1}</td>
          <td>{r.source === 'live' ? <Link href={`/vault/?id=${encodeURIComponent(r.id)}`}><b>{r.id}</b></Link> : <b>{r.id}</b>} <Tag s={r.source} />
            <div className="hint">{r.strategyName} · since {r.since} ({r.days}d) · {money(r.deposit)} in{r.source === 'live' && <> · <a href={explorerAccount(r.id)} target="_blank" rel="noopener">NearBlocks</a></>}</div></td>
          {ICOLS.map((c) => <td key={c.key}>{c.fmt(r)}</td>)}</tr>)}
      </tbody></table></div>
      <h3 style={{ marginTop: 18 }}>How the investor score works</h3>
      <p className="hint" style={{ marginTop: 0 }}>Each stat is ranked against the other vaults, then weighted: {INVESTOR_WEIGHTS.map((w) => `${w.label} ${Math.round(w.w * 100)}%`).join(', ')}. Dollar amounts use a log scale so size alone can't buy the top spot. Then the score is pulled toward 50 by how little evidence there is: confidence = days ÷ (days + 30) × swaps ÷ (swaps + 10). That's why a vault with a big profit after a few days and a handful of swaps ranks below one with steady results over months. Live win rate = share of the agent's buys now worth more than they cost; simulated win rate = share of up days among days it held tokens.</p>
    </section>}
  </>;
}
