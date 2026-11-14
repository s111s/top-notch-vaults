// One place for every NEAR endpoint and account this app talks to.
export const NETWORK = 'mainnet' as const;
export const RPC_URLS = ['https://rpc.mainnet.fastnear.com', 'https://rpc.mainnet.near.org'];
export const ONECLICK_API = 'https://1click.chaindefuser.com';
export const NEAR_AI_API = 'https://cloud-api.near.ai/v1';
export const REGISTRY = 'top-notch.near';
export const DEMO_VAULT = 'vault-1.top-notch.near';
export const PLATFORM_FEE = { recipient: REGISTRY, bps: 10 };
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
export const asset = (p: string) => `${BASE}${p.startsWith('/') ? p : `/${p}`}`;
export const explorerTx = (h: string) => `https://nearblocks.io/txns/${h}`;
export const explorerAccount = (a: string) => `https://nearblocks.io/address/${a}`;
export const intentsExplorer = (addr: string) => `https://explorer.near-intents.org/transactions/${addr}`;

export type Asset = { sym: string; assetId: string; contract: string; decimals: number };
const USDC_CONTRACT = '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1';
export const ASSETS: Record<string, Asset> = {
  NEAR: { sym: 'NEAR', assetId: 'nep141:wrap.near', contract: 'wrap.near', decimals: 24 },
  BTC: { sym: 'BTC', assetId: 'nep141:nbtc.bridge.near', contract: 'nbtc.bridge.near', decimals: 8 },
  ETH: { sym: 'ETH', assetId: 'nep141:eth.bridge.near', contract: 'eth.bridge.near', decimals: 18 },
  RHEA: { sym: 'RHEA', assetId: 'nep141:token.rhealab.near', contract: 'token.rhealab.near', decimals: 18 },
  AURORA: { sym: 'AURORA', assetId: 'nep141:aaaaaa20d9e0e2461697782ef11675f668207961.factory.bridge.near', contract: 'aaaaaa20d9e0e2461697782ef11675f668207961.factory.bridge.near', decimals: 18 },
  USDC: { sym: 'USDC', assetId: `nep141:${USDC_CONTRACT}`, contract: USDC_CONTRACT, decimals: 6 },
};
export const assetByContract = (c: string): Asset | undefined => Object.values(ASSETS).find((a) => a.contract === c);
export const AI_RELAY = process.env.NEXT_PUBLIC_AI_RELAY ?? 'https://top-notch-ai.s111s-7es.workers.dev';
