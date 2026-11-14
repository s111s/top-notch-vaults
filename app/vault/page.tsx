'use client';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { DEMO_VAULT } from '@/lib/config';
import { useWallet } from '@/lib/wallet';
import { vaultsOwnedBy } from '@/lib/vaults';
import { VaultDashboard } from '@/components/VaultDashboard';

function Mine() {
  const { accountId, connect, ready } = useWallet();
  const [mine, setMine] = useState<string[] | null>(null);
  useEffect(() => { setMine(null); if (accountId) vaultsOwnedBy(accountId).then(setMine).catch(() => setMine([])); }, [accountId]);

  if (!accountId) return <section className="card">
    <h2 style={{ marginTop: 0 }}>Connect your wallet to see your vault</h2>
    <p>Your vault is a NEAR account that only your wallet controls. Connect it and this page shows your vault's value, holdings, the agent's trades and your controls: pause, withdraw, switch strategy, and public or private listing.</p>
    <div className="row"><button onClick={connect} disabled={!ready}>Connect wallet</button><Link className="btn ghost" href={`/vault/?id=${DEMO_VAULT}`}>Look at the example vault</Link><Link className="btn ghost" href="/vaults/">Browse public vaults</Link></div>
  </section>;
  if (!mine) return <section className="card skeleton">Looking for vaults owned by <code>{accountId}</code> on NEAR mainnet…</section>;
  if (!mine.length) return <section className="card">
    <h2 style={{ marginTop: 0 }}>No vault for <code>{accountId}</code> yet</h2>
    <p>Opening your own vault from this page is the next thing we're building (a vault factory contract). Today there is one live vault on mainnet, run with real funds. Look at it to see exactly what yours will do.</p>
    <div className="row"><Link className="btn" href={`/vault/?id=${DEMO_VAULT}`}>See the example vault</Link><Link className="btn ghost" href="/vaults/">Browse public vaults</Link><Link className="btn ghost" href="/leaderboard/">Pick a strategy</Link></div>
  </section>;
  return <>{mine.map((id) => <VaultDashboard key={id} id={id} />)}</>;
}

function Inner() {
  const id = useSearchParams().get('id');
  return id ? <VaultDashboard id={id} /> : <Mine />;
}

export default function VaultPage() {
  return <>
    <div className="hero" style={{ paddingTop: 8 }}>
      <div className="eyebrow">My vault</div>
      <h1 style={{ fontSize: 32 }}>Your money stays in your account. The agent only trades it.</h1>
      <p className="lead" style={{ fontSize: 16 }}>Everything here is read live from NEAR mainnet, quoted live from NEAR Intents, and the daily note is verified against NEAR AI Cloud's attestation in your browser.</p>
    </div>
    <Suspense fallback={<section className="card skeleton">Loading…</section>}><Inner /></Suspense>
  </>;
}
