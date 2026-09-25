'use client';

import { useEffect, useState } from 'react';
import { getInformationDecisionHistory, type InformationDecisionEvent } from './api';

const labels: Record<InformationDecisionEvent['action'], string> = {
  COMMENTED: 'Commented', SUBMITTED_QC: 'Submitted to QC', REJECTED_QC: 'Rejected by QC',
  APPROVED_QC: 'Approved by QC', SUBMITTED_MODERATOR: 'Sent to moderator',
  REJECTED_MODERATOR: 'Rejected by moderator', LOCKED: 'Completed',
};

export function InformationReviewActivity({ reviewId, version }: { reviewId: number; version: number }) {
  const [events, setEvents] = useState<InformationDecisionEvent[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    getInformationDecisionHistory(reviewId, controller.signal)
      .then(result => { if (!controller.signal.aborted) setEvents(result.events); })
      .catch(cause => {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Unable to load review activity.');
      });
    return () => controller.abort();
  }, [reviewId, version]);

  return <section className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
    <h3 className="text-base font-semibold text-stone-900">Review activity</h3>
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
