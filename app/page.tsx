'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DEMO_VAULT } from '@/lib/config';
import { loadVault, type VaultState } from '@/lib/vault';
import { useWallet } from '@/lib/wallet';

const STACK = [
  { tag: 'NEAR Intents · 1Click', title: 'Every trade, any token', text: 'The agent swaps through the 1Click API. The researcher\'s and platform\'s fees are paid inside each swap with appFees: no billing system, no custody.' },
  { tag: 'NEAR smart contract', title: 'A vault only you can empty', text: 'Your vault is a NEAR account whose only full-access key is yours. Its Rust contract lets the agent call one method, swap, within your caps.' },
  { tag: 'NEAR AI Cloud · TEE', title: 'A note you can verify', text: 'Each day a model running in a trusted enclave writes what your agent did and signs it. Your browser checks the signature against the live attestation.' },
  { tag: 'NEAR registry', title: 'Track records that can\'t be backdated', text: 'Strategy cards, daily signals and audit reports are timestamped on-chain, append-only. Hidden logic is pinned by a hash.' },
];

export default function Home() {
  const { accountId, connect, ready } = useWallet();
  const [v, setV] = useState<VaultState | null>(null);
  useEffect(() => { loadVault(DEMO_VAULT).then(setV).catch(() => {}); }, []);
  return <>
    <section className="hero">
      <div className="eyebrow">Built on NEAR Intents, NEAR AI Cloud and NEAR contracts</div>
      <h1>Run a proven trading strategy from a vault only you can withdraw from.</h1>
      <p className="lead">Pick a strategy with an audited track record. Fund your own NEAR vault. An AI agent trades it through NEAR Intents, can never take your money, and every day NEAR AI Cloud signs a note of what it did.</p>
      <div className="row">
        <Link className="btn" href="/vault/">See a live vault</Link>
        <Link className="btn ghost" href="/leaderboard/">See the leaderboard</Link>
        {!accountId && <button className="ghost" onClick={connect} disabled={!ready}>Connect wallet</button>}
      </div>
    </section>

    <section className="card">
      <div className="spread"><h2 style={{ margin: 0 }}>Live on mainnet right now</h2><Link href="/vault/">Open the vault →</Link></div>
      {v ? <div className="tiles" style={{ marginTop: 14 }}>
        <div className="tile"><b>${v.equity.toFixed(2)}</b><span>in <code>{v.id}</code></span></div>
        <div className="tile"><b>{v.fullKeys.length}</b><span>full-access key: the investor's</span></div>
        <div className="tile"><b>{v.swaps}</b><span>swaps by the agent via 1Click</span></div>
        <div className="tile"><b style={{ fontSize: 17 }}>{v.strategy.card?.json?.name ?? v.strategy.id}</b><span>strategy it follows</span></div>
      </div> : <p className="hint">Reading the vault from NEAR mainnet…</p>}
    </section>

    <h2 style={{ margin: '28px 0 12px' }}>How it works</h2>
    <ol className="steps">
      <li><h3>Pick a strategy</h3><p className="hint">Researchers publish formula strategies with honest backtests and an independent audit. Logic can be public or hidden behind a hash.</p></li>
      <li><h3>Fund your vault</h3><p className="hint">Your vault is your own NEAR account. You set the tokens, the cap per trade and the trades per day.</p></li>
      <li><h3>The agent trades</h3><p className="hint">Each day it reads the strategy's on-chain signal and rebalances through NEAR Intents. The researcher gets paid inside each swap.</p></li>
      <li><h3>You stay in control</h3><p className="hint">Read the signed daily note. Pause, switch strategy or withdraw from your wallet at any time. The agent can't stop you.</p></li>
    </ol>

    <h2 style={{ margin: '28px 0 12px' }}>The NEAR stack behind it</h2>
    <div className="stack">{STACK.map((s) => <div className="card" key={s.tag}><div className="tag">{s.tag}</div><h3 style={{ marginTop: 4 }}>{s.title}</h3><p className="hint" style={{ margin: 0 }}>{s.text}</p></div>)}</div>

    <section className="card" style={{ marginTop: 16 }}>
      <h2>For researchers</h2>
      <p style={{ marginTop: 0 }}>Write a formula like <code>rank(ts_mean(returns, 14)) - 0.5</code> in the <Link href="/lab/">Lab</Link>, backtest it on NEAR Intents prices in your browser, and publish it. Every vault that follows it pays you 20 bps of each swap, settled by 1Click.</p>
    </section>
  </>;
}
