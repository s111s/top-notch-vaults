'use client';
// "Use in my vault": the vault owner points their vault at a strategy with one set_policy call,
// signed in their own wallet. The agent trades toward that strategy's on-chain signal from its next run.
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { DEMO_VAULT, explorerTx } from '@/lib/config';
import { loadVault, type VaultState } from '@/lib/vault';
import { vaultsOwnedBy } from '@/lib/vaults';
import { useWallet } from '@/lib/wallet';

export function UseInVault({ strategyKey, name, ping = 0 }: { strategyKey: string; name: string; ping?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [flash, setFlash] = useState(false);
  // A "Use in my vault" button elsewhere on the page brings this panel into view and highlights it.
  useEffect(() => {
    if (!ping) return;
    box.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setFlash(true); const t = setTimeout(() => setFlash(false), 1600); return () => clearTimeout(t);
  }, [ping]);
  const { accountId, connect, ready, call } = useWallet();
  const [vaults, setVaults] = useState<VaultState[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<{ ok: boolean; text: string; tx?: string } | null>(null);

  useEffect(() => {
    setVaults(null);
    if (!accountId) return;
    vaultsOwnedBy(accountId).then((ids) => Promise.all(ids.map(loadVault))).then(setVaults).catch(() => setVaults([]));
  }, [accountId]);

  async function use(v: VaultState) {
    setBusy(true); setRes(null);
    try {
      const tx = await call({ receiverId: v.id, method: 'set_policy', args: { policy: { ...v.policy, strategy: strategyKey } }, gasTgas: 30 });
      setVaults((vs) => vs?.map((x) => (x.id === v.id ? { ...x, policy: { ...x.policy, strategy: strategyKey } } : x)) ?? null);
      setRes({ ok: true, text: `${v.id} now follows ${name}. The agent trades toward its signal from its next daily run.`, tx });
    } catch (e) { setRes({ ok: false, text: String((e as Error).message ?? e).slice(0, 220) }); }
    setBusy(false);
  }

  return (
    <div className={`tile ${flash ? 'flash' : ''}`} id="use" ref={box}>
      <h3 style={{ marginTop: 0 }}>Use this strategy in my vault</h3>
      {!accountId && <><p className="hint">Connect the wallet that owns your vault. Switching is one transaction you sign; only the vault's owner can do it.</p><button onClick={connect} disabled={!ready}>Connect wallet</button></>}
      {accountId && !vaults && <p className="hint">Looking for vaults owned by <code>{accountId}</code>…</p>}
      {accountId && vaults && !vaults.length && <p className="toast"><code>{accountId}</code> doesn&apos;t own a vault yet. Opening a vault from the site is next on our roadmap (a vault factory). Until then, see how it works on the <Link href={`/vault/?id=${DEMO_VAULT}`}>example vault</Link>.</p>}
      {vaults?.map((v) => <div key={v.id} className="row" style={{ marginTop: 6 }}>
        {v.policy.strategy === strategyKey
          ? <><span className="pill ok">✓ {v.id} follows this strategy</span><Link href={`/vault/?id=${encodeURIComponent(v.id)}`}>Open vault →</Link></>
          : <><button disabled={busy} onClick={() => use(v)}>Use in {v.id}</button><span className="hint">now follows <code>{v.policy.strategy}</code></span></>}
      </div>)}
      {busy && <div className="toast">Waiting for your wallet…</div>}
      {res && <div className={`toast ${res.ok ? 'ok' : 'bad'}`}>{res.text} {res.tx && <a href={explorerTx(res.tx)} target="_blank" rel="noopener">View transaction</a>}</div>}
    </div>
  );
}
