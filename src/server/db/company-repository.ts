import "server-only";
import { z } from "zod";
import type { PrismaClient } from "../../generated/prisma/client";
import type { WorkspaceContext } from "../auth/local-context";
const idSchema = z.uuid();
const companySchema = z.object({ name: z.string().trim().min(1).max(200), siren: z.string().regex(/^\d{9}$/).optional() }).strict();
const observationSchema = z.object({
  field: z.string().trim().min(1).max(100), value: z.string().min(1).max(4000),
  kind: z.enum(["FACT", "HYPOTHESIS", "UNKNOWN"]), confidence: z.enum(["LOW", "MEDIUM", "HIGH"]),
  source: z.string().trim().min(1).max(200), sourceUrl: z.url({ protocol: /^https?$/ }).max(2048),
  sourceRecordId: z.string().max(200).optional(), collectedAt: z.date(), verifiedAt: z.date().optional(),
}).strict().refine((v) => !v.verifiedAt || v.verifiedAt >= v.collectedAt);

// La portée provient du contexte serveur ; elle ne peut pas être surchargée par les données.
export function companyRepository(db: PrismaClient, context: WorkspaceContext) {
  const workspaceId = idSchema.parse(context.workspaceId);
  return {
    list: () => db.company.findMany({ where: { workspaceId }, take: 100, orderBy: { createdAt: "desc" } }),
    find: (id: string) => db.company.findUnique({ where: { workspaceId_id: { workspaceId, id: idSchema.parse(id) } } }),
    create: (input: unknown) => db.company.create({ data: { ...companySchema.parse(input), workspaceId } }),
    observe: (companyId: string, input: unknown) => db.observation.create({ data: {
      ...observationSchema.parse(input), workspaceId, companyId: idSchema.parse(companyId),
    } }),
    observations: (companyId: string) => db.observation.findMany({ where: { workspaceId, companyId: idSchema.parse(companyId) }, take: 100, orderBy: { collectedAt: "desc" } }),
  };
}
