export const STUDENT_STATUS_STEPS = [
  { id: 1, label: "REGISTERED", displayLabel: "Registered", color: "bg-stone-500", visible: true, flowOrder: 1 },
  { id: 5, label: "FULLY_VERIFIED", displayLabel: "Verified", color: "bg-green-700", visible: true, flowOrder: 2 },
  { id: 3, label: "BOOKED", displayLabel: "Booked", color: "bg-orange-500", visible: true, flowOrder: 3 },
  { id: 4, label: "ATTENDED", displayLabel: "Attended", color: "bg-green-600", visible: true, flowOrder: 4 },
  { id: 2, label: "APPROVED", displayLabel: "Approved (Deprecated)", color: "bg-blue-500", visible: false, flowOrder: 0 },
] as const;

export const ACTIVE_STUDENT_STATUS_STEPS = STUDENT_STATUS_STEPS.filter((step) => step.visible);

export function getStudentStatusStep(status?: string | null) {
  return STUDENT_STATUS_STEPS.find((step) => step.label === status);
}

export function getStudentStatusLabel(status?: string | null) {
  return getStudentStatusStep(status)?.displayLabel ?? "Unknown";
}

export function getStudentStatusFlowOrder(status?: string | null) {
  const flowOrder = getStudentStatusStep(status)?.flowOrder;
  return flowOrder && flowOrder > 0 ? flowOrder : 1;
}
