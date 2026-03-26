"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, UserCheck, Lock, AlertCircle, CheckCircle2, Briefcase, Mail, KeyRound, Camera, Upload, UserCog } from "lucide-react";

import { Admin } from "@/types";

interface ProfileTabProps {
    user: Admin | null;
    setUser: (user: Admin | null) => void;
}

export function ProfileTab({ user, setUser }: ProfileTabProps) {
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempAvatarUrl, setTempAvatarUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const triggerFileInput = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const fileReader = new FileReader();
          fileReader.onload = () => {
              setTempAvatarUrl(fileReader.result as string);
              setSelectedFile(file);
          };
          fileReader.readAsDataURL(file);
      }
  };

  const handleSaveProfile = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!user) return;

      const fd = new FormData(e.currentTarget);
      
      setUser({
          ...user, 
          name: fd.get('name') as string, 
          email: fd.get('email') as string,
          position: fd.get('position') as string,
          avatar: tempAvatarUrl || user.avatar
      } as Admin);
      
      setIsEditing(false);
      setSelectedFile(null);
  };

  const handleOpenEdit = () => setIsEditing(true);
  const handleCancelEdit = () => {
      setIsEditing(false);
      setTempAvatarUrl(null); 
      setSelectedFile(null);
  };

  // ========================================================
  // NEW LOGIC: 3-Step Change Password Wizard
  // Step 1: Request Code | Step 2: Verify Code | Step 3: Reset
  // ========================================================
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordStep, setPasswordStep] = useState<1 | 2 | 3>(1);
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!user) {
      return <div className="p-10 text-stone-500">Loading profile...</div>;
  }

  const isAdmin = user?.role.toLowerCase() === 'administrator';
  const displayName = (user as any).name || `${user.first_name} ${user.last_name}`;
  const displayPosition = (user as any).position || "Not specified";
  const currentPhoto = tempAvatarUrl || user?.avatar || "";

  // STEP 1 HANDLER: Trigger the email code
  const handleSendCode = async () => {
      setIsProcessing(true);
      setPasswordError("");
      try {
          // Simulate API call to send email
          await new Promise(resolve => setTimeout(resolve, 1500)); 
          setPasswordStep(2);
          setPasswordSuccess("Verification code sent to your email!");
          setTimeout(() => setPasswordSuccess(""), 4000);
      } catch (error) {
          setPasswordError("Failed to send verification code. Try again.");
      } finally {
          setIsProcessing(false);
      }
  };

  // STEP 2 HANDLER: Verify the inputted code
  const handleVerifyCode = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsProcessing(true);
      setPasswordError("");
      try {
          // Simulate API call to verify code
          await new Promise(resolve => setTimeout(resolve, 1500)); 
          
          if (verificationCode.length < 6) {
             throw new Error("Invalid code length");
          }

          setPasswordStep(3);
          setPasswordSuccess("Identity verified successfully.");
          setTimeout(() => setPasswordSuccess(""), 3000);
      } catch (error) {
          setPasswordError("Invalid verification code. Please check your email.");
      } finally {
          setIsProcessing(false);
      }
  };

  // STEP 3 HANDLER: Finalize the new password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setPasswordError("");
      setPasswordSuccess("");

      if (newPassword.length < 8) {
          setPasswordError("Password must be at least 8 characters long.");
          return;
      }
      
      if (newPassword !== confirmPassword) {
          setPasswordError("Passwords do not match.");
          return;
      }

      setIsProcessing(true);

      try {
          // Simulate final API call
          await new Promise(resolve => setTimeout(resolve, 1500)); 
          setPasswordSuccess("Password updated successfully!");
          
          setTimeout(() => {
              handleCloseModal(); // Reset everything and close
          }, 2000);
      } catch (error) {
          setPasswordError("An error occurred while updating the password.");
      } finally {
          setIsProcessing(false);
      }
  };

  const handleCloseModal = () => {
      if (!isProcessing) {
          setIsPasswordModalOpen(false);
          setPasswordStep(1);
          setVerificationCode("");
          setNewPassword("");
          setConfirmPassword("");
          setPasswordError("");
          setPasswordSuccess("");
      }
  };

  return (
    // FIX: Changed classes to rounded-3xl and h-fit, removed full screen height constraints
    <div className="w-full h-fit bg-[#111] p-10 rounded-3xl shadow-xl animate-in fade-in duration-500 my-4 mx-auto max-w-screen-2xl">
        
        <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-bold uppercase tracking-wide text-white">Admin Profile</h1>
        </div>

        <Card className={`max-w-7xl mx-auto shadow-2xl border-t-4 bg-stone-900 border-stone-800 overflow-hidden ${isAdmin ? 'border-amber-500' : 'border-blue-600'}`}>
            <CardContent className="p-10 flex flex-col md:flex-row gap-12 w-full">
                
                {/* Left Section: Avatar */}
                <div className="w-full md:w-[350px] shrink-0 flex flex-col items-center justify-center p-6 bg-stone-950/50 rounded-2xl border border-stone-800">
                    <div className="relative mb-5 transform hover:scale-105 transition-transform duration-500 ease-out group">
                        <div className="w-48 h-48 xl:w-56 xl:h-56 rounded-full border border-stone-700 flex items-center justify-center p-2.5">
                            <div className="w-full h-full rounded-full border-4 border-stone-600 p-2 relative">
                                <Avatar className="w-full h-full border-4 border-white shadow-xl relative z-10">
                                    <AvatarImage src={currentPhoto} className="object-cover" />
                                    <AvatarFallback className="bg-stone-800 text-stone-500 text-3xl">{isAdmin ? 'AD' : 'ST'}</AvatarFallback>
                                </Avatar>
                                <span className="absolute bottom-3 right-3 h-5 w-5 rounded-full bg-emerald-500 border-4 border-stone-900 z-30 animate-pulse"></span>
                            </div>
                        </div>

                        {/* TODO: not functional as of yet.
                        <Button 
                            variant="secondary" 
                            size="icon" 
                            className="absolute bottom-0 right-0 h-10 w-10 rounded-full border border-stone-700 bg-stone-800 hover:bg-stone-700 z-20"
                            onClick={triggerFileInput}
                        >
                            <Camera size={20} className="text-stone-300" />
                        </Button>
                        <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />
                        */}
                    </div>
                    
                    <Badge className="bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-950 px-3 py-1 uppercase text-xs tracking-wider">
                        ADMIN ACCOUNT
                    </Badge>
                </div>

                {/* Right Section: Details */}
                <div className="flex-1 w-full min-w-0 space-y-8 bg-stone-950/50 rounded-2xl border border-stone-800 p-10">
                    
                    <div className="border-b border-stone-800 pb-6 mb-8 w-full">
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">User Name</div>
                        <h2 className="text-3xl xl:text-4xl font-black text-white uppercase tracking-tight flex items-center gap-3 w-full min-w-0">
                            <span className="truncate min-w-0">{displayName}</span> <KeyRound size={20} className="text-amber-400 shrink-0" />
                        </h2>
                        <p className="text-stone-500 text-sm mt-1">{isAdmin ? 'System Administrator' : user.role}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 w-full">
                        <div className="space-y-1">
                            <div className="text-xs font-bold text-stone-400 uppercase tracking-wider tracking-widest">System Role</div>
                            <div className="flex items-center gap-3">
                                {isAdmin ? (
                                    <><ShieldCheck size={18} className="text-amber-400 shrink-0" /> <span className="font-semibold text-white">Administrator</span></>
                                ) : (
                                    <><UserCheck size={18} className="text-blue-500 shrink-0" /> <span className="font-semibold text-white">{`${user.role}`}</span></>
                                )}
                            </div>
                            <p className="text-xs text-stone-500 font-mono">Full system access permissions</p>
                        </div>

                        <div className="space-y-1 w-full min-w-0">
                            <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Email</div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full min-w-0">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <Mail size={18} className="text-stone-400 shrink-0" /> 
                                    <span className="font-medium text-white truncate min-w-0">{user.email}</span>
                                </div>
                                <Badge variant="outline" className="border-emerald-700/50 text-emerald-400 text-xs px-2 h-5 w-fit shrink-0 whitespace-nowrap ml-auto sm:ml-0">Verified Email</Badge>
                            </div>
                        </div>
                        
                        <div className="space-y-1 col-span-1 md:col-span-2">
                             <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Position</div>
                             <div className="flex items-center gap-3">
                                <Briefcase size={18} className="text-stone-400 shrink-0" /> 
                                <span className="font-medium text-white truncate">{displayPosition}</span>
                             </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-stone-800 mt-10 w-full pb-2">
                        {isEditing ? (
                            <form onSubmit={handleSaveProfile} className="space-y-6 animate-in fade-in duration-300 w-full">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-xs font-bold text-stone-400 uppercase tracking-wider">Full Name</Label>
                                    <Input id="name" name="name" defaultValue={displayName} className="bg-stone-950 border-stone-700 text-white focus:border-amber-500" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-xs font-bold text-stone-400 uppercase tracking-wider">Email Address</Label>
                                    <Input id="email" name="email" type="email" defaultValue={user.email} className="bg-stone-950 border-stone-700 text-white focus:border-amber-500" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="position" className="text-xs font-bold text-stone-400 uppercase tracking-wider">Job Title / Position</Label>
                                    <Input id="position" name="position" defaultValue={(user as any).position || ""} placeholder="e.g. Lead Developer" className="bg-stone-950 border-stone-700 text-white focus:border-amber-500" />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 pt-6 w-full">
                                    <Button type="button" variant="ghost" className="w-full sm:flex-1 text-stone-400 hover:text-white" onClick={handleCancelEdit}>
                                        Cancel Changes
                                    </Button>
                                    <Button type="submit" className="w-full sm:flex-1 bg-stone-950 border border-stone-700 hover:bg-stone-800 text-white flex items-center justify-center gap-2">
                                        <Upload size={16} /> Save Profile Changes
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="animate-in fade-in duration-300 flex flex-col sm:flex-row gap-4 w-full">
                                {/* not functional as of yet, including change password
                                <Button className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold" onClick={handleOpenEdit}>
                                    <UserCog size={18} /> Edit Profile Details
                                </Button>
                                */}
                                <Button variant="outline" className="w-full sm:flex-1 flex items-center justify-center gap-2 border-stone-700 bg-stone-950 text-stone-400 hover:bg-stone-800 hover:text-white" onClick={() => setIsPasswordModalOpen(true)} disabled={true} >
                                    <Lock size={16} /> Change System Password (In Progress)
                                </Button>
                            </div>
                        )}
                    </div>

                </div>
            </CardContent>
        </Card>

        {/* ========================================== */}
        {/* WIZARD MODAL: 3-STEP CHANGE PASSWORD */}
        {/* ========================================== */}
        <Dialog open={isPasswordModalOpen} onOpenChange={handleCloseModal}>
            <DialogContent className="sm:max-w-md bg-stone-900 border-stone-800 transition-all duration-300">
                <DialogHeader className="flex flex-col items-center text-center sm:text-center pb-2">
                    
                    {/* Dynamic Icon based on step */}
                    <div className="w-12 h-12 bg-amber-950 text-amber-400 rounded-full flex items-center justify-center mb-4 border border-amber-800">
                        {passwordStep === 1 && <Mail size={24} />}
                        {passwordStep === 2 && <ShieldCheck size={24} />}
                        {passwordStep === 3 && <Lock size={24} />}
                    </div>
                    
                    {/* Dynamic Title based on step */}
                    <DialogTitle className="text-xl font-bold text-white">
                        {passwordStep === 1 && "Verification Required"}
                        {passwordStep === 2 && "Enter Security Code"}
                        {passwordStep === 3 && "Create New Password"}
                    </DialogTitle>
                    
                    {/* Dynamic Description based on step */}
                    <DialogDescription className="text-stone-500 mt-2">
                        {passwordStep === 1 && "To protect your account, we need to send a one-time verification code to your email."}
                        {passwordStep === 2 && "Please check your inbox and enter the 6-digit code we sent you."}
                        {passwordStep === 3 && "Your identity is verified. You may now set a new, secure password."}
                    </DialogDescription>
                </DialogHeader>

                <div className="pt-2">
                    {/* Universal Feedback Messages */}
                    {passwordError && (
                        <div className="p-3 mb-4 bg-red-950 text-red-300 border border-red-800 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={16} className="shrink-0" />
                            <span>{passwordError}</span>
                        </div>
                    )}
                    {passwordSuccess && (
                        <div className="p-3 mb-4 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                            <CheckCircle2 size={16} className="shrink-0" />
                            <span>{passwordSuccess}</span>
                        </div>
                    )}

                    {/* WIZARD STEP 1: Send Code */}
                    {passwordStep === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div className="p-4 bg-stone-950 border border-stone-800 rounded-lg text-center">
                                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Registered Email</p>
                                <p className="font-bold text-white text-lg">{user.email}</p>
                            </div>
                            <DialogFooter className="pt-6 flex sm:justify-between w-full gap-2">
                                <Button type="button" variant="ghost" onClick={handleCloseModal} disabled={isProcessing} className="w-full sm:w-auto text-stone-400 hover:text-white">
                                    Cancel
                                </Button>
                                <Button type="button" onClick={handleSendCode} disabled={isProcessing} className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold">
                                    {isProcessing ? "Sending..." : "Send Code"}
                                </Button>
                            </DialogFooter>
                        </div>
                    )}

                    {/* WIZARD STEP 2: Verify Code */}
                    {passwordStep === 2 && (
                        <form onSubmit={handleVerifyCode} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div className="space-y-2 text-center">
                                <Label htmlFor="verificationCode" className="text-stone-400 sr-only">Verification Code</Label>
                                <Input 
                                    id="verificationCode" 
                                    type="text" 
                                    placeholder="000000"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))} // only allow numbers
                                    disabled={isProcessing}
                                    maxLength={6}
                                    className="bg-stone-950 border-stone-700 text-white focus:border-amber-500 text-center tracking-[0.5em] font-mono text-2xl h-14"
                                    required
                                />
                            </div>
                            <DialogFooter className="pt-6 flex sm:justify-between w-full gap-2">
                                <Button type="button" variant="ghost" onClick={handleCloseModal} disabled={isProcessing} className="w-full sm:w-auto text-stone-400 hover:text-white">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isProcessing || verificationCode.length < 6} className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold">
                                    {isProcessing ? "Verifying..." : "Verify Identity"}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}

                    {/* WIZARD STEP 3: Create New Password */}
                    {passwordStep === 3 && (
                        <form onSubmit={handlePasswordSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="newPassword" className="text-stone-400">New Password</Label>
                                <Input 
                                    id="newPassword" 
                                    type="password" 
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    disabled={isProcessing}
                                    className="bg-stone-950 border-stone-700 text-white focus:border-amber-500"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="confirmPassword" className="text-stone-400">Confirm Password</Label>
                                <Input 
                                    id="confirmPassword" 
                                    type="password" 
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isProcessing}
                                    className="bg-stone-950 border-stone-700 text-white focus:border-amber-500"
                                    required
                                />
                            </div>

                            <DialogFooter className="pt-6 flex sm:justify-between w-full gap-2">
                                <Button type="button" variant="ghost" onClick={handleCloseModal} disabled={isProcessing} className="w-full sm:w-auto text-stone-400 hover:text-white">
                                    Cancel
                                </Button>
                                <Button type="submit" className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold" disabled={isProcessing}>
                                    {isProcessing ? "Updating..." : "Update Password"}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}