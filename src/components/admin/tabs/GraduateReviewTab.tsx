"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Search, Edit3, Save, Clock, MapPin, Home, Phone, Mail, GraduationCap, User, Image as ImageIcon, Upload, FolderOpen, X, CheckCircle2, BookOpen, Building2, ChevronLeft, ChevronRight, Loader2, Camera, FileText, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; 
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import toast from "react-hot-toast";

import { useGraduateReview } from "@/hooks/useGraduateReview"; 
import * as adminService from "@/app/admin/adminService";

interface VerificationTabProps {
  staffUser: any;
  selectedStudent: any;
  setSelectedStudent: (student: any) => void;
}

interface InfoFieldProps {
  label: string;
  value?: React.ReactNode;
  icon?: LucideIcon;
  fullWidth?: boolean;
}

function InfoField({ label, value, icon: Icon, fullWidth = false }: InfoFieldProps) {
  return (
    <div className={`flex flex-col space-y-1.5 ${fullWidth ? "col-span-2" : "col-span-1"}`}>
      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
        {Icon && <Icon size={12} />} {label}
      </span>
      <div className="px-3 py-2.5 bg-white rounded-lg border border-stone-200 text-xs font-semibold text-stone-800 break-words leading-tight shadow-sm min-h-[38px] flex items-center">
        {value || <span className="text-stone-300 italic">N/A</span>}
      </div>
    </div>
  );
}

