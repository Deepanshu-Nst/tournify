import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

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

    return new Response(JSON.stringify({ user }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Signup API error", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}


