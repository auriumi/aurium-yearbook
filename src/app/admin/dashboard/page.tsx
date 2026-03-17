"use client";
const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL || "";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image"; 
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bell, Menu } from "lucide-react";
import toast from "react-hot-toast";

// Modular Imports
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { VerificationTab } from "@/components/admin/tabs/VerificationTab"; // Original Admin Tab
import { ProfileTab } from "@/components/admin/tabs/ProfileTab";
import { MasterlistTab } from "@/components/admin/tabs/MasterlistTab";
import { SchedulesTab } from "@/components/admin/tabs/SchedulesTab";

// --- MERGED IMPORTS ---
import { NotesTab } from "@/components/admin/tabs/NotesTab"; 
import { GraduateReviewTab } from "@/components/admin/tabs/GraduateReviewTab"; // <--- The Renamed Staff File

// Service Import
import * as adminService from "@/app/admin/adminService";

//hooks
import { useSchedules } from "@/hooks/useSchedules";
import { useMasterlist } from "@/hooks/useMasterlist";
import { Admin } from "@/types";

export default function AdminDashboard() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("verification"); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Data States
  const [pendingStudents, setPendingStudents] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1); 
  const [totalUnverified, setTotalUnverified] = useState(0);

  //Cache
  const [studentCache, setStudentCache] = useState<{[page: number]: any[]}>({});
  const masterlistProps = useMasterlist();

  //Schedules 
  const { schedules, fetchSchedules } = useSchedules();  

  // State specific to the Graduate Review Tab (Moved from Staff)
  // This handles the "Select a student to view details" feature
  const [selectedReviewStudent, setSelectedReviewStudent] = useState<any>(null);

    const [staffUser, setStaffUser] = useState<Admin | null>(null);

  const getStaffDetails = useCallback(async () => {
    try {
      const res = await adminService.getStaffProfile();
      if (!res.success) {
        toast.error(res.reason);
        return;
      }
      
      setStaffUser(res.data);

    } catch (error) {
      console.error("Error loading admin details:", error);
    }
  }, []);

  useEffect(() => {
    getStaffDetails();
  }, [getStaffDetails]);

  const onPageChange = (page: number) => {
    setCurrentPage(page);
    loadStudents(page);
  }

  const searchStudentById = async (student_number: number) => {
    try {
      const students = await adminService.searchStudentById(student_number);
      if (!students.success) {
        toast.error(students.reason);

        setPendingStudents([]);
        return;
      }

      setPendingStudents([students.data]);
    } catch (error) {
      console.error("Error loading student:", error);
    }
  }

  const loadStudents = useCallback(async (page: number) => {

    if (studentCache[page]) {
      setPendingStudents(studentCache[page]);
      return;
    }

    try {
        const students = await adminService.fetchStudents(page);
        if (!students.success) {
          setPendingStudents([]);
          return;
        }

        setPendingStudents(students.data.student_list);
        setTotalUnverified(students.data.total);

        setStudentCache(prev => ({
          ...prev,
          [page]: students.data.student_list
        }));

    } catch (error) {
        console.error("Error loading students:", error);
    }
  }, [studentCache]);

  useEffect(() => {
    loadStudents(currentPage);
  }, [loadStudents, currentPage]);

  const updateOnVerify = async (studentId: number) => {
    const res = await adminService.handleVerify(studentId);

    if (res) {
      //invalidate cache and refetch
      masterlistProps.invalidateCache();

      setStudentCache(prev => {
        const newCache = { ...prev };
        delete newCache[currentPage];
        return newCache;
      });

      loadStudents(currentPage);

      toast.success("Student succesfully verified!");
      return;
    }
    toast.error("Something went wrong!");
  }

  const updateOnCancel = async (studentId: number) => {
    const res = await adminService.handleCancel(studentId);
    if (res) {
      //invalidate cache and refetch
      masterlistProps.invalidateCache();

      setStudentCache(prev => {
        const newCache = { ...prev };
        delete newCache[currentPage];
        return newCache;
      });

      loadStudents(currentPage);

      toast.success("Student succesfully rejected!")
      return;
    }
    toast.error("Something went wrong!");
  }

  const onLogout = async () => {
    const res = await fetch(`${baseUrl}/api/auth/logout`, {
      credentials: 'include'
    });
    if (res.ok) router.push('/');
  }

  return (
    <div className="min-h-screen bg-stone-50 flex font-sans relative">
      
      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
         <div className="fixed inset-0 z-50 md:hidden bg-black/80" onClick={() => setIsMobileMenuOpen(false)}>
             <AdminSidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                isMobile={true} 
                setIsOpen={setIsMobileMenuOpen} 
                user={staffUser} 
                onLogout={() => onLogout()}
             />
         </div>
      )}

      {/* Desktop Sidebar */}
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobile={false} 
        user={staffUser} 
        onLogout={() => onLogout()}
      />

      {/* FIX APPLIED HERE: md:p-8 was changed to md:px-8 md:pt-4 */}
      <main className="flex-1 md:ml-72 p-4 md:px-8 md:pt-4 min-h-screen bg-[#FDFBF7]">
        
        <header className="flex items-center justify-between mb-8 py-4 border-b border-stone-200/50">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="md:hidden text-stone-500" onClick={() => setIsMobileMenuOpen(true)}>
                    <Menu className="h-6 w-6"/>
                </Button>

                <div className="flex items-center gap-3 md:hidden">
                    <div className="relative w-8 h-8 overflow-hidden hover:scale-105 transition-transform duration-300">
                        <Image src="/images/umtc-logo.png" alt="UMTC" fill className="object-contain" />
                    </div>
                    <div className="h-8 w-[1px] bg-stone-300"></div>
                    <div className="relative w-8 h-8 overflow-hidden hover:scale-105 transition-transform duration-300">
                        <Image src="/images/aurium-logo.png" alt="Aurium" fill className="object-contain" />
                    </div>
                </div>

                {/* Dynamic Title */}
                <h1 className="text-2xl font-serif font-bold text-stone-800 hidden md:block">
                    {activeTab === 'verification' && "Verification Queue"}
                    {activeTab === 'graduate-review' && "Graduate Verification"}
                    {activeTab === 'notes' && "Staff Notes"}
                    {activeTab === 'slots' && "Schedule Manager"}
                    {activeTab === 'masterlist' && "Verified Masterlist"}
                    {activeTab === 'scanner' && "Attendance Scanner"}
                    {activeTab === 'profile' && "My Profile"}
                </h1>
            </div>

            <div className="flex items-center gap-3">
               <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white border border-stone-200 rounded-full shadow-sm text-xs font-medium text-stone-500">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> System Online
               </div>
               <Button variant="ghost" size="icon" className="relative rounded-full text-stone-400 hover:text-amber-800">
                   <Bell className="h-5 w-5"/>
                   <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
               </Button>
            </div>
        </header>

        {/* CONTENT AREA */}
        <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. ORIGINAL ADMIN VERIFICATION (Queue) */}
            {activeTab === "verification" && (
                <VerificationTab 
                  pendingStudents={pendingStudents} 
                  currentPage={currentPage}
                  totalUnverified={totalUnverified}
                  onVerify={updateOnVerify}
                  onCancel={updateOnCancel}
                  onSearch={searchStudentById}
                  setCurrentPage={onPageChange}
                />
            )}

            {/* 2. MERGED STAFF VERIFICATION (Detailed Review) */}
            {activeTab === "graduate-review" && (
                <GraduateReviewTab 
                    staffUser={staffUser}
                    selectedStudent={selectedReviewStudent}
                    setSelectedStudent={setSelectedReviewStudent}
                />
            )}

            {/* 3. MERGED NOTES */}
            {activeTab === 'notes' && <NotesTab />}

            {/* 4. OTHER ADMIN TABS */}
            {activeTab === 'masterlist' && <MasterlistTab {...masterlistProps}/>}
            {activeTab === 'slots' && <SchedulesTab schedules={schedules} fetchSchedules={fetchSchedules} />}
            {activeTab === "profile" && <ProfileTab user={staffUser} setUser={setStaffUser} />}
        </div>
      </main>
    </div>
  );
}