'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  getInformationOptions, type EditableProfile, type EditableProfileField,
  type InformationDetail, type InformationOptions,
} from './api';

const sections: { title: string; fields: { key: EditableProfileField; label: string; maxLength?: number }[] }[] = [
  { title: 'Personal information', fields: [
    { key: 'firstName', label: 'First name' }, { key: 'middleName', label: 'Middle name' },
    { key: 'lastName', label: 'Last name' }, { key: 'suffix', label: 'Suffix', maxLength: 40 },
    { key: 'nickname', label: 'Nickname' }, { key: 'birthDate', label: 'Date of birth' },
  ] },
  { title: 'Contact and address', fields: [
    { key: 'contactNumber', label: 'Mobile number', maxLength: 40 },
    { key: 'province', label: 'Province' }, { key: 'city', label: 'City / municipality' },
    { key: 'barangay', label: 'Barangay' },
  ] },
  { title: 'Parents and guardian', fields: [
    { key: 'mothersName', label: 'Mother’s name' }, { key: 'mothersTitle', label: 'Mother’s title', maxLength: 80 },
    { key: 'fathersName', label: 'Father’s name' }, { key: 'fathersTitle', label: 'Father’s title', maxLength: 80 },
    { key: 'guardiansName', label: 'Guardian’s name' }, { key: 'guardiansTitle', label: 'Guardian’s title', maxLength: 80 },
  ] },
];

function prior(value: string | null) { return value || 'Not provided'; }
function withCurrent(choices: string[], current: string | null) {
  return current && !choices.includes(current) ? [current, ...choices] : choices;
}

function TextField({ field, label, maxLength = 120, value, original, onChange }: {
  field: EditableProfileField; label: string; maxLength?: number;
  value: string | null; original: string | null; onChange: (value: string | null) => void;
}) {
  const changed = value !== original;
  const isDate = field === 'birthDate';
  const isRequired = field === 'firstName' || field === 'lastName';
  const inputId = `information-${field}`;
  return <div className={`min-w-0 rounded-lg p-2 ${changed ? 'bg-amber-50 ring-1 ring-amber-200' : ''}`}>
    <Label htmlFor={inputId} className="text-xs font-medium text-stone-700">{label}{changed && <span className="ml-2 text-amber-800">Changed</span>}</Label>
    {field === 'thesisTitle' ? <Textarea id={inputId} value={value ?? ''} maxLength={maxLength}
      onChange={event => onChange(event.target.value || null)} className="mt-1.5 min-h-20 bg-white" />
      : <Input id={inputId} type={isDate ? 'date' : 'text'} value={value ?? ''}
        required={isRequired || (isDate && original !== null)} maxLength={isDate ? undefined : maxLength}
        onChange={event => onChange(event.target.value || null)} className="mt-1.5 bg-white" />}
    {changed && <p className="mt-1.5 text-xs text-amber-900">Previously: {prior(original)}</p>}
  </div>;
}

function AcademicSelect({ field, label, choices, disabled, allowEmpty, values, original, onChange }: {
  field: 'department' | 'program' | 'major'; label: string; choices: string[];
  disabled: boolean; allowEmpty?: boolean;
  values: EditableProfile; original: EditableProfile; onChange: (values: EditableProfile) => void;
}) {
  const changed = values[field] !== original[field];
  return <div className={`min-w-0 rounded-lg p-2 ${changed ? 'bg-amber-50 ring-1 ring-amber-200' : ''}`}>
    <Label htmlFor={`information-${field}`} className="text-xs font-medium text-stone-700">
      {label}{changed && <span className="ml-2 text-amber-800">Changed</span>}
    </Label>
    <select id={`information-${field}`} value={values[field] ?? ''} disabled={disabled}
      required={field !== 'major' || (values.program !== original.program && !allowEmpty && choices.length > 0)}
      onChange={event => {
        const next = event.target.value || null;
        if (field === 'department') onChange({ ...values, department: next, program: null, major: null });
        else if (field === 'program') onChange({ ...values, program: next, major: null });
        else onChange({ ...values, major: next });
      }}
      className="mt-1.5 h-9 w-full rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600">
      <option value="" disabled={field !== 'major' || !allowEmpty}>{field === 'major' && allowEmpty ? 'No major' : `Select ${label.toLowerCase()}`}</option>
      {withCurrent(choices, values[field]).map(choice => <option key={choice} value={choice}>{choice}</option>)}
    </select>
    {changed && <p className="mt-1.5 text-xs text-amber-900">Previously: {prior(original[field])}</p>}
  </div>;
}

