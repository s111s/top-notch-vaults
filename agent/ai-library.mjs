// Pre-generates the free library of AI-built strategies: one NEAR AI Cloud generation per skill
// combo (style x filters), each kept with its exact request, response and TEE signature.
// Usage: NODE_USE_ENV_PROXY=1 NEAR_AI_API_KEY=... node agent/ai-library.mjs
import fs from 'fs';
import { STYLES, FILTERS, comboKey, generate } from '../lib/aiBuilder.js';

const OUT = new URL('../public/data/ai-library.json', import.meta.url);
const lib = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
// Library = every core style alone and with each single skill, at the medium horizon. Bigger combos,
// other horizons and personal notes are built fresh through the relay.
const all = STYLES.flatMap((s) => [[s.id, []], ...FILTERS.map((f) => [s.id, [f.id]])]);
const keep = new Set(all.map(([s, f]) => comboKey(s, f)));
for (const k of Object.keys(lib)) if (!keep.has(k)) delete lib[k]; // drop combos no longer offered
const jobs = all.filter(([s, f]) => !lib[comboKey(s, f)] || process.argv.includes('--all'));
console.log(`${jobs.length} combos to generate`);
const only = process.argv[2] && !process.argv[2].startsWith('--') ? Number(process.argv[2]) : jobs.length;
const queue = jobs.slice(0, only);
async function worker() {
  while (queue.length) {
    const [s, f] = queue.shift();
    try {
      const g = await generate(s, f, { apiKey: process.env.NEAR_AI_API_KEY });
      lib[comboKey(s, f)] = g;
      console.log(`${comboKey(s, f)}: ${g.answer.name} | ${g.answer.formula} | signed ${!!g.signature}`);
      fs.writeFileSync(OUT, JSON.stringify(lib, null, 1));
    } catch (e) { console.log(`${comboKey(s, f)} FAILED ${e.message}`); }
  }
}
await Promise.all([worker(), worker(), worker(), worker(), worker(), worker()]);
console.log(`library: ${Object.keys(lib).length} strategies`);
