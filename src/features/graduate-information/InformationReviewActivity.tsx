'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { addInformationComment, getInformationDecisionHistory, type InformationDecisionEvent } from './api';

const labels: Record<InformationDecisionEvent['action'], string> = {
  COMMENTED: 'Commented', SUBMITTED_QC: 'Submitted to QC', REJECTED_QC: 'Rejected by QC',
  APPROVED_QC: 'Approved by QC', SUBMITTED_MODERATOR: 'Sent to moderator',
  REJECTED_MODERATOR: 'Rejected by moderator', LOCKED: 'Completed', REOPENED: 'Reopened by IT',
};

export function InformationReviewActivity({ reviewId, version, revisionId, canComment, onCommented }: {
  reviewId: number; version: number; revisionId: number | null; canComment: boolean;
  onCommented: () => Promise<void>;
}) {
  const [events, setEvents] = useState<InformationDecisionEvent[] | null>(null);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [commentError, setCommentError] = useState('');
  const pending = useRef<{ fingerprint: string; operationId: string } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setError(''); setEvents(null);
    getInformationDecisionHistory(reviewId, controller.signal)
      .then(result => { if (!controller.signal.aborted) setEvents(result.events); })
      .catch(cause => {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Unable to load review activity.');
      });
    return () => controller.abort();
  }, [reviewId, version]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = note.trim();
    if (!revisionId || !trimmed || trimmed.length > 2000 || saving) return;
    const fingerprint = JSON.stringify([reviewId, version, revisionId, trimmed]);
    if (pending.current?.fingerprint !== fingerprint) {
      pending.current = { fingerprint, operationId: crypto.randomUUID() };
    }
    setSaving(true); setCommentError('');
    let saved = false;
    try {
      await addInformationComment(reviewId, version, revisionId, pending.current.operationId, trimmed);
      saved = true;
      setNote('');
      pending.current = null;
      await onCommented();
    } catch (cause) {
      setCommentError(saved ? 'Comment saved, but the profile could not refresh. Close and reopen this graduate.' :
        cause instanceof Error ? cause.message : 'Unable to save comment. Try again.');
    } finally { setSaving(false); }
  }

  return <section className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
    <h3 className="text-base font-semibold text-stone-900">Review activity</h3>
    {canComment && revisionId && <form onSubmit={submit} className="mt-4 border-b border-stone-200 pb-4">
      <label htmlFor={`information-comment-${reviewId}`} className="text-sm font-medium text-stone-800">Add a comment to revision {revisionId}</label>
      <textarea id={`information-comment-${reviewId}`} value={note} maxLength={2000} rows={3}
        onChange={event => { setNote(event.target.value); setCommentError(''); }}
        placeholder="Leave a clear note for the next reviewer"
        className="mt-2 w-full rounded-lg border border-stone-200 bg-white p-3 text-sm text-stone-800 focus-visible:outline-2 focus-visible:outline-amber-700" />
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-xs text-stone-500">Comments are saved with your name and time.</p>
        <Button type="submit" disabled={saving || !note.trim()}>{saving ? 'Saving…' : 'Add comment'}</Button>
      </div>
      {commentError && <p role="alert" className="mt-2 text-sm text-red-700">{commentError}</p>}
    </form>}
    {error ? <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>
      : events === null ? <p className="mt-3 text-sm text-stone-600">Loading review activity…</p>
        : events.length === 0 ? <p className="mt-3 text-sm text-stone-600">No decisions yet.</p>
          : <ol className="mt-3 divide-y divide-stone-100">
            {events.map(event => <li key={event.id} className="py-3 text-sm">
              <p className="font-medium text-stone-900">{labels[event.action]}</p>
              <p className="mt-1 text-xs text-stone-600">{event.actor.first_name} {event.actor.last_name} · {new Date(event.created_at).toLocaleString()} · Revision {event.revision_id}</p>
              {event.note && <p className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-amber-50 p-3 text-stone-800">{event.note}</p>}
            </li>)}
          </ol>}
  </section>;
}
