import { useState, useEffect, useCallback } from "react";
import { departmentOptions as ACADEMIC_CONFIG } from "@/constants/registration";
import { STUDENT_STATUS_STEPS } from "@/constants/studentStatus";
import { fetchImageStudents } from "@/app/admin/imageService";

export const DEPARTMENT_ORDER = ACADEMIC_CONFIG.map(d => d.name);
export const YEAR_OPTIONS = [2026, 2027];

export const MISSING_OPTIONS = [
  { value: "ALL", label: "All Students" },
  { value: "GRADUATION", label: "Missing Graduation" },
  { value: "THEME", label: "Missing Theme" },
  { value: "BOTH", label: "Missing Both" },
  { value: "NONE", label: "Has Both" },
];

const normalizeStudents = (data: any): any[] => {
  if (Array.isArray(data?.students)) return data.students;
  if (Array.isArray(data?.data?.students)) return data.data.students;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const normalizeTotalResults = (data: any, list: any[]): number => {
  if (typeof data?.total_result === "number") return data.total_result;
  if (typeof data?.total === "number") return data.total;
  return list.length;
};

export function useImageManagement() {
  const currentYear = new Date().getFullYear();
  const defaultYear = YEAR_OPTIONS.includes(currentYear) ? currentYear : YEAR_OPTIONS[0];

  // --- UI INPUT STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");

  const [activeDeptFilter, setActiveDeptFilter] = useState<string>("ALL");
  const [activeCourseFilter, setActiveCourseFilter] = useState<string>("ALL");
  const [activeMajorFilter, setActiveMajorFilter] = useState<string>("ALL");
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("ALL");
  const [activeYearFilter, setActiveYearFilter] = useState<number>(defaultYear);
  const [activeMissingFilter, setActiveMissingFilter] = useState<string>("ALL");

  const handleSearchClick = () => {
    setAppliedSearchQuery(searchQuery.trim());
    setCurrentPage(1);
  };

  const handleSearchKeyDown = (e: any) => {
      if (e.key === 'Enter') handleSearchClick();
  };

  // --- APPLIED FILTERS (sent to API on LOAD) ---
  const [appliedFilters, setAppliedFilters] = useState({
    dept: "ALL",
    course: "ALL",
    major: "ALL",
    status: "ALL",
    year: defaultYear,
    missing: "ALL",
  });

  const [currentPage, setCurrentPage] = useState(1);

  // --- DATA STATES ---
  const [students, setStudents] = useState<any[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const ITEMS_PER_PAGE = 9;

  // Reset dependent filters when the department changes
  useEffect(() => {
    setActiveCourseFilter("ALL");
    setActiveMajorFilter("ALL");
  }, [activeDeptFilter]);

  // Reset major when the course changes
  useEffect(() => {
    setActiveMajorFilter("ALL");
  }, [activeCourseFilter]);

  const handleLoadClick = () => {
    setAppliedFilters({
      dept: activeDeptFilter,
      course: activeCourseFilter,
      major: activeMajorFilter,
      status: activeStatusFilter,
      year: activeYearFilter,
      missing: activeMissingFilter,
    });
    setAppliedSearchQuery("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Re-run the current query (used after an upload to refresh in place)
  const refresh = useCallback(() => setReloadKey(k => k + 1), []);

  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      try {
        const result = await fetchImageStudents({
          id: appliedSearchQuery,
          page: currentPage,
          dept: appliedFilters.dept,
          course: appliedFilters.course,
          major: appliedFilters.major,
          status: appliedFilters.status,
          year: appliedFilters.year,
          missing: appliedFilters.missing,
        });

        if (result.success) {
          const list = normalizeStudents(result.data);
          setStudents(list);
          setTotalResults(normalizeTotalResults(result.data, list));
        } else {
          setStudents([]);
          setTotalResults(0);
        }
      } catch (error) {
        console.error("Failed to fetch image students:", error);
        setStudents([]);
        setTotalResults(0);
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [appliedFilters, appliedSearchQuery, currentPage, reloadKey]);

  return {
    searchQuery, setSearchQuery,
    activeDeptFilter, setActiveDeptFilter,
    activeCourseFilter, setActiveCourseFilter,
    activeMajorFilter, setActiveMajorFilter,
    activeStatusFilter, setActiveStatusFilter,
    activeYearFilter, setActiveYearFilter,
    activeMissingFilter, setActiveMissingFilter,
    appliedFilters,
    currentPage, setCurrentPage,
    students, totalResults, isLoading, ITEMS_PER_PAGE,
    handleLoadClick, handleSearchClick, handleSearchKeyDown, refresh,
    DEPARTMENT_ORDER, YEAR_OPTIONS, MISSING_OPTIONS,
    STATUS_STEPS: STUDENT_STATUS_STEPS, ACADEMIC_CONFIG,
  };
}
