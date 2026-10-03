import type { GraduationTerm, InformationDetail } from '@/features/graduate-information/api';

const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL || '';
export type PhotoStage = 'DRAFT' | 'SUBMITTED_QC' | 'REJECTED_QC' | 'APPROVED_QC' |
  'SUBMITTED_MODERATOR' | 'REJECTED_MODERATOR' | 'LOCKED';
export type PhotoQueue = PhotoStage | 'ALL';
export type PhotoFilters = { year: number; term: GraduationTerm; department: string; program: string;
  major: string; search: string; stage: PhotoQueue; page: number };
export type PhotoRow = { reviewId: number | null; stage: PhotoStage | null; version: number | null;
  verification: 'UNCHECKED' | 'VERIFIED' | 'NOT_LISTED';
  studentNumber: number; firstName: string | null; middleName: string | null; lastName: string | null;
  suffix: string | null; department: string | null; program: string | null; major: string | null };
export type PhotoList = { success: true; rows: PhotoRow[]; page: number; pageSize: number; total: number;
  counts: Partial<Record<PhotoQueue, number>> };
export type PhotoOptions = { success: true; departments: string[]; programs: string[]; majors: string[]; hasNoMajor: boolean };
export type PhotoDetail = { success: true; reviewId: number; stage: PhotoStage; version: number;
  availableActions: string[];
  pair: { revisionId: number; version: number; graduationAssetId: number; themeAssetId: number } | null;
  photos: { graduation: { assetId: number; url: string; byteSize: number; sealedAt: string } | null;
    theme: { assetId: number; url: string; byteSize: number; sealedAt: string } | null;
    reference: string | null; referencePresent: boolean };
  profile: Omit<InformationDetail['profile'], 'referencePhotoUrl' | 'referencePhotoPresent'> };
export type PhotoEvent = { id: number; track_version: number; pair_id: number;
  action: 'SUBMITTED_QC' | 'REJECTED_QC' | 'APPROVED_QC' | 'SUBMITTED_MODERATOR' | 'REJECTED_MODERATOR' | 'LOCKED';
  from_stage: PhotoStage; to_stage: PhotoStage; note: string | null; created_at: string;
  actor: { first_name: string; last_name: string } };

async function read<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success !== true) {
    throw new Error(typeof payload?.reason === 'string' ? payload.reason : 'Unable to reach the photo review service.');
  }
  return payload as T;
}

function query(filters: Pick<PhotoFilters, 'year' | 'term'>) {
  return new URLSearchParams({ year: String(filters.year), term: filters.term });
}

export async function getPhotoList(filters: PhotoFilters, signal?: AbortSignal) {
  const params = query(filters);
  params.set('page', String(filters.page));
  params.set('stage', filters.stage);
  if (filters.department) params.set('department', filters.department);
  if (filters.program) params.set('program', filters.program);
  if (filters.major) params.set('major', filters.major);
  if (filters.search) params.set('search', filters.search);
  return read<PhotoList>(await fetch(`${baseUrl}/api/admin/photo-reviews?${params}`, {
    credentials: 'include', cache: 'no-store', signal,
  }));
}

export async function getPhotoOptions(filters: Pick<PhotoFilters, 'year' | 'term' | 'department' | 'program'>, signal?: AbortSignal) {
  const params = query(filters);
  if (filters.department) params.set('department', filters.department);
  if (filters.program) params.set('program', filters.program);
  return read<PhotoOptions>(await fetch(`${baseUrl}/api/admin/photo-reviews/filter-options?${params}`, {
    credentials: 'include', cache: 'no-store', signal,
  }));
}

export async function getPhotoDetail(reviewId: number, signal?: AbortSignal) {
  return read<PhotoDetail>(await fetch(`${baseUrl}/api/admin/photo-reviews/${reviewId}`, {
    credentials: 'include', cache: 'no-store', signal,
  }));
}

export async function beginPhotoUpload(reviewId: number, type: 'GRADUATION' | 'THEME', mime: string, expectedVersion: number) {
  return read<{ success: true; assetId: number; uploadUrl: string }>(await fetch(
    `${baseUrl}/api/admin/photo-reviews/${reviewId}/uploads`, {
      method: 'POST', credentials: 'include', cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, mime, expectedVersion }),
    }));
}

export function putPhoto(uploadUrl: string, file: File, onProgress: (percent: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('PUT', uploadUrl);
    request.setRequestHeader('Content-Type', file.type);
    request.upload.onprogress = event => {
      if (event.lengthComputable) onProgress(Math.round(event.loaded / event.total * 100));
    };
    request.onload = () => request.status >= 200 && request.status < 300 ? resolve() :
      reject(new Error('Storage rejected the upload. Check the file and try again.'));
    request.onerror = () => reject(new Error('The upload failed. Check your connection and try again.'));
    request.send(file);
  });
}

export async function finalizePhotoUpload(reviewId: number, assetId: number, expectedVersion: number) {
  return read<{ success: true; version: number; pairRevisionId?: number | null }>(await fetch(
    `${baseUrl}/api/admin/photo-reviews/${reviewId}/uploads/${assetId}/finalize`, {
      method: 'POST', credentials: 'include', cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ expectedVersion }),
    }));
}

export async function submitPhotoPair(reviewId: number, expectedVersion: number, revisionId: number, operationId: string) {
  return read<{ success: true }>(await fetch(`${baseUrl}/api/admin/photo-reviews/${reviewId}/submission`, {
    method: 'POST', credentials: 'include', cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expectedVersion, revisionId, operationId }),
  }));
}

export async function getPhotoDecisionHistory(reviewId: number, signal?: AbortSignal) {
  return read<{ success: true; events: PhotoEvent[] }>(await fetch(
    `${baseUrl}/api/admin/photo-reviews/${reviewId}/decision-events`, {
      credentials: 'include', cache: 'no-store', signal,
    }));
}

export async function decidePhoto(reviewId: number, role: 'qc' | 'moderator', expectedVersion: number,
  pairRevisionId: number, operationId: string, decision: 'APPROVE' | 'REJECT' | 'FORWARD', reason: string | null) {
  return read<{ success: true; reviewId: number; pairRevisionId: number; version: number; stage: PhotoStage }>(await fetch(
    `${baseUrl}/api/admin/photo-reviews/${reviewId}/${role}-decision`, {
      method: 'POST', credentials: 'include', cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expectedVersion, pairRevisionId, operationId, decision, reason }),
    }));
}
