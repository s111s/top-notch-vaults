# Top Notch AI relay (Cloudflare Worker)

Holds the platform's NEAR AI Cloud key and gates spending:
- **Free tier**: activated NEAR wallets (account exists, holds >= 0.1 NEAR, proves ownership with a NEP-413 signed message) get 5 generations on DeepSeek V4.1 Flash, which runs inside NEAR AI Cloud's TEE.
- **Pro tier**: Claude Opus 5.5 through NEAR AI Cloud, unlocked by a 0.01 NEAR transfer to `top-notch.near` (each transaction used once, checked on-chain).

Source: `src/index.js` (imports `../../lib/aiBuilder.js`). Build the single-file bundle with
`npx esbuild worker/src/index.js --bundle --format=esm --platform=neutral --target=es2022 --outfile=worker/dist/top-notch-ai.js`.

Deploy: paste `dist/top-notch-ai.js` into a Cloudflare Worker, add the secret `NEAR_AI_API_KEY`, and bind a KV namespace as `USAGE`.
Endpoints: `GET /health`, `POST /quota {auth}`, `POST /generate {auth, style, filters, tier, payTx?}`.
