"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/src/db";
import { chainConvenios } from "@/src/db/schema";

// NOTE: MVP has no admin auth yet -- see plan Milestone 4.

export async function createConvenio(formData: FormData) {
  await db.insert(chainConvenios).values({
    chainId: Number(formData.get("chainId")),
    cajaId: Number(formData.get("cajaId")),
    description: String(formData.get("description") || "") || null,
    validFrom: String(formData.get("validFrom") || "") || null,
    validTo: String(formData.get("validTo") || "") || null,
    sourceUrl: String(formData.get("sourceUrl") || "") || null,
    lastVerifiedAt: new Date(),
  });

  revalidatePath("/admin/convenios");
  revalidatePath("/farmacia");
}
