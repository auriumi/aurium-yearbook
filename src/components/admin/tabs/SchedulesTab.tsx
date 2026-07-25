"use client";

import { Plus, Edit3, Calendar, Users, CheckCircle2, Clock, Loader2, Lock, Unlock, LayoutGrid, List, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useMemo, useState } from "react";
import { BookingSlot, Schedule } from "@/types";
import * as adminService from "@/app/admin/adminService"
import toast from "react-hot-toast";
import { formatBookingSlotRange } from "@/lib/utils";

interface ScheduleProp {
    schedules: Schedule[];
    fetchSchedules: () => Promise<void>;
    userRole: string;
}

type RosterBooking = {
  id: number;
  student_number: number;
  booking_slot_id?: number | null;
  period: "AM" | "PM";
  student?: {
    first_name?: string;
    last_name?: string;
    student_number?: number;
    studentAuth?: {
      status?: string;
    };
  };
};

type OverrideSlotOption = {
  day: Schedule;
  slot: BookingSlot;
  booked: number;
  available: number;
  isCurrent: boolean;
  isFull: boolean;
};

function isPastDate(dateString: string) {
  const scheduleDate = new Date(dateString);
  scheduleDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return scheduleDate < today;
}

function byDateDescending(a: Schedule, b: Schedule) {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

function getScheduleSlots(day: Schedule, period: "AM" | "PM") {
  return (day.slots ?? [])
    .filter((slot) => slot.period === period)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
}

function getSlotBookedCount(slot: BookingSlot) {
  return slot.booked_count ?? slot.bookings?.length ?? 0;
}

function getPeriodCapacity(day: Schedule, period: "AM" | "PM") {
  const slots = getScheduleSlots(day, period);
  if (slots.length > 0) {
    return slots.reduce((total, slot) => total + slot.capacity, 0);
  }

  return period === "AM" ? day.max_morning_cap : day.max_afternoon_cap;
}

function getPeriodRoster(day: Schedule, period: "AM" | "PM") {
  const slotBookings = getScheduleSlots(day, period).flatMap((slot) => slot.bookings ?? []);
  if (slotBookings.length > 0) return slotBookings;

  return day.bookings.filter((booking) => booking.period === period);
}

function formatSlotRange(slot: BookingSlot) {
  return formatBookingSlotRange(slot);
}

function formatScheduleDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getRosterStudentName(booking: RosterBooking | null) {
  const firstName = booking?.student?.first_name ?? "";
  const lastName = booking?.student?.last_name ?? "";
  return `${firstName} ${lastName}`.trim() || "Selected student";
}

function getRosterStudentNumber(booking: RosterBooking | null) {
  return booking?.student_number ?? booking?.student?.student_number ?? null;
}

function getRosterStatus(booking: RosterBooking) {
  return booking.student?.studentAuth?.status ?? "";
}

export function SchedulesTab({ schedules, fetchSchedules, userRole }: ScheduleProp) {
  const canCreateSchedule = userRole === 'ADMINISTRATOR';
  const canOverrideBookings = userRole === 'ADMINISTRATOR' || userRole === 'MODERATOR';

  // Input states
  const [newDateInput, setNewDateInput] = useState("");
  const [sessionType, setSessionType] = useState("both"); // options: both, am, pm
  const [newAmCapacity, setNewAmCapacity] = useState(50);
  const [newPmCapacity, setNewPmCapacity] = useState(50);
  const [isAddDateOpen, setIsAddDateOpen] = useState(false);

  // Capacity override states
  const [isEditCapacityOpen, setIsEditCapacityOpen] = useState(false);
  const [editingCapacity, setEditingCapacity] = useState<{date: string, session: 'AM'|'PM', value: number, limit: number, id: number } | null>(null);

  // Roster view states
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [activeRoster, setActiveRoster] = useState<{date: string, session: 'morning' | 'afternoon', students: RosterBooking[]} | null>(null);

  // Moderator booking override states
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [isOverrideConfirmOpen, setIsOverrideConfirmOpen] = useState(false);
  const [overrideTarget, setOverrideTarget] = useState<RosterBooking | null>(null);
  const [selectedOverrideSlotId, setSelectedOverrideSlotId] = useState<number | null>(null);

  // Toggles between the upcoming schedule list and the read-only history view
  const [showHistory, setShowHistory] = useState(false);

  // Toggles between the detailed card layout and a compact list/table layout
  const [isCompactView, setIsCompactView] = useState(false);

  // Schedule management states
  const [isCloseDateOpen, setIsCloseDateOpen] = useState(false);
  const [dateToClose, setDateToClose] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  
  // Added state to determine if the admin is trying to Open or Close the schedule dynamically
  const [isClosingAction, setIsClosingAction] = useState(true);

  // Global loading state for network requests
  const [isProcessing, setIsProcessing] = useState(false);

    const hasInvalidCapacity =
        !editingCapacity ||
        !Number.isFinite(editingCapacity.value) ||
        editingCapacity.value < editingCapacity.limit;

  // Formats a raw date string into "Month DD" (e.g., "March 03")
  const formatModalDate = (dateString: string | undefined) => {
      if (!dateString) return "";
      return new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: '2-digit' });
  };

  // Today's date as "YYYY-MM-DD", used to stop the date picker from offering past dates
  const todayInputValue = (() => {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${now.getFullYear()}-${month}-${day}`;
  })();

  // Past dates are hidden from the main list entirely, so they can never be re-opened from here.
  // They remain viewable (read-only) through the History toggle.
  const { upcomingSchedules, pastSchedules } = useMemo(() => {
      const upcoming: Schedule[] = [];
      const past: Schedule[] = [];

      schedules.forEach((day) => {
          (isPastDate(day.date) ? past : upcoming).push(day);
      });

      upcoming.sort(byDateDescending);
      past.sort(byDateDescending);

      return { upcomingSchedules: upcoming, pastSchedules: past };
  }, [schedules]);

  const displayedSchedules = showHistory ? pastSchedules : upcomingSchedules;
  const overrideSlotGroups = useMemo(() => {
      const currentSlotId = overrideTarget?.booking_slot_id ?? null;

      return [...schedules]
          .filter((day) => day.is_open && !isPastDate(day.date))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map((day) => {
              const slots = [...(day.slots ?? [])]
                  .filter((slot) => slot.capacity > 0)
                  .sort((a, b) => a.start_time.localeCompare(b.start_time))
                  .map((slot): OverrideSlotOption => {
                      const booked = getSlotBookedCount(slot);
                      const available = Math.max(slot.capacity - booked, 0);
                      const isCurrent = currentSlotId === slot.id;
                      return {
                          day,
                          slot,
                          booked,
                          available,
                          isCurrent,
                          isFull: available <= 0 || !slot.is_open,
                      };
                  });

              return { day, slots };
          })
          .filter((group) => group.slots.length > 0);
  }, [schedules, overrideTarget?.booking_slot_id]);

  const selectedOverrideSlot = overrideSlotGroups
      .flatMap((group) => group.slots)
      .find((option) => option.slot.id === selectedOverrideSlotId) ?? null;

  // Opens the capacity modal and determines initial lock state
  const openCapacityDialog = (date: string, session: 'AM'|'PM', currentSlots: number, limit: number, id: number) => {
    setEditingCapacity({ date, session, value: currentSlots, limit: limit, id: id });
    setIsEditCapacityOpen(true);
  };

  /* Toggles the session between open and closed (0 capacity) UNSAFE! (This shouldn't set the capacity to zero as it contains data within it)
  const toggleSessionStatus = () => {
      if (isSessionClosed) {
          setIsSessionClosed(false);
          setEditingCapacity(prev => prev ? { ...prev, value: previousCapacity } : null);
      } else {
          if (editingCapacity) setPreviousCapacity(editingCapacity.value);
          setIsSessionClosed(true);
          setEditingCapacity(prev => prev ? { ...prev, value: 0 } : null);
      }
  };
  */

  const openRosterDialog = (date: string, session: 'morning' | 'afternoon', students: RosterBooking[]) => {
    setActiveRoster({ date, session, students });
    setIsRosterOpen(true);
  };

  const resetOverrideState = () => {
    setOverrideTarget(null);
    setSelectedOverrideSlotId(null);
    setIsOverrideOpen(false);
    setIsOverrideConfirmOpen(false);
  };

  const openOverrideDialog = (booking: RosterBooking) => {
    setOverrideTarget(booking);
    setSelectedOverrideSlotId(null);
    setIsOverrideOpen(true);
  };

  // Handles adding a new schedule date
  const handleAddNewDate = async () => {
    if (!newDateInput) return;

    if (isPastDate(newDateInput)) { toast.error("Cannot schedule a date that has already passed."); return; }

    const exists = schedules.some(s => s.date === newDateInput);
    if (exists) { toast.error("Date already exists!"); return; }

    const amLimit = (sessionType === 'both' || sessionType === 'am') ? newAmCapacity : 0;
    const pmLimit = (sessionType === 'both' || sessionType === 'pm') ? newPmCapacity : 0;

    try {
      const res = await adminService.addSchedule(newDateInput, amLimit, pmLimit);
      if (res.success) {
        toast.success("New schedule has been added successfully!");
        
        fetchSchedules();

        // Reset form fields
        setNewDateInput("");
        setNewAmCapacity(0);
        setNewPmCapacity(0);
        setIsAddDateOpen(false);
      } else {
        toast.error(res.reason || "Failed to add schedule");
      }
    } catch(err) {
      console.error("Error adding schedule", err);
      toast.error("Error connecting to the server");
    }
  };

  // Processes the server request to update the schedule capacity
  const executeCapacityUpdate = async () => {
        if (!editingCapacity) return;

        if (!Number.isFinite(editingCapacity.value) || editingCapacity.value < editingCapacity.limit) {
                toast.error(`Capacity must be at least ${editingCapacity.limit}.`);
                return;
        }

        const nextCapacity = Math.trunc(editingCapacity.value);
    
    setIsProcessing(true);
    try {
        const response = await adminService.updateScheduleCapacity(
            editingCapacity.id, 
            editingCapacity.session, 
            nextCapacity
        );
        
        if (response.success) {
            toast.success("Capacity limit updated successfully.");
            await fetchSchedules();
            setIsEditCapacityOpen(false);
            setEditingCapacity(null);
        } else {
            toast.error(response.reason || "Failed to update capacity limit.");
        }
    } catch (error) {
        console.error("Capacity update error:", error);
        toast.error("Unable to communicate with the server. Please check your connection.");
    } finally {
        setIsProcessing(false);
    }
  };

  const executeBookingOverride = async () => {
    if (!overrideTarget || !selectedOverrideSlotId) return;

    const studentNumber = getRosterStudentNumber(overrideTarget);
    if (!studentNumber) {
        toast.error("Student number is missing.");
        return;
    }

    setIsProcessing(true);
    try {
        const response = await adminService.overrideStudentBooking(studentNumber, selectedOverrideSlotId);

        if (response.success) {
            toast.success("Student booking updated successfully.");
            await fetchSchedules();
            setIsRosterOpen(false);
            setActiveRoster(null);
            resetOverrideState();
        } else {
            toast.error(response.reason || "Failed to override student booking.");
        }
    } catch (error) {
        console.error("Student booking override error:", error);
        toast.error("Unable to communicate with the server. Please check your connection.");
    } finally {
        setIsProcessing(false);
    }
  };

  // Processes the server request to lock a specific schedule date
  const executeCloseSchedule = async () => {
    if (!selectedBookingId) return;

    setIsProcessing(true);
    try {
        const response = await adminService.toggleScheduleState(selectedBookingId);

        if (response.success) {
            // Provide dynamic toast feedback based on the action taken
            toast.success(isClosingAction ? "Schedule closed successfully." : "Schedule opened successfully.");
            await fetchSchedules();
            setIsCloseDateOpen(false);
            setSelectedBookingId(null);
        } else {
            toast.error(response.reason || "Failed to update the schedule.");
        }
    } catch (error) {
        console.error("Close schedule error:", error);
        toast.error("Unable to communicate with the server. Please check your connection.");
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-6xl mx-auto">
        
        {/* Header Title and Add Schedule Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-stone-200 shadow-sm gap-4">
            <div>
                <h2 className="text-2xl font-serif font-bold text-stone-800">Pictorial Availability</h2>
                <p className="text-stone-500 text-sm mt-1">
                    Manage dates, capacities, and monitor student attendance per session.
                </p>
            </div>

            <div className="flex items-center gap-3">
                {/* Toggle between upcoming schedules and a read-only history view of past dates */}
                <Button
                    variant="outline"
                    className="border-stone-200 text-stone-600 hover:bg-stone-50"
                    onClick={() => setShowHistory(!showHistory)}
                >
                    {showHistory
                        ? <><Calendar className="mr-2 h-4 w-4" /> View Upcoming</>
                        : <><Clock className="mr-2 h-4 w-4" /> View History</>}
                </Button>

            {/* Modal for adding a new schedule date — ADMINISTRATOR only */}
            <Dialog open={isAddDateOpen} onOpenChange={setIsAddDateOpen}>
                {canCreateSchedule && (
                    <DialogTrigger asChild>
                        <Button className="bg-amber-900 hover:bg-amber-800 shadow-lg">
                            <Plus className="mr-2 h-4 w-4" /> Add Date
                        </Button>
                    </DialogTrigger>
                )}
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Open New Schedule</DialogTitle>
                        <DialogDescription>Configure date and slot capacity.</DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Select Date</Label>
                            <Input type="date" min={todayInputValue} value={newDateInput} onChange={(e) => setNewDateInput(e.target.value)} />
                        </div>

                        {/* Dropdown to select whole day or half day session */}
                        <div className="space-y-2">
                            <Label>Session Type</Label>
                            <select 
                                className="flex h-10 w-full items-center justify-between rounded-md border border-stone-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-950"
                                value={sessionType}
                                onChange={(e) => setSessionType(e.target.value)}
                            >
                                <option value="both">Whole Day (AM & PM)</option>
                                <option value="am">Morning Only (AM)</option>
                                <option value="pm">Afternoon Only (PM)</option>
                            </select>
                        </div>

                        {/* Dynamic capacity inputs based on session type selection */}
                        <div className="grid grid-cols-2 gap-4">
                            {(sessionType === 'both' || sessionType === 'am') && (
                                <div className="space-y-2">
                                    <Label>AM Limit</Label>
                                    <Input type="number" value={newAmCapacity} onChange={(e) => setNewAmCapacity(parseInt(e.target.value))} />
                                </div>
                            )}
                            {(sessionType === 'both' || sessionType === 'pm') && (
                                <div className="space-y-2">
                                    <Label>PM Limit</Label>
                                    <Input type="number" value={newPmCapacity} onChange={(e) => setNewPmCapacity(parseInt(e.target.value))} />
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button onClick={handleAddNewDate}>Create Schedule</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            </div>
        </div>

        {/* Layout toggle: switch between the detailed card layout and a compact list/table layout */}
        <div className="flex items-center justify-end">
            <div className="flex items-center rounded-lg border border-stone-200 bg-white p-1">
                <Button
                    variant="ghost"
                    size="sm"
                    title="Card view"
                    className={`h-8 px-2.5 ${!isCompactView ? "bg-stone-100 text-stone-800" : "text-stone-400 hover:text-stone-600"}`}
                    onClick={() => setIsCompactView(false)}
                >
                    <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    title="Compact list view"
                    className={`h-8 px-2.5 ${isCompactView ? "bg-stone-100 text-stone-800" : "text-stone-400 hover:text-stone-600"}`}
                    onClick={() => setIsCompactView(true)}
                >
                    <List className="h-4 w-4" />
                </Button>
            </div>
        </div>

        {/* Empty state — shared between both layouts */}
        {displayedSchedules.length === 0 && (
            <div className="text-center text-stone-400 py-12 text-sm italic bg-white rounded-2xl border border-dashed border-stone-200">
                {showHistory ? "No past schedule dates yet." : "No upcoming schedule dates."}
            </div>
        )}

        {/* Compact list/table view — same actions as the card view, just denser */}
        {isCompactView && displayedSchedules.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 uppercase text-xs tracking-wider">
                        <tr>
                            <th className="text-left font-semibold px-4 py-3">Date</th>
                            <th className="text-left font-semibold px-4 py-3">Status</th>
                            <th className="text-left font-semibold px-4 py-3">Morning (AM)</th>
                            <th className="text-left font-semibold px-4 py-3">Afternoon (PM)</th>
                            {/* No actionable state on past dates, so the column is dropped entirely */}
                            {!showHistory && <th className="text-right font-semibold px-4 py-3">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {displayedSchedules.map((day: Schedule, idx) => {
                            const totalBooked = getPeriodRoster(day, "AM").length + getPeriodRoster(day, "PM").length;
                            const totalSlots = getPeriodCapacity(day, "AM") + getPeriodCapacity(day, "PM");
                            const isFull = totalSlots > 0 && totalBooked >= totalSlots;

                            const amRoster = getPeriodRoster(day, "AM");
                            const pmRoster = getPeriodRoster(day, "PM");

                            return (
                                <tr key={idx} className={!day.is_open ? "opacity-60" : ""}>
                                    <td className="px-4 py-3 font-medium text-stone-800 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Calendar className={`${day.is_open ? "text-amber-600" : "text-stone-400"} h-4 w-4`} />
                                            {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {showHistory ? (
                                            <Badge variant="outline" className="text-stone-500 border-stone-300 bg-stone-100 uppercase font-bold tracking-wider">
                                                <Clock className="w-3 h-3 mr-1"/> ENDED
                                            </Badge>
                                        ) : !day.is_open ? (
                                            <Badge variant="outline" className="text-stone-500 border-stone-300 bg-stone-100 uppercase font-bold tracking-wider">
                                                <Lock className="w-3 h-3 mr-1"/> CLOSED
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className={isFull ? "text-red-600 border-red-200 bg-red-50" : "text-green-600 border-green-200 bg-green-50"}>
                                                {isFull ? "FULLY BOOKED" : "AVAILABLE"}
                                            </Badge>
                                        )}
                                    </td>

                                    {/* Morning / Afternoon session cells share the same layout */}
                                    {([
                                        { label: 'AM' as const, slots: getPeriodCapacity(day, "AM"), roster: amRoster, rosterKey: 'morning' as const },
                                        { label: 'PM' as const, slots: getPeriodCapacity(day, "PM"), roster: pmRoster, rosterKey: 'afternoon' as const },
                                    ]).map(({ label, slots, roster, rosterKey }) => (
                                        <td key={label} className="px-4 py-3">
                                            {slots === 0 ? (
                                                <span className="text-stone-300 italic text-xs">No schedule</span>
                                            ) : (
                                                <div className="flex items-center gap-1">
                                                    <span className={`font-medium ${roster.length >= slots ? "text-red-600" : "text-stone-700"}`}>{roster.length}</span>
                                                    <span className="text-stone-400">/ {slots}</span>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 w-7 p-0 ml-1 text-stone-400 hover:text-stone-700"
                                                        title="View Roster"
                                                        onClick={() => openRosterDialog(day.date, rosterKey, roster)}
                                                    >
                                                        <Users className="h-3.5 w-3.5" />
                                                    </Button>

                                                    {!showHistory && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 w-7 p-0 text-stone-400 hover:text-amber-700"
                                                            title="Edit Capacity"
                                                            onClick={() => openCapacityDialog(day.date, label, slots, roster.length, day.id)}
                                                        >
                                                            <Edit3 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    ))}

                                    {/* No actionable state on past dates, so the column is dropped entirely */}
                                    {!showHistory && (
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={
                                                    day.is_open
                                                    ? "text-amber-700 border-amber-200 hover:bg-amber-50 h-8 px-3 font-medium bg-white"
                                                    : "text-green-700 border-green-200 hover:bg-green-50 h-8 px-3 font-medium bg-white"
                                                }
                                                onClick={() => {
                                                    setDateToClose(day.date);
                                                    setSelectedBookingId(day.id);
                                                    setIsClosingAction(day.is_open);
                                                    setIsCloseDateOpen(true);
                                                }}
                                            >
                                                {day.is_open ? <><Lock className="w-4 h-4 mr-1.5" /> Close</> : <><Unlock className="w-4 h-4 mr-1.5" /> Re-open</>}
                                            </Button>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        )}

        {/* Schedule Cards */}
        {!isCompactView && (
        <div className="grid gap-6">
            {displayedSchedules.map((day: Schedule, idx) => {

                // Calculate booked slots for rendering status
                const totalBooked = getPeriodRoster(day, "AM").length + getPeriodRoster(day, "PM").length;
                const totalSlots = getPeriodCapacity(day, "AM") + getPeriodCapacity(day, "PM");
                const isFull = totalSlots > 0 && totalBooked >= totalSlots;

                return (
                    // Updated the Card styling to visually dim closed schedules
                    <Card key={idx} className={`overflow-hidden border-t-4 shadow-md rounded-2xl border-stone-200 transition-opacity ${!day.is_open ? 'opacity-70 border-t-stone-400 grayscale-[20%]' : 'border-t-amber-600'}`}>
                        <CardHeader className="bg-stone-50/80 pb-4 border-b border-stone-100">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg flex items-center gap-2 font-serif text-stone-800">
                                    <Calendar className={`${day.is_open ? 'text-amber-600' : 'text-stone-500'} h-5 w-5`} /> 
                                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                </CardTitle>
                                {/* TODO: need some tweaking, should be a toggle now rather than closing it entirely.
                                    Also, update the message dialog whether we're opening or closing the given schedule dynamically. 
                                    Might be nice to have some indicator if it's open or not, this button can be easily confused at the moment.
                                    Pressing "Open" actually closes the schedule and vice versa for "Close".
                                    (I have no idea on how did you pass the "not allowed" symbol into this button) */}
                                <div className="flex items-center gap-3">
                                    {/* History entries are read-only — no close/re-open action, just a status badge */}
                                    {showHistory ? (
                                        <Badge variant="outline" className="text-stone-500 border-stone-300 bg-stone-100 uppercase font-bold tracking-wider">
                                            <Clock className="w-3 h-3 mr-1"/> PAST
                                        </Badge>
                                    ) : (
                                        <>
                                            {/* UI/UX Fix: Transformed to a dynamic toggle button with clear open/close states */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={
                                                    day.is_open
                                                    ? "text-amber-700 border-amber-200 hover:bg-amber-50 h-8 px-3 font-medium bg-white"
                                                    : "text-green-700 border-green-200 hover:bg-green-50 h-8 px-3 font-medium bg-white"
                                                }
                                                onClick={() => {
                                                    setDateToClose(day.date);
                                                    setSelectedBookingId(day.id);
                                                    setIsClosingAction(day.is_open); // Determine the intended action for the modal
                                                    setIsCloseDateOpen(true);
                                                }}
                                            >
                                                {day.is_open ? <><Lock className="w-4 h-4 mr-1.5" /> Close Schedule</> : <><Unlock className="w-4 h-4 mr-1.5" /> Re-open</>}
                                            </Button>

                                            {/* Status Badge: Now clearly indicates if the day is manually CLOSED */}
                                            {!day.is_open ? (
                                                <Badge variant="outline" className="text-stone-500 border-stone-300 bg-stone-100 uppercase font-bold tracking-wider">
                                                    <Lock className="w-3 h-3 mr-1"/> CLOSED
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className={isFull ? "text-red-600 border-red-200 bg-red-50" : "text-green-600 border-green-200 bg-green-50"}>
                                                    {isFull ? "FULLY BOOKED" : "AVAILABLE"}
                                                </Badge>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-6 bg-white pointer-events-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Process morning and afternoon sessions */}
                                {['AM', 'PM'].map((session) => {
                                    const period = session as "AM" | "PM";
                                    const is_morning = period === 'AM';
                                    const periodSlots = getScheduleSlots(day, period);

                                    // Filter students by session period
                                    const roster = getPeriodRoster(day, period);
                                    
                                    const bookedCount = roster.length;

                                    const slots = getPeriodCapacity(day, period);
                                    
                                    if (slots === 0) return (
                                        <div key={session} className="flex items-center justify-center p-8 bg-stone-50 rounded-xl border border-dashed border-stone-200 text-stone-400 text-sm italic">
                                            No {is_morning ? 'Morning' : 'Afternoon'} Schedule
                                        </div>
                                    );

                                    return (
                                        <div key={session} className={`space-y-4 p-5 rounded-xl border border-stone-100 ${is_morning ? 'bg-amber-50/30' : 'bg-blue-50/30'}`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-bold text-stone-700 flex items-center gap-2 text-sm">
                                                    {is_morning ? '🌤️ Morning Session' : '☀️ Afternoon Session'}
                                                </h4>
                                                
                                                {/* Edit Capacity Button - hidden in history view since past data is read-only */}
                                                {!showHistory && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-stone-400 hover:text-amber-700"
                                                        title="Edit Capacity"
                                                        onClick={() => openCapacityDialog(day.date, period, slots, bookedCount, day.id)}
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Progress bar for visual capacity tracking */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-medium">
                                                    <span className={bookedCount >= slots ? "text-red-600" : "text-stone-700"}>{bookedCount} Booked</span>
                                                    <span className="text-stone-400">Limit: {slots}</span>
                                                </div>
                                                <div className="h-2 w-full bg-stone-200/60 rounded-full overflow-hidden">
                                                    <div className={`h-full transition-all duration-500 ${bookedCount >= slots ? "bg-red-500" : is_morning ? "bg-amber-500" : "bg-blue-500"}`} style={{ width: `${(bookedCount / slots) * 100}%` }}></div>
                                                </div>
                                            </div>

                                            {periodSlots.length > 0 && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {periodSlots.map((slot) => {
                                                        const slotBooked = getSlotBookedCount(slot);
                                                        const slotPercent = slot.capacity > 0 ? Math.min((slotBooked / slot.capacity) * 100, 100) : 0;
                                                        const slotFull = slot.capacity > 0 && slotBooked >= slot.capacity;

                                                        return (
                                                            <div key={slot.id} className="rounded-lg border border-white/80 bg-white p-3 shadow-sm">
                                                                <div className="flex items-center justify-between gap-2 text-xs">
                                                                    <span className="font-bold text-stone-700">{formatSlotRange(slot)}</span>
                                                                    <span className={slotFull ? "font-semibold text-red-600" : "text-stone-500"}>
                                                                        {slotBooked}/{slot.capacity}
                                                                    </span>
                                                                </div>
                                                                <div className="mt-2 h-1.5 w-full bg-stone-200/70 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full ${slotFull ? "bg-red-500" : is_morning ? "bg-amber-500" : "bg-blue-500"}`}
                                                                        style={{ width: `${slotPercent}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            
                                            {/* Action Buttons */}
                                            <div className="flex gap-2 pt-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="flex-1 text-xs bg-white border-stone-200 hover:bg-stone-50 text-stone-600"
                                                    onClick={() => openRosterDialog(day.date, session === 'AM' ? 'morning' : 'afternoon', roster)}
                                                >
                                                    <Users className="mr-1.5 h-3.5 w-3.5" /> View Roster
                                                </Button>

                                                {/* TODO: hidden for now, make it functional
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="flex-1 text-xs bg-white border-stone-200 hover:bg-stone-50 text-stone-600"
                                                    onClick={() => handleOpenStudentOverride(day.date, session.toLowerCase() as 'am'|'pm')}
                                                >
                                                    <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Override
                                                </Button>
                                                */}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
        )}

        {/* --- MODAL: ROSTER / ATTENDANCE CHECKER --- */}
        <Dialog open={isRosterOpen} onOpenChange={setIsRosterOpen}>
            <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden">
                <div className="p-6 border-b border-stone-100 bg-stone-50/50">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Users className="text-amber-600 h-5 w-5"/> 
                        Session Roster
                    </DialogTitle>
                    <DialogDescription className="mt-1">
                        Showing students booked for {activeRoster?.date.substring(0,10)} ({activeRoster?.session === 'morning' ? 'Morning' : 'Afternoon'})
                    </DialogDescription>
                </div>
                
                <div className="p-6">
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-4">
                            <TabsTrigger value="all">All ({activeRoster?.students.length})</TabsTrigger>
                            <TabsTrigger value="attended" className="text-green-700 data-[state=active]:bg-green-50 data-[state=active]:text-green-800">Attended</TabsTrigger>
                            <TabsTrigger value="pending" className="text-amber-700 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-800">Pending/Missed</TabsTrigger>
                        </TabsList>

                        {/* Render student list based on selected filter */}
                        {[
                            { value: 'all', filterFn: () => true },
                            {
                                value: 'attended',
                                filterFn: (s: any) => {
                                    const status = s?.student?.studentAuth?.status ?? s?.status;
                                    return status === 'ATTENDED' || status === 'FULLY_VERIFIED';
                                },
                            },
                            {
                                value: 'pending',
                                filterFn: (s: any) => {
                                    const status = s?.student?.studentAuth?.status ?? s?.status;
                                    return status !== 'ATTENDED' && status !== 'FULLY_VERIFIED';
                                },
                            },
                        ].map(tab => (
                            <TabsContent key={tab.value} value={tab.value} className="mt-0">
                                <ScrollArea className="h-[400px] pr-4">
                                    <div className="space-y-2">
                                        {activeRoster?.students.filter(tab.filterFn).map((student, idx) => {
                                            const status = getRosterStatus(student);
                                            const canMoveStudent = canOverrideBookings && !showHistory && status !== 'ATTENDED' && status !== 'FULLY_VERIFIED';

                                            return (
                                                <div key={idx} className="flex flex-col gap-3 p-3 rounded-xl border border-stone-100 hover:bg-stone-50 transition-colors sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm text-stone-800">{getRosterStudentName(student)}</span>
                                                        <span className="text-xs text-stone-400 font-mono">{getRosterStudentNumber(student)}</span>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {status === 'FULLY_VERIFIED' && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0"><CheckCircle2 className="w-3 h-3 mr-1"/> Attended</Badge>}
                                                        {status === 'ATTENDED' && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0"><CheckCircle2 className="w-3 h-3 mr-1"/> Attended</Badge>}
                                                        {status === 'BOOKED' && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>}
                                                        {canMoveStudent && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 border-amber-200 bg-white text-xs text-amber-800 hover:bg-amber-50"
                                                                onClick={() => openOverrideDialog(student)}
                                                            >
                                                                Override
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        
                                        {activeRoster?.students.filter(tab.filterFn).length === 0 && (
                                            <div className="text-center text-stone-400 py-10 text-sm italic">
                                                No students found in this category.
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>

        {/* --- MODAL: MODIFY CAPACITY --- */}
        <Dialog open={isEditCapacityOpen} onOpenChange={setIsEditCapacityOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Modify Session Capacity</DialogTitle>
                    <DialogDescription>
                        Updating the limit for {editingCapacity?.session === 'AM' ? 'Morning' : 'Afternoon'} session on {formatModalDate(editingCapacity?.date)}.
                    </DialogDescription>
                </DialogHeader>
                
                {editingCapacity && (
                    <div className="py-4 space-y-3">
                         <Label>New Capacity Limit</Label>
                         <div className="flex gap-3">
                             <Input 
                                type="number" 
                                value={Number.isFinite(editingCapacity.value) ? editingCapacity.value : ""} 
                                onChange={(e) => setEditingCapacity({
                                    ...editingCapacity, 
                                    value: e.target.value === "" ? Number.NaN : Number(e.target.value)
                                })} 
                                className="flex-1"
                            />
                         </div>
                          <p className="text-sm text-stone-500">
                              Cannot be lower than the number of booked students:{" "}  
                              <span className="font-bold">{editingCapacity?.limit}</span>
                          </p>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditCapacityOpen(false)} disabled={isProcessing}>Cancel</Button>
                    <Button 
                        onClick={() => executeCapacityUpdate()} 
                        disabled={isProcessing || hasInvalidCapacity}
                        className="bg-amber-600 hover:bg-amber-700"
                    >
                        {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Updating...</> : "Confirm Update"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* --- MODAL: OVERRIDE STUDENT BOOKING --- */}
        <Dialog
            open={isOverrideOpen}
            onOpenChange={(open) => {
                setIsOverrideOpen(open);
                if (!open && !isOverrideConfirmOpen) {
                    resetOverrideState();
                }
            }}
        >
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Override Student Booking</DialogTitle>
                    <DialogDescription>
                        Move this student only after the committee approves a valid schedule-change request.
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4 text-sm">
                    <p className="font-bold text-stone-800">{getRosterStudentName(overrideTarget)}</p>
                    <p className="mt-1 text-xs text-stone-600">ID Number: {getRosterStudentNumber(overrideTarget)}</p>
                    <p className="mt-2 text-xs text-amber-800">
                        The selected booking will replace the student's current confirmed schedule.
                    </p>
                </div>

                <ScrollArea className="h-[380px] pr-4">
                    <div className="space-y-4 py-2">
                        {overrideSlotGroups.length === 0 && (
                            <div className="rounded-lg border border-dashed border-stone-200 p-6 text-center text-sm italic text-stone-400">
                                No open future slots are available.
                            </div>
                        )}

                        {overrideSlotGroups.map(({ day, slots }) => (
                            <div key={day.id} className="space-y-3 rounded-lg border border-stone-200 bg-stone-50/60 p-4">
                                <h4 className="font-bold text-stone-700">{formatScheduleDate(day.date)}</h4>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {slots.map((option) => {
                                        const isSelected = selectedOverrideSlotId === option.slot.id;
                                        const isDisabled = option.isCurrent || option.isFull;

                                        return (
                                            <button
                                                key={option.slot.id}
                                                type="button"
                                                disabled={isDisabled}
                                                onClick={() => setSelectedOverrideSlotId(option.slot.id)}
                                                className={`rounded-lg border bg-white p-3 text-left transition-all ${
                                                    isSelected
                                                        ? "border-amber-600 bg-amber-50 ring-2 ring-amber-600"
                                                        : "hover:border-amber-300"
                                                } ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <p className="text-sm font-bold text-stone-700">{formatSlotRange(option.slot)}</p>
                                                        <p className="mt-1 text-xs text-stone-500">
                                                            {option.available} slot{option.available === 1 ? "" : "s"} left
                                                        </p>
                                                    </div>
                                                    {option.isCurrent && (
                                                        <Badge className="bg-stone-100 text-stone-600 hover:bg-stone-100">Current</Badge>
                                                    )}
                                                    {!option.isCurrent && option.isFull && (
                                                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Full</Badge>
                                                    )}
                                                    {isSelected && <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-700" />}
                                                </div>
                                                <p className="mt-2 text-[10px] text-stone-500">{option.booked}/{option.slot.capacity} Taken</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <DialogFooter>
                    <Button variant="outline" onClick={resetOverrideState} disabled={isProcessing}>Cancel</Button>
                    <Button
                        onClick={() => setIsOverrideConfirmOpen(true)}
                        disabled={!selectedOverrideSlot || isProcessing}
                        className="bg-amber-700 hover:bg-amber-800"
                    >
                        Review Override
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={isOverrideConfirmOpen} onOpenChange={setIsOverrideConfirmOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-700">
                        <AlertTriangle className="h-5 w-5" />
                        Confirm Booking Override
                    </DialogTitle>
                    <DialogDescription>
                        This will move <strong>{getRosterStudentName(overrideTarget)}</strong> to:
                        <span className="mt-2 block font-bold text-stone-800">
                            {selectedOverrideSlot ? `${formatScheduleDate(selectedOverrideSlot.day.date)} - ${formatSlotRange(selectedOverrideSlot.slot)}` : ""}
                        </span>
                        <span className="mt-3 block text-stone-600">
                            Use this only after the student's reason has been approved by the committee.
                        </span>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOverrideConfirmOpen(false)} disabled={isProcessing}>Cancel</Button>
                    <Button
                        onClick={executeBookingOverride}
                        disabled={isProcessing || !selectedOverrideSlot}
                        className="bg-amber-700 hover:bg-amber-800"
                    >
                        {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Updating...</> : "Confirm Override"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* --- MODAL: CLOSE SCHEDULE DATE --- */}
        <Dialog open={isCloseDateOpen} onOpenChange={setIsCloseDateOpen}>
            <DialogContent>
                <DialogHeader>
                    {/* Dynamically adjust title color and icon based on action */}
                    <DialogTitle className={`flex items-center gap-2 ${isClosingAction ? 'text-amber-600' : 'text-green-600'}`}>
                        {isClosingAction ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />} 
                        {isClosingAction ? "Close Schedule Date" : "Re-open Schedule Date"}
                    </DialogTitle>
                    <DialogDescription>
                        {isClosingAction ? (
                            <>
                                Are you sure you want to close the schedule for <strong>{formatModalDate(dateToClose || "")}</strong>? 
                                <br /><br />
                                This will prevent any further student registrations for this date, even if there are still available slots. Existing bookings will not be affected.
                            </>
                        ) : (
                            <>
                                Are you sure you want to re-open the schedule for <strong>{formatModalDate(dateToClose || "")}</strong>? 
                                <br /><br />
                                Students will once again be able to view and book any remaining available slots for this date.
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCloseDateOpen(false)} disabled={isProcessing}>Cancel</Button>
                    <Button 
                        onClick={executeCloseSchedule} 
                        disabled={isProcessing}
                        className={isClosingAction ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}
                    >
                        {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Processing...</> : (isClosingAction ? "Confirm Close" : "Confirm Open")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
  );
}
