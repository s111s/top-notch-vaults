'use client';
// "Save as a strategy": publishes a strategy card to the top-notch.near registry from the researcher's
// own wallet, the same card format our researcher account uses. Public logic shows the formula; hidden
// logic publishes only sha256(formula | settings | salt), and the researcher keeps the formula and salt.
import Link from 'next/link';
import { useState } from 'react';
import { canonical, checkGates, logicCommit, sha256Hex } from '@/lib/alpha';
import { REGISTRY, asset, explorerTx } from '@/lib/config';
import { useWallet } from '@/lib/wallet';
import { UseInVault } from './UseInVault';

const r4 = (x: number) => Math.round(x * 1e4) / 1e4;
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32) || 'strategy';
const FEE_BPS = 20;

export function PublishStrategy({ r, expr, defaultName, defaultDesc }: { r: any; expr: string; defaultName?: string; defaultDesc?: string }) {
  const { accountId, connect, ready, call } = useWallet();
  const [name, setName] = useState(defaultName || 'My strategy');
  const [desc, setDesc] = useState(defaultDesc || '');
  const [vis, setVis] = useState<'public' | 'hidden'>('public');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: string; tx: string; salt?: string; signalTx?: string } | null>(null);
  const passed = checkGates(r).every((g) => g.pass);

  async function publish() {
    setBusy(true); setErr(null);
    try {
      const id = `${slug(name)}-${Date.now().toString(36).slice(-4)}`;
      const salt = vis === 'hidden' ? [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, '0')).join('') : 'public';
      const pricesText = await fetch(asset('/data/prices.json')).then((x) => x.text());
      const card = {
        kind: 'strategy', v: 1, id, name: name.trim().slice(0, 60), description: (desc.trim() || `Built in the Top Notch Lab: ${expr}`).slice(0, 280), visibility: vis,
        expression: vis === 'public' ? expr.trim() : undefined,
        logic_commit: await logicCommit(expr, r.settings, salt),
        settings: r.settings,
        data: { from: r.period.from, to: r.period.to, prices_sha256: await sha256Hex(pricesText) },
        stats: { sharpe: r4(r.stats.sharpe), fitness: r4(r.stats.fitness), max_drawdown: r4(r.stats.max_drawdown), turnover: r4(r.stats.turnover), total_return: r4(r.stats.total_return), oos_sharpe: r4(r.out_of_sample.sharpe), days: r.stats.days },
        fee: { recipient: accountId, bps: FEE_BPS },
        signals: 'daily, published to this registry by the researcher account',
      };
      const text = canonical(card);
      if (text.length > 2000) throw new Error('This strategy card is too long for the registry (2,000 bytes). Shorten the description or the formula.');
      const tx = await call({ receiverId: REGISTRY, method: 'publish_mandate', args: { mandate: text }, gasTgas: 30 });
      if (vis === 'hidden') {
        // The researcher must keep the formula and salt to prove the hash later; hand them a file.
        const blob = new Blob([JSON.stringify({ id, expression: expr.trim(), settings: r.settings, salt, logic_commit: card.logic_commit }, null, 1)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `top-notch-${id}-private.json`; a.click();
      }
      setDone({ id, tx, salt: vis === 'hidden' ? salt : undefined });
    } catch (e) { setErr(String((e as Error).message ?? e).slice(0, 240)); }
    setBusy(false);
  }

  // Today's target weights, signed by the researcher. A vault's agent trades toward the latest one.
  async function publishSignal() {
    if (!done) return;
    setBusy(true); setErr(null);
    try {
      const w: Record<string, number> = r.latest_signal.weights;
      const pricesText = await fetch(asset('/data/prices.json')).then((x) => x.text());
      const sig = { kind: 'signal', v: 1, id: done.id, date: r.latest_signal.date, weights: w, cash: r4(1 - Object.values(w).reduce((a, b) => a + b, 0)), prices_sha256: await sha256Hex(pricesText) };
      const tx = await call({ receiverId: REGISTRY, method: 'publish_mandate', args: { mandate: canonical(sig) }, gasTgas: 30 });
      setDone({ ...done, signalTx: tx });
    } catch (e) { setErr(String((e as Error).message ?? e).slice(0, 240)); }
    setBusy(false);
  }

  return (
    <section className="card" id="save" style={{ borderColor: 'var(--accent)' }}>
      <div className="eyebrow">Step 1 · Save it as a strategy</div>
      <h2 style={{ margin: '4px 0 6px' }}>Create your strategy on NEAR</h2>
      <p className="hint" style={{ marginTop: 0 }}>Publishes a strategy card to the <code>{REGISTRY}</code> registry from your own wallet: its name, settings and these backtest numbers, timestamped on-chain so the record can't be backdated. Vaults that follow it pay you {FEE_BPS} bps of each swap. One transaction, a tiny gas fee.</p>
      {!done ? <>
        <div className="grid g2" style={{ gap: 12 }}>
          <label className="hint">Name<input value={name} maxLength={60} onChange={(e) => setName(e.target.value)} style={{ width: '100%', marginTop: 4 }} /></label>
          <label className="hint">One-line description (optional)<input value={desc} maxLength={280} onChange={(e) => setDesc(e.target.value)} style={{ width: '100%', marginTop: 4 }} placeholder="What it does, in plain words" /></label>
        </div>
        <div className="grid g2" style={{ gap: 10, marginTop: 12 }}>
          <button className={vis === 'public' ? '' : 'ghost'} onClick={() => setVis('public')} style={{ display: 'block', textAlign: 'left', whiteSpace: 'normal' }}><div>Public logic</div><div style={{ fontWeight: 400, fontSize: 13, opacity: .85 }}>Anyone can read the formula. Easiest to trust and to audit.</div></button>
          <button className={vis === 'hidden' ? '' : 'ghost'} onClick={() => setVis('hidden')} style={{ display: 'block', textAlign: 'left', whiteSpace: 'normal' }}><div>Private logic</div><div style={{ fontWeight: 400, fontSize: 13, opacity: .85 }}>Only a hash of the formula goes on-chain. You download the formula and secret salt to keep; an auditor can check it later.</div></button>
        </div>
        {!passed && <div className="toast" style={{ marginTop: 12 }}>It doesn't pass every quality check yet. You can still save it, and its card shows the real numbers, but strong strategies get followed.</div>}
        <div className="row" style={{ marginTop: 12 }}>
          {!accountId ? <><button onClick={connect} disabled={!ready}>Connect wallet to save</button><span className="hint">Any NEAR wallet: HOT, Meteor, Intear, MyNearWallet…</span></>
            : <><button onClick={publish} disabled={busy || !name.trim()}>{busy ? 'Waiting for your wallet…' : 'Save strategy on NEAR'}</button><span className="hint">as <code>{accountId}</code></span></>}
        </div>
      </> : <>
        <div className="toast ok">Saved: <b>{name}</b> is on-chain as <code>{accountId}/{done.id}</code>. <a href={explorerTx(done.tx)} target="_blank" rel="noopener">View transaction</a> · <Link href={`/strategy/?a=${encodeURIComponent(accountId!)}&id=${encodeURIComponent(done.id)}`}>Open its page</Link>
          {done.salt && <> · Your private formula file was downloaded; keep it safe.</>}</div>
        <h3 style={{ marginTop: 16 }}>Step 2 · Publish today's signal</h3>
        <p className="hint" style={{ marginTop: 0 }}>A vault's agent trades toward your latest signal: today that's {Object.keys(r.latest_signal.weights).length ? Object.entries(r.latest_signal.weights as Record<string, number>).map(([k, v]) => `${k} ${(v * 100).toFixed(0)}%`).join(', ') : '100% USDC'}. Publish it now with one click. Automatic daily signals for Lab strategies are on our roadmap; until then you publish each day's signal from here.</p>
        {done.signalTx ? <div className="toast ok">Signal for {r.latest_signal.date} published. <a href={explorerTx(done.signalTx)} target="_blank" rel="noopener">View transaction</a></div>
          : <button onClick={publishSignal} disabled={busy}>{busy ? 'Waiting for your wallet…' : "Publish today's signal"}</button>}
        <h3 style={{ marginTop: 16 }}>Step 3 · Put it to work</h3>
        <UseInVault strategyKey={`${accountId}/${done.id}`} name={name} />
      </>}
      {err && <div className="toast bad">{err}</div>}
    </section>
  );
}
