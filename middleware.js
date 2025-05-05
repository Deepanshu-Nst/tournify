import { NextResponse } from "next/server"

export function middleware(request) {
  // You can add authentication checks here if needed
  return NextResponse.next()
}

export const config = {
  matcher: ["/organizer/:path*", "/profile", "/settings", "/dashboard"],
}
