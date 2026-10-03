'use client';

import { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getInformationList, getInformationOptions,
  type InformationFilters, type InformationList, type InformationOptions,
  type InformationQueue,
} from './api';
import { InformationProfileDialog } from './InformationProfileDialog';
import { InformationFiltersPanel } from './InformationFiltersPanel';
import { InformationRecords } from './InformationRecords';

const queues: { value: InformationQueue; label: string }[] = [
  { value: 'ALL', label: 'List of Graduates' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'SUBMITTED_QC', label: 'Submitted to QC' },
  { value: 'REJECTED_QC', label: 'Rejected by QC' },
  { value: 'APPROVED_QC', label: 'Approved by QC' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'REJECTED_MODERATOR', label: 'Rejected by Moderator' },
];

const initialFilters: InformationFilters = {
  year: new Date().getFullYear(), term: 'END_YEAR', department: '', program: '', major: '',
  search: '', queue: 'ALL', page: 1,
};

export function LiveInformationWorkspace() {
  const [filters, setFilters] = useState(initialFilters);
  const [searchInput, setSearchInput] = useState('');
  const [list, setList] = useState<InformationList | null>(null);
  const [options, setOptions] = useState<InformationOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [optionsError, setOptionsError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [reviewId, setReviewId] = useState<number | null>(null);
  const returnFocusRef = useRef<HTMLButtonElement | null>(null);
  const { year, term, department, program } = filters;

  useEffect(() => {
    const timeout = setTimeout(() => setFilters(previous => previous.search === searchInput.trim()
      ? previous : { ...previous, search: searchInput.trim(), page: 1 }), 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    setReviewId(null);
    const controller = new AbortController();
    setLoading(true);
    setList(null);
    setError('');
    getInformationList(filters, controller.signal)
      .then(result => { if (!controller.signal.aborted) { setList(result); setLoading(false); } })
      .catch(cause => {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : 'Unable to load graduate information.');
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [filters, refresh]);

  useEffect(() => {
    const controller = new AbortController();
    setOptions(null);
    setOptionsError('');
    getInformationOptions({ year, term, department, program }, controller.signal)
      .then(result => { if (!controller.signal.aborted) setOptions(result); })
      .catch(cause => {
        if (!controller.signal.aborted) setOptionsError(cause instanceof Error ? cause.message : 'Unable to load academic filters.');
      });
    return () => controller.abort();
  }, [year, term, department, program]);

  function changeFilter(patch: Partial<InformationFilters>) {
    setFilters(previous => ({ ...previous, ...patch, page: 1 }));
  }

  function changeSearch(value: string) {
    setSearchInput(value);
    setReviewId(null);
    if (value.trim() !== filters.search) {
      setList(null);
      setLoading(true);
    }
  }

  function openProfile(id: number, button: HTMLButtonElement) {
    returnFocusRef.current = button;
    setReviewId(id);
  }

  const totalPages = Math.max(1, Math.ceil((list?.total ?? 0) / (list?.pageSize ?? 25)));
  const queueLabel = queues.find(item => item.value === filters.queue)?.label ?? 'Graduate information';

  return <section className="space-y-5" aria-label="Graduate information workspace">
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-900">Graduate information</h2>
      <p className="mt-1 text-sm text-stone-600">Browse the assigned graduate records. Open a review queue to inspect one complete profile.</p>
    </div>

    <InformationFiltersPanel filters={filters} searchInput={searchInput} options={options}
      optionsError={optionsError} onSearch={changeSearch} onChange={changeFilter} />

    <nav aria-label="Information status" className="flex flex-wrap gap-2">
      {queues.map(item => <Button key={item.value} variant="outline" aria-pressed={filters.queue === item.value}
        onClick={() => changeFilter({ queue: item.value })}
        className={`min-h-11 h-auto gap-2 rounded-lg px-3 py-2 text-sm ${filters.queue === item.value ? 'border-amber-800 bg-amber-900 text-white hover:bg-amber-800 hover:text-white' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100'}`}>
        {item.label}<span className={`rounded px-1.5 text-xs tabular-nums ${filters.queue === item.value ? 'bg-white/15 text-white' : 'bg-stone-100 text-stone-600'}`}>{list?.counts[item.value] ?? '—'}</span>
      </Button>)}
    </nav>

    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><h3 className="text-base font-semibold text-stone-900">{queueLabel}</h3>
        <p className="mt-1 text-sm text-stone-600" aria-live="polite">{loading ? 'Loading graduates…' : `${list?.total ?? 0} graduates · First name A–Z`}</p>
      </div>
      <Button variant="outline" disabled={loading} className="min-h-10 gap-2" onClick={() => setRefresh(value => value + 1)}>
        <RefreshCw size={15} aria-hidden="true" />Refresh
      </Button>
    </div>
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

    {!loading && list && <>
      <InformationRecords list={list} queue={filters.queue} queueLabel={queueLabel} onOpenProfile={openProfile} />

      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" disabled={filters.page <= 1} onClick={() => setFilters(previous => ({ ...previous, page: previous.page - 1 }))}>Previous</Button>
        <span className="text-sm text-stone-600">Page {filters.page} of {totalPages}</span>
        <Button variant="outline" disabled={filters.page >= totalPages} onClick={() => setFilters(previous => ({ ...previous, page: previous.page + 1 }))}>Next</Button>
      </div>
    </>}

    <InformationProfileDialog reviewId={reviewId} onClose={() => setReviewId(null)} returnFocusRef={returnFocusRef} />
  </section>;
}
