"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { AlertTriangle, CheckCircle2, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import * as correctionService from "@/app/auth/correctionService";

type CorrectionField = {
  key: string;
  label: string;
  from: string;
  to: string;
};

type CorrectionRequest = {
  status: string;
  category: string;
  expires_at: string;
  student_number: number;
  student_name: string;
  fields: CorrectionField[];
};

function ConfirmCorrectionContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [request, setRequest] = useState<CorrectionRequest | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<"confirm" | "reject" | null>(null);
  const [completedAction, setCompletedAction] = useState<"confirm" | "reject" | null>(null);

  useEffect(() => {
    let active = true;

    const loadRequest = async () => {
      if (!token) {
        setError("This correction link is missing or invalid.");
        setIsLoading(false);
        return;
      }

      const res = await correctionService.getCorrectionRequest(token);
      if (!active) return;

      if (!res.success) {
        setError(res.reason);
        setIsLoading(false);
        return;
      }

      setRequest(res.data);
      setIsLoading(false);
    };

    loadRequest();

    return () => {
      active = false;
    };
  }, [token]);

  const handleDecision = async (decision: "confirm" | "reject") => {
    if (!token) return;

    setIsSubmitting(decision);
    try {
      const res = await correctionService.resolveCorrectionRequest(token, decision);

      if (!res.success) {
        toast.error(res.reason);
        setError(res.reason);
        return;
      }

      setCompletedAction(decision);
      toast.success(decision === "confirm" ? "Correction confirmed." : "Correction rejected.");
    } finally {
      setIsSubmitting(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full border-stone-200 bg-white/85 backdrop-blur-xl shadow-2xl">
        <CardContent className="py-12 flex flex-col items-center gap-3 text-stone-500">
          <Loader2 className="h-6 w-6 animate-spin text-amber-700" />
          Loading correction request...
        </CardContent>
      </Card>
    );
  }

  if (error || !request) {
    return (
      <Card className="w-full border-stone-200 bg-white/85 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center pt-10">
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <CardTitle className="font-serif text-xl text-stone-900">Unable to Open Request</CardTitle>
          <CardDescription>{error || "This correction request is unavailable."}</CardDescription>
        </CardHeader>
        <CardFooter className="justify-center pb-8">
          <Link href="/auth/login" className="text-sm font-bold text-amber-700 hover:underline">Back to AURIUM Login</Link>
        </CardFooter>
      </Card>
    );
  }

  if (completedAction) {
    return (
      <Card className="w-full border-stone-200 bg-white/85 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center pt-10">
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-green-50 text-green-700 flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <CardTitle className="font-serif text-xl text-stone-900">
            {completedAction === "confirm" ? "Correction Confirmed" : "Correction Rejected"}
          </CardTitle>
          <CardDescription>
            {completedAction === "confirm"
              ? "Thank you. Your yearbook data has been updated with the proposed correction."
              : "Thank you. Your current yearbook data was kept unchanged."}
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center pb-8">
          <Link href="/auth/login" className="text-sm font-bold text-amber-700 hover:underline">Back to AURIUM Login</Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full border-stone-200 bg-white/90 backdrop-blur-xl shadow-2xl">
      <CardHeader className="pb-5 pt-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="font-serif text-xl text-stone-900">Confirm Yearbook Data Correction</CardTitle>
            <CardDescription>
              Review the proposed changes before updating your final yearbook record.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
          <p className="font-semibold text-stone-800">{request.student_name || "Student"} ({request.student_number})</p>
          <p className="mt-1">Section: <span className="font-semibold capitalize">{request.category}</span></p>
          <p className="mt-1 text-xs text-stone-500">Expires: {new Date(request.expires_at).toLocaleString()}</p>
        </div>

        <div className="overflow-hidden rounded-xl border border-stone-200">
          <div className="grid grid-cols-[1fr_1fr_1fr] bg-amber-50 text-[10px] font-bold uppercase tracking-wider text-amber-900">
            <div className="p-3">Field</div>
            <div className="p-3">Current</div>
            <div className="p-3">Proposed</div>
          </div>
          {request.fields.map((field) => (
            <div key={field.key} className="grid grid-cols-[1fr_1fr_1fr] border-t border-stone-100 text-sm">
              <div className="p-3 font-semibold text-stone-800 break-words">{field.label}</div>
              <div className="p-3 text-stone-500 break-words">{field.from}</div>
              <div className="p-3 text-stone-900 break-words">{field.to}</div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-amber-100 bg-amber-50/70 p-3 text-xs text-amber-900 leading-relaxed">
          Only confirm if the proposed data is correct. What you confirm here is what the committee will use for your yearbook record.
        </div>
      </CardContent>

      <CardFooter className="flex flex-col-reverse sm:flex-row gap-3 justify-end border-t border-stone-100 pt-5 pb-6">
        <Button
          variant="outline"
          onClick={() => handleDecision("reject")}
          disabled={!!isSubmitting}
          className="w-full sm:w-auto border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
        >
          {isSubmitting === "reject" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
          Reject
        </Button>
        <Button
          onClick={() => handleDecision("confirm")}
          disabled={!!isSubmitting}
          className="w-full sm:w-auto bg-amber-800 hover:bg-amber-900 text-white"
        >
          {isSubmitting === "confirm" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
          Confirm Changes
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function ConfirmCorrectionPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-40 mix-blend-multiply"></div>
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-amber-100/50 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-stone-200/50 rounded-full blur-[120px]" />
      <div className="w-full max-w-3xl relative z-10">
        <Suspense fallback={<div className="rounded-xl bg-white p-6 text-center text-sm text-stone-500 shadow">Loading correction request...</div>}>
          <ConfirmCorrectionContent />
        </Suspense>
      </div>
    </div>
  );
}
