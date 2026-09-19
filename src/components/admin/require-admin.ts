import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "@/lib/auth";

/**
 * The proxy already turned away requests without a valid cookie; this is the
 * check next to the data, as the Next.js auth guide asks for.
 */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}
