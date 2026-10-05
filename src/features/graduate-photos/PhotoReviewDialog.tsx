'use client';

import { useEffect, useRef, useState, type RefObject, type ReactNode } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { beginPhotoUpload, finalizePhotoUpload, getPhotoDetail, putPhoto, submitPhotoPair,
  getPhotoDecisionHistory, type PhotoDetail, type PhotoEvent, type PhotoUploadEvent, type PhotoStage } from './api';
import { PhotoReviewActions } from './PhotoReviewActions';
import { PhotoReviewActivity, photoEventLabels } from './PhotoReviewActivity';

const labels: Record<PhotoStage, string> = {
  DRAFT: 'Pending', SUBMITTED_QC: 'Submitted to QC', REJECTED_QC: 'Rejected by QC',
  APPROVED_QC: 'Approved by QC', SUBMITTED_MODERATOR: 'Submitted to Moderator',
  REJECTED_MODERATOR: 'Rejected by Moderator', LOCKED: 'Completed',
};
type Kind = 'GRADUATION' | 'THEME';
type Field = [label: string, value: string | number | null | undefined];

function name(profile: PhotoDetail['profile']) {
  return [profile.firstName, profile.middleName, profile.lastName, profile.suffix].filter(Boolean).join(' ') ||
    `Graduate ${profile.studentNumber}`;
}

function Fields({ title, fields }: { title: string; fields: Field[] }) {
  return <section className="rounded-xl border border-stone-200 bg-white p-4">
    <h3 className="font-semibold text-stone-900">{title}</h3>
    <dl className="mt-3 grid gap-3 sm:grid-cols-2">{fields.map(([label, value]) => <div key={label}>
      <dt className="text-xs font-medium text-stone-500">{label}</dt>
      <dd className="mt-1 break-words text-sm text-stone-800">{value || 'Not provided'}</dd>
    </div>)}</dl>
  </section>;
}

function FullProfile({ profile }: { profile: PhotoDetail['profile'] }) {
  const session = profile.record.photoSession;
  return <div className="grid gap-4 xl:grid-cols-2">
    <Fields title="Personal information" fields={[
      ['First name', profile.firstName], ['Middle name', profile.middleName], ['Last name', profile.lastName],
      ['Suffix', profile.suffix], ['Nickname', profile.nickname], ['Date of birth', profile.birthDate],
    ]} />
    <Fields title="Academic information" fields={[
      ['Department', profile.department], ['Program', profile.program], ['Major', profile.major],
      ['Graduation year', profile.graduationYear],
      ['Graduation term', profile.graduationTerm === 'END_YEAR' ? 'End year' : 'Mid year'],
      ['Thesis or capstone', profile.thesisTitle],
    ]} />
    <Fields title="Contact and address" fields={[
      ['School email', profile.schoolEmail], ['Personal email', profile.personalEmail],
      ['Mobile number', profile.contactNumber], ['Province', profile.province],
      ['City or municipality', profile.city], ['Barangay', profile.barangay],
    ]} />
    <Fields title="Parents and guardian" fields={[
      ['Mother’s name', profile.mothersName], ['Mother’s title', profile.mothersTitle],
      ['Father’s name', profile.fathersName], ['Father’s title', profile.fathersTitle],
      ['Guardian’s name', profile.guardiansName], ['Guardian’s title', profile.guardiansTitle],
    ]} />
    <Fields title="Registration and schedule" fields={[
      ['Account status', profile.record.accountStatus],
      ['Registered on', new Date(profile.record.registeredAt).toLocaleString()],
      ['Profile updated on', new Date(profile.record.updatedAt).toLocaleString()],
      ['Photo session', session ? `${new Date(session.date).toLocaleDateString()} · ${session.period}` : 'Not booked'],
      ['Session time', session?.startTime && session?.endTime ? `${session.startTime}–${session.endTime}` : 'Not scheduled'],
      ['Attendance', profile.record.attendanceRecorded ? 'Recorded' : 'Not yet recorded'],
    ]} />
    <section className="rounded-xl border border-stone-200 bg-white p-4">
      <h3 className="font-semibold text-stone-900">Solicitations</h3>
      <ul className="mt-3 space-y-2 text-sm text-stone-800">{profile.solicitations.length ?
        profile.solicitations.map(item => <li key={item.slot}>Slot {item.slot} · {item.type === 'PERSON' ? 'Person' : 'Company'} ·
          {' '}{[item.title, item.name].filter(Boolean).join(' ') || 'Not provided'}</li>) : <li>No solicitation records.</li>}</ul>
    </section>
  </div>;
}

