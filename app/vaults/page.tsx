'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { short } from '@/lib/near';
import { useWallet } from '@/lib/wallet';
import { isExample, loadVaults, type ListedVault } from '@/lib/vaults';
import { loadLeaderboards, type InvestorRow } from '@/lib/leaderboard';

const money = (n: number) => `$${n.toFixed(2)}`;
const pctS = (x: number) => `${x >= 0 ? '+' : ''}${(x * 100).toFixed(1)}%`;

export default function Vaults() {
  const { accountId } = useWallet();
  const [live, setLive] = useState<ListedVault[] | null>(null);
  const [sims, setSims] = useState<InvestorRow[] | null>(null);
  useEffect(() => {
    loadVaults().then(setLive).catch(() => setLive([]));
    loadLeaderboards().then((l) => setSims(l.investors.filter((r) => r.source === 'simulated'))).catch(() => setSims([]));
  }, []);
  const listed = live?.filter((x) => x.public || x.v.owner === accountId) ?? null;
  const hidden = live ? live.filter((x) => !x.public && x.v.owner !== accountId).length : 0;

  return <>
    <div className="hero" style={{ paddingTop: 8 }}>
      <div className="eyebrow">Public vaults</div>
      <h1 style={{ fontSize: 32 }}>See how real vaults are doing.</h1>
      <p className="lead" style={{ fontSize: 16 }}>Each vault is its owner's own NEAR account, read live from mainnet. Owners choose whether their vault is listed here; private vaults are left out. To see yours, open <Link href="/vault/">My vault</Link> and connect your wallet.</p>
    </div>

    <section className="card">
      <div className="spread"><h2 style={{ margin: 0 }}>Live on mainnet</h2>{hidden > 0 && <span className="hint">{hidden} private vault{hidden > 1 ? 's' : ''} not shown</span>}</div>
      {!listed ? <p className="hint">Reading vaults from NEAR mainnet…</p> : !listed.length ? <p className="hint">No public vaults right now.</p> :
        <div className="tbl" style={{ marginTop: 10 }}><table><thead><tr><th>Vault</th><th>Value now</th><th>Strategy</th><th>Agent swaps</th><th>Owner</th></tr></thead><tbody>
          {listed.map(({ v, public: pub }) => <tr key={v.id}>
            <td><Link href={`/vault/?id=${encodeURIComponent(v.id)}`}><b>{v.id}</b></Link><br />
              {isExample(v.id) && <span className="pill ok">Example vault · real funds</span>} {!pub && <span className="pill">Private: only you see it here</span>} {v.paused && <span className="pill bad">Paused</span>}</td>
            <td><b>{money(v.equity)}</b></td>
            <td>{v.strategy.card?.json?.name ? <Link href={`/strategy/?a=${encodeURIComponent(v.strategy.account)}&id=${encodeURIComponent(v.strategy.id)}`}>{v.strategy.card.json.name}</Link> : v.strategy.id}</td>
            <td>{v.swaps}</td>
            <td><code title={v.owner}>{short(v.owner, 12)}</code>{v.owner === accountId && <> <span className="pill ok">you</span></>}</td>
          </tr>)}
        </tbody></table></div>}
      <p className="hint" style={{ marginBottom: 0 }}>The example vault is run by the Top Notch team with a small real deposit, so anyone can check every claim on-chain before self-serve vaults open.</p>
    </section>

    <section className="card">
      <h2 style={{ marginTop: 0 }}>Simulated vaults</h2>
      <p className="hint" style={{ marginTop: 0 }}>Not real money. Each shows what a vault would have done following a listed strategy from the date shown, computed from that strategy's published backtest after fees. They're here so strategies can be compared on more than one vault.</p>
      {!sims ? <p className="hint">Computing…</p> : <div className="tbl"><table><thead><tr><th>Vault</th><th>Strategy</th><th>Since</th><th>Deposit</th><th>Value</th><th>Profit</th></tr></thead><tbody>
        {sims.map((r) => <tr key={r.id}><td><b>{r.id}</b> <span className="pill">Simulated</span></td><td>{r.strategyName}</td><td>{r.since}</td><td>{money(r.deposit)}</td><td>{money(r.value)}</td><td className={r.profitPct >= 0 ? 'pos' : 'neg'}>{pctS(r.profitPct)}</td></tr>)}
      </tbody></table></div>}
      <p className="hint" style={{ marginBottom: 0 }}>Rank all vaults by profit, volume and win rate on the <Link href="/leaderboard/">leaderboard</Link>.</p>
    </section>
  </>;
}
