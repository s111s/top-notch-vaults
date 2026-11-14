export const KNOWN_ACCOUNTS: string[];
export function loadMarket(extra?: (string | null | undefined)[]): Promise<{ strategies: any[]; followers: any[]; accounts: string[] }>;
export const OPINION_LABEL: Record<string, string>;
export function lineChart(...a: any[]): string;
