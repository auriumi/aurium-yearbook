"use client";
const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL || "";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Modular Imports
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminDashboardHeader } from "@/components/layout/AdminDashboardHeader";
import { VerificationTab } from "@/components/admin/tabs/VerificationTab"; // Original Admin Tab
import { ProfileTab } from "@/components/admin/tabs/ProfileTab";
import { MasterlistTab } from "@/components/admin/tabs/MasterlistTab";
import { SchedulesTab } from "@/components/admin/tabs/SchedulesTab";
import { RolesTab } from "@/components/admin/tabs/RolesTab";
import { ImageManagementTab } from "@/components/admin/tabs/ImageManagementTab";
import { ImageApprovalsTab } from "@/components/admin/tabs/ImageApprovalsTab";

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

  const [activeTab, setActiveTab] = useState("masterlist");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // notification deep-link target for the Image Approvals tab
  const [focusedApprovalId, setFocusedApprovalId] = useState<number | null>(null);

  // Data States
  const [pendingStudents, setPendingStudents] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUnverified, setTotalUnverified] = useState(0);

  // The cache does not affect rendering, so keep it outside React state.
  const studentCache = useRef<{[page: number]: any[]}>({});
  const masterlistProps = useMasterlist();

  //Schedules
  const { schedules, fetchSchedules } = useSchedules();

  // State specific to the Graduate Review Tab (Moved from Staff)
  // This handles the "Select a student to view details" feature
  const [selectedReviewStudent, setSelectedReviewStudent] = useState<any>(null);

  const [staffUser, setStaffUser] = useState<Admin | null>(null);

  // Derived role — defaults to MEMBER until the profile loads
  const userRole = staffUser?.role ? String(staffUser.role).toUpperCase() : 'MEMBER';
  const isImageApprover = userRole === 'ADMINISTRATOR' || (userRole === 'MODERATOR' && !!staffUser?.can_approve_images);

  // navigate to a tab (optionally focusing a request) — used by the notification bell
  const handleNavigate = useCallback((tab: string, imageId?: number | null) => {
    setActiveTab(tab);
    setFocusedApprovalId(imageId ?? null);
  }, []);

  useEffect(() => {
    let isActive = true;

    adminService.getStaffProfile()
      .then((res) => {
        if (!isActive) return;
        if (!res.success) {
          toast.error(res.reason);
          return;
        }

        setStaffUser(res.data);
      })
      .catch((error) => {
        console.error("Error loading admin details:", error);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const loadStudents = useCallback(async (page: number, forceRefresh = false) => {
    const cachedStudents = studentCache.current[page];

    if (cachedStudents && !forceRefresh) {
      setPendingStudents(cachedStudents);
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
        studentCache.current[page] = students.data.student_list;
    } catch (error) {
        console.error("Error loading students:", error);
    }
  }, []);

  const onPageChange = useCallback((page: number) => {
    setCurrentPage(page);
    loadStudents(page);
  }, [loadStudents]);

  const searchStudentById = useCallback(async (student_number: number) => {
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
  }, []);

  useEffect(() => {
    loadStudents(currentPage);
  }, [loadStudents, currentPage]);

  const updateOnVerify = useCallback(async (studentId: number) => {
    const res = await adminService.handleVerify(studentId);

    if (res) {
      delete studentCache.current[currentPage];
      loadStudents(currentPage, true);

      toast.success("Student succesfully verified!");
      return;
    }
    toast.error("Something went wrong!");
  }, [currentPage, loadStudents]);

  const updateOnCancel = useCallback(async (studentId: number) => {
    const res = await adminService.handleCancel(studentId);
    if (res) {
      delete studentCache.current[currentPage];
      loadStudents(currentPage, true);

      toast.success("Student succesfully rejected!")
      return;
    }
    toast.error("Something went wrong!");
  }, [currentPage, loadStudents]);

  const onLogout = useCallback(async () => {
    const res = await fetch(`${baseUrl}/api/auth/logout`, {
      credentials: 'include'
    });
    if (res.ok) router.push('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-stone-50 flex font-sans relative overflow-x-hidden">
      
      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
         <div className="fixed inset-0 z-50 lg:hidden bg-black/80" onClick={() => setIsMobileMenuOpen(false)}>
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

      <main className="w-full min-w-0 flex-1 p-4 md:px-8 md:pt-4 lg:ml-72 lg:w-[calc(100vw-18rem)] min-h-screen bg-[#FDFBF7] overflow-x-hidden">
        
        <AdminDashboardHeader activeTab={activeTab} onOpenMenu={() => setIsMobileMenuOpen(true)} onNavigate={handleNavigate} />

        {/* CONTENT AREA */}
        <div className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ${activeTab !== 'profile' ? 'w-full max-w-7xl mx-auto' : ''}`}>
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
            {activeTab === 'masterlist' && <MasterlistTab {...masterlistProps} userRole={userRole} />}
            {activeTab === 'images' && <ImageManagementTab />}
            {activeTab === 'images-approvals' && (
              <ImageApprovalsTab
                isApprover={isImageApprover}
                focusImageId={focusedApprovalId}
                onConsumeFocus={() => setFocusedApprovalId(null)}
              />
            )}
            {activeTab === 'slots' && <SchedulesTab schedules={schedules} fetchSchedules={fetchSchedules} userRole={userRole} />}
            {activeTab === "profile" && <ProfileTab user={staffUser} setUser={setStaffUser} onLogout={onLogout} />}

            {/* 5. ROLE MANAGEMENT — ADMINISTRATOR only */}
            {activeTab === 'roles' && <RolesTab />}
        </div>
      </main>
    </div>
  );
}
