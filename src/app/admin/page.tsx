"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link"; 
import Image from "next/image";
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  Search, 
  Mail, 
  Plus, 
  Edit3, 
  Bell,
  LogOut,
  BookOpen,      
  GraduationCap, 
  MapPin,        
  Phone,         
  UserCheck,     
  Circle,        
  FileText,      
  ChevronRight,  
  CheckCircle2,  
  Clock,         
  Menu,          
  X,             
  Home,
  ArrowLeft,
  User,
  Save,
  Camera,
  ExternalLink // Added icon to indicate opening in new tab
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; 
import { ScrollArea } from "@/components/ui/scroll-area"; 

const MOCK_SCHEDULES = [
  { date: "2026-03-15", amSlots: 50, amBooked: 48, pmSlots: 50, pmBooked: 12 },
  { date: "2026-03-16", amSlots: 50, amBooked: 50, pmSlots: 50, pmBooked: 50 },
];

const MOCK_MASTER_LIST = [
  {
    id: "rac-1",
    idNumber: "2019-00101",
    lname: "Abad",
    fname: "Anthony",
    mname: "J.",
    department: "College of Computing & Information Sciences",
    program: "BS Computer Science",
    statusStep: 6, 
    details: {
      address: "Prk. 1, Apokon, Tagum City",
      contact: "09123456789",
      email: "anthony@gmail.com",
      thesis: "AI-Driven Crop Yield Prediction",
      guardian: "Mrs. Abad"
    }
  },
  {
    id: "rac-2",
    idNumber: "2019-00105",
    lname: "Corpuz",
    fname: "Bea",
    mname: "L.",
    department: "College of Computing & Information Sciences",
    program: "BS Information Technology",
    statusStep: 3, 
    details: {
      address: "Visayan Village, Tagum City",
      contact: "09987654321",
      email: "bea@yahoo.com",
      thesis: "Automated Library System",
      guardian: "Mr. Corpuz"
    }
  },
  {
    id: "rac-3",
    idNumber: "2019-00201",
    lname: "Santos",
    fname: "Carlos",
    mname: "M.",
    department: "College of Business Administration",
    program: "BS Accountancy",
    statusStep: 2, 
    details: {
      address: "Mankilam, Tagum City",
      contact: "09123456789",
      email: "carlos@gmail.com",
      thesis: "Impact of TRAIN Law on SMEs",
      guardian: "Mrs. Santos"
    }
  },
  {
    id: "rac-4",
    idNumber: "2019-00205",
    lname: "Dizon",
    fname: "Diana",
    mname: "O.",
    department: "College of Business Administration",
    program: "BS Accountancy",
    statusStep: 4, 
    details: {
      address: "Magugpo East, Tagum City",
      contact: "09123456789",
      email: "diana@gmail.com",
      thesis: "Audit Quality and Financial Reporting",
      guardian: "Mr. Dizon"
    }
  }
];

const MOCK_GRADUATES_VERIFICATION = [
  { 
    id: "2020-00123", 
    lname: "Dela Cruz",
    fname: "Juan",
    mname: "Santos",
    suffix: "",
    nickname: "\"Juanny\"",
    birthdate: "2002-05-15",
    province: "Davao del Norte",
    city: "Tagum City",
    barangay: "Visayan Village",
    course: "BACHELOR OF SCIENCE IN COMPUTER SCIENCE", 
    major: "Data Science", 
    thesis: "AI-Driven Traffic Management System for Tagum City",
    contactNum: "09123456789",
    personalEmail: "juan.delacruz@gmail.com",
    father: "Pedro Dela Cruz",
    mother: "Maria Dela Cruz",
    guardian: "", 
    photo: "https://github.com/shadcn.png",
    status: "pending", 
    last_edited_by: null,
    last_edited_at: null
  },
  { 
    id: "2020-00456", 
    lname: "Clara",
    fname: "Maria",
    mname: "Reyes",
    suffix: "",
    nickname: "\"Mar\"",
    birthdate: "2001-11-20",
    province: "Davao de Oro",
    city: "Nabunturan",
    barangay: "Poblacion",
    course: "BACHELOR OF SCIENCE IN BUSINESS ADMINISTRATION", 
    major: "Marketing Management", 
    thesis: "Impact of Social Media Marketing on Local Coffee Shops",
    contactNum: "09987654321",
    personalEmail: "maria.clara@yahoo.com",
    father: "Jose Clara",
    mother: "Teresa Clara",
    guardian: "",
    photo: "https://github.com/shadcn.png",
    status: "verified",
    last_edited_by: "Ms. Sarah Jenkins", 
    last_edited_at: "2026-03-15 09:30 AM"
  },
];

const STATUS_STEPS = [
  { id: 1, label: "Pre-Registered", desc: "Student submitted data" },
  { id: 2, label: "Verified", desc: "Cleared by RAC" },
  { id: 3, label: "Pictorial Scheduled", desc: "Slot booked" },
  { id: 4, label: "Attendance", desc: "Arrived at venue" },
  { id: 5, label: "Info Finalized", desc: "Details confirmed" },
  { id: 6, label: "Pictorial", desc: "Photoshoot completed" },
];

