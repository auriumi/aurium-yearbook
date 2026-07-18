"use client";

import { useState } from "react";
import { AlertTriangle, Calendar, CheckCircle, Clock, Loader2 } from "lucide-react";
import QRCode from "react-qr-code";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Booking, Schedule } from "@/types";
import { useModalState } from "@/hooks/useModalState";
import {
  findBookingHour,
  getHourlyAvailability,
  getSessionLabel,
  type BookingPeriod,
} from "@/lib/bookingSchedule";

interface BookingWidgetProps {
  bookingList: Schedule[];
  booking?: Booking;
  idNumber: string;
  onBook: (booking_id: number, period: string) => Promise<void> | void;
}

export function BookingWidget({ bookingList, booking, idNumber, onBook }: BookingWidgetProps) {
  const bookingModal = useModalState();
  const confirmationModal = useModalState();
  const [selectedBookingId, setSelectedBookingId] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSession, setSelectedSession] = useState<BookingPeriod | "">("");
  const [selectedHourId, setSelectedHourId] = useState("");
  const [selectedHourRange, setSelectedHourRange] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectSlot = (
    bookingId: number,
    date: string,
    session: BookingPeriod,
    hourId: string,
    hourRange: string,
    isFull: boolean
  ) => {
    if (isFull) return;
    setSelectedBookingId(bookingId);
    setSelectedDate(date);
    setSelectedSession(session);
    setSelectedHourId(hourId);
    setSelectedHourRange(hourRange);
  };

  const handleConfirm = async () => {
    if (!selectedDate || !selectedSession) return;

    setIsSubmitting(true);
    try {
      await onBook(selectedBookingId, selectedSession);
      confirmationModal.close();
      bookingModal.close();
    } catch (error) {
      console.error("Booking failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const bookingPeriod = booking?.period as BookingPeriod | undefined;
  const bookingCapacity = booking && bookingPeriod
    ? bookingPeriod === "AM"
      ? booking.booking_day.max_morning_cap ?? 0
      : booking.booking_day.max_afternoon_cap ?? 0
    : 0;
  const inferredBookingHour = booking && bookingPeriod
    ? findBookingHour(bookingPeriod, bookingCapacity, booking.booking_day.bookings ?? [], booking.id)
    : null;
  const confirmedSessionText = bookingPeriod
    ? `${getSessionLabel(bookingPeriod)}${inferredBookingHour ? `, ${inferredBookingHour.range}` : ""}`
    : "";

  return (
    <Card className="md:col-span-2 shadow-sm border-stone-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-stone-700">
          <Calendar className="w-5 h-5 text-amber-700" /> Pictorial Schedule
        </CardTitle>
        {!booking && (
          <CardDescription>Select a date and hour window for your official yearbook photoshoot.</CardDescription>
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
                {new Date(booking.booking_day.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}
              </h3>
              <p className="text-stone-600 font-medium">
                {confirmedSessionText || (booking.period === "AM" ? "Morning Session" : "Afternoon Session")}
              </p>
              {inferredBookingHour && (
                <p className="text-xs text-amber-700 font-semibold inline-flex items-center justify-center md:justify-start gap-1">
                  <Clock className="h-3 w-3" /> Hour assignment is based on booking order.
                </p>
              )}
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
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-stone-700">No Schedule Selected</h3>
              <p className="text-sm text-stone-500 max-w-xs mx-auto">Slots are filling up fast. Book now to secure your spot.</p>
            </div>

            <Button className="bg-amber-900 hover:bg-amber-800" onClick={bookingModal.open}>Book a Slot Now</Button>
          </div>
        )}

        <Dialog open={bookingModal.isOpen} onOpenChange={bookingModal.setIsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{booking ? "Change Schedule" : "Select Pictorial Schedule"}</DialogTitle>
              <DialogDescription>Choose an available hour. Capacity is still managed by AM/PM session.</DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {bookingList.map((slot) => (
                <div key={slot.id} className="border rounded-lg p-4 space-y-3 bg-stone-50/50">
                  <h4 className="font-bold text-stone-700">
                    {new Date(slot.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </h4>

                  <div className="grid grid-cols-1 gap-4">
                    {(["AM", "PM"] as BookingPeriod[]).map((sessionType) => {
                      const isAM = sessionType === "AM";
                      const booked = isAM ? slot.curr_morning : slot.curr_afternoon;
                      const capacity = isAM ? slot.max_morning_cap : slot.max_afternoon_cap;
                      const hours = getHourlyAvailability(sessionType, capacity, booked);

                      if (capacity <= 0) {
                        return (
                          <div key={sessionType} className="rounded-lg border border-dashed border-stone-200 bg-white p-3 text-xs text-stone-400">
                            {getSessionLabel(sessionType)} is not open.
                          </div>
                        );
                      }

                      return (
                        <div key={sessionType} className="rounded-lg border border-stone-200 bg-white p-3 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-sm text-stone-700">{getSessionLabel(sessionType)} ({sessionType})</span>
                            <span className={`text-xs font-semibold ${booked >= capacity ? "text-red-600" : "text-stone-500"}`}>
                              {booked}/{capacity} Taken
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {hours.map((hour) => {
                              const isSelected = selectedDate === slot.date && selectedSession === sessionType && selectedHourId === hour.id;

                              return (
                                <button
                                  key={hour.id}
                                  onClick={() => handleSelectSlot(slot.id, slot.date, sessionType, hour.id, hour.range, hour.isFull)}
                                  disabled={hour.isFull}
                                  className={`relative border rounded-lg p-3 text-left transition-all ${
                                    isSelected
                                      ? "ring-2 ring-amber-600 border-amber-600 bg-amber-50"
                                      : "hover:border-amber-300 bg-stone-50/70"
                                  } ${hour.isFull ? "opacity-50 cursor-not-allowed bg-stone-100" : ""}`}
                                >
                                  <div className="flex justify-between items-center mb-2 gap-2">
                                    <span className="font-bold text-xs text-stone-700">{hour.range}</span>
                                    {isSelected && <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />}
                                  </div>
                                  <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full ${hour.isFull ? "bg-red-500" : "bg-amber-500"}`}
                                      style={{ width: `${(hour.booked / hour.capacity) * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] text-stone-500 mt-1 block">{hour.booked}/{hour.capacity} Assigned</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter className="flex-col sm:justify-between gap-2 border-t pt-4">
              <div className="text-xs text-stone-500 text-center sm:text-left">
                {selectedDate ? (
                  <span>
                    Selected:{" "}
                    <strong>
                      {new Date(selectedDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      ({selectedSession}) {selectedHourRange && `- ${selectedHourRange}`}
                    </strong>
                  </span>
                ) : "Please select a slot"}
              </div>
              <Button onClick={confirmationModal.open} disabled={!selectedDate || !selectedSession} className="bg-amber-900 w-full sm:w-auto">
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
                <br />
                <span className="font-bold text-stone-800 block mt-1 text-lg">
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  - {selectedSession}
                  {selectedHourRange && <span className="block text-base text-stone-600">{selectedHourRange}</span>}
                </span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={confirmationModal.close} disabled={isSubmitting}>Cancel</Button>
              <Button onClick={handleConfirm} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2">
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
