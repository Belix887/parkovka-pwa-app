import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Требуется email" }, { status: 400 });
  // Заглушка: обычно тут генерируется токен и отправляется письмо
  return NextResponse.json({ ok: true });
}


