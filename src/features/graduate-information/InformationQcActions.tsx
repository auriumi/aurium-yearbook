'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { decideInformationQc, getInformationDetail,
  type InformationDetail, type InformationQcDecision } from './api';

const actions: { action: InformationQcDecision; permission: string; label: string }[] = [
  { action: 'APPROVE', permission: 'QC_APPROVE', label: 'Approve for QC' },
  { action: 'REJECT', permission: 'QC_REJECT', label: 'Reject and return' },
  { action: 'FORWARD', permission: 'FORWARD_MODERATOR', label: 'Send to moderator' },
];

export function InformationQcActions({ detail, onUpdated, onChanged, onBusyChange, onNotice }: {
  detail: InformationDetail;
  onUpdated: (detail: InformationDetail) => void;
  onChanged: () => void;
  onBusyChange: (busy: boolean) => void;
  onNotice: (notice: string) => void;
}) {
  const [selected, setSelected] = useState<InformationQcDecision | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef<{ fingerprint: string; operationId: string } | null>(null);
  const allowed = actions.filter(item => detail.availableActions.includes(item.permission));
  const trimmedReason = reason.trim().replace(/[\r\n]+/g, ' ');
  const validReason = selected !== 'REJECT' || (trimmedReason.length > 0 && trimmedReason.length <= 2000 && !/[\u0000-\u001f\u007f]/.test(trimmedReason));

  async function decide() {
    if (!selected || !detail.draft || busy || !validReason ||
        !allowed.some(item => item.action === selected)) return;
    const action = selected;
    const note = action === 'REJECT' ? trimmedReason : null;
    const fingerprint = JSON.stringify([detail.reviewId, detail.version, detail.draft.revisionId, action, note]);
    if (pending.current?.fingerprint !== fingerprint) {
      pending.current = { fingerprint, operationId: crypto.randomUUID() };
    }
    setSelected(null);
    setBusy(true);
    onBusyChange(true);
    setError('');
    onNotice('');
    let decided = false;
    try {
      const result = await decideInformationQc(detail.reviewId, detail.version, detail.draft.revisionId,
        pending.current.operationId, action, note);
      decided = true;
      onUpdated({ ...detail, version: result.version, informationStage: result.stage,
        queue: result.stage === 'SUBMITTED_MODERATOR' ? 'APPROVED_QC' : result.stage === 'REJECTED_QC' ? 'REJECTED_QC' : 'APPROVED_QC',
        availableActions: [] });
      onChanged();
      pending.current = null;
      const updated = await getInformationDetail(detail.reviewId);
      onUpdated(updated);
      setReason('');
      onNotice(action === 'REJECT' ? 'Returned to the general proofreader with your reason.'
        : action === 'APPROVE' ? 'QC approved. Send it to the moderator when ready.'
          : 'Sent to the moderator for final review.');
    } catch (cause) {
      if (decided) onNotice('Decision saved, but the profile could not refresh. Close and reopen it for the latest status.');
      else setError(cause instanceof Error ? cause.message : 'Unable to save the QC decision. Refresh and try again.');
    } finally {
      setBusy(false);
      onBusyChange(false);
    }
  }

  if (!allowed.length && !busy && !error) return null;
  return <>
    <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3">
      <div className="min-w-0 text-sm">
        {error ? <p role="alert" className="text-red-700">{error}</p>
          : <p role="status" className="text-stone-600">Review the complete profile and highlighted draft changes.</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {allowed.map(item => <Button key={item.action} variant={item.action === 'REJECT' ? 'outline' : 'default'}
          disabled={busy} onClick={() => { setError(''); setSelected(item.action); }} className="min-h-11">
          {item.label}
        </Button>)}
      </div>
    </div>
    <AlertDialog open={selected !== null} onOpenChange={open => { if (!open && !busy) setSelected(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{selected === 'REJECT' ? 'Return this revision to the proofreader?' :
            selected === 'FORWARD' ? 'Send this QC-approved revision to the moderator?' : 'Approve this revision for QC?'}</AlertDialogTitle>
          <AlertDialogDescription>
            {selected === 'REJECT' ? 'The general proofreader will see your reason and can prepare a new revision.' :
              selected === 'FORWARD' ? 'The moderator will make the final decision. The live graduate record is unchanged.' :
                'This marks the revision as QC approved. The live graduate record is unchanged.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {selected === 'REJECT' && <div>
          <label htmlFor="information-qc-reason" className="mb-2 block text-sm font-medium text-stone-800">Reason for rejection <span aria-hidden="true">*</span></label>
          <textarea id="information-qc-reason" required maxLength={2000} value={reason}
            onChange={event => setReason(event.target.value)} rows={4}
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus-visible:outline-2 focus-visible:outline-amber-800"
            placeholder="Explain what the proofreader should correct" />
          <p className="mt-1 text-xs text-stone-600">{reason.length}/2000 characters</p>
        </div>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Keep reviewing</AlertDialogCancel>
          <AlertDialogAction disabled={busy || !validReason} onClick={decide}>
            {selected === 'REJECT' ? 'Return to proofreader' : selected === 'FORWARD' ? 'Send to moderator' : 'Approve for QC'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>;
}
