import codes from "./postal-codes.json";
const knownCodes = new Set(codes.map(row => row.code));
const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr");
export function isKnownPostalCode(code: string) { return knownCodes.has(code); }
export function suggestPostalCodes(query: string) {
  const q = normalize(query.trim());
  if (q.length < 2 || q.length > 80) return [];
  return codes.filter(row => row.code.startsWith(q) || row.communes.some(name => normalize(name).includes(q))).slice(0, 8);
}
