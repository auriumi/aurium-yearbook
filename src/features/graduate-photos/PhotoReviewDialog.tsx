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

function PhotoCard({ title, src, alt, description, children }: { title: string; src: string | null; alt: string; description: string; children?: ReactNode }) {
  return <section className="rounded-xl border border-stone-200 bg-white p-4">
    <div className="mb-3"><h3 className="font-semibold text-stone-900">{title}</h3>
      <p className="mt-1 text-xs text-stone-600">{description}</p></div>
    <div className="relative flex aspect-[4/5] max-h-[42vh] items-center justify-center overflow-hidden rounded-lg bg-stone-100 text-sm text-stone-500">
      {src ? <Image unoptimized fill sizes="(max-width: 768px) 100vw, 33vw" src={src} alt={alt} className="object-contain" />
        : <span>No photo yet</span>}
    </div>
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
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'photos' | 'profile' | 'activity'>('photos');
  const [selected, setSelected] = useState<{ type: Kind; file: File } | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notice, setNotice] = useState('');
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [commentDraft, setCommentDraft] = useState('');
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const pendingSubmission = useRef<string | null>(null);

  useEffect(() => {
    if (reviewId === null) return;
    const controller = new AbortController();
    setDetail(null); setEvents([]); setUploads([]); setLatestRejection(null); setHistoryError(''); setError(''); setNotice(''); setSelected(null); setTab('photos');
    setCommentDraft(''); setConfirmDiscard(false);
    getPhotoDetail(reviewId, controller.signal).then(result => { if (!controller.signal.aborted) setDetail(result); })
      .catch(cause => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Unable to load photos.'); });
    getPhotoDecisionHistory(reviewId, controller.signal).then(result => {
      if (!controller.signal.aborted) {
        setEvents(result.events); setUploads(result.uploads ?? []); setLatestRejection(result.latestRejection ?? null);
      }
    }).catch(cause => {
      if (!controller.signal.aborted) setHistoryError(cause instanceof Error ? cause.message : 'Unable to load review activity.');
    });
    return () => controller.abort();
  }, [reviewId]);

  useEffect(() => {
    if (reviewId === null || !commentDraft.trim()) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, [reviewId, commentDraft]);

  async function refreshHistory(id: number) {
    try {
      const history = await getPhotoDecisionHistory(id);
      setEvents(history.events); setUploads(history.uploads ?? []); setHistoryError('');
      setLatestRejection(history.latestRejection ?? null);
    }
    catch (cause) { setHistoryError(cause instanceof Error ? cause.message : 'Unable to load review activity.'); }
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
      const updated = await getPhotoDetail(detail.reviewId);
      setDetail(updated); setSelected(null); setProgress(0); onChanged();
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
      setDetail(await getPhotoDetail(detail.reviewId));
      void refreshHistory(detail.reviewId);
      pendingSubmission.current = null; onChanged(); setNotice('Photo pair submitted to QC.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to submit this pair.'); }
    finally { setBusy(false); }
  }

  const canUpload = !!detail?.availableActions.includes('UPLOAD');
  const canSubmit = !!detail?.availableActions.includes('SUBMIT_QC');
  const rejection = latestRejection ?? events.find(event => event.action === 'REJECTED_QC' || event.action === 'REJECTED_MODERATOR');
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
          {detail && tab === 'photos' && <div>
            {(detail.stage === 'REJECTED_QC' || detail.stage === 'REJECTED_MODERATOR') && rejection?.note &&
              <div role="status" className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
                <strong>{photoEventLabels[rejection.action]}:</strong> {rejection.note}
              </div>}
            <p className="mb-4 text-sm text-stone-600">Compare both photos with the registration reference. JPEG, PNG or WebP · up to 5 MB · 8192 pixels per side · 32 megapixels.</p>
            <div className="grid gap-4 md:grid-cols-3">
              <PhotoCard title="Registration reference" src={detail.photos.reference} alt={`Registration reference for ${name(detail.profile)}`} description="For comparison only; it cannot be changed here" />
              <PhotoCard title="Graduation photo" src={selected?.type === 'GRADUATION' ? preview : detail.photos.graduation?.url ?? null} alt={`Graduation photo for ${name(detail.profile)}`} description="Required for QC submission">{uploadControl('GRADUATION')}</PhotoCard>
              <PhotoCard title="Theme photo" src={selected?.type === 'THEME' ? preview : detail.photos.theme?.url ?? null} alt={`Theme photo for ${name(detail.profile)}`} description="Required for QC submission">{uploadControl('THEME')}</PhotoCard>
            </div>
          </div>}
          {detail && tab === 'profile' && <FullProfile profile={detail.profile} />}
          {detail && tab === 'activity' && <PhotoReviewActivity detail={detail} events={events} uploads={uploads}
            historyError={historyError} note={commentDraft} onNoteChange={setCommentDraft} onBusyChange={setBusy}
            onCommented={async () => {
              onChanged();
              setDetail(await getPhotoDetail(detail.reviewId));
              await refreshHistory(detail.reviewId);
            }} />}
        </div>
        {detail && <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-stone-200 bg-white px-4 py-3 sm:px-6">
          <p className="text-sm text-stone-600">{detail.pair ? `Pair revision ${detail.pair.revisionId}` : 'Both photos are needed for a complete pair.'}</p>
          {canSubmit && <Button disabled={busy || !!selected} onClick={() => setConfirmSubmit(true)}>Submit pair to QC</Button>}
          <PhotoReviewActions detail={detail} onUpdated={setDetail}
            onChanged={() => { onChanged(); void refreshHistory(detail.reviewId); }}
            onBusyChange={setBusy} onNotice={setNotice} />
        </div>}
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
