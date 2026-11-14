// Minimal base58 (Bitcoin alphabet), enough to turn an implicit account id into its ed25519 key.
const A = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
export function base58(bytes: Uint8Array): string {
  let n = 0n; for (const b of bytes) n = n * 256n + BigInt(b);
  let s = ''; while (n > 0n) { s = A[Number(n % 58n)] + s; n /= 58n; }
  for (const b of bytes) { if (b !== 0) break; s = '1' + s; }
  return s;
}
/** An implicit NEAR account (64 hex chars) is its own ed25519 public key. */
export function implicitToKey(account: string): string | null {
  if (!/^[0-9a-f]{64}$/.test(account)) return null;
  const bytes = Uint8Array.from(account.match(/../g)!.map((h) => parseInt(h, 16)));
  return `ed25519:${base58(bytes)}`;
}
