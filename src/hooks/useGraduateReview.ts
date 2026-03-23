import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Student } from "@/types";

import * as adminService from "../app/admin/adminService";

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

export function useGraduateReview(staffUser: any, selectedStudent: any, setSelectedStudent: any) {
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8; 

  const [students, setStudents] = useState<Student[]>([]); 
  const [totalResults, setTotalResults] = useState(0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.fv_getPaginatedStudents(currentPage);
      if (!res.success) {
        setStudents([]);
        return;
      }

      if (res.data.students.length === 0) {
        setStudents([]);
        return;
      }

      setStudents(res.data.students);
      setTotalResults(res.data.total_students);

    } catch (error) {
      console.error("Failed to fetch students:", error);
      toast.error("Could not load students.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [currentPage, appliedSearchQuery]);

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

      setStudents(prev => prev.map(g => g.id === selectedStudent.id ? updatedStudent : g));
      setSelectedStudent(updatedStudent);
      toast.success(`Updated: ${category}`);
    } catch (error) {
      console.error(`Save Edit Error for ${category}:`, error);
      toast.error(`An error occurred while updating ${category} details.`);
      return;
    }
    
    setIsEditing(false);
  };

  const handlePhotoUpload = async (type: 'grad' | 'creative', file: File) => {
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const updateKey = type === 'grad' ? 'photo_grad' : 'photo_creative';

        //TODO: api endpoint

        setStudents(prev => prev.map(g => g.id === selectedStudent.id ? { ...g, [updateKey]: result } : g));
        setSelectedStudent((prev: any) => ({ ...prev, [updateKey]: result }));

        toast.success("Photo uploaded successfully.");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Photo Upload Error:", error);
      toast.error("Failed to upload photo. Please check your connection.");
    }
  };

  const handleFinalize = async () => {
    try {
      const finalizeId = selectedStudent?.student_number;

      if (!finalizeId) {
        toast.error("Cannot finalize: student ID is missing.");
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