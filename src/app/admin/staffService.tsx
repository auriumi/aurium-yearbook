//Staff Management Services Module
const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL || "";

//toggle a moderator's image-approver flag (administrators only)
export async function setImageApprover(adminId: number, value: boolean) {
    try {
        const res = await fetch(`${baseUrl}/api/admin/staff/${adminId}/image-approver`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value }),
            credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) return { success: false, reason: data.reason };
        return { success: true };
    } catch (err) {
        console.error("Server error:", err);
        return { success: false };
    }
}
