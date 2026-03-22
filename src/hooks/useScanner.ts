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

export function useScanner() {
  const [scanInput, setScanInput] = useState("");
  const [scanResult, setScanResult] = useState<"idle" | "success" | "error">("idle");
  const [scannedStudent, setScannedStudent] = useState<StudentRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(true);
  
  // --- REAL DATA STATES ---
  const [sessionOptions, setSessionOptions] = useState<{label: string, date: string, session: "AM"|"PM"}[]>([]);
  const [currentSessionKey, setCurrentSessionKey] = useState<string>(""); 
  const [localStudentDB, setLocalStudentDB] = useState<StudentRecord[]>([]);
  const [isLoadingDB, setIsLoadingDB] = useState(false);
  
  const [filter, setFilter] = useState<"all" | "attended" | "pending">("all");

  // Extract selected date and session from the key (e.g., "2026-03-15-AM")
  const selectedDate = currentSessionKey ? currentSessionKey.substring(0, 10) : "";
  const selectedSession = currentSessionKey ? currentSessionKey.substring(11) as "AM" | "PM" : "AM";

  // --- INITIALIZATION: FETCH AVAILABLE SCHEDULES ---
  useEffect(() => {
      const loadSchedules = async () => {
          try {
              // TODO: Ensure adminService.getAllSchedules() returns the array of schedules
              const res = await adminService.getAllSchedules(); 
              if (res.success && res.data) {
                  // Transform API data into dropdown options
                  const options: {label: string, date: string, session: "AM"|"PM"}[] = [];
                  res.data.forEach((day: any) => {
                      // Only add options if the session has a capacity > 0
                      if (day.max_morning_cap > 0) {    
                          options.push({ label: `${day.date.substring(0, 10)} - Morning (AM)`, date: day.date.substring(0, 10), session: "AM" });
                      }
                      if (day.max_afternoon_cap > 0) {
                          options.push({ label: `${day.date.substring(0, 10)} - Afternoon (PM)`, date: day.date.substring(0, 10), session: "PM" });
                      }
                  });
                  setSessionOptions(options);
                  
                  // Auto-select the first available session if none is selected
                  if (options.length > 0 && !currentSessionKey) {
                      setCurrentSessionKey(`${options[0].date}-${options[0].session}`);
                  }
              }
          } catch (error) {
              console.error("Failed to load schedules for scanner", error);
              toast.error("Could not load session options.");
          }
      };
      loadSchedules();
  }, []);

  // --- FETCH ROSTER WHEN SESSION CHANGES ---
  useEffect(() => {
      if (!selectedDate || !selectedSession) return;

      const fetchRoster = async () => {
          setIsLoadingDB(true);
          try {
              // TODO: You might need an endpoint to get specific bookings, or filter from getAllSchedules
              const res = await adminService.getAllSchedules();
              if (res.success && res.data) {
                  const targetDay = res.data.find((d: any) => d.date.startsWith(selectedDate));
                  
                  if (targetDay && targetDay.bookings) {
                      // Filter bookings by AM/PM
                      const sessionBookings = targetDay.bookings.filter((b: any) => b.period === selectedSession);
                      
                      // Map backend data to our StudentRecord format
                      const formattedRoster: StudentRecord[] = sessionBookings.map((b: any) => ({
                          id: b.student_number,
                          name: `${b.student.first_name} ${b.student.last_name}`,
                          photo: b.student.photoUrl || "https://github.com/shadcn.png",
                          // Normalize API status to our UI status
                          status: b.student.studentAuth.status === "ATTENDED" ? "attended" : "pending",
                          timeIn: b.student.studentAuth.status === "ATTENDED" ? "Logged In" : undefined,
                          schedule: { date: selectedDate, session: selectedSession }
                      }));
                      
                      setLocalStudentDB(formattedRoster);
                  } else {
                      setLocalStudentDB([]); // No bookings found
                  }
              }
          } catch (error) {
              console.error("Failed to load roster", error);
              toast.error("Failed to load student roster for this session.");
          } finally {
              setIsLoadingDB(false);
          }
      };

      fetchRoster();
  }, [currentSessionKey, selectedDate, selectedSession]);

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
    if (!idToScan || !currentSessionKey) return;

    // UI Reset Helper
    const triggerReset = () => {
        setTimeout(() => {
            setScanResult("idle");
            setScannedStudent(null);
            setErrorMessage("");
        }, 3000);
    };

    const studentRecord = localStudentDB.find(s => s.id === idToScan);

    // ERROR 1: ID not found in the current roster
    if (!studentRecord) {
        setScanResult("error");
        setErrorMessage("ID not registered for this specific session.");
        setScannedStudent({ id: idToScan, name: "Unknown ID", status: "pending", schedule: { date: selectedDate, session: selectedSession }});
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
        
        // TODO: Ensure this endpoint exists in adminService to mark attendance
        const response = await adminService.overrideStudentSchedule(selectedDate, selectedSession, idToScan);
        
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