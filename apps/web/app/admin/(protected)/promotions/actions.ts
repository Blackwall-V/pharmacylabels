"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/src/db";
import { promotions } from "@/src/db/schema";
import { verifyAdminSession } from "@/src/lib/session";
import {
  parseId,
  parseRequiredName,
  parseOptionalText,
  parseOptionalUrl,
  parseOptionalDate,
  parseEnum,
  PROMOTION_SCOPES,
  DISCOUNT_TYPES,
} from "@/src/lib/validation";

export async function createPromotion(formData: FormData) {
  if (!(await verifyAdminSession())) throw new Error("Unauthorized");

  const chainId = parseId(formData.get("chainId"));
  const title = parseRequiredName(formData.get("title"));
  const scope = parseEnum(formData.get("scope"), PROMOTION_SCOPES);
  if (!chainId || !title || !scope) return;

  const daysRaw = formData.getAll("daysOfWeek") as string[];
  const daysOfWeek = daysRaw
    .map(Number)
    .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6);

  const discountValueRaw = formData.get("discountValue");
  const discountValue =
    discountValueRaw && Number.isFinite(Number(discountValueRaw)) ? Number(discountValueRaw) : null;

  await db.insert(promotions).values({
    chainId,
    title,
    description: parseOptionalText(formData.get("description")),
    scope,
    category: parseOptionalText(formData.get("category"), 150),
    discountType: parseEnum(formData.get("discountType"), DISCOUNT_TYPES),
    discountValue,
    daysOfWeek: daysOfWeek.length ? daysOfWeek : null,
    validFrom: parseOptionalDate(formData.get("validFrom")),
    validTo: parseOptionalDate(formData.get("validTo")),
    requiresConvenio: formData.get("requiresConvenio") === "on",
    sourceUrl: parseOptionalUrl(formData.get("sourceUrl")),
    lastVerifiedAt: new Date(),
  });

  revalidatePath("/admin/promotions");
  revalidatePath("/promociones");
}
