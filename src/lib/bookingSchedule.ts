export type BookingPeriod = "AM" | "PM";

export type BookingWindow = {
  id: string;
  range: string;
  shortLabel: string;
};

type BookingLike = {
  id?: number;
  period: string;
  created_at?: string | Date;
};

export const SESSION_WINDOWS: Record<BookingPeriod, BookingWindow[]> = {
  AM: [
    { id: "AM-08", range: "8:00 AM - 9:00 AM", shortLabel: "8 AM" },
    { id: "AM-09", range: "9:00 AM - 10:00 AM", shortLabel: "9 AM" },
    { id: "AM-10", range: "10:00 AM - 11:00 AM", shortLabel: "10 AM" },
    { id: "AM-11", range: "11:00 AM - 12:00 PM", shortLabel: "11 AM" },
  ],
  PM: [
    { id: "PM-01", range: "1:00 PM - 2:00 PM", shortLabel: "1 PM" },
    { id: "PM-02", range: "2:00 PM - 3:00 PM", shortLabel: "2 PM" },
    { id: "PM-03", range: "3:00 PM - 4:00 PM", shortLabel: "3 PM" },
    { id: "PM-04", range: "4:00 PM - 5:00 PM", shortLabel: "4 PM" },
  ],
};

export function getSessionLabel(period: BookingPeriod) {
  return period === "AM" ? "Morning Session" : "Afternoon Session";
}

export function distributeCapacity(totalCapacity: number, parts = 4) {
  const safeCapacity = Math.max(0, Math.trunc(totalCapacity || 0));
  const base = Math.floor(safeCapacity / parts);
  const remainder = safeCapacity % parts;

  return Array.from({ length: parts }, (_, index) => base + (index < remainder ? 1 : 0));
}

function sortBookings<T extends BookingLike>(bookings: T[]) {
  return [...bookings].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;

    if (aTime !== bTime) return aTime - bTime;
    return (a.id ?? 0) - (b.id ?? 0);
  });
}

export function getHourlyAvailability(period: BookingPeriod, capacity: number, bookedCount: number) {
  const capacities = distributeCapacity(capacity, SESSION_WINDOWS[period].length);
  let remainingBooked = Math.max(0, bookedCount);

  return SESSION_WINDOWS[period]
    .map((window, index) => {
      const hourCapacity = capacities[index] ?? 0;
      const booked = Math.min(hourCapacity, remainingBooked);
      remainingBooked -= booked;

      return {
        ...window,
        period,
        capacity: hourCapacity,
        booked,
        isFull: hourCapacity > 0 && booked >= hourCapacity,
      };
    })
    .filter((window) => window.capacity > 0);
}

export function getHourlyRoster<T extends BookingLike>(period: BookingPeriod, capacity: number, bookings: T[]) {
  const periodBookings = sortBookings(bookings.filter((booking) => booking.period === period));
  const capacities = distributeCapacity(capacity, SESSION_WINDOWS[period].length);
  let cursor = 0;

  return SESSION_WINDOWS[period]
    .map((window, index) => {
      const hourCapacity = capacities[index] ?? 0;
      const isLastWindow = index === SESSION_WINDOWS[period].length - 1;
      const end = isLastWindow ? Math.max(cursor + hourCapacity, periodBookings.length) : cursor + hourCapacity;
      const students = periodBookings.slice(cursor, end);
      cursor = end;

      return {
        ...window,
        period,
        capacity: hourCapacity,
        students,
      };
    })
    .filter((window) => window.capacity > 0 || window.students.length > 0);
}

export function findBookingHour<T extends BookingLike>(
  period: BookingPeriod,
  capacity: number,
  bookings: T[],
  bookingId: number
) {
  return getHourlyRoster(period, capacity, bookings).find((window) =>
    window.students.some((booking) => booking.id === bookingId)
  );
}
