const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL || '';

export type GraduationTerm = 'MID_YEAR' | 'END_YEAR';
export type InformationQueue = 'ALL' | 'PENDING' | 'SUBMITTED_QC' | 'REJECTED_QC' |
  'APPROVED_QC' | 'SUBMITTED_MODERATOR' | 'COMPLETED' | 'REJECTED_MODERATOR';
export type InformationStage = 'DRAFT' | 'SUBMITTED_QC' | 'REJECTED_QC' | 'APPROVED_QC' |
  'SUBMITTED_MODERATOR' | 'REJECTED_MODERATOR' | 'LOCKED';
export type Verification = 'UNCHECKED' | 'NOT_LISTED' | 'VERIFIED';

export interface EditableProfile {
  firstName: string | null; middleName: string | null; lastName: string | null;
  suffix: string | null; nickname: string | null; birthDate: string | null;
  department: string | null; program: string | null; major: string | null;
  thesisTitle: string | null; contactNumber: string | null;
  province: string | null; city: string | null; barangay: string | null;
  mothersName: string | null; mothersTitle: string | null;
  fathersName: string | null; fathersTitle: string | null;
  guardiansName: string | null; guardiansTitle: string | null;
}

export type EditableProfileField = keyof EditableProfile;
export const editableProfileFields: EditableProfileField[] = [
  'firstName', 'middleName', 'lastName', 'suffix', 'nickname', 'birthDate',
  'department', 'program', 'major', 'thesisTitle', 'contactNumber',
  'province', 'city', 'barangay', 'mothersName', 'mothersTitle',
  'fathersName', 'fathersTitle', 'guardiansName', 'guardiansTitle',
];

export interface InformationFilters {
  year: number;
  term: GraduationTerm;
  department: string;
  program: string;
  major: string;
  search: string;
  queue: InformationQueue;
  page: number;
}

export interface InformationRow {
  studentNumber: number;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  suffix: string | null;
  department: string | null;
  program: string | null;
  major: string | null;
  verification: Verification;
  reviewId: number | null;
  informationStage: InformationStage | null;
  version: number | null;
}

export interface InformationList {
  success: true;
  rows: InformationRow[];
  page: number;
  pageSize: number;
  total: number;
  counts: Record<InformationQueue, number>;
}

export interface InformationOptions {
  success: true;
  departments: string[];
  programs: string[];
  majors: string[];
  hasNoMajor: boolean;
}

export interface InformationDetail {
  success: true;
  reviewId: number;
  informationStage: InformationStage;
  queue: Exclude<InformationQueue, 'ALL'>;
  version: number;
  availableActions: string[];
  draft: {
    revisionId: number; version: number; before: EditableProfile; after: EditableProfile;
    changedFields: EditableProfileField[]; savedAt: string;
  } | null;
  verification: { outcome: 'VERIFIED'; checkedAt: string; sourceVersion: string };
  profile: {
    studentNumber: number;
    firstName: string | null; middleName: string | null; lastName: string | null;
    suffix: string | null; nickname: string | null; birthDate: string | null;
    department: string | null; program: string | null; major: string | null;
    graduationYear: number; graduationTerm: GraduationTerm; thesisTitle: string | null;
    schoolEmail: string | null; personalEmail: string;
    contactNumber: string | null; province: string | null; city: string | null; barangay: string | null;
    mothersName: string | null; mothersTitle: string | null;
    fathersName: string | null; fathersTitle: string | null;
    guardiansName: string | null; guardiansTitle: string | null;
    solicitations: Array<{ slot: number; type: 'PERSON' | 'COMPANY'; title: string | null; name: string | null }>;
    referencePhotoUrl: string | null; referencePhotoPresent: boolean;
    record: {
      accountStatus: string | null; registeredAt: string; updatedAt: string;
      photoSession: { date: string; period: string; startTime: string | null; endTime: string | null } | null;
      attendanceRecorded: boolean;
    };
  };
}

export type InformationQcDecision = 'APPROVE' | 'REJECT' | 'FORWARD';

export interface InformationDecisionEvent {
  id: number;
  track_version: number;
  revision_id: number;
  action: 'COMMENTED' | 'SUBMITTED_QC' | 'APPROVED_QC' | 'REJECTED_QC' | 'SUBMITTED_MODERATOR' | 'REJECTED_MODERATOR' | 'LOCKED';
  from_stage: InformationStage;
  to_stage: InformationStage;
  note: string | null;
  created_at: string;
  actor: { first_name: string; last_name: string };
}

