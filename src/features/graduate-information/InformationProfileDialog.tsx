'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  editableProfileFields, getInformationDetail, saveInformationDraft, submitInformationReview,
  type EditableProfile, type InformationDetail,
} from './api';
import { InformationEditor } from './InformationEditor';
import { InformationQcActions } from './InformationQcActions';
import { InformationReviewActivity } from './InformationReviewActivity';

type Field = [label: string, value: string | number | null | undefined, changed?: boolean];

const stageLabels: Record<InformationDetail['informationStage'], string> = {
  DRAFT: 'Pending', SUBMITTED_QC: 'Submitted to QC', REJECTED_QC: 'Rejected by QC',
  APPROVED_QC: 'Approved by QC', SUBMITTED_MODERATOR: 'Submitted to Moderator',
  REJECTED_MODERATOR: 'Rejected by Moderator', LOCKED: 'Completed',
};

function display(value: Field[1]) {
  return value === null || value === undefined || value === '' ? 'Not provided' : String(value);
}

function fullName(profile: InformationDetail['profile']) {
  return [profile.firstName, profile.middleName, profile.lastName, profile.suffix]
    .filter(value => value && value.trim().toUpperCase() !== 'N/A').join(' ') ||
    `Graduate ${profile.studentNumber}`;
}

function canonicalValues(detail: InformationDetail): EditableProfile {
  const profile = detail.profile;
  return {
    firstName: profile.firstName, middleName: profile.middleName, lastName: profile.lastName,
    suffix: profile.suffix, nickname: profile.nickname, birthDate: profile.birthDate,
    department: profile.department, program: profile.program, major: profile.major,
    thesisTitle: profile.thesisTitle, contactNumber: profile.contactNumber,
    province: profile.province, city: profile.city, barangay: profile.barangay,
    mothersName: profile.mothersName, mothersTitle: profile.mothersTitle,
    fathersName: profile.fathersName, fathersTitle: profile.fathersTitle,
    guardiansName: profile.guardiansName, guardiansTitle: profile.guardiansTitle,
  };
}

function editableValues(detail: InformationDetail): EditableProfile {
  return detail.draft ? { ...detail.draft.after } : canonicalValues(detail);
}

function FieldGroup({ title, fields }: { title: string; fields: Field[] }) {
  return <section className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
    <h3 className="text-base font-semibold text-stone-900">{title}</h3>
    <dl className="mt-4 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
      {fields.map(([label, value, changed]) => <div key={label} className={`min-w-0 ${changed ? 'rounded-lg bg-amber-50 p-2 ring-1 ring-amber-200' : ''}`}>
        <dt className="text-xs font-medium text-stone-500">{label}{changed && <span className="ml-2 text-amber-800">Edited</span>}</dt>
        <dd className="mt-1 break-words text-sm leading-6 text-stone-800">{display(value)}</dd>
      </div>)}
    </dl>
  </section>;
}

