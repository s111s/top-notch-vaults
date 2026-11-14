# Top Notch Vaults

**Run a proven trading strategy from a vault only you can withdraw from.**
Pick a strategy with an audited track record, fund your own NEAR vault, and an AI agent trades it through **NEAR Intents**. It can never take your money, and every day **NEAR AI Cloud** signs a note of what it did, which your browser verifies.

> Built at NEAR HACKATHON 2026. Tracks: agents, defi, business.
> Live app: https://s111s.github.io/top-notch-vaults/ · everything below runs on NEAR **mainnet**.

## The problem

AI agents can trade, but nobody wants to hand one their keys. Copy-trading and signal groups ask you to trust screenshots or give up custody. NEAR's own framing: the blocker for agents is trust with real money.

## What a user gets

| | |
|---|---|
| **Your vault, your keys** | A NEAR account whose only full-access key is yours. A Rust contract lets the agent call one method, `swap`, for tokens you allow, under caps you set, a limited number of times a day, and only to a fresh NEAR Intents deposit address. Output and refunds land back in the vault. |
| **Real strategies, honest numbers** | Researchers publish formula strategies with backtests, out-of-sample stats and an independent audit. Cards and daily signals are timestamped on-chain, so track records can't be backdated. Logic can stay hidden behind a hash. |
| **Execution through NEAR Intents** | Every trade is a 1Click swap. The researcher's fee (20 bps) and the platform's (10 bps) are paid inside the swap via `appFees`: no custody, no billing. |
| **A note you can verify** | Each day a model running in NEAR AI Cloud's TEE writes what the agent did and signs it. The page recovers the signer and checks it against the live TEE attestation. |
| **Build a strategy with AI** | New researchers pick a style (momentum, mean reversion, dip buying, breakout), extra skills (trend, calm markets, volume) and a risk level. A model in NEAR AI Cloud's TEE writes the formula and explains it in plain English; our code backtests it. The page proves the exact prompt, the unedited answer and the TEE signature. Free from a signed library of all 32 combos. Fresh generations: **free** on DeepSeek V4.1 Flash (in NEAR AI's TEE) for activated NEAR wallets, 5 each; **best quality** on Claude Opus 5.5 for 0.01 NEAR, paid from your wallet; or unlimited with your own NEAR AI key. |
| **Leaderboards that can't be gamed by luck** | Strategies ranked by trusted investors, funds, drawdown and unseen-data Sharpe; investors by profit %, profit $, volume and win rate. The Top Notch score weighs them all and pulls thin track records toward the middle. |
| **Control from your wallet** | Pause, switch strategy or withdraw with NEAR Connect (HOT, Meteor, Intear, MyNearWallet, OKX…). A stranger who tries is rejected on-chain. |

## NEAR stack

| NEAR product | Used for | Code |
|---|---|---|
| **NEAR Intents · 1Click API** (`@defuse-protocol/one-click-sdk-typescript`) | live dry quotes on the page; real swaps by the agent, fees in `appFees` | `lib/oneclick.ts`, `agent/managed-agent.mjs` |
| **NEAR smart contracts** (Rust, `near-sdk`) | the vault: agent may only `swap`/`wrap_near`; owner may `withdraw`, `set_paused`, `set_policy`, `set_agent` (13 unit tests) | `contract/src/lib.rs` |
| **NEAR AI Cloud** (TEE, OpenAI-compatible API) | AI strategy builder; signed daily note and audit letters; signature, request/response hashes and attestation checked in the browser | `lib/aiBuilder.js`, `components/AIBuilder.tsx`, `lib/signature.ts`, `agent/ai-library.mjs`, `agent/letter.mjs` |
| **NEAR Connect** (`@hot-labs/near-connect`) | wallet login and owner transactions | `lib/wallet.tsx`, `components/OwnerControls.tsx` |
| **near-api-js** (`FailoverRpcProvider`) | every live read: keys, balances, policy, registry | `lib/near.ts`, `lib/vault.ts` |
| **Registry contract** `top-notch.near` | strategy cards, signals, mandates, audit reports, append-only | `lib/market.js` |

App: Next.js 15 + React 19 + TypeScript, static export to GitHub Pages. No backend: the browser talks to NEAR RPC, 1Click and NEAR AI Cloud directly.

## Try it in 2 minutes (no install)

