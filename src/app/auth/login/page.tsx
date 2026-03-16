"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, ArrowRight, Loader2, ArrowLeft, KeyRound, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Added toast for alerts
import toast from "react-hot-toast";

// @Koi: Gi-import nako ang new UI Component nato para limpyo ang main file
import { ForgotPasswordForm } from "./ForgotPasswordForm"; 

// IMPORT KOII'S SERVICE (Make sure this file is in the same folder)
import * as loginService from "./loginService";

export default function StudentLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- UI STATES ---
  const [showForgotPassword, setShowForgotPassword] = useState(false); // Bag-ong state para mo-toggle sa Forgot Password UI

  // --- KOII'S STATE LOGIC ---
  const [isPasswordUpdateRequired, setIsPasswordUpdateRequired] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Form values
  const [id, setId] = useState("");
  const [pass, setPass] = useState("");

  // --- KOII'S LOGIN FUNCTION ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await loginService.handleLogin(id, pass);
      
      if (res.success) {
          toast.success("Successfully logged in!");
          if (res.is_new) {
              setIsPasswordUpdateRequired(true);
              setIsLoading(false);
          } else {
              router.push('/student/dashboard');
          }
      } else {
          toast.error(res.reason || "Invalid ID Number or Password. Please try again.");
          setIsLoading(false);
          return;
      }

    } catch (error) {
      toast.error("Something went wrong. Please check your connection.");
      setIsLoading(false);
    }
  };

  // --- UPDATE PASSWORD UPON LOG IN ---
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (newPassword.length < 5) {
        setPasswordError("Password must be at least 8 characters.");
        return;
    }

    if (newPassword !== confirmPassword) {
        setPasswordError("Passwords do not match.");
        return;
    }

    setIsLoading(true);

    try {
        const res = await loginService.handleUpdatePass(newPassword); 

        if (res.success) {
          toast.success(res.reason);
          router.push('/student/dashboard');
        } else {
            toast.error(res.reason);
        }

    } catch (error) {
      toast.error("Something went wrong. Please check your connection.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Decor (New Design) */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-40 mix-blend-multiply"></div>
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-amber-100/50 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-stone-200/50 rounded-full blur-[120px]" />

      {/* Back to Home Button */}
      <Link href="/" className="absolute top-6 left-6 z-20">
        <Button variant="ghost" className="text-stone-500 hover:text-amber-900 gap-2">
            <ArrowLeft size={18} /> Back to Home
        </Button>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="w-full border-stone-200 bg-white/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <AnimatePresence mode="wait">
                
                {/* TERNARY LOGIC: Show Forgot Password -> Show Update Password -> Show Login */}
                {showForgotPassword ? (
                    <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
                ) : isPasswordUpdateRequired ? (
                    
                    /* === VIEW 2: UPDATE PASSWORD FORM === */
                    <motion.div
                        key="update-password-form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <CardHeader className="text-center pb-6 pt-10">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100 animate-pulse">
                                    <KeyRound className="h-8 w-8 text-amber-600" />
                                </div>
                            </div>
                            <CardTitle className="text-xl font-serif font-bold text-amber-950">Update Password</CardTitle>
                            <CardDescription className="text-stone-500">
                                Security required: Please update your temporary password.
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
                                            className="pl-10 h-11 bg-stone-50 border-stone-200 focus:border-amber-500"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                                        <Input 
                                            id="confirmPassword" 
                                            type="password" 
                                            placeholder="Re-enter new password" 
                                            className="pl-10 h-11 bg-stone-50 border-stone-200 focus:border-amber-500"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <Button 
                                    type="submit" 
                                    className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-medium shadow-lg shadow-green-900/20 transition-all mt-4"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" /> Updating...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <CheckCircle size={16} /> Save & Continue
                                        </span>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="flex justify-center pb-8">
                             <p className="text-xs text-stone-400">Your new password will be active immediately.</p>
                        </CardFooter>
                    </motion.div>
                ) : (

                    /* === VIEW 1: LOGIN FORM === */
                    <motion.div
                        key="login-form"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <CardHeader className="text-center pb-8 pt-10">
                            <div className="flex justify-center items-center gap-3 mb-6">
                                <div className="relative w-10 h-10">
                                    <Image src="/images/umtc-logo.png" alt="UMTC" fill className="object-contain" />
                                </div>
                                <div className="h-8 w-[1px] bg-stone-300"></div>
                                <div className="relative w-10 h-10">
                                    <Image src="/images/aurium-logo.png" alt="Aurium" fill className="object-contain" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-serif font-bold text-amber-950">AURIUM Portal</CardTitle>
                            <CardDescription className="text-stone-500">Sign in to access your yearbook profile</CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="id">Student ID</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-5 w-5 text-stone-400" />
                                        <Input 
                                            id="id"
                                            value={id}
                                            onChange={(e) => setId(e.target.value)}
                                            placeholder="ID Number (e.g. 149449)" 
                                            className="pl-10 bg-stone-50 border-stone-200 text-stone-800 focus:border-amber-500 focus:ring-amber-500/20 h-11" 
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Password</Label>
                                        <button 
                                            type="button" 
                                            onClick={() => setShowForgotPassword(true)} 
                                            className="text-xs font-bold text-amber-700 hover:underline"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-5 w-5 text-stone-400" />
                                        <Input 
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={pass}
                                            onChange={(e) => setPass(e.target.value)}
                                            placeholder="••••••••" 
                                            className="pl-10 bg-stone-50 border-stone-200 text-stone-800 focus:border-amber-500 focus:ring-amber-500/20 h-11" 
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

                                <div className="flex items-center space-x-2">
                                    <Checkbox id="remember" />
                                    <Label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-stone-600">
                                        Remember me
                                    </Label>
                                </div>

                                <Button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="w-full bg-amber-900 hover:bg-amber-800 text-white font-bold h-11 shadow-lg shadow-amber-900/10 mt-4 transition-all"
                                >
                                    {isLoading ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
                                    ) : (
                                        <><ArrowRight className="mr-2 h-4 w-4" /> Sign In</>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                        
                        <CardFooter className="justify-center pb-8 border-t border-stone-100 pt-6">
                            <p className="text-sm text-stone-500">
                                Don't have an account?{' '}
                                <Link href="/auth/register" className="font-bold text-amber-700 hover:underline">
                                    Register here
                                </Link>
                            </p>
                        </CardFooter>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}