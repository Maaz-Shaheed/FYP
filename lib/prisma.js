import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global;

export const db = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

// Always cache the PrismaClient instance, regardless of environment
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
} else {
  // In production, also cache the instance to prevent "prepared statement already exists" errors
  globalForPrisma.prisma = db;
}
