'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { decideCorrection, getCorrections, type CorrectionRow, type CorrectionStatus } from './api';
import { InformationProfileDialog } from '@/features/graduate-information/InformationProfileDialog';
import { PhotoReviewDialog } from '@/features/graduate-photos/PhotoReviewDialog';

type List = { rows: CorrectionRow[]; total: number; pageSize: number };

function graduateName(row: CorrectionRow) {
  return [row.graduate.firstName, row.graduate.lastName].filter(Boolean).join(' ') ||
    `Graduate ${row.graduate.studentNumber}`;
}

export function ItCorrectionWorkspace() {
  const [status, setStatus] = useState<CorrectionStatus | 'ALL'>('PENDING');
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [list, setList] = useState<List | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [decisionError, setDecisionError] = useState('');
  const [notice, setNotice] = useState('');
  const [selected, setSelected] = useState<{ row: CorrectionRow; decision: 'APPROVE' | 'REJECT' } | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef<{ fingerprint: string; operationId: string } | null>(null);
  const returnFocusRef = useRef<HTMLButtonElement | null>(null);
  const [view, setView] = useState<{ reviewId: number; trackType: CorrectionRow['trackType'] } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    getCorrections(status, page, controller.signal)
      .then(result => { if (!controller.signal.aborted) { setList(result); setLoading(false); } })
      .catch(cause => { if (!controller.signal.aborted) {
        setError(cause instanceof Error ? cause.message : 'Unable to load requests.'); setLoading(false);
      } });
    return () => controller.abort();
  }, [status, page, refresh]);

  function choose(row: CorrectionRow, decision: 'APPROVE' | 'REJECT') {
    setSelected({ row, decision }); setReason(''); setDecisionError(''); setNotice(''); pending.current = null;
  }

  async function decide() {
    if (!selected || busy) return;
    const { row, decision } = selected;
    const note = decision === 'REJECT' ? reason.trim() : null;
    if (decision === 'REJECT' && (!note || note.length > 2000)) return;
    const fingerprint = JSON.stringify([row.id, row.currentVersion, decision, note]);
    if (pending.current?.fingerprint !== fingerprint) pending.current = { fingerprint, operationId: crypto.randomUUID() };
    setBusy(true); setDecisionError('');
    try {
      await decideCorrection(row.id, row.currentVersion, decision, note, pending.current.operationId);
      setNotice(decision === 'APPROVE' ? 'Correction approved. A new draft is ready for the assigned reviewer.' :
        'Request declined. The approved review remains locked.');
      setSelected(null); pending.current = null; setRefresh(value => value + 1);
    } catch (cause) {
      setDecisionError(cause instanceof Error ? cause.message : 'Unable to record the IT decision.');
    } finally { setBusy(false); }
  }

  const pages = Math.max(1, Math.ceil((list?.total ?? 0) / (list?.pageSize ?? 25)));
  return <section className="space-y-5" aria-label="IT correction requests">
    <div className="rounded-xl border border-stone-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-stone-900">IT correction requests</h2>
      <p className="mt-1 text-sm text-stone-600">A request never changes an approved record. Approval opens a new draft for the assigned reviewer.</p>
    </div>
    <div className="flex flex-wrap gap-2" aria-label="Filter correction requests">
      {(['PENDING', 'ALL'] as const).map(value => <Button key={value} variant={status === value ? 'default' : 'outline'}
        aria-pressed={status === value} onClick={() => { setStatus(value); setPage(1); setSelected(null); }}>
        {value === 'PENDING' ? 'Pending' : 'All requests'}
      </Button>)}
      <Button variant="outline" onClick={() => setRefresh(value => value + 1)}>Refresh</Button>
    </div>
    {notice && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {loading ? <p role="status" className="text-sm text-stone-600">Loading correction requests…</p> :
      !list?.rows.length ? <p className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-sm text-stone-600">No requests in this view.</p> :
        <ul className="space-y-3">{list.rows.map(row => <li key={row.id} className="rounded-xl border border-stone-200 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h3 className="font-semibold text-stone-900">{graduateName(row)}</h3>
              <p className="mt-1 text-sm text-stone-600">{row.graduate.studentNumber} · {row.trackType === 'INFORMATION' ? 'Information' : 'Photos'} · {row.graduate.department || 'Department not provided'}</p></div>
            <span className="rounded-md bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">{row.status === 'PENDING' ? 'Pending' : row.status === 'APPROVED' ? 'Approved' : 'Declined'}</span>
          </div>
          <p className="mt-3 whitespace-pre-wrap break-words text-sm text-stone-800">{row.reason}</p>
          <p className="mt-2 text-xs text-stone-500">Requested by {[row.requestedBy.first_name, row.requestedBy.last_name].filter(Boolean).join(' ') || 'Staff'} · {new Date(row.createdAt).toLocaleString()}</p>
          {row.decisionNote && <p className="mt-2 text-sm text-stone-600">IT reason: {row.decisionNote}</p>}
          <Button variant="outline" className="mt-3" onClick={event => {
            returnFocusRef.current = event.currentTarget;
            setView({ reviewId: row.reviewId, trackType: row.trackType });
          }}>View approved record</Button>
          {row.status === 'PENDING' && !row.requestedByCurrentUser && row.stage === 'LOCKED' &&
            row.currentVersion === row.lockedVersion && <div className="mt-4 flex gap-2">
              <Button onClick={() => choose(row, 'APPROVE')}>Approve reopening</Button>
              <Button variant="outline" onClick={() => choose(row, 'REJECT')}>Decline</Button>
            </div>}
          {row.status === 'PENDING' && row.requestedByCurrentUser && <p className="mt-3 text-xs text-stone-500">A different IT reviewer must decide a request you submitted.</p>}
        </li>)}</ul>}
    {selected && <div className="rounded-xl border border-amber-300 bg-amber-50 p-5">
      <h3 className="font-semibold text-stone-900">{selected.decision === 'APPROVE' ? 'Approve correction?' : 'Decline correction?'}</h3>
      <p className="mt-1 text-sm text-stone-700">{selected.decision === 'APPROVE' ?
        'The old approval stays in history and a new editable draft opens. The correction must pass QC and moderator approval again.' :
        'The approved review remains locked. Explain why the request is declined.'}</p>
      {selected.decision === 'REJECT' && <label className="mt-3 block text-sm font-medium text-stone-800">Reason
        <textarea value={reason} maxLength={2000} onChange={event => { setReason(event.target.value); setDecisionError(''); }}
          className="mt-2 min-h-24 w-full rounded-lg border border-stone-300 bg-white p-3 text-sm"
          placeholder="Explain the IT decision." />
      </label>}
      {decisionError && <p role="alert" className="mt-2 text-sm text-red-700">{decisionError}</p>}
      <div className="mt-4 flex gap-2">
        <Button disabled={busy || (selected.decision === 'REJECT' && !reason.trim())} onClick={decide}>{busy ? 'Saving…' : 'Confirm decision'}</Button>
        <Button variant="outline" disabled={busy} onClick={() => setSelected(null)}>Cancel</Button>
      </div>
    </div>}
    {list && pages > 1 && <div className="flex items-center justify-between text-sm text-stone-600">
      <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
      <span>Page {page} of {pages}</span>
      <Button variant="outline" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</Button>
    </div>}
    <InformationProfileDialog reviewId={view?.trackType === 'INFORMATION' ? view.reviewId : null}
      onClose={() => setView(null)} onChanged={() => setRefresh(value => value + 1)} returnFocusRef={returnFocusRef} />
    <PhotoReviewDialog reviewId={view?.trackType === 'PHOTOS' ? view.reviewId : null}
      onClose={() => setView(null)} onChanged={() => setRefresh(value => value + 1)} returnFocusRef={returnFocusRef} />
  </section>;
}
