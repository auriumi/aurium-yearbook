import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toTitleCase } from "./RegistrationConstants";
import { AlertCircle, AlertTriangle, Loader2 } from "lucide-react"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const PersonalStep = ({ 
    idNumber, setIdNumber, 
    lname, setLname, 
    fname, setFname, 
    mname, setMname, 
    suffix, setSuffix, 
    nickname, setNickname, 
    bdate, setBdate,
    hasDuplicateId, setHasDuplicateId 
}: any) => {

  const [isCheckingId, setIsCheckingId] = useState(false);
  const [idErrorMessage, setIdErrorMessage] = useState("");
  // UX Update: State to control the hard-stop warning modal
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);

  const isRealisticYear = (dateStr: string) => {
      if (!dateStr) return true; 
      const year = new Date(dateStr).getFullYear();
      return year >= 1950 && year <= 2012;
  };

  const isNicknameInvalid = nickname !== undefined && nickname.length > 0 && nickname.trim() === "";

  const sanitizeName = (value: string) => {
      return value.replace(/[^a-zA-ZñÑ\s-]/g, '');
  };

  const checkStudentId = async () => {
      if (!idNumber || idNumber.length < 5) return;
      
      if (Number(idNumber) === 0) {
          setIdErrorMessage("Invalid Student ID format.");
          if (setHasDuplicateId) setHasDuplicateId(true);
          return;
      }
      
      setIsCheckingId(true);
      try {
          const res = await fetch(`/api/student/check-id?id=${idNumber}`);
          
          if (res.ok) {
              const data = await res.json();
              if (data.exists) {
                  setIdErrorMessage("Account already exist");
                  if (setHasDuplicateId) setHasDuplicateId(true);
                  // Fire the modal immediately
                  setShowDuplicateDialog(true);
              } else {
                  setIdErrorMessage("");
                  if (setHasDuplicateId) setHasDuplicateId(false);
              }
          }
      } catch (error) {
          console.error("Error verifying Student ID:", error);
      } finally {
          setIsCheckingId(false);
      }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2 relative">
          <Label htmlFor="idNumber">Student ID Number <span className="text-red-500">*</span></Label>
          <div className="relative">
              <Input 
                  id="idNumber" 
                  value={idNumber} 
                  onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setIdNumber(val);
                      
                      if (val.length === 6 && Number(val) === 0) {
                          setIdErrorMessage("Invalid Student ID format.");
                          if (setHasDuplicateId) setHasDuplicateId(true);
                      } else {
                          if (hasDuplicateId && setHasDuplicateId) {
                              setHasDuplicateId(false);
                              setIdErrorMessage("");
                          }
                      }
                  }} 
                  onBlur={checkStudentId}
                  placeholder="e.g. 142478" 
                  maxLength={6} 
                  inputMode="numeric" 
                  className={`h-11 font-mono font-medium transition-colors pr-10 ${hasDuplicateId ? "text-red-900 bg-red-50/30 border-red-500 focus-visible:ring-red-500/20" : "text-amber-900 bg-amber-50/30 border-amber-200"}`} 
              />
              {isCheckingId && <Loader2 className="w-4 h-4 absolute right-3 top-3.5 animate-spin text-amber-500" />}
          </div>
          {hasDuplicateId && idErrorMessage && (
              <span className="flex items-center gap-1 text-[10px] text-red-500 font-medium mt-1 animate-in slide-in-from-top-1">
                  <AlertCircle size={12}/> {idErrorMessage}
              </span>
          )}
      </div>
      <div className="h-px bg-gray-100 my-2"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
              <Label htmlFor="lname">Last Name <span className="text-red-500">*</span></Label>
              <Input 
                  id="lname" 
                  value={lname} 
                  onChange={e => setLname(toTitleCase(sanitizeName(e.target.value)))} 
                  placeholder="Dela Cruz" 
                  className="h-11" 
              />
          </div>
          <div className="space-y-2">
              <Label htmlFor="fname">First Name <span className="text-red-500">*</span></Label>
              <Input 
                  id="fname" 
                  value={fname} 
                  onChange={e => setFname(toTitleCase(sanitizeName(e.target.value)))} 
                  placeholder="Juan" 
                  className="h-11" 
              />
          </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
              <Label htmlFor="mname">Middle Name</Label>
              <Input 
                  id="mname" 
                  value={mname} 
                  onChange={e => setMname(toTitleCase(sanitizeName(e.target.value)))} 
                  placeholder="Santos" 
                  className="h-11" 
              />
          </div>
          <div className="space-y-2">
              <Label htmlFor="suffix">Suffix</Label>
              <Select value={suffix} onValueChange={setSuffix}>
                  <SelectTrigger id="suffix" className="h-11">
                      <SelectValue placeholder="Select Suffix" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="N/A">N/A</SelectItem>
                      <SelectItem value="Jr.">Jr.</SelectItem>
                      <SelectItem value="Sr.">Sr.</SelectItem>
                      <SelectItem value="II">II</SelectItem>
                      <SelectItem value="III">III</SelectItem>
                      <SelectItem value="IV">IV</SelectItem>
                      <SelectItem value="V">V</SelectItem>
                  </SelectContent>
              </Select>
          </div>
      </div>
      <div className="space-y-2">
          <Label htmlFor="nickname">Nickname (for Yearbook) <span className="text-red-500">*</span></Label>
          <Input 
              id="nickname" 
              value={nickname} 
              onChange={(e) => setNickname(e.target.value)} 
              placeholder="Juanny" 
              className={`h-11 ${isNicknameInvalid ? "border-red-400 focus-visible:ring-red-400" : ""}`} 
              required 
          />
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
              className={`block w-full h-11 ${!isRealisticYear(bdate) ? "border-red-400 focus-visible:ring-red-400" : ""}`} 
              min="1950-01-01" 
              max="2012-12-31" 
              required 
          />
          {!isRealisticYear(bdate) && (
              <span className="flex items-center gap-1 text-[10px] text-red-500 font-medium mt-1">
                  <AlertCircle size={12}/> Please enter a valid year between 1950 and 2012.
              </span>
          )}
      </div>

      {/* UX Update: Critical Warning Dialog for Duplicate IDs */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
          <DialogContent className="max-w-sm p-6 bg-white rounded-xl shadow-2xl border-red-100 [&>button]:hidden">
              <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-2 ring-8 ring-red-50/50">
                      <AlertTriangle size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900">ID Already Registered</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">
                      The Student ID <strong className="text-stone-800">{idNumber}</strong> is already associated with an existing pre-registration account.
                      <br/><br/>
                      If you believe this is an error, please contact the administration. Otherwise, double-check your ID.
                  </p>
                  <Button 
                      className="w-full bg-red-600 hover:bg-red-700 text-white shadow-sm mt-4 font-semibold tracking-wide"
                      onClick={() => setShowDuplicateDialog(false)}
                  >
                      I Understand
                  </Button>
              </div>
          </DialogContent>
      </Dialog>
    </div>
  );
};