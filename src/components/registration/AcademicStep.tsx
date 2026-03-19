import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox"; 
import { departmentOptions } from "./RegistrationConstants";
import { MailWarning, AlertCircle, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react"; 
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const AcademicStep = ({ 
    selectedDepartment, handleDepartmentChange, 
    selectedCourse, handleCourseChange, currentCourses, 
    selectedMajor, setSelectedMajor, currentMajors, 
    thesisTitle, setThesisTitle, 
    contactNum, setContactNum, 
    email, setEmail, 
    umEmail, setUmEmail,
    hasUmEmailAccess, setHasUmEmailAccess,
    hasDuplicateEmail, setHasDuplicateEmail,
    hasDuplicateUmEmail, setHasDuplicateUmEmail
}: any) => {

  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [isCheckingUmEmail, setIsCheckingUmEmail] = useState(false);
  const [umEmailErrorMessage, setUmEmailErrorMessage] = useState("");
  
  // UX Update: Tracks which email triggered the duplicate modal
  const [duplicateDialogType, setDuplicateDialogType] = useState<'personal' | 'school' | null>(null);

  const isValidEmail = (emailStr: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  const isUmEmailValid = (emailStr: string) => /^[^\s@]+@umindanao\.edu\.ph$/i.test(emailStr.trim());
  const isValidContact = (num: string) => /^09\d{9}$/.test(num);

  const checkPersonalEmail = async () => {
      if (!email || !isValidEmail(email)) return;
      
      setIsCheckingEmail(true);
      try {
          const res = await fetch(`/api/student/check-email?email=${encodeURIComponent(email)}`);
          
          if (res.ok) {
              const data = await res.json();
              if (data.exists) {
                  setEmailErrorMessage("This email is already registered.");
                  if (setHasDuplicateEmail) setHasDuplicateEmail(true);
                  setDuplicateDialogType('personal');
              } else {
                  setEmailErrorMessage("");
                  if (setHasDuplicateEmail) setHasDuplicateEmail(false);
              }
          }
      } catch (error) {
          console.error("Error verifying personal email:", error);
      } finally {
          setIsCheckingEmail(false);
      }
  };

  const checkSchoolEmail = async () => {
      if (!umEmail || !isUmEmailValid(umEmail)) return;
      
      setIsCheckingUmEmail(true);
      try {
          const res = await fetch(`/api/student/check-email?email=${encodeURIComponent(umEmail)}`);
          
          if (res.ok) {
              const data = await res.json();
              if (data.exists) {
                  setUmEmailErrorMessage("This UM email is already registered.");
                  if (setHasDuplicateUmEmail) setHasDuplicateUmEmail(true);
                  setDuplicateDialogType('school');
              } else {
                  setUmEmailErrorMessage("");
                  if (setHasDuplicateUmEmail) setHasDuplicateUmEmail(false);
              }
          }
      } catch (error) {
          console.error("Error verifying school email:", error);
      } finally {
          setIsCheckingUmEmail(false);
      }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
          <Label>Department / School <span className="text-red-500">*</span></Label>
          <Select onValueChange={handleDepartmentChange} value={selectedDepartment}>
          <SelectTrigger className="w-full h-auto min-h-[50px] py-3 text-left flex items-center"><span className="whitespace-normal leading-tight block text-left w-full"><SelectValue placeholder="Select Department" /></span></SelectTrigger>
          <SelectContent className="max-h-[300px] max-w-[90vw] md:max-w-[500px]">{departmentOptions.map((dept) => (<SelectItem key={dept.name} value={dept.name} className="py-3 border-b last:border-0 whitespace-normal text-left font-semibold">{dept.name}</SelectItem>))}</SelectContent>
          </Select>
      </div>

      <div className="space-y-2">
          <Label>Program / Course <span className="text-red-500">*</span></Label>
          <Select onValueChange={handleCourseChange} value={selectedCourse} disabled={!selectedDepartment}>
          <SelectTrigger className={`w-full h-auto min-h-[50px] py-3 text-left flex items-center ${!selectedDepartment ? "bg-gray-100 text-gray-500" : ""}`}><span className="whitespace-normal leading-tight block text-left w-full"><SelectValue placeholder={!selectedDepartment ? "Select Department First" : "Select Course"} /></span></SelectTrigger>
          <SelectContent className="max-h-[300px] max-w-[90vw] md:max-w-[500px]">{currentCourses.map((opt: any) => (<SelectItem key={opt.name} value={opt.name} className="py-3 border-b last:border-0 whitespace-normal text-left">{opt.name}</SelectItem>))}</SelectContent>
          </Select>
      </div>

      <div className="space-y-2">
          <Label>Major / Specialization <span className="text-red-500">*</span></Label>
          <Select value={selectedMajor} onValueChange={setSelectedMajor} disabled={!selectedCourse || selectedMajor === "N/A"}>
              <SelectTrigger className={`w-full h-auto min-h-[50px] py-3 text-left items-center ${selectedMajor === "N/A" ? "bg-gray-100 text-gray-500" : ""}`}><span className="whitespace-normal leading-tight block text-left w-full"><SelectValue placeholder={selectedMajor === "N/A" ? "N/A (Not Applicable)" : "Select Major"} /></span></SelectTrigger>
              <SelectContent className="max-w-[90vw]">{selectedMajor === "N/A" ? (<SelectItem value="N/A">N/A</SelectItem>) : (currentMajors.map((major: any) => (<SelectItem key={major} value={major} className="py-2 whitespace-normal text-left">{major}</SelectItem>)))}</SelectContent>
          </Select>
      </div>

      <div className="space-y-2">
          <Label>Thesis / Capstone Title <span className="text-red-500">*</span></Label>
          <Input value={thesisTitle} onChange={e => setThesisTitle(e.target.value)} placeholder="Enter complete title of your Thesis or Capstone Project" className="h-11" />
      </div>

      <div className="h-px bg-gray-200 my-2"></div>

      <div className="space-y-2">
          <div className="flex justify-between items-center">
              <Label>Primary Contact Number <span className="text-red-500">*</span></Label>
              {contactNum.length > 0 && isValidContact(contactNum) && <CheckCircle2 className="w-4 h-4 text-green-500" />}
          </div>
          <Input 
            value={contactNum} 
            onChange={e => setContactNum(e.target.value.replace(/\D/g, ''))} 
            placeholder="09XXXXXXXXX" 
            inputMode="numeric" 
            maxLength={11} 
            className={`h-11 transition-colors ${contactNum.length > 0 ? (isValidContact(contactNum) ? "border-green-400 focus-visible:ring-green-500/20" : "border-red-400 focus-visible:ring-red-400") : ""}`} 
          />
          {contactNum.length > 0 && !isValidContact(contactNum) && (
              <span className="flex items-center gap-1 text-[10px] text-red-500 font-medium mt-1">
                <AlertCircle size={12}/> Must start with "09" and be exactly 11 digits long.
              </span>
          )}
      </div>

      <div className="space-y-2 relative">
          <div className="flex justify-between items-center">
              <Label>Personal Email Address <span className="text-red-500">*</span></Label>
              {email.length > 0 && isValidEmail(email) && !hasDuplicateEmail && <CheckCircle2 className="w-4 h-4 text-green-500" />}
          </div>
          <div className="relative">
              <Input 
                  type="email" 
                  value={email} 
                  onChange={e => {
                      setEmail(e.target.value);
                      if (hasDuplicateEmail && setHasDuplicateEmail) {
                          setHasDuplicateEmail(false);
                          setEmailErrorMessage("");
                      }
                  }} 
                  onBlur={checkPersonalEmail}
                  placeholder="juandelacruz@email.com" 
                  className={`h-11 transition-colors pr-10 ${hasDuplicateEmail ? "text-red-900 bg-red-50/30 border-red-500 focus-visible:ring-red-500/20" : email.length > 0 ? (isValidEmail(email) ? "border-green-400 focus-visible:ring-green-500/20" : "border-red-400 focus-visible:ring-red-400") : ""}`} 
              />
              {isCheckingEmail && <Loader2 className="w-4 h-4 absolute right-3 top-3.5 animate-spin text-amber-500" />}
          </div>
          {email.length > 0 && !isValidEmail(email) && !hasDuplicateEmail && (
              <span className="flex items-center gap-1 text-[10px] text-red-500 font-medium mt-1">
                  <MailWarning size={12}/> Please enter a valid email format.
              </span>
          )}
          {hasDuplicateEmail && emailErrorMessage && (
              <span className="flex items-center gap-1 text-[10px] text-red-500 font-medium mt-1 animate-in slide-in-from-top-1">
                  <AlertCircle size={12}/> {emailErrorMessage}
              </span>
          )}
      </div>

      <div className="flex items-start space-x-3 p-4 border border-stone-200 bg-stone-50/50 rounded-lg mt-4">
          <Checkbox 
              id="um-email-access" 
              checked={hasUmEmailAccess} 
              onCheckedChange={(checked) => {
                  setHasUmEmailAccess(checked as boolean);
                  if (!checked && setHasDuplicateUmEmail) {
                      setHasDuplicateUmEmail(false);
                      setUmEmailErrorMessage("");
                  }
              }} 
              className="mt-1"
          />
          <div className="space-y-1 leading-none">
              <Label htmlFor="um-email-access" className="text-sm font-bold cursor-pointer text-stone-800">I still have access to my UMindanao Email</Label>
              <p className="text-[10px] text-stone-500">Uncheck this if you forgot your password or can no longer log in to your UM student email.</p>
          </div>
      </div>

      {hasUmEmailAccess && (
          <div className="space-y-2 relative animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex justify-between items-center">
                  <Label>UM Student Email <span className="text-red-500">*</span></Label>
                  {umEmail.length > 0 && isUmEmailValid(umEmail) && !hasDuplicateUmEmail && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              </div>
              <div className="relative">
                  <Input 
                      type="email" 
                      value={umEmail} 
                      onChange={e => {
                          setUmEmail(e.target.value);
                          if (hasDuplicateUmEmail && setHasDuplicateUmEmail) {
                              setHasDuplicateUmEmail(false);
                              setUmEmailErrorMessage("");
                          }
                      }} 
                      onBlur={checkSchoolEmail}
                      placeholder="j.delacruz.142458.tc@umindanao.edu.ph" 
                      className={`h-11 transition-colors pr-10 ${hasDuplicateUmEmail ? "text-red-900 bg-red-50/30 border-red-500 focus-visible:ring-red-500/20" : umEmail.length > 0 ? (isUmEmailValid(umEmail) ? "border-green-400 focus-visible:ring-green-500/20" : "border-red-400 focus-visible:ring-red-400") : ""}`} 
                  />
                  {isCheckingUmEmail && <Loader2 className="w-4 h-4 absolute right-3 top-3.5 animate-spin text-amber-500" />}
              </div>
              {umEmail.length > 0 && !isUmEmailValid(umEmail) && !hasDuplicateUmEmail && (
                  <span className="flex items-center gap-1 text-[10px] text-red-500 font-medium mt-1">
                      <MailWarning size={12}/> Must be a valid @umindanao.edu.ph address.
                  </span>
              )}
              {hasDuplicateUmEmail && umEmailErrorMessage && (
                  <span className="flex items-center gap-1 text-[10px] text-red-500 font-medium mt-1 animate-in slide-in-from-top-1">
                      <AlertCircle size={12}/> {umEmailErrorMessage}
                  </span>
              )}
          </div>
      )}

      {/* UX Update: Critical Warning Dialog for Duplicate Emails */}
      <Dialog open={!!duplicateDialogType} onOpenChange={(open) => !open && setDuplicateDialogType(null)}>
          <DialogContent className="max-w-sm p-6 bg-white rounded-xl shadow-2xl border-red-100 [&>button]:hidden">
              <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-2 ring-8 ring-red-50/50">
                      <AlertTriangle size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900">Email Already Registered</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">
                      The {duplicateDialogType === 'personal' ? 'Personal' : 'School'} email address <strong className="text-stone-800 break-all">{duplicateDialogType === 'personal' ? email : umEmail}</strong> is already in use by another account.
                      <br/><br/>
                      Duplicate emails are not allowed. Please provide a different email address to continue.
                  </p>
                  <Button 
                      className="w-full bg-red-600 hover:bg-red-700 text-white shadow-sm mt-4 font-semibold tracking-wide"
                      onClick={() => setDuplicateDialogType(null)}
                  >
                      I Understand
                  </Button>
              </div>
          </DialogContent>
      </Dialog>
    </div>
  );
};