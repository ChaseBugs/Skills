import type { NextRequest } from "next/server";
import { route } from "@/lib/api";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function handler(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return route(req, (await context.params).path);
}
export { handler as GET, handler as POST, handler as PATCH, handler as DELETE };
