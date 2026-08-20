"use server";

import { redirect } from "next/navigation";
import { createAdminSession } from "@/src/lib/session";
import { passwordMatches } from "@/src/lib/password";
import { parseSafeRedirectPath } from "@/src/lib/validation";

const DEFAULT_NEXT = "/admin/matching-queue";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function login(formData: FormData) {
  const password = String(formData.get("password") || "");
  const next = parseSafeRedirectPath(formData.get("next"), DEFAULT_NEXT);

  if (!process.env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_PASSWORD is not set");
  }

  if (!passwordMatches(password, process.env.ADMIN_PASSWORD)) {
    // Cheap deterrent against scripted brute-forcing; not a substitute for a real
    // rate limiter (see security notes), but better than nothing for a solo-admin app.
    await delay(500);
    redirect(`/admin/login?error=1&next=${encodeURIComponent(next)}`);
  }

  await createAdminSession();
  redirect(next);
}
