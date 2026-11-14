import type { NextConfig } from 'next';

// Static export so the whole app is served from GitHub Pages: no server, every read goes straight to
// NEAR RPC, the 1Click API and NEAR AI Cloud from the visitor's browser.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const config: NextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};
export default config;
