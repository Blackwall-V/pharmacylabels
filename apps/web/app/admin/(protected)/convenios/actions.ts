"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/src/db";
import { chainConvenios } from "@/src/db/schema";
import { verifyAdminSession } from "@/src/lib/session";
import { parseId, parseOptionalText, parseOptionalUrl, parseOptionalDate } from "@/src/lib/validation";

export async function createConvenio(formData: FormData) {
  if (!(await verifyAdminSession())) throw new Error("Unauthorized");

  const chainId = parseId(formData.get("chainId"));
  const cajaId = parseId(formData.get("cajaId"));
  if (!chainId || !cajaId) return;

  await db.insert(chainConvenios).values({
    chainId,
    cajaId,
    description: parseOptionalText(formData.get("description")),
    validFrom: parseOptionalDate(formData.get("validFrom")),
    validTo: parseOptionalDate(formData.get("validTo")),
    sourceUrl: parseOptionalUrl(formData.get("sourceUrl")),
    lastVerifiedAt: new Date(),
  });

  revalidatePath("/admin/convenios");
  revalidatePath("/farmacia");
}
