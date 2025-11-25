import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { generateToken } from "@/lib/jwt"

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password } = body || {}

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid email or password" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Verify password
    if (!user.passwordHash) {
      return new Response(JSON.stringify({ error: "Invalid email or password" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return new Response(JSON.stringify({ error: "Invalid email or password" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

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
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          createdAt: user.createdAt,
        },
        token,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    console.error("Login API error", error)
    const errorMessage = process.env.NODE_ENV === "development" 
      ? error.message || "Internal server error"
      : "Internal server error"
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

