// NEAR Intents through the official 1Click TypeScript SDK. The agent uses the same calls for real
// trades (dry: false); the page uses dry quotes so anyone can see exactly what the agent would get.
import { OneClickService, OpenAPI, QuoteRequest } from '@defuse-protocol/one-click-sdk-typescript';
import { ONECLICK_API } from './config';

OpenAPI.BASE = ONECLICK_API;

export type TokenPrice = { assetId: string; symbol: string; price: number; decimals: number };
let tokensP: Promise<Record<string, TokenPrice>> | null = null;
export function prices() {
  tokensP ??= OneClickService.getTokens().then((list) => Object.fromEntries(list.map((t) => [t.assetId, t as unknown as TokenPrice])));
  return tokensP;
}

export async function dryQuote(p: { from: string; to: string; amountRaw: string; vault: string; appFees: { recipient: string; fee: number }[] }) {
  const req: QuoteRequest = {
    dry: true,
    swapType: QuoteRequest.swapType.EXACT_INPUT,
    slippageTolerance: 100,
    originAsset: p.from,
    depositType: QuoteRequest.depositType.ORIGIN_CHAIN,
    destinationAsset: p.to,
    amount: p.amountRaw,
    refundTo: p.vault,
    refundType: QuoteRequest.refundType.ORIGIN_CHAIN,
    recipient: p.vault,
    recipientType: QuoteRequest.recipientType.DESTINATION_CHAIN,
    deadline: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
    appFees: p.appFees,
  };
  return OneClickService.getQuote(req);
}
