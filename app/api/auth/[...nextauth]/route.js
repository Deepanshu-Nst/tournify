import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

// Make sure we're using a proper configuration
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Create the handler with proper error handling
const handler = NextAuth(authOptions)

// Export the handler with proper error handling
export async function GET(request) {
  try {
    return await handler(request)
  } catch (error) {
    console.error("NextAuth GET Error:", error)
    return new Response(JSON.stringify({ error: "Internal NextAuth error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function POST(request) {
  try {
    return await handler(request)
  } catch (error) {
    console.error("NextAuth POST Error:", error)
    return new Response(JSON.stringify({ error: "Internal NextAuth error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
