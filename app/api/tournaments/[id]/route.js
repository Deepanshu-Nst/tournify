import prisma from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/jwt"

export async function GET(_req, { params }) {
  try {
    const tournament = await prisma.tournament.findUnique({ where: { id: params.id } })
    if (!tournament) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 })
    return new Response(JSON.stringify({ tournament }), { status: 200, headers: { "Content-Type": "application/json" } })
  } catch (error) {
    console.error("Get tournament error", error)
    return new Response(JSON.stringify({ error: "Failed" }), { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user?.id) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })

    const existing = await prisma.tournament.findUnique({ where: { id: params.id } })
    if (!existing) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 })
    if (existing.organizerId !== user.id) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 })

    const data = await request.json()
    const updated = await prisma.tournament.update({ where: { id: params.id }, data })
    return new Response(JSON.stringify({ tournament: updated }), { status: 200 })
  } catch (error) {
    console.error("Update tournament error", error)
    return new Response(JSON.stringify({ error: "Failed" }), { status: 500 })
  }
}

export async function DELETE(_req, { params }) {
  try {
    const user = await getUserFromRequest(_req)
    if (!user?.id) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    const existing = await prisma.tournament.findUnique({ where: { id: params.id } })
    if (!existing) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 })
    if (existing.organizerId !== user.id) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 })
    await prisma.tournament.delete({ where: { id: params.id } })
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error("Delete tournament error", error)
    return new Response(JSON.stringify({ error: "Failed" }), { status: 500 })
  }
}


