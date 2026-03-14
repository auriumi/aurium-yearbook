"use client";

import { useState, useRef } from "react";
import { Search, Edit3, Save, Clock, MapPin, Home, Phone, Mail, GraduationCap, User, Image as ImageIcon, Upload, FolderOpen, AlertCircle, X, Check, Filter, CheckCircle2, BookOpen, Building2, ListFilter, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
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
  
  // Pass data to the hook to handle logic and filtering
  const {
    searchQuery, setSearchQuery,
    activeDeptFilter, setActiveDeptFilter,
    activeCourseFilter, setActiveCourseFilter,
    activeStatusFilter, setActiveStatusFilter,
    currentPage, setCurrentPage,
    handleSearchClick, handleLoadClick, handleSearchKeyDown,
    students, totalResults, pendingCount, isLoading, ITEMS_PER_PAGE,
    isEditing, setIsEditing,
    handleSaveEdit, handlePhotoUpload, handleFinalize,
    DEPARTMENT_ORDER, STATUS_STEPS, ACADEMIC_CONFIG
  } = useGraduateReview(staffUser, selectedStudent, setSelectedStudent);

  // Pagination helper for the flat list
  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE) || 1;
  const getPageNumbers = () => {
      const pages = [];
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + 4);
      if (end - start < 4) start = Math.max(1, end - 4);
      for (let i = start; i <= end; i++) pages.push(i);
      return pages;
  };

  // Helper function to format the date as requested (e.g., October 07, 2004)
  const formatDate = (dateString: string) => {
      if (!dateString || dateString === "N/A") return "N/A";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Fallback just in case an invalid date format comes from the DB
      return date.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
  };

  // Small helper component to avoid repeating this UI structure
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

  // Refs to trigger the hidden file inputs when clicking the upload boxes
  const gradPhotoRef = useRef<HTMLInputElement>(null);
  const creativePhotoRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Local states for modals
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [showInfoSaveConfirm, setShowInfoSaveConfirm] = useState(false);
  const [showPhotoSaveConfirm, setShowPhotoSaveConfirm] = useState(false);
  const [pendingFormEvent, setPendingFormEvent] = useState<React.FormEvent<HTMLFormElement> | null>(null);

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

  const selectedDeptConfig = ACADEMIC_CONFIG.find(d => d.name === activeDeptFilter);
  const availableCourses = selectedDeptConfig ? selectedDeptConfig.courses.map(c => c.name) : [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 h-[calc(100vh-140px)] flex flex-col min-h-0">
        
        {/* --- Header Section --- */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5 flex-shrink-0">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-amber-600"/> Graduate Verification
                    </h2>
                    <p className="text-sm text-stone-500 mt-1">
                        Secure repository of verified graduates. Monitoring all students from Registration to Final Verification.
                    </p>
                </div>
                <Badge variant="secondary" className={`px-4 py-1.5 text-sm h-fit ${pendingCount === 0 ? 'bg-green-100 text-green-800 border-green-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                    {pendingCount === 0 ? "All Caught Up!" : `${pendingCount} Pending Verification`}
                </Badge>
            </div>
            
            {/* Flat Layout Filters (Match Masterlist Style) */}
            <div className="flex flex-col xl:flex-row gap-4 justify-between items-center bg-stone-50/50 p-2 rounded-xl border border-stone-100 min-w-0">
                {/* Search */}
                <div className="flex gap-2 w-full xl:w-[30%] min-w-0">
                    <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                        <Input 
                            placeholder="Search Name or ID..." 
                            className="pl-10 h-11 bg-white border-stone-200 focus:ring-amber-500/20 focus:border-amber-500 shadow-sm w-full" 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                        />
                    </div>
                    <Button onClick={handleSearchClick} className="h-11 px-5 bg-stone-800 hover:bg-stone-900 shadow-sm shrink-0">Search</Button>
                </div>

                <div className="hidden xl:block text-stone-300 font-medium text-sm px-1 shrink-0">OR</div>

                {/* Dropdown Filters */}
                <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-[65%] justify-end min-w-0">
                    <div className="w-full sm:w-[150px] shrink-0">
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
                                {STATUS_STEPS.map(step => (
                                    <SelectItem key={step.id} value={step.id}>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${step.color}`}></div>{step.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full sm:flex-1 min-w-0">
                        <Select value={activeDeptFilter} onValueChange={setActiveDeptFilter}>
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
                                {DEPARTMENT_ORDER.map(dept => (<SelectItem key={dept} value={dept}>{dept}</SelectItem>))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full sm:flex-1 min-w-0">
                        <Select value={activeCourseFilter} onValueChange={setActiveCourseFilter} disabled={activeDeptFilter === "ALL"}>
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
                                {availableCourses.map(course => (<SelectItem key={course} value={course}>{course}</SelectItem>))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={handleLoadClick} className="h-11 px-5 bg-amber-600 hover:bg-amber-700 shadow-sm text-white font-bold tracking-wide w-full sm:w-auto shrink-0">
                        <Download size={16} className="mr-2 shrink-0"/> LOAD
                    </Button>
                </div>
            </div>
        </div>

        {/* --- Main Content: Left side (List), Right side (Details) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 pb-6">
            
            {/* LEFT: Directory List (Now Flat!) */}
            <Card className={`lg:col-span-4 xl:col-span-3 border-stone-200 shadow-sm flex flex-col overflow-hidden h-full rounded-2xl bg-white ${selectedStudent ? 'hidden lg:flex' : 'flex'}`}>
                <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-stone-500"/>
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Directory</span>
                    </div>
                    <span className="text-[10px] font-mono text-stone-400">{totalResults} results</span>
                </div>
                
                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-stone-50/30">
                    <div className="space-y-1.5 p-2 pr-3 pb-8">
                        {students.length === 0 ? (
                            <div className="text-center py-10 text-stone-400 text-sm flex flex-col items-center">
                                <Filter className="h-8 w-8 mb-2 opacity-20" /> No students found.
                            </div>
                        ) : (
                            students.map(student => (
                                <button 
                                    key={student.id} 
                                    onClick={() => { setSelectedStudent(student); setIsEditing(false); }} 
                                    className={`w-full text-left py-2 px-3 rounded-xl flex items-center gap-3 transition-all border 
                                        ${selectedStudent?.id === student.id ? "bg-amber-50 border-amber-300 shadow-sm ring-1 ring-amber-100" : "bg-white border-stone-200 hover:ring-1 hover:ring-amber-300"}`}
                                >
                                    <Avatar className="h-9 w-9 shadow-sm">
                                        <AvatarImage src={student.photo} />
                                        <AvatarFallback className="text-[10px] bg-stone-100 text-stone-500">{student.fname?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-[13px] font-bold truncate leading-snug ${selectedStudent?.id === student.id ? 'text-amber-900' : 'text-stone-800'}`}>
                                            {student.lname}, {student.fname}
                                        </p>
                                        <p className="text-[11px] text-stone-500 font-mono leading-none mt-0.5">{student.idNumber}</p>
                                    </div>
                                    <ChevronRight size={16} className={`shrink-0 ${selectedStudent?.id === student.id ? "text-amber-500" : "text-stone-300"}`} />
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Left Panel Pagination */}
                <div className="py-2 px-3 border-t bg-white relative z-10 flex items-center justify-between shrink-0 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                    <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex gap-1">
                        {getPageNumbers().map(pageNum => (
                            <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "ghost"}
                                className={`h-7 w-7 text-[11px] rounded-lg ${currentPage === pageNum ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
                                onClick={() => setCurrentPage(pageNum)}
                            >
                                {pageNum}
                            </Button>
                        ))}
                    </div>
                    <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </Card>

            {/* RIGHT: Details Panel */}
            <div className={`lg:col-span-8 xl:col-span-9 h-full flex flex-col min-h-0 ${selectedStudent ? 'block' : 'hidden lg:block'}`}>
                {selectedStudent ? (
                    <div className="h-full flex flex-col animate-in fade-in zoom-in-95 duration-200">
                        
                        {/* Student details header to indicate if they are already verified or still pending */}
                        <div className="bg-white border border-stone-200 rounded-t-2xl p-4 flex flex-col sm:flex-row justify-between items-center text-xs text-stone-500 shadow-sm z-10 flex-shrink-0">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <Badge variant={selectedStudent.status === 'verified' ? 'default' : 'outline'} className={`px-3 py-1 ${selectedStudent.status === 'verified' ? 'bg-green-600 hover:bg-green-600' : 'text-stone-500 border-stone-300'}`}>
                                    {selectedStudent.status === 'verified' ? 'VERIFIED FINAL' : 'PENDING REVIEW'}
                                </Badge>
                                <span className="h-4 w-[1px] bg-stone-300 hidden sm:block"></span>
                                <div className="flex items-center gap-1 font-mono text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                                    <span className="text-stone-400">ID:</span> {selectedStudent.idNumber}
                                </div>
                            </div>
                            {selectedStudent.last_edited_by && (
                                <div className="flex items-center gap-1.5 mt-2 sm:mt-0">
                                    <Clock size={12} className="text-stone-400" />
                                    <span>Updated by <strong>{selectedStudent.last_edited_by}</strong></span>
                                </div>
                            )}
                        </div>

                        {/* Inside the card: Toggles between edit mode and view mode */}
                        <Card className="rounded-t-none border-t-0 shadow-sm flex-1 flex flex-col bg-white relative overflow-hidden rounded-b-2xl border-stone-200 min-h-0">
                            
                            {isEditing ? (
                                /* --- EDIT MODE (Triggered when the edit button is clicked) --- */
                                <div className="flex-1 overflow-y-auto p-8 bg-stone-50/50">
                                    <form id="edit-form" ref={formRef} onSubmit={onSaveInfoClick}>
                                        <div className="flex items-center justify-between mb-8 sticky top-0 bg-stone-50/95 backdrop-blur z-20 py-4 border-b border-stone-200 -mx-8 px-8 -mt-8">
                                            <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                                                <Edit3 size={18} className="text-amber-600"/> Edit Information
                                            </h2>
                                            <div className="flex gap-2">
                                                <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                                                <Button type="submit" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm">Save Changes</Button>
                                            </div>
                                        </div>
                                        <Tabs defaultValue="personal" className="w-full">
                                            <TabsList className="grid w-full grid-cols-4 mb-6 p-1 bg-stone-200/50 rounded-xl h-12">
                                                <TabsTrigger value="personal" className="text-xs font-bold">Personal</TabsTrigger>
                                                <TabsTrigger value="academic" className="text-xs font-bold">Academic</TabsTrigger>
                                                <TabsTrigger value="contact" className="text-xs font-bold">Contact</TabsTrigger>
                                                <TabsTrigger value="family" className="text-xs font-bold">Family</TabsTrigger>
                                            </TabsList>
                                            
                                            <TabsContent value="personal" className="space-y-4 bg-white p-8 rounded-xl border border-stone-200 shadow-sm">
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-1.5"><Label className="text-stone-500 font-bold text-xs uppercase">First Name</Label><Input name="fname" defaultValue={selectedStudent.fname} /></div>
                                                    <div className="space-y-1.5"><Label className="text-stone-500 font-bold text-xs uppercase">Last Name</Label><Input name="lname" defaultValue={selectedStudent.lname} /></div>
                                                    <div className="space-y-1.5"><Label className="text-stone-500 font-bold text-xs uppercase">Middle Name</Label><Input name="mname" defaultValue={selectedStudent.mname} /></div>
                                                    <div className="space-y-1.5"><Label className="text-stone-500 font-bold text-xs uppercase">Suffix</Label><Input name="suffix" defaultValue={selectedStudent.suffix} /></div>
                                                </div>
                                                <div className="space-y-1.5 pt-2"><Label className="text-stone-500 font-bold text-xs uppercase">Nickname</Label><Input name="nickname" defaultValue={selectedStudent.nickname} /></div>
                                            </TabsContent>
                                            <TabsContent value="academic" className="space-y-6 bg-white p-8 rounded-xl border border-stone-200 shadow-sm">
                                               <div className="space-y-1.5"><Label className="text-stone-500 font-bold text-xs uppercase">Course</Label><Input name="course" defaultValue={selectedStudent.course} /></div>
                                               <div className="space-y-1.5"><Label className="text-stone-500 font-bold text-xs uppercase">Major</Label><Input name="major" defaultValue={selectedStudent.major} /></div>
                                            </TabsContent>
                                            <TabsContent value="contact" className="space-y-6 bg-white p-8 rounded-xl border border-stone-200 shadow-sm">
                                               <div className="space-y-1.5"><Label className="text-stone-500 font-bold text-xs uppercase">Address</Label><Input name="address" defaultValue={selectedStudent.details?.address} /></div>
                                               <div className="space-y-1.5"><Label className="text-stone-500 font-bold text-xs uppercase">Mobile</Label><Input name="contactNum" defaultValue={selectedStudent.details?.contactNum} /></div>
                                               <div className="space-y-1.5"><Label className="text-stone-500 font-bold text-xs uppercase">Personal Email</Label><Input name="personalEmail" defaultValue={selectedStudent.details?.personalEmail} /></div>
                                               {/* Note: I removed the School Email from the UI since we don't need it here */}
                                            </TabsContent>
                                            <TabsContent value="family" className="space-y-6 bg-white p-8 rounded-xl border border-stone-200 shadow-sm">
                                               {/* Conditional rendering logic: If Guardian is filled, hide the Parents fields. */}
                                               {(!selectedStudent.details?.guardian || selectedStudent.details?.guardian === "N/A") ? (
                                                  <>
                                                      <div className="space-y-1.5"><Label className="text-stone-500 font-bold text-xs uppercase">Father</Label><Input name="father" defaultValue={selectedStudent.details?.father} /></div>
                                                      <div className="space-y-1.5"><Label className="text-stone-500 font-bold text-xs uppercase">Mother</Label><Input name="mother" defaultValue={selectedStudent.details?.mother} /></div>
                                                  </>
                                               ) : (
                                                  <div className="space-y-1.5"><Label className="text-stone-500 font-bold text-xs uppercase">Guardian</Label><Input name="guardian" defaultValue={selectedStudent.details?.guardian} /></div>
                                               )}
                                            </TabsContent>
                                        </Tabs>
                                    </form>
                                </div>
                            ) : (
                                /* --- VIEW MODE (Read-only display) --- */
                                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                                    
                                    {/* Styled picture and name section (Restored to normal size here) */}
                                    <div className="w-full md:w-5/12 bg-stone-100 p-8 flex flex-col items-center justify-center border-r border-stone-200 relative">
                                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                        
                                        <div className="relative mb-8 transform hover:scale-105 transition-transform duration-500 ease-out group">
                                                <div className="w-48 h-48 bg-white p-2 shadow-xl rotate-2 border-2 border-stone-200 relative z-10 rounded-sm">
                                                    <img src={selectedStudent.photo} className="w-full h-full object-cover bg-stone-200" alt="Student" />
                                                    <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-amber-500 z-20"></div>
                                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-amber-500 z-20"></div>
                                                </div>
                                        </div>

                                        <div className="text-center space-y-3 max-w-sm relative z-10">
                                            <div>
                                                <h2 className="text-2xl font-serif font-bold text-stone-900 leading-tight uppercase tracking-wide">
                                                    {selectedStudent.lname}, <br/> {selectedStudent.fname} {selectedStudent.mname} {selectedStudent.suffix}
                                                </h2>
                                                <p className="text-amber-600 font-serif italic text-lg mt-2 font-medium">"{selectedStudent.nickname}"</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right side details container, scrollable if content overflows */}
                                    <div className="flex-1 p-10 overflow-y-auto bg-white min-h-0">
                                        <div className="space-y-10 pb-10">
                                                
                                                {/* Academic Details */}
                                                <div>
                                                    <h3 className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-[0.2em] mb-5">
                                                        <GraduationCap size={16}/> Academic Profile
                                                    </h3>
                                                    <div className="grid grid-cols-1 gap-6 p-6 bg-stone-50 rounded-2xl border border-stone-100 relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full opacity-50"></div>
                                                        <div className="col-span-1">
                                                            <InfoField label="Department / School" value={selectedStudent.department} icon={Building2} />
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] uppercase text-stone-400 font-bold block mb-1">Course</span>
                                                            <span className="font-bold text-stone-800 text-lg leading-snug">{selectedStudent.course}</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <span className="text-[10px] uppercase text-stone-400 font-bold block mb-1">Major</span>
                                                                <span className="text-sm font-medium text-stone-700">{selectedStudent.major || "N/A"}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] uppercase text-stone-400 font-bold block mb-1">ID Number</span>
                                                                <span className="text-sm font-mono text-stone-700 bg-white px-2 py-1 rounded border border-stone-200 inline-block">{selectedStudent.idNumber}</span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] uppercase text-stone-400 font-bold block mb-1">Thesis Title</span>
                                                            <span className="text-sm italic text-stone-700 font-medium">"{selectedStudent.details?.thesis}"</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                                    <div>
                                                        <h3 className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-[0.2em] mb-5">
                                                            <User size={16}/> Personal & Family
                                                        </h3>
                                                        <div className="space-y-4 p-6 rounded-2xl border border-stone-100 bg-stone-50/30">
                                                            {/* Applied the date formatter here */}
                                                            <InfoField label="Date of Birth" value={formatDate(selectedStudent.details?.birthdate)} />
                                                            
                                                            {/* View mode conditional logic: Hide parents if guardian info is present */}
                                                            {(!selectedStudent.details?.guardian || selectedStudent.details?.guardian === "N/A") ? (
                                                                <>
                                                                    <InfoField label="Father's Name" value={selectedStudent.details?.father} />
                                                                    <InfoField label="Mother's Name" value={selectedStudent.details?.mother} />
                                                                </>
                                                            ) : (
                                                                <InfoField label="Guardian" value={selectedStudent.details?.guardian} />
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h3 className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-[0.2em] mb-5">
                                                            <MapPin size={16}/> Contact Info
                                                        </h3>
                                                        <div className="space-y-4 p-6 rounded-2xl border border-stone-100 bg-stone-50/30">
                                                            <InfoField label="Address" value={selectedStudent.details?.address} icon={Home} />
                                                            <InfoField label="Mobile Number" value={selectedStudent.details?.contactNum} icon={Phone} />
                                                            <InfoField label="Personal Email" value={selectedStudent.details?.personalEmail} icon={Mail} />
                                                        </div>
                                                    </div>
                                                </div>

                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* FOOTER: Contains the action buttons */}
                            <CardFooter className="border-t border-stone-200 bg-stone-50 p-5 flex justify-between items-center z-20 flex-shrink-0">
                                <div className="flex gap-3">
                                    <Button 
                                    variant="outline" 
                                    onClick={() => setIsEditing(true)} 
                                    disabled={isEditing}
                                    className="border-stone-300 text-stone-600 hover:bg-white hover:text-amber-700"
                                    >
                                    <Edit3 size={16} className="mr-2"/> Edit Information
                                    </Button>

                                    <Button 
                                        variant="secondary"
                                        onClick={() => setIsPhotoModalOpen(true)}
                                        className="bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200"
                                    >
                                        <ImageIcon size={16} className="mr-2"/> Add/Edit Photos
                                    </Button>
                                </div>

                                <Button 
                                  onClick={handleFinalize} 
                                  disabled={isEditing}
                                  className={`min-w-[160px] shadow-lg shadow-amber-900/10 ${selectedStudent.status === 'verified' ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-900 hover:bg-amber-800'}`}
                                >
                                  {selectedStudent.status === 'verified' ? (
                                    <><CheckCircle2 size={18} className="mr-2"/> Verified</>
                                  ) : (
                                    <><Save size={18} className="mr-2"/> Final Submit</>
                                  )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-stone-400 border-2 border-dashed border-stone-200 rounded-2xl bg-white/50">
                        <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mb-4 border border-stone-200">
                            <User size={48} className="opacity-20 text-stone-500" />
                        </div>
                        <p className="font-serif text-lg text-stone-500 font-medium">Select a graduate from the directory</p>
                        <p className="text-sm text-stone-400 mt-1">Or use the search bar above to find by ID</p>
                    </div>
                )}
            </div>
        </div>

        {/* --- CONFIRMATION DIALOGS TO PREVENT ACCIDENTAL CLICKS --- */}
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

        {/* --- Photo Manager Modal (Expanded to 85vw with proper aspect ratios) --- */}
        <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
            {/* Increased width to 85vw for a wider view and set height to auto to prevent image stretching */}
            <DialogContent className="max-w-[85vw] w-full p-0 overflow-hidden bg-stone-50 flex flex-col">
                <div className="p-6 border-b border-stone-200 bg-white flex justify-between items-center shrink-0">
                    <div>
                        <DialogTitle className="text-2xl font-bold text-stone-800">Manage Graduate Photos</DialogTitle>
                        <DialogDescription className="text-stone-500 text-base">Upload official Graduation and Creative photos using the pre-registration photo as reference.</DialogDescription>
                    </div>
                </div>
                
                {/* Set proper aspect ratios for the grid items so they look like actual photos */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-10 overflow-y-auto">
                    
                    {/* BOX 1: Pre-reg photo (For reference only, cannot be edited) */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className="bg-stone-200 text-stone-600 border-stone-300 px-3 py-1">1. Reference</Badge>
                            <span className="text-sm text-stone-500 font-bold uppercase">Pre-Reg Upload</span>
                        </div>
                        {/* Proper aspect ratio (3:4) for the picture frame with auto height */}
                        <div className="w-full aspect-[3/4] bg-stone-100 border-2 border-stone-300 rounded-2xl overflow-hidden shadow-inner relative flex items-center justify-center p-4">
                            <img src={selectedStudent?.photo} className="max-w-full max-h-full object-contain drop-shadow-md rounded-md" alt="Reference" />
                        </div>
                        <p className="text-sm text-stone-500 text-center mt-3 font-medium">Reference only.</p>
                    </div>

                    {/* BOX 2: Upload area for Graduation / Toga picture */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                             <Badge className="bg-amber-600 hover:bg-amber-700 px-3 py-1">2. Upload</Badge>
                             <span className="text-sm text-stone-500 font-bold uppercase">Graduation Picture (Toga)</span>
                        </div>
                        <div 
                            className="w-full aspect-[3/4] bg-white border-4 border-dashed border-amber-300 rounded-2xl overflow-hidden shadow-inner relative cursor-pointer hover:bg-amber-50 transition-colors flex flex-col items-center justify-center group p-4"
                            onClick={() => gradPhotoRef.current?.click()}
                        >
                            {selectedStudent?.photo_grad ? (
                                 <img src={selectedStudent.photo_grad} className="max-w-full max-h-full object-contain drop-shadow-md rounded-md" alt="Grad" />
                            ) : (
                                <div className="text-center p-6">
                                    <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <Upload size={28} />
                                    </div>
                                    <span className="text-lg font-bold text-stone-600 block">Click to Upload Toga Pic</span>
                                    <p className="text-sm text-stone-400 mt-2">High Resolution JPG or PNG</p>
                                </div>
                            )}
                            <input type="file" ref={gradPhotoRef} className="hidden" accept="image/*" onChange={(e) => {
                                if(e.target.files?.[0]) handlePhotoUpload('grad', e.target.files[0]);
                            }}/>
                        </div>
                        <p className="text-sm text-amber-600 text-center mt-3 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Click image to change</p>
                    </div>

                    {/* BOX 3: Upload area for Creative / Theme picture */}
                    <div className="flex flex-col">
                         <div className="flex items-center gap-2 mb-3">
                             <Badge className="bg-amber-600 hover:bg-amber-700 px-3 py-1">3. Upload</Badge>
                             <span className="text-sm text-stone-500 font-bold uppercase">Creative / Theme Picture</span>
                        </div>
                        <div 
                            className="w-full aspect-[3/4] bg-white border-4 border-dashed border-amber-300 rounded-2xl overflow-hidden shadow-inner relative cursor-pointer hover:bg-amber-50 transition-colors flex flex-col items-center justify-center group p-4"
                            onClick={() => creativePhotoRef.current?.click()}
                        >
                             {selectedStudent?.photo_creative ? (
                                 <img src={selectedStudent.photo_creative} className="max-w-full max-h-full object-contain drop-shadow-md rounded-md" alt="Creative" />
                            ) : (
                                <div className="text-center p-6">
                                    <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <Upload size={28} />
                                    </div>
                                    <span className="text-lg font-bold text-stone-600 block">Click to Upload Creative</span>
                                    <p className="text-sm text-stone-400 mt-2">High Resolution JPG or PNG</p>
                                </div>
                            )}
                            <input type="file" ref={creativePhotoRef} className="hidden" accept="image/*" onChange={(e) => {
                                 if(e.target.files?.[0]) handlePhotoUpload('creative', e.target.files[0]);
                            }}/>
                        </div>
                        <p className="text-sm text-amber-600 text-center mt-3 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Click image to change</p>
                    </div>
                </div>

                <DialogFooter className="p-6 bg-white border-t border-stone-200 shrink-0">
                    <Button variant="outline" size="lg" onClick={() => setIsPhotoModalOpen(false)}>Cancel & Close</Button>
                    <Button size="lg" onClick={() => setShowPhotoSaveConfirm(true)} className="bg-green-600 hover:bg-green-700 text-base px-8">Save All Photos</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}