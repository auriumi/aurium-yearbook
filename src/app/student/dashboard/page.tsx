"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StudentHeader } from "@/components/student/dashboard/StudentHeader";
import { ProfileCard } from "@/components/student/dashboard/ProfileCard";
import { BookingWidget } from "@/components/student/dashboard/BookingWidget";
import { YearbookTeaser } from "@/components/student/dashboard/YearbookTeaser";

import { Schedule } from "@/types/index";
import * as studentService from "@/app/student/studentService";
import { Student } from "@/types";

export default function StudentDashboard() {
  const [user, setUser] = useState<Student | null>(null);
  const [schedule, setSchedule] = useState<Schedule[]>([]);

  const fetchStudent = useCallback(async () => {
    try {
      const res = await studentService.getStudentProfile();
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

  const handleBooking = async (student_number: string, booking_id: number, period: string) => {
    const res = await studentService.addBook(student_number, booking_id, period)

    //TODO: optimize..
    if (!res) {
      alert("Something went wrong submitting the book!");
    } else {
      alert("Successfully booked! Please be on time!");
    }
  };

  //TODO: use loading screen?
  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <StudentHeader user={{ fname: user.first_name, idNumber: user.student_id, photoUrl: undefined}} />

      <main className="max-w-5xl mx-auto p-6 space-y-8">
        
        {/* DASHBOARD TITLE */}
        <header className="md:flex justify-between items-end pb-6 border-b border-stone-200">
            <div>
                <h1 className="text-3xl font-serif font-bold text-stone-800">Student Dashboard</h1>
                <p className="text-stone-500 mt-2">Welcome to the official University of Mindanao Yearbook Portal.</p>
            </div>
            {user && user.studentAuth.status === 'FULLY_VERIFIED' ? (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 px-3 py-1 text-sm border-green-200 gap-1">
                    <CheckCircle className="w-3 h-3" /> Verified Graduate
                </Badge>
            ) : (
                <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 gap-1">
                    <Clock className="w-3 h-3" /> Verification Pending
                </Badge>
            )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* 1. Profile Card Component */}
          <ProfileCard
            fullName={`${user.first_name} ${user.last_name}`}
            idNumber={user.student_id}
            course={user.course}
            photoUrl={user.photo_url}
          />

          {/* 2. Booking Widget Component */}
          <BookingWidget
            bookingList={schedule}
            booking={false} //TODO: Pass booking data if already booked
            idNumber={user.student_id}
            onBook={handleBooking}
          />

          {/* 3. Yearbook Teaser Component */}
          {/* TODO: refactor compoment to a prop */}
          <YearbookTeaser />
        </div>
      </main>
    </div>
  );
}