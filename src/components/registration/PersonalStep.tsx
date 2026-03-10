// src/components/registration/PersonalStep.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toTitleCase } from "./RegistrationConstants";
import { AlertCircle } from "lucide-react"; 

export const PersonalStep = ({ idNumber, setIdNumber, lname, setLname, fname, setFname, mname, setMname, suffix, setSuffix, nickname, setNickname, bdate, setBdate }: any) => {

  // Helper function to validate if the birth year is within a realistic range (1950-2012).
  const isRealisticYear = (dateStr: string) => {
      if (!dateStr) return true; 
      const year = new Date(dateStr).getFullYear();
      return year >= 1950 && year <= 2012;
  };

  // Helper function to check if nickname is just empty spaces
  const isNicknameInvalid = nickname !== undefined && nickname.length > 0 && nickname.trim() === "";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
          <Label htmlFor="idNumber">Student ID Number <span className="text-red-500">*</span></Label>
          <Input 
              id="idNumber" 
              value={idNumber} 
              // Added regex replace to automatically remove non-numeric characters
              onChange={e => setIdNumber(e.target.value.replace(/\D/g, ''))} 
              placeholder="e.g. 142478" 
              maxLength={6} 
              inputMode="numeric" 
              className="h-11 font-mono text-amber-900 font-medium bg-amber-50/30 border-amber-200" 
          />
      </div>
      <div className="h-px bg-gray-100 my-2"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
              <Label htmlFor="lname">Last Name <span className="text-red-500">*</span></Label>
              <Input id="lname" value={lname} onChange={e => setLname(toTitleCase(e.target.value))} placeholder="Dela Cruz" className="h-11" />
          </div>
          <div className="space-y-2">
              <Label htmlFor="fname">First Name <span className="text-red-500">*</span></Label>
              <Input id="fname" value={fname} onChange={e => setFname(toTitleCase(e.target.value))} placeholder="Juan" className="h-11" />
          </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
              <Label htmlFor="mname">Middle Name</Label>
              <Input id="mname" value={mname} onChange={e => setMname(toTitleCase(e.target.value))} placeholder="Santos" className="h-11" />
          </div>
          <div className="space-y-2">
              <Label htmlFor="suffix">Suffix</Label>
              <Input id="suffix" value={suffix} onChange={e => setSuffix(e.target.value)} placeholder="Jr., III (Optional)" className="h-11" />
          </div>
      </div>
      <div className="space-y-2">
          <Label htmlFor="nickname">Nickname (for Yearbook) <span className="text-red-500">*</span></Label>
          <Input 
              id="nickname" 
              value={nickname} 
              onChange={(e) => setNickname(e.target.value)} 
              placeholder="Juanny" 
              // if the nickname is just empty spaces, we show an error.
              className={`h-11 ${isNicknameInvalid ? "border-red-400 focus-visible:ring-red-400" : ""}`} 
              required 
          />
          {/* Error message for empty/invalid nickname */}
          {isNicknameInvalid && (
              <span className="flex items-center gap-1 text-[10px] text-red-500 font-medium mt-1">
                  <AlertCircle size={12}/> Nickname cannot be empty spaces.
              </span>
          )}
      </div>
      <div className="space-y-2">
          <Label htmlFor="bdate">Birthdate <span className="text-red-500">*</span></Label>
          <Input 
              id="bdate" 
              type="date" 
              value={bdate} 
              onChange={e => setBdate(e.target.value)} 
              // The boarding system will block unrealistic years (like 1111).
              className={`block w-full h-11 ${!isRealisticYear(bdate) ? "border-red-400 focus-visible:ring-red-400" : ""}`} 
              min="1950-01-01" 
              max="2012-12-31" 
              required 
          />
          {/* Error message for invalid birth year */}
          {!isRealisticYear(bdate) && (
              <span className="flex items-center gap-1 text-[10px] text-red-500 font-medium mt-1">
                  <AlertCircle size={12}/> Please enter a valid year between 1950 and 2012.
              </span>
          )}
      </div>
    </div>
  );
};