export function InformationEditor({ detail, values, original, onChange, onSubmit }: {
  detail: InformationDetail;
  values: EditableProfile;
  original: EditableProfile;
  onChange: (values: EditableProfile) => void;
  onSubmit: () => void;
}) {
  const [options, setOptions] = useState<InformationOptions | null>(null);
  const [optionsError, setOptionsError] = useState('');
  const { department, program } = values;
  const { graduationYear: year, graduationTerm: term } = detail.profile;

  useEffect(() => {
    const controller = new AbortController();
    setOptions(null);
    setOptionsError('');
    getInformationOptions({ year, term, department: department ?? '', program: program ?? '' }, controller.signal)
      .then(result => { if (!controller.signal.aborted) setOptions(result); })
      .catch(error => {
        if (!controller.signal.aborted) setOptionsError(error instanceof Error ? error.message : 'Unable to load academic choices.');
      });
    return () => controller.abort();
  }, [year, term, department, program]);

  function setField(field: EditableProfileField, value: string | null) {
    onChange({ ...values, [field]: value });
  }

  return <form id="information-edit-form" onSubmit={event => { event.preventDefault(); onSubmit(); }} className="space-y-4">
    <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      Corrections stay in this review until final moderator approval. School and personal email remain read-only.
    </p>
    <section className="flex flex-wrap gap-4 rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-700 sm:p-5" aria-label="Read-only graduate reference">
      <div className="flex h-32 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-stone-200 bg-stone-50 text-center text-xs text-stone-500">
        {detail.profile.referencePhotoUrl ? <Image unoptimized width={96} height={128} src={detail.profile.referencePhotoUrl}
          alt="Graduate registration reference" className="h-full w-full object-cover" />
          : <span className="px-2">{detail.profile.referencePhotoPresent ? 'Reference photo unavailable' : 'No reference photo'}</span>}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-stone-900">Graduate reference</p>
        <div className="mt-2 grid gap-x-5 gap-y-2 sm:grid-cols-2">
          <p>Student number: {detail.profile.studentNumber}</p>
          <p>Graduation: {detail.profile.graduationYear} · {detail.profile.graduationTerm === 'END_YEAR' ? 'End year' : 'Mid year'}</p>
          <p className="break-words">School email: {prior(detail.profile.schoolEmail)}</p>
          <p className="break-words">Personal email: {prior(detail.profile.personalEmail)}</p>
        </div>
      </div>
    </section>
    {sections.map(section => <section key={section.title} className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
      <h3 className="text-base font-semibold text-stone-900">{section.title}</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {section.fields.map(field => <TextField key={field.key} field={field.key} label={field.label}
          maxLength={field.maxLength} value={values[field.key]} original={original[field.key]}
          onChange={value => setField(field.key, value)} />)}
      </div>
    </section>)}
    <section className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
      <h3 className="text-base font-semibold text-stone-900">Academic information</h3>
      {optionsError && <p role="alert" className="mt-2 text-sm text-red-700">{optionsError} Academic choices are unavailable.</p>}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <AcademicSelect field="department" label="Department" choices={options?.departments ?? []} disabled={!options}
          values={values} original={original} onChange={onChange} />
        <AcademicSelect field="program" label="Course / program" choices={options?.programs ?? []} disabled={!options || !department}
          values={values} original={original} onChange={onChange} />
        <AcademicSelect field="major" label="Major" choices={options?.majors ?? []}
          disabled={!options || !program} allowEmpty={options?.hasNoMajor}
          values={values} original={original} onChange={onChange} />
        <TextField field="thesisTitle" label="Thesis / capstone title" maxLength={500}
          value={values.thesisTitle} original={original.thesisTitle}
          onChange={value => setField('thesisTitle', value)} />
      </div>
    </section>
  </form>;
}
