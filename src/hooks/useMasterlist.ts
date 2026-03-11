import { useState, useEffect } from "react";

// --- 1. CONFIGURATIONS ---
export const ACADEMIC_CONFIG = [
  {
    name: "GRADUATE SCHOOL",
    courses: [
      { name: "MASTER OF ARTS IN EDUCATION (MAED)" },
      { name: "MASTER IN BUSINESS ADMINISTRATION" },
      { name: "MASTER IN MANAGEMENT" }
    ]
  },
  {
    name: "DEPARTMENT OF ENGINEERING EDUCATION",
    courses: [
      { name: "BACHELOR OF SCIENCE IN COMPUTER ENGINEERING" },
      { name: "BACHELOR OF SCIENCE IN ELECTRICAL ENGINEERING" },
      { name: "BACHELOR OF SCIENCE IN ELECTRONICS ENGINEERING" }
    ]
  },
  {
    name: "DEPARTMENT OF ART AND SCIENCES EDUCATION",
    courses: [
      { name: "BACHELOR OF ARTS IN ENGLISH" },
      { name: "BACHELOR OF SCIENCE IN PSYCHOLOGY" }
    ]
  },
  {
    name: "DEPARTMENT OF ACCOUNTING EDUCATION",
    courses: [
      { name: "BACHELOR OF SCIENCE IN ACCOUNTANCY" },
      { name: "BACHELOR OF SCIENCE IN ACCOUNTING TECHNOLOGY" },
      { name: "BACHELOR OF SCIENCE IN MANAGEMENT ACCOUNTING" }
    ]
  },
  {
    name: "DEPARTMENT OF TEACHER EDUCATION",
    courses: [
      { name: "BACHELOR OF ELEMENTARY EDUCATION (GENERALIST)" },
      { name: "BACHELOR OF PHYSICAL EDUCATION" },
      { name: "BACHELOR OF SECONDARY EDUCATION" }
    ]
  },
  {
    name: "DEPARTMENT OF BUSINESS ADMINISTRATION EDUCATION",
    courses: [
      { name: "BACHELOR OF SCIENCE IN BUSINESS ADMINISTRATION" },
      { name: "BACHELOR OF SCIENCE IN COMMERCE" }
    ]
  },
  {
    name: "HOSPITALITY AND TOURISM MANAGEMENT EDUCATION",
    courses: [
      { name: "BACHELOR OF SCIENCE IN HOSPITALITY MANAGEMENT" },
      { name: "BACHELOR OF SCIENCE IN HOTEL AND RESTAURANT MANAGEMENT" },
      { name: "BACHELOR OF SCIENCE IN TOURISM MANAGEMENT" },
      { name: "BACHELOR OF ARTS IN ECONOMICS" }
    ]
  },
  {
    name: "DEPARTMENT OF CRIMINAL JUSTICE EDUCATION",
    courses: [
      { name: "BACHELOR OF SCIENCE IN CRIMINOLOGY" }
    ]
  },
  {
    name: "DEPARTMENT OF COMPUTING EDUCATION",
    courses: [
      { name: "BACHELOR OF SCIENCE IN COMPUTER SCIENCE" },
      { name: "BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY" }
    ]
  },
  {
    name: "DEPARTMENT OF NURSING EDUCATION",
    courses: [
      { name: "BACHELOR OF SCIENCE IN NURSING" }
    ]
  }
];

export const STATUS_STEPS = [
  { id: 1, label: "Registered", color: "bg-stone-500" },      
  { id: 2, label: "Approved", color: "bg-blue-500" },        
  { id: 3, label: "Booked", color: "bg-orange-500" },        
  { id: 4, label: "Attended", color: "bg-purple-500" },      
  { id: 5, label: "Fully Verified", color: "bg-green-600" }, 
];

export const DEPARTMENT_ORDER = ACADEMIC_CONFIG.map(d => d.name);

export function useMasterlist() {
  // --- UI INPUT STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDeptFilter, setActiveDeptFilter] = useState<string>("ALL");
  const [activeCourseFilter, setActiveCourseFilter] = useState<string>("ALL"); 
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("ALL"); 
  
  // --- APPLIED FILTERS ---
  const [appliedFilters, setAppliedFilters] = useState({
      search: "",
      dept: "ALL",
      course: "ALL",
      status: "ALL"
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // --- DATA STATES ---
  const [students, setStudents] = useState<any[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const ITEMS_PER_PAGE = 9; 

  // Reset Course Filter kung ilisan ang Department
  useEffect(() => {
      setActiveCourseFilter("ALL");
  }, [activeDeptFilter]);

  // --- EXPLICIT ACTIONS ---
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

  // --- FETCHING LOGIC (API INTEGRATION READY) ---
  useEffect(() => {
      const fetchFromAPI = async () => {
          setIsLoading(true);
          try {
              /* TODO (@Koi): Replace this with your actual database query endpoint.
                The frontend now uses a Flat Grid structure to avoid N+1 query problems.
                
                Expected implementation:
                const queryParams = new URLSearchParams({
                    page: currentPage.toString(),
                    limit: ITEMS_PER_PAGE.toString(),
                    search: appliedFilters.search,
                    dept: appliedFilters.dept,
                    course: appliedFilters.course,
                    status: appliedFilters.status
                });

                const res = await fetch(`/api/masterlist?${queryParams}`);
                const data = await res.json();
                
                setStudents(data.students);
                setTotalResults(data.totalResults);
              */
              
              console.log("Ready for API Call with params:", { ...appliedFilters, page: currentPage });
              
              // Temporary empty state until API is hooked up
              setStudents([]);
              setTotalResults(0);
          } catch (error) {
              console.error("Failed to fetch students:", error);
              setStudents([]);
              setTotalResults(0);
          } finally {
              setIsLoading(false);
          }
      };

      fetchFromAPI();
  }, [appliedFilters, currentPage]);

  return {
    searchQuery, setSearchQuery,
    selectedStudent, setSelectedStudent,
    activeDeptFilter, setActiveDeptFilter,
    activeCourseFilter, setActiveCourseFilter,
    activeStatusFilter, setActiveStatusFilter,
    currentPage, setCurrentPage,
    handleSearchClick, handleLoadClick, handleSearchKeyDown,
    students, totalResults, isLoading, ITEMS_PER_PAGE,
    DEPARTMENT_ORDER, STATUS_STEPS, ACADEMIC_CONFIG
  };
}