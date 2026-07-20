// src/types/index.ts

export interface Admin {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  avatar: string | null;
  can_approve_images?: boolean;
}

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
  studentDetail: StudentDetail;
  photo_url: string | null;
  quote: string | null;
  created_at: string;
  booking: Booking[];
  studentSolicitations: StudentSolicitation[];
}

export interface StudentSolicitation {
  name: string;
  title: string;
  type: "PERSON" | "COMPANY";
  slot: number;
}

export interface StudentDetail {
  guardians_name: string;
  guardians_title: string;
  fathers_name: string;
  fathers_title: string;
  fathers_suffix: string;
  mothers_name: string;
  mothers_title: string;
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
  booking_slot_id?: number | null;
  period: 'AM' | 'PM';
  created_at: string;
  booking_day: BookingDay;
  booking_slot?: BookingSlot | null;
}

export interface BookingDay {
  date: string;
}

export interface BookingSlot {
    id: number;
    booking_day_id: number;
    period: 'AM' | 'PM';
    start_time: string;
    end_time: string;
    capacity: number;
    is_open: boolean;
    booked_count: number;
    available_count: number;
    bookings?: Booking[];
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
    slots?: BookingSlot[];
}
