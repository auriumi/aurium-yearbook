import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type TimeRange = {
  start_time: string
  end_time: string
}

export function formatClockTime(time: string) {
  const [hourValue, minuteValue = "00"] = time.split(":")
  const hour = Number(hourValue)

  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    return time
  }

  const minute = minuteValue.padStart(2, "0").slice(0, 2)
  const period = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 || 12

  return `${displayHour}:${minute} ${period}`
}

export function formatBookingSlotRange(slot: TimeRange) {
  return `${formatClockTime(slot.start_time)} - ${formatClockTime(slot.end_time)}`
}
