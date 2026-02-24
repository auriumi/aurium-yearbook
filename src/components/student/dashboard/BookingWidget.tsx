"use client";

import { useState } from "react";
import { Calendar, CheckCircle, AlertTriangle } from "lucide-react"; // Removed QrCode icon
import QRCode from "react-qr-code"; // Import the real generator
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Booking, Schedule } from "@/types";

interface BookingWidgetProps {
  bookingList: Schedule[], 
  booking?: Booking,
  idNumber: string;
  onBook: (booking_id: number, period: string) => void;
};

export function BookingWidget({ bookingList, booking, idNumber, onBook }: BookingWidgetProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSession, setSelectedSession] = useState<"AM" | "PM" | "">("");

  const handleSelectSlot = (booking_id: number, date: string, session: "AM" | "PM", isFull: boolean) => {
    if (isFull) return;
    setSelectedBookingId(booking_id);
    setSelectedDate(date);
    setSelectedSession(session);
  };

  const handleConfirm = () => {
    if (selectedDate && selectedSession) {
        onBook(selectedBookingId, selectedSession);
        setIsConfirmDialogOpen(false);
        setIsBookingModalOpen(false);
    }
  };

  return (
    <Card className="md:col-span-2 shadow-sm border-stone-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-stone-700">
          <Calendar className="w-5 h-5 text-amber-700" /> Pictorial Schedule
        </CardTitle>
        <CardDescription className={booking ? "collapse" : "visible"}>
          Select a date for your official yearbook photoshoot.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[200px] flex items-center justify-center">
        {booking ? (
          // --- CONFIRMED TICKET VIEW (UPDATED) ---
          <div className="w-full bg-stone-50 border border-stone-200 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-green-500"></div>
            
            {/* Ticket Details */}
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-600 hover:bg-green-600">CONFIRMED</Badge>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Pictorial Pass</p>
              </div>
              <h3 className="text-2xl font-bold text-stone-800 mt-2">
                {new Date(booking.booking_day.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', weekday: 'long' })}
              </h3>
              <p className="text-stone-600 font-medium">
                {booking.period === 'AM' ? '☀️ Morning Session (8AM - 12PM)' : '🌙 Afternoon Session (1PM - 5PM)'}
              </p>
              <p className="text-xs text-stone-400 italic mt-2">Present this QR to the attendance officer.</p>
            </div>

            {/* REAL QR CODE SECTION */}
            <div className="flex flex-col items-center gap-2 bg-white p-4 rounded-lg border border-stone-200 shadow-sm">
              {/* This generates a unique QR for this specific ID number */}
              <div style={{ height: "auto", margin: "0 auto", maxWidth: 100, width: "100%" }}>
                <QRCode
                  size={256}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  value={String(idNumber)}
                  viewBox={`0 0 256 256`}
                />
              </div>
              <span className="text-[10px] font-mono text-stone-500 tracking-widest">{idNumber}</span>
            </div>
          </div>
        ) : (
          // ... (BOOKING UI remains exactly the same as before) ...
          <div className="text-center space-y-4 py-6">
             <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-amber-600" />
             </div>
             <div>
                 <h3 className="font-bold text-stone-700">No Schedule Selected</h3>
                 <p className="text-sm text-stone-500 max-w-xs mx-auto">Slots are filling up fast. Book now to secure your spot.</p>
             </div>
             
             <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-amber-900 hover:bg-amber-800">Book a Slot Now</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Select Pictorial Schedule</DialogTitle>
                        <DialogDescription>Choose a session. Capacity is limited.</DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {bookingList.map((slot, idx) => (
                            <div key={idx} className="border rounded-lg p-4 space-y-3 bg-stone-50/50">
                                <h4 className="font-bold text-stone-700">
                                  {new Date(slot.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {['AM', 'PM'].map((sessionType) => {
                                        const isAM = sessionType === 'AM';

                                        const booked = isAM ? slot.curr_morning : slot.curr_afternoon;
                                        const capacity = isAM ? slot.max_morning_cap : slot.max_afternoon_cap;
                                        const isFull = booked >= capacity;
                                        
                                        return (
                                            <button 
                                                key={sessionType}
                                                onClick={() => handleSelectSlot(
                                                  slot.id,
                                                  slot.date, 
                                                  sessionType as "AM"|"PM",
                                                  isFull
                                                )}
                                                disabled={isFull}
                                                className={`relative border rounded-lg p-3 text-left transition-all ${selectedDate === slot.date && selectedSession === sessionType ? 'ring-2 ring-amber-600 border-amber-600 bg-amber-50' : 'hover:border-amber-300 bg-white'} ${isFull ? 'opacity-50 cursor-not-allowed bg-stone-100' : ''}`}
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-bold text-sm text-stone-700">{isAM ? 'Morning (AM)' : 'Afternoon (PM)'}</span>
                                                    {selectedDate === slot.date && selectedSession === sessionType && <CheckCircle className="w-4 h-4 text-amber-600"/>}
                                                </div>
                                                <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                                                    <div className={`h-full ${isFull ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${(booked / capacity) * 100}%` }} />
                                                </div>
                                                <span className="text-[10px] text-stone-500 mt-1 block">{booked}/{capacity} Taken</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    <DialogFooter className="flex-col sm:justify-between gap-2 border-t pt-4">
                        <div className="text-xs text-stone-500 text-center sm:text-left">
                            {selectedDate ? <span>Selected: <strong>{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} ({selectedSession})</strong></span> : "Please select a slot"}
                        </div>
                        <Button onClick={() => setIsConfirmDialogOpen(true)} disabled={!selectedDate || !selectedSession} className="bg-amber-900 w-full sm:w-auto">Submit Schedule</Button>
                    </DialogFooter>
                </DialogContent>
             </Dialog>

             <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="w-5 h-5" /> Final Confirmation</DialogTitle>
                        <DialogDescription className="pt-2">
                          You are about to book: <br/>
                            <span className="font-bold text-stone-800 block mt-1 text-lg">
                              {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} • {selectedSession}
                            </span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleConfirm} className="bg-red-600 hover:bg-red-700 text-white">Yes, Finalize</Button>
                    </DialogFooter>
                </DialogContent>
             </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}