1. **Open** https://s111s.github.io/top-notch-vaults/
   **You should see** the live demo vault `vault-1.top-notch.near` with its value, *1 full-access key: the investor's*, the agent's swap count and the strategy it follows.
2. **Click "See a live vault".**
   **You should see**
   - *Who can move your money*: three ✓ checks read live from the chain, including that the vault's only full-access key equals the owner's key.
   - *Holdings and the caps you set*: balances of NEAR, BTC, ETH and USDC with the agent's per-swap cap for each.
   - *The agent's next move*: the latest on-chain signal (e.g. BTC 33%, ETH 33%, NEAR 33%) and a **live 1Click quote** (for example "USDC → NEAR $1.00 → 0.298 NEAR, ~22s") with the fees paid inside the swap.
3. **Press "Verify signature"** on *Today's note from your agent*.
   **You should see** three ✓: the signature recovers to `0xfe00…337e`, NEAR AI Cloud's TEE attestation for the model reports that same address right now, and the signed text names the model.
4. **Scroll to "What the agent did".**
   **You should see** three mainnet `vault.swap` trades (USDC→NEAR, BTC, ETH), each SUCCESS, with *20 bps researcher-1.top-notch.near, 10 bps top-notch.near* inside the swap and links to NearBlocks and the NEAR Intents explorer.
5. **Connect any NEAR wallet** in *Your controls* and press **Try to withdraw from this vault**.
   **You should see** the vault contract reject it: *"only the owner"*. (Real mainnet tx, ~0.0003 NEAR gas.) The vault's owner sees Pause, Withdraw and Switch strategy instead.
6. **Open Strategies → "Ecosystem 2-day reversal".**
   **You should see** the backtest vs holding NEAR, the five listing gates (it honestly fails out-of-sample), its public formula, a **Clean** audit with four ✓ checks and a letter signed in NEAR AI Cloud, and its on-chain signals.
7. **Open the Lab.** In *Build with AI* pick **Dip buying**, keep **Trend filter**, press **Build my strategy**.
   **You should see** *Trend-Filtered Dip Buy*: `-ts_sum(returns, 3) * (close > ts_mean(close, 30))` with a plain-English summary, how each part works and when it loses money, backtested right below ("$100 became $X. Holding NEAR: $Y", stats, curve, gates).
   **Press "Verify it's really from NEAR AI".** **You should see** five ✓: the sha256 of the exact prompt and of the raw answer match what the TEE signed, the formula shown is in that answer, the ECDSA signature recovers to `0xfe00…337e`, and NEAR AI Cloud's live attestation reports that address.
   *Generate fresh with NEAR AI* runs it live: connect a wallet holding at least 0.1 NEAR and sign one message (no gas) for 5 free generations, pay 0.01 NEAR for Claude Opus 5.5, or use your own NEAR AI key. Or write your own formula below, e.g. `rank(ts_mean(returns, 14)) - 0.5`.