function Profile({ detail }: { detail: InformationDetail }) {
  const profile = detail.draft ? { ...detail.profile, ...detail.draft.after } : detail.profile;
  const changed = (field: keyof EditableProfile) => !!detail.draft && detail.draft.after[field] !== detail.profile[field];
  const session = profile.record.photoSession;
  return <div className="space-y-4">
    <section className="flex flex-wrap items-start gap-5 rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
      <div className="flex h-32 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-stone-200 bg-stone-50 text-center text-xs text-stone-500">
        {profile.referencePhotoUrl ? <Image unoptimized width={96} height={128} src={profile.referencePhotoUrl} alt={`Registration reference photo for ${fullName(profile)}`} className="h-full w-full object-cover" />
          : <span className="px-2">{profile.referencePhotoPresent ? 'Reference photo unavailable' : 'No reference photo'}</span>}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-xl font-semibold text-stone-900">{fullName(profile)}</h2>
        <p className="mt-1 text-sm text-stone-600">Student number {profile.studentNumber}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
          <span className="rounded-md bg-emerald-50 px-2.5 py-1.5 text-emerald-800">RAC/SAO verified</span>
          <span className="rounded-md bg-amber-50 px-2.5 py-1.5 text-amber-900">Information: {stageLabels[detail.informationStage]}</span>
          <span className="rounded-md bg-stone-100 px-2.5 py-1.5 text-stone-700">Reference list: {detail.verification.sourceVersion}</span>
        </div>
        <p className="mt-3 text-xs text-stone-500">The registration photo is a read-only reference.</p>
      </div>
    </section>

    {detail.draft && detail.informationStage !== 'LOCKED' && <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">Saved draft · Changes are not in the live graduate record until final moderator approval.</p>}
    {detail.draft && <p className="rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
      Revision {detail.draft.revisionId} · Saved {new Date(detail.draft.savedAt).toLocaleString()} · {detail.draft.changedFields.length} changed fields highlighted below
    </p>}
    <div className="grid gap-4 xl:grid-cols-2">
      <FieldGroup title="Personal information" fields={[
        ['First name', profile.firstName, changed('firstName')], ['Middle name', profile.middleName, changed('middleName')],
        ['Last name', profile.lastName, changed('lastName')], ['Suffix', profile.suffix, changed('suffix')],
        ['Nickname', profile.nickname, changed('nickname')], ['Date of birth', profile.birthDate, changed('birthDate')],
      ]} />
      <FieldGroup title="Academic information" fields={[
        ['Department', profile.department, changed('department')], ['Course / program', profile.program, changed('program')],
        ['Major', profile.major, changed('major')], ['Graduation year', profile.graduationYear],
        ['Graduation term', profile.graduationTerm === 'END_YEAR' ? 'End year' : 'Mid year'],
        ['Thesis / capstone title', profile.thesisTitle, changed('thesisTitle')],
      ]} />
      <FieldGroup title="Contact and address" fields={[
        ['School email', profile.schoolEmail], ['Personal email', profile.personalEmail],
        ['Mobile number', profile.contactNumber, changed('contactNumber')], ['Province', profile.province, changed('province')],
        ['City / municipality', profile.city, changed('city')], ['Barangay', profile.barangay, changed('barangay')],
      ]} />
      <FieldGroup title="Parents and guardian" fields={[
        ['Mother’s name', profile.mothersName, changed('mothersName')], ['Mother’s title', profile.mothersTitle, changed('mothersTitle')],
        ['Father’s name', profile.fathersName, changed('fathersName')], ['Father’s title', profile.fathersTitle, changed('fathersTitle')],
        ['Guardian’s name', profile.guardiansName, changed('guardiansName')], ['Guardian’s title', profile.guardiansTitle, changed('guardiansTitle')],
      ]} />
    </div>

    <section className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
      <h3 className="text-base font-semibold text-stone-900">Solicitations</h3>
      {profile.solicitations.length ? <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {profile.solicitations.map(item => <div key={item.slot} className="rounded-lg border border-stone-100 bg-stone-50 p-3">
          <dt className="text-xs font-medium text-stone-500">Slot {item.slot} · {item.type === 'PERSON' ? 'Person' : 'Company'}</dt>
          <dd className="mt-1 text-sm text-stone-800">{[item.title, item.name].filter(Boolean).join(' ') || 'Not provided'}</dd>
        </div>)}
      </dl> : <p className="mt-3 text-sm text-stone-600">No solicitation records.</p>}
    </section>

    <FieldGroup title="Registration and schedule" fields={[
      ['Account status', profile.record.accountStatus],
      ['Registered on', new Date(profile.record.registeredAt).toLocaleString()],
      ['Profile updated on', new Date(profile.record.updatedAt).toLocaleString()],
      ['Photo session', session ? `${new Date(session.date).toLocaleDateString()} · ${session.period}${session.startTime ? ` · ${session.startTime}${session.endTime ? `–${session.endTime}` : ''}` : ''}` : 'Not booked'],
      ['Attendance', profile.record.attendanceRecorded ? 'Recorded' : 'Not yet recorded'],
    ]} />
    <InformationReviewActivity key={`${detail.reviewId}-${detail.version}`} reviewId={detail.reviewId} version={detail.version} />
  </div>;
}

export function InformationProfileDialog({ reviewId, onClose, onChanged, returnFocusRef }: {
  reviewId: number | null;
  onClose: () => void;
  onChanged: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}) {
  const [request, setRequest] = useState<{
    reviewId: number; detail?: InformationDetail; error?: string;
  } | null>(null);
  const [editing, setEditing] = useState(false);
  const [draftValues, setDraftValues] = useState<EditableProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [qcBusy, setQcBusy] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [notice, setNotice] = useState('');
  const [discardAction, setDiscardAction] = useState<'close' | 'cancel' | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const pendingSave = useRef<{ fingerprint: string; operationId: string } | null>(null);
  const pendingSubmission = useRef<{ fingerprint: string; operationId: string } | null>(null);

  useEffect(() => {
    if (reviewId === null) return;
    const controller = new AbortController();
    setRequest({ reviewId });
    setEditing(false);
    setDraftValues(null);
    setSaveError('');
    setSubmitError('');
    setNotice('');
    pendingSave.current = null;
    pendingSubmission.current = null;
    getInformationDetail(reviewId, controller.signal)
      .then(result => { if (!controller.signal.aborted) setRequest({ reviewId, detail: result }); })
      .catch(cause => {
        if (!controller.signal.aborted) {
          setRequest({ reviewId, error: cause instanceof Error ? cause.message : 'Unable to load graduate information.' });
        }
      });
    return () => controller.abort();
  }, [reviewId]);
  const current = request?.reviewId === reviewId ? request : null;
  const detail = current?.detail;
  const baseline = detail ? editableValues(detail) : null;
  const dirty = !!draftValues && !!baseline && editableProfileFields.some(field => draftValues[field] !== baseline[field]);
  const canSubmit = !editing && !!detail?.draft && detail.availableActions.includes('SUBMIT_QC');
  const canDecideQc = !editing && !!detail?.draft && detail.availableActions.some(action =>
    ['QC_APPROVE', 'QC_REJECT', 'FORWARD_MODERATOR'].includes(action));

  function requestClose(action: 'close' | 'cancel') {
    if (saving || submitting || qcBusy) return;
    if (editing && dirty) setDiscardAction(action);
    else if (action === 'close') onClose();
    else { setEditing(false); setDraftValues(null); setSaveError(''); }
  }

  function startEditing() {
    if (!detail || !detail.availableActions.includes('SAVE_DRAFT')) return;
    setDraftValues(editableValues(detail));
    setSaveError('');
    setNotice('');
    setEditing(true);
  }

  async function save() {
    if (!detail || !draftValues || !baseline || !dirty || saving) return;
    const normalized = { ...draftValues };
    for (const field of editableProfileFields) normalized[field] = draftValues[field]?.trim() || null;
    setDraftValues(normalized);
    const changes = Object.fromEntries(editableProfileFields
      .filter(field => normalized[field] !== baseline[field])
      .map(field => [field, normalized[field]])) as Partial<EditableProfile>;
    if (Object.keys(changes).length === 0) { setEditing(false); return; }
    const fingerprint = JSON.stringify([detail.reviewId, detail.version, changes]);
    if (pendingSave.current?.fingerprint !== fingerprint) {
      pendingSave.current = { fingerprint, operationId: crypto.randomUUID() };
    }
    setSaving(true);
    setSaveError('');
    let saved = false;
    try {
      await saveInformationDraft(detail.reviewId, detail.version, changes, pendingSave.current.operationId);
      saved = true;
      const updated = await getInformationDetail(detail.reviewId);
      setRequest({ reviewId: detail.reviewId, detail: updated });
      setEditing(false);
      setDraftValues(null);
      setNotice('Draft saved. The live graduate profile has not changed.');
      pendingSave.current = null;
    } catch (error) {
      if (saved) {
        setEditing(false);
        setDraftValues(null);
        setNotice('Draft saved, but the profile could not refresh. Close and reopen it to see the latest version.');
        pendingSave.current = null;
      } else {
        setSaveError(error instanceof Error ? error.message : 'Unable to save the draft. Your edits are still here.');
      }
    } finally {
      setSaving(false);
    }
  }

  async function submit() {
    setSubmitOpen(false);
    if (!detail?.draft || !detail.availableActions.includes('SUBMIT_QC') || submitting) return;
    const fingerprint = JSON.stringify([detail.reviewId, detail.version, detail.draft.revisionId]);
    if (pendingSubmission.current?.fingerprint !== fingerprint) {
      pendingSubmission.current = { fingerprint, operationId: crypto.randomUUID() };
    }
    setSubmitting(true);
    setSubmitError('');
    let submitted = false;
    try {
      const result = await submitInformationReview(detail.reviewId, detail.version, detail.draft.revisionId, pendingSubmission.current.operationId);
      submitted = true;
      setRequest({ reviewId: detail.reviewId, detail: {
        ...detail, informationStage: 'SUBMITTED_QC', queue: 'SUBMITTED_QC',
        version: result.version, availableActions: [],
      } });
      const updated = await getInformationDetail(detail.reviewId);
      setRequest({ reviewId: detail.reviewId, detail: updated });
      setNotice('Submitted to QC. This revision is now read-only for the proofreader.');
      pendingSubmission.current = null;
    } catch (error) {
      if (submitted) {
        setNotice('Submitted to QC, but the profile could not refresh. Close and reopen it to see the latest status.');
        pendingSubmission.current = null;
      } else {
        setSubmitError(error instanceof Error ? error.message : 'Unable to submit. Refresh and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return <>
  <Dialog open={reviewId !== null} onOpenChange={open => { if (!open) requestClose('close'); }}>
    <DialogContent
      showCloseButton={false}
      overlayClassName="bg-stone-950/70 backdrop-blur-sm"
      className="flex h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-none flex-col gap-0 overflow-hidden rounded-xl border-stone-200 bg-[#FDFBF7] p-0 sm:h-[calc(100dvh-2rem)] sm:w-[calc(100vw-2rem)] sm:max-w-none"
      onCloseAutoFocus={event => {
        event.preventDefault();
        if (returnFocusRef.current?.isConnected) returnFocusRef.current.focus();
        else document.getElementById('information-search')?.focus();
      }}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-stone-200 bg-white px-4 py-3 sm:px-6">
        <div>
          <DialogTitle className="text-lg text-stone-900">Graduate information</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-stone-600">{editing ? 'Edit information draft' : 'Complete graduate profile'}</DialogDescription>
        </div>
        <div className="flex items-center gap-2">
          {!editing && detail?.availableActions.includes('SAVE_DRAFT') && <Button onClick={startEditing} className="min-h-11">Edit information</Button>}
          <Button variant="outline" onClick={() => requestClose('close')} disabled={saving || submitting || qcBusy} className="min-h-11 shrink-0">Close</Button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
        {!current?.detail && !current?.error ? <p role="status" className="text-sm text-stone-600">Loading graduate profile…</p>
          : current.error ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{current.error}</p>
            : detail && editing && draftValues ? <InformationEditor detail={detail} values={draftValues}
              original={canonicalValues(detail)}
              onChange={values => { setDraftValues(values); setSaveError(''); }} onSubmit={save} />
              : detail ? <Profile detail={detail} /> : null}
      </div>
      {(editing || canSubmit || canDecideQc || notice || submitError) && <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-stone-200 bg-white px-4 py-3 sm:px-6">
        {(!canDecideQc || notice || submitError || editing) && <div className="min-w-0 flex-1">
          {saveError ? <p role="alert" className="text-sm text-red-700">{saveError} Your edits remain on this screen.</p>
            : submitError ? <p role="alert" className="text-sm text-red-700">{submitError}</p>
              : <p role="status" className="text-sm text-stone-600">{notice || (editing ? (dirty ? 'Unsaved draft changes' : 'No changes yet') : 'Saved draft ready for QC')}</p>}
        </div>}
        {editing && <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => requestClose('cancel')} disabled={saving}>Cancel</Button>
          <Button type="submit" form="information-edit-form" disabled={!dirty || saving}>{saving ? 'Saving…' : 'Save draft'}</Button>
        </div>}
        {canSubmit && <Button onClick={() => setSubmitOpen(true)} disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit to QC'}
        </Button>}
        {canDecideQc && detail && <InformationQcActions detail={detail}
          onUpdated={updated => setRequest({ reviewId: updated.reviewId, detail: updated })}
          onChanged={onChanged} onBusyChange={setQcBusy} onNotice={setNotice} />}
      </div>}
    </DialogContent>
  </Dialog>
  <AlertDialog open={discardAction !== null} onOpenChange={open => { if (!open) setDiscardAction(null); }}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
        <AlertDialogDescription>Your unsaved edits will be lost. Saved revisions remain in the review.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Keep editing</AlertDialogCancel>
        <AlertDialogAction onClick={() => {
          const action = discardAction;
          setDiscardAction(null);
          setEditing(false);
          setDraftValues(null);
          setSaveError('');
          if (action === 'close') onClose();
        }}>Discard changes</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
  <AlertDialog open={submitOpen} onOpenChange={setSubmitOpen}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Submit this revision to QC?</AlertDialogTitle>
        <AlertDialogDescription>The saved draft will leave the proofreader queue. You can edit it again only if QC or the moderator returns it.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Keep reviewing</AlertDialogCancel>
        <AlertDialogAction onClick={submit}>Submit to QC</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
  </>;
}
