//Admin Services Module - Do not modify <3

export async function fetchStudents() {
    try {
        const res = await fetch('http://localhost:4000/api/admin/student/fetch');
        if (!res.ok) throw new Error("API Error");

        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error(err);
        return [];
    }
};

export async function handleVerify(studentId: number) {
    try {
        await fetch("http://localhost:4000/api/admin/student/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: studentId })
        });

        alert(`Student Verified!`);
        return true;
    } catch (err) {
        console.error(err); 
        alert("Verification failed.");
        return false;
    }
};