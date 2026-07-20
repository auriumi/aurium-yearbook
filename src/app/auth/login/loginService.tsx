//Auth Module (Login)
const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL || "";

type ErrorBody = {
    error?: string;
    message?: string;
    reason?: string;
};

async function readErrorReason(res: Response) {
    try {
        const contentType = res.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            const body = await res.json() as ErrorBody | string;

            if (typeof body === "string") {
                return body;
            }

            return body.reason || body.error || body.message || "";
        }

        return await res.text();
    } catch {
        return "";
    }
}

export async function handleLogin(id: string, pass: string, captcha_token: string, is_admin?: boolean) {
    try {
        const res = await fetch(`${baseUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: id,
                pass: pass,
                is_admin: is_admin ? is_admin : false,
                captcha_token,
            }),
            credentials: 'include',
        });

        if (!res.ok) {
            const serverReason = await readErrorReason(res);

            if (res.status == 401) {
                return {
                    success: false,
                    reason: "Invalid credentials. Please check your information!"
                }
            } 

            if (res.status == 429) {
                return {
                    success: false,
                    reason: "Too many login attempts, please try again later!"
                }
            } 

            if (res.status == 400) {
                return {
                    success: false,
                    reason: serverReason || "Invalid login request."
                }
            }

            return {
                success: false,
                reason: serverReason || "Something went wrong in the server."
            }
        }

        const body = await res.json();
        return {
            success: true,
            reason: "Succesfully logged in!",
            is_new: body.is_new
        }

    } catch(err) {
        console.error(err);
        return {
            success: false,
            reason: "Cannot connect to the server at the moment. Please try agian later"
        }
    }
};

export async function handleUpdatePass(new_pass: string) {
    try {
        const res = await fetch(`${baseUrl}/api/auth/update`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                new_pass: new_pass,
            }),
            credentials: 'include',
        }); 

        if (!res.ok) {
            return {
                success: false,
                reason: "Something went wrong in the server"
            }
        }

        return {
            success: true,
            reason: "Password has been updated succesfully!"
        }

    } catch(err) {
        console.error(err);
        return {
            success: false,
            reason: "Cannot connect to the server at the moment. Please try agian later"
        }
    }
};