function PhotoCard({ title, src, alt, description, children, onExpand }: { title: string; src: string | null;
  alt: string; description: string; children?: ReactNode; onExpand: (button: HTMLButtonElement, title: string, src: string, alt: string) => void }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  return <section className="rounded-xl border border-stone-200 bg-white p-4">
    <div className="mb-3"><h3 className="font-semibold text-stone-900">{title}</h3>
      <p className="mt-1 text-xs text-stone-600">{description}</p></div>
    {src && failedSrc !== src ? <button type="button" onClick={event => onExpand(event.currentTarget, title, src, alt)}
      aria-label={`View ${title.toLowerCase()} larger`}
      className="relative flex aspect-[4/5] max-h-[42vh] w-full items-center justify-center overflow-hidden rounded-lg bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800">
      <Image unoptimized fill sizes="(max-width: 768px) 100vw, 33vw" src={src} alt={alt}
        onError={() => setFailedSrc(src)} className="object-contain" />
      <span className="absolute bottom-2 right-2 rounded-md bg-stone-950/80 px-2 py-1 text-xs font-medium text-white">View larger</span>
    </button> : <div className="flex aspect-[4/5] max-h-[42vh] flex-col items-center justify-center gap-2 rounded-lg bg-stone-100 px-4 text-center text-sm text-stone-600">
      {src ? <><span>Photo preview unavailable.</span><Button variant="outline" onClick={() => setFailedSrc(null)}>Retry preview</Button></>
        : <span>No photo yet</span>}
    </div>}
    {children}
  </section>;
}

