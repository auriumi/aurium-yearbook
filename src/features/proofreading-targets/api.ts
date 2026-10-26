import type { GraduationTerm } from '@/features/graduate-information/api';

export const targetRoles = {
  INFORMATION_PROOFREADER: 'General Proofreader', INFORMATION_QC: 'Information QC',
  PHOTO_UPLOADER: 'Photo Uploader', PHOTO_QC: 'Photo QC', FINAL_MODERATOR: 'Moderator',
} as const;
export type TargetRole = keyof typeof targetRoles;
export type Cycle = { year: number; term: GraduationTerm; role?: TargetRole };
export const workDescription = (role: TargetRole) => role === 'FINAL_MODERATOR'
  ? 'First final decisions on information and photo reviews. Each review counts separately, whether approved or rejected.'
  : role === 'INFORMATION_QC' || role === 'PHOTO_QC'
    ? 'First QC decisions, whether approved or rejected. Repeat decisions on the same review do not count again.'
    : 'First submissions to QC. Resubmissions do not count again.';
export type Progress = { staffId: number; targetId: number | null; version: number | null; date: string;
  startDate: string | null; target: number | null; carriedBacklog: number; submitted: number; remaining: number };
export type TargetStaff = Progress & { id: number; firstName: string | null; lastName: string | null; active: boolean;
  assignments: { department: string | null; course: string | null; major: string | null }[] };
export type TargetList = { success: true; today: string; date: string; staff: TargetStaff[]; total: number; page: number; pageSize: number };
export type TargetEntry = { staffId: number; date: string; count: number | null; expectedVersion: number | null };
export type TargetChange = { id: number; previous_count: number | null; new_count: number; reason: string; changed_at: string;
  actor: { first_name: string | null; last_name: string | null } };
export type History = { success: true; changes: TargetChange[]; total: number; page: number; pageSize: number };
const base = `${process.env.NEXT_PUBLIC_LOCAL_URL || ''}/api/v1/admin/targets`;
export function manilaToday() { return new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10); }
const query = (cycle: Cycle) => new URLSearchParams({ year: String(cycle.year), term: cycle.term, role: cycle.role ?? 'INFORMATION_PROOFREADER' });
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${base}${path}`, { credentials: 'include', cache: 'no-store', ...init });
  const data = await response.json().catch(() => null);
  if (!response.ok || data?.success !== true) throw new Error(data?.reason || 'Unable to load or save daily targets. Please try again.');
  return data as T;
}
export function getMyProgress(cycle: Cycle, signal: AbortSignal) {
  return request<{ success: true; today: string; progress: Progress }>(`/me?${query(cycle)}`, { signal });
}
export function getTargets(cycle: Cycle, date: string, page: number, search: string, department: string, signal: AbortSignal) {
  const params = query(cycle);
  for (const [k, v] of Object.entries({ date, page: String(page), search, department })) params.set(k, v);
  return request<TargetList>(`?${params}`, { signal });
}
export function getTargetSchedule(cycle: Cycle, staffIds: number[], dates: string[], signal: AbortSignal) {
  const params = query(cycle); params.set('staffIds', staffIds.join(',')); params.set('dates', dates.join(','));
  return request<{ success: true; entries: TargetEntry[] }>(`/schedule?${params}`, { signal });
}
export function saveTargets(cycle: Cycle, entries: TargetEntry[], reason: string, operationId: string) {
  return request<{ success: true }>(``, { method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...cycle, entries, reason, operationId }) });
}
export function getTargetHistory(targetId: number, page: number, signal: AbortSignal) {
  return request<History>(`/${targetId}/history?page=${page}`, { signal });
}
