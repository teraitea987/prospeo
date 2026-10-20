import type { SearchFilters } from "./filters";
// Noms et établissements entièrement inventés, aucune donnée issue de PostgreSQL.
const companies = [
  ["Atelier Démo Aurore", "Lyon", "Artisanat", "1–9 salariés"],
  ["Comptoir Démo des Jardins", "Lyon", "Restauration", "10–49 salariés"],
  ["Studio Démo Horizon", "Paris", "Services", "1–9 salariés"],
  ["Menuiserie Démo Rivage", "Nantes", "Artisanat", "10–49 salariés"],
  ["Table Démo des Saisons", "Bordeaux", "Restauration", "1–9 salariés"],
  ["Bureau Démo Azur", "Marseille", "Services", "10–49 salariés"],
  ["Atelier Démo du Parc", "Paris", "Artisanat", "1–9 salariés"],
  ["Cuisine Démo Boréale", "Nantes", "Restauration", "1–9 salariés"],
  ["Conseil Démo Clairière", "Lyon", "Services", "10–49 salariés"],
  ["Fabrique Démo Opale", "Bordeaux", "Artisanat", "1–9 salariés"],
  ["Café Démo des Rives", "Marseille", "Restauration", "10–49 salariés"],
  ["Agence Démo Mosaïque", "Paris", "Services", "1–9 salariés"],
].map(([name, city, sector, size], i) => ({ id: `demo-${i + 1}`, name, city, sector, size }));
const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr");
export function searchDemo(filters: SearchFilters) {
  const matches = companies.filter(c => normalize(c.name).includes(normalize(filters.q)) && normalize(c.city).includes(normalize(filters.city)) && (!filters.sector || c.sector === filters.sector) && (!filters.size || c.size === filters.size));
  const pageSize = 6;
  const pages = Math.max(1, Math.ceil(matches.length / pageSize));
  const page = Math.min(filters.page, pages);
  return { items: matches.slice((page - 1) * pageSize, page * pageSize), total: matches.length, page, pages, demo: true as const };
}
export type SearchResult = ReturnType<typeof searchDemo>;
