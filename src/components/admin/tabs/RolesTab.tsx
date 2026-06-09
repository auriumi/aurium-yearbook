"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ShieldCheck, Shield, RefreshCw, Loader2, Mail, Clock, Save, RotateCcw, Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import * as adminService from "@/app/admin/adminService";
import toast from "react-hot-toast";

const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL || "";

interface StaffMember {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  last_login: string | null;
}

const ROLE_ICONS: Record<string, React.ElementType> = {
  MODERATOR: ShieldCheck,
  MEMBER: Shield,
};

const ROLE_COLORS: Record<string, { badge: string; icon: string }> = {
  MODERATOR: { badge: "bg-blue-100 text-blue-800 border-blue-200", icon: "text-blue-600" },
  MEMBER:    { badge: "bg-stone-100 text-stone-600 border-stone-200", icon: "text-stone-400" },
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  MODERATOR: "Can manage verification, graduation, masterlist, and close/open schedules. Can send OTP.",
  MEMBER:    "Read-only access to masterlist and staff notes only.",
};

const ROLE_OPTIONS = [
  { value: "MODERATOR", label: "Moderator" },
  { value: "MEMBER",    label: "Member" },
];

function RoleChip({ role, size = "sm" }: { role: string; size?: "sm" | "xs" }) {
  const Icon = ROLE_ICONS[role] ?? Shield;
  const colors = ROLE_COLORS[role] ?? ROLE_COLORS.MEMBER;
  const label = role.charAt(0) + role.slice(1).toLowerCase();
  const sizeClass = size === "xs" ? "text-[10px] px-1.5 py-0.5 gap-1" : "text-xs px-2 py-0.5 gap-1.5";
  const iconSize = size === "xs" ? 10 : 12;

  return (
    <span className={`inline-flex items-center font-semibold rounded-md border ${colors.badge} ${sizeClass}`}>
      <Icon size={iconSize} className={colors.icon} />
      {label}
    </span>
  );
}

