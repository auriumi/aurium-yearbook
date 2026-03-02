// src/components/registration/ReviewStep.tsx
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox"; 
import { UserCircle, ClipboardCheck, MapPin, GraduationCap, Users, Mail, Phone, Calendar, CreditCard } from "lucide-react";

export const ReviewStep = ({ idNumber, fname, mname, lname, suffix, nickname, formattedBirthdate, barangayName, cityName, provinceName, selectedDepartment, selectedCourse, selectedMajor, thesisTitle, umEmail, contactNum, email, useGuardian, guardianTitle, guardianFname, guardianLname, guardianRel, fatherTitle, fatherFname, fatherMname, fatherLname, fatherSuffix, motherTitle, motherFname, motherMname, motherLname, reviewConfirmed, setReviewConfirmed }: any) => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="bg-stone-50/80 border border-stone-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-200">
        <div className="bg-amber-100 p-2.5 rounded-full"><ClipboardCheck className="text-amber-800 w-6 h-6" /></div>
        <div><h3 className="font-serif font-bold text-amber-900 text-xl">Review Registration</h3><p className="text-stone-500 text-xs">Please verify your information before submitting.</p></div>
        </div>
        <div className="space-y-8">
        <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-bold text-amber-900 uppercase tracking-wider"><UserCircle size={16} /> Personal Identity</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 bg-white p-4 rounded-lg border border-stone-100 shadow-sm">
            <div className="md:col-span-2 pb-2 border-b border-stone-50 mb-2"><span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-1">Student ID Number</span><div className="flex items-center gap-2 text-amber-800 font-mono font-bold text-lg"><CreditCard size={16}/> {idNumber || "-"}</div></div>
            <div><span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-1">Full Name</span><span className="text-stone-900 font-semibold text-lg">{fname} {mname} {lname} {suffix}</span></div>
            <div><span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-1">Nickname</span><span className="text-stone-900 font-medium">{nickname ? `"${nickname}"` : "-"}</span></div>
            <div><span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-1">Birthdate</span><div className="flex items-center gap-2 text-stone-900 font-medium"><Calendar size={14} className="text-amber-600"/> {formattedBirthdate || "-"}</div></div>
            </div>
        </div>
        <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-bold text-amber-900 uppercase tracking-wider"><MapPin size={16} /> Residence</h4>
            <div className="bg-white p-4 rounded-lg border border-stone-100 shadow-sm"><span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-1">Home Address</span><span className="text-stone-900 font-medium">{barangayName}, {cityName}, {provinceName}</span></div>
        </div>
        <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-bold text-amber-900 uppercase tracking-wider"><GraduationCap size={16} /> Academic Profile</h4>
            <div className="bg-white p-4 rounded-lg border border-stone-100 shadow-sm space-y-4">
            <div><span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-1">Department</span><span className="text-stone-900 font-bold block mb-2">{selectedDepartment}</span><span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-1">Course & Major</span><span className="text-stone-900 font-bold block">{selectedCourse}</span>{selectedMajor !== "N/A" && <span className="text-amber-700 text-sm font-medium block mt-1">{selectedMajor}</span>}</div>
            <div className="pt-2 border-t border-stone-100 mt-2"><span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-1">Thesis / Capstone Title</span><span className="text-stone-900 font-medium italic">"{thesisTitle}"</span></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
                <div><span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-1">UM Student Email</span><div className="flex items-center gap-2 text-blue-700 font-medium break-all"><Mail size={14}/> {umEmail || "-"}</div></div>
                <div><span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-1">Contact Number</span><div className="flex items-center gap-2 text-stone-900 font-medium"><Phone size={14} className="text-amber-600"/> {contactNum || "-"}</div></div>
                <div className="md:col-span-2"><span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-1">Personal Email</span><span className="text-stone-700 font-medium">{email || "-"}</span></div>
            </div>
            </div>
        </div>
        <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-bold text-amber-900 uppercase tracking-wider"><Users size={16} /> Family Background</h4>
            <div className="bg-white p-4 rounded-lg border border-stone-100 shadow-sm">
            {useGuardian ? (
                <div className="grid grid-cols-1 gap-2"><div><span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-1">Guardian</span><span className="text-stone-900 font-medium">{guardianTitle} {guardianFname} {guardianLname}</span><span className="text-stone-400 text-xs ml-2">({guardianRel})</span></div></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-1">Father</span><span className="text-stone-900 font-medium">{fatherTitle} {fatherFname} {fatherMname} {fatherLname} {fatherSuffix}</span></div>
                    <div><span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-1">Mother</span><span className="text-stone-900 font-medium">{motherTitle} {motherFname} {motherMname} {motherLname}</span></div>
                </div>
            )}
            </div>
        </div>
        </div>
    </div>
    <div className="flex items-start space-x-3 p-4 border border-stone-200 bg-amber-50/30 rounded-lg">
        <Checkbox id="confirm-review" className="mt-1 border-amber-400 text-amber-700 focus:ring-amber-700" checked={reviewConfirmed} onCheckedChange={(checked) => setReviewConfirmed(checked as boolean)} />
        <Label htmlFor="confirm-review" className="text-sm font-medium leading-snug cursor-pointer text-stone-700">I hereby confirm that the details shown above are true, correct, and free from errors.</Label>
    </div>
  </div>
);