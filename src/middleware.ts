import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const sessionToken = req.cookies.get('token')?.value;
    console.log(sessionToken);

    if (!sessionToken) {
        const { pathname } = req.nextUrl;
        if (pathname.startsWith('/admin/') && pathname !== '/admin') {
            return NextResponse.redirect(new URL('/admin', req.url));
        }
        if (pathname.startsWith('/staff')) {
            return NextResponse.redirect(new URL('/auth/login', req.url));
        }
        if (pathname.startsWith('/student')) {
            return NextResponse.redirect(new URL('/auth/login', req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/staff/:path*',
    '/student/:path*',
  ],
}