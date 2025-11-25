import prisma from "@/lib/prisma"

export async function PATCH(request, { params }) {
  try {
    const body = await request.json()
    const status = body.status

    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return new Response(JSON.stringify({ error: "Invalid status" }), { status: 400 })
    }

    const existing = await prisma.registration.findUnique({ where: { id: params.id } })
    if (!existing) {
      return new Response(JSON.stringify({ error: "Registration not found" }), { status: 404 })
    }

    const tournament = await prisma.tournament.findUnique({ where: { id: existing.tournamentId } })
    if (!tournament) {
      return new Response(JSON.stringify({ error: "Tournament not found" }), { status: 404 })
    }

    let registeredTeamsDelta = 0

    if (existing.status !== "rejected" && status === "rejected") {
      registeredTeamsDelta = -1
    } else if (existing.status === "rejected" && status !== "rejected") {
      if (tournament.registeredTeams >= tournament.totalSlots) {
        return new Response(JSON.stringify({ error: "No available slots" }), { status: 409 })
      }
      registeredTeamsDelta = 1
    }

    const updated = await prisma.registration.update({
      where: { id: params.id },
      data: { status },
    })

    if (registeredTeamsDelta !== 0) {
      await prisma.tournament.update({
        where: { id: existing.tournamentId },
        data: { registeredTeams: { increment: registeredTeamsDelta } },
      })
    }

    return new Response(JSON.stringify({ registration: updated }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Update registration error", error)
    return new Response(JSON.stringify({ error: "Failed to update registration" }), { status: 500 })
  }
}

