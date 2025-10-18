import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation";
import { authenticate } from "@/lib/auth";
import { createSession, getSessionCookie } from "@/lib/session";

export async function POST(req: Request) {
	const body = await req.json();
	if (body && typeof body.email === "string") body.email = body.email.trim().toLowerCase();
	const parsed = loginSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });

	const user = await authenticate(parsed.data.email.trim().toLowerCase(), parsed.data.password);
	if (!user) return NextResponse.json({ error: "Неверные email или пароль" }, { status: 401 });

    const token = await createSession({ id: user.id, role: user.role, email: user.email });
    const res = NextResponse.json({ ok: true, user: { id: user.id, role: user.role, email: user.email } });
    res.headers.append("Set-Cookie", getSessionCookie(token));
    return res;
}


