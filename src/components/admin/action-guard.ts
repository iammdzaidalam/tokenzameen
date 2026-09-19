import type { RepoError } from "@/db/repositories";
import { getSession } from "@/lib/auth";
import { env } from "@/lib/env";
import { NO_DATABASE_ACTION, SESSION_EXPIRED, type ActionState } from "./action-state";

/** Every Server Action re-checks the session next to the data, then the database. */
export async function guardAction(): Promise<ActionState> {
  if (!(await getSession())) return SESSION_EXPIRED;
  if (!env.hasDatabase) return NO_DATABASE_ACTION;
  return null;
}

export function repoFailure(error: RepoError): ActionState {
  switch (error.code) {
    case "no-database":
      return NO_DATABASE_ACTION;
    case "not-found":
      return { ok: false, message: "That record no longer exists." };
    case "conflict":
      return { ok: false, message: "That change conflicts with an existing record." };
    default:
      return { ok: false, message: "The database request failed. Nothing was changed." };
  }
}
