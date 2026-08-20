"use server";

import { eq, and, isNull } from "drizzle-orm";
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

/** Only fills in a canonical image the first time -- never overwrites a curated choice. */
async function applyImageIfMissing(medicationId: number, imageUrl: string | null) {
  if (!imageUrl) return;
  await db
    .update(medications)
    .set({ imageUrl })
    .where(and(eq(medications.id, medicationId), isNull(medications.imageUrl)));
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

  const [mapping] = await db
    .select({ imageUrl: chainProductMappings.imageUrl })
    .from(chainProductMappings)
    .where(eq(chainProductMappings.id, mappingId))
    .limit(1);
  await applyImageIfMissing(medicationId, mapping?.imageUrl ?? null);

  revalidatePath("/admin/matching-queue");
  revalidatePath("/buscar");
}

export async function createMedicationFromMapping(formData: FormData) {
  await requireAdmin();
  const mappingId = parseId(formData.get("mappingId"));
  const canonicalName = parseRequiredName(formData.get("canonicalName"));
  if (!mappingId || !canonicalName) return;

  const [mapping] = await db
    .select({ imageUrl: chainProductMappings.imageUrl })
    .from(chainProductMappings)
    .where(eq(chainProductMappings.id, mappingId))
    .limit(1);

  let slug = slugify(canonicalName);
  const [clash] = await db.select().from(medications).where(eq(medications.slug, slug)).limit(1);
  if (clash) slug = `${slug}-${mappingId}`;

  const [created] = await db
    .insert(medications)
    .values({
      slug,
      canonicalName,
      imageUrl: mapping?.imageUrl ?? null,
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
