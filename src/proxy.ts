import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getSauceKey() {
    const secret = process.env.JWT_SAUCE;
    console.log(secret);

    if (!secret) {
        throw new Error("Where's the sauce? :P");
    }
    return new TextEncoder().encode(secret);
};

export async function proxy(req: NextRequest) {
    const session_token = req.cookies.get('token')?.value;
    const { pathname } = req.nextUrl;

    if (!session_token) {
        if (pathname.startsWith('/admin/') && pathname !== '/admin') {
            return NextResponse.redirect(new URL('/admin', req.url));
        }

        //todo: will merge staff and admin endpoint
        if (pathname.startsWith('/staff')) {
            return NextResponse.redirect(new URL('/admin', req.url));
        }

        if (pathname.startsWith('/student')) {
            return NextResponse.redirect(new URL('/auth/login', req.url));
        }

        return NextResponse.next();
    }

    try {
        const { payload } = await jwtVerify(session_token, getSauceKey());
        console.log(payload);

        if (pathname.startsWith('/admin/')) {
            const is_admin = payload.is_admin;
            if (!is_admin) {
                return NextResponse.redirect(new URL('/auth/login', req.url));
            }
        }
        return NextResponse.next();

    } catch (err) {
        console.error("Sauce is a bit saucy: ", err);
        const login_url = pathname.startsWith('/admin') ? '/admin' : '/auth/login';
        
        //clear invalid cookie to be safe
        const res = NextResponse.redirect(new URL(login_url, req.url));
        res.cookies.delete('token');
        return res;
    }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/staff/:path*',
    '/student/:path*',
  ],
}