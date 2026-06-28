import { PrismaClient } from "@prisma/client";

// Fix: Prisma returns BigInt fields which can't be JSON-serialized by default.
// This polyfill converts BigInt to Number when JSON.stringify is called.
if (typeof BigInt.prototype.toJSON === "undefined") {
  BigInt.prototype.toJSON = function () {
    return Number(this);
  };
}

let prisma;

export function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
  return prisma;
}

export async function disconnectDatabase() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}
