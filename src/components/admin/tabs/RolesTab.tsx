"use client";

import { useState, useEffect, useCallback } from "react";
import { ShieldCheck, RefreshCw, Loader2, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Admin } from "@/types";
import * as adminService from "@/app/admin/adminService";
import toast from "react-hot-toast";

interface StaffMember {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  last_login: string | null;
}

interface RolesTabProps {
  staffUser: Admin | null;
}

const ROLE_OPTIONS = [
  { value: "MODERATOR", label: "Moderator" },
  { value: "MEMBER", label: "Member" },
];

const ROLE_STYLES: Record<string, string> = {
  MODERATOR: "bg-blue-100 text-blue-800 border-blue-200",
  MEMBER: "bg-stone-100 text-stone-600 border-stone-200",
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  MODERATOR: "Can manage verification, graduation, masterlist, and close/open schedules. Can send OTP.",
  MEMBER: "Read-only access to masterlist and staff notes only.",
};

export function RolesTab({ staffUser }: RolesTabProps) {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Pending role change that requires confirmation
  const [pendingChange, setPendingChange] = useState<{
    member: StaffMember;
    newRole: string;
  } | null>(null);

  const [isUpdating, setIsUpdating] = useState(false);

  const loadStaffList = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await adminService.fetchStaffList();
      if (!result.success) {
        toast.error("Failed to load staff list.");
        return;
      }
      setStaffList(result.data as StaffMember[]);
    } catch {
      toast.error("Could not connect to the server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaffList();
  }, [loadStaffList]);

  const formatLastLogin = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Unknown";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const handleRoleSelectChange = (member: StaffMember, newRole: string) => {
    if (newRole === member.role) return;
    setPendingChange({ member, newRole });
  };

  const confirmRoleChange = async () => {
    if (!pendingChange) return;

    setIsUpdating(true);
    try {
      const result = await adminService.updateAdminRole(pendingChange.member.id, pendingChange.newRole);
      if (!result.success) {
        toast.error((result as any).reason || "Failed to update role.");
        return;
      }

      setStaffList(prev =>
        prev.map(m =>
          m.id === pendingChange.member.id ? { ...m, role: pendingChange.newRole } : m
        )
      );

      toast.success(
        `${pendingChange.member.first_name} ${pendingChange.member.last_name}'s role updated to ${pendingChange.newRole}.`
      );
      setPendingChange(null);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-amber-600" /> Staff Role Management
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Assign roles to staff members. Only Moderator and Member roles can be assigned here.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadStaffList}
            disabled={isLoading}
            className="border-stone-200 text-stone-600 hover:bg-stone-50 h-fit py-1.5 shrink-0"
          >
            {isLoading
              ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              : <RefreshCw className="w-4 h-4 mr-1.5" />
            }
            Refresh
          </Button>
        </div>

        {/* Role Legend */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ROLE_OPTIONS.map(opt => (
            <div key={opt.value} className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
              <Badge className={`mt-0.5 shrink-0 border text-xs font-semibold ${ROLE_STYLES[opt.value]}`}>
                {opt.label}
              </Badge>
              <p className="text-xs text-stone-500 leading-relaxed">{ROLE_DESCRIPTIONS[opt.value]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">

        {isLoading && (
          <div className="flex items-center justify-center py-16 text-stone-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span className="text-sm">Loading staff members...</span>
          </div>
        )}

        {!isLoading && staffList.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-stone-400">
            <ShieldCheck className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No staff members found.</p>
            <p className="text-xs mt-1">Only Moderator and Member accounts appear here.</p>
          </div>
        )}

        {!isLoading && staffList.length > 0 && (
          <div className="divide-y divide-stone-100">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-6 py-3 bg-stone-50 border-b border-stone-200">
              <span className="col-span-5 text-[10px] font-bold uppercase tracking-widest text-stone-500">Staff Member</span>
              <span className="col-span-3 text-[10px] font-bold uppercase tracking-widest text-stone-500 hidden sm:block">Last Login</span>
              <span className="col-span-4 text-[10px] font-bold uppercase tracking-widest text-stone-500">Role</span>
            </div>

            {staffList.map(member => (
              <div
                key={member.id}
                className="grid grid-cols-12 items-center px-6 py-4 hover:bg-stone-50/60 transition-colors"
              >
                {/* Name + Email */}
                <div className="col-span-5 min-w-0">
                  <p className="text-sm font-semibold text-stone-800 truncate">
                    {member.last_name}, {member.first_name}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Mail size={11} className="text-stone-400 shrink-0" />
                    <p className="text-xs text-stone-400 truncate">{member.email}</p>
                  </div>
                </div>

                {/* Last Login */}
                <div className="col-span-3 hidden sm:flex items-center gap-1.5 text-xs text-stone-500">
                  <Clock size={12} className="text-stone-400 shrink-0" />
                  {formatLastLogin(member.last_login)}
                </div>

                {/* Role Select */}
                <div className="col-span-4">
                  <Select
                    value={member.role}
                    onValueChange={(newRole) => handleRoleSelectChange(member, newRole)}
                  >
                    <SelectTrigger className="h-9 text-sm border-stone-200 bg-white focus:ring-amber-500/20 focus:border-amber-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={!!pendingChange} onOpenChange={(open) => { if (!open) setPendingChange(null); }}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-stone-900">Confirm Role Change</DialogTitle>
            <DialogDescription className="text-stone-500 text-sm mt-1">
              You are about to change{" "}
              <span className="font-semibold text-stone-800">
                {pendingChange?.member.first_name} {pendingChange?.member.last_name}
              </span>
              {"'s"} role from{" "}
              <Badge className={`inline-flex border text-xs ${ROLE_STYLES[pendingChange?.member.role ?? "MEMBER"]}`}>
                {pendingChange?.member.role}
              </Badge>
              {" "}to{" "}
              <Badge className={`inline-flex border text-xs ${ROLE_STYLES[pendingChange?.newRole ?? "MEMBER"]}`}>
                {pendingChange?.newRole}
              </Badge>
              .
            </DialogDescription>
          </DialogHeader>

          {pendingChange && (
            <div className="mt-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-800 leading-relaxed">
              <strong>New permissions:</strong> {ROLE_DESCRIPTIONS[pendingChange.newRole]}
            </div>
          )}

          <DialogFooter className="mt-4 flex gap-2">
            <Button
              variant="outline"
              className="flex-1 border-stone-200"
              onClick={() => setPendingChange(null)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-amber-700 hover:bg-amber-800 text-white"
              onClick={confirmRoleChange}
              disabled={isUpdating}
            >
              {isUpdating
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>
                : "Confirm Change"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
