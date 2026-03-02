// src/components/registration/FamilyStep.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox"; 
import { titleOptions, toTitleCase } from "./RegistrationConstants";

export const FamilyStep = ({ useGuardian, setUseGuardian, guardianLname, setGuardianLname, guardianTitle, setGuardianTitle, guardianFname, setGuardianFname, guardianRel, setGuardianRel, fatherLname, setFatherLname, fatherTitle, setFatherTitle, fatherFname, setFatherFname, fatherMname, setFatherMname, fatherSuffix, setFatherSuffix, motherLname, setMotherLname, motherTitle, setMotherTitle, motherFname, setMotherFname, motherMname, setMotherMname }: any) => (
  <div className="space-y-6">
    <div className="flex items-center space-x-2 bg-amber-50 p-4 rounded-lg border border-amber-100">
        <Checkbox id="guardian-mode" checked={useGuardian} onCheckedChange={(checked) => setUseGuardian(checked as boolean)} />
        <Label htmlFor="guardian-mode" className="cursor-pointer text-amber-900 font-medium">I live with a Guardian (Not Parents)</Label>
    </div>
    {!useGuardian ? (
        <>
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-4 border-b border-gray-100">
            <h3 className="font-bold text-amber-900 text-sm uppercase tracking-wide">Father's Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Last Name <span className="text-red-500">*</span></Label><Input value={fatherLname} onChange={e => setFatherLname(toTitleCase(e.target.value))} placeholder="Dela Cruz" className="h-10" /></div>
                <div className="space-y-2"><Label>First Name <span className="text-red-500">*</span></Label><div className="flex gap-2"><Select value={fatherTitle} onValueChange={setFatherTitle}><SelectTrigger className="w-[80px] shrink-0 h-10"><SelectValue /></SelectTrigger><SelectContent>{titleOptions.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select><Input value={fatherFname} onChange={e => setFatherFname(toTitleCase(e.target.value))} placeholder="Juan" className="flex-1 h-10"/></div></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Middle Name</Label><Input value={fatherMname} onChange={e => setFatherMname(toTitleCase(e.target.value))} placeholder="Santos" className="h-10" /></div>
                <div className="space-y-2"><Label>Suffix</Label><Input value={fatherSuffix} onChange={e => setFatherSuffix(e.target.value)} placeholder="Jr." className="h-10" /></div>
            </div>
        </div>
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="font-bold text-amber-900 text-sm uppercase tracking-wide">Mother's Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Last Name <span className="text-red-500">*</span></Label><Input value={motherLname} onChange={e => setMotherLname(toTitleCase(e.target.value))} placeholder="Dela Cruz" className="h-10" /></div>
                <div className="space-y-2"><Label>First Name <span className="text-red-500">*</span></Label><div className="flex gap-2"><Select value={motherTitle} onValueChange={setMotherTitle}><SelectTrigger className="w-[80px] shrink-0 h-10"><SelectValue /></SelectTrigger><SelectContent>{titleOptions.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select><Input value={motherFname} onChange={e => setMotherFname(toTitleCase(e.target.value))} placeholder="Maria" className="flex-1 h-10"/></div></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Middle Name</Label><Input value={motherMname} onChange={e => setMotherMname(toTitleCase(e.target.value))} placeholder="Santos" className="h-10" /></div>
            </div>
        </div>
        </>
    ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="font-bold text-amber-900 text-sm uppercase tracking-wide">Guardian's Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Last Name <span className="text-red-500">*</span></Label><Input value={guardianLname} onChange={e => setGuardianLname(toTitleCase(e.target.value))} placeholder="Last Name" className="h-10" /></div>
                <div className="space-y-2"><Label>First Name <span className="text-red-500">*</span></Label><div className="flex gap-2"><Select value={guardianTitle} onValueChange={setGuardianTitle}><SelectTrigger className="w-[80px] shrink-0 h-10"><SelectValue /></SelectTrigger><SelectContent>{titleOptions.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select><Input value={guardianFname} onChange={e => setGuardianFname(toTitleCase(e.target.value))} placeholder="First Name" className="flex-1 h-10"/></div></div>
            </div>
            <div className="space-y-2"><Label>Relationship <span className="text-red-500">*</span></Label><Input value={guardianRel} onChange={e => setGuardianRel(toTitleCase(e.target.value))} placeholder="e.g. Grandmother" className="h-10" /></div>
        </div>
    )}
  </div>
);