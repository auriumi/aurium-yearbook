"use client";

import { useState } from "react";
import { AlertTriangle, Calendar, CheckCircle, Clock, Loader2 } from "lucide-react";
import QRCode from "react-qr-code";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Booking, BookingSlot, Schedule } from "@/types";
import { useModalState } from "@/hooks/useModalState";
import { formatBookingSlotRange } from "@/lib/utils";

interface BookingWidgetProps {
  bookingList: Schedule[];
  booking?: Booking;
  idNumber: string;
  canBook?: boolean;
  disabledReason?: string;
  onBook: (bookingSlotId: number) => Promise<void> | void;
}

function formatScheduleDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortScheduleDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

function formatTimeRange(slot?: Pick<BookingSlot, "start_time" | "end_time"> | null) {
  if (!slot) return "";
  return formatBookingSlotRange(slot);
}

function getSlotBookedCount(slot: BookingSlot) {
  return slot.booked_count ?? slot.bookings?.length ?? 0;
}

function getBookingSlotLabel(booking: Booking) {
  if (booking.booking_slot) {
    return formatTimeRange(booking.booking_slot);
  }

  return booking.period === "AM"
    ? "Morning Session (8:00 AM - 12:00 PM)"
    : "Afternoon Session (1:00 PM - 5:00 PM)";
}

