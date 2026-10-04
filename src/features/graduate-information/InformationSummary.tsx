import type { InformationQueue } from './api';

export function InformationSummary({ counts, role = 'proofreader' }: {
  counts: Partial<Record<InformationQueue | 'SUBMITTED_MODERATOR', number>> | undefined;
  role?: 'proofreader' | 'qc' | 'moderator';
}) {
  const pending = role === 'moderator' ? 'SUBMITTED_MODERATOR' : role === 'qc' ? 'SUBMITTED_QC' : 'PENDING';
  const items = [
    { label: 'Pending', count: counts ? counts[pending] ?? 0 : undefined },
    ...(role === 'moderator' ? [] : [{
      label: role === 'qc' ? 'Ready to forward' : 'Returned for correction',
      count: counts ? role === 'qc' ? counts.APPROVED_QC ?? 0 : (counts.REJECTED_QC ?? 0) + (counts.REJECTED_MODERATOR ?? 0) : undefined,
    }]),
    { label: 'Completed', count: counts?.COMPLETED },
  ];
  return <dl aria-label="Information review summary" className="grid gap-3 sm:grid-cols-3">
    {items.map(item => <div key={item.label} className="rounded-xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
      <dt className="text-sm font-medium text-stone-600">{item.label}</dt>
      <dd className="mt-2 text-3xl font-semibold tabular-nums text-stone-900">{item.count ?? '—'}</dd>
    </div>)}
  </dl>;
}
