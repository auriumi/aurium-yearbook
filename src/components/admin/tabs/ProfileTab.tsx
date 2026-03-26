"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ShieldCheck, UserCheck, Lock, AlertCircle, CheckCircle2 } from "lucide-react";

import { useProfile } from "@/hooks/useProfile";
import { Admin } from "@/types";

interface ProfileTabProps {
    user: Admin | null;
    setUser: (user: Admin | null) => void;
}

export function ProfileTab({ user, setUser }: ProfileTabProps) {
  
  const {
    //isEditing,
    //handleSaveProfile,
    //handleOpenEdit,
    //handleCancelEdit
  } = useProfile(user, setUser);

  // Local state for the change password modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  if (!user) {
    return <div>Loading profile...</div>;
  }

  const isAdmin = user?.role.toLowerCase() === 'administrator';

  const handlePasswordSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setPasswordError("");
      setPasswordSuccess("");

      // Form validation
      if (newPassword.length < 8) {
          setPasswordError("Password must be at least 8 characters long.");
          return;
      }
      if (newPassword !== confirmPassword) {
          setPasswordError("Passwords do not match.");
          return;
      }

      setIsUpdatingPassword(true);

      try {
          // TODO: Replace this simulated delay with your actual API endpoint call
          // await adminService.changePassword(user.id, newPassword);
          await new Promise(resolve => setTimeout(resolve, 1500)); 

          setPasswordSuccess("Password updated successfully.");
          
          // Clear form and close modal after a brief delay so the user sees the success message
          setTimeout(() => {
              setIsPasswordModalOpen(false);
              setNewPassword("");
              setConfirmPassword("");
              setPasswordSuccess("");
          }, 2000);
      } catch (error) {
          setPasswordError("An error occurred while updating the password.");
      } finally {
          setIsUpdatingPassword(false);
      }
  };

  const handleCloseModal = () => {
      if (!isUpdatingPassword) {
          setIsPasswordModalOpen(false);
          setNewPassword("");
          setConfirmPassword("");
          setPasswordError("");
          setPasswordSuccess("");
      }
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
        <Card className={`shadow-xl border-t-4 ${isAdmin ? 'border-amber-600' : 'border-blue-600'}`}>
            <CardHeader className="text-center border-b bg-stone-50">
                <div className="w-24 h-24 mx-auto mb-4 relative">
                    <Avatar className="w-full h-full border-4 border-white shadow-lg">
                        <AvatarImage src={user?.avatar || ""}/>
                        <AvatarFallback>{isAdmin ? 'AD' : 'ST'}</AvatarFallback>
                    </Avatar>
                </div>
                <CardTitle>{user ? `${user.first_name} ${user.last_name}` : "No information"}</CardTitle>
                <CardDescription className="capitalize font-medium text-amber-700">
                    {user.role || "Staff Member"}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                  <div className="space-y-5">
                      <div className="flex justify-between border-b pb-3 items-center">
                          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">System Role</span>
                          <span className="font-medium flex items-center gap-2">
                              {isAdmin ? (
                                  <><ShieldCheck size={16} className="text-amber-600" /> <span className="text-amber-700">Administrator</span></>
                              ) : (
                                  <><UserCheck size={16} className="text-blue-600" /> <span className="text-blue-700">{`${user.role}`}</span></>
                              )}
                          </span>
                      </div>

                      <div className="flex justify-between border-b pb-3 items-center">
                          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Email</span>
                          <span className="font-medium text-stone-700">{user.email}</span>
                      </div>

                      <div className="pt-4">
                          <Button 
                              variant="outline" 
                              className="w-full flex items-center justify-center gap-2 border-stone-300 text-stone-600 hover:bg-stone-50"
                              onClick={() => setIsPasswordModalOpen(true)}
                          >
                              <Lock size={16} /> Change Password
                          </Button>
                      </div>
                  </div>
              </CardContent>
          </Card>

          {/* Change Password Modal */}
          <Dialog open={isPasswordModalOpen} onOpenChange={handleCloseModal}>
              <DialogContent className="sm:max-w-md">
                  <DialogHeader className="flex flex-col items-center text-center sm:text-center pb-2">
                      <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
                          <Lock size={24} />
                      </div>
                      <DialogTitle className="text-xl font-bold">Change Password</DialogTitle>
                      <DialogDescription className="text-stone-500">
                          Ensure your account is using a long, random password to stay secure.
                      </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-2">
                      {passwordError && (
                          <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm flex items-center gap-2">
                              <AlertCircle size={16} className="shrink-0" />
                              <span>{passwordError}</span>
                          </div>
                      )}
                      
                      {passwordSuccess && (
                          <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm flex items-center gap-2">
                              <CheckCircle2 size={16} className="shrink-0" />
                              <span>{passwordSuccess}</span>
                          </div>
                      )}

                      <div className="space-y-1.5">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input 
                              id="newPassword" 
                              type="password" 
                              placeholder="Enter new password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              disabled={isUpdatingPassword || !!passwordSuccess}
                              required
                          />
                      </div>
                      <div className="space-y-1.5">
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <Input 
                              id="confirmPassword" 
                              type="password" 
                              placeholder="Confirm new password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              disabled={isUpdatingPassword || !!passwordSuccess}
                              required
                          />
                      </div>

                      <DialogFooter className="pt-4 flex sm:justify-between w-full gap-2">
                          <Button 
                              type="button" 
                              variant="ghost" 
                              onClick={handleCloseModal}
                              disabled={isUpdatingPassword}
                              className="w-full sm:w-auto"
                          >
                              Cancel
                          </Button>
                          <Button 
                              type="submit" 
                              className="w-full sm:w-auto bg-stone-900 hover:bg-stone-800 text-white"
                              disabled={isUpdatingPassword || !!passwordSuccess}
                          >
                              {isUpdatingPassword ? "Updating..." : "Update Password"}
                          </Button>
                      </DialogFooter>
                  </form>
              </DialogContent>
          </Dialog>
      </div>
  );
}