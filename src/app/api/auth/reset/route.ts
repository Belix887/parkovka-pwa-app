import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token, newPassword } = await req.json();
  if (!token || !newPassword) return NextResponse.json({ error: "Требуется токен и пароль" }, { status: 400 });
  // Заглушка: валидация токена и смена пароля
  return NextResponse.json({ ok: true });
}


