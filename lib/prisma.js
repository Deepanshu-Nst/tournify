import { PrismaClient } from "@prisma/client"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set")
}

let prisma

// Prisma 7: Connection URL is read from prisma.config.ts
// For MongoDB, we pass the connection string via adapter
const prismaOptions = connectionString ? {
  adapter: {
    type: "mongodb",
    url: connectionString,
  },
} : {}

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient(prismaOptions)
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient(prismaOptions)
  }
  prisma = global.prisma
}

export default prisma
