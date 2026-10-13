'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { decideInformationModerator, decideInformationQc, getInformationDetail,
  type InformationDetail, type InformationQcDecision, type InformationQueue, type InformationStage } from './api';

type Action = {
  decision: InformationQcDecision;
  permission: string;
  label: string;
  title: string;
  description: string;
  confirmLabel: string;
  notice: string;
};

const qcActions: Action[] = [
  { decision: 'APPROVE', permission: 'QC_APPROVE', label: 'Approve for QC',
    title: 'Approve this revision for QC?', description: 'The live graduate record is unchanged.',
    confirmLabel: 'Approve for QC', notice: 'QC approved. Send it to the moderator when ready.' },
  { decision: 'REJECT', permission: 'QC_REJECT', label: 'Reject and return',
    title: 'Return this revision to the proofreader?',
    description: 'The general proofreader will see your reason and can prepare a new revision.',
    confirmLabel: 'Return to proofreader', notice: 'Returned to the general proofreader with your reason.' },
  { decision: 'FORWARD', permission: 'FORWARD_MODERATOR', label: 'Send to moderator',
    title: 'Send this QC-approved revision to the moderator?',
    description: 'The moderator will make the final decision. The live graduate record is unchanged.',
    confirmLabel: 'Send to moderator', notice: 'Sent to the moderator for final review.' },
];

const moderatorActions: Action[] = [
  { decision: 'APPROVE', permission: 'MODERATOR_APPROVE', label: 'Approve and lock',
    title: 'Approve and lock this information?',
    description: 'The approved fields will replace the live graduate profile. This review will become read-only.',
    confirmLabel: 'Approve and lock', notice: 'Information approved and locked.' },
  { decision: 'REJECT', permission: 'MODERATOR_REJECT', label: 'Reject and return',
    title: 'Return this revision to the proofreader?',
    description: 'The general proofreader will receive your reason and can prepare a correction for QC.',
    confirmLabel: 'Return to proofreader', notice: 'Returned to the general proofreader with your reason.' },
];

const queueByStage: Record<InformationStage, Exclude<InformationQueue, 'ALL'>> = {
  DRAFT: 'PENDING', SUBMITTED_QC: 'SUBMITTED_QC', REJECTED_QC: 'REJECTED_QC',
  APPROVED_QC: 'APPROVED_QC', SUBMITTED_MODERATOR: 'SUBMITTED_MODERATOR',
  REJECTED_MODERATOR: 'REJECTED_MODERATOR', LOCKED: 'COMPLETED',
};

export function InformationReviewActions({ role, detail, onUpdated, onChanged, onBusyChange, onNotice }: {
  role: 'qc' | 'moderator';
  detail: InformationDetail;
  onUpdated: (detail: InformationDetail) => void;
  onChanged: () => void;
  onBusyChange: (busy: boolean) => void;
  onNotice: (notice: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef<{ fingerprint: string; operationId: string } | null>(null);
  const allowed = (role === 'qc' ? qcActions : moderatorActions)
    .filter(item => detail.availableActions.includes(item.permission));
  const choice = allowed.find(item => item.permission === selected);
  const trimmedReason = reason.trim().replace(/[\r\n]+/g, ' ');
  const validReason = choice?.decision !== 'REJECT' || (trimmedReason.length > 0 && trimmedReason.length <= 2000 && !/[\u0000-\u001f\u007f]/.test(trimmedReason));

  async function decide() {
    if (!choice || !detail.draft || busy || !validReason) return;
    const note = choice.decision === 'REJECT' ? trimmedReason : null;
    const fingerprint = JSON.stringify([detail.reviewId, detail.version, detail.draft.revisionId, role, choice.decision, note]);
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
      const result = role === 'qc'
        ? await decideInformationQc(detail.reviewId, detail.version, detail.draft.revisionId,
          pending.current.operationId, choice.decision, note)
        : await decideInformationModerator(detail.reviewId, detail.version, detail.draft.revisionId,
          pending.current.operationId, choice.decision as 'APPROVE' | 'REJECT', note);
      decided = true;
      onUpdated({ ...detail, version: result.version, informationStage: result.stage,
        queue: queueByStage[result.stage],
        availableActions: [] });
      onChanged();
      pending.current = null;
      const updated = await getInformationDetail(detail.reviewId);
      onUpdated(updated);
      setReason('');
      onNotice(choice.notice);
    } catch (cause) {
      if (decided) onNotice('Decision saved, but the profile could not refresh. Close and reopen it for the latest status.');
      else setError(cause instanceof Error ? cause.message : 'Unable to save the review decision. Refresh and try again.');
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
        {allowed.map(item => <Button key={item.permission} variant={item.decision === 'REJECT' ? 'outline' : 'default'}
          disabled={busy} onClick={() => { setError(''); setSelected(item.permission); }} className="min-h-11">
          {item.label}
        </Button>)}
      </div>
    </div>
    <AlertDialog open={selected !== null} onOpenChange={open => { if (!open && !busy) setSelected(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{choice?.title}</AlertDialogTitle>
          <AlertDialogDescription>{choice?.description}</AlertDialogDescription>
        </AlertDialogHeader>
        {choice?.decision === 'REJECT' && <div>
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
            {choice?.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>;
}
