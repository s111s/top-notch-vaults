'use client';
import Link from 'next/link';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { backtest, FUNCTIONS } from '@/lib/alpha';
import { asset } from '@/lib/config';
import { LabResult as Result } from '@/components/LabResult';
import { AIBuilder, type Meta } from '@/components/AIBuilder';

const IDEAS: { name: string; expr: string; hint: string }[] = [
  { name: 'Buy the dip', expr: '-ts_delta(close, 3) / delay(close, 3)', hint: 'Buy what fell most in the last 3 days.' },
  { name: 'Ride the trend', expr: 'ts_mean(close, 5) / ts_mean(close, 20) - 1', hint: 'Hold coins whose 5-day average is above their 20-day average.' },
  { name: 'Steady winners', expr: 'ts_mean(returns, 21) / ts_std(returns, 21)', hint: 'Gains per unit of risk over the last month.' },
  { name: 'Top of the class', expr: 'rank(ts_mean(returns, 14)) - 0.5', hint: 'Hold the coins in the top half by two-week return.' },
];

function Inner() {
  const q = useSearchParams();
  const [expr, setExpr] = useState(q.get('e') || IDEAS[1].expr);
  const [prices, setPrices] = useState<any>(null);
  const [r, setR] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [extra, setExtra] = useState<Record<string, unknown>>({});
  const [meta, setMeta] = useState<Meta | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => { fetch(asset('/data/prices.json')).then((x) => x.json()).then(setPrices); }, []);
  const run = useCallback((e?: string, more: Record<string, unknown> = extra) => {
    if (!prices) return;
    setErr(null);
    try { setR(backtest(e ?? expr, prices, { top_n: 3, cash_if_negative: true, fee_bps: 35, max_weight: 1, universe: Object.keys(prices.tokens), ...more })); } catch (x) { setErr((x as Error).message); setR(null); }
  }, [expr, prices, extra]);
  const applyAI = (formula: string, settings: Record<string, unknown>, m: Meta) => {
    setExpr(formula); setExtra(settings); setMeta(m); run(formula, settings);
    setTimeout(() => document.getElementById('result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };
  useEffect(() => { if (prices) run(); }, [prices]); // eslint-disable-line react-hooks/exhaustive-deps

  return <>
    <div className="hero" style={{ paddingTop: 8 }}>
      <div className="eyebrow">Lab · for researchers</div>
      <h1 style={{ fontSize: 32 }}>Test a trading idea in seconds.</h1>
      <p className="lead" style={{ fontSize: 16 }}>Let NEAR AI build a strategy from the skills you pick, or write your own formula. Either way it's backtested on six months of NEAR Intents prices, in your browser. Good ones can be published as strategies that vaults follow, paying you on every swap.</p>
    </div>
    <AIBuilder onUse={applyAI} />
    <h2 style={{ margin: '24px 0 10px' }}>Or write your own formula</h2>
    <section className="card">
      <div className="row" style={{ marginBottom: 10 }}>{IDEAS.map((i) => <button key={i.name} className="ghost" title={i.hint} onClick={() => { setExpr(i.expr); setExtra({}); setMeta(null); run(i.expr, {}); }}>{i.name}</button>)}</div>
      <textarea rows={2} value={expr} onChange={(e) => setExpr(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) run(); }} aria-label="Formula" />
      <div className="row" style={{ marginTop: 10 }}><button onClick={() => { setMeta(null); run(); }} disabled={!prices}>{prices ? 'Run backtest' : 'Loading prices…'}</button><span className="hint">Holds the top {String((extra.top_n as number) ?? 3)} coins by your score each day, USDC when none scores above zero. 35 bps cost per trade.</span></div>
      {err && <div className="toast bad">{err}</div>}
    </section>
    {r && <Result r={r} meta={meta} expr={expr} copied={copied} onCopy={() => { navigator.clipboard?.writeText(`${location.origin}${location.pathname}?e=${encodeURIComponent(expr)}`); setCopied(true); setTimeout(() => setCopied(false), 1500); }} />}
    <section className="card"><h2>Functions</h2><p className="hint" style={{ marginTop: 0 }}>Fields: <code>close</code>, <code>volume</code>, <code>returns</code>. Operators: <code>+ - * / &gt; &lt;</code>.</p>
      <div className="tbl"><table><tbody>{Object.entries(FUNCTIONS).map(([k, f]) => <tr key={k}><td><code>{k}</code></td><td className="hint">{f.doc}</td></tr>)}</tbody></table></div></section>
  </>;
}
export default function LabPage() { return <Suspense fallback={null}><Inner /></Suspense>; }
