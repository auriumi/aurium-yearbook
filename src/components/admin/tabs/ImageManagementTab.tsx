"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Image as ImageIcon, Upload, Loader2, X, Camera, Filter, GraduationCap,
  ListFilter, ChevronLeft, ChevronRight, Sparkles, Calendar,
  CheckCircle2, Clock, XCircle, UserSquare2, Search, Crop,
  Move, ZoomIn, RotateCcw
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

type CropVector = { x: number; y: number };
type CropImageSize = { width: number; height: number };
type CropLayout = {
  viewportWidth: number;
  viewportHeight: number;
  baseWidth: number;
  baseHeight: number;
  baseScale: number;
};

const CROP_OUTPUT_WIDTH = 1200;
const CROP_OUTPUT_HEIGHT = 1600;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const STATUS_BADGE: Record<string, { label: string; className: string; Icon: React.ElementType }> = {
  PENDING:  { label: "Pending",  className: "bg-amber-100 text-amber-800 border-amber-200",   Icon: Clock },
  APPROVED: { label: "Approved", className: "bg-green-100 text-green-800 border-green-200",   Icon: CheckCircle2 },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-700 border-red-200",         Icon: XCircle },
};

function getStudentName(student: any) {
  return `${student.last_name}, ${student.first_name} ${student.mid_name?.charAt(0) ? `${student.mid_name.charAt(0)}.` : ""} ${student.suffix ?? ""}`.trim();
}

function formatBytes(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function clampCropOffset(offset: CropVector, layout: CropLayout | null, zoom: number): CropVector {
  if (!layout) return offset;

  const scaledWidth = layout.baseWidth * zoom;
  const scaledHeight = layout.baseHeight * zoom;
  const maxX = Math.max(0, (scaledWidth - layout.viewportWidth) / 2);
  const maxY = Math.max(0, (scaledHeight - layout.viewportHeight) / 2);

  const next = {
    x: clamp(offset.x, -maxX, maxX),
    y: clamp(offset.y, -maxY, maxY),
  };

  return next.x === offset.x && next.y === offset.y ? offset : next;
}

function loadBrowserImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load the selected image."));
    image.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Unable to crop the selected image."));
    }, type, quality);
  });
}

function getCroppedFileName(file: File) {
  const baseName = file.name.replace(/\.[^/.]+$/, "") || "yearbook-photo";
  return `${baseName}-cropped.jpg`;
}

