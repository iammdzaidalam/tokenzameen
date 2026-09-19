export type ActionState = { ok: true; message: string } | { ok: false; message: string } | null;

export type FormAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

export const SESSION_EXPIRED: ActionState = {
  ok: false,
  message: "Your session has expired. Sign in again to continue.",
};

export const NO_DATABASE_ACTION: ActionState = {
  ok: false,
  message: "No database is connected (DATABASE_URL is unset), so nothing was saved.",
};

export function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}
