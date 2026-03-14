import { useState, useMemo, useEffect } from "react";

// --- 1. CONFIGURATION ---
// I set up the departments here to use for dropdown filters and ordering in the UI.
export const ACADEMIC_CONFIG = [
  {
    name: "GRADUATE SCHOOL",
    courses: [
      { name: "MASTER OF ARTS IN EDUCATION (MAED)", majors: ["EDUCATIONAL MANAGEMENT", "GUIDANCE & COUNSELING", "PHYSICAL EDUCATION", "TEACHING ENGLISH", "TEACHING MATHEMATICS", "TEACHING SCIENCE"] },
      { name: "MASTER IN BUSINESS ADMINISTRATION", majors: [] },
      { name: "MASTER IN MANAGEMENT", majors: [] }
    ]
  },
  {
    name: "DEPARTMENT OF ENGINEERING EDUCATION",
    courses: [
      { name: "BACHELOR OF SCIENCE IN COMPUTER ENGINEERING", majors: [] },
      { name: "BACHELOR OF SCIENCE IN ELECTRICAL ENGINEERING", majors: [] },
      { name: "BACHELOR OF SCIENCE IN ELECTRONICS ENGINEERING", majors: [] }
    ]
  },
  {
    name: "DEPARTMENT OF ART AND SCIENCES EDUCATION",
    courses: [
      { name: "BACHELOR OF ARTS IN ENGLISH", majors: [] },
      { name: "BACHELOR OF SCIENCE IN PSYCHOLOGY", majors: [] }
    ]
  },
  {
    name: "DEPARTMENT OF ACCOUNTING EDUCATION",
    courses: [
      { name: "BACHELOR OF SCIENCE IN ACCOUNTANCY", majors: [] },
      { name: "BACHELOR OF SCIENCE IN ACCOUNTING TECHNOLOGY", majors: [] },
      { name: "BACHELOR OF SCIENCE IN MANAGEMENT ACCOUNTING", majors: [] }
    ]
  },
  {
    name: "DEPARTMENT OF TEACHER EDUCATION",
    courses: [
      { name: "BACHELOR OF ELEMENTARY EDUCATION (GENERALIST)", majors: [] },
      { name: "BACHELOR OF PHYSICAL EDUCATION", majors: [] },
      { name: "BACHELOR OF SECONDARY EDUCATION", majors: ["ENGLISH", "FILIPINO", "MATHEMATICS", "SCIENCE", "SOCIAL STUDIES"] }
    ]
  },
  {
    name: "DEPARTMENT OF BUSINESS ADMINISTRATION EDUCATION",
    courses: [
      { name: "BACHELOR OF SCIENCE IN BUSINESS ADMINISTRATION", majors: ["FINANCIAL MANAGEMENT", "HUMAN RESOURCE MANAGEMENT", "MARKETING MANAGEMENT"] },
      { name: "BACHELOR OF SCIENCE IN COMMERCE", majors: ["MANAGEMENT"] }
    ]
  },
  {
    name: "HOSPITALITY AND TOURISM MANAGEMENT EDUCATION",
    courses: [
      { name: "BACHELOR OF SCIENCE IN HOSPITALITY MANAGEMENT", majors: [] },
      { name: "BACHELOR OF SCIENCE IN HOTEL AND RESTAURANT MANAGEMENT", majors: [] },
      { name: "BACHELOR OF SCIENCE IN TOURISM MANAGEMENT", majors: [] },
      { name: "BACHELOR OF ARTS IN ECONOMICS", majors: [] }
    ]
  },
  {
    name: "DEPARTMENT OF CRIMINAL JUSTICE EDUCATION",
    courses: [
      { name: "BACHELOR OF SCIENCE IN CRIMINOLOGY", majors: [] }
    ]
  },
  {
    name: "DEPARTMENT OF COMPUTING EDUCATION",
    courses: [
      { name: "BACHELOR OF SCIENCE IN COMPUTER SCIENCE", majors: [] },
      { name: "BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY", majors: [] }
    ]
  },
  {
    name: "DEPARTMENT OF NURSING EDUCATION",
    courses: [
      { name: "BACHELOR OF SCIENCE IN NURSING", majors: [] }
    ]
  }
];

export const DEPARTMENT_ORDER = ACADEMIC_CONFIG.map(d => d.name);

// --- 2. STATUS STEPS ---
export const STATUS_STEPS = [
  { id: 'pending', label: "Pending Review", color: "bg-amber-500" },      
  { id: 'verified', label: "Verified Final", color: "bg-green-600" }
];

// =========================================================================