// --- MAIN COMPONENT ---
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("verification"); 
  const [schedules, setSchedules] = useState(MOCK_SCHEDULES);
  
  // States for Inputs
  const [searchQuery, setSearchQuery] = useState("");
  const [newDateInput, setNewDateInput] = useState("");
  const [manualStudentName, setManualStudentName] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // States for Masterlist Modal
  const [selectedMasterlistStudent, setSelectedMasterlistStudent] = useState<any>(null);

  // --- VERIFICATION STATES ---
  const [selectedStudent, setSelectedStudent] = useState<any>(null); 
  const [isEditing, setIsEditing] = useState(false);
  const studentPhotoInputRef = useRef<HTMLInputElement>(null);

  // --- FETCH PENDING STUDENTS ---
  const [pendingStudents, setPendingStudents] = useState<any[]>([]);
  
    const fetchStudents = useCallback(async () => {
        try {
            const res = await fetch('http://localhost:4000/api/admin/student/fetch');
            if (!res.ok) throw new Error("Something went wrong");

            const data = await res.json();

            if (Array.isArray(data)) {
                setPendingStudents(data);
            } else {
                setPendingStudents([]);
            }
        } catch (err) {
            console.error("Something went wrong: ", err);
            setPendingStudents([]);
        }
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

  // --- ACTIONS: VERIFICATION --- 
  const handleSaveEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const timestamp = new Date().toLocaleString();

    const updates = {
        fname: (formData.get("fname") as string) || selectedStudent.fname,
        lname: (formData.get("lname") as string) || selectedStudent.lname,
        mname: (formData.get("mname") as string) || selectedStudent.mname,
        suffix: (formData.get("suffix") as string) || "", 
        nickname: (formData.get("nickname") as string) || "",
        course: (formData.get("course") as string) || selectedStudent.course,
        major: (formData.get("major") as string) || selectedStudent.major,
        thesis: (formData.get("thesis") as string) || selectedStudent.thesis,
        province: (formData.get("province") as string) || selectedStudent.province,
        city: (formData.get("city") as string) || selectedStudent.city,
        barangay: (formData.get("barangay") as string) || selectedStudent.barangay,
        contactNum: (formData.get("contactNum") as string) || selectedStudent.contactNum,
        personalEmail: (formData.get("personalEmail") as string) || selectedStudent.personalEmail,
        father: (formData.get("father") as string) || selectedStudent.father,
        mother: (formData.get("mother") as string) || selectedStudent.mother,
        guardian: (formData.get("guardian") as string) || "",
        status: "verified",
        last_edited_by: "Admin (You)", // Admin override
        last_edited_at: timestamp,
        photo: selectedStudent.photo
    };

    setSelectedStudent((prev: any) => ({ ...prev, ...updates }));
    setIsEditing(false);
  };

  const handleStudentPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedStudent((prev: any) => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  //TODO: fix...
  const handleVerify = async (studentId: number) => {
    const student = pendingStudents?.find(s => s.studentNumber?.student_number === studentId);
    if (!student) return;
    const body = { id: studentId };
    try {
      const res = await fetch("http://localhost:4000/post/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      setPendingStudents(prev => prev.filter(s => s.studentNumber.student_number !== studentId));
      //setVerifiedStudents(prev => [...prev, { ...student, status: "verified" }]);
    } catch (err) {
      console.error("Something went wrong..", err);
    }
    const name = student.name || `${student.first_name} ${student.last_name}`;
    alert(`Succesfully verified ${name}! Credentials has been sent to the respective email.`);
  };

  const handleBulkVerify = () => {
    const match = pendingStudents.find(s => s.student_number.includes(searchQuery));
    if (match) {
        handleVerify(match.id);
        setSearchQuery(""); 
    } else {
        alert("No pending student found with that ID number.");
    }
  };

  const handleFinalize = () => {
    const timestamp = new Date().toLocaleString();
    const update = {
        status: "verified", 
        last_edited_by: "Admin (You)",
        last_edited_at: timestamp 
    };
      
    setSelectedStudent((prev: any) => ({ ...prev, ...update }));
  };

  const filteredPending = pendingStudents.filter(stud => 
    stud.last_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    stud.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(stud.student_number).includes(searchQuery)
  );

  // --- ACTIONS: SCHEDULING ---
  const handleUpdateCapacity = (date: string, session: 'am' | 'pm', newCapacity: number) => {
    setSchedules(prev => prev.map(sched => {
        if (sched.date === date) {
            return session === 'am' 
                ? { ...sched, amSlots: newCapacity } 
                : { ...sched, pmSlots: newCapacity };
        }
        return sched;
    }));
  };

  const handleAddNewDate = () => {
    if (!newDateInput) return;
    const exists = schedules.some(s => s.date === newDateInput);
    if (exists) { alert("This date already exists!"); return; }

    const newSchedule = {
        date: newDateInput,
        amSlots: 50, amBooked: 0,
        pmSlots: 50, pmBooked: 0
    };
    setSchedules(prev => [...prev, newSchedule].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setNewDateInput(""); 
  };

  const handleManualAdd = (date: string, session: 'am' | 'pm') => {
    if (!manualStudentName) return;
    setSchedules(prev => prev.map(sched => {
        if (sched.date === date) {
            const currentBooked = session === 'am' ? sched.amBooked : sched.pmBooked;
            const limit = session === 'am' ? sched.amSlots : sched.pmSlots;
            if (currentBooked >= limit) { alert("Slot is full! Increase capacity first."); return sched; }
            return session === 'am' ? { ...sched, amBooked: sched.amBooked + 1 } : { ...sched, pmBooked: sched.pmBooked + 1 };
        }
        return sched;
    }));
    setManualStudentName(""); 
  };

  // --- ACTIONS: MASTERLIST GROUPING ---
  const groupedMasterlist = useMemo(() => {
    const filtered = MOCK_MASTER_LIST.filter(s => 
      s.lname.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.fname.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.idNumber.includes(searchQuery)
    );

    const groups: Record<string, Record<string, typeof MOCK_MASTER_LIST>> = {};
    
    filtered.forEach(student => {
      if (!groups[student.department]) groups[student.department] = {};
      if (!groups[student.department][student.program]) groups[student.department][student.program] = [];
      groups[student.department][student.program].push(student);
    });

    Object.keys(groups).forEach(dept => {
      Object.keys(groups[dept]).forEach(prog => {
        groups[dept][prog].sort((a, b) => a.lname.localeCompare(b.lname));
      });
    });

    return groups;
  }, [searchQuery]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchQuery("");
    setSelectedStudent(null);
  }

  // LOGO COMPONENT REUSABLE
  const BrandLogo = ({ dark = false }: { dark?: boolean }) => (
    <div className="flex items-center gap-3">
        <div className="relative w-8 h-8 overflow-hidden hover:scale-105 transition-transform duration-300">
           <Image src="/images/umtc-logo.png" alt="UMTC" fill className="object-contain" />
        </div>
        <div className={`h-8 w-[1px] ${dark ? 'bg-stone-300' : 'bg-stone-700/50'}`}></div>
        <div className="relative w-8 h-8 overflow-hidden hover:scale-105 transition-transform duration-300">
           <Image src="/images/aurium-logo.png" alt="Aurium" fill className="object-contain" />
        </div>
        <div className="flex flex-col justify-center">
           <span className={`text-lg font-serif font-bold ${dark ? 'text-stone-800' : 'text-white'} leading-none tracking-tight`}>AURIUM</span>
           <span className="text-[8px] text-amber-600 uppercase tracking-widest font-bold">Admin Portal</span>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 flex font-sans relative selection:bg-amber-100 selection:text-amber-900">
      
      {/* --- MOBILE SIDEBAR OVERLAY --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
            <aside className="relative w-72 bg-stone-950 text-stone-300 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300 h-full border-r border-stone-800">
                <div className="p-6 border-b border-stone-800/50 flex items-center justify-between">
                    <BrandLogo />
                    <Button variant="ghost" size="icon" className="text-stone-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-2 px-3">Menu</p>
                    
                    {/* KEY UPDATE: "Return to Website" opens in NEW TAB to preserve session */}
                    <Link href="/" target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-stone-400 hover:text-white hover:bg-stone-900">
                            <Home size={18} /> <span className="flex items-center gap-2">Return to Website <ExternalLink size={12} className="opacity-50"/></span>
                        </Button>
                    </Link>

                    <div className="my-2 border-t border-stone-800/50"></div>
                    <Button variant="ghost" className={`w-full justify-start gap-3 h-12 ${activeTab === "verification" ? "bg-amber-900/40 text-amber-100 border-r-2 border-amber-500" : "hover:text-white hover:bg-stone-900"}`} onClick={() => { handleTabChange("verification"); setIsMobileMenuOpen(false); }}>
                        <Users size={18} className={activeTab === "verification" ? "text-amber-400" : "text-stone-500"} /> Student Verification
                    </Button>
                    <Button variant="ghost" className={`w-full justify-start gap-3 h-12 ${activeTab === "masterlist" ? "bg-amber-900/40 text-amber-100 border-r-2 border-amber-500" : "hover:text-white hover:bg-stone-900"}`} onClick={() => { handleTabChange("masterlist"); setIsMobileMenuOpen(false); }}>
                        <BookOpen size={18} className={activeTab === "masterlist" ? "text-amber-400" : "text-stone-500"} /> RAC Masterlist
                    </Button>
                    <Button variant="ghost" className={`w-full justify-start gap-3 h-12 ${activeTab === "slots" ? "bg-amber-900/40 text-amber-100 border-r-2 border-amber-500" : "hover:text-white hover:bg-stone-900"}`} onClick={() => { handleTabChange("slots"); setIsMobileMenuOpen(false); }}>
                        <Calendar size={18} className={activeTab === "slots" ? "text-amber-400" : "text-stone-500"} /> Pictorial Schedules
                    </Button>
                </nav>
                <div className="p-4 border-t border-stone-800/50 bg-stone-950">
                    <div className="flex items-center gap-3 mb-4">
                        <Avatar className="border-2 border-stone-700">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>AD</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">Admin User</p>
                            <p className="text-[10px] text-stone-500 truncate uppercase tracking-wider">Head Moderator</p>
                        </div>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full justify-center gap-2 text-red-400 border-red-900/30 bg-red-900/10 hover:bg-red-900/20 hover:text-red-300">
                                <LogOut size={16} /> Log Out
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[90%] rounded-xl">
                            <DialogHeader>
                                <DialogTitle>Confirm Logout</DialogTitle>
                                <DialogDescription>Are you sure you want to end your session?</DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="gap-2 sm:gap-0">
                                {/* KEY UPDATE: Clear session on logout */}
                                <Link href="/" onClick={() => {}}><Button variant="destructive" className="w-full">Yes, Log Out</Button></Link>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </aside>
        </div>
      )}

      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="w-72 bg-stone-950 text-stone-300 hidden md:flex flex-col h-screen fixed left-0 top-0 z-20 border-r border-stone-800 shadow-2xl">
        <div className="p-8 border-b border-stone-800/50 flex items-center justify-center">
             <BrandLogo />
        </div>
        <nav className="flex-1 p-6 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-2 px-3">Menu</p>
          
          {/* KEY UPDATE: "Return to Website" opens in NEW TAB to preserve session */}
          <Link href="/" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" className="w-full justify-start gap-4 h-12 text-sm font-medium hover:text-white hover:bg-stone-900 text-stone-500">
                    <Home size={18} /> <span className="flex items-center gap-2">Return to Website <ExternalLink size={12} className="opacity-50"/></span>
                </Button>
            </Link>

            <div className="my-2 border-t border-stone-800/50"></div>
            <Button variant="ghost" className={`w-full justify-start gap-4 h-12 text-sm font-medium transition-all ${activeTab === 'verification' ? 'bg-amber-900/30 text-amber-100 border-r-2 border-amber-500' : 'hover:text-white hover:bg-stone-900'}`} onClick={() => handleTabChange("verification")}>
                <Users size={18} className={activeTab === "verification" ? "text-amber-500" : "text-stone-500"} /> Student Verification
            </Button>
            <Button variant="ghost" className={`w-full justify-start gap-4 h-12 text-sm font-medium transition-all ${activeTab === 'masterlist' ? 'bg-amber-900/30 text-amber-100 border-r-2 border-amber-500' : 'hover:text-white hover:bg-stone-900'}`} onClick={() => handleTabChange("masterlist")}>
                <BookOpen size={18} className={activeTab === "masterlist" ? "text-amber-500" : "text-stone-500"} /> RAC Masterlist
            </Button>
            <Button variant="ghost" className={`w-full justify-start gap-4 h-12 text-sm font-medium transition-all ${activeTab === 'slots' ? 'bg-amber-900/30 text-amber-100 border-r-2 border-amber-500' : 'hover:text-white hover:bg-stone-900'}`} onClick={() => handleTabChange("slots")}>
                <Calendar size={18} className={activeTab === "slots" ? "text-amber-500" : "text-stone-500"} /> Pictorial Schedules
            </Button>
        </nav>
        <div className="p-6 border-t border-stone-800/50 bg-stone-950">
          <div className="flex items-center gap-3 mb-6 bg-stone-900/50 p-3 rounded-xl border border-stone-800">
            <Avatar className="border border-stone-600 h-10 w-10">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">Admin User</p>
              <p className="text-[10px] text-stone-500 truncate uppercase tracking-wider">Head Moderator</p>
            </div>
          </div>
          <Dialog>
             <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-900/20">
                    <LogOut size={18} /> Log Out
                </Button>
             </DialogTrigger>
             <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="font-serif text-2xl text-stone-800">Confirm Logout</DialogTitle>
                    <DialogDescription>Are you sure you want to end your session?</DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    {/* KEY UPDATE: Clear session on logout */}
                    <Link href="/" onClick={() => {}}><Button variant="destructive" className="w-full">Yes, Log Out</Button></Link>
                </DialogFooter>
             </DialogContent>
          </Dialog>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 md:ml-72 p-4 md:p-8 overflow-y-auto h-screen bg-[#FDFBF7]">
        <header className="flex items-center justify-between mb-8 py-4 border-b border-stone-200/50">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="md:hidden text-stone-500 hover:text-amber-900" onClick={() => setIsMobileMenuOpen(true)}>
                    <Menu className="h-6 w-6" />
                </Button>
                {selectedStudent && (
                     <Button variant="ghost" size="icon" className="rounded-full hover:bg-stone-200 text-stone-600" onClick={() => setSelectedStudent(null)}>
                        <ArrowLeft className="h-5 w-5" />
                     </Button>
                )}
                <div className="flex items-center gap-3">
                    <div className="md:hidden"><BrandLogo dark /></div>
                    <div className="hidden md:block">
                        <h1 className="text-2xl font-serif font-bold text-stone-800">
                            {activeTab === 'verification' && "Verification Queue"}
                            {activeTab === 'slots' && "Schedule Manager"}
                            {activeTab === 'masterlist' && "Verified Masterlist"}
                        </h1>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white border border-stone-200 rounded-full shadow-sm text-xs font-medium text-stone-500">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   System Online
                </div>
                <Button variant="ghost" size="icon" className="text-stone-400 hover:text-amber-800 relative rounded-full hover:bg-amber-50">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                </Button>
            </div>
        </header>

        <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* --- TAB 1: STUDENT VERIFICATION (UPDATED WITH DETAIL VIEW) --- */}
            {activeTab === "verification" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-220px)]">
                    {/* LEFT: LIST (3 Cols) */}
                    <Card className={`lg:col-span-3 border-stone-200 shadow-sm flex flex-col overflow-hidden h-full rounded-2xl ${selectedStudent ? 'hidden lg:flex' : 'flex'}`}>
                        <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
                            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">All Students</span>
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800">{filteredPending.length}</Badge>
                        </div>
                        <div className="p-3 border-b border-stone-100">
                             <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" />
                                <Input placeholder="Search ID or Name..." className="pl-9 h-9 bg-stone-50" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                             </div>
                        </div>
                        <ScrollArea className="flex-1 p-3">
                            <div className="space-y-2">
                                {filteredPending.map((grad) => (
                                    <button 
                                        key={grad.id} 
                                        onClick={() => { setSelectedStudent(grad); setIsEditing(false); }}
                                        className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all border group ${selectedStudent?.id === grad.id ? "bg-amber-50 border-amber-200 shadow-sm" : "bg-white hover:bg-stone-50 border-transparent hover:border-stone-200"}`}
                                    >
                                        <Avatar className="h-10 w-10 border border-stone-200 group-hover:border-amber-300 transition-colors">
                                            <AvatarImage src={grad.photo ? grad.photo : "https://github.com/shadcn.png"} />
                                            <AvatarFallback>{grad.first_name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <p className={`font-bold text-sm truncate ${selectedStudent?.id === grad.id ? 'text-amber-900' : 'text-stone-800'}`}>{grad.first_name} {grad.last_name}</p>
                                            </div>
                                            <p className="text-xs text-stone-500 font-mono truncate">{grad.student_number}</p>
                                        </div>
                                        <ChevronRight size={16} className={`text-stone-300 ${selectedStudent?.id === grad.id ? 'text-amber-500' : ''}`} />
                                    </button>
                                ))}
                                {filteredPending.length === 0 && (
                                    <div className="text-center py-10 text-stone-400 text-sm flex flex-col items-center">
                                        <Search className="h-8 w-8 mb-2 opacity-20" /> No graduates found.
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </Card>

                    {/* RIGHT: DETAILS (9 Cols) */}
                    <div className={`lg:col-span-9 h-full ${selectedStudent ? 'block' : 'hidden lg:block'}`}>
                        {selectedStudent ? (
                            <div className="h-full flex flex-col animate-in fade-in zoom-in-95 duration-300">
                                {/* AUDIT TRAIL HEADER */}
                                <div className="bg-white border border-stone-200 rounded-t-2xl p-4 flex flex-col sm:flex-row justify-between items-center text-xs text-stone-500 shadow-sm z-10">
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <Badge variant={selectedStudent.status === 'verified' ? 'default' : 'outline'} className={`px-3 py-1 ${selectedStudent.status === 'verified' ? 'bg-green-600 hover:bg-green-600' : 'text-stone-500 border-stone-300'}`}>
                                            {selectedStudent.status === 'verified' ? 'VERIFIED FINAL' : 'PENDING REVIEW'}
                                        </Badge>
                                        <span className="h-4 w-[1px] bg-stone-300 hidden sm:block"></span>
                                        <span className="font-mono text-stone-400">{selectedStudent.student_number}</span>
                                    </div>
                                    {selectedStudent.last_edited_by && (
                                        <div className="flex items-center gap-1.5 mt-2 sm:mt-0 bg-stone-50 px-3 py-1 rounded-full border border-stone-100">
                                            <Clock size={12} className="text-amber-600" />
                                            <span>Last verified by <strong>{selectedStudent.last_edited_by}</strong> on {selectedStudent.last_edited_at}</span>
                                        </div>
                                    )}
                                </div>

                                {/* MAIN CARD */}
                                <Card className="rounded-t-none border-t-0 shadow-lg flex-1 flex flex-col bg-white relative overflow-hidden rounded-b-2xl border-stone-200">
                                    {/* EDIT MODE */}
                                    {isEditing ? (
                                        <div className="flex-1 overflow-y-auto p-6 bg-stone-50/50">
                                            <form id="edit-form" onSubmit={handleSaveEdit}>
                                                <div className="flex items-center justify-between mb-6 sticky top-0 bg-stone-50/95 backdrop-blur z-20 py-2 border-b border-stone-200">
                                                    <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2"><Edit3 size={20} className="text-amber-600"/> Edit Graduate Information</h2>
                                                    <div className="flex gap-2">
                                                        <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                                                        <Button type="submit" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white shadow-md">Save Changes</Button>
                                                    </div>
                                                </div>
                                                {/* Edit Content */}
                                                <div className="flex flex-col items-center mb-6 relative group">
                                                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg cursor-pointer" onClick={() => studentPhotoInputRef.current?.click()}>
                                                        <img src={selectedStudent.photo ? selectedStudent.photo : "https://github.com/shadcn.png"} alt="Student" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="text-white w-8 h-8" /></div>
                                                    </div>
                                                    <p className="text-xs text-stone-500 mt-2">Click to change photo</p>
                                                    <input type="file" ref={studentPhotoInputRef} className="hidden" accept="image/*" onChange={handleStudentPhotoChange}/>
                                                </div>
                                                <Tabs defaultValue="personal" className="w-full">
                                                    <TabsList className="grid w-full grid-cols-4 mb-6 p-1 bg-stone-200/50 rounded-xl">
                                                        <TabsTrigger value="personal">Personal</TabsTrigger>
                                                        <TabsTrigger value="academic">Academic</TabsTrigger>
                                                        <TabsTrigger value="contact">Contact</TabsTrigger>
                                                        <TabsTrigger value="family">Family</TabsTrigger>
                                                    </TabsList>
                                                    {/* Tabs Content */}
                                                    <TabsContent value="personal" className="space-y-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2"><Label>First Name</Label><Input name="fname" defaultValue={selectedStudent.first_name} /></div>
                                                            <div className="space-y-2"><Label>Last Name</Label><Input name="lname" defaultValue={selectedStudent.last_name} /></div>
                                                        </div>
                                                    </TabsContent>
                                                </Tabs>
                                            </form>
                                        </div>
                                    ) : (
                                        /* VIEW MODE (PREVIEW) */
                                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                                            {/* LEFT: VISUAL */}
                                            <div className="w-full md:w-5/12 bg-stone-100 p-8 flex flex-col items-center justify-center border-r border-stone-100 relative">
                                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                                <div className="relative mb-8 transform hover:scale-105 transition-transform duration-500 ease-out">
                                                    <div className="w-full max-w-[260px] aspect-[4/5] bg-white p-3 shadow-2xl rotate-1 border-2 border-stone-200 relative z-10 rounded-sm">
                                                        <img src={selectedStudent.photo ? selectedStudent.photo : "https://github.com/shadcn.png"} className="w-full h-full object-cover bg-stone-200 filter contrast-105" alt="Student" />
                                                        <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-amber-500 z-20"></div>
                                                        <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-amber-500 z-20"></div>
                                                    </div>
                                                </div>
                                                <div className="text-center space-y-4 max-w-sm relative z-10 mt-4">
                                                    <div>
                                                        <h2 className="text-3xl font-serif font-bold text-stone-900 leading-tight uppercase tracking-wide">
                                                            {selectedStudent.first_name} {selectedStudent.mid_name?.charAt(0)}. {selectedStudent.last_name} {selectedStudent.suffix}
                                                        </h2>
                                                        <p className="text-amber-600 font-serif italic text-lg mt-2 font-medium">{selectedStudent.nickname}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* RIGHT: DATA */}
                                            <div className="flex-1 p-8 overflow-y-auto bg-white">
                                                <div className="space-y-8">
                                                    <div>
                                                        <h3 className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-[0.2em] mb-4"><GraduationCap size={14}/> Academic Profile</h3>
                                                        <div className="grid grid-cols-1 gap-6 p-6 bg-stone-50 rounded-2xl border border-stone-100 relative">
                                                            <div><span className="text-[10px] uppercase text-stone-400 font-bold block mb-1">Course</span><span className="font-bold text-stone-800 text-lg leading-snug">{selectedStudent.course}</span></div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div><span className="text-[10px] uppercase text-stone-400 font-bold block mb-1">Major</span><span className="text-sm font-medium text-stone-700">{selectedStudent.major || "N/A"}</span></div>
                                                                <div><span className="text-[10px] uppercase text-stone-400 font-bold block mb-1">ID Number</span><span className="text-sm font-mono text-stone-700 bg-white px-2 py-1 rounded border border-stone-200 inline-block">{selectedStudent.student_number}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                                        <div>
                                                            <h3 className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-[0.2em] mb-4"><User size={14}/> Personal</h3>
                                                            <div className="space-y-3 text-sm text-stone-600 p-5 rounded-2xl border border-stone-100">
                                                                <p className="flex justify-between border-b border-stone-100 pb-2"><span className="font-bold text-stone-400 text-xs">DOB</span> <span>{selectedStudent.studentDetail.birth_date.substring(0,10)}</span></p>
                                                                <p className="flex justify-between"><span className="font-bold text-stone-400 text-xs">Guardian</span> <span>{selectedStudent.studentDetail.guardians_name || "-"}</span></p>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h3 className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-[0.2em] mb-4"><MapPin size={14}/> Contact</h3>
                                                            <div className="space-y-4 text-sm text-stone-600 p-5 rounded-2xl border border-stone-100">
                                                                <div className="flex items-start gap-3"><div className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Home size={14}/></div><div><span className="text-[10px] text-stone-400 font-bold uppercase block">Address</span>{selectedStudent.studentDetail.city}, {selectedStudent.studentDetail.province}</div></div>
                                                                <div className="flex items-start gap-3"><div className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Phone size={14}/></div><div><span className="text-[10px] text-stone-400 font-bold uppercase block">Phone</span>{selectedStudent.studentDetail.contact_num}</div></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ACTION FOOTER */}
                                    <CardFooter className="border-t border-stone-200 bg-stone-50 p-4 flex justify-between items-center z-20">
                                        <Button variant="outline" onClick={() => setIsEditing(true)} disabled={isEditing} className="border-stone-300 text-stone-600 hover:bg-white hover:text-amber-700">
                                            <Edit3 size={16} className="mr-2"/> Edit Information
                                        </Button>
                                        <Button onClick={handleFinalize} disabled={isEditing} className={`min-w-[160px] shadow-lg shadow-amber-900/10 ${selectedStudent.status === 'verified' ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-900 hover:bg-amber-800'}`}>
                                            {selectedStudent.status === 'verified' ? <><CheckCircle2 size={18} className="mr-2"/> Verified</> : <><Save size={18} className="mr-2"/> Final Submit</>}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-stone-400 border-2 border-dashed border-stone-200 rounded-2xl bg-white">
                                <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-4"><User size={40} className="opacity-20" /></div>
                                <p className="font-serif text-lg text-stone-500">Select a graduate to verify details</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- TAB 2: MASTERLIST --- */}
            {activeTab === 'masterlist' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {/* ... Existing Masterlist Code ... */}
                    <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold text-stone-800">RAC Verified Masterlist</h2>
                                <p className="text-sm text-stone-500">Official list of candidates for graduation.</p>
                            </div>
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                                {MOCK_MASTER_LIST.length} Records
                            </Badge>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                            <Input placeholder="Search by Name or ID Number..." className="pl-10 h-11 bg-stone-50 border-stone-200 focus:border-amber-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                    </div>
                    {/* Grouped List code block... */}
                    <div className="space-y-8">
                        {Object.keys(groupedMasterlist).length === 0 && <div className="text-center py-12 text-stone-400">No students found matching your search.</div>}
                        {Object.keys(groupedMasterlist).sort().map((dept) => (
                            <div key={dept} className="space-y-4">
                                <div className="sticky top-0 z-10 bg-[#FDFBF7]/95 backdrop-blur py-2 border-b border-amber-200/50">
                                    <h3 className="text-lg font-serif font-bold text-amber-900 flex items-center gap-2"><BookOpen className="h-5 w-5" /> {dept}</h3>
                                </div>
                                {Object.keys(groupedMasterlist[dept]).sort().map((program) => (
                                    <div key={program} className="pl-4 border-l-2 border-stone-200 space-y-3">
                                        <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-2 mt-4 mb-2"><GraduationCap className="h-4 w-4" /> {program}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {groupedMasterlist[dept][program].map((student) => (
                                                <div key={student.id} onClick={() => setSelectedMasterlistStudent(student)} className="group bg-white p-4 rounded-xl border border-stone-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex justify-between items-center">
                                                    <div>
                                                        <p className="font-bold text-stone-800 group-hover:text-amber-800 transition-colors text-sm">{student.lname}, {student.fname} {student.mname}</p>
                                                        <p className="text-xs font-mono text-stone-500 mt-1 bg-stone-50 inline-block px-1 rounded">{student.idNumber}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={`text-[10px] ${student.statusStep >= 6 ? 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200' : 'bg-stone-100 text-stone-600 hover:bg-stone-100 border-stone-200'}`}>{student.statusStep >= 6 ? 'Done' : 'Active'}</Badge>
                                                        <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-amber-500" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- TAB 3: SLOT MANAGEMENT --- */}
            {activeTab === 'slots' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                     {/* ... Existing Slot Management Code ... */}
                     <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-stone-800">Pictorial Availability</h2>
                            <p className="text-stone-500 text-sm">Manage capacity for morning and afternoon sessions.</p>
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="bg-amber-900 hover:bg-amber-800 shadow-lg shadow-amber-900/20"><Plus className="mr-2 h-4 w-4" /> Add New Date</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Open New Schedule</DialogTitle>
                                    <DialogDescription>Add a new date for pictorials. Default capacity is 50/50.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Select Date</Label>
                                        <Input type="date" value={newDateInput} onChange={(e) => setNewDateInput(e.target.value)} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleAddNewDate}>Create Schedule</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div className="grid gap-6">
                        {schedules.map((day, idx) => (
                            <Card key={idx} className="overflow-hidden border-t-4 border-t-amber-600 shadow-md rounded-2xl border-stone-200">
                                <CardHeader className="bg-stone-50/80 pb-4 border-b border-stone-100">
                                    <div className="flex justify-between items-center">
                                        <div><CardTitle className="text-lg flex items-center gap-2 font-serif text-stone-800"><Calendar className="text-amber-600 h-5 w-5" /> {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</CardTitle></div>
                                        <Badge variant="outline" className={day.amBooked + day.pmBooked >= day.amSlots + day.pmSlots ? "text-red-600 border-red-200 bg-red-50" : "text-green-600 border-green-200 bg-green-50"}>{day.amBooked + day.pmBooked >= day.amSlots + day.pmSlots ? "FULLY BOOKED" : "AVAILABLE"}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6 bg-white">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* MORNING */}
                                            <div className="space-y-4 p-4 rounded-xl border border-stone-100 bg-amber-50/30">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="font-bold text-stone-700 flex items-center gap-2 text-sm">🌤️ Morning <span className="text-[10px] font-normal text-stone-500 bg-white px-2 py-0.5 rounded border border-stone-200">8AM - 12PM</span></h4>
                                                    <Dialog>
                                                        <DialogTrigger asChild><Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-stone-400 hover:text-amber-700 hover:bg-amber-100 rounded-full"><Edit3 className="h-3.5 w-3.5" /></Button></DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader><DialogTitle>Modify Morning Capacity</DialogTitle></DialogHeader>
                                                            <Input type="number" defaultValue={day.amSlots} onChange={(e) => handleUpdateCapacity(day.date, 'am', parseInt(e.target.value))} />
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-xs font-medium"><span className={day.amBooked >= day.amSlots ? "text-red-600 font-bold" : "text-amber-700"}>{day.amBooked} Booked</span><span className="text-stone-400">Limit: {day.amSlots}</span></div>
                                                    <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-100"><div className={`h-full rounded-full transition-all duration-500 shadow-sm ${day.amBooked >= day.amSlots ? "bg-red-500" : "bg-amber-500"}`} style={{ width: `${(day.amBooked / day.amSlots) * 100}%` }}></div></div>
                                                </div>
                                                <Dialog>
                                                    <DialogTrigger asChild><Button variant="outline" size="sm" className="w-full text-xs border-dashed border-stone-300 text-stone-500 hover:text-amber-800 hover:border-amber-300 hover:bg-amber-50"><Plus className="mr-1 h-3 w-3" /> Manually Add Student</Button></DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader><DialogTitle>Add to Morning Slot</DialogTitle></DialogHeader>
                                                        <Input placeholder="e.g., Juan Dela Cruz" value={manualStudentName} onChange={(e) => setManualStudentName(e.target.value)} />
                                                        <DialogFooter><Button onClick={() => handleManualAdd(day.date, 'am')}>Confirm Add (+1)</Button></DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                            {/* AFTERNOON */}
                                            <div className="space-y-4 p-4 rounded-xl border border-stone-100 bg-blue-50/30">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="font-bold text-stone-700 flex items-center gap-2 text-sm">☀️ Afternoon <span className="text-[10px] font-normal text-stone-500 bg-white px-2 py-0.5 rounded border border-stone-200">1PM - 5PM</span></h4>
                                                    <Dialog>
                                                        <DialogTrigger asChild><Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-stone-400 hover:text-amber-700 hover:bg-amber-100 rounded-full"><Edit3 className="h-3.5 w-3.5" /></Button></DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader><DialogTitle>Modify Afternoon Capacity</DialogTitle></DialogHeader>
                                                            <Input type="number" defaultValue={day.pmSlots} onChange={(e) => handleUpdateCapacity(day.date, 'pm', parseInt(e.target.value))} />
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-xs font-medium"><span className={day.pmBooked >= day.pmSlots ? "text-red-600 font-bold" : "text-blue-700"}>{day.pmBooked} Booked</span><span className="text-stone-400">Limit: {day.pmSlots}</span></div>
                                                    <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-100"><div className={`h-full rounded-full transition-all duration-500 shadow-sm ${day.pmBooked >= day.pmSlots ? "bg-red-500" : "bg-blue-500"}`} style={{ width: `${(day.pmBooked / day.pmSlots) * 100}%` }}></div></div>
                                                </div>
                                                <Dialog>
                                                    <DialogTrigger asChild><Button variant="outline" size="sm" className="w-full text-xs border-dashed border-stone-300 text-stone-500 hover:text-blue-800 hover:border-blue-300 hover:bg-blue-50"><Plus className="mr-1 h-3 w-3" /> Manually Add Student</Button></DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader><DialogTitle>Add to Afternoon Slot</DialogTitle></DialogHeader>
                                                        <Input placeholder="e.g., Maria Clara" value={manualStudentName} onChange={(e) => setManualStudentName(e.target.value)} />
                                                        <DialogFooter><Button onClick={() => handleManualAdd(day.date, 'pm')}>Confirm Add (+1)</Button></DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

        </div>
      </main>

      {/* --- MASTERLIST STUDENT DETAILS MODAL --- */}
      <Dialog open={!!selectedMasterlistStudent} onOpenChange={(open) => !open && setSelectedMasterlistStudent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedMasterlistStudent && (
                <div className="flex flex-col md:flex-row gap-8">
                    {/* LEFT: Student Profile */}
                    <div className="flex-1 space-y-6">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-serif text-amber-950 flex items-center gap-2">
                                {selectedMasterlistStudent.lname}, {selectedMasterlistStudent.fname} {selectedMasterlistStudent.mname}
                                <CheckCircle2 className="h-5 w-5 text-blue-500" />
                            </DialogTitle>
                            <DialogDescription className="text-base font-mono bg-stone-100 inline-block px-2 py-1 rounded text-stone-600">
                                ID: {selectedMasterlistStudent.idNumber}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 text-sm text-stone-600">
                            <div className="bg-stone-50 p-4 rounded-lg border border-stone-100 space-y-3">
                                <h4 className="font-bold text-stone-800 uppercase text-xs tracking-wider mb-2">Academic Profile</h4>
                                <div className="flex items-start gap-3"><GraduationCap className="h-4 w-4 mt-0.5 text-amber-600"/> <span>{selectedMasterlistStudent.program}</span></div>
                                <div className="flex items-start gap-3"><BookOpen className="h-4 w-4 mt-0.5 text-amber-600"/> <span>{selectedMasterlistStudent.department}</span></div>
                                <div className="flex items-start gap-3"><FileText className="h-4 w-4 mt-0.5 text-amber-600"/> <span className="italic">Thesis: "{selectedMasterlistStudent.details.thesis}"</span></div>
                            </div>

                            <div className="bg-stone-50 p-4 rounded-lg border border-stone-100 space-y-3">
                                <h4 className="font-bold text-stone-800 uppercase text-xs tracking-wider mb-2">Personal Details</h4>
                                <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-stone-400"/> {selectedMasterlistStudent.details.address}</div>
                                <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-stone-400"/> {selectedMasterlistStudent.details.contact}</div>
                                <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-stone-400"/> {selectedMasterlistStudent.details.email}</div>
                                <div className="flex items-center gap-3"><UserCheck className="h-4 w-4 text-stone-400"/> Guardian: {selectedMasterlistStudent.details.guardian}</div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Status Timeline */}
                    <div className="w-full md:w-80 bg-stone-50 p-6 rounded-xl border border-stone-200">
                        <h3 className="font-bold text-stone-800 mb-6 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-amber-600" /> Status Tracker
                        </h3>
                        <div className="space-y-0">
                            {STATUS_STEPS.map((step, index) => {
                                const isCompleted = step.id <= selectedMasterlistStudent.statusStep;
                                const isCurrent = step.id === selectedMasterlistStudent.statusStep;
                                return (
                                    <div key={step.id} className="flex gap-4 relative pb-8 last:pb-0">
                                        {/* Connecting Line */}
                                        {index < STATUS_STEPS.length - 1 && (
                                            <div className={`absolute left-[11px] top-7 bottom-0 w-0.5 ${isCompleted && !isCurrent ? 'bg-green-300' : 'bg-stone-200'}`}></div>
                                        )}
                                        
                                        {/* Icon */}
                                        <div className={`z-10 w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0 ${
                                            isCompleted 
                                            ? 'bg-green-100 border-green-500 text-green-600' 
                                            : 'bg-white border-stone-300 text-stone-300'
                                        }`}>
                                            {isCompleted ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                                        </div>
                                        
                                        {/* Text */}
                                        <div className={`${isCompleted ? 'opacity-100' : 'opacity-50'}`}>
                                            <p className={`text-sm font-bold leading-none ${isCurrent ? 'text-green-700' : 'text-stone-700'}`}>{step.label}</p>
                                            <p className="text-xs text-stone-500 mt-1">{step.desc}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}
        </DialogContent>
      </Dialog>

    </div>
  );
}