export function RolesTab() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Local role overrides — keys are member IDs, values are the new role string
  const [localRoles, setLocalRoles] = useState<Record<number, string>>({});

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Password verification state
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Rows that differ from the server state
  const pendingChanges = useMemo(() => {
    return staffList.filter(m => localRoles[m.id] !== undefined && localRoles[m.id] !== m.role);
  }, [staffList, localRoles]);

  const hasPendingChanges = pendingChanges.length > 0;

  const loadStaffList = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await adminService.fetchStaffList();
      if (!result.success) {
        toast.error("Failed to load staff list.");
        return;
      }
      setStaffList(result.data as StaffMember[]);
      setLocalRoles({});
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
    return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  };

  const handleRoleSelectChange = (memberId: number, newRole: string) => {
    setLocalRoles(prev => ({ ...prev, [memberId]: newRole }));
  };

  const discardChanges = () => {
    setLocalRoles({});
  };

  const closeConfirmDialog = () => {
    if (isUpdating || isVerifying) return;
    setShowConfirmDialog(false);
    setPassword("");
    setShowPassword(false);
    setPasswordError("");
  };

  // Step 1: verify password. Step 2: apply all pending changes in parallel.
  const confirmAllChanges = async () => {
    if (!password) {
      setPasswordError("Please enter your password.");
      return;
    }

    setIsVerifying(true);
    setPasswordError("");
    try {
      const verifyRes = await fetch(`${baseUrl}/api/admin/verify-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include",
      });

      if (!verifyRes.ok) {
        const body = await verifyRes.json();
        setPasswordError(body.reason ?? "Incorrect password.");
        return;
      }
    } catch {
      setPasswordError("Could not verify. Check your connection.");
      return;
    } finally {
      setIsVerifying(false);
    }

    setIsUpdating(true);
    try {
      const results = await Promise.all(
        pendingChanges.map(m => adminService.updateAdminRole(m.id, localRoles[m.id]))
      );

      const failedCount = results.filter(r => !r.success).length;

      if (failedCount > 0) {
        toast.error(`${failedCount} update(s) failed. Refreshing to show current state.`);
      } else {
        toast.success(`${pendingChanges.length} role(s) updated successfully.`);
      }

      await loadStaffList();
      closeConfirmDialog();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const getDisplayRole = (member: StaffMember) => localRoles[member.id] ?? member.role;
  const isDirty = (member: StaffMember) => localRoles[member.id] !== undefined && localRoles[member.id] !== member.role;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-amber-600" /> Staff Management
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Manage your staff members by adjusting their roles
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
              <div className="mt-0.5 shrink-0">
                <RoleChip role={opt.value} />
              </div>
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

            {staffList.map(member => {
              const dirty = isDirty(member);
              const displayRole = getDisplayRole(member);

              return (
                <div
                  key={member.id}
                  className={`grid grid-cols-12 items-center px-6 py-4 transition-colors ${dirty ? "bg-amber-50/50" : "hover:bg-stone-50/60"}`}
                >
                  {/* Name + Email */}
                  <div className="col-span-5 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-stone-800 truncate">
                        {member.last_name}, {member.first_name}
                      </p>
                      {dirty && (
                        <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 border border-amber-200 rounded px-1 py-0.5">
                          Changed
                        </span>
                      )}
                    </div>
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
                      value={displayRole}
                      onValueChange={(newRole) => handleRoleSelectChange(member.id, newRole)}
                    >
                      <SelectTrigger className={`h-9 text-sm bg-white focus:ring-amber-500/20 focus:border-amber-500 transition-colors ${dirty ? "border-amber-400" : "border-stone-200"}`}>
                        <SelectValue>
                          <RoleChip role={displayRole} />
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map(opt => {
                          const Icon = ROLE_ICONS[opt.value];
                          const colors = ROLE_COLORS[opt.value];
                          return (
                            <SelectItem key={opt.value} value={opt.value}>
                              <div className="flex items-center gap-2">
                                <Icon size={14} className={colors.icon} />
                                {opt.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Save / Discard Bar — appears when there are unsaved changes */}
      {hasPendingChanges && (
        <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 bg-white px-5 py-3.5 rounded-2xl shadow-lg border border-amber-200 animate-in slide-in-from-bottom-2 duration-200">
          <p className="text-sm font-medium text-stone-700">
            <span className="text-amber-700 font-bold">{pendingChanges.length}</span>{" "}
            unsaved change{pendingChanges.length > 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={discardChanges}
              className="text-stone-500 hover:text-stone-800 hover:bg-stone-100 h-8"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Discard
            </Button>
            <Button
              size="sm"
              onClick={() => setShowConfirmDialog(true)}
              className="bg-amber-700 hover:bg-amber-800 text-white h-8 px-4 shadow-sm"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog with password gate */}
      <Dialog open={showConfirmDialog} onOpenChange={(open) => { if (!open) closeConfirmDialog(); }}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-stone-900">Save Role Changes?</DialogTitle>
            <DialogDescription className="text-stone-500 text-sm mt-1">
              The following {pendingChanges.length} role update{pendingChanges.length > 1 ? "s" : ""} will be applied:
            </DialogDescription>
          </DialogHeader>

          {/* Changes summary */}
          <div className="mt-1 divide-y divide-stone-100 rounded-xl border border-stone-200 overflow-hidden">
            {pendingChanges.map(m => (
              <div key={m.id} className="flex items-center justify-between px-4 py-2.5 bg-white">
                <p className="text-sm font-medium text-stone-800 truncate">
                  {m.last_name}, {m.first_name}
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <RoleChip role={m.role} size="xs" />
                  <span className="text-stone-400 text-xs">→</span>
                  <RoleChip role={localRoles[m.id]} size="xs" />
                </div>
              </div>
            ))}
          </div>

          {/* Password field */}
          <div className="mt-4 space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
              <Lock size={10} /> Confirm your password to proceed
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") confirmAllChanges(); }}
                className={`pr-10 bg-stone-50 focus:ring-amber-500/20 focus:border-amber-500 ${passwordError ? "border-red-400" : "border-stone-200"}`}
                disabled={isUpdating || isVerifying}
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {passwordError && (
              <p className="text-xs text-red-500 font-medium">{passwordError}</p>
            )}
          </div>

          <DialogFooter className="mt-4 flex gap-2">
            <Button
              variant="outline"
              className="flex-1 border-stone-200"
              onClick={closeConfirmDialog}
              disabled={isUpdating || isVerifying}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-amber-700 hover:bg-amber-800 text-white"
              onClick={confirmAllChanges}
              disabled={isUpdating || isVerifying || !password}
            >
              {isVerifying
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Verifying...</>
                : isUpdating
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>
                : `Apply ${pendingChanges.length} Change${pendingChanges.length > 1 ? "s" : ""}`
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
