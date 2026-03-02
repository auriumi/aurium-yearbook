"use client";

// Added useRef and useState for the Photo Upload feature
import { useRef, useState } from "react";
// Removed 'import Link from "next/link";' as it's no longer needed
// Added Camera, Upload, Loader2, and X icons for the upload buttons
import { UserCircle, CheckCircle, Info, Camera, Upload, Loader2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

//student service
import * as studentService from "@/app/student/studentService";

// Imported toast for upload notifications
import toast from "react-hot-toast";

interface ProfileCardProps {
  fullName: string;
  idNumber: string;
  course: string;
  photoUrl: string | null;
  onCheckEntry: () => void; // Added onCheckEntry prop
}

// Destructured onCheckEntry from props
export function ProfileCard({ fullName, idNumber, course, photoUrl, onCheckEntry }: ProfileCardProps) {
  // --- PHOTO UPLOAD STATES & REFS ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate if file size exceeds 5MB
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
      
      // Read file to display as a preview in the Avatar
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSavePhoto = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    try {
      const { upload_url, photo_url } = await studentService.getUploadUrl(selectedFile);

      const upl_res = await studentService.uploadToR2(upload_url, selectedFile);
      if (!upl_res.success) {
        return toast.error(upl_res.reason!);
      }

      await studentService.sendPhotoUrl(photo_url);
      toast.success("Formal photo successfully uploaded!");
      setSelectedFile(null);

      // TODO: Can trigger student data refresh here once the real API is ready
    } catch (err) {
      toast.error("Failed to upload photo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };
  // -----------------------------------------

  return (
    <Card className="md:col-span-1 border-t-4 border-t-amber-900 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-stone-700">
          <UserCircle className="w-5 h-5 text-amber-700" /> Yearbook Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
            {/* Fallback to undefined if photoUrl is null to prevent AvatarImage errors */}
            {/* Added previewUrl to display the selected photo immediately */}
            <AvatarImage src={(previewUrl || photoUrl) ?? undefined} className="object-cover" />
            <AvatarFallback className="text-4xl bg-stone-100 text-stone-300">JD</AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-sm border border-stone-100">
             <CheckCircle className="w-6 h-6 text-blue-500 fill-white" />
          </div>
        </div>
        <div>
          <h3 className="font-bold text-xl text-stone-800 font-serif">{fullName}</h3>
          <p className="text-sm font-medium text-amber-700 mt-1">{idNumber}</p>
          <p className="text-xs text-stone-500 mt-2 leading-relaxed px-4">{course}</p>
        </div>

        {/* --- HIDDEN FILE INPUT --- */}
        <input 
          type="file" 
          accept="image/png, image/jpeg, image/jpg" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
        />

        <div className="w-full space-y-2 pt-2 border-t border-stone-100">
          {/* --- UPLOAD BUTTONS LOGIC --- */}
          {selectedFile ? (
            <div className="flex gap-2">
              <Button 
                onClick={handleSavePhoto} 
                disabled={isUploading} 
                className="flex-1 bg-amber-700 hover:bg-amber-800 text-white text-xs h-9"
              >
                {isUploading ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Upload className="w-3 h-3 mr-2" />} 
                {isUploading ? "Saving..." : "Save Photo"}
              </Button>
              <Button 
                onClick={handleCancelUpload} 
                disabled={isUploading} 
                variant="outline" 
                className="flex-1 text-xs h-9"
              >
                <X className="w-3 h-3 mr-2" /> Cancel
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="w-full text-xs border-amber-200 text-amber-900 hover:bg-amber-50 hover:text-amber-900"
              onClick={() => fileInputRef.current?.click()} 
            >
              <Camera className="w-3 h-3 mr-2" /> 
              {photoUrl ? "Update Formal Photo" : "Upload Formal Photo"}
            </Button>
          )}

          {/* Replaced <Link> wrapper with an onClick handler directly on the Button */}
          <Button 
            variant="outline" 
            className="w-full text-xs border-stone-200 text-stone-700 hover:bg-stone-50"
            onClick={onCheckEntry} 
            disabled={isUploading} // Temporarily disabled during upload to prevent conflicting actions
          >
            <Info className="w-3 h-3 mr-2" /> Check Yearbook Entry
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}