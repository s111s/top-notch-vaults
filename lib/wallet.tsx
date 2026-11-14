'use client';
// Wallet login with NEAR Connect (@hot-labs/near-connect), the connector NEAR's own docs and agent
// skills recommend: HOT, Meteor, Intear, MyNearWallet, Nightly, OKX and more, each in a sandbox.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { NearConnector } from '@hot-labs/near-connect';
import { NETWORK } from './config';

type Call = { receiverId: string; method: string; args: Record<string, unknown>; gasTgas?: number; depositYocto?: string };
export type Auth = { accountId: string; publicKey: string; signature: string; message: string; nonce: string };
type Ctx = { accountId: string | null; ready: boolean; connect: () => Promise<void>; disconnect: () => Promise<void>; call: (c: Call) => Promise<string>;
  signAuth: (message: string, recipient: string) => Promise<Auth>; transfer: (receiverId: string, yocto: string) => Promise<string> };
const WalletCtx = createContext<Ctx | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const ref = useRef<NearConnector | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { NearConnector } = await import('@hot-labs/near-connect');
      const c = new NearConnector({ network: NETWORK, footerBranding: { heading: 'Top Notch Vaults', link: 'https://github.com/s111s/top-notch-vaults', linkText: 'source' } as never });
      ref.current = c;
      c.on('wallet:signIn', (t) => setAccountId(t.accounts[0]?.accountId ?? null));
      c.on('wallet:signOut', () => setAccountId(null));
      try { const w = await c.wallet(); const acc = await w.getAccounts(); if (alive && acc[0]) setAccountId(acc[0].accountId); } catch {}
      if (alive) setReady(true);
    })();
    return () => { alive = false; };
  }, []);

  const connect = useCallback(async () => { await ref.current?.connect(); }, []);
  const disconnect = useCallback(async () => { await ref.current?.disconnect(); setAccountId(null); }, []);
  const call = useCallback(async ({ receiverId, method, args, gasTgas = 50, depositYocto = '0' }: Call) => {
    if (!ref.current) throw new Error('Wallet is still loading');
    const w = await ref.current.wallet();
    const r = await w.signAndSendTransaction({
      receiverId,
      actions: [{ type: 'FunctionCall', params: { methodName: method, args, gas: (BigInt(gasTgas) * 10n ** 12n).toString(), deposit: depositYocto } }],
    });
    // Some wallets resolve even when the receipt failed: surface the contract's panic as an error.
    const out = r as { transaction?: { hash?: string }; status?: { Failure?: unknown }; receipts_outcome?: { outcome: { status: { Failure?: unknown } } }[] };
    const failure = out?.status?.Failure ?? out?.receipts_outcome?.find((x) => x.outcome.status.Failure)?.outcome.status.Failure;
    if (failure) { const err = new Error(JSON.stringify(failure)); (err as Error & { tx?: string }).tx = out.transaction?.hash; throw err; }
    return out?.transaction?.hash ?? '';
  }, []);

  // NEP-413 signed message: proves the visitor controls this account, costs no gas.
  const signAuth = useCallback(async (message: string, recipient: string) => {
    if (!ref.current) throw new Error('Wallet is still loading');
    const w = await ref.current.wallet();
    const nonce = crypto.getRandomValues(new Uint8Array(32));
    const signed = await w.signMessage({ message, recipient, nonce });
    const b64 = (u: Uint8Array) => btoa(String.fromCharCode(...u));
    return { accountId: signed.accountId, publicKey: signed.publicKey, signature: signed.signature, message, nonce: b64(nonce) };
  }, []);
  const transfer = useCallback(async (receiverId: string, yocto: string) => {
    if (!ref.current) throw new Error('Wallet is still loading');
    const w = await ref.current.wallet();
    const r = await w.signAndSendTransaction({ receiverId, actions: [{ type: 'Transfer', params: { deposit: yocto } }] });
    const hash = (r as { transaction?: { hash?: string } })?.transaction?.hash;
    if (!hash) throw new Error('The wallet did not return a transaction hash');
    return hash;
  }, []);

  return <WalletCtx.Provider value={{ accountId, ready, connect, disconnect, call, signAuth, transfer }}>{children}</WalletCtx.Provider>;
}

export function useWallet() {
  const c = useContext(WalletCtx);
  if (!c) throw new Error('useWallet outside WalletProvider');
  return c;
}
