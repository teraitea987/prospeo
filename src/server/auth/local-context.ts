import { z } from "zod";
const workspaceIdSchema = z.uuid();
export type WorkspaceContext = Readonly<{ workspaceId: string }>;
// À appeler exclusivement depuis une configuration serveur locale de confiance.
// Aucun endpoint n’accepte de workspace fourni par le navigateur à cette étape.
export function createLocalContext(input: Record<string, unknown>): WorkspaceContext {
  if (input.NODE_ENV !== "development" || input.LOCAL_DB_ACCESS !== "enabled") {
    throw new Error("Accès local interdit.");
  }
  const id = workspaceIdSchema.safeParse(input.LOCAL_WORKSPACE_ID);
  if (!id.success) throw new Error("Workspace local invalide.");
  return Object.freeze({ workspaceId: id.data });
}
