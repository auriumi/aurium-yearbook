//Student Service

export async function getStudentProfile() {
    try {
        const res = await fetch(
            "/api/student/profile/fetch",
            { credentials: 'include' }
        );

        if (!res.ok) return {};

        const data = await res.json();
        return data;

    } catch (err) {
        console.error(err);
        return {};
    }
};

export async function fetchSchedules() {
    try {
        const res = await fetch(
            "/api/student/book/fetch",
            { credentials: 'include' }
        );

        if (!res.ok) return [];

        const data = await res.json();
        return data;

    } catch(err) {
        console.error(err);
        return [];
    }
};

export async function addBook(booking_id: number, period: string) {
    try {
        const res = await fetch("/api/student/book/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                booking_id: booking_id,
                period: period
            }),
            credentials: 'include'
        });

        if (!res.ok) {
            return false;
        }
        return true;

    } catch(err) {
        console.error(err);
        return false;
    }
};