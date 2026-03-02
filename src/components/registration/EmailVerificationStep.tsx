// src/components/registration/EmailVerificationStep.tsx

/*
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, ShieldCheck, CheckCircle } from "lucide-react";

export function EmailVerificationStep({ umEmail, isCodeSent, handleSendCode, verificationCode, setVerificationCode, isEmailVerified, handleVerifyCode }: any) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
        <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-2">
          <ShieldCheck size={20} /> Verify Your UM Email
        </h4>
        <p className="text-sm text-blue-800 leading-relaxed">
          To ensure account security, we need to verify your official University of Mindanao student email address: <br/>
          <strong className="text-blue-950 font-mono text-base block mt-2 p-2 bg-white rounded border border-blue-200 shadow-sm w-fit">{umEmail || "No email provided"}</strong>
        </p>
      </div>

      {!isCodeSent ? (
        <Button onClick={handleSendCode} className="w-full h-12 text-lg bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20">
          <Mail className="mr-2" size={20}/> Send Verification Code
        </Button>
      ) : (
        <div className="space-y-5 p-6 border border-stone-200 rounded-xl bg-white shadow-sm">
          <div className="space-y-3">
            <Label className="text-stone-600">Enter the 6-digit code sent to your email</Label>
            <Input value={verificationCode} onChange={e => setVerificationCode(e.target.value)} placeholder="XXXXXX" maxLength={6} className="h-14 text-center text-2xl tracking-[0.5em] font-mono font-bold border-amber-300 focus:border-amber-600 focus:ring-amber-600/20 transition-all" disabled={isEmailVerified} />
          </div>
          {!isEmailVerified ? (
            <Button onClick={handleVerifyCode} className="w-full h-12 bg-amber-900 hover:bg-amber-800 text-white text-base">Verify Code</Button>
          ) : (
            <div className="flex items-center justify-center gap-2 text-green-700 font-bold bg-green-50 border border-green-200 p-4 rounded-lg animate-in zoom-in-95 duration-300">
              <CheckCircle size={24} className="text-green-600" /> Email Verified Successfully!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
*/