const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL || "";

export async function getCorrectionRequest(token: string) {
    try {
        const res = await fetch(`${baseUrl}/api/auth/correction-request/${encodeURIComponent(token)}`);
        const body = await res.json().catch(() => null);

        if (!res.ok) {
            return {
                success: false,
                reason: body?.reason || "Unable to load this correction request.",
            };
        }

        return {
            success: true,
            data: body.data,
        };
    } catch (err) {
        console.error(err);
        return {
            success: false,
            reason: "Cannot connect to the server at the moment.",
        };
    }
}

export async function resolveCorrectionRequest(token: string, decision: "confirm" | "reject") {
    try {
        const res = await fetch(`${baseUrl}/api/auth/correction-request/${encodeURIComponent(token)}/${decision}`, {
            method: "POST",
        });
        const body = await res.json().catch(() => null);

        if (!res.ok) {
            return {
                success: false,
                reason: body?.reason || "Unable to resolve this correction request.",
            };
        }

        return { success: true };
    } catch (err) {
        console.error(err);
        return {
            success: false,
            reason: "Cannot connect to the server at the moment.",
        };
    }
}
