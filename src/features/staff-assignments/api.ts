import type { ReviewAssignment } from '@/features/rac-verification/api';

const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL || '';
export const designationLabels: Record<string, string> = {
  INFORMATION_PROOFREADER: 'General Proofreader', INFORMATION_QC: 'Information QC',
  PHOTO_UPLOADER: 'Photo Uploader', PHOTO_QC: 'Photo QC', FINAL_MODERATOR: 'Final Moderator',
  IT_CORRECTION: 'IT Corrections', RAC_CHECK: 'Retired RAC designation',
};
export interface StaffMember {
  id: number; first_name: string | null; last_name: string | null; email: string | null;
  role: string; reviewAssignments: ReviewAssignment[];
}
export interface StaffList {
  success: true; staff: StaffMember[]; total: number; page: number; pageSize: number;
  assignableCapabilities: string[];
}
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${baseUrl}/api/v1/admin/${path}`, { credentials: 'include', cache: 'no-store', ...init });
  const body = await response.json().catch(() => null);
  if (response.status === 429) {
    const seconds = Number(response.headers.get('Retry-After'));
    throw new Error(Number.isFinite(seconds) && seconds > 0
      ? `Too many requests. Try again in ${Math.ceil(seconds)} seconds.`
      : 'Too many requests. Please wait a moment before trying again.');
  }
  if (!response.ok || body?.success !== true) throw new Error(body?.reason || 'Unable to complete the staff assignment request.');
  return body as T;
}
export function getStaff(search: string, page: number, signal: AbortSignal) {
  return request<StaffList>(`review-staff?${new URLSearchParams({ search, page: String(page) })}`, { signal });
}
export function grantDesignation(adminId: number, capability: string, scope: { department: string | null; course: string | null; major: string | null }) {
  return request('review-assignments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ adminId, capability, scope }) });
}
export function revokeDesignation(id: number) {
  return request(`review-assignments/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: false }) });
}
