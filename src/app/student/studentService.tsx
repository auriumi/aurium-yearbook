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

export async function addBook(student_id: number, booking_id: number, period: string) {
    try {
        const res = await fetch("http://localhost:4000/api/student/book/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                student_number: student_id,
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