'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { requestCorrection, type CorrectionSummary } from './api';

export function CorrectionRequestPanel({ reviewId, version, stage, correction, canRequest, onUpdated, onBusyChange }: {
  reviewId: number; version: number; stage: string; correction: CorrectionSummary | null;
  canRequest: boolean; onUpdated: () => Promise<void>; onBusyChange: (busy: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const pending = useRef<{ fingerprint: string; operationId: string } | null>(null);
  if (stage !== 'LOCKED' && !(stage === 'DRAFT' && correction?.status === 'APPROVED')) return null;
  const pendingRequest = correction?.status === 'PENDING' && stage === 'LOCKED';
  async function submit() {
    const trimmed = reason.trim();
    if (busy || !canRequest || trimmed.length < 1 || trimmed.length > 2000) return;
    const fingerprint = JSON.stringify([reviewId, version, trimmed]);
    if (pending.current?.fingerprint !== fingerprint) pending.current = { fingerprint, operationId: crypto.randomUUID() };
    setBusy(true); onBusyChange(true); setError('');
    let recorded = false;
    try {
      await requestCorrection(reviewId, version, trimmed, pending.current.operationId);
      recorded = true;
      setReason(''); setNotice('Correction request recorded. The approved review remains locked.');
      pending.current = null;
      await onUpdated();
    } catch (cause) {
      if (recorded) setNotice('Request recorded, but the view could not refresh. Close and reopen this graduate.');
      else setError(cause instanceof Error ? cause.message : 'Unable to record the request.');
    } finally {
      if (recorded) setOpen(false);
      setBusy(false); onBusyChange(false);
    }
  }
  return <>
    <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      <h3 className="font-semibold">{stage === 'LOCKED' ? 'Approved and locked' : 'IT correction approved'}</h3>
      <p className="mt-1">{pendingRequest ? 'An IT decision is pending. This approved revision remains read-only.' :
        stage === 'LOCKED' ? 'A correction requires IT authorization before editing.' :
          'The assigned reviewer can now make a new correction and submit it through QC again.'}</p>
      {correction && <div className="mt-3 space-y-1 border-t border-amber-200 pt-3">
        <p><span className="font-medium">Latest request:</span> {correction.reason}</p>
        <p><span className="font-medium">Status:</span> {correction.status === 'PENDING' ? 'Pending IT decision' :
          correction.status === 'APPROVED' ? 'Approved' : 'Declined'}</p>
        {correction.decision_note && <p><span className="font-medium">IT reason:</span> {correction.decision_note}</p>}
      </div>}
      {canRequest && !pendingRequest && <Button type="button" variant="outline" className="mt-3 min-h-11 border-amber-400 bg-white"
        onClick={() => { setOpen(true); setError(''); }}>Request correction from IT</Button>}
      {notice && <p role="status" className="mt-2 text-emerald-800">{notice}</p>}
    </section>
    <Dialog open={open} onOpenChange={value => { if (!busy) setOpen(value); }}>
      <DialogContent className="max-w-lg bg-white">
        <DialogTitle>Request a correction from IT</DialogTitle>
        <DialogDescription>Explain what needs to change. The approved revision stays locked until an assigned IT reviewer approves this request.</DialogDescription>
        <label htmlFor={`correction-reason-${reviewId}`} className="mt-3 block text-sm font-medium text-stone-800">Correction needed</label>
        <textarea id={`correction-reason-${reviewId}`} value={reason} maxLength={2000} disabled={busy}
          onChange={event => { setReason(event.target.value); setError(''); }}
          className="min-h-28 w-full rounded-lg border border-stone-300 p-3 text-sm focus-visible:outline-2 focus-visible:outline-amber-800"
          placeholder="State the record or photo that needs correction and why." />
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={busy} onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={busy || !reason.trim()} onClick={submit}>{busy ? 'Recording…' : 'Record request'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  </>;
}
