'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { decidePhoto, getPhotoDetail, type PhotoDetail } from './api';

type Action = { permission: string; role: 'qc' | 'moderator'; decision: 'APPROVE' | 'REJECT' | 'FORWARD';
  label: string; title: string; description: string; done: string };

const actions: Action[] = [
  { permission: 'QC_APPROVE', role: 'qc', decision: 'APPROVE', label: 'Approve for QC',
    title: 'Approve this photo pair for QC?', description: 'The exact graduation and theme photos shown here will be approved.',
    done: 'Photo pair approved by QC.' },
  { permission: 'QC_REJECT', role: 'qc', decision: 'REJECT', label: 'Reject and return',
    title: 'Return this pair to the photo uploader?', description: 'The uploader will see your reason and can submit a replacement pair.',
    done: 'Photo pair returned to the uploader with your reason.' },
  { permission: 'FORWARD_MODERATOR', role: 'qc', decision: 'FORWARD', label: 'Send to moderator',
    title: 'Send this pair to the moderator?', description: 'The moderator will review the same QC-approved pair.',
    done: 'Photo pair sent to the moderator.' },
  { permission: 'MODERATOR_APPROVE', role: 'moderator', decision: 'APPROVE', label: 'Approve and lock',
    title: 'Approve and lock this pair?', description: 'This review will become read-only. The approved pair will remain in its immutable revision.',
    done: 'Photo pair approved and locked.' },
  { permission: 'MODERATOR_REJECT', role: 'moderator', decision: 'REJECT', label: 'Reject and return',
    title: 'Return this pair to the photo uploader?', description: 'The uploader will see your reason. A replacement must pass QC again.',
    done: 'Photo pair returned to the uploader with your reason.' },
];

export function PhotoReviewActions({ detail, onUpdated, onChanged, onBusyChange, onNotice }: {
  detail: PhotoDetail; onUpdated: (value: PhotoDetail) => void; onChanged: () => void;
  onBusyChange: (value: boolean) => void; onNotice: (message: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef<{ fingerprint: string; operationId: string } | null>(null);
  const allowed = actions.filter(action => detail.availableActions.includes(action.permission));
  const choice = allowed.find(action => action.permission === selected);
  const note = reason.trim().replace(/[\r\n]+/g, ' ');
  const validReason = choice?.decision !== 'REJECT' ||
    (note.length > 0 && note.length <= 2000 && !/[\u0000-\u001f\u007f]/.test(note));

  async function decide() {
    if (!choice || !detail.pair || !validReason || busy) return;
    const rejection = choice.decision === 'REJECT' ? note : null;
    const fingerprint = JSON.stringify([detail.reviewId, detail.version, detail.pair.revisionId,
      choice.role, choice.decision, rejection]);
    if (pending.current?.fingerprint !== fingerprint) {
      pending.current = { fingerprint, operationId: crypto.randomUUID() };
    }
    setSelected(null); setBusy(true); onBusyChange(true); setError(''); onNotice('');
    let saved = false;
    try {
      const result = await decidePhoto(detail.reviewId, choice.role, detail.version,
        detail.pair.revisionId, pending.current.operationId, choice.decision, rejection);
      saved = true;
      onUpdated({ ...detail, version: result.version, stage: result.stage, availableActions: [] });
      onChanged(); pending.current = null;
      onUpdated(await getPhotoDetail(detail.reviewId));
      setReason(''); onNotice(choice.done);
    } catch (cause) {
      if (saved) onNotice('Decision saved, but this view could not refresh. Close and reopen it for the latest status.');
      else setError(cause instanceof Error ? cause.message : 'Unable to save the decision. Refresh and try again.');
    } finally { setBusy(false); onBusyChange(false); }
  }

  if (!allowed.length && !busy && !error) return null;
  return <>
    <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3">
      <p role={error ? 'alert' : undefined} className={`text-sm ${error ? 'text-red-700' : 'text-stone-600'}`}>
        {error || 'Review both photos and the registration reference before deciding.'}</p>
      <div className="flex flex-wrap gap-2">{allowed.map(action => <Button key={action.permission}
        variant={action.decision === 'REJECT' ? 'outline' : 'default'} disabled={busy}
        className="min-h-11" onClick={() => { setError(''); setSelected(action.permission); }}>
        {action.label}</Button>)}</div>
    </div>
    <AlertDialog open={selected !== null} onOpenChange={open => { if (!open && !busy) setSelected(null); }}>
      <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{choice?.title}</AlertDialogTitle>
        <AlertDialogDescription>{choice?.description}</AlertDialogDescription></AlertDialogHeader>
        {choice?.decision === 'REJECT' && <div>
          <label htmlFor="photo-rejection-reason" className="mb-2 block text-sm font-medium text-stone-800">Reason for rejection <span aria-hidden="true">*</span></label>
          <textarea id="photo-rejection-reason" required maxLength={2000} rows={4} value={reason}
            onChange={event => setReason(event.target.value)}
            placeholder="Explain which photo needs correction"
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus-visible:outline-2 focus-visible:outline-amber-800" />
          <p className="mt-1 text-xs text-stone-600">{reason.length}/2000 characters</p>
        </div>}
        <AlertDialogFooter><AlertDialogCancel disabled={busy}>Keep reviewing</AlertDialogCancel>
          <AlertDialogAction disabled={busy || !validReason} onClick={decide}>
            {choice?.label}</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>;
}
