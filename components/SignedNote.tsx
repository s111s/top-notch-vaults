'use client';
import { useEffect, useState } from 'react';
import { asset, explorerTx } from '@/lib/config';
import { attestedSigners, verifyLetter, type SignedLetter } from '@/lib/signature';

type Note = { date: string; facts: Record<string, unknown> & { trades?: { tx: string }[] }; facts_sha256: string; letter: SignedLetter };
type Check = { label: string; state: 'ok' | 'bad' | 'wait'; detail: string };

export function SignedNote() {
  const [note, setNote] = useState<Note | null>(null);
  const [checks, setChecks] = useState<Check[] | null>(null);
  useEffect(() => { fetch(asset('/data/vault-note.json'), { cache: 'no-store' }).then((r) => r.json()).then(setNote).catch(() => {}); }, []);
  if (!note) return null;
  const l = note.letter;

  async function verify() {
    const base: Check[] = [
      { label: 'Signature is valid', state: 'wait', detail: 'recovering the signer with ECDSA…' },
      { label: 'Signer is attested by NEAR AI Cloud right now', state: 'wait', detail: 'asking cloud-api.near.ai for the TEE attestation…' },
      { label: 'Signed for this model', state: 'wait', detail: '' },
    ];
    setChecks(base);
    const v = await verifyLetter(l);
    const live = await attestedSigners(l.model);
    const signer = (v.ok ? v.recovered : '')?.toLowerCase();
    setChecks([
      { label: 'Signature is valid', state: v.ok ? 'ok' : 'bad', detail: v.ok ? `recovers to ${v.recovered}` : v.reason },
      { label: 'Signer is attested by NEAR AI Cloud right now', state: live == null ? 'bad' : live.includes(signer) ? 'ok' : 'bad', detail: live == null ? 'attestation endpoint not reachable from this browser' : live.includes(signer) ? `the TEE attestation for ${l.model} reports this signing address (Intel TDX + NVIDIA GPU quotes)` : `attested signers now: ${live.join(', ') || 'none'} (keys rotate when the enclave restarts)` },
      { label: 'Signed for this model', state: v.ok && v.model === l.model ? 'ok' : 'bad', detail: `signed text names ${'model' in v ? v.model : '?'}` },
    ]);
  }

  return (
    <section className="card">
      <div className="spread"><h2 style={{ margin: 0 }}>Today's note from your agent · {note.date}</h2><button onClick={verify}>Verify signature</button></div>
      <p className="letter" style={{ marginTop: 12 }}>{l.text}</p>
      <p className="hint">Written inside NEAR AI Cloud's TEE by <code>{l.model}</code> from the facts the agent logged (sha256 <code>{note.facts_sha256.slice(0, 16)}…</code>) and signed by <code>{l.signing_address}</code>. Code decides what happened; the model only writes it up. Trades it cites: {(note.facts.trades ?? []).map((t, i) => <span key={t.tx}>{i ? ', ' : ''}<a href={explorerTx(t.tx)} target="_blank" rel="noopener">{t.tx.slice(0, 8)}…</a></span>)}.</p>
      {checks && <ul className="checks" style={{ marginTop: 12 }}>{checks.map((c) => <li key={c.label}><span className={`m ${c.state}`}>{c.state === 'ok' ? '✓' : c.state === 'bad' ? '✗' : '…'}</span><div><b>{c.label}.</b> <span className="hint">{c.detail}</span></div></li>)}</ul>}
    </section>
  );
}
