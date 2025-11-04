import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  try {
    const tournaments = await prisma.tournament.findMany({ orderBy: { createdAt: "desc" } })
    return new Response(JSON.stringify({ tournaments }), { status: 200, headers: { "Content-Type": "application/json" } })
  } catch (error) {
    console.error("List tournaments error", error)
    return new Response(JSON.stringify({ error: "Failed to list tournaments" }), { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const body = await request.json()
    const data = body || {}

    const created = await prisma.tournament.create({
      data: {
        title: data.title,
        game: data.game,
        description: data.description ?? null,
        startDate: data.startDate ?? null,
        endDate: data.endDate ?? null,
        totalSlots: Number.parseInt(data.totalSlots ?? 0),
        status: data.status ?? "upcoming",
        format: data.format ?? null,
        prizePool: data.prizePool ?? null,
        registrationType: data.registrationType ?? null,
        image: data.image ?? null,
        organizerId: session.user.id,
        organizerName: data.organizerName ?? session.user.name ?? null,
      },
      select: {
        id: true,
        title: true,
        game: true,
        startDate: true,
        endDate: true,
        totalSlots: true,
        registeredTeams: true,
        status: true,
        image: true,
        organizerId: true,
        organizerName: true,
        createdAt: true,
      },
    })

    return new Response(JSON.stringify({ tournament: created }), { status: 201, headers: { "Content-Type": "application/json" } })
  } catch (error) {
    console.error("Create tournament error", error)
    return new Response(JSON.stringify({ error: "Failed to create tournament" }), { status: 500 })
  }
}


