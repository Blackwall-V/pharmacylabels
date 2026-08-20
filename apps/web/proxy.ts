import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminSession } from "@/src/lib/session";

// Optimistic check only (reads the signed cookie, no DB round-trip) -- every admin
// Server Action also calls verifyAdminSession() itself as the real authorization gate.
// See the Next.js authentication guide's "Optimistic checks with Proxy" section.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const isAuthed = await verifyAdminSession();
    if (!isAuthed) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
