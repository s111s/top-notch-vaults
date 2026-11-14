#!/usr/bin/env bash
# The daily cycle, run after each daily candle closes (00:20 UTC):
# prices -> researcher signals -> managed agent rebalances the vault -> audits -> data for the site.
set -euo pipefail
cd "$(dirname "$0")/.."
node agent/fetch-prices.mjs 365
node agent/researcher.mjs signal dip-in-uptrend
node agent/researcher.mjs signal trend-5-20
node agent/researcher.mjs signal eco-reversal
node agent/researcher.mjs curve dip-in-uptrend
node agent/researcher.mjs curve trend-5-20
node agent/researcher.mjs curve eco-reversal
node agent/managed-agent.mjs run
node agent/strategy-audit.mjs dip-in-uptrend
node agent/strategy-audit.mjs trend-5-20
node agent/strategy-audit.mjs eco-reversal
node agent/auditor.mjs alpha-bot-demo.near
