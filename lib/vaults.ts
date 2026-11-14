// The vault directory. Vaults are found from a known list (there is no vault factory yet), and an
// owner can hide theirs from the public list with one registry record signed by the owner's own
// account: {"kind":"vault-visibility","vault":"…","public":false}. Only the owner's record counts.
import { DEMO_VAULT, REGISTRY } from './config';
import { view } from './near';
import { entries, loadVault, type VaultState } from './vault';

export const KNOWN_VAULTS = [DEMO_VAULT];
export const isExample = (id: string) => id === DEMO_VAULT;

export const visibilityRecord = (vault: string, isPublic: boolean) => JSON.stringify({ kind: 'vault-visibility', v: 1, vault, public: isPublic });
export { REGISTRY };

/** Latest visibility the owner published for this vault. Public unless the owner said otherwise. */
export async function isPublic(vault: string, owner: string): Promise<boolean> {
  const es = await entries(owner).catch(() => []);
  const last = es.filter((e) => e.json?.kind === 'vault-visibility' && e.json.vault === vault).at(-1);
  return last ? last.json.public !== false : true;
}

export type ListedVault = { v: VaultState; public: boolean };
export async function loadVaults(): Promise<ListedVault[]> {
  const out = await Promise.all(KNOWN_VAULTS.map(async (id) => {
    try { const v = await loadVault(id); return { v, public: await isPublic(id, v.owner) }; } catch { return null; }
  }));
  return out.filter(Boolean) as ListedVault[];
}

/** Vaults whose on-chain owner is this account. */
export async function vaultsOwnedBy(account: string): Promise<string[]> {
  const owners = await Promise.all(KNOWN_VAULTS.map((id) => view<string>(id, 'get_owner').catch(() => null)));
  return KNOWN_VAULTS.filter((_, i) => owners[i] === account);
}
