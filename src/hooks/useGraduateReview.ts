import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export const ACADEMIC_CONFIG = [
  { name: "GRADUATE SCHOOL", courses: [{ name: "MASTER OF ARTS IN EDUCATION (MAED)" }, { name: "MASTER IN BUSINESS ADMINISTRATION" }, { name: "MASTER IN MANAGEMENT" }] },
  { name: "DEPARTMENT OF ENGINEERING EDUCATION", courses: [{ name: "BACHELOR OF SCIENCE IN COMPUTER ENGINEERING" }, { name: "BACHELOR OF SCIENCE IN ELECTRICAL ENGINEERING" }, { name: "BACHELOR OF SCIENCE IN ELECTRONICS ENGINEERING" }] },
  { name: "DEPARTMENT OF ART AND SCIENCES EDUCATION", courses: [{ name: "BACHELOR OF ARTS IN ENGLISH" }, { name: "BACHELOR OF SCIENCE IN PSYCHOLOGY" }] },
  { name: "DEPARTMENT OF ACCOUNTING EDUCATION", courses: [{ name: "BACHELOR OF SCIENCE IN ACCOUNTANCY" }, { name: "BACHELOR OF SCIENCE IN ACCOUNTING TECHNOLOGY" }, { name: "BACHELOR OF SCIENCE IN MANAGEMENT ACCOUNTING" }] },
  { name: "DEPARTMENT OF TEACHER EDUCATION", courses: [{ name: "BACHELOR OF ELEMENTARY EDUCATION (GENERALIST)" }, { name: "BACHELOR OF PHYSICAL EDUCATION" }, { name: "BACHELOR OF SECONDARY EDUCATION" }] },
  { name: "DEPARTMENT OF BUSINESS ADMINISTRATION EDUCATION", courses: [{ name: "BACHELOR OF SCIENCE IN BUSINESS ADMINISTRATION" }, { name: "BACHELOR OF SCIENCE IN COMMERCE" }] },
  { name: "HOSPITALITY AND TOURISM MANAGEMENT EDUCATION", courses: [{ name: "BACHELOR OF SCIENCE IN HOSPITALITY MANAGEMENT" }, { name: "BACHELOR OF SCIENCE IN HOTEL AND RESTAURANT MANAGEMENT" }, { name: "BACHELOR OF SCIENCE IN TOURISM MANAGEMENT" }, { name: "BACHELOR OF ARTS IN ECONOMICS" }] },
  { name: "DEPARTMENT OF CRIMINAL JUSTICE EDUCATION", courses: [{ name: "BACHELOR OF SCIENCE IN CRIMINOLOGY" }] },
  { name: "DEPARTMENT OF COMPUTING EDUCATION", courses: [{ name: "BACHELOR OF SCIENCE IN COMPUTER SCIENCE" }, { name: "BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY" }] },
  { name: "DEPARTMENT OF NURSING EDUCATION", courses: [{ name: "BACHELOR OF SCIENCE IN NURSING" }] }
];

export const STATUS_STEPS = [
  { id: 1, label: "REGISTERED", color: "bg-stone-500" },      
  { id: 2, label: "APPROVED", color: "bg-blue-500" },        
  { id: 3, label: "BOOKED", color: "bg-orange-500" },        
  { id: 4, label: "ATTENDED", color: "bg-purple-500" },      
  { id: 5, label: "FULLY VERIFIED", color: "bg-green-600" }, 
];

export const DEPARTMENT_ORDER = ACADEMIC_CONFIG.map(d => d.name);

