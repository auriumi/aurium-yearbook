"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Search, BookOpen, GraduationCap, FileText, MapPin, Phone, Mail, Clock, Filter, User, Image as ImageIcon, X, Home, Building2, ListFilter, ChevronLeft, ChevronRight, Loader2, Download, Trash2, AlertTriangle, Send, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMasterlist } from "@/hooks/useMasterlist";

type MasterlistTabProps = ReturnType<typeof useMasterlist>;
const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL || "";

export function MasterlistTab(props: MasterlistTabProps) {
  const {
    searchQuery, setSearchQuery, selectedStudent, setSelectedStudent,
    activeDeptFilter, setActiveDeptFilter, 
    activeCourseFilter, setActiveCourseFilter,
    activeStatusFilter, setActiveStatusFilter,  
    activeMajorFilter, setActiveMajorFilter,
    currentPage, setCurrentPage, students, totalResults, isLoading, ITEMS_PER_PAGE,
    handleSearchClick, handleLoadClick, handleSearchKeyDown,
    DEPARTMENT_ORDER, STATUS_STEPS, ACADEMIC_CONFIG,
  } = props as any; 

  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  
  // Deletion States
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Email & OTP States
  const [showEditEmailDialog, setShowEditEmailDialog] = useState(false);
  const [editPersonalEmail, setEditPersonalEmail] = useState("");
  const [editSchoolEmail, setEditSchoolEmail] = useState("");
  const [isUpdatingEmails, setIsUpdatingEmails] = useState(false);
  
  // UX update: New states for the OTP Confirmation workflow
  const [otpConfirmTarget, setOtpConfirmTarget] = useState<'personal' | 'school' | null>(null);
  const [isResendingOtp, setIsResendingOtp] = useState(false);

  const getObjectKey = (url: string): string => {
    if (typeof url !== 'string') return "";
      const findStr = `/aurium/`;
      const idx = url.indexOf(findStr);
      if (idx === -1) return "";
      return "https://static.auriumi.cloud/" + url.substring(idx + findStr.length);
  }

  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE) || 1;

  const getPageNumbers = () => {
      const pages = [];
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + 4);
      if (end - start < 4) start = Math.max(1, end - 4);
      for (let i = start; i <= end; i++) pages.push(i);
      return pages;
  };

  const formatDate = (dateString: string) => {
      if (!dateString || dateString === "N/A") return "N/A";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; 
      return date.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
  };

  const handleDeleteRecord = async () => {
      if (!selectedStudent) return;
      
      setIsDeleting(true);
      try {
          const res = await fetch(`/api/student/${selectedStudent.id}`, {
              method: 'DELETE',
          });

          if (!res.ok) throw new Error("Failed to delete record");

          toast.success("Student record has been successfully deleted.");
          setShowDeleteConfirm(false);
          setSelectedStudent(null);
          
          handleLoadClick();
      } catch (error) {
          console.error("Deletion error:", error);
          toast.error("Unable to delete the record at this time. Please try again.");
      } finally {
          setIsDeleting(false);
      }
  };

  const openEmailManager = () => {
      setEditPersonalEmail(selectedStudent?.personal_email || "");
      setEditSchoolEmail(selectedStudent?.school_email || "");
      setShowEditEmailDialog(true);
  };

  const isPersonalEmailChanged = selectedStudent && editPersonalEmail !== selectedStudent.personal_email;
  const isSchoolEmailChanged = selectedStudent && editSchoolEmail !== selectedStudent.school_email;
  const hasUnsavedEmailChanges = isPersonalEmailChanged || isSchoolEmailChanged;

  const isValidEmailFormat = (emailStr: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  const isPersonalEmailValid = isValidEmailFormat(editPersonalEmail);
  const isSchoolEmailValid = editSchoolEmail.trim() === "" || isValidEmailFormat(editSchoolEmail);

  const isSaveDisabled = !hasUnsavedEmailChanges || isUpdatingEmails || !isPersonalEmailValid || !isSchoolEmailValid;

  const handleUpdateEmails = async () => {
      if (!selectedStudent || isSaveDisabled) return;
      
      setIsUpdatingEmails(true);
      try {
          const payload: any = {};
          if (isPersonalEmailChanged) payload.personal_email = editPersonalEmail;
          if (isSchoolEmailChanged) payload.school_email = editSchoolEmail;

          const res = await fetch(`/api/student/${selectedStudent.id}/email`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });

          if (!res.ok) throw new Error("Failed to update emails");

          toast.success("Email records updated successfully.");
          
          setSelectedStudent({
              ...selectedStudent,
              ...(isPersonalEmailChanged && { personal_email: editPersonalEmail }),
              ...(isSchoolEmailChanged && { school_email: editSchoolEmail })
          });
          
          handleLoadClick(); 
      } catch (error) {
          console.error("Email update error:", error);
          toast.error("Unable to save email changes. Please check your connection.");
      } finally {
          setIsUpdatingEmails(false);
      }
  };

  // Confirms the action and explicitly shows the target email before firing the API
  const confirmResendOtp = async () => {
      if (!selectedStudent || !otpConfirmTarget) return;
      
      setIsResendingOtp(true);
      try {
          const res = await fetch(`${baseUrl}/api/admin/masterlist/reset/${selectedStudent.student_number}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ target: otpConfirmTarget }),
              credentials: 'include'
          });

          if (!res.ok) {
            const body = await res.json();
            throw new Error(body.reason);
          }

          toast.success(`OTP has been successfully generated and sent to their ${otpConfirmTarget} email.`);
          
          // Close the confirmation dialog on success
          setOtpConfirmTarget(null);
      } catch (error) {
          console.error("OTP resend error:", error);
          toast.error("Failed to send the verification code. The mail server might be busy or down.");
      } finally {
          setIsResendingOtp(false);
      }
  };

  const InfoField = ({ label, value, icon: Icon, fullWidth = false }: any) => (
    <div className={`flex flex-col space-y-1 ${fullWidth ? "col-span-2" : "col-span-1"}`}>
        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
            {Icon && <Icon size={10} />} {label}
        </span>
        <div className="p-2.5 bg-stone-50 rounded-md border border-stone-200 text-sm font-semibold text-stone-800 break-words leading-snug">
            {value || <span className="text-stone-300 italic">N/A</span>}
        </div>
    </div>
  );

  const selectedDeptConfig = ACADEMIC_CONFIG.find((d: any) => d.name === activeDeptFilter);
  const availableCoursesConfig = selectedDeptConfig ? selectedDeptConfig.courses : [];
  const availableCourses = availableCoursesConfig.map((c: any) => c.name);
  
  const selectedCourseConfig = availableCoursesConfig.find((c: any) => c.name === activeCourseFilter);
  const availableMajors = selectedCourseConfig?.majors || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 w-full overflow-x-hidden">
        
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-amber-600"/> Masterlist Database
                    </h2>
                    <p className="text-sm text-stone-500 mt-1">
                        Secure repository of verified graduates. Monitoring all students from Registration to Final Verification.
                    </p>
                </div>
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200 px-4 py-1.5 text-sm h-fit">
                    {isLoading ? "Fetching..." : `${totalResults} Records Found`}
                </Badge>
            </div>
            
            <div className="flex flex-col xl:flex-row gap-4 justify-between items-center bg-stone-50/50 p-2 rounded-xl border border-stone-100 min-w-0">
                
                <div className="flex gap-2 w-full xl:w-[25%] min-w-0">
                    <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                        <Input 
                            placeholder="Search by ID Number..." 
                            className="pl-10 h-11 bg-white border-stone-200 focus:ring-amber-500/20 focus:border-amber-500 shadow-sm w-full" 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                        />
                    </div>
                    <Button onClick={handleSearchClick} className="h-11 px-5 bg-stone-800 hover:bg-stone-900 shadow-sm shrink-0">
                        Search
                    </Button>
                </div>

                <div className="hidden xl:block text-stone-300 font-medium text-sm px-1 shrink-0">OR</div>

                <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-[70%] justify-end min-w-0">
                    
                    <div className="w-full sm:w-[130px] shrink-0">
                        <Select value={activeStatusFilter} onValueChange={setActiveStatusFilter}>
                            <SelectTrigger className="h-11 w-full bg-white border-stone-200 shadow-sm">
                                <div className="flex items-center gap-2 min-w-0 w-full text-stone-600">
                                    <ListFilter size={16} className="shrink-0" />
                                    <div className="flex-1 min-w-0 text-left [&>span]:block [&>span]:truncate">
                                        <SelectValue placeholder="Status" />
                                    </div>
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Statuses</SelectItem>
                                {STATUS_STEPS.map((step: any) => (
                                    <SelectItem key={step.id} value={step.id.toString()}>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${step.color}`}></div>
                                            {step.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full sm:flex-1 min-w-0">
                        <Select value={activeDeptFilter} onValueChange={(val) => { setActiveDeptFilter(val); setActiveCourseFilter("ALL"); setActiveMajorFilter("ALL"); }}>
                            <SelectTrigger className="h-11 w-full bg-white border-stone-200 shadow-sm">
                                <div className="flex items-center gap-2 min-w-0 w-full text-stone-600">
                                    <Filter size={16} className="shrink-0" />
                                    <div className="flex-1 min-w-0 text-left [&>span]:block [&>span]:truncate pr-1">
                                        <SelectValue placeholder="Department" />
                                    </div>
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Departments</SelectItem>
                                {DEPARTMENT_ORDER.map((dept: any) => (
                                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full sm:flex-1 min-w-0">
                        <Select value={activeCourseFilter} onValueChange={(val) => { setActiveCourseFilter(val); setActiveMajorFilter("ALL"); }} disabled={activeDeptFilter === "ALL"}>
                            <SelectTrigger className="h-11 w-full bg-white border-stone-200 shadow-sm">
                                <div className="flex items-center gap-2 min-w-0 w-full text-stone-600">
                                    <GraduationCap size={16} className="shrink-0" />
                                    <div className="flex-1 min-w-0 text-left [&>span]:block [&>span]:truncate pr-1">
                                        <SelectValue placeholder={activeDeptFilter === "ALL" ? "Select Dept First" : "Course"} />
                                    </div>
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Courses</SelectItem>
                                {availableCourses.map((course: string) => (
                                    <SelectItem key={course} value={course}>{course}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full sm:flex-1 min-w-0">
                        <Select value={activeMajorFilter} onValueChange={setActiveMajorFilter} disabled={activeCourseFilter === "ALL" || availableMajors.length === 0}>
                            <SelectTrigger className="h-11 w-full bg-white border-stone-200 shadow-sm">
                                <div className="flex items-center gap-2 min-w-0 w-full text-stone-600">
                                    <BookOpen size={16} className="shrink-0" />
                                    <div className="flex-1 min-w-0 text-left [&>span]:block [&>span]:truncate pr-1">
                                        <SelectValue placeholder={activeCourseFilter === "ALL" ? "Select Course First" : availableMajors.length === 0 ? "N/A" : "Major"} />
                                    </div>
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Majors</SelectItem>
                                {availableMajors.map((major: string) => (
                                    <SelectItem key={major} value={major}>{major}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={handleLoadClick} className="h-11 px-5 bg-amber-600 hover:bg-amber-700 shadow-sm text-white font-bold tracking-wide w-full sm:w-auto shrink-0">
                        <Download size={16} className="mr-2 shrink-0"/> LOAD
                    </Button>
                </div>

            </div>
        </div>

        <div className="space-y-4 pb-10 min-h-[500px]">
            {isLoading ? (
                <div className="text-center py-24 text-stone-400 bg-white rounded-2xl border border-dashed border-stone-200 flex flex-col items-center shadow-sm">
                    <Loader2 className="h-8 w-8 mb-4 text-amber-500 animate-spin"/>
                    <p className="text-sm font-medium">Querying database...</p>
                </div>
            ) : students.length === 0 ? (
                <div className="text-center py-24 text-stone-400 bg-white rounded-2xl border border-dashed border-stone-200 flex flex-col items-center shadow-sm">
                    <Search className="h-12 w-12 mb-4 opacity-20"/>
                    <p className="text-lg font-medium text-stone-500">No records found</p>
                    <p className="text-sm">Try adjusting your filters and click Load or Search.</p>
                </div>
            ) : (
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[300px] content-start">
                        {students.map((student: any) => {
                            const statusInfo = STATUS_STEPS.find((s: any) => s.label === student.studentAuth.status);
                            return (
                                <div 
                                    key={student.id} 
                                    onClick={() => setSelectedStudent(student)} 
                                    className="group bg-[#FDFBF7] p-4 rounded-xl border border-stone-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden h-fit"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    
                                    <div className="relative z-10 w-full pl-1 mb-3">
                                        <div className="flex justify-between items-start">
                                            <p className="font-bold text-stone-800 group-hover:text-amber-800 transition-colors text-sm truncate pr-2">
                                                {student.last_name}, {student.first_name} {student.mid_name?.charAt(0) ? `${student.mid_name.charAt(0)}.` : ""} {student.suffix}
                                            </p>
                                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${statusInfo?.color || 'bg-stone-400'} shadow-sm`} title={statusInfo?.label || 'Unknown'}></div>
                                        </div>
                                        <p className="text-[11px] font-mono text-stone-500 mt-1">{student.student_number}</p>
                                    </div>

                                    <div className="relative z-10 w-full pl-1 pt-3 border-t border-stone-200 flex justify-between items-center gap-2">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[9px] font-bold text-stone-400 truncate uppercase">{student.course}</p>
                                        </div>
                                        <span className="text-[9px] text-stone-500 font-bold uppercase tracking-wide bg-stone-100 px-2 py-1 rounded-md shrink-0">{statusInfo?.label || 'Unknown'}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-stone-100">
                            <span className="text-xs text-stone-400 font-medium hidden sm:block">
                                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalResults)} of {totalResults}
                            </span>

                            <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                                <Button 
                                    variant="outline" size="icon" className="h-8 w-8 rounded-lg shrink-0" 
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                
                                <div className="flex gap-1 overflow-x-auto max-w-[200px] no-scrollbar">
                                    {getPageNumbers().map(pageNum => (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? "default" : "outline"}
                                            className={`h-8 w-8 text-xs rounded-lg shrink-0 ${currentPage === pageNum ? 'bg-amber-600 hover:bg-amber-700 shadow-sm' : 'text-stone-500'}`}
                                            onClick={() => setCurrentPage(pageNum)}
                                        >
                                            {pageNum}
                                        </Button>
                                    ))}
                                </div>

                                <Button 
                                    variant="outline" size="icon" className="h-8 w-8 rounded-lg shrink-0"
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>

        <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
            <DialogContent className="max-w-[95vw] md:max-w-7xl h-[92vh] p-0 overflow-hidden rounded-xl border-0 shadow-2xl bg-white flex flex-col md:flex-row [&>button]:hidden">
                <div className="sr-only">
                    <DialogHeader>
                        <DialogTitle>Student Profile: {selectedStudent?.last_name}</DialogTitle>
                        <DialogDescription>Detailed view of student information.</DialogDescription>
                    </DialogHeader>
                </div>

                <button 
                    onClick={() => setSelectedStudent(null)} 
                    className="absolute top-4 right-4 z-50 p-2 bg-white/80 hover:bg-stone-100 backdrop-blur-sm rounded-full text-stone-500 border border-stone-200 transition-all shadow-sm"
                >
                    <X size={20}/>
                </button>

                {selectedStudent && (
                    <>
                        <div className="w-full md:w-[360px] bg-stone-100 p-6 flex flex-col items-center border-r border-stone-200 overflow-y-auto shrink-0 relative">
                            <div className="text-center w-full mb-6 mt-8">
                                <h2 className="text-2xl font-black text-stone-900 uppercase leading-none tracking-tight">
                                    {selectedStudent.last_name}, <br/> 
                                    {selectedStudent.first_name} {selectedStudent.mid_name?.charAt(0) ? `${selectedStudent.mid_name.charAt(0)}.` : ""}
                                    {selectedStudent.suffix && <span className="ml-1 text-stone-600">{selectedStudent.suffix}</span>}
                                </h2>
                                <p className="text-amber-700 font-serif italic text-lg mt-1">"{selectedStudent.nickname}"</p>
                            </div>

                            <div className="w-full space-y-6">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold uppercase text-stone-400 pl-1 flex items-center gap-1">
                                        <ImageIcon size={10} /> Graduation Photo
                                    </span>
                                    <div 
                                        className="w-full aspect-[4/5] bg-white p-2 shadow-sm border border-stone-200 rounded-lg cursor-pointer hover:border-amber-400 transition-colors group"
                                        onClick={() => selectedStudent.photo_grad && setEnlargedImage(selectedStudent.photo_grad)}
                                    >
                                        {selectedStudent.photo_grad ? (
                                            <img src={selectedStudent.photo_grad} className="w-full h-full object-cover rounded-sm group-hover:opacity-80 transition-opacity" alt="Graduation" />
                                        ) : (
                                            <div className="w-full h-full bg-stone-50 flex flex-col items-center justify-center text-stone-300">
                                                <ImageIcon size={24} className="opacity-20 mb-1"/>
                                                <span className="text-[10px] italic">Not Uploaded</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold uppercase text-stone-400 pl-1 flex items-center gap-1">
                                        <ImageIcon size={10} /> Creative Photo
                                    </span>
                                    <div 
                                        className="w-full aspect-[4/5] bg-white p-2 shadow-sm border border-stone-200 rounded-lg cursor-pointer hover:border-amber-400 transition-colors group"
                                        onClick={() => selectedStudent.photo_creative && setEnlargedImage(selectedStudent.photo_creative)}
                                    >
                                        {selectedStudent.photo_creative ? (
                                            <img src={selectedStudent.photo_creative} className="w-full h-full object-cover rounded-sm group-hover:opacity-80 transition-opacity" alt="Creative" />
                                        ) : (
                                            <div className="w-full h-full bg-stone-50 flex flex-col items-center justify-center text-stone-300">
                                                <ImageIcon size={24} className="opacity-20 mb-1"/>
                                                <span className="text-[10px] italic">Not Uploaded</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold uppercase text-stone-400 pl-1 flex items-center gap-1">
                                        <ImageIcon size={10} /> Reference (Pre-Reg)
                                    </span>
                                    <div 
                                        className="w-full aspect-[4/5] bg-white p-2 shadow-sm border border-stone-200 rounded-lg cursor-pointer hover:border-amber-400 transition-colors group"
                                        onClick={() => {
                                            const refUrl = selectedStudent.studentDetail?.photo_url ? getObjectKey(selectedStudent.studentDetail.photo_url) : undefined;
                                            if (refUrl) setEnlargedImage(refUrl);
                                        }}
                                    >
                                        {selectedStudent.studentDetail?.photo_url ? (
                                            <img src={getObjectKey(selectedStudent.studentDetail.photo_url)} className="w-full h-full object-cover rounded-sm group-hover:opacity-80 transition-opacity" alt="Reference" />
                                        ) : (
                                            <div className="w-full h-full bg-stone-50 flex flex-col items-center justify-center text-stone-300">
                                                <ImageIcon size={24} className="opacity-20 mb-1"/>
                                                <span className="text-[10px] italic">Not Uploaded</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-auto pt-10 w-full">
                                <Button 
                                    variant="outline" 
                                    className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 font-semibold transition-colors"
                                    onClick={() => setShowDeleteConfirm(true)}
                                >
                                    <Trash2 size={16} className="mr-2" />
                                    Remove Student Record
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 bg-white p-8 md:p-10 overflow-y-auto">
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-100">
                                    <GraduationCap className="text-amber-600 w-5 h-5" />
                                    <h3 className="text-sm font-bold text-stone-800 uppercase tracking-widest">Academic Information</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <InfoField label="Department / School" value={selectedStudent.department} icon={Building2} fullWidth />
                                    </div>
                                    <InfoField label="Program / Course" value={selectedStudent.course} />
                                    <InfoField label="Major" value={selectedStudent.major} />
                                    <div className="col-span-2">
                                        <InfoField label="Thesis / Capstone Title" value={`"${selectedStudent.thesis_title}"`} icon={FileText} fullWidth />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                <div>
                                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-100">
                                        <User className="text-stone-400 w-5 h-5" />
                                        <h3 className="text-sm font-bold text-stone-800 uppercase tracking-widest">Personal & Family</h3>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <InfoField label="Date of Birth" value={formatDate(selectedStudent.studentDetail?.birth_date)} />
                                        <InfoField label="Father's Name" value={selectedStudent.studentDetail?.fathers_name} />
                                        <InfoField label="Mother's Name" value={selectedStudent.studentDetail?.mothers_name} />
                                        <InfoField label="Guardian" value={selectedStudent.studentDetail?.guardians_name} />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-100">
                                        <MapPin className="text-stone-400 w-5 h-5" />
                                        <h3 className="text-sm font-bold text-stone-800 uppercase tracking-widest">Contact Details</h3>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <InfoField label="Home Address" value={selectedStudent.studentDetail?.province} icon={Home} />
                                        <InfoField label="Mobile Number" value={selectedStudent.studentDetail?.contact_num} icon={Phone} />
                                        <InfoField label="Personal Email" value={selectedStudent.personal_email} icon={Mail} />
                                        <InfoField label="School Email" value={selectedStudent.school_email} icon={Mail} />
                                    </div>
                                    
                                    <div className="mt-4">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={openEmailManager} 
                                            className="w-full text-stone-600 border-stone-200 hover:bg-stone-50 transition-colors"
                                        >
                                            <Mail className="w-4 h-4 mr-2" /> Manage Emails & OTP
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-64 bg-stone-50 border-l border-stone-200 p-6 overflow-y-auto shrink-0 pt-16 md:pt-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-stone-800 text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Clock size={14} className="text-amber-600" /> Status History
                                </h3>
                            </div>
                            
                            <div className="space-y-0 relative pl-2">
                                {STATUS_STEPS.map((step: any, index: number) => {
                                    const studentStatusItem = STATUS_STEPS.find((s: any) => s.label === selectedStudent.studentAuth?.status);
                                    const currentStatusId = studentStatusItem ? studentStatusItem.id : 1;
                                    const isDone = step.id <= currentStatusId;
                                    const isCurrent = step.id === currentStatusId;
                                    
                                    return (
                                        <div key={step.id} className="flex gap-3 relative pb-8 last:pb-0 group">
                                            {index < STATUS_STEPS.length - 1 && (
                                                <div className={`absolute left-[7px] top-5 bottom-0 w-[2px] ${isDone ? 'bg-amber-500' : 'bg-stone-200'}`}></div>
                                            )}
                                            
                                            <div className={`
                                                z-10 w-4 h-4 rounded-full flex items-center justify-center border-2 shrink-0 transition-all duration-300 mt-1
                                                ${isDone ? 'bg-amber-50 border-amber-600' : 'bg-white border-stone-300'}
                                                ${isCurrent ? 'ring-2 ring-amber-200 scale-110' : ''}
                                            `}>
                                                {isDone && <div className="w-1.5 h-1.5 bg-amber-600 rounded-full"/>}
                                            </div>
                                            
                                            <div>
                                                <span className={`text-xs font-bold block leading-tight ${isDone ? 'text-stone-800' : 'text-stone-400'}`}>
                                                    {step.label}
                                                </span>
                                                {isCurrent && (
                                                    <span className="text-[9px] text-amber-700 font-bold uppercase tracking-wider mt-1 block bg-amber-100 px-1.5 py-0.5 rounded w-fit">
                                                        Current
                                                    </span>
                                                )}
                                                {isDone && <span className="text-[9px] text-stone-400 block mt-0.5">Completed</span>}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>

        {/* MANAGE EMAILS & OTP DIALOG */}
        <Dialog open={showEditEmailDialog} onOpenChange={setShowEditEmailDialog}>
            <DialogContent className="max-w-md p-6 bg-white rounded-xl shadow-2xl border-stone-100">
                <DialogHeader className="mb-2">
                    <DialogTitle className="text-xl font-bold text-stone-900">Manage Contact Emails</DialogTitle>
                    <DialogDescription className="text-stone-500 text-sm">
                        Update the student's email addresses or resend the verification OTP.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Personal Email</label>
                            {isPersonalEmailChanged && isPersonalEmailValid && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Valid Change</Badge>}
                        </div>
                        <Input 
                            type="email"
                            value={editPersonalEmail} 
                            onChange={(e) => setEditPersonalEmail(e.target.value)}
                            className={`transition-colors bg-stone-50 ${!isPersonalEmailValid && editPersonalEmail.length > 0 ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : isPersonalEmailChanged && isPersonalEmailValid ? 'border-green-400 focus:border-green-500 focus:ring-green-500/20' : 'border-stone-200 focus:border-amber-500 focus:ring-amber-500/20'}`}
                        />
                        {!isPersonalEmailValid && editPersonalEmail.length > 0 && <p className="text-[10px] text-red-500 font-medium">Please enter a valid email format.</p>}
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">School Email</label>
                            {isSchoolEmailChanged && isSchoolEmailValid && editSchoolEmail !== "" && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Valid Change</Badge>}
                        </div>
                        <Input 
                            type="email"
                            value={editSchoolEmail} 
                            onChange={(e) => setEditSchoolEmail(e.target.value)}
                            className={`transition-colors bg-stone-50 ${!isSchoolEmailValid && editSchoolEmail.length > 0 ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : isSchoolEmailChanged && isSchoolEmailValid && editSchoolEmail !== "" ? 'border-green-400 focus:border-green-500 focus:ring-green-500/20' : 'border-stone-200 focus:border-amber-500 focus:ring-amber-500/20'}`}
                        />
                        {!isSchoolEmailValid && editSchoolEmail.length > 0 && <p className="text-[10px] text-red-500 font-medium">Please enter a valid email format or leave blank.</p>}
                    </div>
                </div>

                <div className="flex flex-col gap-3 mt-4">
                    <Button 
                        onClick={handleUpdateEmails} 
                        disabled={true} //TODO: make it usable when ready
                        className="w-full bg-stone-800 hover:bg-stone-900 text-white shadow-sm disabled:opacity-50"
                    >
                        {isUpdatingEmails ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Save Email Changes (WIP)
                    </Button>
                    
                    <div className="relative w-full pt-4 border-t border-stone-100">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2">Resend Verification Code</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Button 
                                onClick={() => setOtpConfirmTarget('personal')} 
                                disabled={hasUnsavedEmailChanges || !isPersonalEmailValid} 
                                variant="outline" 
                                className="w-full border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 disabled:opacity-50"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                To Personal
                            </Button>
                            <Button 
                                onClick={() => setOtpConfirmTarget('school')} 
                                disabled={hasUnsavedEmailChanges || !editSchoolEmail || !isSchoolEmailValid} 
                                variant="outline" 
                                className="w-full border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 disabled:opacity-50"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                To School
                            </Button>
                        </div>
                        {hasUnsavedEmailChanges && (
                            <p className="text-[10px] text-red-500 text-center mt-2 absolute -bottom-5 w-full">
                                *Please save your email changes before resending the OTP.
                            </p>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>

        {/* OTP RESEND CONFIRMATION DIALOG */}
        <Dialog open={!!otpConfirmTarget} onOpenChange={(open) => !open && setOtpConfirmTarget(null)}>
            <DialogContent className="max-w-md p-6 bg-white rounded-xl shadow-2xl border-amber-100">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-2">
                        <Send size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-stone-900">Confirm OTP Resend</h3>
                    <p className="text-sm text-stone-500 leading-relaxed">
                        Are you sure you want to send a new verification code to the student's <strong className="text-stone-800">{otpConfirmTarget} email</strong>?
                        <span className="text-amber-700 font-medium mt-2 block break-all">
                            {otpConfirmTarget === 'personal' ? selectedStudent?.personal_email : selectedStudent?.school_email}
                        </span>
                    </p>
                    <div className="flex gap-3 w-full mt-4">
                        <Button 
                            variant="outline" 
                            className="flex-1 border-stone-200 text-stone-600 hover:bg-stone-50"
                            onClick={() => setOtpConfirmTarget(null)}
                            disabled={isResendingOtp}
                        >
                            Cancel
                        </Button>
                        <Button 
                            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                            onClick={confirmResendOtp}
                            disabled={isResendingOtp}
                        >
                            {isResendingOtp ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                            Yes, Send OTP
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>

        {/* SECURE DELETION CONFIRMATION DIALOG */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <DialogContent className="max-w-md p-6 bg-white rounded-xl shadow-2xl border-red-100">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-stone-900">Delete Student Record?</h3>
                    <p className="text-sm text-stone-500 leading-relaxed">
                        This action cannot be undone. Removing this record will allow the student to register again using their correct email address and information.
                    </p>
                    <div className="flex gap-3 w-full mt-4">
                        <Button 
                            variant="outline" 
                            className="flex-1 border-stone-200 text-stone-600 hover:bg-stone-50"
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button 
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-sm"
                            onClick={handleDeleteRecord}
                            disabled={isDeleting}
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                            Yes, Delete Record
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>

        {/* IMAGE LIGHTBOX MODAL */}
        <Dialog open={!!enlargedImage} onOpenChange={(open) => !open && setEnlargedImage(null)}>
            <DialogContent className="max-w-4xl p-1 bg-transparent border-0 shadow-none flex justify-center items-center [&>button]:hidden">
                <div className="relative">
                    <button 
                        onClick={() => setEnlargedImage(null)} 
                        className="absolute -top-4 -right-4 z-50 p-2 bg-white hover:bg-stone-100 rounded-full text-stone-600 shadow-xl border border-stone-200 transition-all"
                    >
                        <X size={20}/>
                    </button>
                    {enlargedImage && (
                        <img 
                            src={enlargedImage} 
                            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl bg-black/5 backdrop-blur-sm border border-white/20" 
                            alt="Enlarged view" 
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>

    </div>
  );
}