import { describe, it, expect } from "vitest";
import {
  parseEnum,
  parseOptionalText,
  parseRequiredName,
  parseId,
  parseOptionalDate,
  parseOptionalUrl,
  parseSafeRedirectPath,
  REGULATORY_CLASSES,
} from "../validation";

describe("parseEnum", () => {
  it("accepts a value in the allowed set", () => {
    expect(parseEnum("receta_simple", REGULATORY_CLASSES)).toBe("receta_simple");
  });

  it("rejects a value outside the allowed set instead of passing it through", () => {
    expect(parseEnum("DROP TABLE medications;", REGULATORY_CLASSES)).toBeNull();
  });

  it("rejects null/missing form field", () => {
    expect(parseEnum(null, REGULATORY_CLASSES)).toBeNull();
  });
});

describe("parseOptionalText", () => {
  it("trims whitespace", () => {
    expect(parseOptionalText("  hola  ")).toBe("hola");
  });

  it("returns null for empty/whitespace-only input", () => {
    expect(parseOptionalText("   ")).toBeNull();
    expect(parseOptionalText(null)).toBeNull();
  });

  it("caps length instead of accepting unbounded input", () => {
    const huge = "a".repeat(5000);
    expect(parseOptionalText(huge, 10)?.length).toBe(10);
  });
});

describe("parseRequiredName", () => {
  it("returns null for empty input", () => {
    expect(parseRequiredName("")).toBeNull();
    expect(parseRequiredName("   ")).toBeNull();
  });

  it("caps length", () => {
    const huge = "a".repeat(1000);
    expect(parseRequiredName(huge, 50)?.length).toBe(50);
  });
});

describe("parseId", () => {
  it("accepts a positive integer", () => {
    expect(parseId("42")).toBe(42);
  });

  it("rejects non-numeric input instead of letting NaN reach a query", () => {
    expect(parseId("not-a-number")).toBeNull();
  });

  it("rejects zero and negative numbers", () => {
    expect(parseId("0")).toBeNull();
    expect(parseId("-5")).toBeNull();
  });

  it("rejects decimals", () => {
    expect(parseId("1.5")).toBeNull();
  });

  it("rejects null/missing field", () => {
    expect(parseId(null)).toBeNull();
  });
});

describe("parseOptionalDate", () => {
  it("accepts a well-formed ISO date", () => {
    expect(parseOptionalDate("2026-08-31")).toBe("2026-08-31");
  });

  it("rejects malformed dates instead of passing them to the database", () => {
    expect(parseOptionalDate("not-a-date")).toBeNull();
    expect(parseOptionalDate("31-08-2026")).toBeNull();
    expect(parseOptionalDate("2026/08/31")).toBeNull();
  });

  it("returns null for empty input", () => {
    expect(parseOptionalDate("")).toBeNull();
  });
});

describe("parseOptionalUrl", () => {
  it("accepts http and https URLs", () => {
    expect(parseOptionalUrl("https://salcobrand.cl/promo")).toBe("https://salcobrand.cl/promo");
  });

  it("rejects javascript: URLs (XSS vector if ever rendered as an href)", () => {
    expect(parseOptionalUrl("javascript:alert(1)")).toBeNull();
  });

  it("rejects data: and other non-http schemes", () => {
    expect(parseOptionalUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
    expect(parseOptionalUrl("ftp://example.com/file")).toBeNull();
  });

  it("rejects malformed input instead of throwing", () => {
    expect(parseOptionalUrl("not a url")).toBeNull();
  });

  it("returns null for empty input", () => {
    expect(parseOptionalUrl("")).toBeNull();
  });
});

describe("parseSafeRedirectPath", () => {
  it("accepts a same-origin absolute path", () => {
    expect(parseSafeRedirectPath("/admin/medications", "/fallback")).toBe("/admin/medications");
  });

  it("falls back for a protocol-relative URL (the classic open-redirect bypass)", () => {
    expect(parseSafeRedirectPath("//evil.example.com", "/fallback")).toBe("/fallback");
  });

  it("falls back for an absolute URL to another host", () => {
    expect(parseSafeRedirectPath("https://evil.example.com", "/fallback")).toBe("/fallback");
  });

  it("falls back for a path missing the leading slash", () => {
    expect(parseSafeRedirectPath("admin/medications", "/fallback")).toBe("/fallback");
  });

  it("falls back when the value contains a backslash (browsers sometimes treat it as a slash)", () => {
    expect(parseSafeRedirectPath("/\\evil.example.com", "/fallback")).toBe("/fallback");
  });
});
