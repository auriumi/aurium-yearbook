'use client';

import { useEffect, useRef, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getPhotoList, getPhotoOptions, type PhotoFilters, type PhotoList,
  type PhotoOptions, type PhotoQueue, type PhotoRow, type PhotoStage } from './api';
import { PhotoReviewDialog } from './PhotoReviewDialog';

const labels: Record<PhotoStage, string> = {
  DRAFT: 'Pending', SUBMITTED_QC: 'Submitted to QC', REJECTED_QC: 'Rejected by QC',
  APPROVED_QC: 'Approved by QC', SUBMITTED_MODERATOR: 'Submitted to Moderator',
  REJECTED_MODERATOR: 'Rejected by Moderator', LOCKED: 'Completed',
};
const queues: { value: PhotoQueue; label: string }[] = [
  { value: 'ALL', label: 'List of Graduates' }, { value: 'DRAFT', label: 'Pending' },
  { value: 'SUBMITTED_QC', label: 'Submitted to QC' }, { value: 'REJECTED_QC', label: 'Rejected by QC' },
  { value: 'APPROVED_QC', label: 'Approved by QC' },
  { value: 'SUBMITTED_MODERATOR', label: 'Pending moderator' }, { value: 'LOCKED', label: 'Completed' },
  { value: 'REJECTED_MODERATOR', label: 'Rejected by Moderator' },
];
const selectStyle = 'mt-2 h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-800 focus-visible:outline-2 focus-visible:outline-amber-700';
const currentYear = new Date().getFullYear();
const initial: PhotoFilters = { year: currentYear, term: 'END_YEAR', department: '', program: '',
  major: '', search: '', stage: 'ALL', page: 1 };

function name(row: PhotoRow) {
  return [row.firstName, row.middleName, row.lastName, row.suffix].filter(Boolean).join(' ') ||
    `Graduate ${row.studentNumber}`;
}

