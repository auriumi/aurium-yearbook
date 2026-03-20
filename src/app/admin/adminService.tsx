//Admin Services Module - Do not modify <3
const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL || "";

export async function getStaffProfile() {
    try {
        const res = await fetch(`${baseUrl}/api/admin/profile`, {
            credentials: 'include'
        });

        const data = await res.json();
        if (!res.ok) return { success: false, reason: data.reason };

        return { success: true, data };
    } catch (err) {
        console.error(err);
        return { success: false };
    }
}

export async function fetchStudents(page: number) {
    try {
        const res = await fetch(`${baseUrl}/api/admin/student/fetch?page=${page}`, {
             credentials: 'include' 
        });

        if (!res.ok) throw new Error("API Error");

        const data = await res.json();
        return { success: true, data };
    } catch (err) {
        console.error(err);
        return { success: false };
    }
};

export async function searchStudentById(student_number: number) {
    try {
        const res = await fetch(
            `${baseUrl}/api/admin/student/search?id=${student_number}`, 
            { credentials: 'include' }
        );
        const data = await res.json();

        if (!res.ok) {
            if (res.status == 404) {
                return { success: false, reason: data.reason }
            }
            return { success: false, reason: "Something went wrong.." }
        };

        return { success: true, data };
    } catch (err) {
        console.error(err);
        return { success: false };
    }
};

export async function handleVerify(studentId: number) {
    try {
        const res = await fetch(`${baseUrl}/api/admin/student/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: studentId }),
            credentials: 'include'
        });
        return !res.ok ? false : true;
    } catch (err) {
        console.error(err); 
        return false;
    }
};

export async function handleCancel(studentId: number) {
    try {
        const res = await fetch(`${baseUrl}/api/admin/student/${studentId}`, {
            method: "DELETE",
            credentials: 'include'
        });
        return !res.ok ? false : true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

export async function addSchedule(date: string, am_cap: number, pm_cap: number) {
    const body = { 
        date: date, 
        am_cap: am_cap, 
        pm_cap: pm_cap 
    };

    try {
        const res = await fetch(`${baseUrl}/api/admin/book/add`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            credentials: 'include'
        });

        if (!res.ok) {
            //duplicate handler (explicitly 409)
            if (res.status == 409) {
                const err_body = await res.json();
                return {
                    success: false,
                    reason: err_body.reason
                };
            }
            
            return { 
                success: false, 
                reason: "Something went wrong in the server" 
            };
        }
        return { success: true };

    } catch(err) {
        console.error("Server error: ", err);
        return { success: false };
    }
}

export async function fetchSchedule() {
    try {
        const res = await fetch(
            `${baseUrl}/api/admin/book/fetch`,
            { credentials: 'include' }
        );

        if (!res.ok) return [];

        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch(err) {
        console.error("Server error: ", err);
        return [];
    }
};

export async function toggleScheduleState(booking_id: number) {
    try {
        const res = await fetch(`${baseUrl}/api/admin/book/toggle?id=${booking_id}`, {
            method: 'PATCH',
            credentials: 'include'
        });

        if (!res.ok) {
            const body = await res.json();
            return { success: false, reason: body.reason }; 
        }

        return { success: true };
    } catch(err) {
        console.error("Server error: ", err);
        return { success: false };
    }
}