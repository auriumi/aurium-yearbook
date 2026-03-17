"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShieldCheck, UserCheck, Briefcase } from "lucide-react";

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

  if (!user) {
    return <div>Loading profile...</div>;
  }

  const isAdmin = user?.role.toLowerCase() === 'administrator';

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
            <CardContent className="p-6 space-y-4">
                  <div className="space-y-4">
                      <div className="flex justify-between border-b pb-2 items-center">
                          <span className="text-xs font-bold text-stone-400 uppercase">System Role</span>
                          <span className="font-medium flex items-center gap-2">
                              {isAdmin ? (
                                  <><ShieldCheck size={16} className="text-amber-600" /> <span className="text-amber-700">Administrator</span></>
                              ) : (
                                  <><UserCheck size={16} className="text-blue-600" /> <span className="text-blue-700">{`${user.role}`}</span></>
                              )}
                          </span>
                      </div>

                      <div className="flex justify-between border-b pb-2 items-center">
                          <span className="text-xs font-bold text-stone-400 uppercase">Email</span>
                          <span className="font-medium text-stone-700">{user.email}</span>
                      </div>

                      {/* TODO: disable for now
                      <div className="flex justify-between border-b pb-2 items-center">
                          <span className="text-xs font-bold text-stone-400 uppercase">Job Title / Position</span>
                          <span className="font-medium flex items-center gap-2 text-stone-700">
                              <Briefcase size={14} className="text-stone-400" /> {"Not specified"}
                          </span>
                      </div>
                      */}

                      {/* TODO: disable for now
                      <Button className="w-full mt-4" variant="outline" onClick={handleOpenEdit}>
                          Edit Profile
                      </Button>
                      */}
                  </div>
              </CardContent>
          </Card>
      </div>
  );
}