export function BookingWidget({ bookingList, booking, idNumber, canBook = true, disabledReason, onBook }: BookingWidgetProps) {
  const bookingModal = useModalState();
  const confirmationModal = useModalState();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectSlot = (slot: BookingSlot, date: string) => {
    const booked = getSlotBookedCount(slot);
    const isFull = booked >= slot.capacity || slot.available_count <= 0 || !slot.is_open;
    if (isFull || !canBook) return;

    setSelectedDate(date);
    setSelectedSlot(slot);
  };

  const handleConfirm = async () => {
    if (!selectedSlot || !canBook) return;

    setIsSubmitting(true);
    try {
      await onBook(selectedSlot.id);
      confirmationModal.close();
      bookingModal.close();
    } catch (error) {
      console.error("Booking failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="md:col-span-2 shadow-sm border-stone-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-stone-700">
          <Calendar className="w-5 h-5 text-amber-700" /> Pictorial Schedule
        </CardTitle>
        {!booking && (
          <CardDescription>
            Select an hourly slot for your official yearbook photoshoot.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="min-h-[200px] flex items-center justify-center">
        {booking ? (
          <div className="w-full bg-stone-50 border border-stone-200 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-green-500" />

            <div className="space-y-1 flex-1 w-full text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Badge className="bg-green-600 hover:bg-green-600">CONFIRMED</Badge>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Pictorial Pass</p>
              </div>
              <h3 className="text-2xl font-bold text-stone-800 mt-2">
                {formatShortScheduleDate(booking.booking_day.date)}
              </h3>
              <p className="text-stone-600 font-medium flex items-center justify-center md:justify-start gap-2">
                <Clock className="w-4 h-4 text-amber-700" />
                {getBookingSlotLabel(booking)}
              </p>
              <p className="text-xs text-stone-400 italic mt-2 mb-4 md:mb-0">Present this QR to the attendance officer.</p>
            </div>

            <div className="flex flex-col items-center gap-2 bg-white p-4 rounded-lg border border-stone-200 shadow-sm shrink-0">
              <div style={{ height: "auto", margin: "0 auto", maxWidth: 100, width: "100%" }}>
                <QRCode
                  size={256}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  value={String(idNumber)}
                  viewBox="0 0 256 256"
                />
              </div>
              <span className="text-[10px] font-mono text-stone-500 tracking-widest">{idNumber}</span>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4 py-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${canBook ? "bg-amber-50" : "bg-red-50"}`}>
              {canBook ? (
                <Calendar className="w-8 h-8 text-amber-600" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-red-600" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-stone-700">
                {canBook ? "No Schedule Selected" : "Profile Photo Required"}
              </h3>
              <p className="text-sm text-stone-500 max-w-xs mx-auto">
                {canBook
                  ? "Slots are filling up fast. Book now to secure your spot."
                  : disabledReason || "Upload your profile picture before booking your pictorial schedule."}
              </p>
            </div>

            <Button
              className="bg-amber-900 hover:bg-amber-800 disabled:bg-stone-300 disabled:text-stone-500 disabled:shadow-none"
              onClick={bookingModal.open}
              disabled={!canBook}
            >
              {canBook ? "Book a Slot Now" : "Booking Locked"}
            </Button>
          </div>
        )}

        <Dialog open={bookingModal.isOpen} onOpenChange={bookingModal.setIsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{booking ? "Change Schedule" : "Select Pictorial Schedule"}</DialogTitle>
              <DialogDescription>Choose an available hour. Each hour has its own capacity limit.</DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {bookingList.map((day) => {
                const daySlots = (day.slots ?? []).filter((slot) => slot.capacity > 0);

                return (
                  <div key={day.id} className="border rounded-lg p-4 space-y-3 bg-stone-50/50">
                    <h4 className="font-bold text-stone-700">
                      {formatScheduleDate(day.date)}
                    </h4>

                    {daySlots.length === 0 ? (
                      <div className="text-sm text-stone-400 italic border border-dashed border-stone-200 rounded-lg p-4 bg-white">
                        No hourly slots are available for this date.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {daySlots.map((slot) => {
                          const booked = getSlotBookedCount(slot);
                          const available = Math.max(slot.capacity - booked, 0);
                          const isFull = available <= 0 || !slot.is_open;
                          const isSelected = selectedSlot?.id === slot.id;
                          const takenPercent = slot.capacity > 0 ? Math.min((booked / slot.capacity) * 100, 100) : 0;

                          return (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => handleSelectSlot(slot, day.date)}
                              disabled={isFull || !canBook}
                              className={`relative border rounded-lg p-3 text-left transition-all ${
                                isSelected
                                  ? "ring-2 ring-amber-600 border-amber-600 bg-amber-50"
                                  : "hover:border-amber-300 bg-white"
                              } ${(isFull || !canBook) ? "opacity-50 cursor-not-allowed bg-stone-100" : ""}`}
                            >
                              <div className="flex justify-between items-start gap-2 mb-2">
                                <div>
                                  <span className="font-bold text-sm text-stone-700">{formatTimeRange(slot)}</span>
                                  <span className="block text-[11px] text-stone-500">{available} slot{available === 1 ? "" : "s"} left</span>
                                </div>
                                {isSelected && <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />}
                              </div>
                              <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                                <div className={`h-full ${isFull ? "bg-red-500" : "bg-amber-500"}`} style={{ width: `${takenPercent}%` }} />
                              </div>
                              <span className="text-[10px] text-stone-500 mt-1 block">{booked}/{slot.capacity} Taken</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <DialogFooter className="flex-col sm:justify-between gap-2 border-t pt-4">
              <div className="text-xs text-stone-500 text-center sm:text-left">
                {selectedSlot && selectedDate ? (
                  <span>
                    Selected: <strong>{formatScheduleDate(selectedDate)} ({formatTimeRange(selectedSlot)})</strong>
                  </span>
                ) : "Please select an hourly slot"}
              </div>
              <Button onClick={confirmationModal.open} disabled={!selectedSlot || !canBook} className="bg-amber-900 w-full sm:w-auto">
                {booking ? "Confirm New Schedule" : "Submit Schedule"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={confirmationModal.isOpen} onOpenChange={confirmationModal.setIsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="w-5 h-5" /> Final Confirmation</DialogTitle>
              <DialogDescription className="pt-2">
                {booking ? "You are about to re-book and override your previous schedule with:" : "You are about to book:"}
                <span className="font-bold text-stone-800 block mt-1 text-lg">
                  {selectedDate ? formatScheduleDate(selectedDate) : ""} {selectedSlot ? `- ${formatTimeRange(selectedSlot)}` : ""}
                </span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={confirmationModal.close} disabled={isSubmitting}>Cancel</Button>
              <Button onClick={handleConfirm} disabled={isSubmitting || !canBook} className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2">
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? "Booking..." : "Yes, Finalize"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
