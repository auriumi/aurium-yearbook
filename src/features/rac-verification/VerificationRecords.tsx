'use client';

import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GraduateRow, VerificationList, VerificationOutcome } from './api';

interface Props {
  list: VerificationList;
  selected: Set<number>;
  busy: boolean;
  onToggle: (studentNumber: number) => void;
  onSelectAll: (studentNumbers: number[]) => void;
  onConfirm: (rows: GraduateRow[], outcome: VerificationOutcome) => void;
  onHistory: (studentNumber: number) => void;
}

function graduateName(row: GraduateRow) {
  return [row.firstName, row.middleName, row.lastName, row.suffix].filter(Boolean).join(' ') ||
    `Graduate ${row.studentNumber}`;
}

export function statusLabel(status: GraduateRow['verification']) {
  if (status === 'VERIFIED') return 'Verified';
  if (status === 'NOT_LISTED') return 'Not on RAC/SAO list';
  return 'Not checked';
}

function GraduateSummary({ row }: { row: GraduateRow }) {
  return <>
    <p className="font-semibold text-stone-800">{graduateName(row)}</p>
    <p className="mt-1 text-xs text-stone-500">{row.studentNumber}</p>
  </>;
}

function AcademicSummary({ row }: { row: GraduateRow }) {
  return <>
    <p className="text-stone-700">{row.department || 'No department'}</p>
    <p className="mt-1 text-xs text-stone-500">
      {row.program || 'No program'}{row.major ? ` · ${row.major}` : ''}
    </p>
  </>;
}

function SelectionBox({ row, selected, busy, onToggle }: {
  row: GraduateRow;
  selected: boolean;
  busy: boolean;
  onToggle: (studentNumber: number) => void;
}) {
  return <input
    type="checkbox"
    aria-label={`Select ${graduateName(row)}`}
    checked={selected}
    disabled={row.verification === 'VERIFIED' || busy}
    onChange={() => onToggle(row.studentNumber)}
  />;
}

function RowActions({ row, busy, onConfirm, onHistory }: {
  row: GraduateRow;
  busy: boolean;
  onConfirm: Props['onConfirm'];
  onHistory: Props['onHistory'];
}) {
  return <div className="flex flex-wrap gap-2">
    {row.verification === 'VERIFIED' ? (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-800">
        <Check size={15} aria-hidden="true" /> Verified
      </span>
    ) : <>
      <Button
        size="sm"
        disabled={busy}
        onClick={() => onConfirm([row], 'VERIFIED')}
        className="min-h-9 bg-amber-900 text-white hover:bg-amber-800"
      >
        Confirm on list
      </Button>
      {row.verification === 'UNCHECKED' && (
        <Button size="sm" variant="outline" disabled={busy} onClick={() => onConfirm([row], 'NOT_LISTED')}>
          Not on list
        </Button>
      )}
    </>}
    {row.version !== null && (
      <Button size="sm" variant="ghost" onClick={() => onHistory(row.studentNumber)}>
        Check history
      </Button>
    )}
  </div>;
}

export function VerificationRecords({ list, selected, busy, onToggle, onSelectAll, onConfirm, onHistory }: Props) {
  const rows = list.rows;
  const eligible = rows.filter(row => row.verification !== 'VERIFIED');
  const selectedRows = eligible.filter(row => selected.has(row.studentNumber));
  const allSelected = eligible.length > 0 && selectedRows.length === eligible.length;
  const actionsDisabled = busy || !list.sourceVersion;

  return <>
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3">
      <label className="flex min-h-10 items-center gap-2 text-sm text-stone-700">
        <input
          type="checkbox"
          aria-label="Select all visible eligible graduates"
          checked={allSelected}
          disabled={!eligible.length || busy}
          ref={element => { if (element) element.indeterminate = selectedRows.length > 0 && !allSelected; }}
          onChange={() => onSelectAll(allSelected ? [] : eligible.map(row => row.studentNumber))}
        />
        Select all on this page
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs text-stone-500">{selectedRows.length} selected</span>
        <Button
          disabled={!selectedRows.length || actionsDisabled}
          onClick={() => onConfirm(selectedRows, 'VERIFIED')}
          className="min-h-10 bg-amber-900 text-white hover:bg-amber-800"
        >
          Confirm selected{selectedRows.length ? ` (${selectedRows.length})` : ''}
        </Button>
      </div>
    </div>

    {rows.length === 0 ? (
      <div className="rounded-xl border border-dashed border-stone-300 bg-white px-5 py-12 text-center">
        <h3 className="font-semibold text-stone-800">No graduates in this view</h3>
        <p className="mt-2 text-sm text-stone-500">Choose another status, cycle, or academic filter.</p>
      </div>
    ) : <>
      <div className="hidden overflow-hidden rounded-xl border border-stone-200 bg-white md:block">
        <table className="w-full table-fixed text-left text-sm">
          <caption className="sr-only">RAC/SAO graduates sorted by first name</caption>
          <thead className="border-b border-stone-200 bg-stone-50 text-xs text-stone-600">
            <tr>
              <th scope="col" className="w-10 px-4 py-4"><span className="sr-only">Select</span></th>
              <th scope="col" className="w-[27%] px-3 py-4">Graduate</th>
              <th scope="col" className="w-[29%] px-3 py-4">Department and program</th>
              <th scope="col" className="w-[17%] px-3 py-4">Status</th>
              <th scope="col" className="px-3 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map(row => <tr key={row.studentNumber}>
              <td className="px-4 py-4 align-top">
                <SelectionBox row={row} selected={selected.has(row.studentNumber)} busy={busy} onToggle={onToggle} />
              </td>
              <td className="break-words px-3 py-4 align-top"><GraduateSummary row={row} /></td>
              <td className="break-words px-3 py-4 align-top"><AcademicSummary row={row} /></td>
              <td className="px-3 py-4 align-top">
                <span className={`inline-block rounded-md border px-2 py-1 text-xs font-medium ${row.verification === 'VERIFIED' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-stone-200 bg-stone-50 text-stone-700'}`}>
                  {statusLabel(row.verification)}
                </span>
              </td>
              <td className="px-3 py-4 align-top">
                <RowActions row={row} busy={actionsDisabled} onConfirm={onConfirm} onHistory={onHistory} />
              </td>
            </tr>)}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden" aria-label="RAC/SAO graduate records">
        {rows.map(row => <li key={row.studentNumber} className="rounded-xl border border-stone-200 bg-white p-4">
          <div className="flex items-start gap-3">
            <SelectionBox row={row} selected={selected.has(row.studentNumber)} busy={busy} onToggle={onToggle} />
            <div className="min-w-0 space-y-2">
              <div><GraduateSummary row={row} /></div>
              <div><AcademicSummary row={row} /></div>
              <p className="text-xs text-stone-700">{statusLabel(row.verification)}</p>
            </div>
          </div>
          <div className="mt-3 pl-7">
            <RowActions row={row} busy={actionsDisabled} onConfirm={onConfirm} onHistory={onHistory} />
          </div>
        </li>)}
      </ul>
    </>}
  </>;
}