export function PhotoReviewDialog({ reviewId, onClose, onChanged, returnFocusRef }: {
  reviewId: number | null; onClose: () => void; onChanged: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}) {
  const [detail, setDetail] = useState<PhotoDetail | null>(null);
  const [events, setEvents] = useState<PhotoEvent[]>([]);
  const [uploads, setUploads] = useState<PhotoUploadEvent[]>([]);
  const [latestRejection, setLatestRejection] = useState<PhotoEvent | null>(null);
  const [historyError, setHistoryError] = useState('');
  const [historyCursors, setHistoryCursors] = useState<{ events: number | null; uploads: number | null }>({ events: null, uploads: null });
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [refreshingHistory, setRefreshingHistory] = useState(false);
  const historyRequest = useRef<AbortController | null>(null);
  const reviewRequest = useRef<AbortController | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'photos' | 'profile' | 'activity'>('photos');
  const [selected, setSelected] = useState<{ type: Kind; file: File } | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notice, setNotice] = useState('');
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [expanded, setExpanded] = useState<{ title: string; src: string; alt: string } | null>(null);
  const [expandedError, setExpandedError] = useState(false);
  const expandedTrigger = useRef<HTMLButtonElement | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const pendingSubmission = useRef<string | null>(null);

  useEffect(() => {
    if (reviewId === null) return;
    const controller = new AbortController();
    const historyController = new AbortController();
    reviewRequest.current = controller;
    historyRequest.current = historyController;
    setRefreshingHistory(true);
    setHistoryCursors({ events: null, uploads: null }); setLoadingOlder(false);
    setDetail(null); setEvents([]); setUploads([]); setLatestRejection(null); setHistoryError(''); setError(''); setNotice(''); setSelected(null); setExpanded(null); setTab('photos');
    setCommentDraft(''); setConfirmDiscard(false);
    getPhotoDetail(reviewId, controller.signal).then(result => { if (!controller.signal.aborted) setDetail(result); })
      .catch(cause => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Unable to load photos.'); });
    getPhotoDecisionHistory(reviewId, historyController.signal).then(result => {
      if (!historyController.signal.aborted) {
        setEvents(result.events); setUploads(result.uploads ?? []); setLatestRejection(result.latestRejection ?? null);
        setHistoryCursors({ events: result.nextEventCursor, uploads: result.nextUploadCursor });
      }
    }).catch(cause => {
      if (!historyController.signal.aborted) setHistoryError(cause instanceof Error ? cause.message : 'Unable to load review activity.');
    }).finally(() => { if (!historyController.signal.aborted) setRefreshingHistory(false); });
    return () => { controller.abort(); historyRequest.current?.abort(); };
  }, [reviewId]);

  useEffect(() => {
    if (reviewId === null || (!commentDraft.trim() && !selected)) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, [reviewId, commentDraft, selected]);

  async function refreshHistory(id: number) {
    if (reviewRequest.current?.signal.aborted) return;
    historyRequest.current?.abort();
    const controller = new AbortController();
    historyRequest.current = controller;
    setLoadingOlder(false); setRefreshingHistory(true);
    setHistoryCursors({ events: null, uploads: null });
    try {
      const history = await getPhotoDecisionHistory(id, controller.signal);
      if (controller.signal.aborted) return;
      setEvents(history.events); setUploads(history.uploads ?? []); setHistoryError('');
      setLatestRejection(history.latestRejection ?? null);
      setHistoryCursors({ events: history.nextEventCursor, uploads: history.nextUploadCursor });
    }
    catch (cause) { if (!controller.signal.aborted) setHistoryError(cause instanceof Error ? cause.message : 'Unable to load review activity.'); }
    finally { if (!controller.signal.aborted) setRefreshingHistory(false); }
  }

  async function refreshDetail(id: number) {
    const signal = reviewRequest.current?.signal;
    if (!signal || signal.aborted) return;
    const updated = await getPhotoDetail(id, signal);
    if (!signal.aborted) setDetail(updated);
  }

  async function loadOlderHistory() {
    const signal = historyRequest.current?.signal;
    if (reviewId === null || !signal || signal.aborted || loadingOlder || refreshingHistory) return;
    setLoadingOlder(true); setHistoryError('');
    try {
      const history = await getPhotoDecisionHistory(reviewId, signal, historyCursors);
      if (signal.aborted) return;
      setEvents(previous => [...new Map([...previous, ...history.events].map(event => [event.id, event])).values()]);
      setUploads(previous => [...new Map([...previous, ...history.uploads].map(upload => [upload.id, upload])).values()]);
      setHistoryCursors({ events: history.nextEventCursor, uploads: history.nextUploadCursor });
    } catch (cause) {
      if (!signal.aborted) setHistoryError(cause instanceof Error ? cause.message : 'Unable to load older activity.');
    } finally { if (!signal.aborted) setLoadingOlder(false); }
  }

  useEffect(() => {
    if (!selected) { setPreview(null); return; }
    const url = URL.createObjectURL(selected.file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [selected]);

  function choose(type: Kind, file: File | undefined) {
    setError(''); setNotice('');
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024 || file.size < 64) {
      setError('Choose a JPEG, PNG or WebP photo between 64 bytes and 5 MB.'); return;
    }
    setSelected({ type, file });
  }

  async function upload() {
    if (!detail || !selected) return;
    setBusy(true); setProgress(0); setError(''); setNotice('');
    try {
      const started = await beginPhotoUpload(detail.reviewId, selected.type, selected.file.type, detail.version);
      await putPhoto(started.uploadUrl, selected.file, setProgress);
      await finalizePhotoUpload(detail.reviewId, started.assetId, detail.version);
      await refreshDetail(detail.reviewId);
      setSelected(null); setProgress(0); onChanged();
      void refreshHistory(detail.reviewId);
      setNotice(`${selected.type === 'GRADUATION' ? 'Graduation' : 'Theme'} photo saved in this review.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Photo upload failed. Try again.'); }
    finally { setBusy(false); }
  }

  async function submit() {
    if (!detail?.pair || selected || busy) return;
    const fingerprint = `${detail.reviewId}:${detail.version}:${detail.pair.revisionId}`;
    if (!pendingSubmission.current?.startsWith(`${fingerprint}:`)) {
      pendingSubmission.current = `${fingerprint}:${crypto.randomUUID()}`;
    }
    const operationId = pendingSubmission.current.slice(fingerprint.length + 1);
    setBusy(true); setError(''); setConfirmSubmit(false);
    try {
      await submitPhotoPair(detail.reviewId, detail.version, detail.pair.revisionId, operationId);
      await refreshDetail(detail.reviewId);
      void refreshHistory(detail.reviewId);
      pendingSubmission.current = null; onChanged(); setNotice('Photo pair submitted to QC.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to submit this pair.'); }
    finally { setBusy(false); }
  }

  const canUpload = !!detail?.availableActions.includes('UPLOAD');
  const canSubmit = !!detail?.availableActions.includes('SUBMIT_QC');
  function activity(mode: 'activity' | 'discussion') {
    return detail && <PhotoReviewActivity key={`${detail.reviewId}-${mode}`} detail={detail} events={events} uploads={uploads}
      mode={mode} busy={busy} hasOlder={historyCursors.events !== null || historyCursors.uploads !== null}
      loadingOlder={loadingOlder} refreshingHistory={refreshingHistory} onLoadOlder={loadOlderHistory}
      onRetryHistory={() => void refreshHistory(detail.reviewId)}
      historyError={historyError} note={commentDraft} onNoteChange={setCommentDraft} onBusyChange={setBusy}
      onCommented={async () => {
        onChanged();
        await refreshDetail(detail.reviewId);
        await refreshHistory(detail.reviewId);
      }} />;
  }
  const rejection = latestRejection ?? events.find(event => event.action === 'REJECTED_QC' || event.action === 'REJECTED_MODERATOR');
  function expand(button: HTMLButtonElement, title: string, src: string, alt: string) {
    expandedTrigger.current = button;
    setExpandedError(false);
    setExpanded({ title, src, alt });
  }
  function requestClose() {
    if (busy) return;
    if (selected || commentDraft.trim()) setConfirmDiscard(true);
    else onClose();
  }
  function uploadControl(type: Kind) {
    if (!canUpload) return null;
    return <div className="mt-4 border-t border-stone-100 pt-3">
      <label className="text-sm font-medium text-stone-800">
        {type === 'GRADUATION' ? 'Choose graduation photo' : 'Choose theme photo'}
        <input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy || (!!selected && selected.type !== type)}
          onChange={event => { choose(type, event.target.files?.[0]); event.currentTarget.value = ''; }}
          className="mt-2 block w-full rounded-lg border border-stone-200 bg-stone-50 p-2 text-sm file:mr-2 file:rounded file:border-0 file:bg-amber-100 file:px-3 file:py-2 file:text-amber-900" />
      </label>
      {selected?.type === type && <div className="mt-3 space-y-2">
        <p className="break-words text-xs text-stone-600">{selected.file.name} · Not saved</p>
        <div className="flex flex-wrap gap-2">
          <Button className="min-h-11" disabled={busy} onClick={upload}>{busy ? `Uploading ${progress}%…` : 'Save photo'}</Button>
          <Button className="min-h-11" variant="outline" disabled={busy} onClick={() => setSelected(null)}>Discard selection</Button>
        </div>
      </div>}
    </div>;
  }
  return <>
    <Dialog open={reviewId !== null} onOpenChange={open => { if (!open) requestClose(); }}>
      <DialogContent showCloseButton={false} overlayClassName="bg-stone-950/70 backdrop-blur-sm"
        className="flex h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-none flex-col gap-0 overflow-hidden rounded-xl border-stone-200 bg-[#FDFBF7] p-0 sm:h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)] sm:max-w-none"
        onCloseAutoFocus={event => { event.preventDefault(); returnFocusRef.current?.focus(); }}>
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-stone-200 bg-white px-4 py-3 sm:px-6">
          <div><DialogTitle className="text-lg text-stone-900">{detail ? name(detail.profile) : 'Graduate photos'}</DialogTitle>
            <DialogDescription className="mt-1 text-sm text-stone-600">{detail ? `Student ${detail.profile.studentNumber} · ${labels[detail.stage]}` : 'Loading review…'}</DialogDescription></div>
          <Button variant="outline" onClick={requestClose} disabled={busy} className="min-h-11">Close</Button>
        </div>
        <div className="flex shrink-0 gap-2 border-b border-stone-200 bg-white px-4 py-2 sm:px-6" aria-label="Graduate review sections">
          <Button aria-pressed={tab === 'photos'} variant={tab === 'photos' ? 'default' : 'ghost'} onClick={() => setTab('photos')}>Photo pair</Button>
          <Button aria-pressed={tab === 'profile'} variant={tab === 'profile' ? 'default' : 'ghost'} onClick={() => setTab('profile')}>Full profile</Button>
          <Button aria-pressed={tab === 'activity'} variant={tab === 'activity' ? 'default' : 'ghost'} onClick={() => setTab('activity')}>Review activity</Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
          {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          {notice && <p role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
          {!detail && !error && <p role="status" className="text-sm text-stone-600">Loading graduate photos…</p>}
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0">
          {detail && tab === 'photos' && <div>
            {(detail.stage === 'REJECTED_QC' || detail.stage === 'REJECTED_MODERATOR') && rejection?.note &&
              <div role="status" className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
                <strong>{photoEventLabels[rejection.action]}:</strong> {rejection.note}
              </div>}
            <p className="mb-4 text-sm text-stone-600">Compare both photos with the registration reference. JPEG, PNG or WebP · up to 5 MB · 8192 pixels per side · 32 megapixels.</p>
            <div className="grid gap-4 md:grid-cols-3">
              <PhotoCard title="Registration reference" src={detail.photos.reference} alt={`Registration reference for ${name(detail.profile)}`} description="For comparison only; it cannot be changed here" onExpand={expand} />
              <PhotoCard title="Graduation photo" src={selected?.type === 'GRADUATION' ? preview : detail.photos.graduation?.url ?? null} alt={`Graduation photo for ${name(detail.profile)}`} description="Required for QC submission" onExpand={expand}>{uploadControl('GRADUATION')}</PhotoCard>
              <PhotoCard title="Theme photo" src={selected?.type === 'THEME' ? preview : detail.photos.theme?.url ?? null} alt={`Theme photo for ${name(detail.profile)}`} description="Required for QC submission" onExpand={expand}>{uploadControl('THEME')}</PhotoCard>
            </div>
          </div>}
          {detail && tab === 'profile' && <FullProfile profile={detail.profile} />}
          {detail && tab === 'activity' && activity('activity')}
          </div>
          {detail && <aside aria-label="Photo discussion" className="xl:sticky xl:top-0 xl:max-h-[calc(100dvh-15rem)] xl:overflow-y-auto">{activity('discussion')}</aside>}
          </div>
        </div>
        {detail && <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-stone-200 bg-white px-4 py-3 sm:px-6">
          <p className="text-sm text-stone-600">{detail.pair ? `Pair revision ${detail.pair.revisionId}` : 'Both photos are needed for a complete pair.'}</p>
          {canSubmit && <Button disabled={busy || !!selected} onClick={() => setConfirmSubmit(true)}>Submit pair to QC</Button>}
          <PhotoReviewActions detail={detail} onUpdated={updated => setDetail(current =>
            current?.reviewId === updated.reviewId ? updated : current)}
            onChanged={() => { onChanged(); void refreshHistory(detail.reviewId); }}
            onBusyChange={setBusy} onNotice={setNotice} />
        </div>}
      </DialogContent>
    </Dialog>
    <Dialog open={expanded !== null} onOpenChange={open => { if (!open) setExpanded(null); }}>
      <DialogContent showCloseButton={false} overlayClassName="z-[60] bg-stone-950/90 backdrop-blur-md"
        className="z-[61] flex h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-none flex-col gap-0 overflow-hidden rounded-xl border-stone-700 bg-stone-950 p-0 sm:h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)] sm:max-w-none"
        onCloseAutoFocus={event => { event.preventDefault(); expandedTrigger.current?.focus(); }}>
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-stone-700 px-4 py-3 sm:px-6">
          <div><DialogTitle className="text-base text-white">{expanded?.title ?? 'Photo'}</DialogTitle>
            <DialogDescription className="mt-1 text-sm text-stone-300">Full-size preview of this graduate’s photo.</DialogDescription></div>
          <Button variant="outline" className="min-h-11 border-stone-600 bg-stone-900 text-white hover:bg-stone-800 hover:text-white"
            onClick={() => setExpanded(null)}>Close photo</Button>
        </div>
        <div className="relative min-h-0 flex-1 p-3 sm:p-6">
          {expanded && !expandedError && <Image unoptimized fill sizes="100vw" src={expanded.src} alt={expanded.alt}
            onError={() => setExpandedError(true)} className="object-contain p-3 sm:p-6" />}
          {expandedError && <div role="alert" className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-stone-200">
            <p>Photo preview unavailable. If the link expired, close and reopen this graduate to refresh it.</p>
            <Button variant="outline" onClick={() => setExpandedError(false)} className="border-stone-600 bg-stone-900 text-white hover:bg-stone-800">Retry preview</Button>
          </div>}
        </div>
      </DialogContent>
    </Dialog>
    <AlertDialog open={confirmSubmit} onOpenChange={setConfirmSubmit}>
      <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Submit this photo pair?</AlertDialogTitle>
        <AlertDialogDescription>QC will review the current graduation and theme photos. You cannot replace them while the pair is under review.</AlertDialogDescription>
      </AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Keep editing</AlertDialogCancel>
        <AlertDialogAction onClick={submit}>Submit to QC</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
    </AlertDialog>
    <AlertDialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
      <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
        <AlertDialogDescription>Your selected photo or comment has not been saved. Previously saved photos will stay in the review.</AlertDialogDescription>
      </AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Keep reviewing</AlertDialogCancel>
        <AlertDialogAction onClick={() => { setSelected(null); setCommentDraft(''); setConfirmDiscard(false); onClose(); }}>Discard changes</AlertDialogAction>
      </AlertDialogFooter></AlertDialogContent>
    </AlertDialog>
  </>;
}
