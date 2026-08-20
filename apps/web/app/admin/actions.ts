"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/src/db";
import { chainProductMappings, medications } from "@/src/db/schema";

// NOTE: MVP has no admin auth yet -- see plan Milestone 4. Do not expose this route
// publicly without adding session auth first.

export async function confirmMapping(formData: FormData) {
  const mappingId = Number(formData.get("mappingId"));
  const medicationId = Number(formData.get("medicationId"));
  await db
    .update(chainProductMappings)
    .set({ medicationId, matchStatus: "confirmed", matchedBy: "manual" })
    .where(eq(chainProductMappings.id, mappingId));
  revalidatePath("/admin/matching-queue");
}

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createMedicationFromMapping(formData: FormData) {
  const mappingId = Number(formData.get("mappingId"));
  const canonicalName = String(formData.get("canonicalName") || "").trim();
  if (!canonicalName) return;

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
  const mappingId = Number(formData.get("mappingId"));
  await db
    .update(chainProductMappings)
    .set({ matchStatus: "no_match", medicationId: null })
    .where(eq(chainProductMappings.id, mappingId));
  revalidatePath("/admin/matching-queue");
}
