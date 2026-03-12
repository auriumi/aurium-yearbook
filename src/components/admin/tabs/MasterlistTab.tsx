"use client";

import { Search, BookOpen, GraduationCap, FileText, MapPin, Phone, Mail, Clock, Filter, User, Image as ImageIcon, X, Home, Building2, ListFilter, ChevronLeft, ChevronRight, Loader2, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMasterlist } from "@/hooks/useMasterlist";

export function MasterlistTab() {
  const {
    searchQuery, setSearchQuery, selectedStudent, setSelectedStudent,
    activeDeptFilter, setActiveDeptFilter, 
    activeCourseFilter, setActiveCourseFilter,
    activeStatusFilter, setActiveStatusFilter,  
    currentPage, setCurrentPage, students, totalResults, isLoading, ITEMS_PER_PAGE,
    handleSearchClick, handleLoadClick, handleSearchKeyDown,
    DEPARTMENT_ORDER, STATUS_STEPS, ACADEMIC_CONFIG
  } = useMasterlist();

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

  const selectedDeptConfig = ACADEMIC_CONFIG.find(d => d.name === activeDeptFilter);
  const availableCourses = selectedDeptConfig ? selectedDeptConfig.courses.map(c => c.name) : [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        
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
            
            {/* FIXED OVERLAP: Added min-w-0 on main wrappers */}
            <div className="flex flex-col xl:flex-row gap-4 justify-between items-center bg-stone-50/50 p-2 rounded-xl border border-stone-100 min-w-0">
                
                {/* Type 1: Query by Name/ID */}
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
                    <Button onClick={handleSearchClick} className="h-11 px-5 bg-stone-800 hover:bg-stone-900 shadow-sm shrink-0">
                        Search
                    </Button>
                </div>

                <div className="hidden xl:block text-stone-300 font-medium text-sm px-1 shrink-0">OR</div>

                {/* Type 2: Query by Filters */}
                <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-[65%] justify-end min-w-0">
                    
                    {/* Status Dropdown */}
                    <div className="w-full sm:w-[150px] shrink-0">
                        <Select value={activeStatusFilter} onValueChange={setActiveStatusFilter}>
                            <SelectTrigger className="h-11 w-full bg-white border-stone-200 shadow-sm">
                                <div className="flex items-center gap-2 min-w-0 w-full text-stone-600">
                                    <ListFilter size={16} className="shrink-0" />
                                    {/* The [&>span] classes ensure the inner Shadcn text truncates properly */}
                                    <div className="flex-1 min-w-0 text-left [&>span]:block [&>span]:truncate">
                                        <SelectValue placeholder="Status" />
                                    </div>
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

                    {/* Department Dropdown */}
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
                                {DEPARTMENT_ORDER.map(dept => (
                                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Course Dropdown */}
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
                                {availableCourses.map(course => (
                                    <SelectItem key={course} value={course}>{course}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Load Button */}
                    <Button onClick={handleLoadClick} className="h-11 px-5 bg-amber-600 hover:bg-amber-700 shadow-sm text-white font-bold tracking-wide w-full sm:w-auto shrink-0">
                        <Download size={16} className="mr-2 shrink-0"/> LOAD
                    </Button>
                </div>

            </div>
        </div>

        {/* --- Flat Grid Results --- */}
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
                            const statusInfo = STATUS_STEPS.find(s => s.label === student.studentAuth.status);
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
                                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${statusInfo!.color} shadow-sm`} title={statusInfo!.label}></div>
                                        </div>
                                        <p className="text-[11px] font-mono text-stone-500 mt-1">{student.student_number}</p>
                                    </div>

                                    <div className="relative z-10 w-full pl-1 pt-3 border-t border-stone-200 flex justify-between items-center gap-2">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[9px] font-bold text-stone-400 truncate uppercase">{student.course}</p>
                                        </div>
                                        <span className="text-[9px] text-stone-500 font-bold uppercase tracking-wide bg-stone-100 px-2 py-1 rounded-md shrink-0">{statusInfo!.label}</span>
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

        {/* --- PROFILE MODAL: --- */}
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
                                        <img src={selectedStudent.studentDetail.photo_url ? getObjectKey(selectedStudent.studentDetail.photo_url) : undefined} className="w-full h-full object-cover rounded-sm opacity-90" alt="Reference" />
                                    </div>
                                </div>
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
                                        <InfoField label="Date of Birth" value={selectedStudent.studentDetail.birth_date} />
                                        <InfoField label="Father's Name" value={selectedStudent.studentDetail.fathers_name} />
                                        <InfoField label="Mother's Name" value={selectedStudent.studentDetail.mothers_name} />
                                        <InfoField label="Guardian" value={selectedStudent.studentDetail.guardians_name} />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-100">
                                        <MapPin className="text-stone-400 w-5 h-5" />
                                        <h3 className="text-sm font-bold text-stone-800 uppercase tracking-widest">Contact Details</h3>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <InfoField label="Home Address" value={selectedStudent.studentDetail.province} icon={Home} />
                                        <InfoField label="Mobile Number" value={selectedStudent.studentDetail.contact_num} icon={Phone} />
                                        <InfoField label="Personal Email" value={selectedStudent.personal_email} icon={Mail} />
                                        <InfoField label="School Email" value={selectedStudent.school_email} icon={Mail} />
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
                                {STATUS_STEPS.map((step, index) => {
                                    const isDone = step.id <= STATUS_STEPS.find(s => s.label === selectedStudent.studentAuth.status)!.id; 
                                    const isCurrent = step.label === selectedStudent.studentAuth.status;
                                    
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