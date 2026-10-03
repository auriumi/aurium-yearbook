'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { addInformationComment, getInformationDecisionHistory, getInformationDraftHistory, type InformationDecisionEvent } from './api';

const labels: Record<InformationDecisionEvent['action'], string> = {
  COMMENTED: 'Commented', SUBMITTED_QC: 'Submitted to QC', REJECTED_QC: 'Rejected by QC',
  APPROVED_QC: 'Approved by QC', SUBMITTED_MODERATOR: 'Sent to moderator',
  REJECTED_MODERATOR: 'Rejected by moderator', LOCKED: 'Completed', REOPENED: 'Reopened by IT',
};

type ActivityItem = {
  key: string; version: number; title: string; revisionId: number | null;
  createdAt: string; actor: { first_name: string; last_name: string }; note: string | null;
};

export function InformationReviewActivity({ reviewId, version, revisionId, canComment, note, onNoteChange, onBusyChange, onCommented }: {
  reviewId: number; version: number; revisionId: number | null; canComment: boolean;
  note: string; onNoteChange: (value: string) => void; onBusyChange: (value: boolean) => void;
  onCommented: () => Promise<void>;
}) {
  const [activity, setActivity] = useState<ActivityItem[] | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [commentError, setCommentError] = useState('');
  const pending = useRef<{ fingerprint: string; operationId: string } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setError(''); setActivity(null);
    Promise.all([getInformationDecisionHistory(reviewId, controller.signal), getInformationDraftHistory(reviewId, controller.signal)])
      .then(([decisions, drafts]) => {
        if (controller.signal.aborted) return;
        const items: ActivityItem[] = [
          ...decisions.events.map(event => ({ key: `event-${event.id}`, version: event.track_version,
            title: labels[event.action], revisionId: event.revision_id, createdAt: event.created_at,
            actor: event.actor, note: event.note })),
          ...drafts.revisions.filter(revision => revision.changedFields.length > 0).map(revision => ({
            key: `draft-${revision.id}`, version: revision.version, title: 'Information edited',
            revisionId: revision.id, createdAt: revision.createdAt, actor: revision.author,
            note: `${revision.changedFields.length} changed ${revision.changedFields.length === 1 ? 'field' : 'fields'}`,
          })),
        ];
        setActivity(items.sort((a, b) => b.version - a.version));
      })
      .catch(cause => {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Unable to load review activity.');
      });
    return () => controller.abort();
  }, [reviewId, version]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = note.trim();
    if (!canComment || !trimmed || trimmed.length > 2000 || saving) return;
    const fingerprint = JSON.stringify([reviewId, version, revisionId, trimmed]);
    if (pending.current?.fingerprint !== fingerprint) {
      pending.current = { fingerprint, operationId: crypto.randomUUID() };
    }
    setSaving(true); onBusyChange(true); setCommentError('');
    let saved = false;
    try {
      await addInformationComment(reviewId, version, revisionId, pending.current.operationId, trimmed);
      saved = true;
      onNoteChange('');
      pending.current = null;
      await onCommented();
    } catch (cause) {
      setCommentError(saved ? 'Comment saved, but the profile could not refresh. Close and reopen this graduate.' :
        cause instanceof Error ? cause.message : 'Unable to save comment. Try again.');
    } finally { setSaving(false); onBusyChange(false); }
  }

  return <section className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
    <h3 className="text-base font-semibold text-stone-900">Review activity</h3>
    {canComment && <form onSubmit={submit} className="mt-4 border-b border-stone-200 pb-4">
      <label htmlFor={`information-comment-${reviewId}`} className="text-sm font-medium text-stone-800">{revisionId === null ? 'Add a comment to this review' : `Add a comment to revision ${revisionId}`}</label>
      <textarea id={`information-comment-${reviewId}`} value={note} maxLength={2000} rows={3} disabled={saving}
        onChange={event => { onNoteChange(event.target.value); setCommentError(''); }}
        placeholder="Leave a clear note for the next reviewer"
        className="mt-2 w-full rounded-lg border border-stone-200 bg-white p-3 text-sm text-stone-800 focus-visible:outline-2 focus-visible:outline-amber-700" />
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-xs text-stone-500">Comments are saved with your name and time. They do not change approval or unlock the record.</p>
        <Button type="submit" disabled={saving || !note.trim()}>{saving ? 'Saving…' : 'Add comment'}</Button>
      </div>
      {commentError && <p role="alert" className="mt-2 text-sm text-red-700">{commentError}</p>}
    </form>}
    {error ? <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>
      : activity === null ? <p className="mt-3 text-sm text-stone-600">Loading review activity…</p>
        : activity.length === 0 ? <p className="mt-3 text-sm text-stone-600">No review activity yet.</p>
          : <ol className="mt-3 divide-y divide-stone-100">
            {activity.map(item => <li key={item.key} className="py-3 text-sm">
              <p className="font-medium text-stone-900">{item.title}</p>
              <p className="mt-1 text-xs text-stone-600">{item.actor.first_name} {item.actor.last_name} · {new Date(item.createdAt).toLocaleString()} · {item.revisionId === null ? 'Before the first draft' : `Revision ${item.revisionId}`}</p>
              {item.note && <p className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-amber-50 p-3 text-stone-800">{item.note}</p>}
            </li>)}
          </ol>}
  </section>;
}
