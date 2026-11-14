// NEAR AI Cloud runs the model inside a TEE and signs "model:request_sha256:response_sha256" with an
// ECDSA key that is bound to the enclave by its attestation report. We check the signature in the
// browser with viem and compare the recovered signer with the one the attestation reports.
import { recoverMessageAddress } from 'viem';
import { NEAR_AI_API } from './config';

export type SignedLetter = { model: string; chat_id: string; text: string; text_sha256?: string; signature: string | null; signed_text: string | null; signing_address: string | null };

export async function verifyLetter(l: SignedLetter) {
  if (!l.signature || !l.signed_text) return { ok: false, reason: 'No signature stored for this note.' } as const;
  const recovered = await recoverMessageAddress({ message: l.signed_text, signature: l.signature as `0x${string}` });
  const matches = recovered.toLowerCase() === (l.signing_address ?? '').toLowerCase();
  const [model] = l.signed_text.split(':');
  return { ok: matches, recovered, model, reason: matches ? 'Signature recovers to the TEE signing address.' : 'Recovered signer does not match.' } as const;
}

/** Ask NEAR AI Cloud, live, which signing address its TEE attests to for this model. */
export async function attestedSigners(model: string): Promise<string[] | null> {
  try {
    const r = await fetch(`${NEAR_AI_API}/attestation/report?model=${encodeURIComponent(model)}&signing_algo=ecdsa`).then((x) => x.json());
    const list: string[] = (r.model_attestations ?? []).map((m: { signing_address?: string }) => m.signing_address).filter(Boolean);
    return [...new Set(list.map((a) => a.toLowerCase()))];
  } catch { return null; }
}
