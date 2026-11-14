'use client';
// Interactive backtest chart: strategy vs holding NEAR. Hover any day to see the value of $100, the
// day's move and exactly which coins the strategy held. Range buttons rebase to $100 at the range
// start; the legend hides a line; the drawdown panel shows how deep each fall from a peak went.
import { useMemo, useRef, useState } from 'react';

type Day = { date: string; ret: number; equity: number; bench: number; weights: number[] };
const RANGES = [{ id: '1M', days: 30 }, { id: '3M', days: 90 }, { id: 'All', days: Infinity }] as const;
const money = (v: number) => `$${v >= 1000 ? v.toFixed(0) : v.toFixed(2)}`;
const signed = (v: number, d = 1) => `${v >= 0 ? '+' : ''}${(v * 100).toFixed(d)}%`;

export function InteractiveChart({ daily, syms, split, label = 'Your strategy' }: { daily: Day[]; syms: string[]; split?: string; label?: string }) {
  const [range, setRange] = useState<(typeof RANGES)[number]['id']>('All');
  const [hide, setHide] = useState<Record<string, boolean>>({});
  const [dd, setDd] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);

  const days = useMemo(() => {
    const n = RANGES.find((r) => r.id === range)!.days;
    const d = daily.slice(-Math.min(daily.length, n));
    const i0 = daily.length - d.length;
    // Rebase so both lines start at $100 on the first day of the range.
    const e0 = i0 > 0 ? daily[i0 - 1].equity : 1, b0 = i0 > 0 ? daily[i0 - 1].bench : 1;
    let pe = 0, pb = 0;
    return d.map((x) => {
      const s = (x.equity / e0) * 100, b = (x.bench / b0) * 100;
      pe = Math.max(pe, s); pb = Math.max(pb, b);
      return { ...x, s, b, dds: s / pe - 1, ddb: b / pb - 1 };
    });
  }, [daily, range]);
  if (!days.length) return null;

  const series = [
    { key: 's', label, color: 'var(--accent)', width: 2.25 },
    { key: 'b', label: 'Hold NEAR', color: 'var(--muted)', width: 1.5 },
  ] as const;
  const shown = series.filter((s) => !hide[s.key]);
  const W = 720, H = 250, P = { l: 48, r: 12, t: 14, b: 24 };
  const DH = 104; // drawdown panel height
  const ys = days.flatMap((d) => shown.map((s) => d[s.key]));
  const lo = Math.min(100, ...ys), hi = Math.max(100, ...ys);
  const x = (i: number) => P.l + (i / Math.max(1, days.length - 1)) * (W - P.l - P.r);
  const y = (v: number) => P.t + (1 - (v - lo) / (hi - lo || 1)) * (H - P.t - P.b);
  const ddMin = Math.min(-0.05, ...days.flatMap((d) => shown.map((s) => (s.key === 's' ? d.dds : d.ddb))));
  const yd = (v: number) => 26 + (v / ddMin) * (DH - 34);
  const si = split ? days.findIndex((d) => d.date === split) : -1;
  const ticks = [lo, (lo + hi) / 2, hi];

  function move(e: React.PointerEvent) {
    const r = box.current!.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    setHover(Math.max(0, Math.min(days.length - 1, Math.round(((px - P.l) / (W - P.l - P.r)) * (days.length - 1)))));
  }
  const h = hover != null ? days[hover] : null;
  const held = h ? syms.map((s, i) => [s, h.weights[i]] as const).filter(([, w]) => w > 0) : [];
  const leftPct = hover != null ? (x(hover) / W) * 100 : 0;

  return (
    <figure style={{ margin: 0 }}>
      <div className="spread" style={{ marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
        <div className="row" style={{ gap: 6 }} role="group" aria-label="Legend: click to hide a line">
          {series.map((s) => <button key={s.key} className="ghost chip" aria-pressed={!hide[s.key]} onClick={() => setHide((v) => ({ ...v, [s.key]: !v[s.key] }))} style={{ opacity: hide[s.key] ? 0.45 : 1 }}>
            <span style={{ display: 'inline-block', width: 14, height: 3, borderRadius: 2, background: s.color }} /> {s.label}</button>)}
        </div>
        <div className="row" style={{ gap: 6 }}>
          <div className="seg" role="group" aria-label="Time range">{RANGES.map((r) => <button key={r.id} className={range === r.id ? '' : 'ghost'} onClick={() => { setRange(r.id); setHover(null); }}>{r.id}</button>)}</div>
          <button className={dd ? 'chip' : 'ghost chip'} aria-pressed={dd} onClick={() => setDd((v) => !v)}>Drawdown</button>
        </div>
      </div>
      <div ref={box} style={{ position: 'relative', touchAction: 'pan-y' }} onPointerMove={move} onPointerDown={move} onPointerLeave={() => setHover(null)}>
        <svg className="chart" viewBox={`0 0 ${W} ${H + (dd ? DH : 0)}`} role="img" aria-label={`Value of $100: ${label} vs holding NEAR`} style={{ display: 'block', width: '100%' }}>
          {ticks.map((t) => <g key={t}><line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="var(--line)" /><text x={P.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">${t.toFixed(0)}</text></g>)}
          <line x1={P.l} x2={W - P.r} y1={y(100)} y2={y(100)} stroke="var(--muted)" strokeOpacity=".35" strokeDasharray="2 3" />
          {si > 0 && <g><rect x={x(si)} y={P.t} width={W - P.r - x(si)} height={H - P.t - P.b} fill="var(--accent)" opacity=".05" /><line x1={x(si)} x2={x(si)} y1={P.t} y2={H - P.b} stroke="var(--muted)" strokeDasharray="4 4" /><text x={x(si) + 5} y={P.t + 12} fontSize="11" fill="var(--muted)">unseen data →</text></g>}
          <text x={P.l} y={H - 6} fontSize="11" fill="var(--muted)">{days[0].date}</text>
          <text x={W - P.r} y={H - 6} fontSize="11" fill="var(--muted)" textAnchor="end">{days.at(-1)!.date}</text>
          {[...shown].reverse().map((s) => <polyline key={s.key} fill="none" stroke={s.color} strokeWidth={s.width} strokeLinejoin="round" points={days.map((d, i) => `${x(i).toFixed(1)},${y(d[s.key]).toFixed(1)}`).join(' ')} />)}
          {shown.map((s) => <text key={s.key} x={W - P.r - 2} y={y(days.at(-1)![s.key]) - 6} fontSize="11" fontWeight="600" fill="var(--ink)" textAnchor="end">{money(days.at(-1)![s.key])}</text>)}
          {dd && <g transform={`translate(0 ${H})`}>
            <text x={P.l} y={16} fontSize="11" fill="var(--muted)">Drawdown: how far below its last peak</text>
            <line x1={P.l} x2={W - P.r} y1={yd(0)} y2={yd(0)} stroke="var(--line)" />
            <text x={P.l - 6} y={yd(ddMin) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">{(ddMin * 100).toFixed(0)}%</text>
            {!hide.s && <path d={`M${x(0)},${yd(0)} ${days.map((d, i) => `L${x(i).toFixed(1)},${yd(d.dds).toFixed(1)}`).join(' ')} L${x(days.length - 1)},${yd(0)} Z`} fill="var(--neg)" opacity=".25" />}
            {!hide.b && <polyline fill="none" stroke="var(--muted)" strokeWidth="1.25" points={days.map((d, i) => `${x(i).toFixed(1)},${yd(d.ddb).toFixed(1)}`).join(' ')} />}
          </g>}
          {h && <g pointerEvents="none">
            <line x1={x(hover!)} x2={x(hover!)} y1={P.t} y2={H - P.b + (dd ? DH : 0)} stroke="var(--ink)" strokeOpacity=".35" />
            {shown.map((s) => <circle key={s.key} cx={x(hover!)} cy={y(h[s.key])} r="4.5" fill={s.color} stroke="var(--panel)" strokeWidth="2" />)}
          </g>}
        </svg>
        {h && <div className="tip" style={{ left: `${leftPct}%`, transform: `translateX(${leftPct > 60 ? 'calc(-100% - 12px)' : '12px'})` }}>
          <div style={{ fontWeight: 600 }}>{h.date}{split && h.date >= split ? <span className="hint"> · unseen</span> : null}</div>
          {!hide.s && <div className="spread"><span><span className="sw" style={{ background: 'var(--accent)' }} />{label}</span><b>{money(h.s)}</b></div>}
          {!hide.b && <div className="spread"><span><span className="sw" style={{ background: 'var(--muted)' }} />Hold NEAR</span><b>{money(h.b)}</b></div>}
          <div className="spread hint"><span>That day</span><span className={h.ret >= 0 ? 'pos' : 'neg'}>{signed(h.ret, 2)}</span></div>
          <div className="hint" style={{ marginTop: 4 }}>Held: {held.length ? held.map(([s, w]) => `${s} ${(w * 100).toFixed(0)}%`).join(', ') + (held.reduce((a, [, w]) => a + w, 0) < 0.995 ? ', rest USDC' : '') : '100% USDC (cash)'}</div>
        </div>}
      </div>
      {/* Invested strip: one cell per day, darker = more of the vault in coins, empty = all USDC. */}
      <div style={{ marginLeft: `${(P.l / W) * 100}%`, marginRight: `${(P.r / W) * 100}%`, display: 'flex', height: 10, gap: 0, marginTop: 4, borderRadius: 3, overflow: 'hidden' }} aria-hidden>
        {days.map((d, i) => { const inv = d.weights.reduce((a, b) => a + b, 0); return <div key={d.date} style={{ flex: 1, background: 'var(--accent)', opacity: hover === i ? 1 : 0.1 + inv * 0.75 }} />; })}
      </div>
      <figcaption className="hint" style={{ marginTop: 4 }}>Value of $100 from the start of the range. The strip below the chart shows how invested the strategy was each day (pale = sitting in USDC). Hover or tap any day to see what it held.</figcaption>
    </figure>
  );
}