export function useGraduateReview(staffUser: any, selectedStudent: any, setSelectedStudent: any, studentsData: any[] = []) {
  // --- UI INPUT STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDeptFilter, setActiveDeptFilter] = useState<string>("ALL");
  const [activeCourseFilter, setActiveCourseFilter] = useState<string>("ALL"); 
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("ALL"); 
  
  // --- APPLIED FILTERS (Triggers logic only on explicitly clicking Search or Load) ---
  const [appliedFilters, setAppliedFilters] = useState({
      search: "",
      dept: "ALL",
      course: "ALL",
      status: "ALL"
  });

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8; // Fits exactly on the UI without scrolling

  // Data states
  const [graduates, setGraduates] = useState(studentsData); 
  const [students, setStudents] = useState<any[]>([]); // Paginated list for the UI
  const [totalResults, setTotalResults] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Update local state if new data is fed from the database
  useEffect(() => {
    // I added a JSON.stringify check here to prevent infinite loops when feeding data from the DB
    const currentData = JSON.stringify(graduates);
    const newData = JSON.stringify(studentsData);
    
    if (currentData !== newData) {
        setGraduates(studentsData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentsData]);

  // Reset Course Filter when the Department dropdown changes
  useEffect(() => {
      setActiveCourseFilter("ALL");
  }, [activeDeptFilter]);

  // --- EXPLICIT FILTER ACTIONS ---
  const handleSearchClick = () => {
      setAppliedFilters({ search: searchQuery, dept: "ALL", course: "ALL", status: "ALL" });
      setActiveDeptFilter("ALL");
      setActiveCourseFilter("ALL");
      setActiveStatusFilter("ALL");
      setCurrentPage(1);
  };

  const handleLoadClick = () => {
      setAppliedFilters({ search: "", dept: activeDeptFilter, course: activeCourseFilter, status: activeStatusFilter });
      setSearchQuery("");
      setCurrentPage(1);
  };

  const handleSearchKeyDown = (e: any) => {
      if (e.key === 'Enter') handleSearchClick();
  };

  // --- FLAT LIST FILTERING LOGIC ---
  useEffect(() => {
      setIsLoading(true);

      // Timeout added just to simulate network request behavior (can be removed when linking real API)
      setTimeout(() => {
          let filteredData = [...graduates];

          // 1. Check Department Filter
          if (appliedFilters.dept !== "ALL") {
              filteredData = filteredData.filter(s => s.department === appliedFilters.dept);
          }

          // 2. Check Course Filter
          if (appliedFilters.course !== "ALL") {
              filteredData = filteredData.filter(s => (s.course || s.program) === appliedFilters.course);
          }

          // 3. Check Status Filter
          if (appliedFilters.status !== "ALL") {
              filteredData = filteredData.filter(s => s.status === appliedFilters.status);
          }

          // 4. Check Search Query
          if (appliedFilters.search.trim() !== "") {
              const query = appliedFilters.search.toLowerCase();
              filteredData = filteredData.filter(s => 
                  (s.lname || "").toLowerCase().includes(query) || 
                  (s.fname || "").toLowerCase().includes(query) || 
                  (s.idNumber || "").includes(query)
              );
          }

          // Calculate pending records based on the filtered set
          const pending = filteredData.filter(s => s.status !== 'verified').length;
          setPendingCount(pending);
          setTotalResults(filteredData.length);

          // Slicing for pagination
          const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
          const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

          setStudents(paginatedData);
          setIsLoading(false);
      }, 300); 

  }, [graduates, appliedFilters, currentPage]);


  // --- MUTATION ACTIONS (Preserved from old logic) ---
  const handleSaveEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const timestamp = new Date().toLocaleString();

    const updates = {
        fname: (formData.get("fname") as string) || selectedStudent.fname,
        lname: (formData.get("lname") as string) || selectedStudent.lname,
        mname: (formData.get("mname") as string) || selectedStudent.mname,
        suffix: (formData.get("suffix") as string) || "", 
        nickname: (formData.get("nickname") as string) || "",
        course: (formData.get("course") as string) || selectedStudent.course,
        major: (formData.get("major") as string) || selectedStudent.major,
        details: {
            ...selectedStudent.details,
            address: (formData.get("address") as string) || selectedStudent.details?.address,
            contactNum: (formData.get("contactNum") as string) || selectedStudent.details?.contactNum,
            personalEmail: (formData.get("personalEmail") as string) || selectedStudent.details?.personalEmail,
            father: (formData.get("father") as string) || selectedStudent.details?.father,
            mother: (formData.get("mother") as string) || selectedStudent.details?.mother,
            guardian: (formData.get("guardian") as string) || selectedStudent.details?.guardian,
        },
        last_edited_by: staffUser?.name || "Admin",
        last_edited_at: timestamp,
    };

    setGraduates(prev => prev.map(g => g.id === selectedStudent.id ? { ...g, ...updates } : g));
    setSelectedStudent((prev: any) => ({ ...prev, ...updates }));
    setIsEditing(false);
  };

  const handlePhotoUpload = (type: 'grad' | 'creative', file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
       const result = reader.result as string;
       const updateKey = type === 'grad' ? 'photo_grad' : 'photo_creative';
       
       setGraduates(prev => prev.map(g => g.id === selectedStudent.id ? { ...g, [updateKey]: result } : g));
       setSelectedStudent((prev: any) => ({ ...prev, [updateKey]: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleFinalize = () => {
    const timestamp = new Date().toLocaleString();
    const update = { 
        status: "verified", 
        statusStep: 5, 
        last_edited_by: staffUser?.name || "Admin", 
        last_edited_at: timestamp 
    };
    setGraduates(prev => prev.map(g => g.id === selectedStudent.id ? { ...g, ...update } : g));
    setSelectedStudent((prev: any) => ({ ...prev, ...update }));
  };

  return {
    // UI States
    searchQuery, setSearchQuery,
    activeDeptFilter, setActiveDeptFilter,
    activeCourseFilter, setActiveCourseFilter,
    activeStatusFilter, setActiveStatusFilter,
    currentPage, setCurrentPage,
    
    // Explicit Actions
    handleSearchClick, handleLoadClick, handleSearchKeyDown,
    
    // Data & Computed
    students, totalResults, pendingCount, isLoading, ITEMS_PER_PAGE,
    
    // Edit & Mutation States
    isEditing, setIsEditing,
    handleSaveEdit, handlePhotoUpload, handleFinalize,
    
    // Configurations
    DEPARTMENT_ORDER, STATUS_STEPS, ACADEMIC_CONFIG
  };
}