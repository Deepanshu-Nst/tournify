import { PrismaClient } from "@prisma/client"

// Prisma 7: Connection URL is read from prisma.config.ts automatically
// No need to pass adapter or connection string to PrismaClient
// The prisma.config.ts file handles the datasource configuration

let prisma

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient()
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}

export default prisma
