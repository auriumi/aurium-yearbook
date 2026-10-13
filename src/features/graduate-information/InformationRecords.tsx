'use client';

import type { InformationList, InformationQueue, InformationRow, InformationStage } from './api';

const stageLabels: Record<InformationStage, string> = {
  DRAFT: 'Pending', SUBMITTED_QC: 'Submitted to QC', REJECTED_QC: 'Rejected by QC',
  APPROVED_QC: 'Approved by QC', SUBMITTED_MODERATOR: 'Submitted to Moderator',
  REJECTED_MODERATOR: 'Rejected by Moderator', LOCKED: 'Completed',
};

function graduateName(row: InformationRow) {
  return [row.firstName, row.middleName, row.lastName, row.suffix]
    .filter(value => value && value.trim().toUpperCase() !== 'N/A').join(' ') ||
    `Graduate ${row.studentNumber}`;
}

function rowStatus(row: InformationRow) {
  if (row.verification === 'UNCHECKED') return 'Not checked';
  if (row.verification === 'NOT_LISTED') return 'Not on RAC/SAO list';
  return row.informationStage ? stageLabels[row.informationStage] : 'Review unavailable';
}

function GraduateCell({ row, queue, onOpenProfile }: {
  row: InformationRow;
  queue: InformationQueue;
  onOpenProfile: (reviewId: number, button: HTMLButtonElement) => void;
}) {
  return <>
    {queue !== 'ALL' && row.reviewId ? <button type="button"
      className="min-h-11 text-left font-semibold text-amber-900 underline-offset-2 hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
      onClick={event => onOpenProfile(row.reviewId!, event.currentTarget)}
      aria-label={`View profile for ${graduateName(row)}`}>
      {graduateName(row)}
    </button> : <p className="font-semibold text-stone-800">{graduateName(row)}</p>}
    <p className="mt-1 text-xs text-stone-500">{row.studentNumber}</p>
  </>;
}

function AcademicCell({ row }: { row: InformationRow }) {
  return <>
    <p className="text-stone-700">{row.department || 'No department'}</p>
    <p className="mt-1 text-xs text-stone-500">
      {row.program || 'No program'}{row.major ? ` · ${row.major}` : ''}
    </p>
  </>;
}

export function InformationRecords({ list, queue, queueLabel, onOpenProfile }: {
  list: InformationList;
  queue: InformationQueue;
  queueLabel: string;
  onOpenProfile: (reviewId: number, button: HTMLButtonElement) => void;
}) {
  if (list.rows.length === 0) {
    return <div className="rounded-xl border border-dashed border-stone-300 bg-white px-5 py-12 text-center">
      <p className="font-semibold text-stone-800">No graduates in this view</p>
      <p className="mt-2 text-sm text-stone-600">Choose another status, cycle or academic filter.</p>
    </div>;
  }

  return <>
    <div className="hidden overflow-hidden rounded-xl border border-stone-200 bg-white md:block">
      <table className="w-full table-fixed text-left text-sm">
        <caption className="sr-only">{queueLabel}, sorted by first name</caption>
        <thead className="border-b border-stone-200 bg-stone-50 text-xs text-stone-600"><tr>
          <th scope="col" className="w-[35%] px-5 py-4">Graduate</th>
          <th scope="col" className="w-[39%] px-5 py-4">Department and program</th>
          <th scope="col" className="px-5 py-4">Status</th>
        </tr></thead>
        <tbody className="divide-y divide-stone-100">{list.rows.map(row => <tr key={row.studentNumber}>
          <td className="break-words px-5 py-4 align-top"><GraduateCell row={row} queue={queue} onOpenProfile={onOpenProfile} /></td>
          <td className="break-words px-5 py-4 align-top"><AcademicCell row={row} /></td>
          <td className="px-5 py-4 align-top text-sm text-stone-700">{rowStatus(row)}</td>
        </tr>)}</tbody>
      </table>
    </div>
    <ul className="space-y-3 md:hidden" aria-label={queueLabel}>{list.rows.map(row => <li key={row.studentNumber} className="rounded-xl border border-stone-200 bg-white p-4">
      <GraduateCell row={row} queue={queue} onOpenProfile={onOpenProfile} />
      <div className="mt-3 text-sm"><AcademicCell row={row} /></div>
      <p className="mt-3 text-sm text-stone-700">{rowStatus(row)}</p>
    </li>)}</ul>
  </>;
}
