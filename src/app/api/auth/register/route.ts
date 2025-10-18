import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { registerSchema } from "@/lib/validation";
import { createSession, getSessionCookie } from "@/lib/session";

export async function POST(req: Request) {
	try {
    const data = await req.json();
    // Нормализуем email
    if (data && typeof data.email === "string") data.email = data.email.trim().toLowerCase();
    const parsed = registerSchema.safeParse(data);
		if (!parsed.success) return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });

		const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
		if (exists) return NextResponse.json({ error: "Пользователь уже существует" }, { status: 409 });

        const passwordHash = process.env.USE_MOCKS === "1" ? parsed.data.password : await hash(parsed.data.password, 10);
		const user = await prisma.user.create({
			data: {
            email: parsed.data.email.trim().toLowerCase(),
				passwordHash,
				name: parsed.data.name,
				phone: parsed.data.phone,
				role: "RENTER",
			},
		});

		// Создаём сессию сразу после регистрации
		const token = await createSession({ id: user.id, role: user.role, email: user.email });
		const res = NextResponse.json({ id: user.id, email: user.email });
		res.headers.append("Set-Cookie", getSessionCookie(token));
		return res;
	} catch (err: any) {
		console.error("Register error:", err);
		return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
	}
}


