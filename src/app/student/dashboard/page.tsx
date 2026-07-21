"use client";
const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL || "";

import { useState, useCallback, useEffect } from "react";
import { Camera, CalendarCheck, CheckCircle, Clock, Loader2, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StudentHeader } from "@/components/layout/StudentHeader";
import { ProfileCard } from "@/components/student/dashboard/ProfileCard";
import { BookingWidget } from "@/components/student/dashboard/BookingWidget";
import { YearbookTeaser } from "@/components/student/dashboard/YearbookTeaser";
import { YearbookPreview } from "@/components/student/dashboard/YearbookPreview";
import { SolicitationWidget, SolicitationSponsorPayload } from "@/components/student/dashboard/SolicitationWidget"; 
import { useRouter } from "next/navigation"; 
import toast from "react-hot-toast";

//types and services
import { Booking, Schedule } from "@/types/index";
import * as studentService from "@/app/student/studentService";
import { Student } from "@/types";
import { useModalState } from "@/hooks/useModalState";

export default function StudentDashboard() {
  const router = useRouter(); 
  const [user, setUser] = useState<Student | null>(null);
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [booking, setBooking] = useState<Booking>();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const previewModal = useModalState();
  const logoutModal = useModalState();

  const fetchStudent = useCallback(async () => {
    try {
      const res = await studentService.getStudentProfile(); 

      const hasBooking = res.booking.length > 0 ? res.booking[0] : null;
      if (hasBooking) setBooking(hasBooking);

      setUser(res);
    } catch(err) {
      console.error(err);
    }
  }, []);

  const fetchSchedules = useCallback(async () => {
    try {
      const res = await studentService.fetchSchedules();
      setSchedule(res);
    } catch(err) {
      console.error(err);
    }
  }, []); 

  useEffect(() => {
    fetchStudent();
    fetchSchedules();
  }, [fetchStudent, fetchSchedules]);

  const handleBooking = async (bookingSlotId: number) => {
    const hasBooking = !!booking;
    if (!user) return;

    if (!user.studentDetail?.photo_url) {
      toast.error("Please upload your profile picture before booking your pictorial schedule.");
      return;
    }

    const res = hasBooking
      ? await studentService.updateBook(user.booking[0].id, bookingSlotId)
      : await studentService.addBook(bookingSlotId);

    if (!res.success) {
      toast.error(res.reason || "Something went wrong submitting the book!");
    } else {
      toast.success("Successfully booked! Please be on time!");
      fetchStudent(); 
      fetchSchedules();
    }
  };
  
  const onLogout = async () => {
    const res = await fetch(`${baseUrl}/api/auth/logout`, {
      credentials: 'include'
    });
    if (res.ok) router.push('/');
  }

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await onLogout();
      toast.success("You have successfully logged out.");
      router.push('/');

    } catch (err) {
      toast.error("Failed to log out properly.");
      console.error(err);
      setIsLoggingOut(false);
    }
  };

  const handleSaveSponsors = async (sponsors: SolicitationSponsorPayload[]) => {
    const result = await studentService.saveSolicitations(sponsors);

    if (!result.success) {
      toast.error(result.reason || "Failed to save sponsors.");
      return;
    }

    toast.success("Solicitations saved successfully.");
    await fetchStudent();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center font-sans">
        <Loader2 className="h-10 w-10 animate-spin text-amber-600 mb-4" />
        <p className="text-stone-500 font-medium animate-pulse">Loading your dashboard...</p>
      </div>
    );
  }

  if (previewModal.isOpen) {
    return <YearbookPreview user={user} onClose={previewModal.close} />;
  }

  const hasProfilePhoto = Boolean(user.studentDetail?.photo_url);
  const hasBooking = Boolean(booking);
  const bookingDisabledReason = "Upload your profile picture before booking your pictorial schedule.";

  return (
    <div className="min-h-screen bg-stone-50 font-sans relative">
      
      <StudentHeader 
        user={{ fname: user.first_name, idNumber: user.student_number, photoUrl: user.studentDetail.photo_url ?? ""}}
        onLogout={logoutModal.open}
      />

      <main className="max-w-5xl mx-auto p-6 space-y-8">
        
        {/* DASHBOARD TITLE */}
        <header className="md:flex justify-between items-end pb-6 border-b border-stone-200">
            <div>
                <h1 className="text-3xl font-serif font-bold text-stone-800">Graduate Dashboard</h1>
                <p className="text-stone-500 mt-2">Welcome to the official University of Mindanao Yearbook Portal.</p>
            </div>
            {user && user.studentAuth?.status === 'FULLY_VERIFIED' ? (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 px-3 py-1 text-sm border-green-200 gap-1">
                    <CheckCircle className="w-3 h-3" /> Verified Graduate
                </Badge>
            ) : (
                <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 gap-1">
                    <Clock className="w-3 h-3" /> Verification Pending
                </Badge>
            )}
        </header>

        <section className={`rounded-2xl border p-4 shadow-sm ${
          hasProfilePhoto
            ? "border-green-100 bg-green-50/60"
            : "border-amber-200 bg-amber-50"
        }`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                hasProfilePhoto ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-800"
              }`}>
                {hasProfilePhoto ? <CheckCircle className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
              </div>
              <div>
                <p className="font-bold text-stone-800">Pictorial readiness</p>
                <p className="mt-1 text-sm text-stone-600">
                  {hasProfilePhoto
                    ? "Your profile photo is on file. You can book or manage your pictorial schedule."
                    : "Upload your formal profile photo first. Booking stays locked until the photo is submitted."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:min-w-80">
              <div className={`rounded-xl border bg-white px-3 py-2 ${
                hasProfilePhoto ? "border-green-100" : "border-amber-200"
              }`}>
                <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
                  {hasProfilePhoto ? <CheckCircle className="h-3.5 w-3.5 text-green-600" /> : <Camera className="h-3.5 w-3.5 text-amber-700" />}
                  Profile Photo
                </div>
                <p className="mt-1 text-[11px] text-stone-500">{hasProfilePhoto ? "Submitted" : "Required"}</p>
              </div>
              <div className={`rounded-xl border bg-white px-3 py-2 ${
                hasBooking ? "border-green-100" : "border-stone-200"
              }`}>
                <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
                  {hasBooking ? <CheckCircle className="h-3.5 w-3.5 text-green-600" /> : <CalendarCheck className="h-3.5 w-3.5 text-stone-500" />}
                  Pictorial Schedule
                </div>
                <p className="mt-1 text-[11px] text-stone-500">{hasBooking ? "Booked" : hasProfilePhoto ? "Ready to book" : "Locked"}</p>
              </div>
            </div>
          </div>

          {!hasProfilePhoto && (
            <a
              href="#profile-photo-card"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-900 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-800"
            >
              <Camera className="h-3.5 w-3.5" />
              Go to Photo Upload
            </a>
          )}
        </section>

        {/*  2-Column Layout Setup */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div id="profile-photo-card" className="scroll-mt-24 flex flex-col gap-6 lg:col-span-1">
            <ProfileCard
              fullName={`${user.first_name} ${user.last_name}`}
              idNumber={user.student_number}
              course={user.course}
              photoUrl={user.studentDetail.photo_url ?? ""}
              requiresPhoto={!hasProfilePhoto}
              onCheckEntry={previewModal.open}
              onPhotoSaved={fetchStudent}
            />
          </div>

          {/* RIGHT COLUMN: Booking Widget and Solicitation Widget (Landscape format) */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <BookingWidget
              bookingList={schedule}
              booking={booking} 
              idNumber={user.student_number}
              canBook={hasProfilePhoto}
              disabledReason={bookingDisabledReason}
              onBook={handleBooking}
            />

            <SolicitationWidget 
              initialSolicitations={user.studentSolicitations}
              onSave={handleSaveSponsors}
            />
          </div>

          {/* BOTTOM FULL WIDTH: Yearbook Teaser */}
          <div className="lg:col-span-3">
             <YearbookTeaser />
          </div>

        </div>
      </main>

      {/* --- LOGOUT CONFIRMATION MODAL --- */}
      {logoutModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut size={28} />
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-2">Ready to leave?</h3>
            <p className="text-stone-500 text-sm mb-6">
              Are you sure you want to log out of your student portal?
            </p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={logoutModal.close}
                disabled={isLoggingOut}
                className="flex-1 py-2.5 rounded-lg border border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout}
                disabled={isLoggingOut}
                className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoggingOut ? <Loader2 size={18} className="animate-spin" /> : "Log Out"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
