"use client";

import { useId, useState } from 'react';
import { Check, FileCheck2, Search, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { academicFilterOptions, emptyFilters, filterInformationRows, graduateName, informationCounts, informationStatusLabels, matchesInformationQueue, noMajor, reviewQueues, type GraduateInformationRow, type InformationQueue } from './model';

function StatusBadge({ graduate }: { graduate: GraduateInformationRow }) {
  const status = graduate.informationStatus;
  const label = graduate.verification === 'unchecked' ? 'Not checked' : graduate.verification === 'not-listed' ? 'Not on RAC/SAO list' : informationStatusLabels[status];
  const tone = graduate.verification !== 'verified' ? 'bg-stone-100 text-stone-600 border-stone-200' :
    status.startsWith('rejected') ? 'bg-red-50 text-red-800 border-red-200' :
    status === 'completed' || status === 'approved-qc' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
    'bg-amber-50 text-amber-900 border-amber-200';
  return <Badge variant="outline" className={`whitespace-normal text-left leading-5 font-medium ${tone}`}>{label}</Badge>;
}

export function GraduateInformationWorkspace({ graduates }: { graduates: readonly GraduateInformationRow[] }) {
  const id = useId();
  const [filters, setFilters] = useState(emptyFilters);
  const [queue, setQueue] = useState<InformationQueue>('all');
  const options = academicFilterOptions(graduates, filters);
  const scoped = filterInformationRows(graduates, filters);
  const counts = informationCounts(scoped);
  const rows = scoped.filter(row => matchesInformationQueue(row, queue));
  const queueLabel = reviewQueues.find(item => item.value === queue)!.label;
  const hasFilters = Object.values(filters).some(Boolean);
  const selectStyle = 'mt-2 h-11 w-full min-w-0 rounded-lg border border-stone-200 bg-white px-3 text-sm font-normal text-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700';
  const stats = [
    { label: 'Pending', value: counts.pending, icon: FileCheck2 },
    { label: 'Returned for correction', value: counts['rejected-qc'] + counts['rejected-moderator'], icon: Users },
    { label: 'Completed', value: counts.completed, icon: Check },
  ];

  return <section className="space-y-6" aria-label="Graduate information workspace">
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Information status counts">
      {stats.map(({ label, value, icon: Icon }) => <div key={label} className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <div><p className="text-sm text-stone-600">{label}</p><p className="mt-2 text-3xl font-semibold tabular-nums text-stone-900">{value}</p></div>
        <span className="rounded-lg bg-amber-50 p-3 text-amber-800"><Icon size={21} aria-hidden="true" /></span>
      </div>)}
    </div>

    <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div><label htmlFor={`${id}-search`} className="text-xs font-semibold text-stone-600">Search graduates</label>
          <div className="relative mt-2"><Search size={17} aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 text-stone-400" /><Input id={`${id}-search`} type="search" placeholder="Name or student number" value={filters.search} onChange={event => setFilters({ ...filters, search: event.target.value })} className="h-11 border-stone-200 bg-white pl-10 text-sm focus-visible:ring-amber-700/30" /></div>
        </div>
        <label className="min-w-0 text-xs font-semibold text-stone-600">Department<select value={filters.department} onChange={event => setFilters({ ...filters, department: event.target.value, program: '', major: '' })} className={selectStyle}><option value="">All departments</option>{options.departments.map(value => <option key={value}>{value}</option>)}</select></label>
        <label className="min-w-0 text-xs font-semibold text-stone-600">Program<select value={filters.program} onChange={event => setFilters({ ...filters, program: event.target.value, major: '' })} className={selectStyle}><option value="">All programs</option>{options.programs.map(value => <option key={value}>{value}</option>)}</select></label>
        <label className="min-w-0 text-xs font-semibold text-stone-600">Major<select value={filters.major} onChange={event => setFilters({ ...filters, major: event.target.value })} className={selectStyle}><option value="">All majors</option>{options.majors.map(value => <option key={value} value={value}>{value === noMajor ? 'No major' : value}</option>)}</select></label>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><p className="text-xs text-stone-500">Counts reflect your search and academic filters.</p><Button variant="ghost" size="sm" disabled={!hasFilters} onClick={() => setFilters(emptyFilters)} className="min-h-10 text-stone-600">Clear filters</Button></div>
    </div>

    <nav aria-label="Filter information status" className="flex flex-wrap gap-2">
      {reviewQueues.map(item => <Button key={item.value} variant="outline" aria-pressed={queue === item.value} onClick={() => setQueue(item.value)} className={`min-h-11 h-auto gap-2 rounded-lg px-3 py-2 text-sm shadow-none ${queue === item.value ? 'border-amber-800 bg-amber-900 text-white hover:bg-amber-800 hover:text-white' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100'}`}>
        {item.label}<span className={`rounded px-1.5 text-xs tabular-nums ${queue === item.value ? 'bg-white/15 text-white' : 'bg-stone-100 text-stone-600'}`}>{counts[item.value]}</span>
      </Button>)}
    </nav>

    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-lg font-semibold text-stone-900">{queueLabel}</h2><p className="mt-1 text-sm text-stone-500">{queue === 'all' ? 'Overview · Status only' : queue === 'pending' ? 'RAC/SAO verified graduates ready for proofreading.' : 'Graduate information review status.'}</p></div><p className="text-xs text-stone-500" role="status" aria-live="polite">{rows.length} {rows.length === 1 ? 'graduate' : 'graduates'} · First name A–Z</p></div>
      {!rows.length ? <div className="rounded-xl border border-dashed border-stone-300 bg-white px-5 py-12 text-center"><Search size={26} className="mx-auto mb-3 text-stone-400" aria-hidden="true" /><h3 className="font-semibold text-stone-800">{graduates.length ? 'No graduates in this view' : 'No graduate records yet'}</h3><p className="mt-2 text-sm text-stone-500">{graduates.length ? 'Choose another status or clear your filters.' : 'Graduate records will appear here when available.'}</p>{hasFilters && <Button variant="outline" onClick={() => setFilters(emptyFilters)} className="mt-4 min-h-11">Clear search and filters</Button>}{queue !== 'all' && <Button variant="ghost" onClick={() => setQueue('all')} className="mt-4 min-h-11">View all graduates</Button>}</div> : <>
        <div className="hidden overflow-hidden rounded-xl border border-stone-200 bg-white md:block"><table className="w-full table-fixed text-left text-sm"><caption className="sr-only">{queueLabel}, sorted by first name ascending</caption><thead className="border-b border-stone-200 bg-stone-50 text-xs text-stone-500"><tr><th scope="col" className="w-[30%] px-5 py-4 font-semibold">Graduate</th><th scope="col" className="w-[42%] px-5 py-4 font-semibold">Department and program</th><th scope="col" className="px-5 py-4 font-semibold">Status</th></tr></thead><tbody className="divide-y divide-stone-100">{rows.map(row => <tr key={row.studentNumber}><td className="break-words px-5 py-4 align-top"><p className="font-semibold text-stone-800">{graduateName(row)}</p><p className="mt-1 text-xs text-stone-500">{row.studentNumber}</p></td><td className="break-words px-5 py-4 align-top"><p className="text-stone-700">{row.department}</p><p className="mt-1 text-xs leading-5 text-stone-500">{row.program}{row.major ? ` · ${row.major}` : ''}</p></td><td className="px-5 py-4 align-top"><StatusBadge graduate={row} /></td></tr>)}</tbody></table></div>
        <ul className="space-y-3 md:hidden" aria-label={queueLabel}>{rows.map(row => <li key={row.studentNumber} className="rounded-xl border border-stone-200 bg-white p-4"><p className="font-semibold text-stone-800">{graduateName(row)}</p><p className="mt-1 text-xs text-stone-500">{row.studentNumber}</p><p className="mt-3 text-sm text-stone-700">{row.department}</p><p className="mb-3 mt-1 text-xs leading-5 text-stone-500">{row.program}{row.major ? ` · ${row.major}` : ''}</p><StatusBadge graduate={row} /></li>)}</ul>
      </>}
    </div>
  </section>;
}
