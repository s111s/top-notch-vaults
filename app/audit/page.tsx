'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { audit, OPINION_TEXT } from '@/lib/engine';
import { explorerTx } from '@/lib/config';

function Inner() {
  const agent = useSearchParams().get('agent') || 'alpha-bot-demo.near';
  const [log, setLog] = useState<string[]>([]);
  const [r, setR] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  async function run() {
    setBusy(true); setR(null); setLog([]);
    try { setR(await audit(agent, (m) => setLog((l) => [...l.slice(-6), m]))); } catch (e) { setLog((l) => [...l, `Failed: ${(e as Error).message}`]); }
    setBusy(false);
  }
  return <>
    <div className="hero" style={{ paddingTop: 8 }}>
      <div className="eyebrow">Agent audit</div>
      <h1 style={{ fontSize: 32 }}>Did the agent do what it promised?</h1>
      <p className="lead" style={{ fontSize: 16 }}>Recompute the audit of <code>{agent}</code> in your browser from mainnet: every swap it signed, its NEAR Intents settlement, and the strategy's on-chain signals. Code decides the opinion; no AI is involved in this step.</p>
      <button onClick={run} disabled={busy}>{busy ? 'Auditing…' : 'Run the audit'}</button>
    </div>
    {log.length > 0 && !r && <section className="card"><pre>{log.join('\n')}</pre></section>}
    {r && <>
      <section className="card">
        <div className="row"><span className={`pill ${r.opinion === 'clean' ? 'ok' : 'bad'}`} style={{ fontSize: 15, padding: '4px 12px' }}>{r.opinion[0].toUpperCase() + r.opinion.slice(1)} opinion</span>
          <span className="hint">{r.trades.length} trades tested since the mandate, {r.findings.length} findings · report sha256 <code>{r.report_hash.slice(0, 16)}…</code></span></div>
        <p>{OPINION_TEXT[r.opinion]?.short}</p>
      </section>
      {r.trades.map((t: any) => <section className="card" key={t.tx}>
        <div className="spread"><h3 style={{ margin: 0 }}>#{t.n} · {t.in.symbol} → {t.out.symbol} · ${t.in.usd.toFixed(2)}</h3><a href={explorerTx(t.tx)} target="_blank" rel="noopener">{t.time.slice(0, 16).replace('T', ' ')} UTC</a></div>
        <ul className="checks" style={{ marginTop: 10 }}>{t.checks.map((c: any) => <li key={c.rule}><span className={`m ${c.pass ? 'ok' : 'bad'}`}>{c.pass ? '✓' : '✗'}</span><div><b>{c.rule}.</b> <span className="hint">{c.detail}</span></div></li>)}</ul>
      </section>)}
    </>}
  </>;
}
export default function AuditPage() { return <Suspense fallback={null}><Inner /></Suspense>; }
