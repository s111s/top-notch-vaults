// Dependency-free SVG line chart: strategy vs holding NEAR, with the out-of-sample split marked.
type Series = { points: [string, number][]; color: string; width?: number; label: string };
export function Chart({ series, split, height = 240 }: { series: Series[]; split?: string; height?: number }) {
  const W = 720, H = height, P = { l: 46, r: 10, t: 12, b: 26 };
  const xs = series[0]?.points.map((p) => p[0]) ?? [];
  const ys = series.flatMap((s) => s.points.map((p) => p[1]));
  if (!xs.length) return null;
  const min = Math.min(...ys), max = Math.max(...ys);
  const x = (i: number) => P.l + (i / Math.max(1, xs.length - 1)) * (W - P.l - P.r);
  const y = (v: number) => P.t + (1 - (v - min) / (max - min || 1)) * (H - P.t - P.b);
  const si = split ? xs.indexOf(split) : -1;
  return (
    <figure style={{ margin: 0 }}>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={series.map((s) => s.label).join(' vs ')}>
        {[min, (min + max) / 2, max].map((t) => <g key={t}><line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="var(--line)" /><text x={P.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">{((t - 1) * 100).toFixed(0)}%</text></g>)}
        {si > 0 && <g><line x1={x(si)} x2={x(si)} y1={P.t} y2={H - P.b} stroke="var(--muted)" strokeDasharray="4 4" /><text x={x(si) + 4} y={P.t + 12} fontSize="11" fill="var(--muted)">out-of-sample →</text></g>}
        <text x={P.l} y={H - 6} fontSize="11" fill="var(--muted)">{xs[0]}</text>
        <text x={W - P.r} y={H - 6} fontSize="11" fill="var(--muted)" textAnchor="end">{xs.at(-1)}</text>
        {series.map((s) => <polyline key={s.label} fill="none" stroke={s.color} strokeWidth={s.width ?? 2} points={s.points.map((p, i) => `${x(i).toFixed(1)},${y(p[1]).toFixed(1)}`).join(' ')} />)}
      </svg>
      <figcaption className="hint">{series.map((s) => <span key={s.label} style={{ marginRight: 14 }}><span style={{ color: s.color }}>━</span> {s.label}</span>)}</figcaption>
    </figure>
  );
}
