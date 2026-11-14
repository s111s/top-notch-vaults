export const AI_MODEL: string;
export const NEAR_AI: string;
export const STYLES: { id: string; label: string; hint: string; brief: string }[];
export const FILTERS: { id: string; label: string; hint: string; brief: string }[];
export const RISKS: { id: string; label: string; hint: string; settings: Record<string, unknown> }[];
export function comboKey(style: string, filters: string[]): string;
export function sha256Hex(text: string): Promise<string>;
export function generate(style: string, filters: string[], opts?: { apiKey?: string; fetchImpl?: typeof fetch }): Promise<any>;
