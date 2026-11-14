'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { loadMarket, OPINION_LABEL } from '@/lib/market';
import { num, pct } from '@/lib/alpha';

export default function Strategies() {
  const [m, setM] = useState<Awaited<ReturnType<typeof loadMarket>> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { loadMarket().then(setM).catch((e) => setErr(String(e.message ?? e))); }, []);
  return <>
    <div className="hero" style={{ paddingTop: 8 }}>
      <div className="eyebrow">Strategies</div>
      <h1 style={{ fontSize: 32 }}>Pick a strategy for your vault.</h1>
      <p className="lead" style={{ fontSize: 16 }}>Read live from the <code>top-notch.near</code> registry. Every card, signal and audit is timestamped on-chain, so no one can backdate a track record.</p>
    </div>
    {err && <section className="card">Could not read the registry: {err}</section>}
    {!m && !err && <section className="card skeleton">Reading the registry on NEAR mainnet…</section>}
    <div className="grid g3">
      {m?.strategies.map((s) => {
        const c = s.card.json, st = c.stats;
        return <section className="card" key={`${s.account}/${s.id}`} style={{ margin: 0 }}>
          <div className="spread"><span className={`pill ${c.visibility === 'hidden' ? '' : 'ok'}`}>{c.visibility === 'hidden' ? 'hidden logic' : 'public logic'}</span>
            {s.audit && <span className={`pill ${s.audit.opinion === 'clean' ? 'ok' : 'bad'}`}>{OPINION_LABEL[s.audit.opinion]} audit</span>}</div>
          <h2 style={{ margin: '10px 0 4px' }}><Link href={`/strategy/?a=${encodeURIComponent(s.account)}&id=${encodeURIComponent(s.id)}`}>{c.name}</Link></h2>
          <p className="hint" style={{ marginTop: 0 }}>{c.description}</p>
          <div className="tiles">
            <div className="tile"><span>Sharpe</span><b>{num(st.sharpe)}</b></div>
            <div className="tile"><span>Max drawdown</span><b className="neg">{pct(st.max_drawdown)}</b></div>
            <div className="tile"><span>Unseen-data Sharpe</span><b className={st.oos_sharpe >= 0 ? 'pos' : 'neg'}>{num(st.oos_sharpe)}</b></div>
          </div>
          <p className="hint">{c.fee.bps} bps per swap to <code>{s.account}</code> · {s.followers.length} vault agent{s.followers.length === 1 ? '' : 's'} following · {s.signals.length} signals on-chain</p>
        </section>;
      })}
    </div>
  </>;
}
