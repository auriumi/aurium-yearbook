import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    let logged_in = false;

    if (token) {
        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(process.env.JWT_SAUCE)
        );
        logged_in = !!payload.student_number;
    }
    return NextResponse.json({ logged_in })
}