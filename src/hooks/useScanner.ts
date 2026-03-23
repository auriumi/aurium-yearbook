import { useState, useMemo, useEffect, useCallback } from "react";
import * as adminService from "@/app/admin/adminService"; 
import toast from "react-hot-toast";

// --- SOUND ASSETS ---
const AUDIO_SUCCESS = "https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3?filename=success-1-6297.mp3"; 
const AUDIO_ERROR = "https://www.myinstants.com/media/sounds/wrong-answer-sound-effect.mp3";

// --- TYPES ---
export interface StudentRecord {
  id: string; // The Student ID Number
  name: string;
  photo?: string;
  status: "attended" | "pending" | "missed"; 
  timeIn?: string;
  schedule: {
      date: string;
      session: "AM" | "PM";
  };
}

interface ScheduleBooking {
    id: number;
    student_number: number;
    booking_day_id: number;
    period: "AM" | "PM";
    created_at: string;
    student?: {
        first_name?: string;
        last_name?: string;
        photo_url?: string;
        photoUrl?: string;
        studentAuth?: {
            status?: string;
        };
    };
}

interface ScheduleDay {
    id: number;
    date: string;
    is_open: boolean;
    max_morning_cap: number;
    max_afternoon_cap: number;
    bookings?: ScheduleBooking[];
}