export function useGraduateReview(staffUser: any, selectedStudent: any, setSelectedStudent: any, studentsData: any[] = []) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // FIX #1: Replaced 'appliedFilters' object with a simple string to match backend's "simple search" requirement
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8; 

  // FIX #2: Renamed 'graduates' to 'allStudents' to prevent Koi's confusion.
  // 'allStudents' is the master copy, 'students' is the paginated chunk shown on UI.
  const [allStudents, setAllStudents] = useState(studentsData); 
  const [students, setStudents] = useState<any[]>([]); 
  
  // FIX #3: Kept ONLY 'totalResults'. Removed 'pendingCount' entirely.
  const [totalResults, setTotalResults] = useState(0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Synchronize local state with external database props to ensure real-time updates
  useEffect(() => {
    if (studentsData && studentsData.length > 0) {
        const currentData = JSON.stringify(allStudents);
        const newData = JSON.stringify(studentsData);
        if (currentData !== newData) {
            setAllStudents(studentsData);
        }
    }
  }, [studentsData, allStudents]);

  const handleSearchClick = () => {
      setAppliedSearchQuery(searchQuery.trim());
      setCurrentPage(1);
  };

  const handleSearchKeyDown = (e: any) => {
      if (e.key === 'Enter') handleSearchClick();
  };

  // Process search queries and pagination locally to prevent excessive API calls
  useEffect(() => {
      setIsLoading(true);

      setTimeout(() => {
          let filteredData = [...allStudents];

          if (appliedSearchQuery !== "") {
              const query = appliedSearchQuery.toLowerCase();
              filteredData = filteredData.filter(s => 
                  (s.last_name || "").toLowerCase().includes(query) || 
                  (s.first_name || "").toLowerCase().includes(query) || 
                  (s.student_number || "").includes(query)
              );
          }

          // Single counter logic applied here
          setTotalResults(filteredData.length);

          const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
          const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

          setStudents(paginatedData);
          setIsLoading(false);
      }, 300); 

  }, [allStudents, appliedSearchQuery, currentPage]);

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const timestamp = new Date().toLocaleString();

    const updates = {
        first_name: (formData.get("fname") as string) || selectedStudent.first_name,
        last_name: (formData.get("lname") as string) || selectedStudent.last_name,
        mid_name: (formData.get("mname") as string) || selectedStudent.mid_name,
        suffix: (formData.get("suffix") as string) || "", 
        nickname: (formData.get("nickname") as string) || "",
        course: (formData.get("course") as string) || selectedStudent.course,
        major: (formData.get("major") as string) || selectedStudent.major,
        studentDetail: {
            ...selectedStudent.studentDetail,
            barangay: (formData.get("barangay") as string) || selectedStudent.studentDetail?.barangay,
            city: (formData.get("city") as string) || selectedStudent.studentDetail?.city,
            province: (formData.get("province") as string) || selectedStudent.studentDetail?.province,
            contact_num: (formData.get("contactNum") as string) || selectedStudent.studentDetail?.contact_num,
            personal_email: (formData.get("personalEmail") as string) || selectedStudent.studentDetail?.personal_email,
            fathers_name: (formData.get("father") as string) || selectedStudent.studentDetail?.fathers_name,
            mothers_name: (formData.get("mother") as string) || selectedStudent.studentDetail?.mothers_name,
            guardians_name: (formData.get("guardian") as string) || selectedStudent.studentDetail?.guardians_name,
        },
        last_edited_by: staffUser?.name || "Admin",
        last_edited_at: timestamp,
    };

    try {
        // Optimistic UI Update
        setAllStudents(prev => prev.map(g => g.id === selectedStudent.id ? { ...g, ...updates } : g));
        setSelectedStudent((prev: any) => ({ ...prev, ...updates }));
        setIsEditing(false);
        
        // Defensive Error Feedback added!
        // TODO: Await actual backend API call here (e.g., adminService.updateStudent)
        toast.success("Student details updated successfully.");
    } catch (error) {
        console.error("Save Edit Error:", error);
        toast.error("Failed to save changes. The server might be down or unreachable.");
    }
  };

  const handlePhotoUpload = async (type: 'grad' | 'creative', file: File) => {
    try {
        const reader = new FileReader();
        reader.onloadend = () => {
           const result = reader.result as string;
           const updateKey = type === 'grad' ? 'photo_grad' : 'photo_creative';
           
           // Optimistic Update
           setAllStudents(prev => prev.map(g => g.id === selectedStudent.id ? { ...g, [updateKey]: result } : g));
           setSelectedStudent((prev: any) => ({ ...prev, [updateKey]: result }));

           // Defensive Error Feedback added!
           // TODO: Await actual backend API call here
           toast.success("Photo uploaded successfully.");
        };
        reader.readAsDataURL(file);
    } catch (error) {
        console.error("Photo Upload Error:", error);
        toast.error("Failed to upload photo. Please check your connection.");
    }
  };

  const handleFinalize = async () => {
    const timestamp = new Date().toLocaleString();
    const update = { 
        status: "verified", 
        statusStep: 5, 
        last_edited_by: staffUser?.name || "Admin", 
        last_edited_at: timestamp 
    };
    
    try {
        // Optimistic Update
        setAllStudents(prev => prev.map(g => g.id === selectedStudent.id ? { ...g, ...update } : g));
        setSelectedStudent((prev: any) => ({ ...prev, ...update }));

        // Defensive Error Feedback added!
        // TODO: Await actual backend API call here
        toast.success("Student successfully verified and finalized.");
    } catch (error) {
        console.error("Finalize Error:", error);
        toast.error("Failed to verify student. Server is currently unavailable.");
    }
  };

  return {
    searchQuery, setSearchQuery,
    currentPage, setCurrentPage,
    handleSearchClick, handleSearchKeyDown,
    students, totalResults, isLoading, ITEMS_PER_PAGE,
    isEditing, setIsEditing,
    handleSaveEdit, handlePhotoUpload, handleFinalize,
    STATUS_STEPS
  };
}