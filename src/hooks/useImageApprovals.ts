import { useState, useEffect, useCallback } from "react";
import { fetchApprovals } from "@/app/admin/imageService";

export const YEAR_OPTIONS = [2026, 2027];

export function useImageApprovals(enabled = true) {
  const [view, setView] = useState<"PENDING" | "RESOLVED">("PENDING");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [yearFilter, setYearFilter] = useState<string>("ALL"); // "ALL" | "2026" | ...
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<any[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const ITEMS_PER_PAGE = 9;

  const refresh = useCallback(() => setReloadKey(k => k + 1), []);

  // reset to page 1 when the view/filters change
  useEffect(() => { setPage(1); }, [view, typeFilter, yearFilter]);

  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      try {
        const res = await fetchApprovals({
          view,
          page,
          type: typeFilter,
          year: yearFilter === "ALL" ? null : Number(yearFilter),
        });
        if (res.success) {
          setItems(res.data.images ?? []);
          setTotalResults(res.data.total_result ?? 0);
        } else {
          setItems([]);
          setTotalResults(0);
        }
      } catch (e) {
        console.error("Failed to fetch approvals:", e);
        setItems([]);
        setTotalResults(0);
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [enabled, view, typeFilter, yearFilter, page, reloadKey]);

  return {
    view, setView,
    typeFilter, setTypeFilter,
    yearFilter, setYearFilter,
    page, setPage,
    items, totalResults, isLoading, ITEMS_PER_PAGE,
    refresh, YEAR_OPTIONS,
  };
}
