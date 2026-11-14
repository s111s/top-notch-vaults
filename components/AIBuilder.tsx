'use client';
import { useEffect, useRef, useState } from 'react';
import { recoverMessageAddress } from 'viem';
import { STYLES, FILTERS, RISKS, HORIZONS, COINS, MAX_SKILLS, NOTE_MAX, MODELS, FREE_PER_WALLET, PRO_PRICE_YOCTO, PAY_TO, AUTH_RECIPIENT, authMessage, comboKey, generate, sha256Hex } from '@/lib/aiBuilder';
import { attestedGateway, attestedSigners } from '@/lib/signature';
import { AI_RELAY, asset } from '@/lib/config';
import { useWallet, type Auth } from '@/lib/wallet';
import { BuildSteps, type Step } from '@/components/BuildSteps';

export type Generation = {
  style: string; filters: string[]; horizon?: string; note?: string; attempts?: number; model: string; chat_id: string; created_at: string;
  answer: { name: string; formula: string; summary: string; how_it_works: string[]; watch_out: string };
  request: string; response: string; signed_text: string | null; signature: string | null; signing_address: string | null;
};
type Check = { label: string; state: 'ok' | 'bad' | 'wait'; detail: string };
const KEY_STORE = 'tn-near-ai-key';

export type Meta = { source: 'library' | 'fresh'; style: string; filters: string[]; horizon: string; risk: string; name?: string };

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const LIB_STEPS: Step[] = [
  { id: 'find', label: 'Find your combination in the signed AI library' },
  { id: 'check', label: 'Check the formula is valid' },
  { id: 'test', label: 'Backtest it on 6 months of prices, in your browser' },
];

