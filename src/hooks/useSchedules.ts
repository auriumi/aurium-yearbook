import { useCallback, useEffect, useState } from "react";
import * as adminService from "@/app/admin/adminService"
import { Schedule } from "@/types";

export function useSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const fetchSchedules = useCallback(async () => {
    try {
      const schedules = await adminService.fetchSchedule();
      setSchedules(schedules);

    } catch (err) {
      console.error("Error loading schedules");
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  return {
    schedules,
    fetchSchedules
  };
}