'use client';
import { useEffect, useState } from 'react';
import { recoverMessageAddress } from 'viem';
import { STYLES, FILTERS, RISKS, comboKey, generate, sha256Hex } from '@/lib/aiBuilder';
import { attestedSigners } from '@/lib/signature';
import { asset } from '@/lib/config';

export type Generation = {
  style: string; filters: string[]; model: string; chat_id: string; created_at: string;
  answer: { name: string; formula: string; summary: string; how_it_works: string[]; watch_out: string };
  request: string; response: string; signed_text: string | null; signature: string | null; signing_address: string | null;
};
type Check = { label: string; state: 'ok' | 'bad' | 'wait'; detail: string };
const KEY_STORE = 'tn-near-ai-key';

export function AIBuilder({ onUse }: { onUse: (formula: string, settings: Record<string, unknown>) => void }) {
  const [style, setStyle] = useState('dip');
  const [filters, setFilters] = useState<string[]>(['trend']);
  const [risk, setRisk] = useState('balanced');
  const [lib, setLib] = useState<Record<string, Generation> | null>(null);
  const [g, setG] = useState<Generation | null>(null);
  const [fresh, setFresh] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    fetch(asset('/data/ai-library.json')).then((r) => r.json()).then(setLib).catch(() => setLib({}));
    try { setKey(localStorage.getItem(KEY_STORE) ?? ''); } catch {}
  }, []);

  const settings = RISKS.find((r) => r.id === risk)!.settings;
  const toggle = (id: string) => setFilters((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  const inLibrary = !!lib?.[comboKey(style, filters)];

  function show(x: Generation, isFresh: boolean) {
    setG(x); setFresh(isFresh); setChecks(null); setErr(null);
    onUse(x.answer.formula, settings);
  }
  function build() {
    const x = lib?.[comboKey(style, filters)];
    if (x) show(x, false);
    else { setShowKey(true); setErr('This combination is not in the free library yet. Generate it live with your NEAR AI key below.'); }
  }
  async function buildFresh() {
    if (!key.trim()) { setErr('Paste your NEAR AI Cloud API key first.'); return; }
    try { localStorage.setItem(KEY_STORE, key.trim()); } catch {}
    setBusy(true); setErr(null);
    try { show(await generate(style, filters, { apiKey: key.trim() }) as Generation, true); } catch (e) { setErr((e as Error).message); }
    setBusy(false);
  }

  async function verify() {
    if (!g) return;
    setChecks([{ label: 'Checking', state: 'wait', detail: 'hashing the exact request and response, recovering the signer, asking NEAR AI Cloud for its attestation…' }]);
    const [model, reqHash, respHash] = (g.signed_text ?? '::').split(':');
    const [rq, rs] = await Promise.all([sha256Hex(g.request), sha256Hex(g.response)]);
    let signer = '';
    try { if (g.signed_text && g.signature) signer = (await recoverMessageAddress({ message: g.signed_text, signature: g.signature as `0x${string}` })).toLowerCase(); } catch {}
    const live = await attestedSigners(g.model);
    const content = (() => { try { return JSON.parse(g.response).choices[0].message.content as string; } catch { return ''; } })();
    const sentPrompt = (() => { try { return (JSON.parse(g.request).messages as { role: string; content: string }[]).find((m) => m.role === 'user')!.content; } catch { return ''; } })();
    setChecks([
      { label: 'The prompt is what we say it is', state: rq === reqHash ? 'ok' : 'bad', detail: `sha256 of the request we sent = ${rq.slice(0, 12)}…, signed ${reqHash?.slice(0, 12)}…. It asked: "${sentPrompt.slice(0, 160)}${sentPrompt.length > 160 ? '…' : ''}"` },
      { label: 'The answer is unedited', state: rs === respHash ? 'ok' : 'bad', detail: `sha256 of the model's raw response = ${rs.slice(0, 12)}…, signed ${respHash?.slice(0, 12)}…` },
      { label: 'The formula shown is the one the AI wrote', state: content.includes(g.answer.formula) ? 'ok' : 'bad', detail: g.answer.formula },
      { label: 'Signed inside the TEE', state: signer && signer === (g.signing_address ?? '').toLowerCase() ? 'ok' : 'bad', detail: signer ? `ECDSA signature recovers to ${signer}` : 'no signature' },
      { label: 'Signer attested by NEAR AI Cloud now', state: live && live.includes(signer) ? 'ok' : 'bad', detail: live == null ? 'attestation endpoint not reachable' : live.includes(signer) ? `${model} attests this address (Intel TDX + NVIDIA GPU)` : `attested now: ${live.join(', ') || 'none'} (keys rotate when enclaves restart)` },
    ]);
  }

  return (
    <section className="card" style={{ borderColor: 'var(--accent)' }}>
      <div className="eyebrow">Build with AI · NEAR AI Cloud</div>
      <h2 style={{ margin: '4px 0 6px', fontSize: 22 }}>New to trading? Pick your skills, AI writes the strategy.</h2>
      <p className="hint" style={{ marginTop: 0 }}>A model running inside NEAR AI Cloud's secure enclave combines the skills into a formula and explains it in plain English. Our code then backtests it, so the AI never grades its own homework.</p>

      <h3 style={{ marginTop: 14 }}>1. Core style</h3>
      <div className="grid g3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
        {STYLES.map((s) => <button key={s.id} className={style === s.id ? '' : 'ghost'} onClick={() => setStyle(s.id)} style={{ display: 'block', textAlign: 'left', whiteSpace: 'normal' }}><div>{s.label}</div><div style={{ fontWeight: 400, fontSize: 13, opacity: .8 }}>{s.hint}</div></button>)}
      </div>
      <h3 style={{ marginTop: 14 }}>2. Add skills (optional)</h3>
      <div className="row">{FILTERS.map((f) => <label key={f.id} className="tile row" style={{ cursor: 'pointer', gap: 8, padding: '8px 12px' }}><input type="checkbox" checked={filters.includes(f.id)} onChange={() => toggle(f.id)} /><span><b style={{ fontSize: 14, display: 'inline' }}>{f.label}</b> <span className="hint">{f.hint}</span></span></label>)}</div>
      <h3 style={{ marginTop: 14 }}>3. Risk</h3>
      <div className="row">{RISKS.map((r) => <button key={r.id} className={risk === r.id ? '' : 'ghost'} onClick={() => setRisk(r.id)} title={r.hint}>{r.label}</button>)}<span className="hint">{RISKS.find((r) => r.id === risk)!.hint}</span></div>

      <div className="row" style={{ marginTop: 16 }}>
        <button onClick={build} disabled={!lib}>{lib ? 'Build my strategy' : 'Loading…'}</button>
        <span className="hint">{lib ? (inLibrary ? 'Free: from the signed AI library.' : 'Not in the free library: generate it live below.') : ''}</span>
        <button className="ghost" onClick={() => setShowKey((v) => !v)}>Generate fresh (pay-as-you-go)</button>
      </div>

      {showKey && <div className="tile" style={{ marginTop: 12 }}>
        <h3>Generate live on NEAR AI Cloud</h3>
        <p className="hint" style={{ marginTop: 0 }}>Pay-as-you-go: you pay NEAR AI Cloud per call, a fraction of a cent, with your own key from <a href="https://cloud.near.ai" target="_blank" rel="noopener">cloud.near.ai</a>. The key stays in this browser and is sent only to cloud-api.near.ai. Coming next: pay per generation in NEAR straight from your wallet.</p>
        <div className="row"><input type="password" placeholder="NEAR AI Cloud API key" value={key} onChange={(e) => setKey(e.target.value)} style={{ flex: 1, minWidth: 220 }} /><button onClick={buildFresh} disabled={busy}>{busy ? 'NEAR AI is writing…' : 'Generate'}</button></div>
      </div>}
      {err && <div className="toast bad">{err}</div>}

      {g && <div className="tile prose" style={{ marginTop: 16, padding: 18 }}>
        <div className="spread"><div><span className="pill ok">{fresh ? 'Fresh from NEAR AI Cloud' : 'From the signed AI library'}</span> <span className="hint">{g.model} · {g.created_at.slice(0, 16).replace('T', ' ')} UTC</span></div><button className="ghost" onClick={verify}>Verify it's really from NEAR AI</button></div>
        <h2 style={{ margin: '10px 0 4px', fontSize: 22 }}>{g.answer.name}</h2>
        <p style={{ margin: '0 0 10px' }}>{g.answer.summary}</p>
        <pre>{g.answer.formula}</pre>
        <ul style={{ margin: '10px 0', paddingLeft: 18 }}>{g.answer.how_it_works.map((h) => <li key={h}>{h}</li>)}</ul>
        <p className="hint" style={{ margin: 0 }}><b>Watch out:</b> {g.answer.watch_out}</p>
        {checks && <ul className="checks" style={{ marginTop: 12 }}>{checks.map((c) => <li key={c.label}><span className={`m ${c.state}`}>{c.state === 'ok' ? '✓' : c.state === 'bad' ? '✗' : '…'}</span><div><b>{c.label}.</b> <span className="hint" style={{ overflowWrap: 'anywhere' }}>{c.detail}</span></div></li>)}</ul>}
        <p className="hint" style={{ marginBottom: 0 }}>Backtested below with the {RISKS.find((r) => r.id === risk)!.label.toLowerCase()} risk setting. Past results don't promise future ones; the unseen-data check is the one to trust.</p>
      </div>}
    </section>
  );
}
