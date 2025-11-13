import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";

export async function authenticate(email: string, password: string) {
	const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
	if (!user) return null;
    let ok = false;
    // Если используется мок-репозиторий или сохранён не-bcrypt хеш, допускаем простое сравнение
    if (typeof user.passwordHash === "string" && user.passwordHash.startsWith("$2")) {
        ok = await compare(password, user.passwordHash);
    } else {
        ok = password === user.passwordHash;
    }
	return ok ? user : null;
}

export async function getCurrentUser() {
	const cookieStore = await cookies();
	const cookie = cookieStore.get("session");
	if (!cookie) return null;
	const payload = await verifySession(cookie.value);
	if (!payload?.sub) return null;

	const user = await prisma.user.findUnique({ where: { id: String(payload.sub) } });
	if (!user) return null;

	// обновляем роль/почту в payload при необходимости
	return user;
}

export async function requireUser() {
	const user = await getCurrentUser();
	if (!user) throw new Error("UNAUTHORIZED");
	return user;
}

export function restrictToRoles<T extends { role: string }>(user: T, roles: string[]) {
	if (!roles.includes(user.role)) {
		throw new Error("FORBIDDEN");
	}
	return user;
}


