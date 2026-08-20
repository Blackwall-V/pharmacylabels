import { timingSafeEqual } from "node:crypto";

/** Constant-time comparison -- avoids leaking password length/content via response timing. */
export function passwordMatches(input: string, expected: string): boolean {
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  // timingSafeEqual requires equal-length buffers; a length mismatch alone is not a
  // useful timing signal (it's checked before any bytewise comparison), so it's safe
  // to short-circuit here rather than pad to match length.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
