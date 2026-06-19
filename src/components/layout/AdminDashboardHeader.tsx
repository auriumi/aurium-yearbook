"use client";

import Image from "next/image";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/admin/NotificationBell";

const TAB_TITLES: Record<string, string> = {
  verification: "Verification Queue",
  "graduate-review": "Graduate Verification",
  notes: "Staff Notes",
  slots: "Schedule Manager",
  masterlist: "Verified Masterlist",
  images: "Image Management",
  "images-approvals": "Image Approvals",
  scanner: "Attendance Scanner",
  profile: "My Profile",
  roles: "Manage Staffs",
};

interface AdminDashboardHeaderProps {
  activeTab: string;
  onOpenMenu: () => void;
  onNavigate: (tab: string, imageId?: number | null) => void;
}

export function AdminDashboardHeader({ activeTab, onOpenMenu, onNavigate }: AdminDashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between mb-8 py-4 border-b border-stone-200/50">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden text-stone-500" onClick={onOpenMenu}>
          <Menu className="h-6 w-6"/>
        </Button>

        <div className="flex items-center gap-3 md:hidden">
          <div className="relative w-8 h-8 overflow-hidden hover:scale-105 transition-transform duration-300">
            <Image src="/images/umtc-logo.png" alt="UMTC" fill className="object-contain" />
          </div>
          <div className="h-8 w-[1px] bg-stone-300"></div>
          <div className="relative w-8 h-8 overflow-hidden hover:scale-105 transition-transform duration-300">
            <Image src="/images/aurium-logo.png" alt="Aurium" fill className="object-contain" />
          </div>
        </div>

        <h1 className="text-2xl font-serif font-bold text-stone-800 hidden md:block">
          {TAB_TITLES[activeTab]}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white border border-stone-200 rounded-full shadow-sm text-xs font-medium text-stone-500">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> System Online
        </div>
        <NotificationBell onNavigate={onNavigate} />
      </div>
    </header>
  );
}