8. **Open Leaderboard.**
   **You should see** *Top strategies* ranked by the Top Notch score (Dip in an uptrend first: best out-of-sample Sharpe and lowest drawdown), with buttons to rank by trusted investors, funds invested, lowest drawdown, Sharpe or out-of-sample Sharpe. Switch to *Top investors* to rank vaults by profit %, profit $, amount traded, win rate or the score. `vault-1.top-notch.near` is tagged **Live on mainnet**; the other rows are tagged **Simulated** (computed from each strategy's backtest) and the checkbox hides them.
9. **Open** `/audit/` and press **Run the audit**.
   **You should see** each agent swap tickmarked: allowed token, size, slippage, settled, signal in force, toward the signal, through the vault, researcher paid.

## Run it yourself

```bash
npm ci
npm run dev                    # http://localhost:3000
npm run build                  # static export in out/
cd contract && cargo test      # 13 vault tests
```

The agent (`agent/`, Node, its own `package.json`) needs the account keys, which are not in this repo:
`cd agent && npm ci && TN_KEY_DIR=… node managed-agent.mjs plan`. `agent/daily.sh` is the full daily cycle; `.github/workflows/daily.yml` runs it from repository secrets.

## Mainnet evidence

| What | Where |
|---|---|
| Investor vault (investor key only) | `vault-1.top-notch.near`, deploy `DMkxzMYwEiX8QLtz3hf11rB7AEMLv8z2visn1EFbnPgV`, init `4E1zLdf1Zao9DHXRnt1WB4dZFCmKmddY6o5nVevUvpWe` |
| Investor funds the vault | `7ea7dAh9Z8CQtEKsg1wcMdQUWQTEzrouinA4rNTSmoa` |
| Investor switches strategy with own key (`set_policy`) | `AQWQFp1VvfanBtUg7YNimai2nvStH32KPNHRN2iStKuJ` |
| Agent buys from the vault via `vault.swap` + 1Click | `Dn4vZ83C3GjF7FusakZxN6tUWL9qt3sLr1kYeVGuaz3M`, `9obGJAZ2F6J1ysjNcn8xAnd6Wdjd3KVXMiBAZ68FiAoB`, `BZGsH6w5x4sfK5d95pBiNzxT6KLDRNHayotiHpCAM69t` |
| Strategy card and signal | `6DR1xKMJhiRP2BiHuokGEw8rXd9RuZqtR9nLq8dA6tFD`, `Gqgg9rEPC9GLTPEMbPAy1t5c8vesJxmPCtaaBWihRPH2` |
| Audits | strategy `6eWM8cppC6wB2xiysoNBPrGfGwgb35qejHEtpVGnCWb3`, agent (Clean) `EKJekzjDvcj4cUpbx8ELv2XjUye4vPKszhe6nFk8MH9m` |

## Business model

Every agent swap pays the researcher 20 bps and the platform 10 bps inside the 1Click swap. No custody, no pooled fund, no invoices. AI strategy building is pay-as-you-go: the signed library is free, fresh generations are paid per call (today with your own NEAR AI key; next, a few free per wallet and then a small NEAR fee per generation). Later: a monthly fee for managed agents and paid strategy certification.

### AI cost per user (measured Nov 14 on our Build with AI prompt, NEAR AI Cloud list prices)

| Model | Runs in NEAR AI's TEE | Cost per generation | 5 free / user |
|---|---|---|---|
| DeepSeek V4.1 Flash (default) | yes, verifiable | $0.002 | $0.01 |
| GLM-5.3 Flash | yes | $0.0005 | $0.003 |
| Claude Haiku 5.5 | proxied | $0.001 | $0.005 |
| Claude Sonnet 5.5 / GPT-6 Sol | proxied | ~$0.008 | $0.04 |
| Claude Opus 5.5 | proxied | $0.014 | $0.07 |

Plan: a free tier on the TEE model (5 generations per **activated** NEAR wallet: one NEP-413 signed message proves ownership, and the account must exist and hold at least 0.1 NEAR, so a fake wallet costs more than the free usage is worth), plus a paid "best quality" frontier option at about 0.01 NEAR per generation. Built: `worker/` is that relay (a Cloudflare Worker) that holds the platform's NEAR AI key, verifies the NEP-413 signature, checks the account on-chain, counts free usage per wallet, and verifies each 0.01 NEAR payment transaction once.

## Libraries and AI-generated code

- App: `next`, `react`, `@hot-labs/near-connect`, `near-api-js`, `@defuse-protocol/one-click-sdk-typescript`, `viem` (ECDSA signature recovery). Contract: `near-sdk`. Agent: `near-api-js`, `@near-js/crypto`, `bs58`.
- Data: NEAR RPC (FastNEAR, near.org), NearBlocks, NEAR Intents 1Click API, GeckoTerminal (prices of NEAR Intents pools), NEAR AI Cloud.
- Much of the code and copy was written with Claude Code (Anthropic) under the author's direction, during the hackathon window. This repo is a rebuild of the author's earlier prototype `s111s/top-notch-audit` (same contracts and accounts) on a TypeScript stack.

## Honest limits

- Opening a vault for a new visitor isn't self-serve yet (needs a vault factory contract); the demo vault is real and on mainnet. Roadmap: one-click vault factory.
- About 6 months of daily data on a few liquid tokens: stats are noisy. Out-of-sample results and gates are shown everywhere, including where a strategy fails them.
- Long-only (swaps can't short). Demo sizes are tiny ($1–$5).
- The vault can't prove a deposit address belongs to 1Click; a compromised agent could misdirect at most one capped swap per call within the daily limit. The audit flags any deposit without a 1Click settlement and the owner can pause at once.
- The agent runs on a schedule, not yet inside a TEE. Roadmap: host it in NEAR AI Cloud's agent hosting.
