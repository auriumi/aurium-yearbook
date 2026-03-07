"use client";

import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react"; 

interface StudentHeaderProps {
  user: {
    fname?: string;
    idNumber?: string;
    photoUrl?: string | null; 
  };
  onLogout: () => void; 
}

export function StudentHeader({ user, onLogout }: StudentHeaderProps) {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-amber-100/50 shadow-sm">
      <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex items-center gap-2">
             <div className="relative w-8 h-8 md:w-10 md:h-10 overflow-hidden">
               <Image src="/images/umtc-logo.png" alt="UMTC Logo" fill sizes="40px" className="object-contain"/>
             </div>
             <div className="h-6 w-[1px] bg-stone-300"></div>
             <div className="relative w-8 h-8 md:w-10 md:h-10 overflow-hidden">
                <Image src="/images/aurium-logo.png" alt="Aurium Logo" fill sizes="40px" className="object-contain"/>
             </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base md:text-xl font-serif font-bold text-amber-950 leading-none tracking-tight">AURIUM</span>
            <span className="text-[8px] md:text-[10px] text-amber-700 uppercase tracking-[0.1em] font-bold mt-0.5">Student Portal</span>
          </div>
        </Link>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
             <p className="text-sm font-bold text-stone-700 leading-none">Hi, {user.fname}</p>
             <p className="text-[10px] text-stone-400 uppercase tracking-wider">{user.idNumber}</p>
          </div>
          <Avatar className="h-9 w-9 border border-amber-200">
             {/* Applied object-cover to prevent stretching. Note: This avatar will update on the next page refresh after the CDN cache clears, as discussed in Issue #51 */}
             <AvatarImage src={user.photoUrl ?? undefined} className="object-cover" />
             
             {/* Made the fallback dynamic based on the user's first name instead of hardcoded 'JD' */}
             <AvatarFallback className="bg-amber-100 text-amber-800 text-xs">
                {user.fname ? user.fname.charAt(0).toUpperCase() : "UM"}
             </AvatarFallback>
          </Avatar>
          
          {/* Placed the Logout Button right next to the avatar */}
          <div className="h-6 w-[1px] bg-stone-200 ml-1"></div>
          <button 
            onClick={onLogout} 
            title="Log out"
            className="text-stone-400 hover:text-red-500 transition-colors p-1.5 rounded-md hover:bg-red-50"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}