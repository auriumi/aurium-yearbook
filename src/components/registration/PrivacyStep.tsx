// src/components/registration/PrivacyStep.tsx
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox"; 

export const PrivacyStep = ({ privacyAgreed, setPrivacyAgreed }: any) => (
  <div className="space-y-4">
    <div className="p-5 bg-stone-50 border border-stone-200 rounded-lg h-72 overflow-y-auto text-sm text-stone-600 leading-relaxed text-justify pr-2 scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-transparent">
        <h4 className="font-bold text-amber-900 mb-3 text-base">Data Privacy Consent</h4>
        <p className="mb-3">In compliance with the <strong>Data Privacy Act of 2012 (R.A. 10173)</strong>, I hereby authorize the AURIUM Yearbook Committee of the University of Mindanao Tagum College to collect, process, and store the personal data indicated herein for the purpose of the yearbook publication.</p>
        <p className="mb-3">I understand that my information will be used solely for:</p>
        <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>Verification of graduate status.</li>
            <li>Layout and design of the yearbook pages.</li>
            <li>Communication regarding yearbook distribution.</li>
        </ul>
        <p>I attest that all information provided is true and correct.</p>
    </div>
    <div className="flex items-start space-x-3 p-4 border border-amber-100 bg-amber-50/50 rounded-lg">
        <Checkbox id="terms" className="mt-1" checked={privacyAgreed} onCheckedChange={(checked) => setPrivacyAgreed(checked as boolean)} />
        <Label htmlFor="terms" className="text-sm font-medium leading-snug cursor-pointer text-amber-900">I have read and understood the Data Privacy Statement and agree to the processing of my personal data.</Label>
    </div>
  </div>
);