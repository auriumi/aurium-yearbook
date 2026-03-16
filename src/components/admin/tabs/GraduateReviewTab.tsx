"use client";

import { useState, useRef } from "react";
import { Search, Edit3, Save, Clock, MapPin, Home, Phone, Mail, GraduationCap, User, Image as ImageIcon, Upload, FolderOpen, X, CheckCircle2, BookOpen, Building2, ChevronLeft, ChevronRight, Loader2, Camera, FileText } from "lucide-react";
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

import { useGraduateReview } from "@/hooks/useGraduateReview"; 

interface VerificationTabProps {
  staffUser: any;
  selectedStudent: any;
  setSelectedStudent: (student: any) => void;
}

export function GraduateReviewTab({ staffUser, selectedStudent, setSelectedStudent }: VerificationTabProps) {
  
  const {
    searchQuery, setSearchQuery,
    currentPage, setCurrentPage,
    handleSearchClick, handleSearchKeyDown,
    students, totalResults, pendingCount, isLoading, ITEMS_PER_PAGE,
    isEditing, setIsEditing,
    handleSaveEdit, handlePhotoUpload, handleFinalize,
  } = useGraduateReview(staffUser, selectedStudent, setSelectedStudent);

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

  const getObjectKey = (url: string): string => {
    if (typeof url !== 'string') return "";
      const findStr = `/aurium/`;
      const idx = url.indexOf(findStr);
      if (idx === -1) return "";
      return "https://static.auriumi.cloud/" + url.substring(idx + findStr.length);
  }

  const InfoField = ({ label, value, icon: Icon, fullWidth = false }: any) => (
    <div className={`flex flex-col space-y-1.5 ${fullWidth ? "col-span-2" : "col-span-1"}`}>
        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
            {Icon && <Icon size={12} />} {label}
        </span>
        <div className="px-3 py-2.5 bg-white rounded-lg border border-stone-200 text-xs font-semibold text-stone-800 break-words leading-tight shadow-sm min-h-[38px] flex items-center">
            {value || <span className="text-stone-300 italic">N/A</span>}
        </div>
    </div>
  );

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
  const [pendingFormEvent, setPendingFormEvent] = useState<React.FormEvent<HTMLFormElement> | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  const onSaveInfoClick = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPendingFormEvent(e);
    setShowInfoSaveConfirm(true);
  };

  const confirmSaveInfo = () => {
    if (formRef.current) {
        handleSaveEdit(pendingFormEvent as any);
    }
    setShowInfoSaveConfirm(false);
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
                    <Badge variant="secondary" className={`text-[9px] px-2 py-0.5 whitespace-nowrap shadow-sm ${pendingCount === 0 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                        {pendingCount} Pending
                    </Badge>
                </div>
                <p className="text-[9px] text-stone-500 leading-snug">
                    Secure repository of verified graduates. Monitoring from Registration to Final Verification.
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
                                        <AvatarImage src={student.photo} />
                                        <AvatarFallback className="text-[10px] bg-stone-100 text-stone-500">
                                            {(student.fname || student.first_name || "U").charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-bold truncate leading-snug ${selectedStudent?.id === student.id ? 'text-amber-900' : 'text-stone-800'}`}>
                                            {student.lname || student.last_name}, {student.fname || student.first_name}
                                        </p>
                                        <p className="text-[10px] text-stone-500 font-mono leading-none mt-0.5">{student.idNumber || student.student_number}</p>
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
                                {selectedStudent.status === 'verified' ? 'VERIFIED FINAL' : 'PENDING REVIEW'}
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
                                        </TabsContent>

                                        <TabsContent value="contact" className="space-y-4 sm:space-y-5 bg-white p-4 sm:p-6 rounded-xl border border-stone-200 shadow-sm">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-1.5"><Label className="text-stone-500 font-bold text-[10px] uppercase">Barangay</Label><Input name="barangay" defaultValue={selectedStudent.studentDetail?.barangay} className="h-9 text-sm"/></div>
                                                <div className="space-y-1.5"><Label className="text-stone-500 font-bold text-[10px] uppercase">City/Municipality</Label><Input name="city" defaultValue={selectedStudent.studentDetail?.city} className="h-9 text-sm"/></div>
                                                <div className="space-y-1.5"><Label className="text-stone-500 font-bold text-[10px] uppercase">Province</Label><Input name="province" defaultValue={selectedStudent.studentDetail?.province} className="h-9 text-sm"/></div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1.5"><Label className="text-stone-500 font-bold text-[10px] uppercase">Mobile</Label><Input name="contactNum" defaultValue={selectedStudent.details?.contactNum || selectedStudent.studentDetail?.contact_num} className="h-9 text-sm"/></div>
                                                <div className="space-y-1.5"><Label className="text-stone-500 font-bold text-[10px] uppercase">Personal Email</Label><Input name="personalEmail" defaultValue={selectedStudent.details?.personalEmail || selectedStudent.studentDetail?.personal_email} className="h-9 text-sm"/></div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="family" className="space-y-4 sm:space-y-5 bg-white p-4 sm:p-6 rounded-xl border border-stone-200 shadow-sm">
                                            <div className="space-y-4">
                                                {/* Parent Inputs with specific Prefix and Suffix boxes */}
                                                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                                                    <Label className="text-amber-700 font-bold text-[10px] uppercase tracking-wider">Father's Name</Label>
                                                    <div className="flex gap-2">
                                                        <Input name="fathers_prefix" placeholder="Prefix (Mr.)" defaultValue={selectedStudent.studentDetail?.fathers_prefix} className="w-[20%] md:w-24 h-9 text-sm text-center"/>
                                                        <Input name="father" placeholder="First Name, M.I., Last Name" defaultValue={selectedStudent.details?.father || selectedStudent.studentDetail?.fathers_name} className="flex-1 h-9 text-sm"/>
                                                        <Input name="fathers_suffix" placeholder="Suffix (Jr.)" defaultValue={selectedStudent.studentDetail?.fathers_suffix} className="w-[20%] md:w-24 h-9 text-sm text-center"/>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                                                    <Label className="text-amber-700 font-bold text-[10px] uppercase tracking-wider">Mother's Full Maiden Name</Label>
                                                    <div className="flex gap-2">
                                                        <Input name="mothers_prefix" placeholder="Prefix (Mrs.)" defaultValue={selectedStudent.studentDetail?.mothers_prefix} className="w-[20%] md:w-24 h-9 text-sm text-center"/>
                                                        <Input name="mother" placeholder="First Name, M.I., Last Name" defaultValue={selectedStudent.details?.mother || selectedStudent.studentDetail?.mothers_name} className="flex-1 h-9 text-sm"/>
                                                        <Input name="mothers_suffix" placeholder="Suffix" defaultValue={selectedStudent.studentDetail?.mothers_suffix} className="w-[20%] md:w-24 h-9 text-sm text-center"/>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                                                    <Label className="text-stone-500 font-bold text-[10px] uppercase tracking-wider">Guardian's Name (If Applicable)</Label>
                                                    <div className="flex gap-2">
                                                        <Input name="guardians_prefix" placeholder="Prefix" defaultValue={selectedStudent.studentDetail?.guardians_prefix} className="w-[20%] md:w-24 h-9 text-sm text-center"/>
                                                        <Input name="guardian" placeholder="First Name, M.I., Last Name" defaultValue={selectedStudent.details?.guardian || selectedStudent.studentDetail?.guardians_name} className="flex-1 h-9 text-sm"/>
                                                        <Input name="guardians_suffix" placeholder="Suffix" defaultValue={selectedStudent.studentDetail?.guardians_suffix} className="w-[20%] md:w-24 h-9 text-sm text-center"/>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </form>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-white">
                                
                                {/* Photo & Contact Overview - Fit strictly to avoid overflow */}
                                <div className="w-full md:w-[42%] bg-[#fcfbfa] p-5 lg:p-6 flex flex-col items-center justify-between border-r border-stone-200 relative shrink-0 overflow-hidden">
                                    
                                    <div className="w-full flex flex-col items-center mt-1">
                                        <div className="relative mb-3 transform hover:scale-105 transition-transform duration-500 ease-out group">
                                            <div className="w-40 h-40 xl:w-56 xl:h-56 bg-white p-2.5 shadow-xl border border-stone-200 relative z-10 rounded-md">
                                                <img src={selectedStudent.photo} className="w-full h-full object-cover bg-stone-200 grayscale-[15%]" alt="Student" />
                                                <div className="absolute -left-3 top-5 bottom-8 w-1.5 bg-amber-500 z-20 shadow-sm"></div>
                                                <div className="absolute -right-3 bottom-5 top-8 w-1.5 bg-amber-500 z-20 shadow-sm"></div>
                                            </div>
                                        </div>

                                        <div className="text-center relative z-10 px-2 w-full mb-3">
                                            <h2 className="text-xl xl:text-2xl font-black text-stone-900 uppercase leading-tight tracking-tight">
                                                {selectedStudent.lname || selectedStudent.last_name},<br/> 
                                                {selectedStudent.fname || selectedStudent.first_name} {selectedStudent.mname || selectedStudent.mid_name}
                                                {selectedStudent.suffix && <span className="ml-1">{selectedStudent.suffix}</span>}
                                            </h2>
                                            <p className="text-amber-600 font-serif italic text-sm xl:text-base mt-1 font-medium">"{selectedStudent.nickname}"</p>
                                        </div>
                                    </div>

                                    <div className="w-full space-y-2 mt-auto border-t border-stone-200/60 pt-3">
                                        <h3 className="flex items-center gap-2 text-[10px] font-bold text-amber-600 uppercase tracking-widest pb-1 border-b border-stone-100">
                                            <MapPin size={14}/> Contact Details
                                        </h3>
                                        <div className="bg-white p-3 rounded-xl border border-stone-100 shadow-sm space-y-2.5">
                                            <InfoField label="Home Address" value={selectedStudent.details?.address || (selectedStudent.studentDetail?.barangay ? `${selectedStudent.studentDetail.barangay}, ${selectedStudent.studentDetail.city}, ${selectedStudent.studentDetail.province}` : "")} icon={Home} fullWidth />
                                            <div className="grid grid-cols-2 gap-2">
                                                <InfoField label="Mobile Number" value={selectedStudent.details?.contactNum || selectedStudent.studentDetail?.contact_num} icon={Phone} />
                                                <InfoField label="Personal Email" value={selectedStudent.details?.personalEmail || selectedStudent.personal_email} icon={Mail} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Deep Academic & Personal Details */}
                                <div className="flex-1 p-4 xl:p-6 bg-white flex flex-col justify-center overflow-hidden">
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
                                                    <InfoField label="Thesis / Capstone Title" value={`"${selectedStudent.details?.thesis || selectedStudent.studentDetail?.thesis_title || ''}"`} icon={FileText} fullWidth />
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
                                                    value={formatParentName(selectedStudent.studentDetail?.fathers_prefix, selectedStudent.details?.father || selectedStudent.studentDetail?.fathers_name, selectedStudent.studentDetail?.fathers_suffix)} 
                                                />
                                                <InfoField 
                                                    label="Mother's Name" 
                                                    value={formatParentName(selectedStudent.studentDetail?.mothers_prefix, selectedStudent.details?.mother || selectedStudent.studentDetail?.mothers_name, selectedStudent.studentDetail?.mothers_suffix)} 
                                                />
                                                
                                                {(selectedStudent.details?.guardian && selectedStudent.details?.guardian !== "N/A") || (selectedStudent.studentDetail?.guardians_name && selectedStudent.studentDetail?.guardians_name !== "N/A") ? (
                                                    <div className="col-span-1 md:col-span-2 mt-1">
                                                        <InfoField 
                                                            label="Guardian's Name" 
                                                            value={formatParentName(selectedStudent.studentDetail?.guardians_prefix, selectedStudent.details?.guardian || selectedStudent.studentDetail?.guardians_name, selectedStudent.studentDetail?.guardians_suffix)} 
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
                    
                    <CardFooter className="p-4 border-t bg-stone-50 flex justify-between items-center z-20 flex-shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsEditing(true)} disabled={isEditing} className="h-9 px-4 text-xs border-stone-300 text-stone-600 hover:bg-white hover:text-amber-700 bg-white rounded-lg">
                                <Edit3 size={14} className="mr-1.5"/> Edit Info
                            </Button>
                            <Button variant="secondary" onClick={() => setIsPhotoModalOpen(true)} className="h-9 px-4 text-xs bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200 shadow-sm rounded-lg">
                                <ImageIcon size={14} className="mr-1.5"/> Manage Photos
                            </Button>
                        </div>

                        <Button 
                          onClick={handleFinalize} 
                          disabled={isEditing}
                          className={`h-10 px-8 text-sm font-bold shadow-md rounded-xl transition-all hover:scale-105 ${selectedStudent.status === 'verified' ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20' : 'bg-[#7a3b1a] hover:bg-[#5a2a12] shadow-[#7a3b1a]/20'}`}
                        >
                          {selectedStudent.status === 'verified' ? (
                            <><CheckCircle2 size={16} className="mr-2"/> Verified Final</>
                          ) : (
                            <><Save size={16} className="mr-2"/> Final Submit</>
                          )}
                        </Button>
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

        <AlertDialog open={showPhotoSaveConfirm} onOpenChange={setShowPhotoSaveConfirm}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Update Photos?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will replace any existing graduation or creative photos for this student.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => { setShowPhotoSaveConfirm(false); setIsPhotoModalOpen(false); }} className="bg-green-600 hover:bg-green-700">Confirm Upload</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        {/* 100% PERFECT MATCH POLAROID PHOTO MANAGER MODAL (Preserved untouched) */}
        <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
            <DialogContent className="max-w-[1200px] w-[95vw] max-h-[90vh] p-0 overflow-hidden bg-white border-0 shadow-2xl flex flex-col rounded-3xl">
                
                <div className="px-8 py-5 border-b border-stone-100 bg-white flex justify-center items-center shrink-0 z-20 relative">
                    <div className="flex flex-col items-center text-center mt-2">
                        <div className="flex items-center gap-2 text-stone-800 mb-1">
                            <ImageIcon size={18} className="text-amber-500" />
                            <DialogTitle className="text-xl font-black tracking-widest uppercase font-serif">Studio Photo Manager</DialogTitle>
                        </div>
                        <DialogDescription className="text-stone-500 font-medium text-xs">
                            Verify the reference and upload the official high-resolution yearbook portraits.
                        </DialogDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsPhotoModalOpen(false)} className="absolute right-6 top-6 rounded-full h-10 w-10 bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors">
                        <X size={20}/>
                    </Button>
                </div>
                
                <div className="flex-1 overflow-x-auto overflow-y-auto bg-[#f9f8f6] relative custom-scrollbar">
                    <div className="flex items-center justify-center min-w-max min-h-full p-8 md:p-12 gap-8 md:gap-12">
                        
                        <div className="flex flex-col items-center w-[280px] md:w-[320px] shrink-0">
                            <div className="text-center mb-4 space-y-1">
                                <h4 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Reference</h4>
                                <h3 className="text-[15px] font-black text-stone-800">Pre-Registration Photo</h3>
                            </div>
                            <div 
                                className="w-full bg-white p-4 rounded-[1.5rem] shadow-xl border border-stone-100 flex flex-col group cursor-pointer hover:-translate-y-1 transition-transform duration-300"
                                onClick={() => {
                                    const refUrl = selectedStudent?.studentDetail?.photo_url ? getObjectKey(selectedStudent.studentDetail.photo_url) : selectedStudent?.photo;
                                    if (refUrl) setEnlargedImage(refUrl);
                                }}
                            >
                                <div className="w-full aspect-[4/5] bg-stone-100 rounded-[1.2rem] overflow-hidden relative border border-stone-200">
                                    {selectedStudent?.studentDetail?.photo_url || selectedStudent?.photo ? (
                                        <>
                                            <img src={selectedStudent?.studentDetail?.photo_url ? getObjectKey(selectedStudent.studentDetail.photo_url) : selectedStudent?.photo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Reference" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity duration-300">
                                                <div className="bg-white/90 text-stone-800 text-xs font-bold px-4 py-2 rounded-full backdrop-blur-sm shadow-xl flex items-center gap-2"><Search size={14}/> Enlarge</div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-stone-300">
                                            <User size={64} className="mb-3 opacity-20"/>
                                        </div>
                                    )}
                                </div>
                                <div className="w-full mt-5 mb-2 px-2 text-center">
                                    <div className={`h-1.5 w-full rounded-full mb-3 ${selectedStudent?.photo || selectedStudent?.studentDetail?.photo_url ? 'bg-green-500' : 'bg-stone-200'}`}></div>
                                    <span className={`text-[11px] font-black uppercase tracking-widest ${selectedStudent?.photo || selectedStudent?.studentDetail?.photo_url ? 'text-green-600' : 'text-stone-400'}`}>
                                        {selectedStudent?.photo || selectedStudent?.studentDetail?.photo_url ? 'Uploaded ✓' : 'No Reference'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center w-[280px] md:w-[320px] shrink-0">
                            <div className="text-center mb-4 space-y-1">
                                <h4 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Official</h4>
                                <h3 className="text-[15px] font-black text-stone-800">Graduation (Toga) Photo</h3>
                            </div>
                            <div 
                                className="w-full bg-white p-4 rounded-[1.5rem] shadow-xl border border-stone-100 flex flex-col group cursor-pointer hover:-translate-y-1 transition-transform duration-300"
                                onClick={() => gradPhotoRef.current?.click()}
                            >
                                <div className="w-full aspect-[4/5] bg-stone-50 rounded-[1.2rem] overflow-hidden relative border border-stone-200">
                                    {selectedStudent?.photo_grad ? (
                                        <>
                                            <img src={selectedStudent.photo_grad} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Graduation" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity duration-300">
                                                <div className="bg-white/90 text-stone-800 text-xs font-bold px-4 py-2 rounded-full backdrop-blur-sm shadow-xl flex items-center gap-2"><Camera size={14}/> Change</div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 hover:bg-stone-100 transition-colors border-2 border-dashed border-stone-300 rounded-[1.2rem] m-0 p-0 absolute inset-0">
                                            <Upload size={36} className="mb-3 opacity-50"/>
                                            <span className="text-sm font-bold">Click to Upload</span>
                                        </div>
                                    )}
                                    <input type="file" ref={gradPhotoRef} className="hidden" accept="image/*" onChange={(e) => {
                                        if(e.target.files?.[0]) handlePhotoUpload('grad', e.target.files[0]);
                                    }}/>
                                </div>
                                <div className="w-full mt-5 mb-2 px-2 text-center">
                                    <div className={`h-1.5 w-full rounded-full mb-3 ${selectedStudent?.photo_grad ? 'bg-green-500' : 'bg-stone-200'}`}></div>
                                    <span className={`text-[11px] font-black uppercase tracking-widest ${selectedStudent?.photo_grad ? 'text-green-600' : 'text-stone-400'}`}>
                                        {selectedStudent?.photo_grad ? 'Uploaded ✓' : 'Action Required'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center w-[280px] md:w-[320px] shrink-0">
                            <div className="text-center mb-4 space-y-1">
                                <h4 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Official</h4>
                                <h3 className="text-[15px] font-black text-stone-800">Creative / Theme Photo</h3>
                            </div>
                            <div 
                                className="w-full bg-white p-4 rounded-[1.5rem] shadow-xl border border-stone-100 flex flex-col group cursor-pointer hover:-translate-y-1 transition-transform duration-300"
                                onClick={() => creativePhotoRef.current?.click()}
                            >
                                <div className="w-full aspect-[4/5] bg-stone-50 rounded-[1.2rem] overflow-hidden relative border border-stone-200">
                                    {selectedStudent?.photo_creative ? (
                                        <>
                                            <img src={selectedStudent.photo_creative} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Creative" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity duration-300">
                                                <div className="bg-white/90 text-stone-800 text-xs font-bold px-4 py-2 rounded-full backdrop-blur-sm shadow-xl flex items-center gap-2"><Camera size={14}/> Change</div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 hover:bg-stone-100 transition-colors border-2 border-dashed border-stone-300 rounded-[1.2rem] m-0 p-0 absolute inset-0">
                                            <Upload size={36} className="mb-3 opacity-50"/>
                                            <span className="text-sm font-bold">Click to Upload</span>
                                        </div>
                                    )}
                                    <input type="file" ref={creativePhotoRef} className="hidden" accept="image/*" onChange={(e) => {
                                         if(e.target.files?.[0]) handlePhotoUpload('creative', e.target.files[0]);
                                    }}/>
                                </div>
                                <div className="w-full mt-5 mb-2 px-2 text-center">
                                    <div className={`h-1.5 w-full rounded-full mb-3 ${selectedStudent?.photo_creative ? 'bg-green-500' : 'bg-stone-200'}`}></div>
                                    <span className={`text-[11px] font-black uppercase tracking-widest ${selectedStudent?.photo_creative ? 'text-green-600' : 'text-stone-400'}`}>
                                        {selectedStudent?.photo_creative ? 'Uploaded ✓' : 'Action Required'}
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <DialogFooter className="bg-white p-5 border-t border-stone-100 flex justify-center items-center shrink-0 z-20">
                    <div className="flex items-center justify-center w-full gap-6">
                        <Button variant="ghost" onClick={() => setIsPhotoModalOpen(false)} className="text-stone-500 font-bold hover:bg-stone-50 h-11 px-6">Discard Changes</Button>
                        <Button onClick={() => setShowPhotoSaveConfirm(true)} className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-10 shadow-lg shadow-green-600/20 rounded-xl h-11">
                            <Save size={18} className="mr-2"/> Save Studio Photos
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>

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
                        <img 
                            src={enlargedImage} 
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