function ImageStatusBadge({ status }: { status: string }) {
  const cfg = STATUS_BADGE[status] ?? STATUS_BADGE.PENDING;
  const { Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md border ${cfg.className}`}>
      <Icon size={10} /> {cfg.label}
    </span>
  );
}

function formatImageUpdated(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface ImageSlotProps {
  label: string;
  icon: React.ElementType;
  image: StudentImage | null;
  onUpload: () => void;
  setEnlargedImage: (url: string | null) => void;
}

function ImageSlot({ label, icon: Icon, image, onUpload, setEnlargedImage }: ImageSlotProps) {
  const canUpload = image?.status !== "APPROVED" && image?.status !== "PENDING";
  const uploadLabel = image?.status === "REJECTED" ? "Replace" : image ? "Change" : "Upload";

  return (
    <div className="min-w-0 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
            <Icon size={16} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-stone-800">{label}</p>
            <p className="text-[11px] text-stone-400">Portrait upload</p>
          </div>
        </div>
        {image ? <ImageStatusBadge status={image.status} /> : null}
      </div>

      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-100 cursor-pointer hover:border-amber-400"
        onClick={() => {
          const refUrl = image?.photo_url;
          if (refUrl) setEnlargedImage(refUrl);
        }}
      >
        {image?.photo_url ? (
          <Image unoptimized src={image.photo_url} fill sizes="320px" className="object-cover" alt={label} />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-300">
            <ImageIcon size={30} />
            <span className="mt-2 text-[11px] font-bold uppercase tracking-wide">Not Uploaded</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-stone-400">
          {image?.updated_at ? `Updated ${formatImageUpdated(image.updated_at)}` : "No image provided"}
        </span>
        {!canUpload && (
          <span className="text-[10px] font-semibold text-stone-400">
            Locked
          </span>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onUpload}
        className="mt-3 h-9 w-full border-amber-200 text-amber-900 hover:bg-amber-50 hover:text-amber-900"
        disabled={!canUpload}
      >
        <Camera className="mr-2 h-4 w-4" />
        {uploadLabel}
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
  const cropAreaRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; offset: CropVector } | null>(null);
  const [sourceImageSize, setSourceImageSize] = useState<CropImageSize | null>(null);
  const [cropViewportSize, setCropViewportSize] = useState<CropImageSize | null>(null);
  const [cropOffset, setCropOffset] = useState<CropVector>({ x: 0, y: 0 });
  const [cropZoom, setCropZoom] = useState(1);
  const [isUploading, setIsUploading] = useState(false);

  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE);

  const cropLayout = useMemo<CropLayout | null>(() => {
    if (!sourceImageSize || !cropViewportSize || cropViewportSize.width === 0 || cropViewportSize.height === 0) {
      return null;
    }

    const baseScale = Math.max(
      cropViewportSize.width / sourceImageSize.width,
      cropViewportSize.height / sourceImageSize.height
    );

    return {
      viewportWidth: cropViewportSize.width,
      viewportHeight: cropViewportSize.height,
      baseWidth: sourceImageSize.width * baseScale,
      baseHeight: sourceImageSize.height * baseScale,
      baseScale,
    };
  }, [cropViewportSize, sourceImageSize]);

  const cropImageStyle = cropLayout ? {
    width: `${cropLayout.baseWidth * cropZoom}px`,
    height: `${cropLayout.baseHeight * cropZoom}px`,
    left: "50%",
    top: "50%",
    transform: `translate(calc(-50% + ${cropOffset.x}px), calc(-50% + ${cropOffset.y}px))`,
  } : undefined;

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

  useEffect(() => {
    if (!previewUrl || !cropAreaRef.current) return;

    const area = cropAreaRef.current;
    const updateCropViewport = () => {
      const rect = area.getBoundingClientRect();
      setCropViewportSize({ width: rect.width, height: rect.height });
    };

    updateCropViewport();
    const observer = new ResizeObserver(updateCropViewport);
    observer.observe(area);

    return () => observer.disconnect();
  }, [previewUrl]);

  useEffect(() => {
    setCropOffset((current) => clampCropOffset(current, cropLayout, cropZoom));
  }, [cropLayout, cropZoom]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxButtons = 4;
    let end = Math.min(totalPages, Math.max(1, currentPage - 1) + maxButtons - 1);
    const start = Math.max(1, end - maxButtons + 1);
    end = Math.min(totalPages, start + maxButtons - 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const resetCropState = () => {
    dragRef.current = null;
    setSourceImageSize(null);
    setCropViewportSize(null);
    setCropOffset({ x: 0, y: 0 });
    setCropZoom(1);
  };

  const openUploadDialog = (student: any, type: YearbookImageType) => {
    setUploadTarget({ student, type });
    setDialogYear(appliedFilters.year);
    setSelectedFile(null);
    setPreviewUrl(null);
    resetCropState();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const closeUploadDialog = () => {
    if (isUploading) return;
    setUploadTarget(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    resetCropState();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      toast.error("Please choose a JPG, PNG, or WEBP image.");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      e.target.value = "";
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    resetCropState();
  };

  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const startCropDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cropLayout || isUploading) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      offset: cropOffset,
    };
  };

  const moveCropDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || dragRef.current.pointerId !== e.pointerId) return;

    const nextOffset = {
      x: dragRef.current.offset.x + e.clientX - dragRef.current.startX,
      y: dragRef.current.offset.y + e.clientY - dragRef.current.startY,
    };

    setCropOffset(clampCropOffset(nextOffset, cropLayout, cropZoom));
  };

  const endCropDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === e.pointerId) {
      dragRef.current = null;
    }
  };

  const createCroppedFile = async (): Promise<File> => {
    if (!selectedFile) throw new Error("Please choose a photo first.");
    if (!previewUrl || !cropLayout) return selectedFile;

    const image = await loadBrowserImage(previewUrl);
    const totalScale = cropLayout.baseScale * cropZoom;
    const scaledWidth = cropLayout.baseWidth * cropZoom;
    const scaledHeight = cropLayout.baseHeight * cropZoom;
    const imageLeft = (cropLayout.viewportWidth - scaledWidth) / 2 + cropOffset.x;
    const imageTop = (cropLayout.viewportHeight - scaledHeight) / 2 + cropOffset.y;

    const sourceX = clamp((0 - imageLeft) / totalScale, 0, image.naturalWidth - 1);
    const sourceY = clamp((0 - imageTop) / totalScale, 0, image.naturalHeight - 1);
    const sourceWidth = clamp(cropLayout.viewportWidth / totalScale, 1, Math.max(1, image.naturalWidth - sourceX));
    const sourceHeight = clamp(cropLayout.viewportHeight / totalScale, 1, Math.max(1, image.naturalHeight - sourceY));

    const canvas = document.createElement("canvas");
    canvas.width = CROP_OUTPUT_WIDTH;
    canvas.height = CROP_OUTPUT_HEIGHT;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Unable to prepare the crop.");

    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      CROP_OUTPUT_WIDTH,
      CROP_OUTPUT_HEIGHT
    );

    const blob = await canvasToBlob(canvas, "image/jpeg", 0.92);
    return new File([blob], getCroppedFileName(selectedFile), {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  };

  const handleSave = async () => {
    if (!uploadTarget || !selectedFile) return;
    const student_number = uploadTarget.student.student_number;

    setIsUploading(true);
    try {
      const uploadFile = await createCroppedFile();
      const urlRes = await getImageUploadUrl(student_number, uploadTarget.type, dialogYear, uploadFile);
      if (!urlRes.success || !urlRes.data) {
        return toast.error(urlRes.reason ?? "Could not start the upload.");
      }

      const { upload_url, photo_url } = urlRes.data;

      const putRes = await uploadToR2(upload_url, uploadFile);
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

          {/* Year */}
          <div className="w-full xl:w-[120px] shrink-0">
            <Select value={String(activeYearFilter)} onValueChange={(value) => setActiveYearFilter(Number(value))}>
              <SelectTrigger className="h-11 w-full bg-white border-stone-200 shadow-sm">
                <div className="flex items-center gap-2 min-w-0 w-full text-stone-600">
                  <Calendar size={16} className="shrink-0" />
                  <div className="flex-1 min-w-0 text-left [&>span]:block [&>span]:truncate">
                    <SelectValue placeholder="Year" />
                  </div>
                </div>
              </SelectTrigger>
              <SelectContent>
                {YEAR_OPTIONS.map((year) => (
                  <SelectItem key={year} value={String(year)}>{year}</SelectItem>
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

          {/* Major */}
          <div className="w-full xl:flex-1 min-w-0">
            <Select value={activeMajorFilter} onValueChange={setActiveMajorFilter} disabled={activeCourseFilter === "ALL"}>
              <SelectTrigger className="h-11 w-full bg-white border-stone-200 shadow-sm">
                <div className="flex items-center gap-2 min-w-0 w-full text-stone-600">
                  <GraduationCap size={16} className="shrink-0" />
                  <div className="flex-1 min-w-0 text-left [&>span]:block [&>span]:truncate pr-1">
                    <SelectValue placeholder={activeCourseFilter === "ALL" ? "Select Course First" : "Major"} />
                  </div>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Majors</SelectItem>
                {availableMajors.map((major: string) => (
                  <SelectItem key={major} value={major}>{major}</SelectItem>
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
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-5 flex flex-col gap-3 border-b border-stone-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-stone-800">Graduate Image Queue</p>
                <p className="text-xs text-stone-500">
                  Showing {students.length} of {totalResults} records for yearbook {appliedFilters.year}.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-stone-500">
                <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1">{appliedFilters.missing === "ALL" ? "All image states" : MISSING_OPTIONS.find(opt => opt.value === appliedFilters.missing)?.label}</span>
                <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1">{appliedFilters.status === "ALL" ? "All student statuses" : STATUS_STEPS.find((step: any) => String(step.id) === appliedFilters.status)?.label}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 content-start">
              {students.map((student: any) => {
                const statusInfo = STATUS_STEPS.find((s: any) => s.label === student.studentAuth?.status);
                return (
                  <div key={student.id} className="overflow-hidden rounded-2xl border border-stone-200 bg-[#FDFBF7] shadow-sm">
                    <div className="border-b border-stone-200/70 bg-white/80 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-base font-bold text-stone-900">
                            {getStudentName(student)}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-stone-500">
                            <span className="font-mono font-semibold">{student.student_number}</span>
                            <span className="hidden text-stone-300 sm:inline">|</span>
                            <span className="truncate">{student.course}</span>
                          </div>
                        </div>
                        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white ${statusInfo?.color || "bg-stone-400"}`}>
                          {statusInfo?.label || "Unknown"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_minmax(0,1fr)]">
                      <div className="self-start rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
                        <div className="mb-3 flex items-center gap-2">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-500">
                            <UserSquare2 size={16} />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-stone-700">Reference</p>
                            <p className="text-[11px] text-stone-400">Read only</p>
                          </div>
                        </div>
                        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-100 cursor-pointer hover:border-amber-400"
                          onClick={() => {
                            const refUrl = student.reference_photo_url;
                            if (refUrl) setEnlargedImage(refUrl);
                          }}
                        >
                          {student.reference_photo_url ? (
                            <Image unoptimized src={student.reference_photo_url} fill sizes="180px" className="object-cover" alt="Reference" />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-300">
                              <UserSquare2 size={28} />
                              <span className="mt-2 text-[10px] font-bold uppercase">No Ref</span>
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
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* Upload + crop dialog */}
      <Dialog open={!!uploadTarget} onOpenChange={(open) => { if (!open) closeUploadDialog(); }}>
        <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-stone-900">
              <span className="flex items-center gap-2">
                <Crop className="h-5 w-5 text-amber-600" /> Crop {typeLabel} Photo
              </span>
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

            {/* Crop workspace */}
            <div className="rounded-2xl border border-stone-200 bg-stone-950 p-4">
              {previewUrl ? (
                <div
                  ref={cropAreaRef}
                  className="relative mx-auto aspect-[3/4] w-full max-w-[320px] touch-none select-none overflow-hidden rounded-2xl border border-white/15 bg-stone-900 shadow-xl cursor-grab active:cursor-grabbing"
                  onPointerDown={startCropDrag}
                  onPointerMove={moveCropDrag}
                  onPointerUp={endCropDrag}
                  onPointerCancel={endCropDrag}
                >
                  <Image
                    unoptimized
                    src={previewUrl}
                    alt="Crop source"
                    width={sourceImageSize?.width ?? CROP_OUTPUT_WIDTH}
                    height={sourceImageSize?.height ?? CROP_OUTPUT_HEIGHT}
                    className="absolute max-w-none object-fill pointer-events-none select-none"
                    style={cropImageStyle}
                    onLoad={(e) => {
                      const image = e.currentTarget;
                      setSourceImageSize({ width: image.naturalWidth, height: image.naturalHeight });
                    }}
                  />
                  <div className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-white/90">
                    <div className="absolute inset-x-0 top-1/3 border-t border-white/35" />
                    <div className="absolute inset-x-0 top-2/3 border-t border-white/35" />
                    <div className="absolute inset-y-0 left-1/3 border-l border-white/35" />
                    <div className="absolute inset-y-0 left-2/3 border-l border-white/35" />
                  </div>
                  <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
                    <Move className="h-3.5 w-3.5" /> Drag to reposition
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={openFilePicker}
                  disabled={isUploading}
                  className="mx-auto flex aspect-[3/4] w-full max-w-[320px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 bg-white/5 text-stone-300 transition-colors hover:border-amber-400 hover:bg-white/10"
                >
                  <ImageIcon size={40} className="mb-3 text-stone-500" />
                  <span className="text-sm font-bold text-white">Choose a photo to crop</span>
                  <span className="mt-1 text-xs text-stone-400">JPG, PNG, or WEBP up to 5MB</span>
                </button>
              )}
            </div>

            <Button
              variant="outline"
              onClick={openFilePicker}
              disabled={isUploading}
              className="w-full border-amber-200 text-amber-900 hover:bg-amber-50 hover:text-amber-900"
            >
              <Camera className="w-4 h-4 mr-2" /> {selectedFile ? "Choose Another Photo" : "Choose Photo"}
            </Button>
            <p className="text-[11px] text-stone-400 text-center -mt-2">JPG, PNG, or WEBP, max 5MB.</p>
            {selectedFile && (
              <p className="text-[11px] text-stone-500 text-center truncate">
                Selected: <span className="font-medium">{selectedFile.name}</span>
                {selectedFile.size ? <span className="text-stone-400"> ({formatBytes(selectedFile.size)})</span> : null}
              </p>
            )}

            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                  <ZoomIn className="h-3.5 w-3.5" /> Crop Zoom
                </label>
                <span className="text-xs font-semibold text-stone-400">{Math.round(cropZoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={cropZoom}
                onChange={(e) => setCropZoom(Number(e.target.value))}
                disabled={!previewUrl || isUploading}
                className="h-2 w-full cursor-pointer accent-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCropOffset({ x: 0, y: 0 });
                  setCropZoom(1);
                }}
                disabled={!previewUrl || isUploading}
                className="w-full border-stone-200 bg-white"
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Reset Crop
              </Button>
            </div>
          </div>

          <DialogFooter className="mt-2 flex gap-2">
            <Button variant="outline" className="flex-1 border-stone-200" onClick={closeUploadDialog} disabled={isUploading}>
              <X className="w-4 h-4 mr-1.5" /> Cancel
            </Button>
            <Button className="flex-1 bg-amber-700 hover:bg-amber-800 text-white" onClick={handleSave} disabled={isUploading || !selectedFile || !cropLayout}>
              {isUploading
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>
                : <><Upload className="w-4 h-4 mr-2" /> Upload Crop</>}
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
