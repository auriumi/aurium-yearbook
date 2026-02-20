import { useState } from "react";
import * as adminService from "@/app/admin/adminService"

// helper ra ni nako to generate fake names para sa roster ni koi
const generateMockStudents = (count: number) => {
  const names = ["Juan Dela Cruz", "Maria Clara", "Pedro Penduko", "Jose Rizal", "Andres Bonifacio", "Gabriela Silang", "Antonio Luna", "Melchora Aquino"];
  const statuses = ['attended', 'pending', 'missed']; 
  
  return Array.from({ length: count }).map((_, i) => ({
    id: `2024-${Math.floor(1000 + Math.random() * 9000)}`,
    name: names[Math.floor(Math.random() * names.length)] + ` ${i}`,
    status: statuses[Math.floor(Math.random() * statuses.length)] // random status para ma-test nato ang UI
  }));
};

// gi update nako ang mock data para nay listahan sa students per session
const MOCK_SCHEDULES = [
  { 
    date: "2026-03-15", 
    amSlots: 50, 
    amStudents: generateMockStudents(48), 
    pmSlots: 50, 
    pmStudents: generateMockStudents(12) 
  },
  { 
    date: "2026-03-16", 
    amSlots: 50, 
    amStudents: generateMockStudents(50), 
    pmSlots: 50, 
    pmStudents: generateMockStudents(50) 
  },
];

export function useSchedules() {
  const [schedules, setSchedules] = useState(MOCK_SCHEDULES);
  
  // states para sa pag add ug new date
  const [newDateInput, setNewDateInput] = useState("");
  const [sessionType, setSessionType] = useState("both"); // options: both, am, pm
  const [newAmCapacity, setNewAmCapacity] = useState(50);
  const [newPmCapacity, setNewPmCapacity] = useState(50);
  const [isAddDateOpen, setIsAddDateOpen] = useState(false);

  // states para sa manual override (katong add student)
  const [manualStudentId, setManualStudentId] = useState("");
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [activeAddStudentSession, setActiveAddStudentSession] = useState<{date: string, session: 'am'|'pm'} | null>(null);

  // states para sa pag edit sa capacity limit
  const [isEditCapacityOpen, setIsEditCapacityOpen] = useState(false);
  const [editingCapacity, setEditingCapacity] = useState<{date: string, session: 'am'|'pm', value: number} | null>(null);

  // gi add nako ni para sa request ni koi nga transparency/attendance checker
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [activeRoster, setActiveRoster] = useState<{date: string, session: 'am'|'pm', students: any[]} | null>(null);

  // i-save ang bag-ong capacity if mo click ug confirm
  const handleConfirmCapacityUpdate = () => {
    if (editingCapacity) {
        setSchedules(prev => prev.map(sched => {
            if (sched.date === editingCapacity.date) {
                return editingCapacity.session === 'am' 
                    ? { ...sched, amSlots: editingCapacity.value } 
                    : { ...sched, pmSlots: editingCapacity.value };
            }
            return sched;
        }));
        setIsEditCapacityOpen(false);
        setEditingCapacity(null);
    }
  };

  // tig open sa capacity dialog
  const openCapacityDialog = (date: string, session: 'am'|'pm', currentSlots: number) => {
    setEditingCapacity({ date, session, value: currentSlots });
    setIsEditCapacityOpen(true);
  };

  //show roster
  const openRosterDialog = (date: string, session: 'am'|'pm', students: any[]) => {
    setActiveRoster({ date, session, students });
    setIsRosterOpen(true);
  };

  //handle add date
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
        
        //TODO: re-fetch to update local state

        // reset form fields
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

  //manaually add student based on id number
  const openAddStudentDialog = (date: string, session: 'am'|'pm') => {
      setActiveAddStudentSession({ date, session });
      setManualStudentId("");
      setIsAddStudentOpen(true);
  }

  // logic pag mag manual add si admin ug student sa slot
  const handleManualAdd = () => {
    if (!manualStudentId || !activeAddStudentSession) return;
    
    const { date, session } = activeAddStudentSession;

    setSchedules(prev => prev.map(sched => {
        if (sched.date === date) {
            const currentStudents = session === 'am' ? sched.amStudents : sched.pmStudents;
            const limit = session === 'am' ? sched.amSlots : sched.pmSlots;
            
            if (limit === 0) { alert("This session is closed."); return sched; }
            if (currentStudents.length >= limit) { alert("Slot full!"); return sched; }
            
            // i-push nato ang bag-ong student sa roster array
            const newStudent = { id: manualStudentId, name: "Manual Added Student", status: "pending" };
            
            return session === 'am' 
              ? { ...sched, amStudents: [...sched.amStudents, newStudent] } 
              : { ...sched, pmStudents: [...sched.pmStudents, newStudent] };
        }
        return sched;
    }));
    
    setManualStudentId(""); 
    setIsAddStudentOpen(false);
    setActiveAddStudentSession(null);
  };

 return {
    schedules,
    newDateInput, setNewDateInput,
    sessionType, setSessionType,
    newAmCapacity, setNewAmCapacity,
    newPmCapacity, setNewPmCapacity,
    isAddDateOpen, setIsAddDateOpen,
    manualStudentId, setManualStudentId,
    isAddStudentOpen, setIsAddStudentOpen,
    activeAddStudentSession,
    isEditCapacityOpen, setIsEditCapacityOpen,
    editingCapacity, setEditingCapacity,
    isRosterOpen, setIsRosterOpen,
    activeRoster,
    handleConfirmCapacityUpdate,
    openCapacityDialog,
    openRosterDialog, 
    handleAddNewDate,
    openAddStudentDialog,
    handleManualAdd
  };
}