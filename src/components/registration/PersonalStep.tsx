// src/components/registration/PersonalStep.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toTitleCase } from "./RegistrationConstants";

export const PersonalStep = ({ idNumber, setIdNumber, lname, setLname, fname, setFname, mname, setMname, suffix, setSuffix, nickname, setNickname, bdate, setBdate }: any) => (
  <div className="space-y-4">
    <div className="space-y-2">
        <Label htmlFor="idNumber">Student ID Number <span className="text-red-500">*</span></Label>
        <Input 
            id="idNumber" 
            value={idNumber} 
            // Gi-add ang replace aron e-delete dritso ang letters
            onChange={e => setIdNumber(e.target.value.replace(/\D/g, ''))} 
            placeholder="e.g. 142478" 
            maxLength={6} // Limit lang sa 6 digits
            inputMode="numeric" // Number keypad mogawas sa cellphone
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
        <Label htmlFor="nickname">Nickname (for Yearbook)</Label>
        <Input id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Juanny" className="h-11" />
    </div>
    <div className="space-y-2">
        <Label htmlFor="bdate">Birthdate <span className="text-red-500">*</span></Label>
        <Input id="bdate" type="date" value={bdate} onChange={e => setBdate(e.target.value)} className="block w-full h-11" />
    </div>
  </div>
);