'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ASSETS, PLATFORM_FEE, asset, explorerAccount, explorerTx } from '@/lib/config';
import { loadVault, planTrades, type VaultState } from '@/lib/vault';
import { dryQuote } from '@/lib/oneclick';
import { implicitToKey } from '@/lib/base58';
import { short } from '@/lib/near';
import { useWallet } from '@/lib/wallet';
import { SignedNote } from './SignedNote';
import { OwnerControls } from './OwnerControls';

type Trade = { at: string; from: string; to: string; usd: number; txHash: string; depositAddress: string; status: string; amountOut?: string; signal_date: string; appFees: { recipient: string; fee: number }[] };
type Quote = { from: string; to: string; usd: number; out?: string; outUsd?: string; eta?: number; error?: string };

const money = (n: number) => `$${n.toFixed(2)}`;
const amt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 6 });

export function VaultDashboard({ id }: { id: string }) {
  const { accountId } = useWallet();
  const [v, setV] = useState<VaultState | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [quotes, setQuotes] = useState<Quote[] | null>(null);
  const [quoting, setQuoting] = useState(false);

  const reload = useCallback(() => {
    loadVault(id).then(setV).catch((e) => setErr(String(e?.message ?? e)));
  }, [id]);
  useEffect(() => { reload(); }, [reload]);
  useEffect(() => { fetch(asset('/data/vault-trades.json')).then((r) => r.json()).then((t: Trade[]) => setTrades(t.filter((x) => !('vault' in x) || (x as Trade & { vault: string }).vault === id))).catch(() => {}); }, [id]);

  const plan = useMemo(() => (v ? planTrades(v) : []), [v]);
  const ownerKey = v ? implicitToKey(v.owner) : null;
  const isOwner = !!accountId && accountId === v?.owner;
  const card = v?.strategy.card?.json;
  const signal = v?.strategy.signal?.json;

  const runQuotes = useCallback(async () => {
    if (!v || !card) return;
    setQuoting(true);
    // Fees are paid inside each swap. 1Click without a partner key records half of a requested fee, so request 2x.
    const appFees = [{ recipient: card.fee.recipient, fee: card.fee.bps * 2 }, { recipient: PLATFORM_FEE.recipient, fee: PLATFORM_FEE.bps * 2 }];
    const legs = plan.length ? plan : [{ from: 'USDC', to: 'NEAR', usd: 1, raw: '1000000' }];
    const out = await Promise.all(legs.map(async (t) => {
      try {
        const q = await dryQuote({ from: ASSETS[t.from].assetId, to: ASSETS[t.to].assetId, amountRaw: t.raw, vault: v.id, appFees });
        return { from: t.from, to: t.to, usd: t.usd, out: q.quote.amountOutFormatted, outUsd: q.quote.amountOutUsd, eta: q.quote.timeEstimate };
      } catch (e) { return { from: t.from, to: t.to, usd: t.usd, error: String((e as Error).message ?? e).slice(0, 140) }; }
    }));
    setQuotes(out); setQuoting(false);
  }, [v, card, plan]);
  useEffect(() => { if (v && card && !quotes && !quoting) runQuotes(); }, [v, card, quotes, quoting, runQuotes]);

  if (err) return <section className="card"><h2>Could not read this vault</h2><p className="hint">{err}</p><button className="ghost" onClick={reload}>Try again</button></section>;
  if (!v) return <section className="card skeleton">Reading <code>{id}</code> live from NEAR mainnet…</section>;

  const onlyOwnerKey = v.fullKeys.length === 1 && v.fullKeys[0] === ownerKey;

  return (
    <>
      <section className="card">
        <div className="spread">
          <div>
            <div className="eyebrow">Your vault on NEAR</div>
            <h2 style={{ fontSize: 24, margin: '4px 0' }}><a href={explorerAccount(v.id)} target="_blank" rel="noopener">{v.id}</a></h2>
            <div className="hint">Owner <code title={v.owner}>{short(v.owner, 12)}</code>{isOwner && <> · <span className="pill ok">that's you</span></>} · agent <code>{v.agent}</code></div>
          </div>
          <span className={`pill ${v.paused ? 'bad' : 'ok'}`} style={{ fontSize: 14, padding: '4px 12px' }}>{v.paused ? 'Agent paused' : 'Agent active'}</span>
        </div>
        <div className="tiles" style={{ marginTop: 16 }}>
          <div className="tile"><b>{money(v.equity)}</b><span>vault value now</span></div>
          <div className="tile"><b>{v.swaps}</b><span>swaps by the agent</span></div>
          <div className="tile"><b>{v.policy.max_trades_per_day}/day</b><span>trade limit you set</span></div>
          <div className="tile"><b style={{ fontSize: 17 }}>{card ? <Link href={`/strategy/?a=${encodeURIComponent(v.strategy.account)}&id=${encodeURIComponent(v.strategy.id)}`}>{card.name}</Link> : v.strategy.id}</b><span>strategy followed</span></div>
        </div>
      </section>

      <div className="grid g2">
        <section className="card">
          <h2>Who can move your money</h2>
          <p className="hint" style={{ marginTop: -6 }}>Checked live against the chain each time this page loads.</p>
          <ul className="checks">
            <li><span className={`m ${onlyOwnerKey ? 'ok' : 'bad'}`}>{onlyOwnerKey ? '✓' : '✗'}</span><div><b>Only you hold a full-access key.</b> The vault has {v.fullKeys.length} full-access key{v.fullKeys.length === 1 ? '' : 's'}{onlyOwnerKey ? ", and it is the owner's" : ''}: <code>{short(v.fullKeys[0] ?? '', 18)}</code>. The platform holds none.</div></li>
            <li><span className="m ok">✓</span><div><b>Only you can withdraw, pause or change the rules.</b> <code>withdraw</code>, <code>set_paused</code>, <code>set_policy</code> and <code>set_agent</code> check the caller is the owner.</div></li>
            <li><span className="m ok">✓</span><div><b>The agent can only swap.</b> <code>{v.agent}</code> may call <code>swap</code> for allowed tokens, under each cap, at most {v.policy.max_trades_per_day} times a day, and only to a fresh NEAR Intents deposit address. Output and refunds come back to the vault.</div></li>
          </ul>
          <p className="hint">Contract source: <a href="https://github.com/s111s/top-notch-vaults/tree/main/contract" target="_blank" rel="noopener">contract/src/lib.rs</a> (Rust, near-sdk, 13 tests).</p>
        </section>

        <section className="card">
          <h2>Holdings and the caps you set</h2>
          <div className="tbl"><table><thead><tr><th>Token</th><th>Holding</th><th>USD</th><th>Agent cap / swap</th></tr></thead><tbody>
            {v.holdings.map((h) => <tr key={h.contract}><td>{h.sym}</td><td>{amt(h.amount)}</td><td>{money(h.usd)}</td><td>{amt(h.cap)} {h.sym}</td></tr>)}
          </tbody></table></div>
          <p className="hint">Balances from each token contract, prices from the 1Click token list.</p>
        </section>
      </div>

      <section className="card">
        <div className="spread"><h2 style={{ margin: 0 }}>The agent's next move</h2><button className="ghost" onClick={runQuotes} disabled={quoting}>{quoting ? 'Quoting…' : 'Refresh live quote'}</button></div>
        <p className="hint">
          Latest signal on-chain{signal ? <> for the <b>{signal.date}</b> candle: {Object.keys(signal.weights).length ? Object.entries(signal.weights as Record<string, number>).map(([k, w]) => `${k} ${(w * 100).toFixed(0)}%`).join(', ') : '100% USDC'}</> : ': none yet'}.
          {' '}{plan.length ? `The vault is off target, so the agent would make ${plan.length} trade${plan.length > 1 ? 's' : ''}.` : 'The vault already matches it, so the agent would not trade. Below is a sample $1 quote so you can see the route.'}
        </p>
        <div className="tbl"><table><thead><tr><th>Swap</th><th>Size</th><th>You'd receive (live 1Click quote)</th><th>Fees paid inside the swap</th></tr></thead><tbody>
          {(quotes ?? (plan.length ? plan : [{ from: 'USDC', to: 'NEAR', usd: 1 }])).map((q, i) => (
            <tr key={i}><td>{q.from} → {q.to}</td><td>{money(q.usd)}</td>
              <td>{!quotes ? <span className="hint">asking 1Click…</span> : 'error' in q && q.error ? <span className="neg">{q.error}</span> : 'out' in q ? <>{amt(Number(q.out))} {q.to} <span className="hint">(${Number(q.outUsd).toFixed(2)}, ~{q.eta}s)</span></> : null}</td>
              <td>{card ? `researcher ${card.fee.bps} bps + platform ${PLATFORM_FEE.bps} bps` : '—'}</td></tr>))}
        </tbody></table></div>
        <p className="hint">Dry quotes from the NEAR Intents 1Click API with <code>recipient = refundTo = {v.id}</code> and the fees in <code>appFees</code>. The agent uses the same request with <code>dry: false</code>, then calls <code>vault.swap</code> to the deposit address 1Click returns.</p>
      </section>

      <SignedNote />

      <section className="card">
        <h2>What the agent did ({trades.length} trades)</h2>
        {trades.length ? <div className="tbl"><table><thead><tr><th>Time (UTC)</th><th>Swap</th><th>USD</th><th>Signal</th><th>Fees inside the swap</th><th>Result</th><th>Proof</th></tr></thead><tbody>
          {[...trades].reverse().map((t) => <tr key={t.txHash}><td>{t.at.slice(0, 16).replace('T', ' ')}</td><td>{t.from} → {t.to}</td><td>{money(Number(t.usd))}</td><td>{t.signal_date}</td>
            <td>{t.appFees.filter((f) => f.recipient.length < 40).map((f) => `${f.fee} bps ${f.recipient}`).join(', ')}</td>
            <td><span className={`pill ${t.status === 'SUCCESS' ? 'ok' : 'bad'}`}>{t.status}</span>{t.amountOut && <div className="hint">got {amt(Number(t.amountOut))} {t.to}</div>}</td>
            <td><a href={explorerTx(t.txHash)} target="_blank" rel="noopener">vault.swap</a> · <a href={`https://explorer.near-intents.org/transactions/${t.depositAddress}`} target="_blank" rel="noopener">1Click</a></td></tr>)}
        </tbody></table></div> : <p className="hint">No trades yet.</p>}
        <p className="hint">Each trade is a <code>vault.swap</code> transaction signed by the agent on mainnet and settled by NEAR Intents. Fees shown are what 1Click recorded inside each swap. The <Link href="/audit/">audit</Link> rechecks every trade against the strategy's signals.</p>
      </section>

      <OwnerControls vault={v} isOwner={isOwner} onDone={reload} />
    </>
  );
}
