import { useState, useEffect } from "react";
import toast from "react-hot-toast"; // Added toast for feedback messages

const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL || "";

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

// FIX #2: Stripped out all unnecessary filter boilerplates (dept, course, major, status). 
// Converted to a simple "Search and Return" structure as requested by backend lead.
export function useMasterlist() {
  // --- UI INPUT STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // --- DATA STATES (Unified Naming) ---
  const [students, setStudents] = useState<any[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const ITEMS_PER_PAGE = 8; // Matched to VerificationTab

  // --- EXPLICIT ACTIONS ---
  const handleSearchClick = () => {
    setAppliedSearchQuery(searchQuery.trim());
    setCurrentPage(1);
    setSelectedStudent(null);
  };

  const handleSearchKeyDown = (e: any) => {
      if (e.key === 'Enter') handleSearchClick();
  };

  // --- FETCHING LOGIC (Simple Search and Return) ---
  useEffect(() => {
    const fetchFromAPI = async () => {
      setIsLoading(true);
      try {
        let query = new URLSearchParams();

        if (appliedSearchQuery) {
          // If there is a search query, prioritize passing the ID
          query.append("id", appliedSearchQuery);
        } else {
          // Otherwise, just fetch the paginated list
          query.append("page", currentPage.toString());
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
          // Alert the admin if the server responds with an error (e.g. 500 Internal Server Error)
          toast.error("Failed to load student list. Server might be experiencing issues.");
        }

      } catch (error) {
        console.error("Failed to fetch students:", error);
        setStudents([]);
        setTotalResults(0);
        // Alert the admin if the backend is completely down or unreachable
        toast.error("Network error: Unable to connect to the backend server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFromAPI();
  }, [appliedSearchQuery, currentPage]);

  return {
    searchQuery, setSearchQuery,
    selectedStudent, setSelectedStudent,
    currentPage, setCurrentPage,
    handleSearchClick, handleSearchKeyDown,
    students, totalResults, isLoading, ITEMS_PER_PAGE
  };
}