// Read-only access to NEAR mainnet through near-api-js, with failover between public RPCs.
import { FailoverRpcProvider, JsonRpcProvider } from 'near-api-js';
import { RPC_URLS } from './config';

export const provider = new FailoverRpcProvider(RPC_URLS.map((url) => new JsonRpcProvider({ url })));

export async function view<T>(contractId: string, method: string, args: Record<string, unknown> = {}): Promise<T> {
  return (await provider.callFunction({ contractId, method, args })) as T;
}

export async function fullAccessKeys(accountId: string) {
  const list = await provider.viewAccessKeyList({ accountId, finalityQuery: { finality: 'final' } });
  return list.keys.filter((k) => k.access_key.permission === 'FullAccess').map((k) => k.public_key);
}

export async function nearBalance(accountId: string) {
  const a = await provider.viewAccount({ accountId });
  return a;
}

export const fromRaw = (raw: string | bigint, decimals: number) => Number(BigInt(raw)) / 10 ** decimals;
export const toRaw = (amount: number, decimals: number) => BigInt(Math.floor(amount * 10 ** Math.min(decimals, 15))) * 10n ** BigInt(Math.max(0, decimals - 15));
export const short = (s: string, n = 10) => (s.length > n + 4 ? `${s.slice(0, n)}…` : s);