export function PhotoWorkspace() {
  const [filters, setFilters] = useState<PhotoFilters>(initial);
  const [searchInput, setSearchInput] = useState('');
  const [list, setList] = useState<PhotoList | null>(null);
  const [options, setOptions] = useState<PhotoOptions | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [reviewId, setReviewId] = useState<number | null>(null);
  const returnFocusRef = useRef<HTMLButtonElement | null>(null);
  const { year, term, department, program } = filters;

  useEffect(() => {
    const timeout = setTimeout(() => setFilters(previous => previous.search === searchInput.trim() ? previous :
      { ...previous, search: searchInput.trim(), page: 1 }), 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    getPhotoList(filters, controller.signal).then(result => { if (!controller.signal.aborted) { setList(result); setLoading(false); } })
      .catch(cause => { if (!controller.signal.aborted) { setError(cause instanceof Error ? cause.message : 'Unable to load photo reviews.'); setLoading(false); } });
    return () => controller.abort();
  }, [filters, refresh]);
  useEffect(() => {
    const controller = new AbortController();
    getPhotoOptions({ year, term, department, program }, controller.signal)
      .then(result => { if (!controller.signal.aborted) setOptions(result); })
      .catch(() => { if (!controller.signal.aborted) setOptions(null); });
    return () => controller.abort();
  }, [year, term, department, program]);

  function change(patch: Partial<PhotoFilters>) {
    setReviewId(null);
    setFilters(previous => ({ ...previous, ...patch, page: 1 }));
  }
  function open(row: PhotoRow, button: HTMLButtonElement) {
    returnFocusRef.current = button;
    setReviewId(row.reviewId);
  }
  const totalPages = Math.max(1, Math.ceil((list?.total ?? 0) / (list?.pageSize ?? 25)));
  return <section className="space-y-5" aria-label="Graduate photo workspace">
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-900">Graduate photos</h2>
      <p className="mt-1 text-sm text-stone-600">Upload and review graduation and theme photos for RAC/SAO-verified graduates. The registration photo stays read-only.</p>
    </div>
    <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <label className="text-xs font-semibold text-stone-600">Graduation year
          <select value={year} onChange={event => change({ year: Number(event.target.value) })} className={selectStyle}>
            {[currentYear - 1, currentYear, currentYear + 1].map(value => <option key={value} value={value}>{value}</option>)}
          </select></label>
        <label className="text-xs font-semibold text-stone-600">Graduation term
          <select value={term} onChange={event => change({ term: event.target.value as PhotoFilters['term'] })} className={selectStyle}>
            <option value="END_YEAR">End year</option><option value="MID_YEAR">Mid year</option>
          </select></label>
        <div><label htmlFor="photo-search" className="text-xs font-semibold text-stone-600">Search graduates</label>
          <div className="relative mt-2"><Search size={17} aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 text-stone-400" />
            <Input id="photo-search" type="search" maxLength={80} value={searchInput} onChange={event => setSearchInput(event.target.value)}
              placeholder="Name or student number" className="h-11 border-stone-200 pl-10" /></div>
        </div>
        <label className="text-xs font-semibold text-stone-600">Department
          <select value={department} onChange={event => change({ department: event.target.value, program: '', major: '' })} className={selectStyle}>
            <option value="">All assigned departments</option>{options?.departments.map(value => <option key={value} value={value}>{value}</option>)}
          </select></label>
        <label className="text-xs font-semibold text-stone-600">Program
          <select value={program} onChange={event => change({ program: event.target.value, major: '' })} className={selectStyle}>
            <option value="">All programs</option>{options?.programs.map(value => <option key={value} value={value}>{value}</option>)}
          </select></label>
        <label className="text-xs font-semibold text-stone-600">Major
          <select value={filters.major} onChange={event => change({ major: event.target.value })} className={selectStyle}>
            <option value="">All majors</option>{options?.hasNoMajor && <option value="__no_major__">No major</option>}
            {options?.majors.map(value => <option key={value} value={value}>{value}</option>)}
          </select></label>
      </div>
    </div>
    <nav aria-label="Photo review status" className="flex flex-wrap gap-2">
      {queues.map(item => <Button key={item.value} variant="outline" aria-pressed={filters.stage === item.value}
        className={`min-h-11 h-auto rounded-lg px-3 py-2 text-sm ${filters.stage === item.value ? 'border-amber-800 bg-amber-900 text-white hover:bg-amber-800 hover:text-white' : 'border-stone-200 bg-white text-stone-600'}`}
        onClick={() => change({ stage: item.value })}>{item.label}
        {item.value !== 'ALL' && <span className="ml-2 rounded bg-stone-100 px-1.5 text-xs text-stone-700">{list?.counts[item.value] ?? 0}</span>}
      </Button>)}
    </nav>
    <div className="flex items-end justify-between gap-3">
      <div><h3 className="font-semibold text-stone-900">{queues.find(item => item.value === filters.stage)?.label}</h3>
        <p className="mt-1 text-sm text-stone-600" aria-live="polite">{loading ? 'Loading…' : `${list?.total ?? 0} graduates · First name A–Z`}</p></div>
      <Button variant="outline" onClick={() => setRefresh(value => value + 1)} disabled={loading} className="min-h-11 gap-2">
        <RefreshCw size={15} aria-hidden="true" />Refresh</Button>
    </div>
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {!loading && list && (list.rows.length ? <>
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-left text-sm"><caption className="sr-only">Photo reviews sorted by first name</caption>
          <thead className="border-b border-stone-200 bg-stone-50 text-xs text-stone-600"><tr>
            <th scope="col" className="px-4 py-3">Graduate</th><th scope="col" className="hidden px-4 py-3 sm:table-cell">Department and program</th>
            <th scope="col" className="px-4 py-3">Status</th></tr></thead>
          <tbody className="divide-y divide-stone-100">{list.rows.map(row => <tr key={row.reviewId}>
            <td className="px-4 py-3"><button type="button" onClick={event => open(row, event.currentTarget)}
              className="min-h-11 text-left font-semibold text-amber-900 hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-amber-800">
              {name(row)}</button><p className="text-xs text-stone-500">{row.studentNumber}</p></td>
            <td className="hidden px-4 py-3 text-stone-700 sm:table-cell">{row.department || 'No department'} · {row.program || 'No program'}
              {row.major ? ` · ${row.major}` : ''}</td>
            <td className="px-4 py-3 text-stone-700">{labels[row.stage]}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-3"><Button variant="outline" disabled={filters.page <= 1}
        onClick={() => setFilters(previous => ({ ...previous, page: previous.page - 1 }))}>Previous</Button>
        <span className="text-sm text-stone-600">Page {filters.page} of {totalPages}</span>
        <Button variant="outline" disabled={filters.page >= totalPages}
          onClick={() => setFilters(previous => ({ ...previous, page: previous.page + 1 }))}>Next</Button></div>
    </> : <p className="rounded-xl border border-dashed border-stone-300 bg-white px-5 py-12 text-center text-sm text-stone-600">No graduates in this view.</p>)}
    <PhotoReviewDialog reviewId={reviewId} onClose={() => setReviewId(null)} onChanged={() => setRefresh(value => value + 1)} returnFocusRef={returnFocusRef} />
  </section>;
}
