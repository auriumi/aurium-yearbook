export const STUDENT_STATUS_STEPS = [
  { id: 1, label: "REGISTERED", displayLabel: "Registered", color: "bg-stone-500", visible: true },
  { id: 2, label: "APPROVED", displayLabel: "Verified", color: "bg-blue-500", visible: true },
  { id: 3, label: "BOOKED", displayLabel: "Booked", color: "bg-orange-500", visible: true },
  { id: 4, label: "ATTENDED", displayLabel: "Attended", color: "bg-green-600", visible: true },
  { id: 5, label: "FULLY_VERIFIED", displayLabel: "Fully Verified", color: "bg-green-700", visible: false },
] as const;

export const ACTIVE_STUDENT_STATUS_STEPS = STUDENT_STATUS_STEPS.filter((step) => step.visible);

export function getStudentStatusStep(status?: string | null) {
  return STUDENT_STATUS_STEPS.find((step) => step.label === status);
}

export function getStudentStatusLabel(status?: string | null) {
  return getStudentStatusStep(status)?.displayLabel ?? "Unknown";
}
