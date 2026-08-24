import { NextRequest, NextResponse } from "next/server";
import { verifyPin, createSessionValue, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { pin } = await req.json();

  if (typeof pin !== "string" || !verifyPin(pin)) {
    return NextResponse.json({ error: "PIN이 올바르지 않아요." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, createSessionValue(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return res;
}
