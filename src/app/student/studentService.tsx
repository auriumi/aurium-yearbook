//Student Service

export async function fetchSchedules() {
    try {
        const res = await fetch(
            "http://localhost:4000/api/student/book/fetch",
            { credentials: 'include' }
        );

        if (!res.ok) {
            return [];
        }

        const data = await res.json();
        return data;

    } catch(err) {
        console.error(err);
        return [];
    }
};