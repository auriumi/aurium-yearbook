'use client';

import { useEffect, useState } from 'react';
import { Search, Plus, Users, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { departmentOptions } from '@/constants/registration';
import type { ReviewAssignment } from '@/features/rac-verification/api';
import { designationLabels, getStaff, grantDesignation, revokeDesignation, type StaffList, type StaffMember } from './api';

const staffName = (staff: StaffMember) => [staff.first_name, staff.last_name].filter(Boolean).join(' ') || staff.email || `Staff ${staff.id}`;
const scopeLabel = (assignment: ReviewAssignment) => [assignment.department, assignment.course, assignment.major].filter(Boolean).join(' · ') || 'All departments';
const selectClass = 'min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm disabled:bg-stone-100';

export function StaffAssignments({ onChanged }: { onChanged: () => void }) {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<StaffList | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selected, setSelected] = useState<StaffMember | null>(null);
  const [remove, setRemove] = useState<{ staff: StaffMember; assignment: ReviewAssignment } | null>(null);
  const [capability, setCapability] = useState('INFORMATION_PROOFREADER');
  const [department, setDepartment] = useState('');
  const [course, setCourse] = useState('');
  const [major, setMajor] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => { setQuery(search.trim()); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(''); setResult(null);
    getStaff(query, page, controller.signal).then(data => {
      if (!controller.signal.aborted) { setResult(data); setLoading(false); }
    }).catch(cause => {
      if (!controller.signal.aborted) { setError(cause instanceof Error ? cause.message : 'Unable to load staff.'); setLoading(false); }
    });
    return () => controller.abort();
  }, [query, page, refresh]);
  const capabilities = result?.assignableCapabilities ?? [];
  const courses = departmentOptions.find(item => item.name === department)?.courses ?? [];
  const majors = courses.find(item => item.name === course)?.majors ?? [];
  const finished = (message: string) => {
    setSelected(null); setRemove(null); setNotice(message); setRefresh(value => value + 1); onChanged();
  };
  const save = async () => {
    if (!selected || !department || busy) return;
    setBusy(true); setActionError('');
    try {
      await grantDesignation(selected.id, capability, {
        department: department === '__all__' ? null : department, course: course || null, major: major || null,
      });
      finished(`${designationLabels[capability]} assigned to ${staffName(selected)}.`);
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Assignment failed.'); }
    finally { setBusy(false); }
  };
  const revoke = async () => {
    if (!remove || busy) return;
    setBusy(true); setActionError('');
    try { await revokeDesignation(remove.assignment.id); finished(`Assignment removed from ${staffName(remove.staff)}.`); }
    catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Unable to remove assignment.'); }
    finally { setBusy(false); }
  };
  return <section className="space-y-5">
    <div><h2 className="text-2xl font-semibold text-stone-900">Staff Assignments</h2>
      <p className="mt-1 text-sm text-stone-600">Choose who handles each review and which graduates they can access.</p>
      <p className="mt-2 text-sm text-amber-900">General Proofreaders also verify the official RAC/SAO list within their assigned scope.</p></div>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="relative w-full sm:max-w-md"><Search className="absolute left-3 top-3 h-4 w-4 text-stone-500" aria-hidden="true" />
        <Input aria-label="Search staff by name or email" placeholder="Search staff by name or email" className="min-h-11 bg-white pl-9" value={search} onChange={e => setSearch(e.target.value)} /></div>
      <Button variant="outline" disabled={loading} onClick={() => setRefresh(value => value + 1)}><RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />Refresh</Button>
    </div>
    {notice && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {loading ? <p role="status" className="rounded-xl border bg-white p-8 text-stone-600">Loading staff…</p> : result && <>
      <p className="text-sm text-stone-600">{result.total} staff members</p>
      <div className="space-y-3">{result.staff.map(staff => <article key={staff.id} className="rounded-xl border border-stone-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-3">
          <Users className="h-9 w-9 shrink-0 rounded-full bg-amber-50 p-2 text-amber-900" aria-hidden="true" />
          <div className="min-w-0"><h3 className="font-semibold text-stone-900">{staffName(staff)}</h3><p className="break-all text-sm text-stone-500">{staff.email || 'No email recorded'}</p></div></div>
          <Button variant="outline" onClick={() => { setSelected(staff); setCapability(capabilities[0] || 'INFORMATION_PROOFREADER'); setDepartment(''); setCourse(''); setMajor(''); setActionError(''); }}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />Assign role</Button></div>
        <ul className="mt-4 space-y-2">{staff.reviewAssignments.map(assignment => <li key={assignment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-stone-50 px-3 py-2">
          <div className="min-w-0"><p className="text-sm font-medium text-stone-800">{designationLabels[assignment.capability] || assignment.capability}</p>
            <p className="mt-1 break-words text-xs text-stone-600">{scopeLabel(assignment)}</p></div>
          {(capabilities.includes(assignment.capability) || (assignment.capability === 'RAC_CHECK' && capabilities.includes('FINAL_MODERATOR'))) &&
            <Button variant="ghost" className="text-red-700" onClick={() => { setRemove({ staff, assignment }); setActionError(''); }}>Remove</Button>}
        </li>)}</ul>
        {!staff.reviewAssignments.length && <p className="mt-3 text-sm text-stone-500">No review roles assigned.</p>}
      </article>)}</div>
      {!result.staff.length && <p className="rounded-xl border bg-white p-8 text-stone-600">No staff found. Try another name or email.</p>}
      <div className="flex items-center justify-between gap-3"><Button variant="outline" disabled={page === 1} onClick={() => setPage(value => value - 1)}>Previous</Button>
        <span className="text-sm text-stone-600">Page {page} of {Math.max(1, Math.ceil(result.total / result.pageSize))}</span>
        <Button variant="outline" disabled={page * result.pageSize >= result.total} onClick={() => setPage(value => value + 1)}>Next</Button></div>
    </>}
    <Dialog open={!!selected} onOpenChange={open => { if (!open && !busy) setSelected(null); }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto bg-white sm:max-w-lg" onEscapeKeyDown={event => { if (busy) event.preventDefault(); }} onPointerDownOutside={event => { if (busy) event.preventDefault(); }}>
        <DialogHeader><DialogTitle>Assign a review role</DialogTitle><DialogDescription>{selected ? staffName(selected) : ''}</DialogDescription></DialogHeader>
        <fieldset disabled={busy} className="space-y-4">
          <label className="block space-y-2 text-sm font-medium">Role<select className={selectClass} value={capability} onChange={event => {
            setCapability(event.target.value); setDepartment(event.target.value === 'FINAL_MODERATOR' ? '__all__' : ''); setCourse(''); setMajor(''); setActionError('');
          }}>{capabilities.map(item => <option key={item} value={item}>{designationLabels[item]}</option>)}</select></label>
          {capability === 'INFORMATION_PROOFREADER' && <p className="text-sm text-stone-600">Includes RAC/SAO verification and yearbook information proofreading.</p>}
          <label className="block space-y-2 text-sm font-medium">Department<select className={selectClass} value={department} disabled={busy || capability === 'FINAL_MODERATOR'} onChange={e => { setDepartment(e.target.value); setCourse(''); setMajor(''); }}>
            <option value="" disabled>Choose a department or all departments</option><option value="__all__">All departments</option>
            {departmentOptions.map(item => <option key={item.name}>{item.name}</option>)}</select></label>
          {department && department !== '__all__' && <label className="block space-y-2 text-sm font-medium">Program<select className={selectClass} value={course} onChange={e => { setCourse(e.target.value); setMajor(''); }}>
            <option value="">All programs in this department</option>{courses.map(item => <option key={item.name}>{item.name}</option>)}</select></label>}
          {course && majors.length > 0 && <label className="block space-y-2 text-sm font-medium">Major<select className={selectClass} value={major} onChange={e => setMajor(e.target.value)}>
            <option value="">All majors in this program</option>{majors.map(item => <option key={item}>{item}</option>)}</select></label>}
        </fieldset>
        {actionError && <p role="alert" className="text-sm text-red-700">{actionError}</p>}
        <div className="flex justify-end gap-3"><Button variant="outline" disabled={busy} onClick={() => setSelected(null)}>Cancel</Button>
          <Button disabled={busy || !department} className="bg-amber-900 text-white hover:bg-amber-800" onClick={save}>{busy ? 'Saving…' : 'Save assignment'}</Button></div>
      </DialogContent>
    </Dialog>
    <Dialog open={!!remove} onOpenChange={open => { if (!open && !busy) setRemove(null); }}>
      <DialogContent className="bg-white sm:max-w-md"><DialogHeader><DialogTitle>Remove assignment?</DialogTitle>
        <DialogDescription>{remove && `${staffName(remove.staff)} will lose ${designationLabels[remove.assignment.capability]} access for ${scopeLabel(remove.assignment)}. Previous work and history are kept.`}</DialogDescription></DialogHeader>
        {actionError && <p role="alert" className="text-sm text-red-700">{actionError}</p>}
        <div className="flex justify-end gap-3"><Button variant="outline" disabled={busy} onClick={() => setRemove(null)}>Cancel</Button><Button variant="destructive" disabled={busy} onClick={revoke}>{busy ? 'Removing…' : 'Remove assignment'}</Button></div>
      </DialogContent>
    </Dialog>
  </section>;
}
