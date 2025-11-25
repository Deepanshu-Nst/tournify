import prisma from "@/lib/prisma"

export async function GET(_request, { params }) {
  try {
    const registrations = await prisma.registration.findMany({
      where: { tournamentId: params.id },
      orderBy: { createdAt: "desc" },
    })

    return new Response(JSON.stringify({ registrations }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("List registrations error", error)
    return new Response(JSON.stringify({ error: "Failed to load registrations" }), { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const body = await request.json()
    const tournament = await prisma.tournament.findUnique({ where: { id: params.id } })

    if (!tournament) {
      return new Response(JSON.stringify({ error: "Tournament not found" }), { status: 404 })
    }

    if (tournament.registeredTeams >= tournament.totalSlots) {
      return new Response(JSON.stringify({ error: "Registration is closed. All slots are filled." }), { status: 409 })
    }

    if (!body.userId) {
      return new Response(JSON.stringify({ error: "User information is required" }), { status: 400 })
    }

    if (!body.contactEmail) {
      return new Response(JSON.stringify({ error: "Contact email is required" }), { status: 400 })
    }

    if (!body.players || !Array.isArray(body.players) || body.players.length === 0) {
      return new Response(JSON.stringify({ error: "At least one player is required" }), { status: 400 })
    }

    if ((body.mode || tournament.registrationMode) !== "solo" && !body.teamName) {
      return new Response(JSON.stringify({ error: "Team name is required for team registrations" }), { status: 400 })
    }

    const mode = body.mode || tournament.registrationMode
    const playerEntries = body.players.slice(0, mode === "solo" ? 1 : 6)

    const registration = await prisma.registration.create({
      data: {
        tournamentId: params.id,
        userId: body.userId,
        userName: body.userName,
        userEmail: body.userEmail,
        teamName: body.teamName,
        mode,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        discordHandle: body.discordHandle,
        additionalInfo: body.additionalInfo,
        playerCount: body.playerCount ?? playerEntries.length,
        players: playerEntries,
      },
    })

    await prisma.tournament.update({
      where: { id: params.id },
      data: {
        registeredTeams: { increment: 1 },
        status: tournament.registeredTeams + 1 >= tournament.totalSlots ? "full" : tournament.status,
      },
    })

    return new Response(JSON.stringify({ registration }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Create registration error", error)
    return new Response(JSON.stringify({ error: "Failed to register for tournament" }), { status: 500 })
  }
}

