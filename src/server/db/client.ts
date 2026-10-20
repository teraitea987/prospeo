import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { z } from "zod";

export function createDatabaseClient(connectionString: string) {
  if (!z.url({ protocol: /^postgres(ql)?$/ }).safeParse(connectionString).success) {
    throw new Error("Configuration PostgreSQL invalide.");
  }
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString, max: 5, connectionTimeoutMillis: 5000, statement_timeout: 10000 }),
    errorFormat: "minimal",
  });
}
