'use client';

import { useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { addPhotoComment, type PhotoDetail, type PhotoEvent, type PhotoUploadEvent } from './api';

export const photoEventLabels: Record<PhotoEvent['action'], string> = {
  COMMENTED: 'Commented', SUBMITTED_QC: 'Submitted to QC', REJECTED_QC: 'Rejected by QC',
  APPROVED_QC: 'Approved by QC', SUBMITTED_MODERATOR: 'Sent to moderator',
  REJECTED_MODERATOR: 'Rejected by moderator', LOCKED: 'Approved and locked', REOPENED: 'Reopened by IT',
};

export function PhotoReviewActivity({ detail, events, uploads, historyError, note, onNoteChange, onCommented, onBusyChange,
  mode, hasOlder, loadingOlder, refreshingHistory, onLoadOlder, onRetryHistory, busy }: {
  detail: PhotoDetail; events: PhotoEvent[]; uploads: PhotoUploadEvent[]; historyError: string;
  note: string; onNoteChange: (value: string) => void;
  onCommented: () => Promise<void>; onBusyChange: (busy: boolean) => void;
  mode: 'activity' | 'discussion'; hasOlder: boolean; loadingOlder: boolean; onLoadOlder: () => void; busy: boolean;
  refreshingHistory: boolean; onRetryHistory: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [commentError, setCommentError] = useState('');
  const pending = useRef<{ fingerprint: string; operationId: string } | null>(null);
  const canComment = detail.availableActions.includes('COMMENT');
  const pairId = detail.pair?.revisionId ?? null;
  const activity = [
    ...events.filter(event => mode === 'activity' || event.action === 'COMMENTED').map(event => ({ key: `event-${event.id}`, date: event.created_at,
      label: `${photoEventLabels[event.action]}${event.pair_id === null ? ' · Before photo pair' : ` · Pair ${event.pair_id}`}`,
      actor: event.actor, note: event.note })),
    ...(mode === 'activity' ? uploads : []).flatMap(upload => upload.sealed_at ? [{ key: `upload-${upload.id}`, date: upload.sealed_at,
      label: `${upload.type === 'GRADUATION' ? 'Graduation' : 'Theme'} photo saved`,
      actor: upload.uploader, note: null }] : []),
  ].sort((a, b) => Date.parse(b.date) - Date.parse(a.date) || b.key.localeCompare(a.key));
  const trimmed = note.trim();
  const valid = trimmed.length > 0 && trimmed.length <= 2000 &&
    !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(trimmed);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canComment || !valid || saving || busy) return;
    const fingerprint = JSON.stringify([detail.reviewId, detail.version, pairId, trimmed]);
    if (pending.current?.fingerprint !== fingerprint) {
      pending.current = { fingerprint, operationId: crypto.randomUUID() };
    }
    setSaving(true); onBusyChange(true); setCommentError('');
    let saved = false;
    try {
      await addPhotoComment(detail.reviewId, detail.version, pairId,
        pending.current.operationId, trimmed);
      saved = true; pending.current = null; onNoteChange('');
      await onCommented();
    } catch (cause) {
      setCommentError(saved ? 'Comment saved, but this view could not refresh. Close and reopen the graduate.' :
        cause instanceof Error ? cause.message : 'Unable to save the comment. Refresh and try again.');
    } finally { setSaving(false); onBusyChange(false); }
  }

  return <section className="rounded-xl border border-stone-200 bg-white p-4">
    <h3 className="font-semibold text-stone-900">{mode === 'activity' ? 'Photo review activity' : 'Comments'}</h3>
    {mode === 'discussion' && canComment && <form onSubmit={submit} className="mt-4 border-b border-stone-200 pb-4">
      <label htmlFor={`photo-comment-${detail.reviewId}`} className="text-sm font-medium text-stone-800">
        {pairId === null ? 'Add a comment before uploading the photo pair' : `Add a comment to pair ${pairId}`}</label>
      <textarea id={`photo-comment-${detail.reviewId}`} value={note} maxLength={2000} rows={3} disabled={saving || busy}
        onChange={event => { onNoteChange(event.target.value); setCommentError(''); }}
        placeholder="Leave a clear note about the photos"
        className="mt-2 w-full rounded-lg border border-stone-200 bg-white p-3 text-sm text-stone-800 focus-visible:outline-2 focus-visible:outline-amber-700" />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-stone-600">{note.length}/2000</p>
        <Button className="min-h-11" type="submit" disabled={saving || busy || !valid}>{saving ? 'Saving…' : 'Add comment'}</Button>
      </div>
      {commentError && <p role="alert" className="mt-2 text-sm text-red-700">{commentError}</p>}
    </form>}
    {historyError && <div className="mt-4"><p role="alert" className="text-sm text-red-700">{historyError}</p>
      <Button variant="outline" className="mt-2" disabled={refreshingHistory || loadingOlder || busy} onClick={onRetryHistory}>Retry history</Button></div>}
    {refreshingHistory && <p role="status" className="mt-4 text-sm text-stone-600">Loading activity…</p>}
    {!historyError && !refreshingHistory && !activity.length && <p className="mt-4 text-sm text-stone-600">{mode === 'activity' ? 'No activity recorded yet.' : 'No comments in the loaded activity.'}</p>}
    <ol className="mt-4 divide-y divide-stone-100">{activity.map(event => <li key={event.key} className="py-3 first:pt-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-stone-900">{event.label}</p>
        <time dateTime={event.date} className="text-xs text-stone-500">{new Date(event.date).toLocaleString()}</time>
      </div>
      <p className="mt-1 text-xs text-stone-600">{[event.actor.first_name, event.actor.last_name].filter(Boolean).join(' ') || 'Assigned staff'}</p>
      {event.note && <p className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-amber-50 p-3 text-sm text-stone-800">{event.note}</p>}
    </li>)}</ol>
    {hasOlder && <Button variant="outline" className="mt-3 min-h-11" disabled={loadingOlder || refreshingHistory || busy} onClick={onLoadOlder}>
      {loadingOlder ? 'Loading…' : 'Load older activity'}</Button>}
  </section>;
}
