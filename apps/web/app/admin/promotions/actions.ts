"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/src/db";
import { promotions } from "@/src/db/schema";

// NOTE: MVP has no admin auth yet -- see plan Milestone 4. Do not expose this route
// publicly without adding session auth first.

export async function createPromotion(formData: FormData) {
  const daysRaw = formData.getAll("daysOfWeek") as string[];

  await db.insert(promotions).values({
    chainId: Number(formData.get("chainId")),
    title: String(formData.get("title")),
    description: String(formData.get("description") || "") || null,
    scope: formData.get("scope") as "chain_wide" | "category" | "specific_medications",
    category: String(formData.get("category") || "") || null,
    discountType: (formData.get("discountType") as "percentage" | "fixed_amount" | "nx_price") || null,
    discountValue: formData.get("discountValue") ? Number(formData.get("discountValue")) : null,
    daysOfWeek: daysRaw.length ? daysRaw.map(Number) : null,
    validFrom: String(formData.get("validFrom") || "") || null,
    validTo: String(formData.get("validTo") || "") || null,
    requiresConvenio: formData.get("requiresConvenio") === "on",
    sourceUrl: String(formData.get("sourceUrl") || "") || null,
    lastVerifiedAt: new Date(),
  });

  revalidatePath("/admin/promotions");
  revalidatePath("/promociones");
}
