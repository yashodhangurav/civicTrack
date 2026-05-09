import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const path = req.nextUrl.pathname;

  // If not logged in, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = token.role as string;

  // Role-based access control
  if (path.startsWith("/dashboard/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (path.startsWith("/dashboard/supervisor") && role !== "SUPERVISOR" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (path.startsWith("/dashboard/worker") && role !== "OFFICER" && role !== "SUPERVISOR" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (path.startsWith("/dashboard/citizen") && role !== "CITIZEN" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
}

export const config = { matcher: ["/dashboard/:path*"] };
