import type { GraduateInformationRow, InformationStatus, RecordVerification } from './model';

// Fictional fixtures only. These statuses must not be inferred from registration status.
const samples: [string, string, string, string, string | null, InformationStatus, RecordVerification][] = [
  ['Alexandra', 'Reyes', 'Computing Education', 'BS Computer Science', null, 'submitted-qc', 'verified'],
  ['Miguel', 'Santos', 'Computing Education', 'BS Information Technology', null, 'pending', 'verified'],
  ['Camille', 'Mendoza', 'Teacher Education', 'Bachelor of Secondary Education', 'English', 'submitted-moderator', 'verified'],
  ['Gabriel', 'Cruz', 'Computing Education', 'BS Computer Science', null, 'rejected-qc', 'verified'],
  ['Sofia', 'Villanueva', 'Teacher Education', 'Bachelor of Secondary Education', 'English', 'completed', 'verified'],
  ['Daniel', 'Garcia', 'Engineering Education', 'BS Computer Engineering', null, 'approved-qc', 'verified'],
  ['Isabella', 'Ramos', 'Engineering Education', 'BS Computer Engineering', null, 'rejected-moderator', 'verified'],
  ['Andrea', 'Flores', 'Computing Education', 'BS Information Technology', null, 'pending', 'unchecked'],
  ['Luis', 'Navarro', 'Teacher Education', 'Bachelor of Secondary Education', 'English', 'pending', 'not-listed'],
];

export const sampleInformationRows: readonly GraduateInformationRow[] = samples.map(
  ([firstName, lastName, department, program, major, informationStatus, verification], index) => ({
    studentNumber: `2026${String(index + 1).padStart(4, '0')}`,
    firstName, lastName, department, program, major, informationStatus, verification,
  }),
);
