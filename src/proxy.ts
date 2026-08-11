import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

const ADMIN_PATHS = ["/admin"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdmin = ADMIN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!isAdmin) return NextResponse.next();

  // Allow login page through
  if (pathname === "/admin/login") return NextResponse.next();

  const token = req.cookies.get("fgr_token")?.value;
  const session = token ? await verifyToken(token) : null;

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
