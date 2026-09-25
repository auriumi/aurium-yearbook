'use client';

import { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getFilterOptions, getVerificationHistory, getVerificationList, submitVerification,
  type FilterOptions, type GraduateRow, type VerificationFilters, type VerificationList,
  type VerificationOutcome, type VerificationStatus,
} from './api';
import { VerificationFiltersPanel } from './VerificationFilters';
import { VerificationRecords, statusLabel } from './VerificationRecords';

const statuses: { value: VerificationStatus; label: string; countKey: keyof VerificationList['counts'] }[] = [
  { value: 'UNCHECKED', label: 'Not checked', countKey: 'unchecked' },
  { value: 'NOT_LISTED', label: 'Not on list', countKey: 'notListed' },
  { value: 'VERIFIED', label: 'Verified', countKey: 'verified' },
  { value: 'ALL', label: 'All records', countKey: 'all' },
];

const initialFilters: VerificationFilters = {
  year: new Date().getFullYear(), term: 'END_YEAR', department: '', program: '', major: '',
  search: '', verification: 'UNCHECKED', page: 1,
};

const isAbort = (error: unknown) => error instanceof DOMException && error.name === 'AbortError';
type HistoryEvents = Awaited<ReturnType<typeof getVerificationHistory>>['events'];

export function RacVerificationWorkspace() {
  const [filters, setFilters] = useState(initialFilters);
  const [searchInput, setSearchInput] = useState('');
  const [list, setList] = useState<VerificationList | null>(null);
  const [options, setOptions] = useState<FilterOptions | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [optionsError, setOptionsError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const operation = useRef<{ key: string; id: string } | null>(null);
  const [historyFor, setHistoryFor] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryEvents>([]);
  const [historyError, setHistoryError] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);
  const { year, term, department, program } = filters;

  useEffect(() => {
    const timeout = setTimeout(() => setFilters(previous => previous.search === searchInput.trim()
      ? previous : { ...previous, search: searchInput.trim(), page: 1 }), 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    setSelected(new Set());
    operation.current = null;
    setHistoryFor(null);
  }, [filters]);

  useEffect(() => {
    const controller = new AbortController();
    setList(null);
    setLoading(true);
    setError('');
    getVerificationList(filters, controller.signal)
      .then(result => { setList(result); setLoading(false); })
      .catch(cause => { if (!isAbort(cause)) { setError(cause instanceof Error ? cause.message : 'Unable to load graduates.'); setLoading(false); } });
    return () => controller.abort();
  }, [filters, refresh]);

  useEffect(() => {
    const controller = new AbortController();
    setOptions(null);
    setOptionsError('');
    getFilterOptions({ year, term, department, program }, controller.signal)
      .then(setOptions)
      .catch(cause => { if (!isAbort(cause)) { setOptionsError(cause instanceof Error ? cause.message : 'Unable to load academic filters.'); } });
    return () => controller.abort();
  }, [year, term, department, program]);

  useEffect(() => {
    if (historyFor === null) return;
    const controller = new AbortController();
    setHistory([]);
    setHistoryError('');
    setHistoryLoading(true);
    getVerificationHistory(historyFor, { year, term }, controller.signal)
      .then(result => { setHistory(result.events); setHistoryLoading(false); })
      .catch(cause => { if (!isAbort(cause)) { setHistoryError(cause instanceof Error ? cause.message : 'Unable to load check history.'); setHistoryLoading(false); } });
    return () => controller.abort();
  }, [historyFor, year, term, refresh]);

  const totalPages = Math.max(1, Math.ceil((list?.total ?? 0) / (list?.pageSize ?? 25)));

  function changeFilter(patch: Partial<VerificationFilters>) {
    setFilters(previous => ({ ...previous, ...patch, page: 1 }));
  }

  function changeSearch(value: string) {
    setSearchInput(value);
    setSelected(new Set());
    operation.current = null;
  }

  function toggle(studentNumber: number) {
    setSelected(previous => {
      const next = new Set(previous);
      if (next.has(studentNumber)) next.delete(studentNumber); else next.add(studentNumber);
      return next;
    });
  }

  async function applyVerification(targets: GraduateRow[], outcome: VerificationOutcome) {
    if (busy || loading || !list?.sourceVersion || searchInput.trim() !== filters.search || targets.length === 0) return;
    const key = JSON.stringify({
      year: filters.year, term: filters.term, outcome, sourceVersion: list.sourceVersion,
      records: targets.map(row => [row.studentNumber, row.version]).sort((a, b) => Number(a[0]) - Number(b[0])),
    });
    if (operation.current?.key !== key) operation.current = { key, id: crypto.randomUUID() };
    setBusy(true);
    setError('');
    try {
      await submitVerification(targets, outcome, filters, list.sourceVersion, operation.current.id);
      operation.current = null;
      setSelected(new Set());
      setHistoryFor(null);
      setRefresh(value => value + 1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Verification failed. Refresh the list before trying again.');
    } finally {
      setBusy(false);
    }
  }

  return <section className="space-y-5" aria-label="RAC/SAO verification">
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-900">Check against the final RAC/SAO list</h2>
      <p className="mt-1 text-sm text-stone-600">Confirm graduates only after checking the official list. Verified graduates enter the information and photo work queues.</p>
      <p className="mt-2 text-xs text-stone-500">Official list version: {list?.sourceVersion || 'Not configured by the backend'}</p>
    </div>

    <VerificationFiltersPanel
      filters={filters} options={options} optionsError={optionsError} searchInput={searchInput}
      disabled={busy} onSearchChange={changeSearch} onFilterChange={changeFilter}
    />

    <nav aria-label="Verification status" className="flex flex-wrap gap-2">
      {statuses.map(item => <Button key={item.value} variant="outline" disabled={busy}
        aria-pressed={filters.verification === item.value} onClick={() => changeFilter({ verification: item.value })}
        className={`min-h-11 h-auto gap-2 rounded-lg px-3 py-2 text-sm ${filters.verification === item.value ? 'border-amber-800 bg-amber-900 text-white hover:bg-amber-800 hover:text-white' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100'}`}>
        {item.label}<span className={`rounded px-1.5 text-xs tabular-nums ${filters.verification === item.value ? 'bg-white/15 text-white' : 'bg-stone-100 text-stone-600'}`}>{list?.counts[item.countKey] ?? '—'}</span>
      </Button>)}
    </nav>

    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-stone-600" aria-live="polite">{loading ? 'Loading graduates…' : `${list?.total ?? 0} graduates · First name A–Z`}</p>
      <Button variant="outline" disabled={loading || busy} className="min-h-10 gap-2" onClick={() => {
        operation.current = null; setSelected(new Set()); setRefresh(value => value + 1);
      }}><RefreshCw size={15} aria-hidden="true" />Refresh</Button>
    </div>
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

    {!loading && list && <>
      <VerificationRecords list={list} selected={selected} busy={busy || searchInput.trim() !== filters.search} onToggle={toggle}
        onSelectAll={numbers => setSelected(new Set(numbers))} onConfirm={applyVerification}
        onHistory={studentNumber => setHistoryFor(historyFor === studentNumber ? null : studentNumber)} />

      {historyFor !== null && <section className="rounded-xl border border-stone-200 bg-white p-4" aria-label="Verification history">
        <div className="flex items-center justify-between"><h3 className="font-semibold text-stone-800">Check history · {historyFor}</h3><Button variant="ghost" size="sm" onClick={() => setHistoryFor(null)}>Close</Button></div>
        {historyLoading ? <p className="mt-2 text-sm text-stone-500">Loading history…</p> : historyError ? <p role="alert" className="mt-2 text-sm text-red-700">{historyError}</p> : history.length ? <ul className="mt-3 space-y-2 text-sm text-stone-700">{history.map(event => <li key={event.id} className="border-t border-stone-100 pt-2">{statusLabel(event.new_outcome)} · {[event.actor.first_name, event.actor.last_name].filter(Boolean).join(' ') || 'Staff'} · {new Date(event.created_at).toLocaleString()} · {event.source_version}</li>)}</ul> : <p className="mt-2 text-sm text-stone-500">No checks recorded yet.</p>}
      </section>}

      <div className="flex items-center justify-between gap-3"><Button variant="outline" disabled={filters.page <= 1 || busy} onClick={() => setFilters(previous => ({ ...previous, page: previous.page - 1 }))}>Previous</Button><span className="text-sm text-stone-600">Page {filters.page} of {totalPages}</span><Button variant="outline" disabled={filters.page >= totalPages || busy} onClick={() => setFilters(previous => ({ ...previous, page: previous.page + 1 }))}>Next</Button></div>
    </>}
  </section>;
}
