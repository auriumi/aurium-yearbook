//Student Service
const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL || "";

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
            reason: data.message || data.error || "Request failed.",
        };
    } catch {
        return {
            success: false,
            reason: "Request failed.",
        };
    }
}

export async function addBook(booking_slot_id: number) {
    try {
        const res = await fetch(`${baseUrl}/api/student/book/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                booking_slot_id
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
    const ext = file.name.split(".").pop();
    const mime = file.type;

    const res = await fetch(`${baseUrl}/api/student/profile/get-upload?ext=${ext}&mime=${mime}`, {
        credentials: "include",
    }); 
    return await res.json();
}

//uplaod directly with presigned url
export async function uploadToR2(upload_url: string, file: File) {
    console.log("file type: ", file.type);

    const res = await fetch(upload_url, {
        method: 'PUT',
        headers: { "Content-Type": file.type },
        body: file,
    });

    if (!res.ok) {
        return {
            success: false,
            reason: "Something went wrong!"
        };
    }
    return { success: true }
}

//send photo url to backend
export async function sendPhotoUrl(photo_url: string) {
    await fetch(`${baseUrl}/api/student/profile/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo_url }),
        credentials: "include"
    });
}
