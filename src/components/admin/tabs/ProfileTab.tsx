"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, UserCheck, Lock, AlertCircle, CheckCircle2, Briefcase, Mail, KeyRound } from "lucide-react";

import { Admin } from "@/types";

interface ProfileTabProps {
    user: Admin | null;
    setUser: (user: Admin | null) => void;
    onLogout: () => void;
}

export function ProfileTab({ user, onLogout }: ProfileTabProps) {

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!user) {
      return <div className="p-10 text-stone-400">Loading profile...</div>;
  }

  const isAdmin = user?.role.toLowerCase() === 'administrator';
  const displayName = (user as any).name || `${user.first_name} ${user.last_name}`;
  const displayPosition = (user as any).position || "Not specified";
  const currentPhoto = user?.avatar || "";

  const handlePasswordSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setPasswordError("");
      setPasswordSuccess("");

      const passwordPolicy = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;
      if (!passwordPolicy.test(newPassword)) {
          setPasswordError("Password does not meet the requirements below.");
          return;
      }
      if (newPassword !== confirmPassword) {
          setPasswordError("Passwords do not match.");
          return;
      }

      setIsProcessing(true);
      try {
          const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL || "";
          const res = await fetch(`${baseUrl}/api/admin/change-password`, {
              method: "PATCH",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
          });
          const data = await res.json();
          if (!res.ok) {
              setPasswordError(data?.reason || "Failed to update password.");
              return;
          }
          setPasswordSuccess("Password updated successfully!");
          setTimeout(() => { handleCloseModal(); onLogout(); }, 2000);
      } catch {
          setPasswordError("An error occurred. Please try again.");
      } finally {
          setIsProcessing(false);
      }
  };

  const handleCloseModal = () => {
      if (!isProcessing) {
          setIsPasswordModalOpen(false);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setPasswordError("");
          setPasswordSuccess("");
      }
  };

  return (
    <div className="w-full animate-in fade-in duration-500">

        <div className="w-full flex flex-col md:flex-row gap-6 items-stretch min-h-[calc(100vh-10rem)]">

                {/* Left Section: Avatar */}
                <div className="w-full md:w-80 shrink-0 flex flex-col items-center justify-start pt-10 px-8 pb-8 bg-white rounded-2xl border border-stone-200 shadow-sm">
                    <div className="relative mb-6 transform hover:scale-105 transition-transform duration-500 ease-out group">
                        <div className="w-56 h-56 xl:w-72 xl:h-72 rounded-full border border-stone-300 flex items-center justify-center p-2.5">
                            <div className="w-full h-full rounded-full border-4 border-stone-200 p-2 relative">
                                <Avatar className="w-full h-full border-4 border-white shadow-md relative z-10">
                                    <AvatarImage src={currentPhoto} className="object-cover" />
                                    <AvatarFallback className="bg-stone-200 text-stone-400 text-3xl">{isAdmin ? 'AD' : 'ST'}</AvatarFallback>
                                </Avatar>
                                <span className="absolute bottom-3 right-3 h-5 w-5 rounded-full bg-emerald-500 border-4 border-white z-30 animate-pulse"></span>
                            </div>
                        </div>

                        {/* TODO: not functional as of yet.
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute bottom-0 right-0 h-10 w-10 rounded-full border border-stone-300 bg-white hover:bg-stone-100 z-20"
                            onClick={triggerFileInput}
                        >
                            <Camera size={20} className="text-stone-600" />
                        </Button>
                        <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />
                        */}
                    </div>

                    <Badge className="bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-100 px-3 py-1 uppercase text-xs tracking-wider">
                        ADMIN ACCOUNT
                    </Badge>

                    <div className="w-full mt-8 pt-6 border-t border-stone-100">
                        <Button className="w-full flex items-center justify-center gap-2 bg-red-500 text-white hover:bg-red-600" onClick={() => setIsPasswordModalOpen(true)}>
                            <Lock size={15} /> Change Password
                        </Button>
                    </div>
                </div>

                {/* Right Section: Details */}
                <div className="flex-1 w-full min-w-0 flex flex-col space-y-6 bg-white rounded-2xl border border-stone-200 shadow-sm p-10">

                    <div className="border-b border-stone-200 pb-5 w-full">
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">User Name</div>
                        <h2 className="text-3xl xl:text-4xl font-black text-stone-900 uppercase tracking-tight flex items-center gap-3 w-full min-w-0">
                            <span className="truncate min-w-0">{displayName}</span> <KeyRound size={20} className="text-amber-500 shrink-0" />
                        </h2>
                        <p className="text-stone-400 text-sm mt-1">{isAdmin ? 'System Administrator' : user.role}</p>
                    </div>

                    <div className="flex flex-col gap-y-6 w-full">
                        <div className="space-y-1">
                            <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">System Role</div>
                            <div className="flex items-center gap-3">
                                {isAdmin ? (
                                    <><ShieldCheck size={18} className="text-amber-500 shrink-0" /> <span className="font-semibold text-stone-800">Administrator</span></>
                                ) : (
                                    <><UserCheck size={18} className="text-blue-500 shrink-0" /> <span className="font-semibold text-stone-800">{`${user.role}`}</span></>
                                )}
                            </div>
                            <p className="text-xs text-stone-400 font-mono">Full system access permissions</p>
                        </div>

                        <div className="space-y-1 w-full min-w-0">
                            <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Email</div>
                            <div className="flex items-center gap-3 min-w-0">
                                <Mail size={18} className="text-stone-400 shrink-0" />
                                <span className="font-medium text-stone-800 truncate min-w-0">{user.email}</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                             <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Position</div>
                             <div className="flex items-center gap-3">
                                <Briefcase size={18} className="text-stone-400 shrink-0" />
                                <span className="font-medium text-stone-800 truncate">{displayPosition}</span>
                             </div>
                        </div>
                    </div>


                </div>
        </div>

        {/* CHANGE PASSWORD MODAL */}
        <Dialog open={isPasswordModalOpen} onOpenChange={handleCloseModal}>
            <DialogContent className="sm:max-w-md bg-white border-stone-200">
                <DialogHeader className="flex flex-col items-center text-center pb-2">
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4 border border-amber-200">
                        <Lock size={24} />
                    </div>
                    <DialogTitle className="text-xl font-bold text-stone-900">Change Password</DialogTitle>
                    <DialogDescription className="text-stone-500 mt-2">
                        Enter your current password to confirm your identity, then set a new one.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-2">
                    {passwordError && (
                        <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={16} className="shrink-0" />
                            <span>{passwordError}</span>
                        </div>
                    )}
                    {passwordSuccess && (
                        <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                            <CheckCircle2 size={16} className="shrink-0" />
                            <span>{passwordSuccess}</span>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="currentPassword" className="text-stone-600">Current Password</Label>
                        <Input
                            id="currentPassword"
                            type="password"
                            placeholder="Enter current password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            disabled={isProcessing}
                            className="bg-white border-stone-300 text-stone-900 focus:border-amber-500"
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="newPassword" className="text-stone-600">New Password</Label>
                        <Input
                            id="newPassword"
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={isProcessing}
                            className="bg-white border-stone-300 text-stone-900 focus:border-amber-500"
                            required
                        />
                        <div className="pt-1 space-y-1">
                            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Password Must Include</p>
                            {[
                                { label: "At least 8 characters long", met: newPassword.length >= 8 },
                                { label: "At least one uppercase letter", met: /[A-Z]/.test(newPassword) },
                                { label: "At least one number", met: /[0-9]/.test(newPassword) },
                                { label: "At least one symbol", met: /[^A-Za-z0-9]/.test(newPassword) },
                            ].map(({ label, met }) => (
                                <div key={label} className="flex items-center gap-2 text-xs">
                                    <span className={met ? "text-emerald-500" : "text-stone-300"}>
                                        {met ? "✓" : "✗"}
                                    </span>
                                    <span className={met ? "text-emerald-600" : "text-stone-400"}>{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="confirmPassword" className="text-stone-600">Confirm New Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isProcessing}
                            className="bg-white border-stone-300 text-stone-900 focus:border-amber-500"
                            required
                        />
                    </div>

                    <DialogFooter className="pt-4 flex sm:justify-between w-full gap-2">
                        <Button type="button" variant="ghost" onClick={handleCloseModal} disabled={isProcessing} className="w-full sm:w-auto text-stone-500 hover:text-stone-900">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isProcessing} className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-bold">
                            {isProcessing ? "Updating..." : "Update Password"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </div>
  );
}
