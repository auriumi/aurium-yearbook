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
        const res = await fetch(`${baseUrl}/api/admin/student?page=${page}`, {
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

export async function searchStudentById(id: number) {
    try {
        const res = await fetch(`${baseUrl}/api/admin/student/${id}`, 
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

export async function handleVerify(id: number) {
    try {
        const res = await fetch(`${baseUrl}/api/admin/student/${id}`, {
            method: "PATCH",
            credentials: 'include'
        });
        return !res.ok ? false : true;

    } catch (err) {
        console.error(err); 
        return false;
    }
};

async function deleteStudent(studentId: number) {
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

export const handleCancel = deleteStudent;
export const handleDelete = deleteStudent;

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
            if (res.status === 409 || res.status === 400) {
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

export async function updateScheduleCapacity(booking_id: number, session: string, new_cap: number) {
    try {
        const res = await fetch(`${baseUrl}/api/admin/book/update?id=${booking_id}`, {
            method: 'PATCH',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session, new_cap }),
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

export async function overrideStudentScheduleByNumber(studentNumber: string | number) {
    try {
        const res = await fetch(
            `${baseUrl}/api/admin/scan/override?id=${encodeURIComponent(String(studentNumber))}`,
            {
                method: "POST",
                credentials: "include"
            }
        );

        let data: any = null;
        try {
            data = await res.json();
        } catch {
            data = null;
        }

        if (!res.ok) {
            return {
                success: false,
                reason: data?.reason || "Server rejected scan."
            };
        }

        return { success: true, data };
    } catch (err) {
        console.error("Server error: ", err);
        return { success: false, reason: "Cannot connect to the server at the moment" };
    }
}

export const fv_getPaginatedStudents = async (page: number) => {
    try {
        const res = await fetch(`${baseUrl}/api/admin/finalize?page=${page}`, {
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

export async function fv_updateStudent(studentId: number, type: string, data: any) {
    try {
        const res = await fetch(`${baseUrl}/api/admin/finalize/${studentId}?type=${type}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        const responseData = await res.json();

        if (!res.ok) {
            return { success: false, reason: responseData.reason || "Something went wrong" };
        }

        return { success: true };
    } catch (err) {
        console.error(err);
        return { success: false, reason: "Cannot connect to the server at the moment" };
    }
}

export async function fv_finalizeStudent(studentId: string | number) {
    try {
        const res = await fetch(`${baseUrl}/api/admin/finalize?id=${encodeURIComponent(String(studentId))}`, {
            method: "PATCH",
            credentials: 'include'
        });

        let responseData: any = null;
        try {
            responseData = await res.json();
        } catch {
            responseData = null;
        }

        if (!res.ok) {
            return {
                success: false,
                reason: responseData?.reason || "Failed to finalize student"
            };
        }

        return { success: true, data: responseData };
    } catch (err) {
        console.error(err);
        return { success: false, reason: "Cannot connect to the server at the moment" };
    }
}

export async function getLiveQueue(period: string) {
    try {
        const res = await fetch(`${baseUrl}/api/admin/queue/list?period=${period}`, {
            credentials: 'include'
        });

        const data = await res.json();
        if (!res.ok) return { success: false, reason: "Failed to fetch queue" };

        return { success: true, data };
    } catch(err) {
        console.error("Server error: ", err);
        return { success: false };
    }
}

export async function fetchStaffList() {
    try {
        const res = await fetch(`${baseUrl}/api/admin/staff/list`, {
            credentials: 'include'
        });
        const data = await res.json();
        if (!res.ok) return { success: false, reason: data.reason };
        return { success: true, data };
    } catch (err) {
        console.error("Server error:", err);
        return { success: false };
    }
}

export async function updateAdminRole(adminId: number, newRole: string) {
    try {
        const res = await fetch(`${baseUrl}/api/admin/staff/${adminId}/role`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole }),
            credentials: 'include'
        });
        const data = await res.json();
        if (!res.ok) return { success: false, reason: data.reason };
        return { success: true };
    } catch (err) {
        console.error("Server error:", err);
        return { success: false };
    }
}
