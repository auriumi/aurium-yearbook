'use client';

import { useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { addPhotoComment, type PhotoDetail, type PhotoEvent } from './api';

export const photoEventLabels: Record<PhotoEvent['action'], string> = {
  COMMENTED: 'Commented', SUBMITTED_QC: 'Submitted to QC', REJECTED_QC: 'Rejected by QC',
  APPROVED_QC: 'Approved by QC', SUBMITTED_MODERATOR: 'Sent to moderator',
  REJECTED_MODERATOR: 'Rejected by moderator', LOCKED: 'Approved and locked',
};

export function PhotoReviewActivity({ detail, events, historyError, onCommented, onBusyChange }: {
  detail: PhotoDetail; events: PhotoEvent[]; historyError: string;
  onCommented: () => Promise<void>; onBusyChange: (busy: boolean) => void;
}) {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [commentError, setCommentError] = useState('');
  const pending = useRef<{ fingerprint: string; operationId: string } | null>(null);
  const canComment = detail.availableActions.includes('COMMENT') && !!detail.pair;
  const trimmed = note.trim();
  const valid = trimmed.length > 0 && trimmed.length <= 2000 &&
    !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(trimmed);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canComment || !detail.pair || !valid || saving) return;
    const fingerprint = JSON.stringify([detail.reviewId, detail.version, detail.pair.revisionId, trimmed]);
    if (pending.current?.fingerprint !== fingerprint) {
      pending.current = { fingerprint, operationId: crypto.randomUUID() };
    }
    setSaving(true); onBusyChange(true); setCommentError('');
    let saved = false;
    try {
      await addPhotoComment(detail.reviewId, detail.version, detail.pair.revisionId,
        pending.current.operationId, trimmed);
      saved = true; pending.current = null; setNote('');
      await onCommented();
    } catch (cause) {
      setCommentError(saved ? 'Comment saved, but this view could not refresh. Close and reopen the graduate.' :
        cause instanceof Error ? cause.message : 'Unable to save the comment. Refresh and try again.');
    } finally { setSaving(false); onBusyChange(false); }
  }

  return <section className="mx-auto max-w-3xl rounded-xl border border-stone-200 bg-white p-4 sm:p-6">
    <h3 className="font-semibold text-stone-900">Photo review activity</h3>
    <p className="mt-1 text-sm text-stone-600">Decisions and comments are recorded against a specific photo pair revision.</p>
    {canComment && <form onSubmit={submit} className="mt-4 border-b border-stone-200 pb-4">
      <label htmlFor={`photo-comment-${detail.reviewId}`} className="text-sm font-medium text-stone-800">
        Add a comment to pair {detail.pair?.revisionId}</label>
      <textarea id={`photo-comment-${detail.reviewId}`} value={note} maxLength={2000} rows={3}
        onChange={event => { setNote(event.target.value); setCommentError(''); }}
        placeholder="Leave a clear note about the photos"
        className="mt-2 w-full rounded-lg border border-stone-200 bg-white p-3 text-sm text-stone-800 focus-visible:outline-2 focus-visible:outline-amber-700" />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-stone-600">Saved with your name and time · {note.length}/2000</p>
        <Button type="submit" disabled={saving || !valid}>{saving ? 'Saving…' : 'Add comment'}</Button>
      </div>
      {commentError && <p role="alert" className="mt-2 text-sm text-red-700">{commentError}</p>}
    </form>}
    {historyError && <p role="alert" className="mt-4 text-sm text-red-700">{historyError}</p>}
    {!historyError && !events.length && <p className="mt-4 text-sm text-stone-600">No activity recorded yet.</p>}
    <ol className="mt-4 divide-y divide-stone-100">{events.map(event => <li key={event.id} className="py-3 first:pt-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-stone-900">{photoEventLabels[event.action]} · Pair {event.pair_id}</p>
        <time dateTime={event.created_at} className="text-xs text-stone-500">{new Date(event.created_at).toLocaleString()}</time>
      </div>
      <p className="mt-1 text-xs text-stone-600">{[event.actor.first_name, event.actor.last_name].filter(Boolean).join(' ') || 'Assigned staff'}</p>
      {event.note && <p className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-amber-50 p-3 text-sm text-stone-800">{event.note}</p>}
    </li>)}</ol>
  </section>;
}
