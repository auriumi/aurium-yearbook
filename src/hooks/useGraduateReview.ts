import { useCallback, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Student } from "@/types";

import * as adminService from "../app/admin/adminService";

export function useGraduateReview(staffUser: any, selectedStudent: any, setSelectedStudent: any) {
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8; 

  const [students, setStudents] = useState<Student[]>([]); 
  const [totalResults, setTotalResults] = useState(0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      let res;

      if (appliedSearchQuery) {
        res = await adminService.fv_getStudentById(appliedSearchQuery);
      } else {
        res = await adminService.fv_getPaginatedStudents(currentPage);
      }

      if (!res.success) {
        setStudents([]);
        return [] as Student[];
      }

      const studentsData = Array.isArray(res.data.students)
        ? res.data.students
        : res.data.student
          ? [res.data.student]
          : [];

      if (studentsData.length === 0) {
        setStudents([]);
        return [] as Student[];
      }

      setStudents(studentsData);
      setTotalResults(res.data.total_students);
      return studentsData as Student[];

    } catch (error) {
      console.error("Failed to fetch students:", error);
      toast.error("Could not load students.");
      return [] as Student[];
    } finally {
      setIsLoading(false);
    }
  }, [appliedSearchQuery, currentPage]);

  useEffect(() => {
    fetchStudents();
  }, [appliedSearchQuery, fetchStudents]);

  const handleSearchClick = () => {
      setAppliedSearchQuery(searchQuery.trim());
      setCurrentPage(1);
  };

  const handleSearchKeyDown = (e: any) => {
      if (e.key === 'Enter') handleSearchClick();
  };

  const handleSaveEdit = async (formElement: HTMLFormElement) => {
    const formData = new FormData(formElement);
    const dataByCategory: { [category: string]: { [key: string]: any } } = {};

    const fieldCategories: { [key: string]: string } = {
        first_name: "personal", last_name: "personal", mid_name: "personal", suffix: "personal", nickname: "personal",
        course: "academic", major: "academic", thesis: "academic",
        barangay: "contact", city: "contact", province: "contact",
      contact_num: "contact", school_email: "contact", personal_email: "contact",
        fathers_title: "family", fathers_name: "family",
        mothers_title: "family", mothers_name: "family",
        guardians_title: "family", guardians_name: "family",
    };

    const formMapping: { [key: string]: string } = {
        fname: "first_name", lname: "last_name", mname: "mid_name", suffix: "suffix", nickname: "nickname",
        course: "course", major: "major", thesis: "thesis",
        barangay: "barangay", city: "city", province: "province",
      contactNum: "contact_num", schoolEmail: "school_email", personalEmail: "personal_email",
        fathers_title: "fathers_title", father: "fathers_name",
        mothers_title: "mothers_title", mother: "mothers_name",
        guardians_title: "guardians_title", guardian: "guardians_name",
    };

    const normalizeValue = (value: unknown) => String(value ?? "").trim();

    const getCurrentValue = (dataKey: string) => {
      if (selectedStudent && dataKey in selectedStudent) {
        return selectedStudent[dataKey];
      }

      if (selectedStudent?.studentDetail && dataKey in selectedStudent.studentDetail) {
        return selectedStudent.studentDetail[dataKey];
      }

      return "";
    };

    for (const [formKey, dataKey] of Object.entries(formMapping)) {
      const formControl = formElement.elements.namedItem(formKey);
      if (!formControl) {
        continue;
      }

      const submittedValue = normalizeValue(formData.get(formKey));
      const currentValue = normalizeValue(getCurrentValue(dataKey));
      const category = fieldCategories[dataKey];

      if (!category || submittedValue === currentValue) {
        continue;
      }

      if (!dataByCategory[category]) {
        dataByCategory[category] = {};
      }

      dataByCategory[category][dataKey] = submittedValue;
    }

    if (Object.keys(dataByCategory).length === 0) {
        toast.error("No changes detected.");
        setIsEditing(false);
        return;
    }

    const categories = Object.keys(dataByCategory);
    if (categories.length > 1) {
      toast.error("Please save one section at a time.");
      return;
    }

    const category = categories[0];
    const payload = dataByCategory[category];

    try {
      const res = await adminService.fv_updateStudent(selectedStudent.student_number, category, payload);

      if (!res?.success) {
        toast.error(`Failed to update ${category} details: ${res?.reason || "Unknown server response"}`);
        return;
      }

      const updatedStudent = {
        ...selectedStudent,
        ...payload,
        studentDetail: {
            ...selectedStudent.studentDetail,
            ...payload
        }
      };

      const refreshedStudents = await fetchStudents();
      const refreshedSelectedStudent = refreshedStudents.find((g: any) => g.id === selectedStudent.id);
      setSelectedStudent(refreshedSelectedStudent ?? updatedStudent);
      toast.success(`Updated ${category.toWellFormed()} details`);
    } catch (error) {
      console.error(`Save Edit Error for ${category}:`, error);
      toast.error(`An error occurred while updating ${category} details.`);
      return;
    }
    
    setIsEditing(false);
  };

  const handleFinalize = async () => {
    try {
      const finalizeId = selectedStudent?.student_number;

      if (!finalizeId) {
        toast.error("Cannot verify: student ID is missing.");
        return;
      }

      const res = await adminService.fv_finalizeStudent(finalizeId);

      if (!res?.success) {
        toast.error(res?.reason || "Failed to verify student.");
        return;
      }
      
      const updatedStudent = {
        ...selectedStudent,
        status: "verified"
      };

      setStudents(prev => prev.map(g => g.id === selectedStudent.id ? { ...g, status: "verified" } : g));
      setSelectedStudent(updatedStudent);
      await fetchStudents();
      setSelectedStudent(null);

      toast.success("Student successfully verified.");
    } catch (error) {
      console.error("Verify Error:", error);
      toast.error("Failed to verify student. Server is currently unavailable.");
    }
  };

  const handleDiscard = async () => {
    try {
      const finalizeId = selectedStudent?.student_number;

      if (!finalizeId) {
        toast.error("Cannot discard: student ID is missing.");
        return;
      }

      const res = await adminService.handleCancel(selectedStudent.student_number);
      
      const updatedStudent = {
        ...selectedStudent,
        status: "verified"
      };

      if (res) {
        setSelectedStudent(null);
        await fetchStudents();
        return toast.success("Registration succesfully discarded!");
      }

      setStudents(prev => prev.map(g => g.id === selectedStudent.id ? { ...g, status: "verified" } : g));
      setSelectedStudent(updatedStudent);
      await fetchStudents();
      setSelectedStudent(null);

      toast.success("Student successfully verified.");
    } catch (error) {
      console.error("Discard Error:", error);
      toast.error("Failed to verify student. Server is currently unavailable.");
    }
  };

  return {
    searchQuery, setSearchQuery,
    currentPage, setCurrentPage,
    handleSearchClick, handleSearchKeyDown,
    students, totalResults, isLoading, ITEMS_PER_PAGE,
    isEditing, setIsEditing, fetchStudents,
    handleSaveEdit, handleFinalize, handleDiscard
  };
}
