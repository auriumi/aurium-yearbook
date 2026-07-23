//Auth Module (Login)
const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL || "";

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

            return {
                success: false,
                reason: "Something went wrong in the server."
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

export async function requestPasswordReset(identifier: string) {
    try {
        const res = await fetch(`${baseUrl}/api/auth/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier }),
        });

        const body = await res.json().catch(() => null);

        if (!res.ok) {
            return {
                success: false,
                reason: body?.reason || "Unable to request password reset right now."
            };
        }

        return {
            success: true,
            reason: body?.message || "If the account exists, password reset instructions were sent to the registered email."
        };

    } catch(err) {
        console.error(err);
        return {
            success: false,
            reason: "Cannot connect to the server at the moment. Please try again later."
        };
    }
}

export async function resetPassword(token: string, new_pass: string) {
    try {
        const res = await fetch(`${baseUrl}/api/auth/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, new_pass }),
        });

        const body = await res.json().catch(() => null);

        if (!res.ok) {
            return {
                success: false,
                reason: body?.reason || "Unable to reset password right now."
            };
        }

        return {
            success: true,
            reason: body?.message || "Password has been reset successfully."
        };

    } catch(err) {
        console.error(err);
        return {
            success: false,
            reason: "Cannot connect to the server at the moment. Please try again later."
        };
    }
}
