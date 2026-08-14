import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis;

function createPrismaClient() {
  const url = process.env.DATABASE_URL || "mysql://root@localhost:3306/tasklink";
  const database = (url.split("?")[0].split("/").pop()) || "tasklink";
  const adapter = new PrismaMariaDb(url, {
    database,
    useTextProtocol: true,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
