'use client';
// Step tracker shown while a strategy is being built: what's done, what's running (with a timer), what's left.
import { useEffect, useState } from 'react';

export type Step = { id: string; label: string; detail?: string };

export function BuildSteps({ steps, current, startedAt, expect, failed }: { steps: Step[]; current: string | null; startedAt: number; expect?: string; failed?: boolean }) {
  const [, tick] = useState(0);
  const [stepStart, setStepStart] = useState(Date.now());
  useEffect(() => { setStepStart(Date.now()); }, [current]);
  useEffect(() => { const t = setInterval(() => tick((x) => x + 1), 500); return () => clearInterval(t); }, []);
  const ci = current == null ? steps.length : steps.findIndex((s) => s.id === current);
  const secs = Math.floor((Date.now() - startedAt) / 1000);
  const stepSecs = Math.floor((Date.now() - stepStart) / 1000);
  const pct = Math.min(100, ((ci + (current ? Math.min(0.9, stepSecs / 20) : 0)) / steps.length) * 100);
  return (
    <div aria-live="polite">
      <div className="spread hint" style={{ marginTop: 10 }}>
        <span>{current ? `Step ${ci + 1} of ${steps.length}` : failed ? 'Stopped' : 'Done'}</span>
        <span>{secs}s{expect && current ? ` · ${expect}` : ''}</span>
      </div>
      <div className="bar"><i style={{ width: `${pct}%` }} /></div>
      <ol className="bsteps">
        {steps.map((s, i) => {
          const st = i < ci ? 'done' : i === ci ? (failed ? 'fail' : 'now') : 'todo';
          return <li key={s.id} className={st}>
            <span className="dot">{st === 'done' ? '✓' : st === 'fail' ? '✗' : ''}</span>
            <span>{s.label}{s.detail && (st === 'now' || st === 'done') ? <span className="hint" style={{ fontWeight: 400 }}> · {s.detail}</span> : null}</span>
            <span className="hint">{st === 'now' ? `${stepSecs}s` : st === 'todo' ? 'next' : ''}</span>
          </li>;
        })}
      </ol>
    </div>
  );
}
