import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { generateToken } from "@/lib/jwt"

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, password } = body || {}

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return new Response(JSON.stringify({ error: "Email already in use" }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { name: name || null, email, passwordHash },
      select: { id: true, name: true, email: true, image: true, createdAt: true },
    })

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    })

    // Return user data and token
    return new Response(
      JSON.stringify({
        user,
        token,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    console.error("Signup API error", error)
    
    // Ensure we always return JSON, even on unexpected errors
    let errorMessage = "Internal server error"
    if (process.env.NODE_ENV === "development") {
      errorMessage = error.message || error.toString() || "Internal server error"
    }
    
    // Handle Prisma connection errors specifically
    if (error.message?.includes("Can't reach database") || 
        error.message?.includes("P1001") ||
        error.message?.includes("ECONNREFUSED")) {
      errorMessage = "Database connection failed. Please try again later."
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      ...(process.env.NODE_ENV === "development" && { details: error.stack })
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"
      },
    })
  }
}


