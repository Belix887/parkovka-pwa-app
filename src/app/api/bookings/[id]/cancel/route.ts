import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const b = await prisma.booking.findUnique({ where: { id } });
	if (!b) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
	const minutes = Math.floor((b.startAt.getTime() - Date.now()) / (1000 * 60));
	const refundEligible = minutes >= 60;
	const updated = await prisma.booking.update({ where: { id }, data: { status: "CANCELLED" } });
	return NextResponse.json({ id: updated.id, status: updated.status, refundEligible });
}


