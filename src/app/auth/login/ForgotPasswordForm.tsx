import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, User, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import * as loginService from "./loginService";

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [resetInput, setResetInput] = useState("");

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = resetInput.trim();

    if (!identifier) {
        toast.error("Please enter your ID or Email.");
        return;
    }

    setIsLoading(true);

    try {
        const res = await loginService.requestPasswordReset(identifier);

        if (!res.success) {
            toast.error(res.reason);
            return;
        }

        toast.success(res.reason);
        setResetInput("");
        onBack();
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <motion.div
        key="forgot-password-form"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
    >
        <CardHeader className="text-center pb-6 pt-10">
            <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                    <Mail className="h-8 w-8 text-blue-600" />
                </div>
            </div>
            <CardTitle className="text-xl font-serif font-bold text-amber-950">Forgot Password</CardTitle>
            <CardDescription className="text-stone-500">
                Enter your Student ID or registered email. If it matches an account, we'll send a secure reset link.
            </CardDescription>
        </CardHeader>

        <CardContent>
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="resetInput">Student ID or Registered Email</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-stone-400" />
                        <Input 
                            id="resetInput"
                            value={resetInput}
                            onChange={(e) => setResetInput(e.target.value)}
                            placeholder="e.g. 149449 or name@email.com"
                            className="pl-10 bg-stone-50 border-stone-200 text-stone-800 focus:border-amber-500 focus:ring-amber-500/20 h-11" 
                            required
                        />
                    </div>
                </div>

                <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-amber-900 hover:bg-amber-800 text-white font-bold h-11 shadow-lg shadow-amber-900/10 mt-4 transition-all"
                >
                    {isLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                    ) : (
                        "Send Reset Link"
                    )}
                </Button>
            </form>
        </CardContent>
        
        <CardFooter className="justify-center pb-8 border-t border-stone-100 pt-6">
            <button 
                type="button"
                onClick={onBack}
                className="text-sm font-bold text-stone-500 hover:text-amber-700 flex items-center gap-2 transition-colors"
            >
                <ArrowLeft size={14} /> Back to Login
            </button>
        </CardFooter>
    </motion.div>
  );
}
