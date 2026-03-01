// src/types/index.ts

export interface Student {
  id: string; 
  student_number: string; 
  first_name: string;
  mid_name: string;
  last_name: string;
  department: string;
  course: string;
  major: string;
  nickname: string;
  suffix: string;
  thesis_title: string;
  personal_email: string;
  studentAuth: StudentAuth;
  studentDetail: StduentDetail;
  photo_url: string | null;
  quote: string | null;
  created_at: string;
}

export interface StduentDetail {
  guardians_name: string;
  fathers_name: string;
  mothers_name: string;
  birth_date: string;
  barangay: string;
  city: string;
  province: string;
  contact_num: string;
  photo_url: string;
}

export interface StudentAuth {
  status: string;
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
  period: 'AM' | 'PM';
  created_at: string;
  booking_day: BookingDay;
}

export interface BookingDay {
  date: string;
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