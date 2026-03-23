"use client";

import { useState, useEffect } from "react";
import Image from "next/image"; 
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Info } from "lucide-react";

import * as adminService from "@/app/admin/adminService";

interface QueueStudent {
  id: number | string;
  name: string;
  photoUrl: string | null;
  status: 'inside' | 'waiting' | 'upcoming';
}

export default function QueuePage() {
  const [time, setTime] = useState(new Date());
  const [queueData, setQueueData] = useState<QueueStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  
  // State to manage AM/PM session filtering
  const [session, setSession] = useState("AM"); 

  // Synchronize clock every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll live queue data from the backend
  useEffect(() => {
    const fetchLiveQueue = async () => {
      try {
        // Connect to the specific live queue endpoint using the selected session
        const res = await adminService.getLiveQueue(session); 
        
        if (res.success && res.data) {
            setIsOffline(false);
            
            // Map the backend ascending array into the 3-tier UI data structure
            const formattedQueue: QueueStudent[] = res.data.map((b: any, index: number) => {
                let queueStatus: 'inside' | 'waiting' | 'upcoming' = 'upcoming';
                
                // Index-based tiering: Top 5 inside, next 5 waiting, others upcoming
                if (index < 5) queueStatus = 'inside';
                else if (index < 10) queueStatus = 'waiting';

                // Construct full name including middle initial if available
                const student = b.student;
                const midInitial = student?.mid_name ? `${student.mid_name.charAt(0)}.` : "";
                const fullName = student 
                    ? `${student.first_name} ${midInitial} ${student.last_name}`.replace(/\s+/g, ' ') 
                    : `Student ${b.student_number}`;

                return {
                    id: b.student_number,
                    name: fullName,
                    photoUrl: b.photo_url || null,
                    status: queueStatus
                };
            });
            
            setQueueData(formattedQueue);
        } else {
            setQueueData([]);
        }
      } catch (error) {
        setIsOffline(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveQueue();
    // Poll every 5 seconds for live updates
    const queueInterval = setInterval(fetchLiveQueue, 5000);
    return () => clearInterval(queueInterval);
  }, [session]);

  // Derived state for section rendering
  const serving = queueData.slice(0, 5);
  const waiting = queueData.slice(5, 10);
  const upcoming = queueData.slice(10);

  return (
    <div className="min-h-screen bg-stone-950 text-white font-sans flex flex-col overflow-hidden">
      
      {/* Header with System Logos and Status */}
      <header className="bg-amber-900/20 border-b border-amber-900/50 p-5 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 overflow-hidden">
              <Image src="/images/umtc-logo.png" alt="UMTC Logo" fill className="object-contain"/>
            </div>
            <div className="h-6 w-[1px] bg-stone-600"></div>
            <div className="relative w-10 h-10 overflow-hidden">
              <Image src="/images/aurium-logo.png" alt="Aurium Logo" fill className="object-contain"/>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-serif font-bold tracking-wider text-amber-50 leading-none">AURIUM</h1>
            <p className="text-amber-500/80 text-[10px] uppercase tracking-[0.2em] font-bold mt-1">Pictorial Queue</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="w-48">
             <Select value={session} onValueChange={setSession}>
                 <SelectTrigger className="w-full bg-stone-900 border-stone-700 text-amber-400 font-bold h-10">
                     <SelectValue placeholder="Select Session" />
                 </SelectTrigger>
                 <SelectContent className="bg-stone-900 border-stone-700 text-stone-200">
                     <SelectItem value="AM">Morning Session (AM)</SelectItem>
                     <SelectItem value="PM">Afternoon Session (PM)</SelectItem>
                 </SelectContent>
             </Select>
          </div>

          <div className="text-right flex flex-col items-end">
            {isOffline && (
                <Badge variant="destructive" className="mb-1 animate-pulse bg-red-900/80 text-red-200 border border-red-500/50 text-[10px]">
                    ⚠️ Connection Lost - Reconnecting...
                </Badge>
            )}
            <p className="text-3xl font-mono font-bold text-stone-100 leading-none">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-stone-500 text-xs uppercase tracking-widest mt-1">{time.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </header>

      {/* Main Queue Display Area */}
      <main className="flex-1 p-6 flex flex-col gap-5 relative overflow-hidden">
        
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm">
            <div className="flex flex-col items-center text-amber-500">
               <Loader2 className="w-10 h-10 animate-spin mb-4" />
               <p className="tracking-widest uppercase text-sm font-bold">Connecting to Live Queue...</p>
            </div>
          </div>
        )}

        {/* Section 1: Active Portraits */}
        <div className="flex-none">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
            <h2 className="text-lg font-bold text-stone-400 uppercase tracking-widest">Currently Inside Studio</h2>
          </div>
          
          <div className="grid grid-cols-5 gap-4 h-[450px]">
            {serving.length > 0 ? serving.map((student) => (
              <Card key={student.id} className="bg-stone-900 border-amber-600/30 border-t-4 shadow-2xl relative overflow-hidden group rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10"></div>
                <img 
                  src={student.photoUrl ?? ""} 
                  alt={student.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://github.com/shadcn.png"; }}
                />
                <div className="absolute bottom-0 left-0 w-full p-4 z-20 text-center">
                  <h3 className="text-xl font-bold text-white leading-tight mb-2 truncate px-2">{student.name}</h3>
                  <Badge className="bg-green-600 hover:bg-green-600 text-[10px] tracking-wider">IN SESSION</Badge>
                </div>
              </Card>
            )) : (
              <div className="col-span-5 flex flex-col items-center justify-center border-2 border-dashed border-stone-800 rounded-xl bg-stone-900/20">
                 <p className="text-stone-500 uppercase tracking-widest text-sm">Studio is currently empty</p>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Preparation Queue */}
        <div className="flex-none">
          <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Up Next (Please prepare at the door)</h2>
          <div className="grid grid-cols-5 gap-4">
            {waiting.length > 0 ? waiting.map((student, idx) => (
              <div key={student.id} className="flex items-center gap-3 bg-stone-900/60 p-2.5 rounded-xl border border-stone-800 shadow-sm">
                <span className="text-xl font-black text-stone-600 font-mono w-6 text-center">{idx + 6}</span>
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <Avatar className="h-8 w-8 border border-stone-700 shrink-0">
                    <AvatarImage src={student.photoUrl ?? undefined} className="object-cover" />
                    <AvatarFallback className="bg-stone-800 text-stone-400 text-xs">
                      {student.name ? student.name.charAt(0).toUpperCase() : "S"}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-bold text-stone-200 truncate text-xs">{student.name}</p>
                </div>
              </div>
            )) : (
               <div className="col-span-5 flex items-center justify-center border border-stone-800/50 bg-stone-900/20 p-3 rounded-xl">
                 <p className="text-stone-600 text-xs uppercase tracking-widest">No students on standby</p>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Holding Area Queue */}
        {upcoming.length > 0 && (
          <div className="flex-none bg-stone-900/30 rounded-xl p-4 border border-stone-800/50 mt-auto">
            <h2 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-3 flex items-center justify-between">
               <span className="flex items-center gap-2"><Info size={12} className="text-amber-600"/> Later Batches (Please wait in the holding area)</span>
               <span className="text-amber-500/60 bg-amber-500/10 px-2 py-0.5 rounded-full">Total in Queue: {queueData.length}</span>
            </h2>
            
            <div className="grid grid-cols-5 gap-x-4 gap-y-2">
              {upcoming.slice(0, 15).map((student, idx) => (
                <div key={student.id} className="flex items-center gap-2 bg-stone-950/50 px-2.5 py-1.5 rounded-md border border-stone-800/80">
                  <span className="text-stone-500 text-[10px] font-mono font-bold w-5 text-right shrink-0">{idx + 11}.</span>
                  <span className="text-stone-400 text-[11px] font-medium truncate">{student.name}</span>
                </div>
              ))}
            </div>
            
            {upcoming.length > 15 && (
                <div className="text-center text-stone-400 text-xs font-bold uppercase tracking-widest mt-3 pt-3 border-t border-stone-800/50">
                    + {upcoming.length - 15} more waiting in queue
                </div>
            )}
          </div>
        )}

      </main>

      {/* Ticker Footer */}
      <footer className="bg-amber-950/80 py-2.5 px-6 border-t border-amber-900/50 shrink-0">
        <div className="flex items-center gap-2 text-amber-200/80 text-xs overflow-hidden whitespace-nowrap">
          <InfoIcon className="w-4 h-4 shrink-0" />
          <span className="animate-marquee font-medium">
            Please prepare your receipt and student ID before entering. Do not leave the waiting area once your name is on the "Up Next" list. 
            Next batch: Please fix your hair and attire now.
          </span>
        </div>
      </footer>
    </div>
  );
}

function InfoIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
  )
}