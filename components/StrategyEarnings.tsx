'use client';
// A strategy's usage and its researcher's earnings, plus the owner-only fee withdrawal from NEAR Intents.
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { explorerTx } from '@/lib/config';
import { intentsBalances, type Balance, type Usage } from '@/lib/earnings';
import { useWallet } from '@/lib/wallet';

const usd = (n: number) => (n < 0.01 && n > 0 ? `$${n.toFixed(4)}` : `$${n.toFixed(2)}`);

export function StrategyEarnings({ account, usage, feeBps }: { account: string; usage: Usage | null; feeBps: number }) {
  const { accountId, connect, ready, call } = useWallet();
  const [bal, setBal] = useState<Balance[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<{ ok: boolean; text: string; tx?: string } | null>(null);
  const isOwner = accountId === account;
  const load = () => intentsBalances(account).then(setBal).catch(() => setBal([]));
  useEffect(() => { load(); }, [account]); // eslint-disable-line react-hooks/exhaustive-deps

  async function withdraw(b: Balance) {
    setBusy(true); setRes(null);
    try {
      // NEAR Intents: move the token from the researcher's intents.near balance to their own wallet.
      const tx = await call({ receiverId: 'intents.near', method: 'ft_withdraw', args: { token: b.contract, receiver_id: account, amount: b.raw }, gasTgas: 100, depositYocto: '1' });
      setRes({ ok: true, text: `Withdrew ${b.amount} ${b.sym} to ${account}.`, tx }); load();
    } catch (e) { setRes({ ok: false, text: String((e as Error).message ?? e).slice(0, 220) }); }
    setBusy(false);
  }

  return (
    <section className="card" id="earnings">
      <div className="spread"><h2 style={{ margin: 0 }}>Usage and earnings</h2>{isOwner && <span className="pill ok">You own this strategy</span>}</div>
      <div className="tiles" style={{ marginTop: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
        <div className="stat"><span className="k">Vaults and agents using it</span><span className="v">{usage ? usage.users.length : '…'}</span><span className="m">{usage?.users.length ? usage.users.join(', ') : 'None yet'}</span></div>
        <div className="stat"><span className="k">Swaps by followers</span><span className="v">{usage ? usage.swaps : '…'}</span><span className="m">Recorded 1Click swaps on its signals</span></div>
        <div className="stat"><span className="k">Volume traded</span><span className="v">{usage ? usd(usage.volume) : '…'}</span><span className="m">Mainnet demo sizes</span></div>
        <div className="stat"><span className="k">Fees earned</span><span className="v pos">{usage ? usd(usage.fees) : '…'}</span><span className="m">{feeBps} bps of each swap, paid inside 1Click</span></div>
      </div>
      {usage && usage.trades.length > 0 && <div className="tbl" style={{ marginTop: 12 }}><table><thead><tr><th>When</th><th>By</th><th>Swap</th><th>Fee to researcher</th></tr></thead><tbody>
        {usage.trades.map((t) => <tr key={t.txHash}><td>{t.at.slice(0, 16).replace('T', ' ')}</td><td><code>{t.user}</code></td><td><a href={explorerTx(t.txHash)} target="_blank" rel="noopener">{usd(Number(t.usd))}</a></td><td>{usd(t.fee)}</td></tr>)}
      </tbody></table></div>}

      <h3 style={{ marginTop: 18 }}>Withdraw fees</h3>
      <p className="hint" style={{ marginTop: 0 }}>1Click credits app fees to the researcher's balance on NEAR Intents (<code>intents.near</code>). Read live for <code>{account}</code>:</p>
      {!bal ? <p className="hint">Reading the balance…</p> : !bal.length ? <p className="hint">Nothing to withdraw right now: the balance on NEAR Intents is 0.</p> :
        <div style={{ display: 'grid', gap: 6 }}>{bal.map((b) => <div key={b.tokenId} className="row"><b>{b.amount.toLocaleString('en-US', { maximumFractionDigits: 8 })} {b.sym}</b>
          {isOwner ? <button disabled={busy} onClick={() => withdraw(b)}>Withdraw to my wallet</button> : null}</div>)}</div>}
      {!isOwner && <p className="hint">{!accountId ? <>Only the strategy's owner can withdraw. <button className="ghost" onClick={connect} disabled={!ready}>Connect wallet</button></> : <>Only <code>{account}</code> can withdraw these fees; you're signed in as <code>{accountId}</code>.</>}</p>}
      {busy && <div className="toast">Waiting for your wallet…</div>}
      {res && <div className={`toast ${res.ok ? 'ok' : 'bad'}`}>{res.text} {res.tx && <a href={explorerTx(res.tx)} target="_blank" rel="noopener">View transaction</a>}</div>}
      <p className="hint" style={{ marginBottom: 0 }}>Your strategies and totals are on <Link href="/strategies/">Strategies</Link>.</p>
    </section>
  );
}
