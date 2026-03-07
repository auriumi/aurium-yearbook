import { useState, useEffect } from "react";

// --- 1. CONFIGURATIONS ---
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

export const STATUS_STEPS = [
  { id: 1, label: "Registered", color: "bg-stone-500" },      
  { id: 2, label: "Approved", color: "bg-blue-500" },        
  { id: 3, label: "Booked", color: "bg-orange-500" },        
  { id: 4, label: "Attended", color: "bg-purple-500" },      
  { id: 5, label: "Fully Verified", color: "bg-green-600" }, 
];

export const DEPARTMENT_ORDER = ACADEMIC_CONFIG.map(d => d.name);

// Notice: We no longer accept 'studentsData' array. We will fetch dynamically.
export function useMasterlist() {
  // --- UI STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  const [activeDeptFilter, setActiveDeptFilter] = useState<string>("ALL");
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("ALL"); 
  const [expandedDepts, setExpandedDepts] = useState<string[]>([]);

  // --- DATA STATES (For Lazy Loading) ---
  // Stores the high-level count of students per department and course
  const [summaryData, setSummaryData] = useState<any>({ groups: {}, sortedDepts: [], deptCounts: {}, totalResults: 0 });
  
  // Cache for storing paginated students fetched per course (e.g., { "BSIT-page-1": [...] })
  const [courseStudentsCache, setCourseStudentsCache] = useState<Record<string, any[]>>({});
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  // --- 1. DEBOUNCE SEARCH LOGIC ---
  // Waits 500ms after the user stops typing before triggering backend requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // --- 2. FETCH SUMMARY DATA ---
  // Triggers whenever filters or search changes.
  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoadingSummary(true);
      try {
        /* TODO (@Koi): Replace this block with your actual GET endpoint for summary data.
          Expected logic: Your backend should count how many students match the search/filters 
          and return the grouped structure so the frontend can render the folders accurately.
          
          Example implementation:
          const res = await fetch(`/api/masterlist/summary?search=${debouncedSearch}&dept=${activeDeptFilter}&status=${activeStatusFilter}`);
          const data = await res.json();
          setSummaryData(data);
        */
        
        console.log("Fetching summary from DB with:", { debouncedSearch, activeDeptFilter, activeStatusFilter });
        
        // Mocking empty structure for now to prevent UI crashes
        setSummaryData({ groups: {}, sortedDepts: [], deptCounts: {}, totalResults: 0 });

      } catch (error) {
        console.error("Failed to fetch summary data:", error);
      } finally {
        setIsLoadingSummary(false);
      }
    };

    fetchSummary();
  }, [debouncedSearch, activeDeptFilter, activeStatusFilter]);

  // --- 3. FETCH PAGINATED STUDENTS PER COURSE ---
  // Called by the UI only when a user opens a course folder or clicks next page
  const fetchCourseStudents = async (courseName: string, page: number, limit: number = 9) => {
    const cacheKey = `${courseName}-page-${page}`;
    
    // Return cached data if we already fetched this page
    if (courseStudentsCache[cacheKey]) return;

    try {
      /* TODO (@Koi): Replace this with your paginated GET endpoint for specific students.
        Expected logic: Return exactly 'limit' number of students for the given course & page.
        
        Example implementation:
        const res = await fetch(`/api/masterlist/students?course=${courseName}&page=${page}&limit=${limit}&search=${debouncedSearch}&status=${activeStatusFilter}`);
        const data = await res.json();
        setCourseStudentsCache(prev => ({ ...prev, [cacheKey]: data.students }));
      */
      
      console.log(`Fetching students -> Course: ${courseName} | Page: ${page} | Limit: ${limit}`);
      
    } catch (error) {
      console.error(`Failed to fetch students for ${courseName}:`, error);
    }
  };

  const toggleDept = (dept: string) => {
    setExpandedDepts(prev => prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]);
  };

  return {
    // States & Handlers
    searchQuery, setSearchQuery,
    selectedStudent, setSelectedStudent,
    activeDeptFilter, setActiveDeptFilter,
    activeStatusFilter, setActiveStatusFilter,
    expandedDepts, toggleDept,
    
    // Data & Fetching Functions
    summaryData, 
    isLoadingSummary,
    courseStudentsCache, 
    fetchCourseStudents,
    
    // Constants
    DEPARTMENT_ORDER, STATUS_STEPS
  };
}