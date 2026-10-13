import { useCallback, useEffect, useRef, useState } from "react";
import * as adminService from "@/app/admin/adminService"
import { Schedule } from "@/types";

export function useSchedules(enabled = true) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const requestVersion = useRef(0);
  const cancelPending = useCallback(() => { requestVersion.current++; }, []);

  const fetchSchedules = useCallback(async () => {
    if (!enabled) return;
    const version = ++requestVersion.current;
    try {
      const schedules = await adminService.fetchSchedule();
      if (version === requestVersion.current) setSchedules(schedules);

    } catch {
      console.error("Error loading schedules");
    }
  }, [enabled]);

  useEffect(() => {
    fetchSchedules();
    return cancelPending;
  }, [fetchSchedules, cancelPending]);

  return {
    schedules,
    fetchSchedules
  };
}
