export const REGULATORY_CLASSES = ["venta_libre", "receta_simple", "receta_retenida"] as const;
export type RegulatoryClass = (typeof REGULATORY_CLASSES)[number];

export const PROMOTION_SCOPES = ["chain_wide", "category", "specific_medications"] as const;
export type PromotionScope = (typeof PROMOTION_SCOPES)[number];

export const DISCOUNT_TYPES = ["percentage", "fixed_amount", "nx_price"] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

const MAX_TEXT_LENGTH = 2000;
const MAX_NAME_LENGTH = 300;

export function parseEnum<T extends string>(
  value: FormDataEntryValue | null,
  allowed: readonly T[],
): T | null {
  const str = String(value ?? "");
  return (allowed as readonly string[]).includes(str) ? (str as T) : null;
}

/** Trims and caps length; returns null for empty input so callers can store NULL instead of "". */
export function parseOptionalText(value: FormDataEntryValue | null, maxLength = MAX_TEXT_LENGTH): string | null {
  const str = String(value ?? "").trim();
  if (!str) return null;
  return str.slice(0, maxLength);
}

export function parseRequiredName(value: FormDataEntryValue | null, maxLength = MAX_NAME_LENGTH): string | null {
  const str = String(value ?? "").trim();
  if (!str) return null;
  return str.slice(0, maxLength);
}

/** A positive integer ID, or null if the input isn't one -- guards against NaN reaching a query. */
export function parseId(value: FormDataEntryValue | null): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** Only accepts http(s) URLs -- rejects javascript: and other schemes before they can reach an <a href>. */
export function parseOptionalUrl(value: FormDataEntryValue | null): string | null {
  const str = String(value ?? "").trim();
  if (!str) return null;
  try {
    const url = new URL(str);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString().slice(0, 500);
  } catch {
    return null;
  }
}

export function parseOptionalDate(value: FormDataEntryValue | null): string | null {
  const str = String(value ?? "").trim();
  if (!str) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(str) ? str : null;
}

/**
 * Only allow same-origin, absolute-path redirect targets (e.g. "/admin/medications").
 * Rejects protocol-relative ("//evil.com") and absolute URLs to prevent the login
 * form's `next` parameter from being used as an open redirect.
 */
export function parseSafeRedirectPath(value: FormDataEntryValue | string | null, fallback: string): string {
  const str = String(value ?? "");
  if (str.startsWith("/") && !str.startsWith("//") && !str.includes("\\")) {
    return str;
  }
  return fallback;
}
