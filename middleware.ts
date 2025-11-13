import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/session";

type Role = "RENTER" | "OWNER" | "ADMIN";

const RATE_LIMITS: Record<string, { windowMs: number; limit: number }> = {
	"POST:/api/auth/login": { windowMs: 5 * 60 * 1000, limit: 20 },
	"POST:/api/auth/register": { windowMs: 5 * 60 * 1000, limit: 20 },
	"POST:/api/auth/forgot": { windowMs: 5 * 60 * 1000, limit: 10 },
	"POST:/api/bookings": { windowMs: 60 * 1000, limit: 30 },
	"POST:/api/owner/bookings": { windowMs: 60 * 1000, limit: 20 },
};

const DEFAULT_RATE_LIMIT = { windowMs: 10 * 60 * 1000, limit: 200 };
const COUNTER = new Map<string, { count: number; ts: number }>();

const PUBLIC_PATHS = [
	"/",
	"/login",
	"/register",
	"/forgot",
	"/catalog",
	"/map",
	"/api/spots",
	"/api/spots/map",
	"/api/auth/login",
	"/api/auth/register",
	"/api/auth/forgot",
];

const ROLE_RULES: Array<{
	prefix: string;
	methods?: string[];
	roles: Role[];
}> = [
	{ prefix: "/api/owner", roles: ["OWNER", "ADMIN"] },
	{ prefix: "/api/admin", roles: ["ADMIN"] },
	{ prefix: "/api/bookings", roles: ["RENTER", "OWNER", "ADMIN"] },
	{ prefix: "/owner", roles: ["OWNER", "ADMIN"] },
	{ prefix: "/admin", roles: ["ADMIN"] },
];

function getClientIp(req: NextRequest) {
	const forwarded = req.headers.get("x-forwarded-for");
	return (forwarded ? forwarded.split(",")[0] : req.headers.get("x-real-ip")) || req.ip || "unknown";
}

function checkRateLimit(identifier: string, config = DEFAULT_RATE_LIMIT) {
	const now = Date.now();
	const entry = COUNTER.get(identifier);
	if (!entry || now - entry.ts > config.windowMs) {
		COUNTER.set(identifier, { count: 1, ts: now });
		return true;
	}
	entry.count += 1;
	if (entry.count > config.limit) {
		return false;
	}
	return true;
}

export async function middleware(req: NextRequest) {
	const url = new URL(req.url);
	const pathname = url.pathname;

	// Rate limiting
	const rateKey = `${req.method}:${pathname}`;
	const limitConfig = RATE_LIMITS[rateKey] ?? DEFAULT_RATE_LIMIT;
	const ip = getClientIp(req);
	if (!checkRateLimit(`${rateKey}:${ip}`, limitConfig)) {
		return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
	}

	// short-circuit for public paths
	if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + "/"))) {
		return NextResponse.next();
	}

	const sessionToken = req.cookies.get("session")?.value;
	const session = sessionToken ? await verifySession(sessionToken) : null;

	// Require authentication for non-public routes
	if (!session) {
		if (pathname.startsWith("/api/")) {
			return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
		}
		return NextResponse.redirect(new URL("/login", req.url));
	}

	// role-based access control
	const rule = ROLE_RULES.find((r) => pathname.startsWith(r.prefix));
	if (rule) {
		if (rule.methods && !rule.methods.includes(req.method)) {
			return NextResponse.json({ error: "Метод не разрешен" }, { status: 405 });
		}
		if (!rule.roles.includes(session.user.role as Role)) {
			return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
		}
	}

	const res = NextResponse.next();
	res.headers.set("X-Frame-Options", "DENY");
	res.headers.set("X-Content-Type-Options", "nosniff");
	res.headers.set("Referrer-Policy", "no-referrer");
	res.headers.set("Permissions-Policy", "geolocation=(self)");
	return res;
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
