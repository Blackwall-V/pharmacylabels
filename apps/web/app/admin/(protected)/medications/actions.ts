"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/src/db";
import { medications } from "@/src/db/schema";
import { verifyAdminSession } from "@/src/lib/session";
import { slugify } from "@/src/lib/slugify";
import {
  parseId,
  parseRequiredName,
  parseOptionalText,
  parseOptionalUrl,
  parseEnum,
  REGULATORY_CLASSES,
} from "@/src/lib/validation";

export async function createMedication(formData: FormData) {
  if (!(await verifyAdminSession())) throw new Error("Unauthorized");

  const canonicalName = parseRequiredName(formData.get("canonicalName"));
  if (!canonicalName) return;

  let slug = slugify(canonicalName);
  const [clash] = await db.select().from(medications).where(eq(medications.slug, slug)).limit(1);
  if (clash) slug = `${slug}-${Date.now()}`;

  const regulatoryClass = parseEnum(formData.get("regulatoryClass"), REGULATORY_CLASSES);

  await db.insert(medications).values({
    slug,
    canonicalName,
    activeIngredient: parseOptionalText(formData.get("activeIngredient"), 200),
    dosage: parseOptionalText(formData.get("dosage"), 100),
    presentation: parseOptionalText(formData.get("presentation"), 100),
    category: parseOptionalText(formData.get("category"), 100),
    imageUrl: parseOptionalUrl(formData.get("imageUrl")),
    regulatoryClass,
    regulatoryClassSource: regulatoryClass ? "manual_curated" : null,
  });

  revalidatePath("/admin/medications");
  revalidatePath("/buscar");
}

export async function updateRegulatoryClass(formData: FormData) {
  if (!(await verifyAdminSession())) throw new Error("Unauthorized");

  const medicationId = parseId(formData.get("medicationId"));
  if (!medicationId) return;

  const regulatoryClass = parseEnum(formData.get("regulatoryClass"), REGULATORY_CLASSES);

  await db
    .update(medications)
    .set({
      regulatoryClass,
      regulatoryClassSource: regulatoryClass ? "manual_curated" : null,
      updatedAt: new Date(),
    })
    .where(eq(medications.id, medicationId));

  revalidatePath("/admin/medications");
  revalidatePath("/buscar");
}

export async function updateImageUrl(formData: FormData) {
  if (!(await verifyAdminSession())) throw new Error("Unauthorized");

  const medicationId = parseId(formData.get("medicationId"));
  if (!medicationId) return;

  await db
    .update(medications)
    .set({ imageUrl: parseOptionalUrl(formData.get("imageUrl")), updatedAt: new Date() })
    .where(eq(medications.id, medicationId));

  revalidatePath("/admin/medications");
  revalidatePath("/buscar");
}
