"use client";

import { useState } from "react";
// Added Loader2 for the fetching state
import { Search, BookOpen, GraduationCap, FileText, MapPin, Phone, Mail, ChevronRight, Clock, ChevronDown, ChevronUp, Filter, FolderOpen, Folder, User, Image as ImageIcon, X, Home, CreditCard, Building2, ListFilter, ChevronLeft, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useMasterlist } from "@/hooks/useMasterlist";

// @Koi: Removed the studentsData prop. We no longer pass the heavy array from the parent.
// The component now relies entirely on the useMasterlist hook to fetch data dynamically.
export function MasterlistTab() {
  
  // Extracting our new lazy-loading states and functions from the hook
  const {
    searchQuery, setSearchQuery, selectedStudent, setSelectedStudent,
    activeDeptFilter, setActiveDeptFilter, activeStatusFilter, setActiveStatusFilter,  
    expandedDepts, toggleDept, 
    summaryData, isLoadingSummary, courseStudentsCache, fetchCourseStudents, 
    DEPARTMENT_ORDER, STATUS_STEPS
  } = useMasterlist();

  // Local states for course folders and their respective current pages
  const [expandedCourses, setExpandedCourses] = useState<string[]>([]);
  const [coursePages, setCoursePages] = useState<Record<string, number>>({});
  
  // Set to 9 students per page to maintain the perfect 3x3 grid layout in the UI
  const ITEMS_PER_PAGE = 9; 

  // @Koi: Updated this function. When a course folder is clicked, it now triggers 
  // the API fetch for Page 1 of that specific course to load the initial students.
  const toggleCourse = (courseName: string) => {
      setExpandedCourses(prev => {
        const isClosing = prev.includes(courseName);
        if (isClosing) return prev.filter(c => c !== courseName);
        
        // Fetch data from backend when opening the folder for the first time
        fetchCourseStudents(courseName, 1, ITEMS_PER_PAGE);
        return [...prev, courseName];
      });

      if (!coursePages[courseName]) {
          setCoursePages(prev => ({...prev, [courseName]: 1}));
      }
  };

  // @Koi: Helper function to handle page changes. It updates the local page state 
  // and simultaneously calls your backend to fetch the specific page data.
  const handlePageChange = (courseName: string, pageNum: number) => {
      setCoursePages(p => ({...p, [courseName]: pageNum}));
      fetchCourseStudents(courseName, pageNum, ITEMS_PER_PAGE);
  };

  // Helper to generate dynamic page numbers (e.g., 1 2 3 4 5)
  const getCoursePageNumbers = (courseName: string, totalPages: number) => {
      const current = coursePages[courseName] || 1;
      const pages = [];
      let start = Math.max(1, current - 2);
      let end = Math.min(totalPages, start + 4);
      if (end - start < 4) start = Math.max(1, end - 4);
      for (let i = start; i <= end; i++) pages.push(i);
      return pages;
  };

  // Reusable UI component for displaying information fields inside the modal
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        
        {/* --- Header Section --- */}
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
                    {/* @Koi: totalResults now comes from the lightweight summary endpoint */}
                    {isLoadingSummary ? "Loading..." : `${summaryData.totalResults || 0} Records Found`}
                </Badge>
            </div>
            
            {/* Search and Filters Section */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                    <Input 
                        placeholder="Search by Name or ID number..." 
                        className="pl-10 h-11 bg-stone-50 border-stone-200 focus:ring-amber-500/20 focus:border-amber-500" 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                    />
                </div>

                <div className="w-full md:w-48">
                    <Select value={activeStatusFilter} onValueChange={setActiveStatusFilter}>
                        <SelectTrigger className="h-11 bg-stone-50 border-stone-200">
                            <div className="flex items-center gap-2 text-stone-600">
                                <ListFilter size={16} />
                                <SelectValue placeholder="Filter Status" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Statuses</SelectItem>
                            {STATUS_STEPS.map(step => (
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

                <div className="w-full md:w-64">
                    <Select value={activeDeptFilter} onValueChange={setActiveDeptFilter}>
                        <SelectTrigger className="h-11 bg-stone-50 border-stone-200">
                            <div className="flex items-center gap-2 text-stone-600">
                                <Filter size={16} />
                                <SelectValue placeholder="Filter Department" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Departments</SelectItem>
                            {DEPARTMENT_ORDER.map(dept => (
                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>

        {/* --- Main List (Departments -> Courses -> Students) --- */}
        <div className="space-y-4 pb-10 min-h-[400px]">
            {isLoadingSummary && (
                <div className="text-center py-16 text-stone-400 bg-stone-50 rounded-2xl border border-dashed border-stone-200 flex flex-col items-center">
                    <Loader2 className="h-8 w-8 mb-4 text-amber-500 animate-spin"/>
                    <p className="text-sm font-medium">Fetching database summary...</p>
                </div>
            )}

            {!isLoadingSummary && summaryData.sortedDepts.length === 0 && (
                <div className="text-center py-16 text-stone-400 bg-stone-50 rounded-2xl border border-dashed border-stone-200 flex flex-col items-center">
                    <Search className="h-12 w-12 mb-4 opacity-20"/>
                    <p className="text-lg font-medium text-stone-500">No records found</p>
                    <p className="text-sm">Try adjusting your filters or search query.</p>
                </div>
            )}

            {!isLoadingSummary && summaryData.sortedDepts.map((dept: string) => {
                const isExpanded = expandedDepts.includes(dept);
                return (
                    <div key={dept} className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden transition-all duration-200">
                        {/* Department Header */}
                        <div 
                            onClick={() => toggleDept(dept)}
                            className={`cursor-pointer flex justify-between items-center p-4 ${isExpanded ? 'bg-stone-50 border-b border-stone-100' : 'bg-white hover:bg-stone-50'}`}
                        >
                            <div className="flex items-center gap-3">
                                {isExpanded ? <FolderOpen className="h-5 w-5 text-amber-600" /> : <Folder className="h-5 w-5 text-stone-400" />}
                                <h3 className="font-serif font-bold text-stone-800">{dept}</h3>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge variant="outline" className="text-xs font-mono text-stone-500 border-stone-200 bg-white">
                                    {summaryData.deptCounts[dept] || 0} Students
                                </Badge>
                                {isExpanded ? <ChevronUp className="h-4 w-4 text-stone-400" /> : <ChevronDown className="h-4 w-4 text-stone-400" />}
                            </div>
                        </div>

                        {/* Department Body (List of Courses) */}
                        {isExpanded && (
                            <div className="p-4 space-y-4 bg-[#FDFBF7]/30 animate-in slide-in-from-top-2 duration-200">
                                {Object.keys(summaryData.groups[dept] || {}).sort().map((program) => {
                                    
                                    const isCourseExpanded = expandedCourses.includes(program);
                                    
                                    // @Koi: Expecting summaryData.groups[dept][program] to be an integer representing the total count of students in this course
                                    const studentCount = typeof summaryData.groups[dept][program] === 'number' ? summaryData.groups[dept][program] : (summaryData.groups[dept][program]?.length || 0);
                                    
                                    const currentPage = coursePages[program] || 1;
                                    const totalPages = Math.ceil(studentCount / ITEMS_PER_PAGE) || 1;
                                    
                                    // @Koi: We extract the exact paginated students from the cache based on course and page number
                                    const cacheKey = `${program}-page-${currentPage}`;
                                    const paginatedStudents = courseStudentsCache[cacheKey] || [];
                                    const isLoadingStudents = isCourseExpanded && paginatedStudents.length === 0 && studentCount > 0;

                                    return (
                                        <div key={program} className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm">
                                            
                                            {/* Course/Program Header (Clickable Folder) */}
                                            <div 
                                                onClick={() => toggleCourse(program)}
                                                className={`cursor-pointer flex justify-between items-center p-3 transition-colors ${isCourseExpanded ? 'bg-amber-50/50 border-b border-stone-100' : 'hover:bg-stone-50'}`}
                                            >
                                                <div className="flex items-center gap-2 pl-2">
                                                    <div className="h-4 w-[3px] rounded-full bg-amber-400"></div>
                                                    <h4 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                                                        {program}
                                                    </h4>
                                                </div>
                                                <div className="flex items-center gap-3 pr-2">
                                                    <span className="text-[10px] font-bold text-stone-400">{studentCount} records</span>
                                                    {isCourseExpanded ? <ChevronUp size={14} className="text-amber-600"/> : <ChevronDown size={14} className="text-stone-400"/>}
                                                </div>
                                            </div>

                                            {/* Students Grid + Pagination per course */}
                                            {isCourseExpanded && (
                                                <div className="p-4 bg-stone-50/30 animate-in fade-in duration-200">
                                                    {isLoadingStudents ? (
                                                        <div className="flex justify-center items-center py-8">
                                                            <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
                                                            <span className="ml-2 text-xs text-stone-500">Fetching students...</span>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                            {paginatedStudents.map((student: any) => {
                                                                const statusInfo = STATUS_STEPS.find(s => s.id === student.statusStep) || STATUS_STEPS[0];
                                                                
                                                                return (
                                                                    <div 
                                                                        key={student.id} 
                                                                        onClick={() => setSelectedStudent(student)} 
                                                                        className="group bg-white p-3.5 rounded-lg border border-stone-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex justify-between items-center relative overflow-hidden"
                                                                    >
                                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                                        <div className="relative z-10 w-full">
                                                                            <div className="flex justify-between items-start mb-1">
                                                                                <p className="font-bold text-stone-800 group-hover:text-amber-800 transition-colors text-sm truncate pr-2">
                                                                                    {student.lname}, {student.fname} {student.mname?.charAt(0) ? `${student.mname.charAt(0)}.` : ""} {student.suffix}
                                                                                </p>
                                                                                <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${statusInfo.color}`} title={statusInfo.label}></div>
                                                                            </div>
                                                                            <div className="flex justify-between items-center">
                                                                                <p className="text-[11px] font-mono text-stone-500">{student.idNumber}</p>
                                                                                <span className="text-[9px] text-stone-400 font-medium uppercase">{statusInfo.label}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    )}

                                                    {/* Pagination Controls per Course */}
                                                    {totalPages > 1 && (
                                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100">
                                                            <Button 
                                                                variant="outline" size="icon" className="h-7 w-7" 
                                                                onClick={() => handlePageChange(program, Math.max(1, currentPage - 1))}
                                                                disabled={currentPage === 1}
                                                            >
                                                                <ChevronLeft className="h-3 w-3" />
                                                            </Button>
                                                            
                                                            <div className="flex gap-1">
                                                                {getCoursePageNumbers(program, totalPages).map(pageNum => (
                                                                    <Button
                                                                        key={pageNum}
                                                                        variant={currentPage === pageNum ? "default" : "ghost"}
                                                                        className={`h-7 w-7 text-[10px] ${currentPage === pageNum ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
                                                                        onClick={() => handlePageChange(program, pageNum)}
                                                                    >
                                                                        {pageNum}
                                                                    </Button>
                                                                ))}
                                                            </div>

                                                            <Button 
                                                                variant="outline" size="icon" className="h-7 w-7"
                                                                onClick={() => handlePageChange(program, Math.min(totalPages, currentPage + 1))}
                                                                disabled={currentPage === totalPages}
                                                            >
                                                                <ChevronRight className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>

        {/* --- PROFILE MODAL: Remains unchanged --- */}
        <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
            <DialogContent className="max-w-[95vw] md:max-w-7xl h-[92vh] p-0 overflow-hidden rounded-xl border-0 shadow-2xl bg-white flex flex-col md:flex-row [&>button]:hidden">
                <div className="sr-only">
                    <DialogHeader>
                        <DialogTitle>Student Profile: {selectedStudent?.lname}</DialogTitle>
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
                        {/* COLUMN 1: IDENTITY & 3 PHOTOS */}
                        <div className="w-full md:w-[360px] bg-stone-100 p-6 flex flex-col items-center border-r border-stone-200 overflow-y-auto shrink-0 relative">
                            <div className="text-center w-full mb-6 mt-8">
                                <h2 className="text-2xl font-black text-stone-900 uppercase leading-none tracking-tight">
                                    {selectedStudent.lname}, <br/> 
                                    {selectedStudent.fname} {selectedStudent.mname?.charAt(0) ? `${selectedStudent.mname.charAt(0)}.` : ""}
                                    {selectedStudent.suffix && <span className="ml-1 text-stone-600">{selectedStudent.suffix}</span>}
                                </h2>
                                <p className="text-amber-700 font-serif italic text-lg mt-1">"{selectedStudent.nickname}"</p>
                            </div>

                            {/* --- THE 3 BOXES PARA SA PHOTOS --- */}
                            <div className="w-full space-y-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold uppercase text-stone-400 pl-1 flex items-center gap-1">
                                        <ImageIcon size={10} /> Graduation Photo
                                    </span>
                                    <div className="w-full aspect-[4/5] bg-white p-2 shadow-sm border border-stone-200 rounded-lg">
                                        {selectedStudent.photo_grad ? (
                                            <img src={selectedStudent.photo_grad} className="w-full h-full object-cover rounded-sm" alt="Graduation" />
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
                                    <div className="w-full aspect-[4/5] bg-white p-2 shadow-sm border border-stone-200 rounded-lg">
                                        {selectedStudent.photo_creative ? (
                                            <img src={selectedStudent.photo_creative} className="w-full h-full object-cover rounded-sm" alt="Creative" />
                                        ) : (
                                            <div className="w-full h-full bg-stone-50 flex flex-col items-center justify-center text-stone-300">
                                                <ImageIcon size={24} className="opacity-20 mb-1"/>
                                                <span className="text-[10px] italic">Not Uploaded</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="pt-4 border-t border-stone-200">
                                    <span className="text-[10px] font-bold uppercase text-stone-400 pl-1 block mb-2 text-center">Reference (Pre-Reg)</span>
                                    <div className="w-24 h-24 bg-white p-1 shadow-sm border border-stone-200 rounded-lg mx-auto">
                                        <img src={selectedStudent.photo} className="w-full h-full object-cover rounded-sm opacity-90" alt="Reference" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* COLUMN 2: DATA DASHBOARD */}
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
                                        <InfoField label="Thesis / Capstone Title" value={`"${selectedStudent.details.thesis}"`} icon={FileText} fullWidth />
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
                                        <InfoField label="Date of Birth" value={selectedStudent.details.birthdate} />
                                        <InfoField label="Father's Name" value={selectedStudent.details.father} />
                                        <InfoField label="Mother's Name" value={selectedStudent.details.mother} />
                                        <InfoField label="Guardian" value={selectedStudent.details.guardian} />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-100">
                                        <MapPin className="text-stone-400 w-5 h-5" />
                                        <h3 className="text-sm font-bold text-stone-800 uppercase tracking-widest">Contact Details</h3>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <InfoField label="Home Address" value={selectedStudent.details.address} icon={Home} />
                                        <InfoField label="Mobile Number" value={selectedStudent.details.contact} icon={Phone} />
                                        <InfoField label="Personal Email" value={selectedStudent.details.personalEmail} icon={Mail} />
                                        <InfoField label="School Email" value={selectedStudent.details.email} icon={Mail} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* COLUMN 3: TRACKER */}
                        <div className="w-full md:w-64 bg-stone-50 border-l border-stone-200 p-6 overflow-y-auto shrink-0 pt-16 md:pt-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-stone-800 text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Clock size={14} className="text-amber-600" /> Status History
                                </h3>
                            </div>
                            
                            <div className="space-y-0 relative pl-2">
                                {STATUS_STEPS.map((step, index) => {
                                    const isDone = step.id <= (selectedStudent.statusStep || 1);
                                    const isCurrent = step.id === selectedStudent.statusStep;
                                    
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
    </div>
  );
}