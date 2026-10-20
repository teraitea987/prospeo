import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});
// N’exposer que les champs connus, jamais l’environnement brut ou ses valeurs.
export function parseEnvironment(input: Record<string, unknown>) {
  const result = environmentSchema.safeParse(input);
  if (!result.success) throw new Error("Configuration serveur invalide : NODE_ENV.");
  return result.data;
}
