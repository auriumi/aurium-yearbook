// src/components/registration/AcademicStep.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox"; 
import { departmentOptions } from "./RegistrationConstants";
// Added AlertCircle for the phone validation warning
import { MailWarning, AlertCircle } from "lucide-react"; 

export const AcademicStep = ({ 
    selectedDepartment, handleDepartmentChange, 
    selectedCourse, handleCourseChange, currentCourses, 
    selectedMajor, setSelectedMajor, currentMajors, 
    thesisTitle, setThesisTitle, 
    contactNum, setContactNum, 
    email, setEmail, 
    umEmail, setUmEmail,
    hasUmEmailAccess, setHasUmEmailAccess // New props for email access
}: any) => {

  // Simple Regex to check if email format is valid (has @ and domain)
  const isValidEmail = (emailStr: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);

  // Simple Regex to ensure contact number starts with 09 and is exactly 11 digits long
  const isValidContact = (num: string) => /^09\d{9}$/.test(num);

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

      {/* PRIMARY CONTACT NUMBER (Added strict 09 format validation) */}
      <div className="space-y-2">
          <Label>Primary Contact Number <span className="text-red-500">*</span></Label>
          <Input 
            value={contactNum} 
            onChange={e => setContactNum(e.target.value.replace(/\D/g, ''))} 
            placeholder="09XXXXXXXXX" 
            inputMode="numeric" 
            maxLength={11} 
            className={`h-11 ${contactNum.length > 0 && !isValidContact(contactNum) ? "border-red-400 focus-visible:ring-red-400" : ""}`} 
          />
          {contactNum.length > 0 && !isValidContact(contactNum) && (
              <span className="flex items-center gap-1 text-[10px] text-red-500 font-medium mt-1">
                <AlertCircle size={12}/> Must start with "09" and be exactly 11 digits long.
              </span>
          )}
      </div>

      {/* PERSONAL EMAIL (With validation format) */}
      <div className="space-y-2">
          <Label>Personal Email Address <span className="text-red-500">*</span></Label>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="juandelacruz@email.com" className={`h-11 ${email.length > 0 && !isValidEmail(email) ? "border-red-400 focus-visible:ring-red-400" : ""}`} />
          {email.length > 0 && !isValidEmail(email) && (
              <span className="flex items-center gap-1 text-[10px] text-red-500 font-medium mt-1"><MailWarning size={12}/> Please enter a valid email format.</span>
          )}
      </div>

      {/* UM EMAIL ACCESS TOGGLE */}
      <div className="flex items-start space-x-3 p-4 border border-stone-200 bg-stone-50/50 rounded-lg mt-4">
          <Checkbox id="um-email-access" checked={hasUmEmailAccess} onCheckedChange={(checked) => setHasUmEmailAccess(checked as boolean)} className="mt-1"/>
          <div className="space-y-1 leading-none">
              <Label htmlFor="um-email-access" className="text-sm font-bold cursor-pointer text-stone-800">I still have access to my UMindanao Email</Label>
              <p className="text-[10px] text-stone-500">Uncheck this if you forgot your password or can no longer log in to your UM student email.</p>
          </div>
      </div>

      {/* UM EMAIL INPUT (Hidden if the toggle above is unchecked) */}
      {hasUmEmailAccess && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label>UM Student Email <span className="text-red-500">*</span></Label>
              <Input type="email" value={umEmail} onChange={e => setUmEmail(e.target.value)} placeholder="j.delacruz.142458.tc@umindanao.edu.ph" className={`h-11 ${umEmail.length > 0 && !isValidEmail(umEmail) ? "border-red-400 focus-visible:ring-red-400" : ""}`} />
              {umEmail.length > 0 && !isValidEmail(umEmail) && (
                  <span className="flex items-center gap-1 text-[10px] text-red-500 font-medium mt-1"><MailWarning size={12}/> Please enter a valid UM email format.</span>
              )}
          </div>
      )}
    </div>
  );
};