async function readResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload || payload.success !== true) {
    throw new Error(typeof payload?.reason === 'string' ? payload.reason : 'Unable to reach the review service.');
  }
  return payload as T;
}

function cycleQuery(filters: Pick<InformationFilters, 'year' | 'term'>) {
  return new URLSearchParams({ year: String(filters.year), term: filters.term });
}

export async function getInformationList(filters: InformationFilters, signal?: AbortSignal) {
  const query = cycleQuery(filters);
  query.set('page', String(filters.page));
  query.set('queue', filters.queue);
  if (filters.department) query.set('department', filters.department);
  if (filters.program) query.set('program', filters.program);
  if (filters.major) query.set('major', filters.major);
  if (filters.search) query.set('search', filters.search);
  const response = await fetch(`${baseUrl}/api/admin/information-reviews?${query}`, {
    credentials: 'include', cache: 'no-store', signal,
  });
  return readResponse<InformationList>(response);
}

export async function getInformationOptions(filters: Pick<InformationFilters, 'year' | 'term' | 'department' | 'program'>, signal?: AbortSignal) {
  const query = cycleQuery(filters);
  if (filters.department) query.set('department', filters.department);
  if (filters.program) query.set('program', filters.program);
  const response = await fetch(`${baseUrl}/api/admin/information-reviews/filter-options?${query}`, {
    credentials: 'include', cache: 'no-store', signal,
  });
  return readResponse<InformationOptions>(response);
}

export async function getInformationDetail(reviewId: number, signal?: AbortSignal) {
  const response = await fetch(`${baseUrl}/api/admin/information-reviews/${reviewId}`, {
    credentials: 'include', cache: 'no-store', signal,
  });
  return readResponse<InformationDetail>(response);
}

export async function saveInformationDraft(reviewId: number, expectedVersion: number, changes: Partial<EditableProfile>, operationId: string) {
  const response = await fetch(`${baseUrl}/api/admin/information-reviews/${reviewId}/draft`, {
    method: 'PATCH', credentials: 'include', cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expectedVersion, operationId, changes }),
  });
  return readResponse<{ success: true; changed: boolean; version: number; revisionId: number | null }>(response);
}

export async function submitInformationReview(reviewId: number, expectedVersion: number, revisionId: number, operationId: string) {
  const response = await fetch(`${baseUrl}/api/admin/information-reviews/${reviewId}/submission`, {
    method: 'POST', credentials: 'include', cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expectedVersion, revisionId, operationId }),
  });
  return readResponse<{ success: true; reviewId: number; revisionId: number; version: number; stage: 'SUBMITTED_QC' }>(response);
}

export async function decideInformationQc(reviewId: number, expectedVersion: number, revisionId: number,
  operationId: string, decision: InformationQcDecision, reason: string | null) {
  const response = await fetch(`${baseUrl}/api/admin/information-reviews/${reviewId}/qc-decision`, {
    method: 'POST', credentials: 'include', cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expectedVersion, revisionId, operationId, decision, reason }),
  });
  return readResponse<{ success: true; reviewId: number; revisionId: number; version: number; stage: InformationStage }>(response);
}

export async function getInformationDecisionHistory(reviewId: number, signal?: AbortSignal) {
  const response = await fetch(`${baseUrl}/api/admin/information-reviews/${reviewId}/decision-events`, {
    credentials: 'include', cache: 'no-store', signal,
  });
  return readResponse<{ success: true; events: InformationDecisionEvent[] }>(response);
}

export async function addInformationComment(reviewId: number, expectedVersion: number, revisionId: number,
  operationId: string, note: string) {
  const response = await fetch(`${baseUrl}/api/admin/information-reviews/${reviewId}/comments`, {
    method: 'POST', credentials: 'include', cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expectedVersion, revisionId, operationId, note }),
  });
  return readResponse<{ success: true; eventId: number; version: number }>(response);
}

export async function decideInformationModerator(reviewId: number, expectedVersion: number, revisionId: number,
  operationId: string, decision: 'APPROVE' | 'REJECT', reason: string | null) {
  const response = await fetch(`${baseUrl}/api/admin/information-reviews/${reviewId}/moderator-decision`, {
    method: 'POST', credentials: 'include', cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expectedVersion, revisionId, operationId, decision, reason }),
  });
  return readResponse<{ success: true; reviewId: number; revisionId: number; version: number; stage: InformationStage }>(response);
}