export function GraduateReviewTab({ staffUser, selectedStudent, setSelectedStudent }: VerificationTabProps) {

  const {
    searchQuery, setSearchQuery,
    currentPage, setCurrentPage,
    handleSearchClick, handleSearchKeyDown, handleDiscard,
    students, totalResults, isLoading, ITEMS_PER_PAGE,
    isEditing, setIsEditing,
    handleSaveEdit, handleFinalize,
  } = useGraduateReview(staffUser, selectedStudent, setSelectedStudent);

  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE) || 1;
  const getPageNumbers = () => {
      const pages = [];
      let start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + 4);
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

  // Helper function to combine Prefix, Name, and Suffix dynamically
  const formatParentName = (prefix?: string, name?: string, suffix?: string) => {
      if (!name || name === "N/A" || name.trim() === "") return "N/A";
      const p = prefix && prefix !== "N/A" ? `${prefix} ` : "";
      const s = suffix && suffix !== "N/A" ? ` ${suffix}` : "";
      return `${p}${name}${s}`.trim();
  };

  const gradPhotoRef = useRef<HTMLInputElement>(null);
  const creativePhotoRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [showInfoSaveConfirm, setShowInfoSaveConfirm] = useState(false);
  const [showPhotoSaveConfirm, setShowPhotoSaveConfirm] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [pendingGraduateAction, setPendingGraduateAction] = useState<"discard" | "submit" | null>(null);
  const [isGraduateActionSubmitting, setIsGraduateActionSubmitting] = useState(false);

  const selectedGraduateName = selectedStudent
    ? [selectedStudent.last_name || selectedStudent.lname, selectedStudent.first_name || selectedStudent.fname].filter(Boolean).join(", ")
    : "";

  const graduateActionCopy = pendingGraduateAction === "discard"
    ? {
        title: "Discard Graduate Entry?",
        description: "This will remove this student from the graduate verification queue. Please confirm only if this entry should not proceed.",
        confirmLabel: "Yes, Discard",
        confirmClassName: "bg-red-600 hover:bg-red-700",
      }
    : {
        title: "Submit Graduate Verification?",
        description: "This will verify the selected registration and send the student's portal access. Please make sure the details are already reviewed before continuing.",
        confirmLabel: "Yes, Submit",
        confirmClassName: "bg-[#7a3b1a] hover:bg-[#5a2a12]",
      };

  const onSaveInfoClick = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowInfoSaveConfirm(true);
  };

  const confirmSaveInfo = () => {
    if (formRef.current) {
        handleSaveEdit(formRef.current);
    }
    setShowInfoSaveConfirm(false);
  };

  const handleConfirmGraduateAction = async () => {
    if (!pendingGraduateAction || !selectedStudent) return;

    setIsGraduateActionSubmitting(true);
    try {
        if (pendingGraduateAction === "discard") {
            await handleDiscard();
        } else {
            await handleFinalize();
        }
        setPendingGraduateAction(null);
    } finally {
        setIsGraduateActionSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-120px)] min-h-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
        
        {/* LEFT COLUMN: Stacked Header & Directory */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4 min-h-0 h-full">
            
            <Card className="p-4 rounded-2xl border-stone-200 shadow-sm shrink-0 flex flex-col gap-3">
                <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-amber-50 text-amber-600 rounded-md">
                            <BookOpen className="h-4 w-4"/>
                        </div>
                        <h2 className="text-[13px] font-black text-stone-800">
                            Graduate Verification
                        </h2>
                    </div>
                    {/* FIX: Now uses totalResults to adhere to the single counter policy */}
                    <Badge variant="secondary" className="text-[9px] px-2 py-0.5 whitespace-nowrap shadow-sm bg-amber-100 text-amber-800">
                        {totalResults} Records
                    </Badge>
                </div>
                <p className="text-[9px] text-stone-500 leading-snug">
                    Secure repository of verified graduates. Monitoring from registration to verified access.
                </p>
                <div className="flex gap-2 mt-1">
                    <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
                        <Input 
                            placeholder="Search ID..." 
                            className="pl-8 h-9 text-xs bg-stone-50 border-stone-200 focus:ring-amber-500/20" 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                        />
                    </div>
                    <Button onClick={handleSearchClick} className="h-9 px-4 text-xs font-bold bg-stone-800 hover:bg-stone-900 shadow-sm shrink-0 rounded-lg">
                        Search
                    </Button>
                </div>
            </Card>

            <Card className="flex-1 rounded-2xl border-stone-200 shadow-sm flex flex-col min-h-0 overflow-hidden bg-white">
                <div className="p-3 px-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <FolderOpen className="w-3.5 h-3.5 text-stone-500"/>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Directory</span>
                    </div>
                    <span className="text-[9px] font-mono text-stone-400">{totalResults} results</span>
                </div>
                
                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-stone-50/30">
                    <div className="space-y-1.5 p-2 pr-3 pb-4">
                        {isLoading ? (
                            <div className="text-center py-10 text-stone-400 text-sm flex flex-col items-center">
                                <Loader2 className="h-6 w-6 mb-2 text-amber-500 animate-spin"/> Loading...
                            </div>
                        ) : students.length === 0 ? (
                            <div className="text-center py-10 text-stone-400 text-sm flex flex-col items-center">
                                <Search className="h-8 w-8 mb-2 opacity-20" /> No students found.
                            </div>
                        ) : (
                            students.map(student => (
                                <button 
                                    key={student.id || student.student_number} 
                                    onClick={() => { setSelectedStudent(student); setIsEditing(false); }} 
                                    className={`w-full text-left py-2 px-3 rounded-xl flex items-center gap-3 transition-all border 
                                        ${selectedStudent?.id === student.id ? "bg-amber-50 border-amber-300 shadow-sm ring-1 ring-amber-400" : "bg-white border-stone-200 hover:ring-1 hover:ring-amber-300"}`}
                                >
                                    <Avatar className="h-8 w-8 shadow-sm">
                                        <AvatarImage src={student.studentDetail.photo_url || "https://github.com/shadcn.png"} />
                                        <AvatarFallback className="text-[10px] bg-stone-100 text-stone-500">
                                            {(student.first_name).charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-bold truncate leading-snug ${selectedStudent?.id === student.id ? 'text-amber-900' : 'text-stone-800'}`}>
                                            {student.last_name}, {student.first_name}
                                        </p>
                                        <p className="text-[10px] text-stone-500 font-mono leading-none mt-0.5">{student.student_number}</p>
                                    </div>
                                    <ChevronRight size={14} className={`shrink-0 ${selectedStudent?.id === student.id ? "text-amber-500" : "text-stone-300"}`} />
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {totalPages > 1 && (
                    <div className="py-2 px-3 border-t bg-white relative z-10 flex items-center justify-between shrink-0 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                        <Button variant="outline" size="icon" className="h-6 w-6 rounded-md" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                            <ChevronLeft className="h-3 w-3" />
                        </Button>
                        <div className="flex gap-1">
                            {getPageNumbers().map(pageNum => (
                                <Button
                                    key={pageNum}
                                    variant={currentPage === pageNum ? "default" : "ghost"}
                                    className={`h-6 w-6 text-[10px] rounded-md ${currentPage === pageNum ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
                                    onClick={() => setCurrentPage(pageNum)}
                                >
                                    {pageNum}
                                </Button>
                            ))}
                        </div>
                        <Button variant="outline" size="icon" className="h-6 w-6 rounded-md" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                            <ChevronRight className="h-3 w-3" />
                        </Button>
                    </div>
                )}
            </Card>
        </div>

        {/* RIGHT COLUMN: MAIN DETAILS PANEL */}
        <div className={`lg:col-span-8 xl:col-span-9 h-full min-h-0 ${selectedStudent ? 'block' : 'hidden lg:block'}`}>
            {selectedStudent ? (
                <Card className="h-full flex flex-col shadow-sm overflow-hidden rounded-2xl border border-stone-200 min-h-0 bg-white">
                    
                    {/* Top Thin Header Bar */}
                    <div className="p-3 px-5 bg-white border-b border-stone-200 flex justify-between items-center text-xs shadow-sm z-10 shrink-0">
                        <div className="flex items-center gap-4">
                            <Badge variant={selectedStudent.status === 'verified' ? 'default' : 'outline'} className={`px-3 py-0.5 text-[9px] font-bold ${selectedStudent.status === 'verified' ? 'bg-green-600 hover:bg-green-600 text-white' : 'text-stone-500 border-stone-300'}`}>
                                {selectedStudent.status === 'verified' ? 'VERIFIED' : 'PENDING REVIEW'}
                            </Badge>
                            <span className="h-3 w-[1px] bg-stone-300"></span>
                            <div className="flex items-center gap-1 font-mono text-stone-500 text-[10px]">
                                <span>ID:</span> <span className="font-bold text-stone-700">{selectedStudent.idNumber || selectedStudent.student_number}</span>
                            </div>
                        </div>
                        {selectedStudent.last_edited_by && (
                            <div className="flex items-center gap-1.5 text-[10px] text-stone-500">
                                <Clock size={10} className="text-stone-400" />
                                <span>Updated by <strong>{selectedStudent.last_edited_by}</strong></span>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex flex-col min-h-0 bg-white">
                        {isEditing ? (
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 bg-stone-50/50">
                                <form id="edit-form" ref={formRef} onSubmit={onSaveInfoClick}>
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 sticky top-0 bg-stone-50/95 backdrop-blur z-20 py-4 border-b border-stone-200 -mx-4 sm:-mx-6 px-4 sm:px-6 -mt-4 sm:-mt-6">
                                        <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2 shrink-0">
                                            <Edit3 size={18} className="text-amber-600"/> Edit Information
                                        </h2>
                                        <div className="flex gap-2 w-full md:w-auto justify-end shrink-0">
                                            <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                                            <Button type="submit" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm">Save Changes</Button>
                                        </div>
                                    </div>

                                    <Tabs defaultValue="personal" className="w-full max-w-4xl mx-auto">
                                        <TabsList className="flex flex-wrap md:grid md:grid-cols-4 mb-6 p-1 bg-stone-200/50 rounded-xl h-auto min-h-[44px]">
                                            <TabsTrigger value="personal" className="flex-1 text-[10px] md:text-xs font-bold py-2 whitespace-normal h-auto">Personal</TabsTrigger>
                                            <TabsTrigger value="academic" className="flex-1 text-[10px] md:text-xs font-bold py-2 whitespace-normal h-auto">Academic</TabsTrigger>
                                            <TabsTrigger value="contact" className="flex-1 text-[10px] md:text-xs font-bold py-2 whitespace-normal h-auto">Contact</TabsTrigger>
                                            <TabsTrigger value="family" className="flex-1 text-[10px] md:text-xs font-bold py-2 whitespace-normal h-auto">Family</TabsTrigger>
                                        </TabsList>
                                        
                                        <TabsContent value="personal" className="space-y-4 bg-white p-4 sm:p-6 rounded-xl border border-stone-200 shadow-sm">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                                                <div className="space-y-1.5"><Label className="text-stone-500 font-bold text-[10px] uppercase">First Name</Label><Input name="fname" defaultValue={selectedStudent.fname || selectedStudent.first_name} className="h-9 text-sm"/></div>
                                                <div className="space-y-1.5"><Label className="text-stone-500 font-bold text-[10px] uppercase">Last Name</Label><Input name="lname" defaultValue={selectedStudent.lname || selectedStudent.last_name} className="h-9 text-sm"/></div>
                                                <div className="space-y-1.5"><Label className="text-stone-500 font-bold text-[10px] uppercase">Middle Name</Label><Input name="mname" defaultValue={selectedStudent.mname || selectedStudent.mid_name} className="h-9 text-sm"/></div>
                                                <div className="space-y-1.5"><Label className="text-stone-500 font-bold text-[10px] uppercase">Suffix</Label><Input name="suffix" defaultValue={selectedStudent.suffix} className="h-9 text-sm"/></div>
                                            </div>
                                            <div className="space-y-1.5 pt-2"><Label className="text-stone-500 font-bold text-[10px] uppercase">Nickname</Label><Input name="nickname" defaultValue={selectedStudent.nickname} className="h-9 text-sm"/></div>
                                        </TabsContent>

                                        <TabsContent value="academic" className="space-y-4 sm:space-y-5 bg-white p-4 sm:p-6 rounded-xl border border-stone-200 shadow-sm">
                                            <div className="space-y-1.5"><Label className="text-stone-500 font-bold text-[10px] uppercase">Course</Label><Input name="course" defaultValue={selectedStudent.course} className="h-9 text-sm"/></div>
                                            <div className="space-y-1.5"><Label className="text-stone-500 font-bold text-[10px] uppercase">Major</Label><Input name="major" defaultValue={selectedStudent.major} className="h-9 text-sm"/></div>
                                            <div className="space-y-1.5"><Label className="text-stone-500 font-bold text-[10px] uppercase">Thesis Title</Label><Input name="thesis" defaultValue={selectedStudent.thesis_title} className="h-9 text-sm"/></div>
                                        </TabsContent>

                                        <TabsContent value="contact" className="space-y-4 sm:space-y-5 bg-white p-4 sm:p-6 rounded-xl border border-stone-200 shadow-sm">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-1.5"><Label className="text-stone-500 font-bold text-[10px] uppercase">Barangay</Label><Input name="barangay" defaultValue={selectedStudent.studentDetail?.barangay} className="h-9 text-sm"/></div>
                                                <div className="space-y-1.5"><Label className="text-stone-500 font-bold text-[10px] uppercase">City/Municipality</Label><Input name="city" defaultValue={selectedStudent.studentDetail?.city} className="h-9 text-sm"/></div>
                                                <div className="space-y-1.5"><Label className="text-stone-500 font-bold text-[10px] uppercase">Province</Label><Input name="province" defaultValue={selectedStudent.studentDetail?.province} className="h-9 text-sm"/></div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1.5"><Label className="text-stone-500 font-bold text-[10px] uppercase">Mobile</Label><Input name="contactNum" defaultValue={selectedStudent.studentDetail?.contact_num} className="h-9 text-sm"/></div>
                                                <div className="space-y-1.5"><Label className="text-stone-500 font-bold text-[10px] uppercase">Student Email</Label><Input name="schoolEmail" defaultValue={selectedStudent.school_email} className="h-9 text-sm"/></div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1.5"><Label className="text-stone-500 font-bold text-[10px] uppercase">Personal Email</Label><Input name="personalEmail" defaultValue={selectedStudent.personal_email} className="h-9 text-sm"/></div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="family" className="space-y-4 sm:space-y-5 bg-white p-4 sm:p-6 rounded-xl border border-stone-200 shadow-sm">
                                            <div className="space-y-4">
                                                {/* Parent Inputs with specific Prefix and Suffix boxes */}
                                                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                                                    <Label className="text-amber-700 font-bold text-[10px] uppercase tracking-wider">Father's Name</Label>
                                                    <div className="flex gap-2">
                                                        <Input name="fathers_title" placeholder="Title (Mr.)" defaultValue={selectedStudent.studentDetail?.fathers_title} className="w-[20%] md:w-24 h-9 text-sm text-center"/>
                                                        <Input name="father" placeholder="First Name, M.I., Last Name" defaultValue={selectedStudent.details?.father || selectedStudent.studentDetail?.fathers_name} className="flex-1 h-9 text-sm"/>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                                                    <Label className="text-amber-700 font-bold text-[10px] uppercase tracking-wider">Mother's Full Maiden Name</Label>
                                                    <div className="flex gap-2">
                                                        <Input name="mothers_title" placeholder="Title (Mrs.)" defaultValue={selectedStudent.studentDetail?.mothers_title} className="w-[20%] md:w-24 h-9 text-sm text-center"/>
                                                        <Input name="mother" placeholder="First Name, M.I., Last Name" defaultValue={selectedStudent.details?.mother || selectedStudent.studentDetail?.mothers_name} className="flex-1 h-9 text-sm"/>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                                                    <Label className="text-stone-500 font-bold text-[10px] uppercase tracking-wider">Guardian's Name (If Applicable)</Label>
                                                    <div className="flex gap-2">
                                                        <Input name="guardians_title" placeholder="Title" defaultValue={selectedStudent.studentDetail?.guardians_title} className="w-[20%] md:w-24 h-9 text-sm text-center"/>
                                                        <Input name="guardian" placeholder="First Name, M.I., Last Name" defaultValue={selectedStudent.details?.guardian || selectedStudent.studentDetail?.guardians_name} className="flex-1 h-9 text-sm"/>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </form>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-white">
                                
                                {/* Photo & Contact Overview - Optimized spacing to prevent scroll when possible */}
                                    <div className="w-full md:w-[42%] bg-[#fcfbfa] p-4 lg:p-5 flex flex-col items-center justify-between border-r border-stone-200 relative shrink-0 overflow-y-auto custom-scrollbar">
                                        
                                        <div className="w-full flex flex-col items-center mt-1">
                                            <div className="relative mb-3 transform hover:scale-105 transition-transform duration-500 ease-out group">
                                                <div className="w-40 h-40 xl:w-56 xl:h-56 bg-white p-2.5 shadow-xl border border-stone-200 relative z-10 rounded-md">
                                                    <Image unoptimized src={selectedStudent.studentDetail?.photo_url || "https://github.com/shadcn.png"} width={224} height={224} className="w-full h-full object-cover bg-stone-200 grayscale-[15%]" alt="Student" />
                                                    <div className="absolute -left-3 top-5 bottom-8 w-1.5 bg-amber-500 z-20 shadow-sm"></div>
                                                    <div className="absolute -right-3 bottom-5 top-8 w-1.5 bg-amber-500 z-20 shadow-sm"></div>
                                                </div>
                                            </div>

                                            <div className="text-center relative z-10 px-2 w-full mb-3">
                                                <h2 className="text-xl xl:text-2xl font-black text-stone-900 uppercase leading-tight tracking-tight">
                                                    {selectedStudent.last_name},<br/> 
                                                    {selectedStudent.first_name} {selectedStudent.mname || selectedStudent.mid_name}
                                                    {selectedStudent.suffix && <span className="ml-1">{selectedStudent.suffix}</span>}
                                                </h2>
                                                <p className="text-amber-600 font-serif italic text-sm xl:text-base mt-1 font-medium">"{selectedStudent.nickname}"</p>
                                            </div>
                                        </div>

                                       <div className="w-full space-y-1.5 mt-auto border-t border-stone-200/60 pt-2">
                                            <h3 className="flex items-center gap-2 text-[10px] font-bold text-amber-600 uppercase tracking-widest pb-1 border-b border-stone-100">
                                                <MapPin size={14}/> Contact Details
                                            </h3>
                                            <div className="bg-white p-2.5 rounded-xl border border-stone-100 shadow-sm space-y-1.5">
                                                <InfoField label="Home Address" value={(selectedStudent.studentDetail?.barangay ? `${selectedStudent.studentDetail.barangay}, ${selectedStudent.studentDetail.city.trim()}, ${selectedStudent.studentDetail.province}` : "")} icon={Home} fullWidth />
                                                <InfoField label="Mobile Number" value={selectedStudent.studentDetail?.contact_num} icon={Phone} fullWidth />
                                                <InfoField label="Personal Email" value={selectedStudent.personal_email} icon={Mail} fullWidth />
                                            </div>
                                        </div>
                                    </div>
                                {/* Deep Academic & Personal Details */}
                               <div className="flex-1 p-4 xl:p-6 bg-white flex flex-col justify-start overflow-y-auto custom-scrollbar">
                                    <div className="space-y-4 xl:space-y-6 max-w-2xl mx-auto w-full">
                                        
                                        <div className="space-y-3">
                                            <h3 className="flex items-center gap-2 text-[11px] font-bold text-amber-600 uppercase tracking-widest pb-1.5 border-b border-stone-100">
                                                <GraduationCap size={14}/> Academic Profile
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                                                <div className="col-span-2">
                                                    <InfoField label="Department / School" value={selectedStudent.department} icon={Building2} fullWidth />
                                                </div>
                                                <div className="col-span-2">
                                                    <InfoField label="Course" value={selectedStudent.course} fullWidth />
                                                </div>
                                                <InfoField label="Major" value={selectedStudent.major} />
                                                <InfoField label="ID Number" value={selectedStudent.idNumber || selectedStudent.student_number} />
                                                <div className="col-span-2 mt-1">
                                                    <InfoField label="Thesis / Capstone Title" value={`${selectedStudent.thesis_title || ''}`} icon={FileText} fullWidth />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h3 className="flex items-center gap-2 text-[11px] font-bold text-amber-600 uppercase tracking-widest pb-1.5 border-b border-stone-100">
                                                <User size={14}/> Personal & Family
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                                                <div className="col-span-2 md:col-span-1">
                                                    <InfoField label="Date of Birth" value={formatDate(selectedStudent.details?.birthdate || selectedStudent.studentDetail?.birth_date)} />
                                                </div>
                                                <div className="hidden md:block"></div>

                                                {/* Combining Prefix, Name, Suffix in UI */}
                                                <InfoField 
                                                    label="Father's Name" 
                                                    value={formatParentName(selectedStudent.studentDetail?.fathers_title, selectedStudent.details?.father || selectedStudent.studentDetail?.fathers_name)} 
                                                />
                                                <InfoField 
                                                    label="Mother's Name" 
                                                    value={formatParentName(selectedStudent.studentDetail?.mothers_title, selectedStudent.details?.mother || selectedStudent.studentDetail?.mothers_name)} 
                                                />
                                                
                                                {(selectedStudent.details?.guardian && selectedStudent.details?.guardian !== "N/A") || (selectedStudent.studentDetail?.guardians_name && selectedStudent.studentDetail?.guardians_name !== "N/A") ? (
                                                    <div className="col-span-1 md:col-span-2 mt-1">
                                                        <InfoField 
                                                            label="Guardian's Name" 
                                                            value={formatParentName(selectedStudent.studentDetail?.guardians_title, selectedStudent.details?.guardian || selectedStudent.studentDetail?.guardians_name)} 
                                                            fullWidth 
                                                        />
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <CardFooter className="py-2 px-5 h-[56px] border-t bg-stone-50 flex justify-between items-center z-20 flex-shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsEditing(true)} disabled={isEditing} className="h-9 px-4 text-xs border-stone-300 text-stone-600 hover:bg-white hover:text-amber-700 bg-white rounded-lg">
                                <Edit3 size={14} className="mr-1.5"/> Edit Info
                            </Button>
                          </div>

                          <CardFooter className="p-5 flex justify-end gap-3 shrink-0">
                              <Button
                                  variant="outline"
                                  className="px-6 hover:border-red-500 hover:text-red-500"
                                  onClick={() => setPendingGraduateAction("discard")}
                              >
                                  Discard
                              </Button>
                              <Button
                                  onClick={() => setPendingGraduateAction("submit")}
                                  disabled={isEditing}
                                  className={`h-10 px-8 text-sm font-bold shadow-md rounded-xl transition-all hover:scale-105 ${selectedStudent.status === 'verified' ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20' : 'bg-[#7a3b1a] hover:bg-[#5a2a12] shadow-[#7a3b1a]/20'}`}
                              >
                                  {selectedStudent.status === 'verified' ? (
                                      <><CheckCircle2 size={16} className="mr-2" /> Verified</>
                                  ) : (
                                      <><Save size={16} className="mr-1" /> Submit </>
                                  )}
                              </Button>

                          </CardFooter>
                    </CardFooter>
                </Card>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-stone-400 border-2 border-dashed border-stone-200 rounded-2xl bg-white/50">
                    <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-4 border border-stone-200 shadow-sm">
                        <User size={36} className="opacity-20 text-stone-500" />
                    </div>
                    <p className="font-serif text-lg text-stone-600 font-medium">Select a graduate from the directory</p>
                    <p className="text-xs text-stone-400 mt-1">Search by ID or Name to view details</p>
                </div>
            )}
        </div>

        {/* Global Action Modals */}
        <AlertDialog open={showInfoSaveConfirm} onOpenChange={setShowInfoSaveConfirm}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Save Changes?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to update the student's information? This will reflect in the database immediately.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmSaveInfo} className="bg-amber-600 hover:bg-amber-700">Confirm Save</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
            open={!!pendingGraduateAction}
            onOpenChange={(open) => {
                if (!open && !isGraduateActionSubmitting) setPendingGraduateAction(null);
            }}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{graduateActionCopy.title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {selectedGraduateName ? (
                            <>
                                You are about to process <strong>{selectedGraduateName}</strong>
                                {selectedStudent?.student_number || selectedStudent?.idNumber ? ` (${selectedStudent?.student_number || selectedStudent?.idNumber})` : ""}.{" "}
                            </>
                        ) : null}
                        {graduateActionCopy.description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isGraduateActionSubmitting}>Cancel</AlertDialogCancel>
                    <Button
                        onClick={handleConfirmGraduateAction}
                        disabled={isGraduateActionSubmitting}
                        className={graduateActionCopy.confirmClassName}
                    >
                        {isGraduateActionSubmitting ? (
                            <>
                                <Loader2 size={16} className="mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : graduateActionCopy.confirmLabel}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        {/* IMAGE LIGHTBOX MODAL */}
        <Dialog open={!!enlargedImage} onOpenChange={(open) => !open && setEnlargedImage(null)}>
            <DialogContent className="max-w-6xl p-1 bg-transparent border-0 shadow-none flex justify-center items-center [&>button]:hidden">
                <div className="relative">
                    <button 
                        onClick={() => setEnlargedImage(null)} 
                        className="absolute -top-4 -right-4 z-[100] p-2 bg-white hover:bg-stone-100 rounded-full text-stone-600 shadow-xl border border-stone-200 transition-all"
                    >
                        <X size={20}/>
                    </button>
                    {enlargedImage && (
                        <Image
                            unoptimized
                            src={enlargedImage} 
                            width={1600}
                            height={2000}
                            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl bg-black/10 backdrop-blur-md border border-white/20 relative z-50" 
                            alt="Enlarged view" 
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}
