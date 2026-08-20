"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/src/db";
import { chainProductMappings, medications } from "@/src/db/schema";
import { verifyAdminSession, deleteAdminSession } from "@/src/lib/session";
import { slugify } from "@/src/lib/slugify";
import { parseId, parseRequiredName } from "@/src/lib/validation";

// Proxy only does an optimistic cookie check; every mutation here re-verifies the
// session, since Server Actions are reachable directly via POST regardless of proxy.
async function requireAdmin() {
  if (!(await verifyAdminSession())) {
    throw new Error("Unauthorized");
  }
}

export async function confirmMapping(formData: FormData) {
  await requireAdmin();
  const mappingId = parseId(formData.get("mappingId"));
  const medicationId = parseId(formData.get("medicationId"));
  if (!mappingId || !medicationId) return;

  await db
    .update(chainProductMappings)
    .set({ medicationId, matchStatus: "confirmed", matchedBy: "manual" })
    .where(eq(chainProductMappings.id, mappingId));
  revalidatePath("/admin/matching-queue");
}

export async function createMedicationFromMapping(formData: FormData) {
  await requireAdmin();
  const mappingId = parseId(formData.get("mappingId"));
  const canonicalName = parseRequiredName(formData.get("canonicalName"));
  if (!mappingId || !canonicalName) return;

  let slug = slugify(canonicalName);
  const [clash] = await db.select().from(medications).where(eq(medications.slug, slug)).limit(1);
  if (clash) slug = `${slug}-${mappingId}`;

  const [created] = await db
    .insert(medications)
    .values({
      slug,
      canonicalName,
      regulatoryClassSource: "manual_curated",
    })
    .returning();

  await db
    .update(chainProductMappings)
    .set({ medicationId: created.id, matchStatus: "confirmed", matchedBy: "manual" })
    .where(eq(chainProductMappings.id, mappingId));

  revalidatePath("/admin/matching-queue");
  revalidatePath("/buscar");
}

export async function rejectMapping(formData: FormData) {
  await requireAdmin();
  const mappingId = parseId(formData.get("mappingId"));
  if (!mappingId) return;

  await db
    .update(chainProductMappings)
    .set({ matchStatus: "no_match", medicationId: null })
    .where(eq(chainProductMappings.id, mappingId));
  revalidatePath("/admin/matching-queue");
}

export async function logout() {
  await deleteAdminSession();
  redirect("/admin/login");
}
