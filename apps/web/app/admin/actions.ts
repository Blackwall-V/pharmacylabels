"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/src/db";
import { chainProductMappings } from "@/src/db/schema";

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

export async function rejectMapping(formData: FormData) {
  const mappingId = Number(formData.get("mappingId"));
  await db
    .update(chainProductMappings)
    .set({ matchStatus: "no_match", medicationId: null })
    .where(eq(chainProductMappings.id, mappingId));
  revalidatePath("/admin/matching-queue");
}
