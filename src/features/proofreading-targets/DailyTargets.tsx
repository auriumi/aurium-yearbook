'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { departmentOptions } from '@/constants/registration';
import { getTargets, manilaToday, targetRoles, workDescription, type TargetRole, type Cycle, type TargetList, type TargetStaff } from './api';
import { TargetEditor, targetStaffName } from './TargetEditor';
import { TargetHistory } from './TargetHistory';

const selectClass = 'min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-sm';
export function DailyTargets() {
  const [cycle, setCycle] = useState<Cycle>({ year: Number(manilaToday().slice(0, 4)), term: 'END_YEAR', role: 'INFORMATION_PROOFREADER' });
  const [date, setDate] = useState(manilaToday);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<TargetList | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [editing, setEditing] = useState<TargetStaff[] | null>(null);
  const [history, setHistory] = useState<{ id: number; name: string } | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [refresh, setRefresh] = useState(0);
  useEffect(() => { const timer = setTimeout(() => { setQuery(search.trim()); setPage(1); }, 300); return () => clearTimeout(timer); }, [search]);
  useEffect(() => {
    const update = () => setRefresh(v => v + 1);
    window.addEventListener('focus', update); return () => window.removeEventListener('focus', update);
  }, []);
  useEffect(() => {
    const controller = new AbortController(); setResult(null); setError(''); setSelected([]);
    if (!date || !Number.isInteger(cycle.year) || cycle.year < 2000 || cycle.year > 2100) { setError('Choose a valid year and date.'); return; }
    getTargets(cycle, date, page, query, department, controller.signal).then(r => {
      if (!controller.signal.aborted) {
        const last = Math.max(1, Math.ceil(r.total / r.pageSize));
        if (page > last) setPage(last); else setResult(r);
      }
    }).catch(e => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Unable to load targets.'); });
    return () => controller.abort();
  }, [cycle, date, page, query, department, refresh]);
  const today = result?.today ?? manilaToday();
  const editable = date >= today;
  const eligible = result?.staff.filter(s => s.active) ?? [];
  const allSelected = eligible.length > 0 && eligible.every(s => selected.includes(s.id));
  return <section className="space-y-5">
    <div><h2 className="text-2xl font-semibold text-stone-900">Daily Targets</h2>
      <p className="mt-1 text-sm text-stone-600">Set daily proofreading goals and follow each staff member’s progress.</p></div>
    <label className="flex max-w-sm flex-col gap-2 text-sm font-medium">Workflow role
      <select className={selectClass} value={cycle.role} onChange={e => { setCycle(c => ({ ...c, role: e.target.value as TargetRole })); setPage(1); setSelected([]); setNotice(''); }}>
        {Object.entries(targetRoles).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select></label>
    <p className="text-sm text-stone-600">{workDescription(cycle.role ?? 'INFORMATION_PROOFREADER')} A staff member with several roles has a separate target for each role.</p>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <label className="space-y-2 text-sm font-medium">Graduation year<Input type="number" min={2000} max={2100} value={cycle.year} onChange={e => { setCycle(c => ({ ...c, year: Number(e.target.value) })); setPage(1); }} /></label>
      <label className="flex flex-col gap-2 text-sm font-medium">Term<select className={selectClass} value={cycle.term} onChange={e => { setCycle(c => ({ ...c, term: e.target.value as Cycle['term'] })); setPage(1); }}><option value="END_YEAR">End year</option><option value="MID_YEAR">Mid year</option></select></label>
      <label className="space-y-2 text-sm font-medium">Target date<Input type="date" value={date} onChange={e => { setDate(e.target.value); setPage(1); }} /></label>
      <label className="flex flex-col gap-2 text-sm font-medium">Department<select className={selectClass} value={department} onChange={e => { setDepartment(e.target.value); setPage(1); }}><option value="">All departments</option>{departmentOptions.map(d => <option key={d.name}>{d.name}</option>)}</select></label>
    </div>
    <p className="text-sm text-stone-600">Totals cover each person’s assigned departments for this graduation cycle. Dates use Philippine time. {date > today ? 'Future figures are provisional; submissions before that date may reduce the backlog.' : !editable ? 'Past targets are read-only.' : 'Work counts once for the selected role.'}</p>
    <div className="flex flex-wrap items-center gap-3"><Input className="min-h-11 bg-white sm:max-w-xs" aria-label="Search staff" placeholder="Search staff" value={search} onChange={e => setSearch(e.target.value)} />
      <Button variant="outline" disabled={!result && !error} onClick={() => setRefresh(v => v + 1)}><RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />Refresh</Button>
      <Button className="bg-amber-900 text-white hover:bg-amber-800 sm:ml-auto" disabled={!result || !editable || !selected.length} onClick={() => setEditing(result!.staff.filter(s => selected.includes(s.id) && s.active))}><Target className="mr-2 h-4 w-4" aria-hidden="true" />Set target ({selected.length})</Button></div>
    {notice && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {!result && !error && <p role="status" className="rounded-xl border bg-white p-8">Loading daily targets…</p>}
    {result && <>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm"><span>{result.total} staff</span>
        <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={allSelected} disabled={!editable || !eligible.length} onChange={e => setSelected(e.target.checked ? eligible.map(s => s.id) : [])} />Select active staff on this page</label></div>
      <div className="space-y-3">{result.staff.map(staff => <article key={staff.id} className="rounded-xl border border-stone-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><label className="flex min-h-11 items-center gap-3 font-semibold text-stone-900">
          <input type="checkbox" checked={selected.includes(staff.id)} disabled={!editable || !staff.active} onChange={e => setSelected(list => e.target.checked ? [...list, staff.id] : list.filter(id => id !== staff.id))} />{targetStaffName(staff)}</label>
          <div className="flex gap-2">{staff.targetId && <Button variant="ghost" onClick={() => setHistory({ id: staff.targetId!, name: `${targetStaffName(staff)} · ${date}` })}>History</Button>}
            <Button variant="outline" disabled={!editable || !staff.active} onClick={() => setEditing([staff])}>Set target</Button></div></div>
        <p className="mt-1 text-sm text-stone-600">{staff.active ? [...new Set(staff.assignments.map(a => a.department || 'All departments'))].join(' · ') : 'Inactive in this role · historical totals'}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{[['Target', staff.target ?? 'Not set'], ['Carried backlog', staff.carriedBacklog], ['Work counted', staff.submitted], ['Remaining', staff.remaining]].map(([label, value]) => <div key={label}><dt className="text-sm text-stone-500">{label}</dt><dd className="text-xl font-semibold tabular-nums text-stone-900">{value}</dd></div>)}</dl>
      </article>)}</div>
      {!result.staff.length && <p className="rounded-xl border bg-white p-8 text-stone-600">No staff found for this role. Check Staff Assignments or change your filters.</p>}
      <div className="flex items-center justify-between"><Button variant="outline" disabled={page === 1} onClick={() => setPage(v => v - 1)}>Previous</Button><span className="text-sm">Page {page} of {Math.max(1, Math.ceil(result.total / result.pageSize))}</span><Button variant="outline" disabled={page * result.pageSize >= result.total} onClick={() => setPage(v => v + 1)}>Next</Button></div>
    </>}
    {editing && <TargetEditor cycle={cycle} staff={editing} date={date} today={today} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); setNotice('Targets saved. Progress has been updated.'); setRefresh(v => v + 1); }} />}
    {history && <TargetHistory {...history} onClose={() => setHistory(null)} />}
  </section>;
}
