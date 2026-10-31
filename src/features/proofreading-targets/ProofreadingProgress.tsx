'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getMyProgress, targetRoles, workDescription, type Cycle, type Progress } from './api';

export function ProofreadingProgress({ year, term, refresh, role = 'INFORMATION_PROOFREADER' }: Cycle & { refresh: number }) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setProgress(null); setError('');
    getMyProgress({ year, term, role }, controller.signal).then(result => {
      if (!controller.signal.aborted) setProgress(result.progress);
    }).catch(cause => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Unable to load progress.'); });
    return () => controller.abort();
  }, [year, term, role, refresh, reload]);
  useEffect(() => {
    const update = () => setReload(v => v + 1);
    // Refresh on return and at the next Manila midnight, without continuous polling.
    const untilMidnight = 86400000 - ((Date.now() + 8 * 3600000) % 86400000);
    const timer = setTimeout(update, untilMidnight + 1000);
    window.addEventListener('focus', update);
    return () => { clearTimeout(timer); window.removeEventListener('focus', update); };
  }, [reload]);
  const total = (progress?.target ?? 0) + (progress?.carriedBacklog ?? 0);
  const percent = total > 0 ? Math.min(100, Math.round((progress?.submitted ?? 0) / total * 100)) : 0;
  return <section aria-label="My daily progress" className="rounded-xl border border-stone-200 bg-white p-5">
    <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold text-stone-900">My daily progress · {targetRoles[role]}</h3>
      <span className="text-sm text-stone-600">{progress?.date} · Philippine time</span></div>
    <p className="mt-1 text-sm text-stone-600">{workDescription(role)} Totals cover all your assigned departments for this role.</p>
    {error ? <div role="alert" className="mt-3 flex flex-wrap items-center gap-3 text-sm text-red-800">{error}<Button variant="outline" onClick={() => setReload(v => v + 1)}>Retry</Button></div>
      : !progress ? <p role="status" className="mt-4 text-sm text-stone-600">Loading progress…</p> : <>
        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">{[
          ['Today’s target', progress.target ?? 'Not set'], ['Carried backlog', progress.carriedBacklog],
          ['Work counted today', progress.submitted], ['Remaining today', progress.remaining],
        ].map(([label, value]) => <div key={label}><dt className="text-sm text-stone-600">{label}</dt><dd className="mt-1 text-2xl font-semibold tabular-nums text-stone-900">{value}</dd></div>)}</dl>
        {total > 0 && <><progress className="mt-4 h-2 w-full accent-amber-900" aria-label="Daily target and backlog progress" max={100} value={percent} />
          {progress.remaining === 0 && <p role="status" className="mt-2 text-sm font-medium text-emerald-800">Target reached. You can keep working.</p>}</>}
        {progress.target === null && <p className="mt-3 text-sm text-stone-600">No new target is set for today.{progress.carriedBacklog > 0 ? ' Work can still clear your backlog.' : ''}</p>}
      </>}
  </section>;
}
