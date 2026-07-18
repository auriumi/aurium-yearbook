"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Users, Calendar, BookOpen, User, LogOut,
  X, Home, ExternalLink, ScanLine,
  ClipboardList, FileCheck, ShieldCheck, Image as ImageIcon, ClipboardCheck, type LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useSidebar } from "@/hooks/useSidebar";
import { Admin } from "@/types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobile: boolean;
  setIsOpen?: (open: boolean) => void;
  user: Admin | null;
  onLogout: () => void;
}

interface NavItemProps {
  id: string;
  label: string;
  icon: LucideIcon;
  activeTab: string;
  onSelect: (tab: string) => void;
}

function NavItem({ id, label, icon: Icon, activeTab, onSelect }: NavItemProps) {
  return (
    <Button
      variant="ghost"
      className={`w-full justify-start gap-4 h-12 text-sm font-medium transition-all ${activeTab === id ? 'bg-amber-900/30 text-amber-100 border-r-2 border-amber-500' : 'text-stone-400 hover:text-white hover:bg-stone-900'}`}
      onClick={() => onSelect(id)}
    >
      <Icon size={18} className={activeTab === id ? "text-amber-500" : "text-stone-500"} /> {label}
    </Button>
  );
}

export function AdminSidebar({ activeTab, setActiveTab, isMobile, setIsOpen, user, onLogout }: SidebarProps) {
  const { canAccessVerification, canAccessSchedules, canManageImages, canApproveImages, canManageRoles, displayPosition, userInitials } = useSidebar(user);

  const handleSelect = (tab: string) => {
    setActiveTab(tab);
    if (isMobile && setIsOpen) setIsOpen(false);
  };

  return (
    <aside className={`${isMobile ? 'fixed inset-y-0 left-0 z-50 w-72' : 'hidden lg:flex w-72 h-screen fixed left-0 top-0'} bg-stone-950 text-stone-300 flex-col border-r border-stone-800 shadow-2xl transition-transform`}>

      <div className="p-8 border-b border-stone-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8"><Image src="/images/umtc-logo.png" alt="UMTC" fill className="object-contain" /></div>
          <div className="h-8 w-[1px] bg-stone-700"></div>
          <div className="relative w-8 h-8"><Image src="/images/aurium-logo.png" alt="Aurium" fill className="object-contain" /></div>
          <div className="flex flex-col"><span className="text-lg font-serif font-bold text-white">AURIUM</span><span className="text-[8px] text-amber-600 uppercase font-bold">Admin</span></div>
        </div>
        {isMobile && setIsOpen && <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}><X className="h-5 w-5 text-stone-400" /></Button>}
      </div>

      <nav className="flex-1 p-6 space-y-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-2 px-3">Menu</p>

        <Link href="/" target="_blank">
          <Button variant="ghost" className="w-full justify-start gap-4 h-12 text-sm font-medium text-stone-400 hover:text-white hover:bg-stone-900">
            <Home size={18} /> Return to Website <ExternalLink size={12} className="opacity-50 ml-auto" />
          </Button>
        </Link>

        <div className="my-2 border-t border-stone-800/50"></div>

        {/* Verification Queue — ADMINISTRATOR and MODERATOR */}
        {canAccessVerification && (
          <NavItem id="verification" label="Verification Queue" icon={Users} activeTab={activeTab} onSelect={handleSelect} />
        )}

        {/* Graduate Verification — ADMINISTRATOR and MODERATOR */}
        {canAccessVerification && (
          <NavItem id="graduate-review" label="Graduate Verification" icon={FileCheck} activeTab={activeTab} onSelect={handleSelect} />
        )}

        <div className="my-2 px-3 text-[10px] font-bold uppercase tracking-widest text-stone-600 mt-4">Review & Notes</div>

        {/* Masterlist — all roles */}
        <NavItem id="masterlist" label="Graduate Masterlist" icon={BookOpen} activeTab={activeTab} onSelect={handleSelect} />

        {/* Image Management — ADMINISTRATOR and MODERATOR */}
        {canManageImages && (
          <NavItem id="images" label="Image Management" icon={ImageIcon} activeTab={activeTab} onSelect={handleSelect} />
        )}

        {/* Image Approvals — ADMINISTRATOR and approver MODERATORs */}
        {canApproveImages && (
          <NavItem id="images-approvals" label="Approval Thread" icon={ClipboardCheck} activeTab={activeTab} onSelect={handleSelect} />
        )}

        <NavItem id="notes" label="Staff Notes" icon={ClipboardList} activeTab={activeTab} onSelect={handleSelect} />

        <div className="my-2 border-t border-stone-800/50"></div>

        {/* Schedules — ADMINISTRATOR and MODERATOR */}
        {canAccessSchedules && (
          <NavItem id="slots" label="Schedules" icon={Calendar} activeTab={activeTab} onSelect={handleSelect} />
        )}

        <div className="my-2 border-t border-stone-800/50"></div>

        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-2 px-3">Management</p>

        <NavItem id="profile" label="Profile" icon={User} activeTab={activeTab} onSelect={handleSelect} />

        {/* Roles Management — ADMINISTRATOR only */}
        {canManageRoles && (
          <NavItem id="roles" label="Manage Staffs" icon={ShieldCheck} activeTab={activeTab} onSelect={handleSelect} />
        )}

        <div className="my-2 border-t border-stone-800/50"></div>

        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-2 px-3">Tools</p>

        <Link href="/admin/scanner">
          <Button variant="ghost" className="w-full justify-start gap-4 h-12 text-sm font-medium text-stone-400 hover:text-white hover:bg-stone-900">
            <ScanLine size={18} /> Attendance Scanner
          </Button>
        </Link>
      </nav>

      <div className="p-6 border-t border-stone-800/50 bg-stone-950">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="border-2 border-stone-600 bg-stone-800">
            <AvatarImage src={user?.avatar || "nya"} />
            <AvatarFallback className="text-xs font-bold text-stone-300 bg-stone-800">{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user ? `${user.first_name} ${user.last_name}` : "No information"}</p>
            <p className="text-[10px] text-amber-500 truncate uppercase tracking-wider">{displayPosition}</p>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-900/20">
              <LogOut size={18} /> Log Out
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>Confirm Logout</DialogTitle>
              <DialogDescription>End session?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Link href="/" onClick={onLogout}>
                <Button variant="destructive" className="w-full">Yes, Log Out</Button>
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </aside>
  );
}
