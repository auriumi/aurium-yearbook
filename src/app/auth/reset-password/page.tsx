"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle, Eye, EyeOff, KeyRound, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as loginService from "@/app/auth/login/loginService";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("This reset link is missing or invalid.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginService.resetPassword(token, newPassword);

      if (!res.success) {
        setError(res.reason);
        toast.error(res.reason);
        return;
      }

      toast.success("Password reset successfully. You can now sign in.");
      router.push("/auth/login");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full border-stone-200 bg-white/85 backdrop-blur-xl shadow-2xl">
      <CardHeader className="text-center pb-6 pt-10">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100">
            <KeyRound className="h-8 w-8 text-amber-700" />
          </div>
        </div>
        <CardTitle className="text-xl font-serif font-bold text-amber-950">Reset Password</CardTitle>
        <CardDescription className="text-stone-500">
          Create a new password for your AURIUM Yearbook Portal account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!token ? (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            This reset link is missing or invalid. Please request a new password reset link.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="pl-10 pr-10 h-11 bg-stone-50 border-stone-200 focus:border-amber-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="pl-10 h-11 bg-stone-50 border-stone-200 focus:border-amber-500"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-amber-900 hover:bg-amber-800 text-white font-bold shadow-lg shadow-amber-900/10"
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                <><CheckCircle className="mr-2 h-4 w-4" /> Save New Password</>
              )}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="justify-center pb-8 border-t border-stone-100 pt-6">
        <Link href="/auth/login" className="text-sm font-bold text-stone-500 hover:text-amber-700 flex items-center gap-2 transition-colors">
          <ArrowLeft size={14} /> Back to Login
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-40 mix-blend-multiply"></div>
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-amber-100/50 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-stone-200/50 rounded-full blur-[120px]" />
      <div className="w-full max-w-md relative z-10">
        <Suspense fallback={<div className="rounded-xl bg-white p-6 text-center text-sm text-stone-500 shadow">Loading reset form...</div>}>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
