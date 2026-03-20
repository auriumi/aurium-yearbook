"use client";

import { Plus, Edit3, Calendar, UserPlus, Hash, Users, CheckCircle2, XCircle, Clock, Filter, Loader2, Ban, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useState } from "react";
import { Schedule } from "@/types";
import * as adminService from "@/app/admin/adminService"

interface ScheduleProp {
    schedules: Schedule[];
    fetchSchedules: () => Promise<void>;
}

export function SchedulesTab({ schedules, fetchSchedules }: ScheduleProp) {

  // Input states
  const [newDateInput, setNewDateInput] = useState("");
  const [sessionType, setSessionType] = useState("both"); // options: both, am, pm
  const [newAmCapacity, setNewAmCapacity] = useState(50);
  const [newPmCapacity, setNewPmCapacity] = useState(50);
  const [isAddDateOpen, setIsAddDateOpen] = useState(false);

  // Student override states
  const [manualStudentId, setManualStudentId] = useState("");
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [activeAddStudentSession, setActiveAddStudentSession] = useState<{date: string, session: 'am'|'pm'} | null>(null);

  // Capacity override states
  const [isEditCapacityOpen, setIsEditCapacityOpen] = useState(false);
  const [editingCapacity, setEditingCapacity] = useState<{date: string, session: 'am'|'pm', value: number} | null>(null);
  const [isSessionClosed, setIsSessionClosed] = useState(false);
  const [previousCapacity, setPreviousCapacity] = useState(50);

  // Roster view states
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [activeRoster, setActiveRoster] = useState<{date: string, session: 'morning' | 'afternoon', students: any[]} | null>(null);

  // Schedule management states
  const [isCloseDateOpen, setIsCloseDateOpen] = useState(false);
  const [dateToClose, setDateToClose] = useState<string | null>(null);

  // Global loading state for network requests
  const [isProcessing, setIsProcessing] = useState(false);

  // Formats a raw date string into "Month DD" (e.g., "March 03")
  const formatModalDate = (dateString: string | undefined) => {
      if (!dateString) return "";
      return new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: '2-digit' });
  };

  // Opens the capacity modal and determines initial lock state
  const openCapacityDialog = (date: string, session: 'am'|'pm', currentSlots: number) => {
    setEditingCapacity({ date, session, value: currentSlots });
    setIsSessionClosed(currentSlots === 0);
    setPreviousCapacity(currentSlots > 0 ? currentSlots : 50); // Remember the last valid capacity
    setIsEditCapacityOpen(true);
  };

  // Toggles the session between open and closed (0 capacity)
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

  const openRosterDialog = (date: string, session: 'morning' | 'afternoon', students: any[]) => {
    setActiveRoster({ date, session, students });
    setIsRosterOpen(true);
  };

  // Handles adding a new schedule date
  const handleAddNewDate = async () => {
    if (!newDateInput) return;
    const exists = schedules.some(s => s.date === newDateInput);
    if (exists) { alert("Date already exists!"); return; }

    const amLimit = (sessionType === 'both' || sessionType === 'am') ? newAmCapacity : 0;
    const pmLimit = (sessionType === 'both' || sessionType === 'pm') ? newPmCapacity : 0;

    try {
      const res = await adminService.addSchedule(newDateInput, amLimit, pmLimit);
      if (res.success) {
        alert("New schedule has been added succesfully!");
        
        fetchSchedules();

        // Reset form fields
        setNewDateInput("");
        setNewAmCapacity(0);
        setNewPmCapacity(0);
        setIsAddDateOpen(false);
      } else {
        alert(res.reason);
      }
    } catch(err) {
      console.error("Error adding schedule", err);
      alert("Error connecting to the server");
    }
  };

  // Opens the modal for adding a student manually
  const handleOpenStudentOverride = (date: string, session: 'am'|'pm') => {
    setActiveAddStudentSession({ date, session });
    setManualStudentId("");
    setIsAddStudentOpen(true);
  };

  // Processes the server request to update the schedule capacity
  const executeCapacityUpdate = async () => {
    if (!editingCapacity) return;
    
    setIsProcessing(true);
    try {
        const response = await adminService.updateScheduleCapacity(
            editingCapacity.date, 
            editingCapacity.session, 
            editingCapacity.value
        );
        
        if (response.success) {
            alert("Capacity limit updated successfully.");
            await fetchSchedules();
            setIsEditCapacityOpen(false);
            setEditingCapacity(null);
        } else {
            alert(response.reason || "Failed to update capacity limit.");
        }
    } catch (error) {
        console.error("Capacity update error:", error);
        alert("Unable to communicate with the server. Please check your connection.");
    } finally {
        setIsProcessing(false);
    }
  };

  // Processes the server request to manually assign a student to a schedule
  const executeStudentOverride = async () => {
    if (!manualStudentId || !activeAddStudentSession) return;

    setIsProcessing(true);
    try {
        const response = await adminService.overrideStudentSchedule(
            activeAddStudentSession.date,
            activeAddStudentSession.session,
            manualStudentId
        );

        if (response.success) {
            alert("Student schedule override applied successfully.");
            await fetchSchedules();
            setIsAddStudentOpen(false);
            setManualStudentId("");
            setActiveAddStudentSession(null);
        } else {
            alert(response.reason || "Failed to apply student override.");
        }
    } catch (error) {
        console.error("Student override error:", error);
        alert("Unable to communicate with the server. Please check your connection.");
    } finally {
        setIsProcessing(false);
    }
  };

  // Processes the server request to lock a specific schedule date
  const executeCloseSchedule = async () => {
    if (!dateToClose) return;

    setIsProcessing(true);
    try {
        const response = await adminService.closeSchedule(dateToClose);

        if (response.success) {
            alert("Schedule has been successfully closed.");
            await fetchSchedules();
            setIsCloseDateOpen(false);
            setDateToClose(null);
        } else {
            alert(response.reason || "Failed to close the schedule.");
        }
    } catch (error) {
        console.error("Close schedule error:", error);
        alert("Unable to communicate with the server. Please check your connection.");
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
                <p className="text-stone-500 text-sm mt-1">Manage dates, capacities, and monitor student attendance per session.</p>
            </div>
            
            {/* Modal for adding a new schedule date */}
            <Dialog open={isAddDateOpen} onOpenChange={setIsAddDateOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-amber-900 hover:bg-amber-800 shadow-lg">
                        <Plus className="mr-2 h-4 w-4" /> Add Date
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Open New Schedule</DialogTitle>
                        <DialogDescription>Configure date and slot capacity.</DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Select Date</Label>
                            <Input type="date" value={newDateInput} onChange={(e) => setNewDateInput(e.target.value)} />
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
        
        {/* Schedule Cards */}
        <div className="grid gap-6">
            {schedules.map((day: Schedule, idx) => {

                // Calculate booked slots for rendering status
                const totalBooked = day.bookings.length;
                const totalSlots = day.max_morning_cap + day.max_afternoon_cap;
                const isFull = totalBooked >= totalSlots;

                return (
                    <Card key={idx} className="overflow-hidden border-t-4 border-t-amber-600 shadow-md rounded-2xl border-stone-200">
                        <CardHeader className="bg-stone-50/80 pb-4 border-b border-stone-100">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg flex items-center gap-2 font-serif text-stone-800">
                                    <Calendar className="text-amber-600 h-5 w-5" /> 
                                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                </CardTitle>
                                <div className="flex items-center gap-3">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-red-600 hover:bg-red-50 hover:text-red-700 h-8 px-3 font-medium"
                                        onClick={() => {
                                            setDateToClose(day.date);
                                            setIsCloseDateOpen(true);
                                        }}
                                    >
                                        <Ban className="w-4 h-4 mr-1.5" /> Close Date
                                    </Button>
                                    <Badge variant="outline" className={isFull ? "text-red-600 border-red-200 bg-red-50" : "text-green-600 border-green-200 bg-green-50"}>
                                        {isFull ? "FULLY BOOKED" : "AVAILABLE"}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-6 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Process morning and afternoon sessions */}
                                {['AM', 'PM'].map((session) => {
                                    const is_morning = session === 'AM';

                                    // Filter students by session period
                                    const roster = is_morning 
                                    ? day.bookings.filter(p => p.period === "AM") 
                                    : day.bookings.filter(p => p.period === "PM");
                                    
                                    const bookedCount = roster.length;

                                    const slots = is_morning 
                                    ? day.max_morning_cap 
                                    : day.max_afternoon_cap;
                                    
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
                                                
                                                {/* Edit Capacity Button - triggers the edit modal */}
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-8 w-8 p-0 text-stone-400 hover:text-amber-700" 
                                                    title="Edit Capacity"
                                                    onClick={() => openCapacityDialog(day.date, session.toLowerCase() as 'am'|'pm', slots)}
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </Button>
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

                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="flex-1 text-xs bg-white border-stone-200 hover:bg-stone-50 text-stone-600"
                                                    onClick={() => handleOpenStudentOverride(day.date, session.toLowerCase() as 'am'|'pm')}
                                                >
                                                    <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Override
                                                </Button>
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
                            { value: 'attended', filterFn: (s: any) => s.status === 'ATTENDED' },
                            { value: 'pending', filterFn: (s: any) => s.status !== 'ATTENDED' },
                        ].map(tab => (
                            <TabsContent key={tab.value} value={tab.value} className="mt-0">
                                <ScrollArea className="h-[400px] pr-4">
                                    <div className="space-y-2">
                                        {activeRoster?.students.filter(tab.filterFn).map((student, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-stone-100 hover:bg-stone-50 transition-colors">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm text-stone-800">{`${student.student.first_name} ${student.student.last_name}`}</span>
                                                    <span className="text-xs text-stone-400 font-mono">{student.student_number}</span>
                                                </div>
                                                
                                                {/* Status Badges */}
                                                {student.student.studentAuth.status === 'ATTENDED' && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0"><CheckCircle2 className="w-3 h-3 mr-1"/> Attended</Badge>}
                                                {student.student.studentAuth.status === 'BOOKED' && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>}
                                            </div>
                                        ))}
                                        
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
                        Updating the limit for {editingCapacity?.session === 'am' ? 'Morning' : 'Afternoon'} session on {formatModalDate(editingCapacity?.date)}.
                    </DialogDescription>
                </DialogHeader>
                
                {editingCapacity && (
                    <div className="py-4 space-y-3">
                         <Label>New Capacity Limit</Label>
                         <div className="flex gap-3">
                             <Input 
                                type="number" 
                                value={editingCapacity.value} 
                                onChange={(e) => setEditingCapacity({
                                    ...editingCapacity, 
                                    value: parseInt(e.target.value) || 0
                                })} 
                                disabled={isSessionClosed}
                                className="flex-1"
                            />
                             <Button 
                                 variant="outline" 
                                 className={`w-[100px] gap-2 ${isSessionClosed ? 'text-amber-600 border-amber-600 hover:bg-amber-50' : 'text-stone-600 border-stone-300 hover:bg-stone-50'}`}
                                 onClick={toggleSessionStatus}
                             >
                                 {isSessionClosed ? <><Unlock className="w-4 h-4"/> Open</> : <><Lock className="w-4 h-4"/> Close</>}
                             </Button>
                         </div>
                         <p className="text-xs text-stone-500">
                            Current Limit: <strong>{editingCapacity.value}</strong>
                         </p>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditCapacityOpen(false)} disabled={isProcessing}>Cancel</Button>
                    <Button 
                        onClick={executeCapacityUpdate} 
                        disabled={isProcessing}
                        className="bg-amber-600 hover:bg-amber-700"
                    >
                        {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Updating...</> : "Confirm Update"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* --- MODAL: ADD STUDENT MANUALLY --- */}
        <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Student Override</DialogTitle>
                    <DialogDescription>
                        Manually assigning a student to the {activeAddStudentSession?.session === 'am' ? 'Morning' : 'Afternoon'} session on {formatModalDate(activeAddStudentSession?.date)}.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 py-2">
                    <Label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Student ID Number</Label>
                    <div className="relative">
                        <Hash className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                        <Input 
                            placeholder="e.g. 142478" 
                            value={manualStudentId} 
                            onChange={(e) => setManualStudentId(e.target.value)} 
                            className="pl-9"
                        />
                    </div>  
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddStudentOpen(false)} disabled={isProcessing}>Cancel</Button>
                    <Button 
                        onClick={executeStudentOverride} 
                        disabled={isProcessing}
                        className="bg-amber-600 hover:bg-amber-700"
                    >
                        {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Processing...</> : "Confirm Override"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* --- MODAL: CLOSE SCHEDULE DATE --- */}
        <Dialog open={isCloseDateOpen} onOpenChange={setIsCloseDateOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-red-600 flex items-center gap-2">
                        <Ban className="w-5 h-5" /> Close Schedule Date
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to close the schedule for <strong>{formatModalDate(dateToClose || "")}</strong>? 
                        <br /><br />
                        This will prevent any further student registrations for this date, even if there are still available slots. Existing bookings will not be affected.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCloseDateOpen(false)} disabled={isProcessing}>Cancel</Button>
                    <Button 
                        onClick={executeCloseSchedule} 
                        disabled={isProcessing}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Processing...</> : "Confirm Close"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
  );
}