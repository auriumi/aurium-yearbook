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

        if (!res.ok) {
            return false;
        }
        return true;

    } catch(err) {
        console.error(err);
        return false;
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