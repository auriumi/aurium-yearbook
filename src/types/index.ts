// src/types/index.ts

export type StudentStatus = 'pending' | 'verified' | 'approved' | 'locked';

export interface Student {
  id: string; 
  student_id: string; 
  first_name: string;
  last_name: string;
  program: string;
  status: StudentStatus;
  photo_url: string | null;
  quote: string | null;
  created_at: string;
}

export interface QueueItem {
  id: string;
  student_id: string;
  status: 'waiting' | 'serving' | 'completed';
  updated_at: string;
}

export interface Booking {
  id: number;
  student_number: number;
  booking_day_id: number;
  period: 'morning' | 'afternoon';
  created_at: string;
  student: Student
}

export interface Schedule {
    id: number;
    date: string;
    is_open: boolean;
    curr_morning: number;
    curr_afternoon: number;
    max_morning_cap: number;
    max_afternoon_cap: number;
    bookings: Booking[];
}