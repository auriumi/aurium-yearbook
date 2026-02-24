"use client";

import { useState } from "react";
import { Card, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area"; 
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
  // STATES
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-220px)]">
        
        {/* LEFT: LIST */}
        <Card className={`lg:col-span-4 xl:col-span-3 shadow-sm flex flex-col h-full rounded-2xl ${selectedStudent ? 'hidden lg:flex' : 'flex'}`}>
            <div className="p-4 border-b bg-stone-50/50 flex justify-between items-center">
                <span className="font-bold text-stone-500 text-xs uppercase">Pending</span>
                <Badge variant="secondary">{totalUnverified}</Badge>
            </div>
            
            {/* Search Field with Button */}
            <div className="p-3 border-b flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400"/>
                    <Input 
                      placeholder="Search..." 
                      className="pl-9" 
                      value={searchInput} 
                      onChange={e => setSearchInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <Button onClick={handleSearch} variant="secondary" className="px-3 font-semibold text-stone-600">
                  Search
                </Button>
            </div>

            <ScrollArea className="flex-1 p-3">
                <div className="space-y-2">
                    {pendingStudents.length > 0 ? (
                        pendingStudents.map(student => (
                            <button key={student.student_number} onClick={() => setSelectedStudent(student)} className={`w-full text-left p-3 rounded-xl flex items-center gap-3 border transition-all ${selectedStudent?.id === student.id ? "bg-amber-50 border-amber-200 shadow-sm" : "bg-white hover:bg-stone-50 border-transparent"}`}>
                                <Avatar><AvatarImage src={student.photo} /><AvatarFallback>{student.first_name?.charAt(0)}</AvatarFallback></Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm truncate text-stone-800">{student.first_name} {student.last_name}</p>
                                    <p className="text-xs text-stone-500 font-mono">{student.student_number || "No ID"}</p>
                                </div>
                                <ChevronRight size={16} className={selectedStudent?.id === student.id ? "text-amber-500" : "text-stone-300"} />
                            </button>
                        ))
                    ) : (
                        <div className="text-center p-4 text-stone-400 text-sm">No students found.</div>
                    )}
                </div>
            </ScrollArea>

            {/* Pagination Buttons (Footer) */}
            <div className="p-3 border-t bg-stone-50/50 flex items-center justify-between">
                <Button 
                   variant="outline" 
                   size="icon" 
                   className="h-8 w-8" 
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
                          className={`h-8 w-8 text-xs ${currentPage === pageNum ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
                          onClick={() => setCurrentPage(pageNum)}
                       >
                          {pageNum}
                       </Button>
                   ))}
                </div>

                <Button 
                   variant="outline" 
                   size="icon" 
                   className="h-8 w-8"
                   onClick={() => setCurrentPage(currentPage + 1)}
                   disabled={currentPage === totalPages}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </Card>

        {/* RIGHT: DETAIL*/}
        <div className={`lg:col-span-8 xl:col-span-9 h-full ${selectedStudent ? 'block' : 'hidden lg:block'}`}>
            {selectedStudent ? (
                <Card className="h-full flex flex-col shadow-lg overflow-hidden rounded-2xl">
                    <div className="p-6 bg-stone-50 border-b flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold font-serif">{selectedStudent.first_name} {selectedStudent.last_name}</h2>
                            <p className="text-sm text-stone-500">{selectedStudent.course}</p>
                        </div>
                        <div className="text-right">
                             <Badge variant="outline" className="font-mono mb-1">{selectedStudent.student_number}</Badge>
                             {selectedStudent.last_edited_by && <div className="flex items-center gap-1 text-[10px] text-amber-600"><Clock size={10}/> Checked by {selectedStudent.last_edited_by}</div>}
                        </div>
                    </div>
                    <div className="flex-1 p-8 overflow-y-auto bg-white">
                        <div className="space-y-6">
                            <div>
                                <h3 className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-widest mb-3"><GraduationCap size={14}/> Academic</h3>
                                <div className="grid grid-cols-2 gap-4 bg-stone-50 p-4 rounded-lg border border-stone-100">
                                    <div><span className="text-[10px] font-bold text-stone-400 uppercase">Course</span><p className="font-bold">{selectedStudent.course}</p></div>
                                    <div><span className="text-[10px] font-bold text-stone-400 uppercase">Major</span><p>{selectedStudent.major || "N/A"}</p></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h3 className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-widest mb-3"><User size={14}/> Personal</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="text-stone-400 font-bold text-xs block">Email</span> {selectedStudent.personal_email}</p>
                                        <p><span className="text-stone-400 font-bold text-xs block">Birthdate</span> {selectedStudent.studentDetail?.birth_date ? String(selectedStudent.studentDetail.birth_date).substring(0,10) : 'N/A'}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-widest mb-3"><MapPin size={14}/> Location</h3>
                                    <div className="space-y-2 text-sm">
                                         <p><span className="text-stone-400 font-bold text-xs block">Address</span> {selectedStudent.studentDetail?.barangay}, {selectedStudent.studentDetail?.city}</p>
                                         <p><span className="text-stone-400 font-bold text-xs block">Province</span> {selectedStudent.studentDetail?.province}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <CardFooter className="p-4 border-t bg-stone-50 flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setSelectedStudent(null)}>Cancel</Button>
                        <Button 
                            className="bg-green-600 hover:bg-green-700" 
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
                <div className="h-full flex flex-col items-center justify-center text-stone-400 border-2 border-dashed rounded-2xl bg-white"><User size={40} className="opacity-20"/><p className="mt-2">Select a student to verify</p></div>
            )}
        </div>
    </div>
  );
}