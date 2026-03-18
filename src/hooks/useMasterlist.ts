import { useState, useEffect } from "react";
import { departmentOptions as ACADEMIC_CONFIG } from "@/components/registration/RegistrationConstants";

const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL || "";

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
  const [activeMajorFilter, setActiveMajorFilter] = useState<string>("ALL"); // added state for major filter
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("ALL"); 
  
  // --- APPLIED FILTERS ---
  // This holds the actual payload we send to the API when hitting LOAD
  const [appliedFilters, setAppliedFilters] = useState({
      dept: "ALL",
      course: "ALL",
      major: "ALL", // included major in applied filters
      status: "ALL"
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // --- DATA STATES ---
  const [students, setStudents] = useState<any[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const ITEMS_PER_PAGE = 9; 

  // Reset dependent filters when the department changes
  useEffect(() => {
      setActiveCourseFilter("ALL");
      setActiveMajorFilter("ALL"); // reset major when dept changes
  }, [activeDeptFilter]);

  // Make sure major resets if the course changes
  useEffect(() => {
      setActiveMajorFilter("ALL");
  }, [activeCourseFilter]);

  // --- EXPLICIT ACTIONS ---
  const handleSearchClick = () => {
    setAppliedSearchQuery(searchQuery.trim());
    setCurrentPage(1);
  };

  const handleLoadClick = () => {
      // update applied filters with the current major filter
      setAppliedFilters({
        dept: activeDeptFilter, 
        course: activeCourseFilter, 
        major: activeMajorFilter, 
        status: activeStatusFilter 
      });
      setAppliedSearchQuery("");
      setSearchQuery("");
      setCurrentPage(1);
  };

  const handleSearchKeyDown = (e: any) => {
      if (e.key === 'Enter') handleSearchClick();
  };

  // --- FETCHING LOGIC ---
  useEffect(() => {
    const fetchFromAPI = async () => {
      setIsLoading(true);
      try {
        let query = new URLSearchParams();

        if (appliedSearchQuery) {
          query.append("id", appliedSearchQuery);
        } else {
          query.append("page", currentPage.toString());
          query.append("dept", appliedFilters.dept);
          query.append("course", appliedFilters.course);
          query.append("major", appliedFilters.major); // pass major query to backend
          query.append("status", appliedFilters.status);
        }

        const res = await fetch(`${baseUrl}/api/admin/masterlist?${query}`, {
          credentials: 'include'
        });

        if (res.ok) {
          const data = await res.json();
          const normalizedStudents = normalizeStudents(data);

          setStudents(normalizedStudents);
          setTotalResults(normalizeTotalResults(data, normalizedStudents));
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
  }, [appliedFilters, appliedSearchQuery, currentPage]);

  return {
    searchQuery, setSearchQuery,
    selectedStudent, setSelectedStudent,
    activeDeptFilter, setActiveDeptFilter,
    activeCourseFilter, setActiveCourseFilter,
    activeMajorFilter, setActiveMajorFilter, // exported major states
    activeStatusFilter, setActiveStatusFilter,
    currentPage, setCurrentPage,
    handleSearchClick, handleLoadClick, handleSearchKeyDown,
    students, totalResults, isLoading, ITEMS_PER_PAGE,
    DEPARTMENT_ORDER, STATUS_STEPS, ACADEMIC_CONFIG
  };
}