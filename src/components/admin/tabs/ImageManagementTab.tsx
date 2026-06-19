"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Image as ImageIcon, Upload, Loader2, X, Camera, Filter, GraduationCap,
  BookOpen, ListFilter, ChevronLeft, ChevronRight, Calendar, Sparkles,
  CheckCircle2, Clock, XCircle, UserSquare2, Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useImageManagement } from "@/hooks/useImageManagement";
import { getImageUploadUrl, saveImageUrl, type YearbookImageType } from "@/app/admin/imageService";
import { uploadToR2 } from "@/app/student/studentService";
import toast from "react-hot-toast";

interface StudentImage {
  id: number;
  type: YearbookImageType;
  year: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  photo_url: string | null;
  updated_at: string;
}

const STATUS_BADGE: Record<string, { label: string; className: string; Icon: React.ElementType }> = {
  PENDING:  { label: "Pending",  className: "bg-amber-100 text-amber-800 border-amber-200",   Icon: Clock },
  APPROVED: { label: "Approved", className: "bg-green-100 text-green-800 border-green-200",   Icon: CheckCircle2 },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-700 border-red-200",         Icon: XCircle },
};

function ImageStatusBadge({ status }: { status: string }) {
  const cfg = STATUS_BADGE[status] ?? STATUS_BADGE.PENDING;
  const { Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md border ${cfg.className}`}>
      <Icon size={10} /> {cfg.label}
    </span>
  );
}

interface ImageSlotProps {
  label: string;
  icon: React.ElementType;
  image: StudentImage | null;
  onUpload: () => void;
  setEnlargedImage: (url: string | null) => void;
}

function ImageSlot({ label, icon: Icon, image, onUpload, setEnlargedImage }: ImageSlotProps) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon size={12} className="text-amber-600 shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-wide text-stone-500 truncate">{label}</span>
      </div>

      <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden border border-stone-200 bg-stone-100 cursor-pointer hover:border-amber-400"
        onClick={() => {
          const refUrl = image?.photo_url;
          if (refUrl) setEnlargedImage(refUrl);
        }}
      >
        {image?.photo_url ? (
          <Image unoptimized src={image.photo_url} fill sizes="200px" className="object-cover" alt={label} />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-300">
            <ImageIcon size={22} />
            <span className="text-[9px] font-medium mt-1 uppercase tracking-wide">Not Uploaded</span>
          </div>
        )}
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-1">
        {image ? <ImageStatusBadge status={image.status} /> : <span className="text-[10px] font-bold text-stone-400 py-0.5">No image provided</span>}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onUpload}
        className="w-full mt-1.5 h-7 text-[11px] border-amber-200 text-amber-900 hover:bg-amber-50 hover:text-amber-900"
        disabled={image?.status === "APPROVED" || image?.status === "PENDING"}
      >
        <Camera className="w-3 h-3 mr-1.5" />
        {image ? "Change" : "Upload"}
      </Button>
    </div>
  );
}

export function ImageManagementTab() {
  const {
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
    STATUS_STEPS, ACADEMIC_CONFIG,
  } = useImageManagement();

  // --- upload dialog state ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<{ student: any; type: YearbookImageType } | null>(null);
  const [dialogYear, setDialogYear] = useState<number>(activeYearFilter);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE);

  const availableCourses = useMemo(() => {
    if (activeDeptFilter === "ALL") return [];
    const dept = ACADEMIC_CONFIG.find(d => d.name === activeDeptFilter);
    return dept ? dept.courses.map(c => c.name) : [];
  }, [activeDeptFilter, ACADEMIC_CONFIG]);

  const availableMajors = useMemo(() => {
    if (activeCourseFilter === "ALL") return [];
    const dept = ACADEMIC_CONFIG.find(d => d.name === activeDeptFilter);
    const course = dept?.courses.find(c => c.name === activeCourseFilter);
    return course ? course.majors : [];
  }, [activeDeptFilter, activeCourseFilter, ACADEMIC_CONFIG]);

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxButtons = 4;
    let end = Math.min(totalPages, Math.max(1, currentPage - 1) + maxButtons - 1);
    const start = Math.max(1, end - maxButtons + 1);
    end = Math.min(totalPages, start + maxButtons - 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const openUploadDialog = (student: any, type: YearbookImageType) => {
    setUploadTarget({ student, type });
    setDialogYear(appliedFilters.year);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const closeUploadDialog = () => {
    if (isUploading) return;
    setUploadTarget(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!uploadTarget || !selectedFile) return;
    const student_number = uploadTarget.student.student_number;

    setIsUploading(true);
    try {
      const urlRes = await getImageUploadUrl(student_number, uploadTarget.type, dialogYear, selectedFile);
      if (!urlRes.success || !urlRes.data) {
        return toast.error(urlRes.reason ?? "Could not start the upload.");
      }

      const { upload_url, photo_url } = urlRes.data;

      const putRes = await uploadToR2(upload_url, selectedFile);
      if (!putRes.success) {
        return toast.error(putRes.reason ?? "Upload to storage failed.");
      }

      const saveRes = await saveImageUrl(student_number, uploadTarget.type, dialogYear, photo_url);
      if (!saveRes.success) {
        return toast.error(saveRes.reason ?? "Could not save the image.");
      }

      toast.success("Image uploaded! It may take a few hours to fully reflect.");
      closeUploadDialog();
      refresh();
    } catch {
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const typeLabel = uploadTarget?.type === "GRADUATION" ? "Graduation (Toga)" : "Theme";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

      {/* Header + Filters */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-amber-600" /> Image Management
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Upload each graduate&apos;s formal and theme images. Uploaded images await
            approval before they go live.
          </p>
        </div>

        <div className="flex flex-col xl:flex-row gap-4 justify-between items-center bg-stone-50/50 p-2 rounded-xl border border-stone-100 min-w-0">
          <div className="flex gap-2 w-full xl:w-[25%] min-w-0">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Search by ID Number..."
                className="pl-10 h-11 bg-white border-stone-200 focus:ring-amber-500/20 focus:border-amber-500 shadow-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
            </div>
            <Button onClick={handleSearchClick} className="h-11 px-5 bg-stone-800 hover:bg-stone-900 shadow-sm shrink-0">
              Search
            </Button>
          </div>

          <div className="hidden xl:block text-stone-300 font-medium text-sm px-1 shrink-0">OR</div>

          {/* Missing filter */}
          <div className="w-full xl:w-[180px] shrink-0">
            <Select value={activeMissingFilter} onValueChange={setActiveMissingFilter}>
              <SelectTrigger className="h-11 w-full bg-white border-stone-200 shadow-sm">
                <div className="flex items-center gap-2 min-w-0 w-full text-stone-600">
                  <ImageIcon size={16} className="shrink-0" />
                  <div className="flex-1 min-w-0 text-left [&>span]:block [&>span]:truncate">
                    <SelectValue placeholder="Filter" />
                  </div>
                </div>
              </SelectTrigger>
              <SelectContent>
                {MISSING_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="w-full xl:w-[140px] shrink-0">
            <Select value={activeStatusFilter} onValueChange={setActiveStatusFilter}>
              <SelectTrigger className="h-11 w-full bg-white border-stone-200 shadow-sm">
                <div className="flex items-center gap-2 min-w-0 w-full text-stone-600">
                  <ListFilter size={16} className="shrink-0" />
                  <div className="flex-1 min-w-0 text-left [&>span]:block [&>span]:truncate">
                    <SelectValue placeholder="Status" />
                  </div>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                {STATUS_STEPS.map((step: any) => (
                  <SelectItem key={step.id} value={step.id.toString()}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${step.color}`}></div>
                      {step.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department */}
          <div className="w-full xl:flex-1 min-w-0">
            <Select value={activeDeptFilter} onValueChange={(val) => { setActiveDeptFilter(val); setActiveCourseFilter("ALL"); setActiveMajorFilter("ALL"); }}>
              <SelectTrigger className="h-11 w-full bg-white border-stone-200 shadow-sm">
                <div className="flex items-center gap-2 min-w-0 w-full text-stone-600">
                  <Filter size={16} className="shrink-0" />
                  <div className="flex-1 min-w-0 text-left [&>span]:block [&>span]:truncate pr-1">
                    <SelectValue placeholder="Department" />
                  </div>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Departments</SelectItem>
                {DEPARTMENT_ORDER.map((dept: any) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Course */}
          <div className="w-full xl:flex-1 min-w-0">
            <Select value={activeCourseFilter} onValueChange={(val) => { setActiveCourseFilter(val); setActiveMajorFilter("ALL"); }} disabled={activeDeptFilter === "ALL"}>
              <SelectTrigger className="h-11 w-full bg-white border-stone-200 shadow-sm">
                <div className="flex items-center gap-2 min-w-0 w-full text-stone-600">
                  <GraduationCap size={16} className="shrink-0" />
                  <div className="flex-1 min-w-0 text-left [&>span]:block [&>span]:truncate pr-1">
                    <SelectValue placeholder={activeDeptFilter === "ALL" ? "Select Dept First" : "Course"} />
                  </div>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Courses</SelectItem>
                {availableCourses.map((course: string) => (
                  <SelectItem key={course} value={course}>{course}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleLoadClick} className="h-11 px-6 bg-amber-600 hover:bg-amber-700 shadow-sm text-white font-bold tracking-wide w-full xl:w-auto shrink-0">
            LOAD
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4 pb-10 min-h-[400px]">
        {isLoading ? (
          <div className="text-center py-24 text-stone-400 bg-white rounded-2xl border border-dashed border-stone-200 flex flex-col items-center shadow-sm">
            <Loader2 className="h-8 w-8 mb-4 text-amber-500 animate-spin" />
            <p className="text-sm font-medium">Querying database...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-24 text-stone-400 bg-white rounded-2xl border border-dashed border-stone-200 flex flex-col items-center shadow-sm">
            <ImageIcon className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-lg font-medium text-stone-500">No records found</p>
            <p className="text-sm">Adjust your filters and click Load.</p>
          </div>
        ) : (
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 content-start">
              {students.map((student: any) => {
                const statusInfo = STATUS_STEPS.find((s: any) => s.label === student.studentAuth?.status);
                return (
                  <div key={student.id} className="bg-[#FDFBF7] p-4 rounded-xl border border-stone-200 flex flex-col">
                    {/* student header */}
                    <div className="mb-3">
                      <div className="flex justify-between items-start gap-2">
                        <p className="font-bold text-stone-800 text-sm truncate pr-1">
                          {student.last_name}, {student.first_name} {student.mid_name?.charAt(0) ? `${student.mid_name.charAt(0)}.` : ""} {student.suffix}
                        </p>
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${statusInfo?.color || "bg-stone-400"}`} title={statusInfo?.label || "Unknown"}></div>
                      </div>
                      <p className="text-[11px] font-mono text-stone-500 mt-0.5">{student.student_number}</p>
                      <p className="text-[9px] font-bold text-stone-400 truncate uppercase mt-0.5">{student.course}</p>
                    </div>

                    {/* image slots */}
                    <div className="flex gap-3">
                      {/* reference photo (read-only) */}
                      <div className="w-[28%] shrink-0">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <UserSquare2 size={12} className="text-stone-400 shrink-0" />
                          <span className="text-[10px] font-bold uppercase tracking-wide text-stone-400 truncate">Ref</span>
                        </div>
                        <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden border border-stone-200 bg-stone-100 cursor-pointer hover:border-amber-400"
                          onClick={() => {
                            const refUrl = student.reference_photo_url;
                            if (refUrl) setEnlargedImage(refUrl);
                          }}
                        >
                          {student.reference_photo_url ? (
                            <Image unoptimized src={student.reference_photo_url} fill sizes="120px" className="object-cover" alt="Reference" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-stone-300">
                              <UserSquare2 size={18} />
                            </div>
                          )}
                        </div>
                      </div>

                      <ImageSlot
                        label="Graduation"
                        icon={GraduationCap}
                        image={student.graduation}
                        onUpload={() => openUploadDialog(student, "GRADUATION")}
                        setEnlargedImage={setEnlargedImage}
                      />
                      <ImageSlot
                        label="Theme"
                        icon={Sparkles}
                        image={student.theme}
                        onUpload={() => openUploadDialog(student, "THEME")}
                        setEnlargedImage={setEnlargedImage}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-stone-100">
                <span className="text-xs text-stone-400 font-medium hidden sm:block">
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalResults)} of {totalResults}
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg shrink-0"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex gap-1 overflow-x-auto max-w-[200px] no-scrollbar">
                    {getPageNumbers().map(pageNum => (
                      <Button key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        className={`h-8 w-8 text-xs rounded-lg shrink-0 ${currentPage === pageNum ? "bg-amber-600 hover:bg-amber-700 shadow-sm" : "text-stone-500"}`}
                        onClick={() => setCurrentPage(pageNum)}>
                        {pageNum}
                      </Button>
                    ))}
                  </div>

                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg shrink-0"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* hidden file input */}
      <input
        type="file"
        accept="image/png, image/jpeg, image/jpg"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* Upload dialog */}
      <Dialog open={!!uploadTarget} onOpenChange={(open) => { if (!open) closeUploadDialog(); }}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-stone-900">
              Upload {typeLabel} Photo
            </DialogTitle>
            <DialogDescription className="text-stone-500 text-sm mt-1">
              {uploadTarget && (
                <>
                  {uploadTarget.student.last_name}, {uploadTarget.student.first_name}
                  <span className="text-stone-400"> · {uploadTarget.student.student_number}</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-1">
            {/* Year picker */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Yearbook Year</label>
              <Select value={String(dialogYear)} onValueChange={(v) => setDialogYear(Number(v))} disabled={isUploading}>
                <SelectTrigger className="h-10 bg-stone-50 border-stone-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEAR_OPTIONS.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preview / picker */}
            <div className="relative mx-auto w-44 aspect-[3/4] rounded-xl overflow-hidden border-2 border-dashed border-stone-200 bg-stone-50 flex items-center justify-center">
              {previewUrl ? (
                <Image unoptimized src={previewUrl} fill sizes="180px" className="object-cover" alt="Preview" />
              ) : (
                <div className="flex flex-col items-center text-stone-300">
                  <ImageIcon size={28} />
                  <span className="text-[10px] font-medium mt-1 uppercase">No file selected</span>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full border-amber-200 text-amber-900 hover:bg-amber-50 hover:text-amber-900"
            >
              <Camera className="w-4 h-4 mr-2" /> {selectedFile ? "Choose Another" : "Choose Image"}
            </Button>
            <p className="text-[11px] text-stone-400 text-center -mt-2">PNG or JPG, max 5MB.</p>
          </div>

          <DialogFooter className="mt-2 flex gap-2">
            <Button variant="outline" className="flex-1 border-stone-200" onClick={closeUploadDialog} disabled={isUploading}>
              <X className="w-4 h-4 mr-1.5" /> Cancel
            </Button>
            <Button className="flex-1 bg-amber-700 hover:bg-amber-800 text-white" onClick={handleSave} disabled={isUploading || !selectedFile}>
              {isUploading
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>
                : <><Upload className="w-4 h-4 mr-2" /> Upload</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

        {/* IMAGE LIGHTBOX MODAL */}
        <Dialog open={!!enlargedImage} onOpenChange={(open) => !open && setEnlargedImage(null)}>
            <DialogContent className="max-w-4xl w-auto p-1 bg-transparent border-0 shadow-none flex justify-center items-center [&>button]:hidden">
                <div className="relative w-auto h-auto max-h-[85vh]">
                    {enlargedImage && (
                        <Image
                            unoptimized
                            src={enlargedImage} 
                            alt="Enlarged view"
                            width={1600}
                            height={2000}
                            className="w-auto h-auto max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}
