//Image Management Services Module
const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL || "";

export type YearbookImageType = "GRADUATION" | "THEME";

interface ImageStudentParams {
    page: number;
    dept: string;
    course: string;
    major: string;
    status: string;
    year: number;
    missing: string;
}

//fetch students (paginated) with their graduation/theme image status for a year
export async function fetchImageStudents(params: ImageStudentParams) {
    try {
        const query = new URLSearchParams({
            page: String(params.page),
            dept: params.dept,
            course: params.course,
            major: params.major,
            status: params.status,
            year: String(params.year),
            missing: params.missing,
        });

        const res = await fetch(`${baseUrl}/api/admin/images/students?${query}`, {
            credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) return { success: false, reason: data.reason };

        return { success: true, data };
    } catch (err) {
        console.error("Server error:", err);
        return { success: false };
    }
}

//request a presigned PUT url for a graduation/theme image
export async function getImageUploadUrl(
    student_number: number,
    type: YearbookImageType,
    year: number,
    file: File
) {
    try {
        const ext = file.name.split(".").pop() || "jpg";
        const mime = file.type || "image/jpeg";

        const query = new URLSearchParams({
            student_number: String(student_number),
            type,
            year: String(year),
            ext,
            mime,
        });

        const res = await fetch(`${baseUrl}/api/admin/images/get-upload?${query}`, {
            credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) return { success: false, reason: data.reason };

        return { success: true, data }; // { upload_url, photo_url }
    } catch (err) {
        console.error("Server error:", err);
        return { success: false };
    }
}

//persist the uploaded image url (upsert per student/type/year)
export async function saveImageUrl(
    student_number: number,
    type: YearbookImageType,
    year: number,
    photo_url: string
) {
    try {
        const res = await fetch(`${baseUrl}/api/admin/images/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ student_number, type, year, photo_url }),
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

// ----- approval forum -----

interface ApprovalParams {
    view: string;   // PENDING | RESOLVED | ALL
    page: number;
    type: string;   // ALL | GRADUATION | THEME
    year?: number | null;
}

//review queue (approvers only)
export async function fetchApprovals(params: ApprovalParams) {
    try {
        const query = new URLSearchParams({
            view: params.view,
            page: String(params.page),
            type: params.type,
        });
        if (params.year) query.append("year", String(params.year));

        const res = await fetch(`${baseUrl}/api/admin/images/approvals?${query}`, {
            credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) return { success: false, reason: data.reason };
        return { success: true, data };
    } catch (err) {
        console.error("Server error:", err);
        return { success: false };
    }
}

//approve / reject a request
export async function decideImage(image_id: number, action: "APPROVE" | "REJECT", note?: string) {
    try {
        const res = await fetch(`${baseUrl}/api/admin/images/${image_id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action, note }),
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

//fetch a request's thread + detail
export async function fetchThread(image_id: number) {
    try {
        const res = await fetch(`${baseUrl}/api/admin/images/${image_id}/comments`, {
            credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) return { success: false, reason: data.reason };
        return { success: true, data }; // { request, comments }
    } catch (err) {
        console.error("Server error:", err);
        return { success: false };
    }
}

//post a comment to a request thread
export async function postComment(image_id: number, body: string) {
    try {
        const res = await fetch(`${baseUrl}/api/admin/images/${image_id}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ body }),
            credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) return { success: false, reason: data.reason };
        return { success: true, comment: data.comment };
    } catch (err) {
        console.error("Server error:", err);
        return { success: false };
    }
}
