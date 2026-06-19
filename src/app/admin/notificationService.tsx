//Notification Services Module
const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL || "";

export async function fetchNotifications(page = 1, unreadOnly = false) {
    try {
        const query = new URLSearchParams({ page: String(page), unreadOnly: String(unreadOnly) });
        const res = await fetch(`${baseUrl}/api/admin/notifications?${query}`, {
            credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) return { success: false, reason: data.reason };
        return { success: true, data }; // { items, total, unread, per_page }
    } catch (err) {
        console.error("Server error:", err);
        return { success: false };
    }
}

export async function fetchUnreadCount() {
    try {
        const res = await fetch(`${baseUrl}/api/admin/notifications/unread-count`, {
            credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) return { success: false, count: 0 };
        return { success: true, count: data.count as number };
    } catch (err) {
        console.error("Server error:", err);
        return { success: false, count: 0 };
    }
}

export async function markRead(id: number) {
    try {
        const res = await fetch(`${baseUrl}/api/admin/notifications/${id}/read`, {
            method: "PATCH",
            credentials: "include",
        });
        return { success: res.ok };
    } catch (err) {
        console.error("Server error:", err);
        return { success: false };
    }
}

export async function markAllRead() {
    try {
        const res = await fetch(`${baseUrl}/api/admin/notifications/read-all`, {
            method: "PATCH",
            credentials: "include",
        });
        return { success: res.ok };
    } catch (err) {
        console.error("Server error:", err);
        return { success: false };
    }
}
