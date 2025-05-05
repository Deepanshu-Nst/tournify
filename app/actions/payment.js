"use server"

import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function createCheckoutSession(data) {
  const { tournamentId, tournamentName, price, userId, userEmail } = data

  try {
    // Create Checkout Sessions from body params
    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: tournamentName,
              description: `Registration for ${tournamentName}`,
              metadata: {
                tournamentId,
              },
            },
            unit_amount: price * 100, // Stripe expects amount in cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        tournamentId,
        userId,
      },
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/tournaments/${tournamentId}/registration-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/tournaments/${tournamentId}`,
    })

    return { url: session.url }
  } catch (error) {
    console.error("Error creating checkout session:", error)
    throw new Error("Failed to create checkout session")
  }
}

export async function handleStripeWebhook(req) {
  const signature = req.headers.get("stripe-signature")
  const body = await req.text()

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return { error: `Webhook Error: ${err.message}` }
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object

    // Here you would update your database to mark the registration as paid
    // For example:
    // await db.registrations.update({
    //   where: {
    //     tournamentId: session.metadata.tournamentId,
    //     userId: session.metadata.userId
    //   },
    //   data: {
    //     paymentStatus: 'paid',
    //     paymentId: session.id
    //   }
    // });

    console.log(`Payment successful for tournament ${session.metadata.tournamentId} by user ${session.metadata.userId}`)
  }

  return { received: true }
}
