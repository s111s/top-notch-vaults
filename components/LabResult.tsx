'use client';
// Lab backtest result: labelled stats, which coins it trades, an interactive chart and what to do next.
import Link from 'next/link';
import { checkGates, num, pct } from '@/lib/alpha';
import { InteractiveChart } from '@/components/InteractiveChart';
import type { Meta } from '@/components/AIBuilder';

export function Stat({ k, v, m, cls }: { k: string; v: string; m: string; cls?: string }) {
  return <div className="stat"><span className="k">{k}</span><span className={`v ${cls ?? ''}`}>{v}</span><span className="m">{m}</span></div>;
}

export function LabResult({ r, meta, copied, onCopy }: { r: any; meta: Meta | null; expr: string; copied: boolean; onCopy: () => void }) {
  const s = r.stats, o = r.out_of_sample;
  const end = r.daily.at(-1);
  const syms: string[] = r.syms;
  const universe: string[] = r.settings.universe ?? syms;
  const w: Record<string, number> = r.latest_signal?.weights ?? {};
  const n = r.daily.length;
  const held = syms.map((c, i) => ({ c, days: r.daily.filter((d: any) => d.weights[i] > 0).length })).filter((x) => universe.includes(x.c)).sort((a, b) => b.days - a.days);
  const cashDays = r.daily.filter((d: any) => !d.weights.some((x: number) => x > 0)).length;
  const gates = checkGates(r);
  const passed = gates.every((g) => g.pass);
  const topN = r.settings.top_n;
  const beat = end.equity > end.bench;

  return <>
    <section className="card" id="result">
      <div className="eyebrow">Backtest · {r.period.from} to {r.period.to} · {n} days</div>
      <h2 style={{ margin: '4px 0 6px' }}>{meta?.name ? `${meta.name}: ` : ''}$100 became ${(end.equity * 100).toFixed(0)}. Holding NEAR: ${(end.bench * 100).toFixed(0)}.</h2>
      <p className="hint" style={{ marginTop: 0 }}>{beat ? 'It beat simply holding NEAR over this period.' : 'It did not beat simply holding NEAR over this period.'} Costs of 0.35% per trade are already taken off.</p>
      <div className="tiles" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))' }}>
        <Stat k="Total return" v={pct(s.total_return)} cls={s.total_return >= 0 ? 'pos' : 'neg'} m={`Holding NEAR: ${pct(end.bench - 1)}`} />
        <Stat k="Sharpe ratio" v={num(s.sharpe)} m="Return per unit of risk. Above 1 is good, above 2 is great." />
        <Stat k="Max drawdown" v={pct(s.max_drawdown)} cls="neg" m="The worst fall from a peak. Closer to 0 is safer." />
        <Stat k="Unseen-data Sharpe" v={num(o.sharpe)} cls={o.sharpe >= 0 ? 'pos' : 'neg'} m="Sharpe on the last 30% of days. The most honest test." />
        <Stat k="Win rate" v={pct(s.win_rate, 0)} m="Share of days that made money (cash days count as flat)." />
        <Stat k="Turnover" v={pct(s.turnover, 0)} m="Share of the money traded per day. More trading, more fees." />
        <Stat k="Days in cash" v={pct(cashDays / n, 0)} m="Days it sat fully in USDC because no coin scored above 0." />
      </div>

      <div style={{ marginTop: 18 }}><InteractiveChart daily={r.daily} syms={syms} split={r.daily[Math.floor(n * 0.7)]?.date} label={meta?.name || 'Your strategy'} /></div>

      <div className="row" style={{ marginTop: 12 }}>{gates.map((g) => <span key={g.label} className={`pill ${g.pass ? 'ok' : 'bad'}`}>{g.pass ? '✓' : '✗'} {g.label}</span>)}</div>
    </section>

    <section className="card">
      <h2 style={{ marginTop: 0 }}>Which coins does it trade?</h2>
      <p className="hint" style={{ marginTop: 0 }}>A strategy here is not for one coin. Every day it scores each coin below with the formula and holds the top {topN} whose score is above 0, at up to {Math.round(Math.min(r.settings.max_weight, 1 / topN) * 100)}% each. The rest stays in USDC.</p>
      <div className="grid g2" style={{ gap: 20 }}>
        <div>
          <h3>Coins it may trade ({universe.length})</h3>
          <div className="coins">{universe.map((c) => <span key={c} className={`coin ${w[c] ? 'on' : ''}`} style={{ cursor: 'default' }}>{c}{w[c] ? ` ${(w[c] * 100).toFixed(0)}%` : ''}</span>)}</div>
          <h3 style={{ marginTop: 14 }}>Holding now</h3>
          <p style={{ margin: 0 }}>{Object.keys(w).length ? Object.entries(w).map(([k, v]) => `${k} ${(v * 100).toFixed(0)}%`).join(', ') + (Object.values(w).reduce((a, b) => a + b, 0) < 0.995 ? ', rest in USDC' : '') : '100% USDC: no coin scores above 0 today.'}</p>
          <p className="hint" style={{ marginTop: 4 }}>Target set from the {r.latest_signal.date} daily close. Highlighted coins above are the ones held.</p>
        </div>
        <div>
          <h3>How often it held each coin</h3>
          <div style={{ display: 'grid', gap: 6 }}>{held.map((x) => <div key={x.c} className="holdbar"><span>{x.c}</span><span className="t"><i style={{ width: `${(x.days / n) * 100}%` }} /></span><span className="hint" style={{ textAlign: 'right' }}>{Math.round((x.days / n) * 100)}%</span></div>)}
            <div className="holdbar"><span className="hint">USDC only</span><span className="t"><i style={{ width: `${(cashDays / n) * 100}%`, background: 'var(--muted)' }} /></span><span className="hint" style={{ textAlign: 'right' }}>{Math.round((cashDays / n) * 100)}%</span></div>
          </div>
        </div>
      </div>
    </section>

    <section className="card" style={{ borderColor: 'var(--accent)' }}>
      <div className="eyebrow">What happens next</div>
      <h2 style={{ margin: '4px 0 10px' }}>You have a formula. Here's how it becomes a working strategy.</h2>
      <ol className="steps" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <li><h3>How it trades</h3><p className="hint">Once a day, after the 00:00 UTC close, the agent runs this formula on fresh NEAR Intents prices, picks the top {topN} coins and swaps to them through 1Click. When nothing scores above 0, it moves to USDC. No one picks trades by hand.</p></li>
        <li><h3>Is it good enough?</h3><p className="hint">{passed ? 'It passes every quality check, so it can be listed.' : `It fails ${gates.filter((g) => !g.pass).length} of ${gates.length} quality checks, so it can't be listed yet. Try another style, skill or risk level.`} Trust the unseen-data Sharpe most: a strategy that only works on the days it was built on is luck.</p></li>
        <li><h3>Publish it, earn on every swap</h3><p className="hint">A passing strategy is published to the <code>top-notch.near</code> registry with a <code>publish_mandate</code> call, logic public or hidden behind a hash, and audited. Every vault that follows it pays you 20 bps of each swap. Publishing from this page is next on our roadmap; see the <Link href="/strategies/">live strategies</Link> for what a listing looks like.</p></li>
        <li><h3>Or invest with it</h3><p className="hint">Investors fund a <Link href="/vault/">vault</Link> only they can withdraw from and point it at a listed strategy (one is live on mainnet today; self-serve vaults are next). The agent trades it daily and NEAR AI Cloud signs a note on what it did. Compare strategies on the <Link href="/leaderboard/">leaderboard</Link>.</p></li>
      </ol>
      <div className="row" style={{ marginTop: 12 }}><button className="ghost" onClick={onCopy}>{copied ? 'Link copied' : 'Copy a link to this formula'}</button><Link className="btn ghost" href="/strategies/">Browse live strategies</Link></div>
      <p className="hint" style={{ marginBottom: 0 }}>Backtests show the past. Past results don't promise future ones.</p>
    </section>
  </>;
}
