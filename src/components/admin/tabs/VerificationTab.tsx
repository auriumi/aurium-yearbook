"use client";

import { useState } from "react";
import { Card, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, ChevronRight, Clock, User, GraduationCap, MapPin, ChevronLeft } from "lucide-react";

type VerifacationProps = {
  pendingStudents: any[];
  currentPage: number;
  totalUnverified: number;
  onVerify: (id: number) => void;
  onSearch: (student_id: number) => void;
  setCurrentPage: (page: number) => void;
}

export function VerificationTab({ pendingStudents, currentPage, totalUnverified, setCurrentPage, onVerify, onSearch }: VerifacationProps) {
  const [searchInput, setSearchInput] = useState(""); 
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  const ITEMS_PER_PAGE = 8; 

  const handleSearch = () => {
    onSearch(parseInt(searchInput));
    setSelectedStudent(null);
  };

  const totalPages = Math.ceil(totalUnverified / ITEMS_PER_PAGE) || 1;

  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const formatFriendlyDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-160px)] min-h-0">
        
        {/* LEFT: LIST (COMPRESSED TO FIT 8 ITEMS) */}
        <Card className={`lg:col-span-4 xl:col-span-3 shadow-sm flex flex-col h-full rounded-2xl min-h-0 overflow-hidden ${selectedStudent ? 'hidden lg:flex' : 'flex'}`}>
            
            {/* Header: Reduced padding to py-3 */}
            <div className="py-3 px-4 border-b bg-stone-50/50 flex justify-between items-center shrink-0">
                <span className="font-bold text-stone-500 text-xs uppercase">Pending</span>
                <Badge variant="secondary">{totalUnverified}</Badge>
            </div>
            
            {/* Search: Reduced heights and padding to save space */}
            <div className="py-2 px-3 border-b flex gap-2 shrink-0">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2 h-4 w-4 text-stone-400"/>
                    <Input 
                      placeholder="Search..." 
                      className="pl-8 h-8 text-sm" 
                      value={searchInput} 
                      onChange={e => setSearchInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <Button onClick={handleSearch} variant="secondary" className="h-8 px-3 font-semibold text-stone-600 text-sm">
                  Search
                </Button>
            </div>

            {/* List: Reduced gaps (space-y-1.5) and card padding (py-2) */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-stone-50/30">
                <div className="space-y-1.5 p-2 pr-3 pb-2">
                    {pendingStudents.length > 0 ? (
                        pendingStudents.map(student => (
                            <button key={student.student_number} onClick={() => setSelectedStudent(student)} className={`w-full text-left py-2 px-3 rounded-xl flex items-center gap-3 transition-all ${selectedStudent?.id === student.id ? "bg-amber-50 ring-1 ring-amber-500 shadow-sm" : "bg-white border border-stone-200 hover:ring-1 hover:ring-amber-300"}`}>
                                <Avatar className="h-9 w-9 shadow-sm"><AvatarImage src={student.photo} /><AvatarFallback className="text-xs">{student.first_name?.charAt(0)}</AvatarFallback></Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-[13px] leading-snug truncate text-stone-800">
                                        {student.first_name} {student.mid_name?.charAt(0) ? `${student.mid_name.charAt(0)}.` : ""} {student.last_name}
                                    </p>
                                    <p className="text-[11px] text-stone-500 font-mono leading-none mt-0.5">{student.student_number || "No ID"}</p>
                                </div>
                                <ChevronRight size={16} className={`shrink-0 ${selectedStudent?.id === student.id ? "text-amber-500" : "text-stone-300"}`} />
                            </button>
                        ))
                    ) : (
                        <div className="text-center p-4 text-stone-400 text-sm">No students found.</div>
                    )}
                </div>
            </div>

            {/* Footer: Reduced padding and button heights to h-7 */}
            <div className="py-2 px-3 border-t bg-white relative z-10 flex items-center justify-between shrink-0 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                <Button 
                   variant="outline" 
                   size="icon" 
                   className="h-7 w-7 rounded-lg" 
                   onClick={() => setCurrentPage(currentPage - 1)}
                   disabled={currentPage === 1}
                >
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

                <Button 
                   variant="outline" 
                   size="icon" 
                   className="h-7 w-7 rounded-lg"
                   onClick={() => setCurrentPage(currentPage + 1)}
                   disabled={currentPage === totalPages}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </Card>

        {/* RIGHT: DETAIL */}
        <div className={`lg:col-span-8 xl:col-span-9 h-full min-h-0 ${selectedStudent ? 'block' : 'hidden lg:block'}`}>
            {selectedStudent ? (
                <Card className="h-full flex flex-col shadow-lg overflow-hidden rounded-2xl min-h-0">
                    <div className="p-8 bg-stone-50 border-b flex justify-between items-start shrink-0">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black font-serif text-stone-800 mb-1">
                                {selectedStudent.first_name} {selectedStudent.mid_name} {selectedStudent.last_name} {selectedStudent.suffix}
                            </h2>
                            <p className="text-sm md:text-base text-stone-500 font-medium tracking-wide">
                                {selectedStudent.course}
                            </p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                             <Badge variant="outline" className="font-mono text-sm px-3 py-1 bg-white shadow-sm">
                                 {selectedStudent.student_number}
                             </Badge>
                             {selectedStudent.last_edited_by && (
                                 <div className="flex items-center gap-1.5 text-xs text-amber-700 font-medium bg-amber-100/50 px-2 py-1 rounded-md">
                                     <Clock size={12}/> Checked by {selectedStudent.last_edited_by}
                                 </div>
                             )}
                        </div>
                    </div>

                    <div className="flex-1 p-8 overflow-y-auto bg-white min-h-0">
                        <div className="space-y-8 max-w-5xl mx-auto">
                            
                            {/* Academic Section */}
                            <div className="bg-stone-50/70 p-6 md:p-8 rounded-2xl border border-stone-100">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-amber-600 uppercase tracking-widest mb-6">
                                    <GraduationCap size={18}/> Academic Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">Course Program</span>
                                        <p className="text-lg font-bold text-stone-800">{selectedStudent.course}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">Major</span>
                                        <p className="text-lg font-semibold text-stone-700">{selectedStudent.major || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Personal & Location Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                
                                {/* Personal Section */}
                                <div className="bg-stone-50/70 p-6 md:p-8 rounded-2xl border border-stone-100">
                                    <h3 className="flex items-center gap-2 text-sm font-bold text-amber-600 uppercase tracking-widest mb-6">
                                        <User size={18}/> Personal Details
                                    </h3>
                                    <div className="space-y-5">
                                        <div>
                                            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">Email Address</span>
                                            <p className="text-base font-medium text-stone-800">{selectedStudent.personal_email}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">Birthdate</span>
                                            <p className="text-base font-medium text-stone-800">
                                              {selectedStudent.studentDetail?.birth_date ? formatFriendlyDate(selectedStudent.studentDetail.birth_date) : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Location Section */}
                                <div className="bg-stone-50/70 p-6 md:p-8 rounded-2xl border border-stone-100">
                                    <h3 className="flex items-center gap-2 text-sm font-bold text-amber-600 uppercase tracking-widest mb-6">
                                        <MapPin size={18}/> Location
                                    </h3>
                                    <div className="space-y-5">
                                         <div>
                                            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">City / Municipality</span>
                                            <p className="text-base font-medium text-stone-800">{selectedStudent.studentDetail?.barangay}, {selectedStudent.studentDetail?.city}</p>
                                         </div>
                                         <div>
                                            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">Province</span>
                                            <p className="text-base font-medium text-stone-800">{selectedStudent.studentDetail?.province}</p>
                                         </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                    
                    <CardFooter className="p-5 border-t bg-stone-50 flex justify-end gap-3 shrink-0">
                        <Button variant="outline" className="px-6" onClick={() => setSelectedStudent(null)}>Cancel</Button>
                        <Button 
                            className="bg-green-600 hover:bg-green-700 px-8 shadow-md shadow-green-600/20" 
                            onClick={() => { 
                                onVerify(selectedStudent.student_number); 
                                setSelectedStudent(null); 
                            }}
                        >
                            Approve Verification
                        </Button>
                    </CardFooter>
                </Card>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-stone-400 border-2 border-dashed rounded-2xl bg-white min-h-0"><User size={40} className="opacity-20"/><p className="mt-2">Select a student to verify</p></div>
            )}
        </div>
    </div>
  );
}