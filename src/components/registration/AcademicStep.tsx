// src/components/registration/AcademicStep.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { departmentOptions } from "./RegistrationConstants";

export const AcademicStep = ({ selectedDepartment, handleDepartmentChange, selectedCourse, handleCourseChange, currentCourses, selectedMajor, setSelectedMajor, currentMajors, thesisTitle, setThesisTitle, contactNum, setContactNum, email, setEmail, umEmail, setUmEmail }: any) => (
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
        <Label>Primary Contact Number <span className="text-red-500">*</span></Label>
        <Input value={contactNum} onChange={e => setContactNum(e.target.value)} placeholder="09XXXXXXXXX" inputMode="numeric" maxLength={11} className="h-11" />
    </div>
    <div className="space-y-2">
        <Label>Personal Email Address <span className="text-red-500">*</span></Label>
        <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="juandelacruz@email.com" className="h-11" />
    </div>
    <div className="space-y-2">
        <Label>UM Student Email <span className="text-red-500">*</span></Label>
        <Input type="email" value={umEmail} onChange={e => setUmEmail(e.target.value)} placeholder="j.delacruz.142458.tc@umindanao.edu.ph" className="h-11" />
    </div>
  </div>
);