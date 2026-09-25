const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL || '';

export type GraduationTerm = 'MID_YEAR' | 'END_YEAR';
export type VerificationStatus = 'ALL' | 'UNCHECKED' | 'NOT_LISTED' | 'VERIFIED';
export type VerificationOutcome = 'NOT_LISTED' | 'VERIFIED';

export interface ReviewAssignment {
  id: number;
  capability: string;
  department: string | null;
  course: string | null;
  major: string | null;
}

export interface GraduateRow {
  studentNumber: number;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  suffix: string | null;
  department: string | null;
  program: string | null;
  major: string | null;
  verification: Exclude<VerificationStatus, 'ALL'>;
  version: number | null;
  checkedAt: string | null;
  sourceVersion: string | null;
}

export interface VerificationList {
  success: true;
  rows: GraduateRow[];
  page: number;
  pageSize: number;
  total: number;
  sourceVersion: string | null;
  counts: { all: number; unchecked: number; verified: number; notListed: number };
}

export interface FilterOptions {
  success: true;
  departments: string[];
  programs: string[];
  majors: string[];
  hasNoMajor: boolean;
}

export interface VerificationFilters {
  year: number;
  term: GraduationTerm;
  department: string;
  program: string;
  major: string;
  search: string;
  verification: VerificationStatus;
  page: number;
}

function cycleQuery(filters: Pick<VerificationFilters, 'year' | 'term'>) {
  return new URLSearchParams({ year: String(filters.year), term: filters.term });
}

async function readResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload || payload.success !== true) {
    throw new Error(typeof payload?.reason === 'string' ? payload.reason : 'Unable to reach the review service.');
  }
  return payload as T;
}

export async function getReviewCapabilities(signal?: AbortSignal) {
  const response = await fetch(`${baseUrl}/api/admin/review-capabilities`, { credentials: 'include', cache: 'no-store', signal });
  return readResponse<{ success: true; assignments: ReviewAssignment[] }>(response);
}

export async function getVerificationList(filters: VerificationFilters, signal?: AbortSignal) {
  const query = cycleQuery(filters);
  query.set('page', String(filters.page));
  query.set('verification', filters.verification);
  if (filters.department) query.set('department', filters.department);
  if (filters.program) query.set('program', filters.program);
  if (filters.major) query.set('major', filters.major);
  if (filters.search) query.set('search', filters.search);
  const response = await fetch(`${baseUrl}/api/admin/review-graduates?${query}`, { credentials: 'include', cache: 'no-store', signal });
  return readResponse<VerificationList>(response);
}

export async function getFilterOptions(filters: Pick<VerificationFilters, 'year' | 'term' | 'department' | 'program'>, signal?: AbortSignal) {
  const query = cycleQuery(filters);
  if (filters.department) query.set('department', filters.department);
  if (filters.program) query.set('program', filters.program);
  const response = await fetch(`${baseUrl}/api/admin/review-graduate-filter-options?${query}`, { credentials: 'include', cache: 'no-store', signal });
  return readResponse<FilterOptions>(response);
}

export async function getVerificationHistory(studentNumber: number, filters: Pick<VerificationFilters, 'year' | 'term'>, signal?: AbortSignal) {
  const response = await fetch(`${baseUrl}/api/admin/review-graduates/${studentNumber}/verification-events?${cycleQuery(filters)}`, { credentials: 'include', cache: 'no-store', signal });
  return readResponse<{ success: true; events: Array<{
    id: number; action: string; previous_outcome: VerificationOutcome | null;
    new_outcome: VerificationOutcome; source_version: string; created_at: string;
    actor: { first_name: string | null; last_name: string | null };
  }> }>(response);
}

export async function submitVerification(rows: GraduateRow[], outcome: VerificationOutcome, filters: Pick<VerificationFilters, 'year' | 'term'>, sourceVersion: string, operationId: string) {
  const expectedVersions = Object.fromEntries(rows.map(row => [String(row.studentNumber), row.version]));
  const response = await fetch(`${baseUrl}/api/admin/verification-batches`, {
    method: 'POST', credentials: 'include', cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      year: filters.year, term: filters.term, studentNumbers: rows.map(row => row.studentNumber),
      outcome, expectedVersions, sourceVersion, operationId,
    }),
  });
  return readResponse<{ success: true; results: Array<{ studentNumber: number; version: number; outcome: VerificationOutcome }> }>(response);
}
