import { useCallback, useState } from "react";
import { standardizeThesisTitle } from "@/lib/thesisTitle";

type StandardizationStatus = "idle" | "loading" | "changed" | "unchanged" | "error";

export function useThesisTitleStandardization() {
  const [status, setStatus] = useState<StandardizationStatus>("idle");

  const standardize = useCallback(async (title: string) => {
    if (!title.trim()) {
      setStatus("idle");
      return title;
    }

    setStatus("loading");
    try {
      const result = await standardizeThesisTitle(title);
      setStatus(result.changed ? "changed" : "unchanged");
      return result.standardized;
    } catch (error) {
      console.error("Failed to preview standardized thesis title:", error);
      setStatus("error");
      return title;
    }
  }, []);

  const reset = useCallback(() => setStatus("idle"), []);

  return { standardize, status, reset };
}
