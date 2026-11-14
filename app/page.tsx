'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DEMO_VAULT } from '@/lib/config';
import { loadVault, type VaultState } from '@/lib/vault';
import { loadMarket } from '@/lib/market';
import { asset } from '@/lib/config';

type Proof = { id: string; name: string; account: string; eq: number; bench: number; from: string; oos: number };
import { useWallet } from '@/lib/wallet';

const STACK = [
  { tag: 'NEAR Intents · 1Click', title: 'Every trade, best price, any chain\'s token', text: 'The agent swaps through the 1Click API. The researcher\'s and platform\'s fees are paid inside each swap with appFees: no billing system, no custody.' },
  { tag: 'NEAR smart contract', title: 'A vault only you can empty', text: 'Your vault is a NEAR account whose only full-access key is yours. Its Rust contract lets the agent call one method, swap, within your caps.' },
  { tag: 'NEAR AI Cloud · TEE', title: 'A note you can verify', text: 'Each day a model running in a trusted enclave writes what your agent did and signs it. Your browser checks the signature against the live attestation.' },
  { tag: 'NEAR registry', title: 'Track records that can\'t be backdated', text: 'Strategy cards, daily signals and audit reports are timestamped on-chain, append-only. Hidden logic is pinned by a hash.' },
];

export default function Home() {
  const { accountId, connect, ready } = useWallet();
  const [v, setV] = useState<VaultState | null>(null);
  const [proof, setProof] = useState<Proof[] | null>(null);
  useEffect(() => { loadVault(DEMO_VAULT).then(setV).catch(() => {}); }, []);
  // The profit case: each listed strategy's published curve, $100 vs simply holding NEAR.
  useEffect(() => {
    loadMarket().then(async (m) => {
      const rows = await Promise.all(m.strategies.map(async (s) => {
        const c = await fetch(asset(`/data/curve-${s.id}.json`)).then((r) => r.json()).catch(() => null);
        if (!c?.points?.length) return null;
        const last = c.points.at(-1);
        return { id: s.id, name: s.card.json.name, account: s.account, eq: last[1], bench: last[2], from: c.from, oos: s.card.json.stats.oos_sharpe } as Proof;
      }));
      setProof(rows.filter(Boolean).sort((a, b) => b!.eq - a!.eq) as Proof[]);
    }).catch(() => setProof([]));
  }, []);
  return <>
    <section className="hero">
      <div className="eyebrow">Built on NEAR Intents, NEAR AI Cloud and NEAR smart contracts</div>
      <h1>Grow your crypto with strategies that prove their profit, from a vault only you can withdraw from.</h1>
      <p className="lead">Pick a strategy ranked by its returns and its honesty checks. An AI agent trades your NEAR vault daily through NEAR Intents, can never take your money, and NEAR AI Cloud signs a note of every day's work.</p>
      <div className="row">
        <Link className="btn" href="/leaderboard/">See the top strategies</Link>
        <Link className="btn ghost" href="/vaults/">See live vaults</Link>
        <Link className="btn ghost" href="/lab/">Build one with AI</Link>
        {!accountId && <button className="ghost" onClick={connect} disabled={!ready}>Connect wallet</button>}
      </div>
    </section>

    <section className="card">
      <div className="spread"><h2 style={{ margin: 0 }}>What $100 did in each strategy</h2><Link href="/leaderboard/">Full leaderboard →</Link></div>
      <p className="hint" style={{ marginTop: 4 }}>From each strategy's published backtest on NEAR Intents prices, after fees, next to simply holding NEAR over the same days. The track record is timestamped on-chain, so it can't be rewritten later.</p>
      {proof ? <div className="tiles" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>{proof.map((p) => <Link key={p.id} href={`/strategy/?a=${encodeURIComponent(p.account)}&id=${encodeURIComponent(p.id)}`} className="stat" style={{ color: 'inherit' }}>
        <span className="k">{p.name}</span>
        <span className={`v ${p.eq >= 1 ? 'pos' : 'neg'}`}>$100 → ${(p.eq * 100).toFixed(0)}</span>
        <span className="m">Holding NEAR: ${(p.bench * 100).toFixed(0)} · since {p.from} · unseen-data Sharpe {p.oos.toFixed(2)}</span>
      </Link>)}</div> : <p className="hint">Reading strategies from the NEAR registry…</p>}
      <p className="hint" style={{ marginBottom: 0 }}>Backtests show the past, not a promise. That's why each one also shows its result on data it was never tuned on.</p>
    </section>

    <section className="card">
      <div className="spread"><h2 style={{ margin: 0 }}>Example vault, live on mainnet</h2><Link href="/vault/?id=vault-1.top-notch.near">Open the example vault →</Link></div>
      {v ? <div className="tiles" style={{ marginTop: 14 }}>
        <div className="tile"><b>${v.equity.toFixed(2)}</b><span>in <code>{v.id}</code></span></div>
        <div className="tile"><b>{v.fullKeys.length}</b><span>full-access key: the investor's</span></div>
        <div className="tile"><b>{v.swaps}</b><span>swaps by the agent via 1Click</span></div>
        <div className="tile"><b style={{ fontSize: 17 }}>{v.strategy.card?.json?.name ?? v.strategy.id}</b><span>strategy it follows</span></div>
      </div> : <p className="hint">Reading the vault from NEAR mainnet…</p>}
    </section>

    <h2 style={{ margin: '28px 0 12px' }}>How it works</h2>
    <ol className="steps">
      <li><h3>Pick a strategy</h3><p className="hint">Compare profit, drawdown and how many investors follow each strategy on the leaderboard. Each has an honest backtest and an independent audit.</p></li>
      <li><h3>Fund your vault</h3><p className="hint">Your vault is your own NEAR account. You set the tokens, the cap per trade and the trades per day. One vault is live on mainnet today; self-serve vault creation is next.</p></li>
      <li><h3>The agent trades</h3><p className="hint">Each day it reads the strategy's on-chain signal and rebalances through NEAR Intents. The researcher gets paid inside each swap.</p></li>
      <li><h3>You stay in control</h3><p className="hint">Read the signed daily note. Pause, switch strategy or withdraw from your wallet at any time. The agent can't stop you.</p></li>
    </ol>

    <h2 style={{ margin: '28px 0 12px' }}>The NEAR stack behind it</h2>
    <div className="stack">{STACK.map((s) => <div className="card" key={s.tag}><div className="tag">{s.tag}</div><h3 style={{ marginTop: 4 }}>{s.title}</h3><p className="hint" style={{ margin: 0 }}>{s.text}</p></div>)}</div>

    <section className="card" style={{ marginTop: 16 }}>
      <h2>For researchers: earn from every swap</h2>
      <p style={{ marginTop: 0 }}>New to trading? In the <Link href="/lab/">Lab</Link>, pick research-backed skills and NEAR AI Cloud writes the strategy and explains it, or write your own formula. Backtest it in your browser in seconds. Strategies that pass the quality checks are published to the on-chain registry, and every vault that follows one pays its researcher 20 bps of each swap, settled inside 1Click.</p>
    </section>
  </>;
}
