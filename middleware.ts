import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const RATE_LIMIT = 100; // naive per ip per 10 min in-memory
const WINDOW_MS = 10 * 60 * 1000;
const store = new Map<string, { count: number; ts: number }>();

export function middleware(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = (forwarded ? forwarded.split(",")[0] : req.headers.get("x-real-ip")) || "unknown";
  const now = Date.now();
  const cur = store.get(ip as string);
  if (!cur || now - cur.ts > WINDOW_MS) {
    store.set(ip as string, { count: 1, ts: now });
  } else {
    cur.count += 1;
    if (cur.count > RATE_LIMIT) return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }
  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "no-referrer");
  res.headers.set("Permissions-Policy", "geolocation=(self)");
  return res;
}

export const config = {
  matcher: ["/api/:path*"],
};


