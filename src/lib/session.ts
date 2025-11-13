import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");
const cookieName = "session";

export async function createSession(user: { id: string; role: string; email: string }) {
	const token = await new SignJWT({ sub: user.id, role: user.role, email: user.email })
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("7d")
		.sign(secret);
	return token;
}

export interface SessionPayload {
	sub: string;
	role: string;
	email: string;
	iat: number;
	exp: number;
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
	try {
		const { payload } = await jwtVerify(token, secret);
		return payload as SessionPayload;
	} catch {
		return null;
	}
}

export function getSessionCookie(token: string) {
	const week = 7 * 24 * 60 * 60;
    const isProd = process.env.NODE_ENV === "production";
    const parts = [
        `${cookieName}=${token}`,
        "Path=/",
        `Max-Age=${week}`,
        "HttpOnly",
        "SameSite=Lax",
    ];
    if (isProd) parts.push("Secure");
    return parts.join("; ");
}