export function useScanner() {
  const [scanInput, setScanInput] = useState("");
  const [scanResult, setScanResult] = useState<"idle" | "success" | "error">("idle");
  const [scannedStudent, setScannedStudent] = useState<StudentRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(true);
  
  // --- REAL DATA STATES ---
  const [sessionOptions, setSessionOptions] = useState<{label: string, date: string, session: "AM"|"PM"}[]>([]);
  const [currentSessionKey, setCurrentSessionKey] = useState<string>(""); 
    const [schedules, setSchedules] = useState<ScheduleDay[]>([]);
  const [localStudentDB, setLocalStudentDB] = useState<StudentRecord[]>([]);
  const [isLoadingDB, setIsLoadingDB] = useState(false);
  
  const [filter, setFilter] = useState<"all" | "attended" | "pending">("all");

  // Extract selected date and session from the key (e.g., "2026-03-15-AM")
  const selectedDate = currentSessionKey ? currentSessionKey.substring(0, 10) : "";
  const selectedSession = currentSessionKey ? currentSessionKey.substring(11) as "AM" | "PM" : "AM";

  const loadSchedules = useCallback(async () => {
      try {
          setIsLoadingDB(true);
          const data = await adminService.fetchSchedule();

          if (!Array.isArray(data)) {
              setSchedules([]);
              setSessionOptions([]);
              return;
          }

          const mappedSchedules = data as ScheduleDay[];
          setSchedules(mappedSchedules);

          const options: {label: string, date: string, session: "AM"|"PM"}[] = [];
          mappedSchedules.forEach((day) => {
              const dayDate = day.date?.substring(0, 10);
              if (!dayDate) return;

              if (day.max_morning_cap > 0) {
                  options.push({ label: `${dayDate} - Morning (AM)`, date: dayDate, session: "AM" });
              }
              if (day.max_afternoon_cap > 0) {
                  options.push({ label: `${dayDate} - Afternoon (PM)`, date: dayDate, session: "PM" });
              }
          });

          setSessionOptions(options);
          if (options.length > 0 && !currentSessionKey) {
              setCurrentSessionKey(`${options[0].date}-${options[0].session}`);
          }
      } catch (error) {
          console.error("Failed to load schedules for scanner", error);
          toast.error("Could not load session options.");
      } finally {
          setIsLoadingDB(false);
      }
  }, [currentSessionKey]);

  // --- INITIALIZATION: FETCH AVAILABLE SCHEDULES ---
  useEffect(() => {
      loadSchedules();
  }, [loadSchedules]);

  // --- BUILD ROSTER FROM FETCHED SCHEDULE BOOKINGS ---
  useEffect(() => {
      if (!selectedDate || !selectedSession) return;

      const targetDay = schedules.find((day) => day.date?.startsWith(selectedDate));
      const bookings = targetDay?.bookings ?? [];
      const sessionBookings = bookings.filter((booking) => booking.period === selectedSession);

      const formattedRoster: StudentRecord[] = sessionBookings.map((booking) => {
          const firstName = booking.student?.first_name ?? "";
          const lastName = booking.student?.last_name ?? "";
          const fullName = `${firstName} ${lastName}`.trim() || "Unknown Student";
          const rawStatus = booking.student?.studentAuth?.status;
          const status: StudentRecord["status"] = (rawStatus === "ATTENDED" || rawStatus === "FULLY_VERIFIED") ? "attended" : "pending";

          return {
              id: String(booking.student_number),
              name: fullName,
              photo: booking.student?.photo_url || booking.student?.photoUrl || "https://github.com/shadcn.png",
              status,
              timeIn: status === "attended" ? "Logged In" : undefined,
              schedule: { date: selectedDate, session: selectedSession }
          };
      });

      setLocalStudentDB(formattedRoster);
  }, [schedules, selectedDate, selectedSession]);

  // --- AUDIO PLAYER HELPER ---
  const playAudio = useCallback((type: "success" | "error") => {
      const audio = new Audio(type === "success" ? AUDIO_SUCCESS : AUDIO_ERROR);
      audio.volume = 0.5;
      audio.play().catch(e => console.log("Audio play failed (requires user interaction first)", e));
  }, []);

  // --- DERIVED LISTS (For Right Sidebar) ---
  const displayedList = useMemo(() => {
      if (filter === "all") return localStudentDB;
      return localStudentDB.filter(s => s.status === filter);
  }, [localStudentDB, filter]);

  // Stats Counters
  const totalStudents = localStudentDB.length;
  const attendedCount = localStudentDB.filter(s => s.status === "attended").length;
  const pendingCount = totalStudents - attendedCount;

  // --- CORE SCAN LOGIC (Live Backend Interaction) ---
  const processScan = async (idToScan: string) => {
        const normalizedId = idToScan?.trim();
        if (!normalizedId || !currentSessionKey) return;

    // UI Reset Helper
    const triggerReset = () => {
        setTimeout(() => {
            setScanResult("idle");
            setScannedStudent(null);
            setErrorMessage("");
        }, 3000);
    };

    const studentRecord = localStudentDB.find(s => s.id === normalizedId);

    // ERROR 1: ID not found in the current roster
    if (!studentRecord) {
        setScanResult("error");
        setErrorMessage("ID not registered for this specific session.");
        setScannedStudent({ id: normalizedId, name: "Unknown ID", status: "pending", schedule: { date: selectedDate, session: selectedSession }});
        playAudio("error"); 
        triggerReset(); 
        return;
    }

    // ERROR 2: Already scanned
    if (studentRecord.status === 'attended') {
        setScanResult("error"); 
        setErrorMessage("Student already scanned in!");
        setScannedStudent(studentRecord);
        playAudio("error"); 
        triggerReset();
        return;
    }

    // --- EXECUTE LIVE API CALL TO LOG ATTENDANCE ---
    try {
        // We pause the camera briefly while processing
        setIsCameraActive(false);
        
        const response = await adminService.overrideStudentScheduleByNumber(normalizedId);

        if (response.success) {
            // SUCCESS
            setScanResult("success");
            setErrorMessage("");
            setScannedStudent(studentRecord);
            playAudio("success"); 
            
            // Update local state instantly so UI reflects attendance
            setLocalStudentDB(prev => prev.map(student => 
                student.id === studentRecord.id 
                    ? { ...student, status: "attended", timeIn: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) } 
                    : student
            ));
        } else {
            // API Error (e.g., Server rejected the scan)
            setScanResult("error");
            setErrorMessage(response.reason || "Server rejected scan.");
            setScannedStudent(studentRecord);
            playAudio("error");
        }
    } catch (error) {
        console.error("Scan processing error:", error);
        setScanResult("error");
        setErrorMessage("Network error connecting to server.");
        setScannedStudent(studentRecord);
        playAudio("error");
    } finally {
        setIsCameraActive(true); // Resume camera
        triggerReset(); 
    }
  };

  // Manual entry fallback
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scanResult === "idle") {
        processScan(scanInput);
    }
    setScanInput("");
  };

  // QR scanner library handler
  const handleQrScan = (detectedCodes: any[]) => {
    if (detectedCodes && detectedCodes.length > 0) {
        const rawValue = detectedCodes[0].rawValue;
        // Ensure idle state so it doesn't multi-fire
        if (rawValue && scanResult === "idle") {
            processScan(rawValue);
        }
    }
  };

  return {
    scanInput, setScanInput,
    scanResult,
    scannedStudent,
    errorMessage,
    isCameraActive, setIsCameraActive,
    currentSessionKey, setCurrentSessionKey,
    selectedSession,
    filter, setFilter,
    displayedList,
    totalStudents,
    attendedCount,
    pendingCount,
    handleManualSubmit,
    handleQrScan,
    SESSION_OPTIONS: sessionOptions, // Now dynamically populated
    isLoadingDB // Expose loading state to UI
  };
}