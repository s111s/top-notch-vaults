'use client';
import { useEffect, useState } from 'react';
import { ASSETS, explorerTx } from '@/lib/config';
import { entries, type VaultState } from '@/lib/vault';
import { toRaw } from '@/lib/near';
import { useWallet } from '@/lib/wallet';
import { REGISTRY, isPublic, visibilityRecord } from '@/lib/vaults';

type Result = { ok: boolean; text: string; tx?: string };
const reason = (e: unknown) => {
  const s = String((e as Error)?.message ?? e);
  const m = s.match(/only the (owner|agent)[^"\\]*/i);
  return m ? `The vault contract refused: "${m[0]}".` : s.slice(0, 220);
};

export function OwnerControls({ vault, isOwner, onDone }: { vault: VaultState; isOwner: boolean; onDone: () => void }) {
  const { accountId, connect, ready, call } = useWallet();
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<Result | null>(null);
  const [token, setToken] = useState('USDC');
  const [amount, setAmount] = useState('0.5');
  const [strategies, setStrategies] = useState<{ value: string; label: string }[]>([]);
  const [strategy, setStrategy] = useState(vault.policy.strategy);
  const [listed, setListed] = useState<boolean | null>(null);
  useEffect(() => { isPublic(vault.id, vault.owner).then(setListed).catch(() => setListed(true)); }, [vault.id, vault.owner]);
  async function setVisibility(pub: boolean) {
    setBusy(true); setRes(null);
    try {
      const tx = await call({ receiverId: REGISTRY, method: 'publish_mandate', args: { mandate: visibilityRecord(vault.id, pub) }, gasTgas: 30 });
      setListed(pub);
      setRes({ ok: true, text: pub ? 'Your vault is listed on the public vaults page.' : 'Your vault is now private: it no longer appears in the public list.', tx });
    } catch (e) { setRes({ ok: false, text: reason(e), tx: (e as { tx?: string }).tx }); }
    setBusy(false);
  }

  useEffect(() => {
    entries(vault.strategy.account).then((es) => {
      const seen = new Map<string, string>();
      for (const e of es) if (e.json?.kind === 'strategy') seen.set(`${vault.strategy.account}/${e.json.id}`, e.json.name);
      setStrategies([...seen].map(([value, label]) => ({ value, label })));
    }).catch(() => {});
  }, [vault.strategy.account]);

  async function run(label: string, method: string, args: Record<string, unknown>, gasTgas = 50) {
    setBusy(true); setRes(null);
    try {
      const tx = await call({ receiverId: vault.id, method, args, gasTgas });
      setRes({ ok: true, text: `${label}: done.`, tx });
      onDone();
    } catch (e) { setRes({ ok: false, text: reason(e), tx: (e as { tx?: string }).tx }); }
    setBusy(false);
  }
  const held = vault.holdings.find((h) => h.sym === token);
  const tokenContract = ASSETS[token]?.contract;

  return (
    <section className="card" id="controls">
      <h2>Your controls</h2>
      {!accountId && <>
        <p>Connect a NEAR wallet to act on this vault. Every control is a transaction you sign yourself; nothing goes through our servers.</p>
        <button onClick={connect} disabled={!ready}>Connect wallet</button>
        <p className="hint">HOT, Meteor, Intear, MyNearWallet, Nightly, OKX and more, through NEAR Connect.</p>
      </>}

      {accountId && isOwner && <>
        <p className="hint" style={{ marginTop: -4 }}>Signed by <code>{accountId}</code>, the vault's owner.</p>
        <div className="grid g3">
          <div className="tile"><h3>{vault.paused ? 'Resume the agent' : 'Pause the agent'}</h3><p className="hint">Takes effect at once. A paused vault rejects every <code>swap</code>.</p>
            <button className={vault.paused ? '' : 'danger'} disabled={busy} onClick={() => run(vault.paused ? 'Resumed' : 'Paused', 'set_paused', { paused: !vault.paused }, 30)}>{vault.paused ? 'Resume' : 'Pause'}</button></div>
          <div className="tile"><h3>Withdraw to your wallet</h3>
            <div className="row" style={{ margin: '6px 0' }}>
              <select value={token} onChange={(e) => setToken(e.target.value)}>{vault.holdings.map((h) => <option key={h.sym}>{h.sym}</option>)}</select>
              <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" style={{ width: 110 }} />
            </div>
            <p className="hint">Holding {held ? held.amount.toLocaleString('en-US', { maximumFractionDigits: 6 }) : 0} {token}.</p>
            <button disabled={busy || !tokenContract || !(Number(amount) > 0)} onClick={() => run(`Withdrew ${amount} ${token}`, 'withdraw', { token: tokenContract, amount: toRaw(Number(amount), ASSETS[token].decimals).toString() }, 60)}>Withdraw</button></div>
          <div className="tile"><h3>Switch strategy</h3>
            <select value={strategy} onChange={(e) => setStrategy(e.target.value)} style={{ width: '100%', margin: '6px 0' }}>{strategies.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select>
            <p className="hint">The agent trades toward the new strategy's signal from its next run.</p>
            <button disabled={busy || strategy === vault.policy.strategy} onClick={() => run('Strategy switched', 'set_policy', { policy: { ...vault.policy, strategy } }, 30)}>Switch</button></div>
          <div className="tile"><h3>Public or private</h3>
            <p className="hint">{listed == null ? 'Checking…' : listed ? 'Public: listed on the public vaults page and leaderboard.' : 'Private: hidden from the public list. Anyone with the exact address can still read it on-chain.'}</p>
            <p className="hint">One record on the <code>{REGISTRY}</code> registry, signed by you. Only the owner's record counts.</p>
            <button className="ghost" disabled={busy || listed == null} onClick={() => setVisibility(!listed)}>{listed ? 'Make private' : 'Make public'}</button></div>
        </div>
      </>}

      {accountId && !isOwner && <>
        <p>You're signed in as <code>{accountId}</code>, which is not this vault's owner. So you can't move its money, and neither can we. Try it:</p>
        <div className="row">
          <button className="danger" disabled={busy} onClick={() => run('Withdraw', 'withdraw', { token: ASSETS.USDC.contract, amount: '1' }, 30)}>Try to withdraw from this vault</button>
          <button className="ghost" disabled={busy} onClick={() => run('Swap', 'swap', { token: ASSETS.USDC.contract, amount: '1', deposit_address: '0'.repeat(64) }, 30)}>Try to trade it as the agent</button>
        </div>
        <p className="hint">Your wallet sends a real mainnet transaction (costs about 0.0003 NEAR in gas). The vault contract rejects it, and the receipt on NearBlocks shows why.</p>
      </>}

      {busy && <div className="toast">Waiting for your wallet…</div>}
      {res && <div className={`toast ${res.ok ? 'ok' : 'bad'}`}>{res.text} {res.tx && <a href={explorerTx(res.tx)} target="_blank" rel="noopener">View transaction</a>}</div>}
    </section>
  );
}
