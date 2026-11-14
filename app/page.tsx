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

    <h2 style={{ margin: '8px 0 12px' }}>Two ways to profit on NEAR</h2>
    <div className="grid g2" style={{ marginBottom: 16 }}>
      <section className="card" style={{ margin: 0, borderColor: 'var(--accent)' }}>
        <div className="eyebrow">For investors</div>
        <h3 style={{ margin: '4px 0 6px', fontSize: 20 }}>Grow your crypto, keep your keys</h3>
        <p className="hint" style={{ margin: 0 }}>Pick a strategy by its proven returns, point your vault at it, and an AI agent rebalances it daily through <b>NEAR Intents</b>. The vault is your own NEAR account: the agent can only swap within your caps, and you can pause or withdraw at any time. <b>NEAR AI Cloud</b> signs a daily note of what it did.</p>
        <div className="row" style={{ marginTop: 10 }}><Link className="btn" href="/leaderboard/">Find a strategy</Link><Link className="btn ghost" href="/vault/">My vault</Link></div>
      </section>
      <section className="card" style={{ margin: 0, borderColor: 'var(--accent)' }}>
        <div className="eyebrow">For researchers</div>
        <h3 style={{ margin: '4px 0 6px', fontSize: 20 }}>Earn on every swap your strategy makes</h3>
        <p className="hint" style={{ margin: 0 }}>Build a strategy with <b>NEAR AI Cloud</b> or your own formula, backtest it in seconds, and save it on the <b>NEAR registry</b> from your wallet. Every vault that follows it pays you 20 bps of each swap, inside the <b>1Click</b> swap itself, with no invoices. Your track record is timestamped on-chain.</p>
        <div className="row" style={{ marginTop: 10 }}><Link className="btn" href="/lab/">Create a strategy</Link><Link className="btn ghost" href="/strategies/">My strategies</Link></div>
      </section>
    </div>

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
      <h2 style={{ marginTop: 0 }}>Where we are</h2>
      <p className="hint" style={{ marginTop: 0 }}><b style={{ color: 'var(--ink)' }}>Our goal:</b> a marketplace where anyone can follow a strategy with a provable track record from a vault only they control, and where the people who build strategies earn from every trade. All of it runs on NEAR.</p>
      <div className="grid g2" style={{ gap: 20 }}>
        <div><h3>Live on NEAR mainnet today</h3><ul className="hint" style={{ paddingLeft: 18, margin: 0, display: 'grid', gap: 4 }}>
          <li>A real investor vault (<Link href="/vault/?id=vault-1.top-notch.near">example vault</Link>): owner-only withdraw, pause and strategy switch from your wallet</li>
          <li>The agent's real swaps through NEAR Intents 1Click, with researcher and platform fees paid inside each swap</li>
          <li>Strategy cards, daily signals and audits on the <code>top-notch.near</code> registry</li>
          <li>Build with AI on NEAR AI Cloud: 5 free per activated wallet, frontier model for 0.01 NEAR, signatures verified in your browser</li>
          <li>Save your strategy on-chain from the Lab, publish its signal, use it in your vault</li>
          <li>Leaderboards, strategy usage and earnings, owner-only fee withdrawal from NEAR Intents</li>
        </ul></div>
        <div><h3>Next</h3><ul className="hint" style={{ paddingLeft: 18, margin: 0, display: 'grid', gap: 4 }}>
          <li>Open your own vault from the site (a vault factory contract)</li>
          <li>Automatic daily signals for strategies saved in the Lab</li>
          <li>Run the agent inside NEAR AI Cloud's TEE, not only sign its notes there</li>
          <li>Longer price history and more tokens across chains through NEAR Intents</li>
        </ul>
        <p className="hint">Backtest returns shown here are not live performance; simulated vaults are labelled as such.</p></div>
      </div>
    </section>
  </>;
}
