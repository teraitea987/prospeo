import { checkRealAccess } from "./server/auth/real-search-access";
export function proxy(request: Request) { return checkRealAccess(request) ?? undefined; }
export const config = { matcher: ["/recherche/reelle"] };
