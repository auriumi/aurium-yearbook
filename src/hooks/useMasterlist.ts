import { useState, useEffect } from "react";
const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL || "";

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
  { id: 1, label: "REGISTERED", color: "bg-stone-500" },      
  { id: 2, label: "APPROVED", color: "bg-blue-500" },        
  { id: 3, label: "BOOKED", color: "bg-orange-500" },        
  { id: 4, label: "ATTENDED", color: "bg-purple-500" },      
  { id: 5, label: "FULLY VERIFIED", color: "bg-green-600" }, 
];

export const DEPARTMENT_ORDER = ACADEMIC_CONFIG.map(d => d.name);

const normalizeStudents = (data: any): any[] => {
  if (Array.isArray(data?.students)) return data.students;
  if (Array.isArray(data?.data?.students)) return data.data.students;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.result)) return data.result;
  if (data?.student && typeof data.student === "object") return [data.student];

  if (data && typeof data === "object" && !Array.isArray(data) && ("student_number" in data || "id" in data)) {
    return [data];
  }

  return [];
};

const normalizeTotalResults = (data: any, normalizedStudents: any[]): number => {
  if (typeof data?.total_result === "number") return data.total_result;
  if (typeof data?.totalResults === "number") return data.totalResults;
  if (typeof data?.total === "number") return data.total;
  if (typeof data?.count === "number") return data.count;
  return normalizedStudents.length;
};

export function useMasterlist() {
  // --- UI INPUT STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [activeDeptFilter, setActiveDeptFilter] = useState<string>("ALL");
  const [activeCourseFilter, setActiveCourseFilter] = useState<string>("ALL"); 
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("ALL"); 
  
  // --- APPLIED FILTERS ---
  const [appliedFilters, setAppliedFilters] = useState({
      dept: "ALL",
      course: "ALL",
      status: "ALL"
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // --- DATA STATES ---
  const [students, setStudents] = useState<any[]>([]);
  const [studentCache, setStudentCache] = useState<{ [key: string]: { students: any[], total: number } }>({});
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const ITEMS_PER_PAGE = 9; 

  useEffect(() => {
      setActiveCourseFilter("ALL");
  }, [activeDeptFilter]);

  // --- EXPLICIT ACTIONS ---
  const handleSearchClick = () => {
    setAppliedSearchQuery(searchQuery.trim());
    setCurrentPage(1);
  };

  const handleLoadClick = () => {
      setAppliedFilters({dept: activeDeptFilter, course: activeCourseFilter, status: activeStatusFilter });
      setAppliedSearchQuery("");
      setSearchQuery("");
      setCurrentPage(1);
  };

  const handleSearchKeyDown = (e: any) => {
      if (e.key === 'Enter') handleSearchClick();
  };

  const invalidateCache = () => {
    setStudentCache({});
  };

  // --- FETCHING LOGIC ---
  useEffect(() => {
    const fetchFromAPI = async () => {
      const cacheKey = `page=${currentPage}&dept=${appliedFilters.dept}&course=${appliedFilters.course}&status=${appliedFilters.status}&search=${appliedSearchQuery}`;

      if (studentCache[cacheKey]) {
        setStudents(studentCache[cacheKey].students);
        setTotalResults(studentCache[cacheKey].total);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        let query = new URLSearchParams();

        if (appliedSearchQuery) {
          query.append("id", appliedSearchQuery);
        } else {
          query.append("page", currentPage.toString());
          query.append("dept", appliedFilters.dept);
          query.append("course", appliedFilters.course);
          query.append("status", appliedFilters.status);
        }

        const res = await fetch(`${baseUrl}/api/admin/masterlist?${query}`, {
          credentials: 'include'
        });

        if (res.ok) {
          const data = await res.json();
          const studentList = normalizeStudents(data);
          const total = normalizeTotalResults(data, studentList);

          setStudents(studentList);
          setTotalResults(total);

          //store new data in cache
          setStudentCache(prevCache => ({
            ...prevCache,
            [cacheKey]: { students: studentList, total: total }
          }));
        } else {
          setStudents([]);
          setTotalResults(0);
        }
      } catch (error) {
        console.error("Failed to fetch students:", error);
        setStudents([]);
        setTotalResults(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFromAPI();
  }, [appliedFilters, appliedSearchQuery, currentPage, studentCache]);

  return {
    searchQuery, setSearchQuery,
    selectedStudent, setSelectedStudent,
    activeDeptFilter, setActiveDeptFilter,
    activeCourseFilter, setActiveCourseFilter,
    activeStatusFilter, setActiveStatusFilter,
    currentPage, setCurrentPage,
    handleSearchClick, handleLoadClick, handleSearchKeyDown,
    students, totalResults, isLoading, ITEMS_PER_PAGE,
    DEPARTMENT_ORDER, STATUS_STEPS, ACADEMIC_CONFIG,
    invalidateCache
  };
}