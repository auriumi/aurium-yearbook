//Student Service
const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL || "";
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png"]);

function readErrorReason(data: unknown, fallback = "Request failed.") {
    if (!data || typeof data !== "object") return fallback;

    const body = data as Record<string, unknown>;
    const reason = body.reason || body.message || body.error;

    return typeof reason === "string" ? reason : fallback;
}

export async function getStudentProfile() {
    try {
        const res = await fetch(
            `${baseUrl}/api/student/profile/fetch`,
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
            `${baseUrl}/api/student/book/fetch`,
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

async function readMutationResult(res: Response) {
    if (res.ok) {
        return {
            success: true,
        };
    }

    try {
        const data = await res.json();
        return {
            success: false,
            reason: readErrorReason(data),
        };
    } catch {
        return {
            success: false,
            reason: "Request failed.",
        };
    }
}

export async function addBook(booking_id: number, period: string) {
    try {
        const res = await fetch(`${baseUrl}/api/student/book/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                booking_id: booking_id,
                period: period
            }),
            credentials: 'include'
        });
        return readMutationResult(res);

    } catch(err) {
        console.error(err);
        return {
            success: false,
            reason: "Unable to connect to the server.",
        };
    }
};

export async function updateBook(booking_id: number, booking_day_id: number, period: string) {
    try {
        const res = await fetch(`${baseUrl}/api/student/book/update/${booking_id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                booking_day_id: booking_day_id,
                period: period
            }),
            credentials: 'include'
        });
        return readMutationResult(res);
        
    } catch(err) {
        console.error(err);
        return {
            success: false,
            reason: "Unable to connect to the server.",
        };
    }
};

export async function saveSolicitations(
    sponsors: Array<{ type: "PERSON" | "COMPANY"; name: string; title: string }>
) {
    try {
        const res = await fetch(`${baseUrl}/api/student/solicitation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sponsors }),
            credentials: "include"
        });

        if (!res.ok) {
            return {
                success: false,
                reason: "Something went wrong!"
            };
        }

        return { success: true };

    } catch (err) {
        console.error(err);
        return { success: false, reason: "Network error while saving solicitations." };
    }
};

//request uplaod url from backend
export async function getUploadUrl(file: File) {
    const mime = file.type;

    if (!ALLOWED_PHOTO_TYPES.has(mime)) {
        return {
            success: false,
            reason: "Only JPG and PNG images are supported.",
        };
    }

    const ext = mime === "image/png" ? "png" : "jpg";
    const query = new URLSearchParams({
        ext,
        mime,
    });

    try {
        const res = await fetch(`${baseUrl}/api/student/profile/get-upload?${query}`, {
            credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
            return {
                success: false,
                reason: readErrorReason(data, "Could not start the upload."),
            };
        }

        if (typeof data.upload_url !== "string" || typeof data.photo_url !== "string") {
            return {
                success: false,
                reason: "The server returned an invalid upload response.",
            };
        }

        return {
            success: true,
            upload_url: data.upload_url,
            photo_url: data.photo_url,
        };
    } catch (err) {
        console.error(err);
        return {
            success: false,
            reason: "Unable to connect to the server.",
        };
    }
}

//uplaod directly with presigned url
export async function uploadToR2(upload_url: string, file: File) {
    if (!upload_url) {
        return {
            success: false,
            reason: "The upload URL is missing.",
        };
    }

    try {
        const res = await fetch(upload_url, {
            method: 'PUT',
            headers: { "Content-Type": file.type },
            body: file,
        });

        if (!res.ok) {
            return {
                success: false,
                reason: "Storage rejected the upload. Please try again.",
            };
        }

        return { success: true };
    } catch (err) {
        console.error(err);
        return {
            success: false,
            reason: "Upload failed. Please check your connection or storage CORS settings.",
        };
    }
}

//send photo url to backend
export async function sendPhotoUrl(photo_url: string) {
    try {
        const res = await fetch(`${baseUrl}/api/student/profile/upload`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ photo_url }),
            credentials: "include"
        });
        const data = await res.json();

        if (!res.ok) {
            return {
                success: false,
                reason: readErrorReason(data, "Could not save the uploaded photo."),
            };
        }

        return { success: true };
    } catch (err) {
        console.error(err);
        return {
            success: false,
            reason: "Unable to save the uploaded photo.",
        };
    }
}
