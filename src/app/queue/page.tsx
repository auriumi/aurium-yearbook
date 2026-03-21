"use client";

import { useState, useEffect } from "react";
import Image from "next/image"; 
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Import our actual backend service
import * as adminService from "@/app/admin/adminService";

// Defined an interface for the Queue Student to ensure type safety
interface QueueStudent {
  id: number | string;
  name: string;
  photoUrl: string | null;
  status: 'inside' | 'waiting';
}

export default function QueuePage() {
  const [time, setTime] = useState(new Date());
  
  // States for real data fetching
  const [queueData, setQueueData] = useState<QueueStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- CLOCK EFFECT ---
  // Updates the clock UI every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- LIVE QUEUE DATA FETCHING EFFECT ---
  useEffect(() => {
    const fetchLiveQueue = async () => {
      try {
        // Fetching the real schedules from the backend
        const res = await adminService.getAllSchedules();
        
        if (res.success && res.data) {
            // Find the schedule that is currently marked as open by the admin
            const activeDay = res.data.find((d: any) => d.is_open);
            
            if (activeDay && activeDay.bookings) {
                // Filter for students who have successfully scanned in (ATTENDED)
                const arrivedStudents = activeDay.bookings.filter((b: any) => b.student?.studentAuth?.status === "ATTENDED");
                
                // Map the backend data to our QueueStudent interface
                const formattedQueue: QueueStudent[] = arrivedStudents.map((b: any, index: number) => ({
                    id: b.student_number,
                    name: `${b.student.first_name} ${b.student.last_name}`,
                    photoUrl: b.student.photoUrl || null,
                    // We assume the first 5 students in the line are inside the studio, and the rest are waiting outside
                    status: index < 5 ? 'inside' : 'waiting' 
                }));
                
                setQueueData(formattedQueue);
            } else {
                // Clear queue if no active day or bookings are found
                setQueueData([]); 
            }
        } else {
          // Temporarily doing nothing on error so it doesn't spam toasts on the queue display screen
          console.error("Waiting for backend API to be connected...");
        }
      } catch (error) {
        console.error("Failed to fetch queue data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch on component mount
    fetchLiveQueue();

    // Set up Polling: Refresh the queue data every 5 seconds automatically
    // This prevents the admin from needing to manually refresh the page to see the next student
    // Reduced to 5 seconds to make it feel more "real-time" during the event
    const queueInterval = setInterval(fetchLiveQueue, 5000);

    return () => clearInterval(queueInterval);
  }, []);

  // Filter the real data based on status
  const serving = queueData.filter(q => q.status === 'inside').slice(0, 5);
  const waiting = queueData.filter(q => q.status === 'waiting').slice(0, 5);

  return (
    <div className="min-h-screen bg-stone-950 text-white font-sans flex flex-col overflow-hidden">
      
      {/* --- HEADER --- */}
      <header className="bg-amber-900/20 border-b border-amber-900/50 p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Logos */}
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 overflow-hidden">
              <Image src="/images/umtc-logo.png" alt="UMTC Logo" fill className="object-contain"/>
            </div>
            <div className="h-8 w-[1px] bg-stone-600"></div>
            <div className="relative w-12 h-12 overflow-hidden">
              <Image src="/images/aurium-logo.png" alt="Aurium Logo" fill className="object-contain"/>
            </div>
          </div>
          
          {/* Title Text */}
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl font-serif font-bold tracking-wider text-amber-50 leading-none">AURIUM</h1>
            <p className="text-amber-500/80 text-xs uppercase tracking-[0.2em] font-bold mt-1">Pictorial Queue</p>
          </div>
        </div>

        {/* Clock (Right Side) */}
        <div className="text-right">
          <p className="text-4xl font-mono font-bold text-stone-100">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-stone-500 text-sm uppercase tracking-widest">{time.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 flex flex-col gap-8 relative">
        
        {/* Loading Overlay just in case the initial fetch takes time */}
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm">
            <div className="flex flex-col items-center text-amber-500">
               <Loader2 className="w-10 h-10 animate-spin mb-4" />
               <p className="tracking-widest uppercase text-sm font-bold">Connecting to Live Queue...</p>
            </div>
          </div>
        )}

        {/* SECTION 1: NOW PHOTOGRAPHING (Big) */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
            <h2 className="text-xl font-bold text-stone-400 uppercase tracking-widest">Currently Inside Studio</h2>
          </div>
          
          <div className="grid grid-cols-5 gap-6 h-[400px]">
            {serving.length > 0 ? serving.map((student) => (
              <Card key={student.id} className="bg-stone-900 border-amber-600/30 border-t-4 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent z-10"></div>
                {/* Updated to use student.photoUrl and fallback to empty string to prevent broken image icons */}
                <img 
                  src={student.photoUrl ?? ""} 
                  alt={student.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                      // Fallback if the image completely fails to load
                      (e.target as HTMLImageElement).src = "https://github.com/shadcn.png";
                  }}
                />
                <div className="absolute bottom-0 left-0 w-full p-6 z-20 text-center">
                  <h3 className="text-2xl font-bold text-white leading-tight mb-1">{student.name}</h3>
                  <Badge className="bg-green-600 hover:bg-green-600 text-[10px]">IN SESSION</Badge>
                </div>
              </Card>
            )) : (
              // Empty state when no one is inside
              <div className="col-span-5 flex items-center justify-center border-2 border-dashed border-stone-800 rounded-xl">
                 <p className="text-stone-500 uppercase tracking-widest">Studio is currently empty</p>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: UP NEXT (Smaller) */}
        <div className="h-48">
          <h2 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-4">Up Next in Queue</h2>
          <div className="grid grid-cols-5 gap-4">
            {waiting.length > 0 ? waiting.map((student, idx) => (
              <div key={student.id} className="flex items-center gap-4 bg-stone-900/50 p-3 rounded-lg border border-stone-800">
                <span className="text-2xl font-bold text-stone-700 font-mono">0{idx + 1}</span>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-stone-600">
                    {/* Applied object-cover and proper photoUrl mapping */}
                    <AvatarImage src={student.photoUrl ?? undefined} className="object-cover" />
                    {/* Dynamic initial fallback based on real student name */}
                    <AvatarFallback className="bg-stone-800 text-stone-400">
                      {student.name ? student.name.charAt(0).toUpperCase() : "S"}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-medium text-stone-300 truncate text-sm">{student.name}</p>
                </div>
              </div>
            )) : (
              // Empty state when no one is waiting
               <div className="col-span-5 flex items-center border border-stone-800/50 bg-stone-900/20 p-4 rounded-lg">
                 <p className="text-stone-600 text-sm uppercase tracking-widest">No students waiting in queue</p>
              </div>
            )}
          </div>
        </div>

      </main>

      {/* FOOTER TICKER */}
      <footer className="bg-amber-950 py-3 px-6">
        <div className="flex items-center gap-2 text-amber-200/80 text-sm overflow-hidden whitespace-nowrap">
          <InfoIcon className="w-4 h-4" />
          <span className="animate-marquee">
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