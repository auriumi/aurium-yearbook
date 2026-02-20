//Admin Services Module - Do not modify <3

export async function fetchStudents() {
    try {
        const res = await fetch(
            'http://localhost:4000/api/admin/student/fetch', 
            { credentials: 'include' }
        );

        if (!res.ok) throw new Error("API Error");

        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error(err);
        return [];
    }
};

export async function handleVerify(studentId: number) {
    try {
        await fetch("http://localhost:4000/api/admin/student/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: studentId }),
            credentials: 'include'
        });

        alert(`Student Verified!`);
        return true;
    } catch (err) {
        console.error(err); 
        alert("Verification failed.");
        return false;
    }
};

export async function addSchedule(date: string, am_cap: number, pm_cap: number) {
    const body = { 
        date: date, 
        am_cap: am_cap, 
        pm_cap: pm_cap 
    };

    try {
        const res = await fetch("http://localhost:4000/api/admin/book/add", {
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