export function AIBuilder({ onUse }: { onUse: (formula: string, settings: Record<string, unknown>, meta: Meta) => void }) {
  const [style, setStyle] = useState('dip');
  const [filters, setFilters] = useState<string[]>(['trend']);
  const [horizon, setHorizon] = useState('medium');
  const [coins, setCoins] = useState<string[]>(COINS);
  const [note, setNote] = useState('');
  const [risk, setRisk] = useState('balanced');
  const [lib, setLib] = useState<Record<string, Generation> | null>(null);
  const [g, setG] = useState<Generation | null>(null);
  const [fresh, setFresh] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [tier, setTier] = useState<'free' | 'pro' | 'own'>('free');
  const [quota, setQuota] = useState<number | null>(null);
  const [run, setRun] = useState<{ steps: Step[]; current: string | null; startedAt: number; expect?: string; failed?: boolean } | null>(null);
  const freshRef = useRef<HTMLDivElement>(null);
  const { accountId, connect, signAuth, transfer } = useWallet();

  useEffect(() => {
    fetch(asset('/data/ai-library.json')).then((r) => r.json()).then(setLib).catch(() => setLib({}));
    try { setKey(localStorage.getItem(KEY_STORE) ?? ''); } catch {}
  }, []);

  const settings = { ...RISKS.find((r) => r.id === risk)!.settings, universe: coins };
  const toggle = (id: string) => setFilters((f) => (f.includes(id) ? f.filter((x) => x !== id) : f.length >= MAX_SKILLS ? f : [...f, id]));
  const toggleCoin = (c: string) => setCoins((cs) => (cs.includes(c) ? (cs.length > 2 ? cs.filter((x) => x !== c) : cs) : [...cs, c]));
  const libEntry = !note.trim() ? lib?.[comboKey(style, filters, horizon)] : undefined;
  const why = note.trim() ? 'Your own idea needs a fresh generation.' : horizon !== 'medium' ? 'The free library is built for the Medium horizon.' : filters.length > 1 ? 'The free library covers one extra skill at a time.' : '';

  // Steps a run goes through; `current` moves along as each one finishes.
  const step = (id: string | null, extra: Partial<NonNullable<typeof run>> = {}) => setRun((r) => (r ? { ...r, current: id, ...extra } : r));
  const detail = (id: string, d: string) => setRun((r) => (r ? { ...r, steps: r.steps.map((s) => (s.id === id ? { ...s, detail: d } : s)) } : r));
  function aiSteps(t: 'free' | 'pro' | 'own'): Step[] {
    return [
      ...(t !== 'own' ? [{ id: 'auth', label: 'Prove it is your wallet (one signature, no gas)' }] : []),
      ...(t === 'pro' ? [{ id: 'pay', label: 'Pay 0.01 NEAR to top-notch.near' }] : []),
      { id: 'write', label: t === 'pro' ? 'Claude Opus 5.5 writes the formula and explanation' : 'NEAR AI writes the formula inside its secure enclave (TEE)' },
      { id: 'check', label: 'Check the formula parses (the AI fixes it if not)' },
      { id: 'sign', label: 'Fetch NEAR AI Cloud’s signature over the exact prompt and answer' },
      { id: 'test', label: 'Backtest it on 6 months of prices, in your browser' },
    ];
  }
  async function finish(x: Generation, isFresh: boolean) {
    if (x.attempts && x.attempts > 1) detail('check', `fixed on try ${x.attempts}`);
    step('sign'); await wait(150);
    detail('sign', x.signature ? 'signed' : 'no signature returned');
    step('test'); await wait(250);
    setG(x); setFresh(isFresh); setChecks(null); setErr(null);
    onUse(x.answer.formula, settings, { source: isFresh ? 'fresh' : 'library', style: x.style, filters: x.filters, horizon: x.horizon ?? 'medium', risk, name: x.answer.name });
    step(null);
  }
  function fail(e: unknown) { setRun((r) => (r ? { ...r, failed: true } : r)); setErr((e as Error).message); }

  async function build() {
    if (!libEntry) { setShowKey(true); setTimeout(() => freshRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50); return; }
    setBusy(true); setErr(null);
    setRun({ steps: LIB_STEPS, current: 'find', startedAt: Date.now() });
    await wait(350); detail('find', libEntry.answer.name); step('check'); await wait(300);
    detail('check', libEntry.answer.formula.length > 48 ? `${libEntry.answer.formula.slice(0, 48)}…` : libEntry.answer.formula);
    step('test'); await wait(300);
    setG(libEntry); setFresh(false); setChecks(null);
    onUse(libEntry.answer.formula, settings, { source: 'library', style, filters, horizon, risk, name: libEntry.answer.name });
    step(null); setBusy(false);
  }

  // Free tier and paid frontier model go through our relay, which holds the platform's NEAR AI key.
  async function getAuth(): Promise<Auth> {
    const day = new Date().toISOString().slice(0, 10);
    const k = `tn-ai-auth:${accountId}:${day}`;
    try { const c = sessionStorage.getItem(k); if (c) { detail('auth', 'already signed today'); return JSON.parse(c); } } catch {}
    detail('auth', 'approve the message in your wallet');
    const a = await signAuth(authMessage(accountId!, day), AUTH_RECIPIENT);
    try { sessionStorage.setItem(k, JSON.stringify(a)); } catch {}
    return a;
  }
  async function relay(path: string, body: Record<string, unknown>) {
    const r = await fetch(`${AI_RELAY}${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({ error: `relay returned ${r.status}` }));
    if (!r.ok) throw new Error(j.error || `relay returned ${r.status}`);
    return j;
  }
  async function buildRelay() {
    setBusy(true); setErr(null);
    setRun({ steps: aiSteps(tier), current: 'auth', startedAt: Date.now(), expect: tier === 'pro' ? 'usually 10 to 20s' : 'usually 10 to 30s' });
    try {
      const auth = await getAuth();
      let payTx: string | undefined;
      if (tier === 'pro') { step('pay'); detail('pay', 'approve in your wallet'); payTx = await transfer(PAY_TO, PRO_PRICE_YOCTO); detail('pay', `tx ${payTx.slice(0, 8)}…`); }
      step('write');
      const out = await relay('/generate', { auth, style, filters, horizon, note: note.trim(), tier, payTx });
      if (typeof out.free_left === 'number') setQuota(out.free_left);
      step('check');
      await finish(out as Generation, true);
    } catch (e) { fail(e); }
    setBusy(false);
  }
  useEffect(() => {
    if (!accountId || !showKey || tier !== 'free') return;
    const k = `tn-ai-auth:${accountId}:${new Date().toISOString().slice(0, 10)}`;
    let cached: Auth | null = null;
    try { const c = sessionStorage.getItem(k); if (c) cached = JSON.parse(c); } catch {}
    if (cached) relay('/quota', { auth: cached }).then((q) => setQuota(q.left)).catch(() => {});
  }, [accountId, showKey, tier]); // eslint-disable-line react-hooks/exhaustive-deps
  async function buildFresh() {
    if (!key.trim()) { setErr('Paste your NEAR AI Cloud API key first.'); return; }
    try { localStorage.setItem(KEY_STORE, key.trim()); } catch {}
    setBusy(true); setErr(null);
    setRun({ steps: aiSteps('own'), current: 'write', startedAt: Date.now(), expect: 'usually 10 to 30s' });
    try {
      const x = await generate(style, filters, { apiKey: key.trim(), horizon, note: note.trim(), onStep: (s, a, why) => {
        if (s === 'retry') { step('write'); detail('write', `try ${a + 1}: ${/NEAR AI Cloud \d/.test(why ?? '') ? 'NEAR AI was busy, trying again' : 'asked the AI to fix its formula'}`); }
        else if (s === 'check' || s === 'sign') step(s);
      } });
      await finish(x as Generation, true);
    } catch (e) { fail(e); }
    setBusy(false);
  }

  async function verify() {
    if (!g) return;
    setChecks([{ label: 'Checking', state: 'wait', detail: 'hashing the exact request and response, recovering the signer, asking NEAR AI Cloud for its attestation…' }]);
    const [model, reqHash, respHash] = (g.signed_text ?? '::').split(':');
    const [rq, rs] = await Promise.all([sha256Hex(g.request), sha256Hex(g.response)]);
    let signer = '';
    try { if (g.signed_text && g.signature) signer = (await recoverMessageAddress({ message: g.signed_text, signature: g.signature as `0x${string}` })).toLowerCase(); } catch {}
    const [live, gw] = await Promise.all([attestedSigners(g.model), attestedGateway(g.model)]);
    const content = (() => { try { return JSON.parse(g.response).choices[0].message.content as string; } catch { return ''; } })();
    const sentPrompt = (() => { try { return (JSON.parse(g.request).messages as { role: string; content: string }[]).find((m) => m.role === 'user')!.content; } catch { return ''; } })();
    setChecks([
      { label: 'The prompt is what we say it is', state: rq === reqHash ? 'ok' : 'bad', detail: `sha256 of the request we sent = ${rq.slice(0, 12)}…, signed ${reqHash?.slice(0, 12)}…. It asked: "${sentPrompt.slice(0, 160)}${sentPrompt.length > 160 ? '…' : ''}"` },
      { label: 'The answer is unedited', state: rs === respHash ? 'ok' : 'bad', detail: `sha256 of the model's raw response = ${rs.slice(0, 12)}…, signed ${respHash?.slice(0, 12)}…` },
      { label: 'The formula shown is the one the AI wrote', state: content.includes(g.answer.formula) ? 'ok' : 'bad', detail: g.answer.formula },
      { label: 'Signed inside the TEE', state: signer && signer === (g.signing_address ?? '').toLowerCase() ? 'ok' : 'bad', detail: signer ? `ECDSA signature recovers to ${signer}` : 'no signature' },
      live && live.includes(signer)
        ? { label: 'Signer attested by NEAR AI Cloud now', state: 'ok', detail: `the model runs in a TEE: ${model} attests this address (Intel TDX + NVIDIA GPU)` }
        : gw && gw === signer
          ? { label: "Signed by NEAR AI Cloud's attested gateway", state: 'ok', detail: `${model} is a proxied frontier model, so it doesn't run in NEAR AI's TEE; the attested gateway that relayed it signed the exchange (${gw})` }
          : { label: 'Signer attested by NEAR AI Cloud now', state: 'bad', detail: live == null ? 'attestation endpoint not reachable' : `attested now: ${[...(live ?? []), gw].filter(Boolean).join(', ') || 'none'} (keys rotate when enclaves restart)` },
    ]);
  }

  const S = STYLES.find((s) => s.id === style)!;
  return (
    <section className="card" style={{ borderColor: 'var(--accent)' }}>
      <div className="eyebrow">Build with AI · NEAR AI Cloud</div>
      <h2 style={{ margin: '4px 0 6px', fontSize: 22 }}>New to trading? Pick your skills, AI writes the strategy.</h2>
      <p className="hint" style={{ marginTop: 0 }}>Every style and skill below is a market effect documented in published research. A model running inside NEAR AI Cloud's secure enclave combines your picks into a formula and explains it in plain English. Our code then backtests it, so the AI never grades its own homework.</p>

      <h3 style={{ marginTop: 14 }}>1. Core style</h3>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
        {STYLES.map((s) => <button key={s.id} className={style === s.id ? '' : 'ghost'} onClick={() => setStyle(s.id)} style={{ display: 'block', textAlign: 'left', whiteSpace: 'normal' }}><div>{s.label}</div><div style={{ fontWeight: 400, fontSize: 13, opacity: .8 }}>{s.hint}</div></button>)}
      </div>
      <p className="hint" style={{ margin: '8px 0 0' }}><b style={{ color: 'var(--ink)' }}>{S.label}:</b> {S.brief.split(': ').slice(1).join(': ')}. Research: {S.source}.</p>

      <h3 style={{ marginTop: 16 }}>2. Add skills <span className="hint" style={{ fontWeight: 400 }}>optional, up to {MAX_SKILLS} ({filters.length} picked)</span></h3>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>{FILTERS.map((f) => {
        const on = filters.includes(f.id), full = !on && filters.length >= MAX_SKILLS;
        return <label key={f.id} className="tile row" style={{ cursor: full ? 'not-allowed' : 'pointer', gap: 8, padding: '8px 12px', opacity: full ? .5 : 1, borderColor: on ? 'var(--accent)' : undefined, flexWrap: 'nowrap' }}><input type="checkbox" checked={on} disabled={full} onChange={() => toggle(f.id)} /><span><b style={{ fontSize: 14, display: 'inline' }}>{f.label}</b><br /><span className="hint">{f.hint}</span></span></label>;
      })}</div>

      <h3 style={{ marginTop: 16 }}>3. Make it yours</h3>
      <div className="grid g2" style={{ gap: 14 }}>
        <div><div className="hint" style={{ marginBottom: 6 }}>How long should a trade last?</div>
          <div className="row" style={{ gap: 6 }}>{HORIZONS.map((h) => <button key={h.id} className={horizon === h.id ? '' : 'ghost'} onClick={() => setHorizon(h.id)} title={h.hint}>{h.label}</button>)}<span className="hint">{HORIZONS.find((h) => h.id === horizon)!.hint}</span></div></div>
        <div><div className="hint" style={{ marginBottom: 6 }}>Risk: how many coins at once?</div>
          <div className="row" style={{ gap: 6 }}>{RISKS.map((r) => <button key={r.id} className={risk === r.id ? '' : 'ghost'} onClick={() => setRisk(r.id)} title={r.hint}>{r.label}</button>)}<span className="hint">{RISKS.find((r) => r.id === risk)!.hint}</span></div></div>
      </div>
      <div style={{ marginTop: 12 }}><div className="hint" style={{ marginBottom: 6 }}>Which coins may it trade? Each day it scores every ticked coin and holds the best ones, or USDC when none look good. Tick at least 2.</div>
        <div className="coins">{COINS.map((c) => <button key={c} className={`coin ${coins.includes(c) ? 'on' : ''}`} aria-pressed={coins.includes(c)} onClick={() => toggleCoin(c)}>{c}</button>)}
          <button className="coin" onClick={() => setCoins(COINS)}>All</button><button className="coin" onClick={() => setCoins(['NEAR', 'BTC', 'ETH', 'SOL'])}>Majors only</button></div></div>
      <div style={{ marginTop: 12 }}><label className="hint" htmlFor="ai-note">Your own idea for the AI (optional, generated fresh)</label>
        <input id="ai-note" value={note} maxLength={NOTE_MAX} onChange={(e) => setNote(e.target.value)} placeholder="e.g. avoid coins that pumped over 30% this month" style={{ width: '100%', marginTop: 4 }} />
        <div className="hint" style={{ textAlign: 'right' }}>{note.length}/{NOTE_MAX}</div></div>

      <div className="row" style={{ marginTop: 12 }}>
        <button onClick={build} disabled={!lib || busy}>{!lib ? 'Loading…' : libEntry ? 'Build my strategy · free' : 'Generate it with NEAR AI ↓'}</button>
        <span className="hint">{lib ? (libEntry ? 'Instant: this combination is in the signed AI library.' : why || 'Not in the free library yet: generate it live.') : ''}</span>
        {libEntry && <button className="ghost" onClick={() => { setShowKey((v) => !v); setTimeout(() => freshRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50); }}>Or generate a fresh one</button>}
      </div>

      {showKey && <div className="tile" ref={freshRef} style={{ marginTop: 12 }}>
        <h3>Generate a fresh one, live on NEAR AI Cloud</h3>
        <div className="grid g2" style={{ gap: 10, marginTop: 8 }}>
          {MODELS.map((m) => <button key={m.id} className={tier === m.tier ? '' : 'ghost'} onClick={() => setTier(m.tier)} style={{ display: 'block', textAlign: 'left', whiteSpace: 'normal' }}>
            <div>{m.tier === 'free' ? 'Free' : 'Best quality'} · {m.label} {m.tee ? '🔒' : ''}</div>
            <div style={{ fontWeight: 400, fontSize: 13, opacity: .85 }}>{m.note}</div></button>)}
          <button className={tier === 'own' ? '' : 'ghost'} onClick={() => setTier('own')} style={{ display: 'block', textAlign: 'left', whiteSpace: 'normal' }}>
            <div>Your own NEAR AI key</div><div style={{ fontWeight: 400, fontSize: 13, opacity: .85 }}>Unlimited, you pay NEAR AI Cloud directly (about $0.002 a generation). The key stays in this browser.</div></button>
        </div>
        {tier !== 'own' && <div className="row" style={{ marginTop: 12 }}>
          {!accountId ? <><button onClick={connect}>Connect wallet</button><span className="hint">{tier === 'free' ? `Free for activated NEAR wallets holding at least 0.1 NEAR: ${FREE_PER_WALLET} generations each. You sign one message (no gas) to prove it's your wallet.` : 'Pay 0.01 NEAR from your wallet per generation.'}</span></>
            : <><button onClick={buildRelay} disabled={busy}>{busy ? 'Building…' : tier === 'free' ? 'Generate free' : 'Pay 0.01 NEAR and generate'}</button>
              <span className="hint">as <code>{accountId}</code>{quota != null && tier === 'free' ? ` · ${quota} free left` : ''}</span></>}
        </div>}
        {tier === 'own' && <div className="row" style={{ marginTop: 12 }}><input type="password" placeholder="NEAR AI Cloud API key (cloud.near.ai)" value={key} onChange={(e) => setKey(e.target.value)} style={{ flex: 1, minWidth: 220 }} /><button onClick={buildFresh} disabled={busy}>{busy ? 'Building…' : 'Generate'}</button></div>}
      </div>}
      {run && (run.current || run.failed) && <div className="tile" style={{ marginTop: 12 }}><b style={{ fontSize: 15 }}>Building your strategy</b><BuildSteps {...run} /></div>}
      {err && <div className="toast bad">{err}</div>}

      {g && <div className="tile prose" style={{ marginTop: 16, padding: 18 }}>
        <div className="spread"><div><span className="pill ok">{fresh ? 'Fresh from NEAR AI Cloud' : 'From the signed AI library'}</span> <span className="hint">{g.model} · {g.created_at.slice(0, 16).replace('T', ' ')} UTC</span></div><button className="ghost" onClick={verify}>Verify it's really from NEAR AI</button></div>
        <h2 style={{ margin: '10px 0 4px', fontSize: 22 }}>{g.answer.name}</h2>
        <p style={{ margin: '0 0 10px' }}>{g.answer.summary}</p>
        <pre>{g.answer.formula}</pre>
        <ul style={{ margin: '10px 0', paddingLeft: 18 }}>{g.answer.how_it_works.map((h) => <li key={h}>{h}</li>)}</ul>
        <p className="hint" style={{ margin: 0 }}><b>Watch out:</b> {g.answer.watch_out}</p>
        {checks && <ul className="checks" style={{ marginTop: 12 }}>{checks.map((c) => <li key={c.label}><span className={`m ${c.state}`}>{c.state === 'ok' ? '✓' : c.state === 'bad' ? '✗' : '…'}</span><div><b>{c.label}.</b> <span className="hint" style={{ overflowWrap: 'anywhere' }}>{c.detail}</span></div></li>)}</ul>}
        <div className="toast ok" style={{ marginBottom: 0 }}><b>Next:</b> the backtest below shows what $100 would have done with this formula on {coins.length === COINS.length ? 'all 10 coins' : coins.join(', ')} ({RISKS.find((r) => r.id === risk)!.label.toLowerCase()} risk), then how to use it. <a href="#result">See the backtest ↓</a></div>
      </div>}
    </section>
  );
}
