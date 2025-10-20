import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendEmail } from "@/lib/notifications";

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
    const { id } = await params;
	const b = await prisma.booking.findUnique({ where: { id } });
	if (!b) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
    if (b.renterId !== user.id) return NextResponse.json({ error: "Нет прав" }, { status: 403 });
	const minutes = Math.floor((b.startAt.getTime() - Date.now()) / (1000 * 60));
	const refundEligible = minutes >= 60;
	const updated = await prisma.booking.update({ where: { id }, data: { status: "CANCELLED" } });
    try {
        const owner = await prisma.user.findUnique({ where: { id: (await prisma.parkingSpot.findUnique({ where: { id: b.spotId } }))!.ownerId } });
        if (owner?.email) await sendEmail(owner.email, "Бронирование отменено", `<p>Арендатор отменил бронь.</p>`);
    } catch {}
	return NextResponse.json({ id: updated.id, status: updated.status, refundEligible });
}


