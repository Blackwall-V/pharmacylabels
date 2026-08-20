/** Strips accents, punctuation and pack-size/brand noise so fuzzy matching has less to fight. */
export function normalizeProductName(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents (combining diacritical marks)
    .toLowerCase()
    .replace(/(\d+)\s*mg/g, "$1mg")
    .replace(/(\d+)\s*ml/g, "$1ml")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
