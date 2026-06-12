const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL || "";

interface ThesisTitlePreview {
  original: string;
  standardized: string;
  changed: boolean;
}

export async function standardizeThesisTitle(title: string): Promise<ThesisTitlePreview> {
  const res = await fetch(`${baseUrl}/api/student/thesis-title/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Unable to standardize thesis title.");
  }

  return res.json();
}
