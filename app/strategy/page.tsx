'use client';
import { Stat } from '@/components/LabResult';
import { UseInVault } from '@/components/UseInVault';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadMarket, OPINION_LABEL } from '@/lib/market';
import { GATES, num, pct } from '@/lib/alpha';
import { asset, explorerTx } from '@/lib/config';
import { Chart } from '@/components/Chart';

function Inner() {
  const q = useSearchParams();
  const acct = q.get('a') || 'researcher-1.top-notch.near', id = q.get('id') || 'eco-reversal';
  const [s, setS] = useState<any>(undefined);
  const [report, setReport] = useState<any>(null);
  const [curve, setCurve] = useState<any>(null);
  useEffect(() => {
    loadMarket([acct]).then((m) => setS(m.strategies.find((x) => x.account === acct && x.id === id) ?? null)).catch(() => setS(null));
    fetch(asset(`/data/strategy-report-${id}.json`)).then((r) => (r.ok ? r.json() : null)).then(setReport).catch(() => {});
    fetch(asset(`/data/curve-${id}.json`)).then((r) => (r.ok ? r.json() : null)).then(setCurve).catch(() => {});
  }, [acct, id]);
  if (s === undefined) return <section className="card skeleton">Reading the strategy from NEAR mainnet…</section>;
  if (s === null) return <section className="card">Strategy not found on-chain.</section>;
  const c = s.card.json, st = c.stats;
  const gs = { sharpe: st.sharpe, fitness: st.fitness, max_drawdown: st.max_drawdown, turnover: st.turnover };
  return <>
    <div className="hero" style={{ paddingTop: 8 }}>
      <div className="eyebrow">{c.visibility === 'hidden' ? 'Hidden logic' : 'Public logic'} · by {acct}</div>
      <h1 style={{ fontSize: 32 }}>{c.name}</h1>
      <p className="lead" style={{ fontSize: 16 }}>{c.description}</p>
      <div className="row"><a className="btn" href="#use">Use in my vault</a><Link className="btn ghost" href="/vaults/">See vaults</Link><span className="hint">{c.fee.bps} bps per follower swap to the researcher, paid inside 1Click</span></div>
    </div>
    <section className="card"><UseInVault strategyKey={`${acct}/${c.id}`} name={c.name} /></section>
    <section className="card">
      <h2>Backtest ({c.data.from} → {c.data.to}, {st.days} days, fees included)</h2>
      <div className="tiles">
        <Stat k="Sharpe ratio" v={num(st.sharpe)} m="Return per unit of risk. Above 1 is good." />
        <Stat k="Fitness" v={num(st.fitness)} m="Sharpe adjusted for returns and trading cost." />
        <Stat k="Max drawdown" v={pct(st.max_drawdown)} cls="neg" m="The worst fall from a peak." />
        <Stat k="Turnover" v={pct(st.turnover)} m="Share of the money traded per day." />
        <Stat k="Total return" v={pct(st.total_return, 0)} cls={st.total_return >= 0 ? 'pos' : 'neg'} m="Over the whole backtest, after fees." />
        <Stat k="Unseen-data Sharpe" v={num(st.oos_sharpe)} cls={st.oos_sharpe >= 0 ? 'pos' : 'neg'} m="On the last 30% of days. The most honest test." />
      </div>
      {curve && <div style={{ marginTop: 14 }}><Chart split={curve.split_at} series={[
        { label: 'hold NEAR', color: 'var(--muted)', width: 1.5, points: curve.points.map((p: any) => [p[0], p[2]]) },
        { label: 'strategy', color: 'var(--accent)', points: curve.points.map((p: any) => [p[0], p[1]]) }]} /></div>}
      <div className="row" style={{ marginTop: 10 }}>{GATES.map((g: any) => { const ok = g.test(gs, { out_of_sample: { sharpe: st.oos_sharpe } }); return <span key={g.label} className={`pill ${ok ? 'ok' : 'bad'}`}>{ok ? '✓' : '✗'} {g.label}</span>; })}</div>
    </section>
    <section className="card">
      <h2>Logic</h2>
      {c.visibility === 'public' ? <><pre>{c.expression}</pre><p className="hint">Public. <Link href={`/lab/?e=${encodeURIComponent(c.expression)}`}>Open it in the Lab</Link> to rerun it.</p></>
        : <><p style={{ marginTop: 0 }}>Hidden. Only its commitment is on-chain: <code>{c.logic_commit}</code></p><p className="hint">sha256 of (expression | settings | secret salt). The researcher can't change the logic without changing this hash, and the auditor checks every signal against it.</p></>}
    </section>
    <section className="card">
      <h2>Auditor's opinion</h2>
      {s.audit && report ? <>
        <div className="row"><span className={`pill ${s.audit.opinion === 'clean' ? 'ok' : 'bad'}`} style={{ fontSize: 14, padding: '4px 12px' }}>{OPINION_LABEL[s.audit.opinion]} opinion</span>
          <span className="hint">report hash <code>{s.audit.report_hash.slice(0, 16)}…</code> on-chain at block {s.audit.block_height}{report.publish_tx && <> · <a href={explorerTx(report.publish_tx)} target="_blank" rel="noopener">tx</a></>}</span></div>
        <ul className="checks" style={{ marginTop: 12 }}>{report.checks.map((k: any) => <li key={k.test}><span className={`m ${k.pass ? 'ok' : 'bad'}`}>{k.pass ? '✓' : '✗'}</span><div><b>{k.test}.</b> <span className="hint">{k.detail}</span></div></li>)}</ul>
        {report.letter?.text && <><p className="letter" style={{ marginTop: 12 }}>{report.letter.text.replace(/\*\*/g, '')}</p><p className="hint">Written and signed inside NEAR AI Cloud's TEE by <code>{report.letter.model}</code>, signer <code>{report.letter.signing_address}</code>. Code decided the opinion first; the letter can't change it.</p></>}
      </> : <p className="hint">Not audited yet.</p>}
    </section>
    <section className="card">
      <h2>Signals on-chain ({s.signals.length})</h2>
      <div className="tbl"><table><thead><tr><th>Candle</th><th>Target weights</th><th>Published (UTC)</th></tr></thead><tbody>
        {[...s.signals].reverse().map((g: any) => <tr key={g.hash}><td>{g.json.date}</td><td>{Object.keys(g.json.weights).length ? Object.entries(g.json.weights as Record<string, number>).map(([k, v]) => `${k} ${(v * 100).toFixed(0)}%`).join(', ') : '100% USDC'}</td><td>{new Date(g.ms).toISOString().slice(0, 16).replace('T', ' ')} · block {g.block_height}</td></tr>)}
      </tbody></table></div>
    </section>
  </>;
}
export default function StrategyPage() { return <Suspense fallback={<section className="card skeleton">Loading…</section>}><Inner /></Suspense>; }
