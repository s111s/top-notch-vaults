'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { loadMarket, OPINION_LABEL } from '@/lib/market';
import { num, pct } from '@/lib/alpha';
import { useWallet } from '@/lib/wallet';
import { loadUsage, type Usage } from '@/lib/earnings';

export default function Strategies() {
  const [m, setM] = useState<Awaited<ReturnType<typeof loadMarket>> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const { accountId } = useWallet();
  const [u, setU] = useState<Record<string, Usage> | null>(null);
  useEffect(() => { loadMarket([accountId]).then((x) => { setM(x); loadUsage(x).then(setU).catch(() => setU({})); }).catch((e) => setErr(String(e.message ?? e))); }, [accountId]);
  const all = u ? Object.values(u) : [];
  const users = new Set(all.flatMap((x) => x.users));
  const mine = m && accountId ? m.strategies.filter((s) => s.account === accountId) : [];
  const researchers = m ? new Set(m.strategies.map((s) => s.account)).size : 0;
  const usd = (n: number) => (n > 0 && n < 0.01 ? `$${n.toFixed(4)}` : `$${n.toFixed(2)}`);
  return <>
    <div className="hero" style={{ paddingTop: 8 }}>
      <div className="eyebrow">Strategies</div>
      <h1 style={{ fontSize: 32 }}>Pick a strategy for your vault.</h1>
      <div className="row" style={{ marginBottom: 12 }}><Link className="btn" href="/lab/">+ Create a strategy</Link><span className="hint">Build one with NEAR AI or your own formula, then save it on-chain from your wallet.</span></div>
      <p className="lead" style={{ fontSize: 16 }}>Read live from the <code>top-notch.near</code> registry. Every card, signal and audit is timestamped on-chain, so no one can backdate a track record.</p>
    </div>
    {m && <section className="card">
      <h2 style={{ marginTop: 0 }}>Overview</h2>
      <div className="tiles" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
        <div className="stat"><span className="k">Strategies listed</span><span className="v">{m.strategies.length}</span><span className="m">from {researchers} researcher account{researchers === 1 ? '' : 's'}</span></div>
        <div className="stat"><span className="k">Vaults and agents following</span><span className="v">{u ? users.size : '…'}</span><span className="m">live on mainnet</span></div>
        <div className="stat"><span className="k">Swaps on their signals</span><span className="v">{u ? all.reduce((a, x) => a + x.swaps, 0) : '…'}</span><span className="m">{u ? usd(all.reduce((a, x) => a + x.volume, 0)) : ''} traded via 1Click</span></div>
        <div className="stat"><span className="k">Paid to researchers</span><span className="v pos">{u ? usd(all.reduce((a, x) => a + x.fees, 0)) : '…'}</span><span className="m">inside each swap</span></div>
      </div>
    </section>}
    <section className="card">
      <div className="spread"><h2 style={{ margin: 0 }}>My strategies</h2><Link href="/lab/">+ Create a strategy</Link></div>
      {!accountId ? <p className="hint">Connect your wallet to see the strategies you published, who uses them, what they earned, and to withdraw your fees.</p>
        : !m ? <p className="hint">Reading the registry…</p>
        : !mine.length ? <p className="hint"><code>{accountId}</code> hasn't published a strategy yet. Build one in the <Link href="/lab/">Lab</Link> and save it on-chain.</p>
        : <div className="tbl" style={{ marginTop: 8 }}><table><thead><tr><th>Strategy</th><th>Logic</th><th>Used by</th><th>Swaps</th><th>Earned</th><th></th></tr></thead><tbody>
          {mine.map((s) => { const k = `${s.account}/${s.id}`, x = u?.[k]; return <tr key={k}>
            <td><b>{s.card.json.name}</b><br /><span className="hint">{s.signals.length} signal{s.signals.length === 1 ? '' : 's'} published</span></td>
            <td>{s.card.json.visibility === 'hidden' ? 'Private' : 'Public'}</td><td>{x ? x.users.length : '…'}</td><td>{x ? x.swaps : '…'}</td><td className="pos">{x ? usd(x.fees) : '…'}</td>
            <td><Link href={`/strategy/?a=${encodeURIComponent(s.account)}&id=${encodeURIComponent(s.id)}#earnings`}>Manage →</Link></td></tr>; })}
        </tbody></table></div>}
    </section>
    <h2 style={{ margin: '20px 0 10px' }}>All strategies</h2>
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
          {u?.[`${s.account}/${s.id}`] && <p className="hint" style={{ marginTop: -6 }}>Used by <b>{u[`${s.account}/${s.id}`].users.length}</b> · {u[`${s.account}/${s.id}`].swaps} swaps · earned <b className="pos">{usd(u[`${s.account}/${s.id}`].fees)}</b></p>}
          <div className="row"><Link className="btn" href={`/strategy/?a=${encodeURIComponent(s.account)}&id=${encodeURIComponent(s.id)}&use=1`}>Use in my vault</Link><Link className="btn ghost" href={`/strategy/?a=${encodeURIComponent(s.account)}&id=${encodeURIComponent(s.id)}`}>Details</Link></div>
        </section>;
      })}
    </div>
  </>;
}
