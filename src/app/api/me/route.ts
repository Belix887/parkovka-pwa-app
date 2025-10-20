import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  return NextResponse.json({ id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  const body = await req.json();
  const name = typeof body.name === 'string' ? body.name : undefined;
  const phone = typeof body.phone === 'string' ? body.phone : undefined;
  const updated = await prisma.user.update({ where: { id: user.id }, data: { name, phone } } as any);
  return NextResponse.json({ id: updated.id, email: updated.email, name: updated.name, phone: updated.phone });
}


