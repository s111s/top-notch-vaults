'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/lib/wallet';
import { short } from '@/lib/near';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/vault/', label: 'My vault' },
  { href: '/strategies/', label: 'Strategies' },
  { href: '/leaderboard/', label: 'Leaderboard' },
  { href: '/lab/', label: 'Lab' },
];

export function Nav() {
  const path = usePathname();
  const { accountId, ready, connect, disconnect } = useWallet();
  return (
    <nav className="top"><div className="wrap">
      <Link href="/" className="brand"><i aria-hidden /> <span>Top Notch Vaults</span></Link>
      <div className="links">
        {LINKS.map((l) => <Link key={l.href} href={l.href} className={path === l.href || (l.href !== '/' && path?.startsWith(l.href)) ? 'on' : ''}>{l.label}</Link>)}
      </div>
      {accountId
        ? <button className="ghost" onClick={disconnect} title="Disconnect">{short(accountId, 14)}</button>
        : <button onClick={connect} disabled={!ready}>Connect wallet</button>}
    </div></nav>
  );
}
