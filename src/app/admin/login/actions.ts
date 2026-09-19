"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { attemptLogin, endSession, safeAdminPath } from "@/lib/auth";
import { field, type ActionState } from "@/components/admin/action-state";

const loginSchema = z.object({
  email: z.string().trim().min(1).max(160),
  password: z.string().min(1).max(1024),
  next: z.string().max(512).optional(),
});

export async function login(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: field(formData, "email"),
    password: formData.get("password"),
    next: field(formData, "next"),
  });
  if (!parsed.success) return { ok: false, message: "Enter your email and password." };

  const result = await attemptLogin(parsed.data.email, parsed.data.password);
  if (!result.ok) {
    switch (result.reason) {
      case "not-configured":
        return {
          ok: false,
          message: "The panel is not configured on this environment. See docs/ADMIN.md.",
        };
      case "rate-limited": {
        const minutes = Math.max(1, Math.ceil((result.retryAfterSeconds ?? 60) / 60));
        return {
          ok: false,
          message: `Too many attempts from this connection. Try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`,
        };
      }
      default:
        return { ok: false, message: "That email and password do not match." };
    }
  }

  redirect(safeAdminPath(parsed.data.next));
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}
