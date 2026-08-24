import { NextRequest, NextResponse } from "next/server";
import { isValidSessionEdge } from "@/lib/auth-edge";

const PUBLIC_PATHS = ["/pin", "/api/pin", "/manifest.json"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic =
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/_next");

  if (isPublic) return NextResponse.next();

  const cookie = req.cookies.get("tl_session")?.value;
  const secret = process.env.SESSION_SECRET || "dev-secret";
  const valid = await isValidSessionEdge(cookie, secret);

  if (!valid) {
    const url = req.nextUrl.clone();
    url.pathname = "/pin";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
