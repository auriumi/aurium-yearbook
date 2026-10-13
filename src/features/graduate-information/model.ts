export const reviewQueues = [
  { value: 'all', label: 'List of Graduates' },
  { value: 'pending', label: 'Pending' },
  { value: 'submitted-qc', label: 'Submitted to QC' },
  { value: 'rejected-qc', label: 'Rejected by QC' },
  { value: 'approved-qc', label: 'Approved by QC' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected-moderator', label: 'Rejected by Moderator' },
] as const;

export type InformationQueue = (typeof reviewQueues)[number]['value'];
export type InformationStatus = Exclude<InformationQueue, 'all'> | 'submitted-moderator';
export type RecordVerification = 'unchecked' | 'verified' | 'not-listed';

// A frontend list model. Map the API response to this shape when the contract is agreed.
export interface GraduateInformationRow {
  studentNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  department: string;
  program: string;
  major: string | null;
  verification: RecordVerification;
  informationStatus: InformationStatus;
}

export interface InformationFilters {
  search: string;
  department: string;
  program: string;
  major: string;
}

export const emptyFilters: InformationFilters = { search: '', department: '', program: '', major: '' };
export const noMajor = '__no_major__';
export const informationStatusLabels: Record<InformationStatus, string> = {
  pending: 'Pending', 'submitted-qc': 'Submitted to QC', 'rejected-qc': 'Rejected by QC',
  'approved-qc': 'Approved by QC', 'submitted-moderator': 'Submitted to Moderator',
  completed: 'Completed', 'rejected-moderator': 'Rejected by Moderator',
};

const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true });
const normalized = (value: string) => value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en');

export function graduateName(row: GraduateInformationRow) {
  return [row.firstName, row.middleName, row.lastName, row.suffix].filter(Boolean).join(' ');
}

export function compareFirstNames(a: GraduateInformationRow, b: GraduateInformationRow) {
  return collator.compare(a.firstName.trim(), b.firstName.trim()) ||
    collator.compare(graduateName(a), graduateName(b)) || collator.compare(a.studentNumber, b.studentNumber);
}

export function filterInformationRows(rows: readonly GraduateInformationRow[], filters: InformationFilters) {
  const query = normalized(filters.search);
  return rows.filter(row =>
    (!filters.department || row.department === filters.department) &&
    (!filters.program || row.program === filters.program) &&
    (!filters.major || (row.major || noMajor) === filters.major) &&
    (!query || normalized(graduateName(row)).includes(query) || row.studentNumber.includes(query))
  ).sort(compareFirstNames);
}

export function matchesInformationQueue(row: GraduateInformationRow, queue: InformationQueue) {
  return queue === 'all' || (row.verification === 'verified' && row.informationStatus === queue);
}

export function informationCounts(rows: readonly GraduateInformationRow[]) {
  return Object.fromEntries(reviewQueues.map(queue => [queue.value, rows.filter(row => matchesInformationQueue(row, queue.value)).length])) as Record<InformationQueue, number>;
}

export function academicFilterOptions(rows: readonly GraduateInformationRow[], filters: InformationFilters) {
  const unique = (values: string[]) => [...new Set(values)].sort(collator.compare);
  const departmentRows = rows.filter(row => !filters.department || row.department === filters.department);
  const programRows = departmentRows.filter(row => !filters.program || row.program === filters.program);
  return {
    departments: unique(rows.map(row => row.department)),
    programs: unique(departmentRows.map(row => row.program)),
    majors: unique(programRows.map(row => row.major || noMajor)),
  };
}
