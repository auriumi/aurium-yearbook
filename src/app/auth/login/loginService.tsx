//Auth Module (Login)

export async function handleLogin(id: string, pass: string, is_admin?: boolean) {
    try {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                id: id, 
                pass: pass,
                is_admin: is_admin ? is_admin : false
            }),
            credentials: 'include'
        });

        if (res.ok) {
            return {
                success: true,
                message: "Succesfully logged in!"
            }
        }

        if (res.status == 401) {
            return {
                success: false,
                message: "Invalid credentials. Please check your ID and Password"
            }
        } 

        return {
            success: false,
            message: "Server error" 
        }
    } catch(err) {
        console.error(err);
        return {
            success: false,
            message: "Cannot connect to the server at the moment. Please try agian later"
        }
    }
};