const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL || '';

export type CorrectionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type CorrectionSummary = { id: number; status: CorrectionStatus; reason: string;
  created_at: string; decided_at: string | null; decision_note: string | null;
  reopened_version: number | null };
export type CorrectionRow = { id: number; reviewId: number; trackType: 'INFORMATION' | 'PHOTOS';
  lockedVersion: number; currentVersion: number; stage: string; reason: string;
  status: CorrectionStatus; createdAt: string; decidedAt: string | null;
  decisionNote: string | null; requestedBy: { first_name: string | null; last_name: string | null };
  requestedByCurrentUser: boolean;
  graduate: { studentNumber: number; firstName: string | null; lastName: string | null;
    department: string | null; program: string | null; graduationYear: number; graduationTerm: string } };

async function read<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success !== true) {
    throw new Error(typeof payload?.reason === 'string' ? payload.reason : 'Unable to reach the correction service.');
  }
  return payload as T;
}

export async function requestCorrection(reviewId: number, expectedVersion: number, reason: string, operationId: string) {
  return read<{ success: true; correctionId: number; status: CorrectionStatus }>(await fetch(
    `${baseUrl}/api/v1/admin/review-tracks/${reviewId}/correction-requests`, {
      method: 'POST', credentials: 'include', cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expectedVersion, reason, operationId }),
    }));
}

export async function getCorrections(status: CorrectionStatus | 'ALL', page: number, signal?: AbortSignal) {
  const query = new URLSearchParams({ status, page: String(page) });
  return read<{ success: true; rows: CorrectionRow[]; total: number; pageSize: number }>(await fetch(
    `${baseUrl}/api/v1/admin/correction-requests?${query}`, {
      credentials: 'include', cache: 'no-store', signal,
    }));
}

export async function decideCorrection(id: number, expectedVersion: number,
  decision: 'APPROVE' | 'REJECT', reason: string | null, operationId: string) {
  return read<{ success: true; status: CorrectionStatus; version: number }>(await fetch(
    `${baseUrl}/api/v1/admin/correction-requests/${id}/decisions`, {
      method: 'POST', credentials: 'include', cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expectedVersion, decision, reason, operationId }),
    }));
}
