//Auth Module (Login)
const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL || "";

export async function handleLogin(id: string, pass: string, is_admin?: boolean) {
    try {
        const res = await fetch(`${baseUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: id,
                pass: pass,
                is_admin: is_admin ? is_admin : false
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