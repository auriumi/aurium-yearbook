"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { useRouter } from "next/navigation";

import { motion, AnimatePresence, number } from "framer-motion";
import { Eye, EyeOff, LogIn, User, Lock, ArrowRight, KeyRound, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

//Module
import * as loginService from "./loginService";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // --- NEW STATES FOR PASSWORD UPDATE FLOW ---
  const [isPasswordUpdateRequired, setIsPasswordUpdateRequired] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  //form values
  const [id, setId] = useState("");
  const [pass, setPass] = useState("");

  // Step 1: Initial Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    //this handles the basic login for now, will do the password update request soon..
    const res = await loginService.handleLogin(id, pass);
    if (res.success) {
        router.push('/');
    } else {
        console.log(res.message);
        setIsLoading(false);
    }

    //setIsPasswordUpdateRequired(true); 
  };

  // Step 2: Update Password
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (newPassword.length < 8) {
        setPasswordError("Password must be at least 8 characters.");
        return;
    }

    if (newPassword !== confirmPassword) {
        setPasswordError("Passwords do not match.");
        return;
    }

    setIsLoading(true);

    // Simulate API call to update password
    setTimeout(() => {
        setIsLoading(false);
        alert("Password successfully updated! Redirecting to dashboard...");
        // router.push('/dashboard'); 
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
      
      {/* --- HEADER (Minimal) --- */}
      <nav className="fixed top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-amber-100/50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 overflow-hidden">
                   <Image src="/images/umtc-logo.png" alt="UMTC Logo" fill className="object-contain"/>
                </div>
                <div className="h-6 w-[1px] bg-stone-300"></div>
                <div className="relative w-8 h-8 overflow-hidden">
                   <Image src="/images/aurium-logo.png" alt="Aurium Logo" fill className="object-contain"/>
                </div>
            </div>
            <span className="font-serif font-bold text-amber-950 ml-2 tracking-tight">Portal Access</span>
          </Link>
          <Link href="/">
             <Button variant="ghost" size="sm" className="text-stone-500 hover:text-amber-900">
               Return Home
             </Button>
          </Link>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex items-center justify-center p-4 pt-20 relative overflow-hidden">
        
        {/* Background Decor */}
        <div className="absolute top-[-10%] right-[-5%] w-[300px] h-[300px] bg-amber-200/20 rounded-full blur-[100px] z-0" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-yellow-500/10 rounded-full blur-[120px] z-0" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <Card className="shadow-2xl border-t-4 border-amber-900 bg-white/90 backdrop-blur-sm overflow-hidden">
            <AnimatePresence mode="wait">
                
                {/* === STATE 1: LOGIN FORM === */}
                {!isPasswordUpdateRequired ? (
                    <motion.div
                        key="login-form"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <CardHeader className="space-y-1 text-center pb-8">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100">
                                <UserCircleIcon />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-serif font-bold text-amber-950">Welcome Back</CardTitle>
                        <CardDescription className="text-stone-500">
                            Please enter your credentials to access the yearbook system.
                        </CardDescription>
                        </CardHeader>
                        
                        <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            
                            {/* Student ID / Email */}
                            <div className="space-y-2">
                            <Label htmlFor="email">Student ID or Email</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                                <Input 
                                id="email" 
                                placeholder="Enter your ID or email" 
                                className="pl-10 h-11 bg-stone-50 border-stone-200 focus:border-amber-500 focus:ring-amber-500" 
                                value={ id }
                                onChange={(e) => setId(e.target.value)}
                                required
                                />
                            </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link href="#" className="text-xs text-amber-700 hover:underline">
                                Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                                <Input 
                                id="password" 
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••" 
                                className="pl-10 h-11 bg-stone-50 border-stone-200 focus:border-amber-500 focus:ring-amber-500"
                                value={ pass }
                                onChange={(e) => setPass(e.target.value)}
                                required
                                />
                                <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
                                >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center space-x-2">
                            <Checkbox id="remember" />
                            <Label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                Remember me for 30 days
                            </Label>
                            </div>

                            {/* Submit Button */}
                            <Button 
                            type="submit" 
                            className="w-full h-11 bg-amber-900 hover:bg-amber-800 text-white font-medium shadow-lg shadow-amber-900/20 transition-all"
                            disabled={isLoading}
                            >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                Authenticating...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                Sign In <ArrowRight size={16} />
                                </span>
                            )}
                            </Button>

                        </form>
                        </CardContent>
                        
                        <CardFooter className="flex flex-col space-y-4 border-t border-stone-100 p-6 bg-stone-50/50">
                        <div className="text-center text-sm text-stone-500">
                            Don't have an account yet?{" "}
                            <Link href="/register" className="font-bold text-amber-800 hover:underline">
                            Pre-Register Here
                            </Link>
                        </div>
                        </CardFooter>
                    </motion.div>
                ) : (
                    /* === STATE 2: UPDATE PASSWORD FORM === */
                    <motion.div
                        key="update-password-form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <CardHeader className="space-y-1 text-center pb-6">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center border border-red-100 animate-pulse">
                                    <KeyRound className="h-8 w-8 text-red-500" />
                                </div>
                            </div>
                            <CardTitle className="text-xl font-serif font-bold text-stone-900">Update Your Password</CardTitle>
                            <CardDescription className="text-stone-500">
                                For security reasons, you must update your temporary password before continuing.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleUpdatePassword} className="space-y-4">
                                
                                {passwordError && (
                                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-sm text-red-600">
                                        <AlertCircle size={16} /> {passwordError}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                                        <Input 
                                            id="newPassword" 
                                            type="password" 
                                            placeholder="Enter new password" 
                                            className="pl-10 h-11 bg-stone-50 border-stone-200 focus:border-amber-500 focus:ring-amber-500"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                                        <Input 
                                            id="confirmPassword" 
                                            type="password" 
                                            placeholder="Re-enter new password" 
                                            className="pl-10 h-11 bg-stone-50 border-stone-200 focus:border-amber-500 focus:ring-amber-500"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <Button 
                                    type="submit" 
                                    className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-medium shadow-lg shadow-green-900/20 transition-all mt-2"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            Updating...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <CheckCircle size={16} /> Save & Continue
                                        </span>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="flex justify-center pb-6">
                             <p className="text-xs text-stone-400">Only you will know this password.</p>
                        </CardFooter>
                    </motion.div>
                )}
            </AnimatePresence>
          </Card>
          
          <p className="text-center text-xs text-stone-400 mt-8">
            © 2026 AURIUM Yearbook Committee. Secure Login.
          </p>
        </motion.div>
      </main>
    </div>
  );
}

// Helper component for the icon
function UserCircleIcon() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="32" 
      height="32" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="text-amber-900"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="10" r="3" />
      <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
    </svg>
  );
}