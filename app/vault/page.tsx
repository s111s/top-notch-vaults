'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DEMO_VAULT } from '@/lib/config';
import { VaultDashboard } from '@/components/VaultDashboard';

function Inner() {
  const id = useSearchParams().get('id') || DEMO_VAULT;
  return <VaultDashboard id={id} />;
}
export default function VaultPage() {
  return <>
    <div className="hero" style={{ paddingTop: 8 }}>
      <div className="eyebrow">My vault</div>
      <h1 style={{ fontSize: 32 }}>Your money stays in your account. The agent only trades it.</h1>
      <p className="lead" style={{ fontSize: 16 }}>Everything below is read live from NEAR mainnet, quoted live from NEAR Intents, and the note is verified against NEAR AI Cloud's attestation in your browser.</p>
    </div>
    <Suspense fallback={<section className="card skeleton">Loading…</section>}><Inner /></Suspense>
  </>;
}
