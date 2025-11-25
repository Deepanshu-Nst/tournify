import { NextResponse } from "next/server"
import { verifyToken, getTokenFromRequest } from "@/lib/jwt"

export function middleware(request) {
  // Get token from Authorization header
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.startsWith("Bearer ") 
    ? authHeader.substring(7) 
    : null

  // For API routes, check Authorization header
  if (request.nextUrl.pathname.startsWith("/api/") && 
      !request.nextUrl.pathname.startsWith("/api/auth/")) {
    if (!token) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    try {
      verifyToken(token)
      return NextResponse.next()
    } catch (error) {
      return new NextResponse(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }
  }

  // For protected pages, allow through (client-side will handle redirect)
  // The client-side auth will check localStorage for token
  return NextResponse.next()
}

export const config = {
  matcher: ["/organizer/:path*", "/profile", "/settings", "/dashboard", "/api/tournaments/:path*"],
}
