'use client';

import { useEffect, useState, type RefObject } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { getInformationDetail, type InformationDetail } from './api';

type Field = [label: string, value: string | number | null | undefined];

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

function FieldGroup({ title, fields }: { title: string; fields: Field[] }) {
  return <section className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
    <h3 className="text-base font-semibold text-stone-900">{title}</h3>
    <dl className="mt-4 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
      {fields.map(([label, value]) => <div key={label} className="min-w-0">
        <dt className="text-xs font-medium text-stone-500">{label}</dt>
        <dd className="mt-1 break-words text-sm leading-6 text-stone-800">{display(value)}</dd>
      </div>)}
    </dl>
  </section>;
}

function Profile({ detail }: { detail: InformationDetail }) {
  const profile = detail.profile;
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

    <div className="grid gap-4 xl:grid-cols-2">
      <FieldGroup title="Personal information" fields={[
        ['First name', profile.firstName], ['Middle name', profile.middleName],
        ['Last name', profile.lastName], ['Suffix', profile.suffix],
        ['Nickname', profile.nickname], ['Date of birth', profile.birthDate],
      ]} />
      <FieldGroup title="Academic information" fields={[
        ['Department', profile.department], ['Course / program', profile.program],
        ['Major', profile.major], ['Graduation year', profile.graduationYear],
        ['Graduation term', profile.graduationTerm === 'END_YEAR' ? 'End year' : 'Mid year'],
        ['Thesis / capstone title', profile.thesisTitle],
      ]} />
      <FieldGroup title="Contact and address" fields={[
        ['School email', profile.schoolEmail], ['Personal email', profile.personalEmail],
        ['Mobile number', profile.contactNumber], ['Province', profile.province],
        ['City / municipality', profile.city], ['Barangay', profile.barangay],
      ]} />
      <FieldGroup title="Parents and guardian" fields={[
        ['Mother’s name', profile.mothersName], ['Mother’s title', profile.mothersTitle],
        ['Father’s name', profile.fathersName], ['Father’s title', profile.fathersTitle],
        ['Guardian’s name', profile.guardiansName], ['Guardian’s title', profile.guardiansTitle],
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
  </div>;
}

export function InformationProfileDialog({ reviewId, onClose, returnFocusRef }: {
  reviewId: number | null;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}) {
  const [request, setRequest] = useState<{
    reviewId: number; detail?: InformationDetail; error?: string;
  } | null>(null);

  useEffect(() => {
    if (reviewId === null) return;
    const controller = new AbortController();
    setRequest({ reviewId });
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

  return <Dialog open={reviewId !== null} onOpenChange={open => { if (!open) onClose(); }}>
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
          <DialogDescription className="mt-1 text-sm text-stone-600">Focused, read-only profile</DialogDescription>
        </div>
        <Button variant="outline" onClick={onClose} className="min-h-11 shrink-0">Close</Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
        {!current?.detail && !current?.error ? <p role="status" className="text-sm text-stone-600">Loading graduate profile…</p>
          : current.error ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{current.error}</p>
            : current.detail ? <Profile detail={current.detail} /> : null}
      </div>
    </DialogContent>
  </Dialog>;
}
