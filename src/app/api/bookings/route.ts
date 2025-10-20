import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookingCreateSchema } from "@/lib/validation";
import { validateBookingWindow } from "@/lib/availability";
import { calcPricing } from "@/lib/pricing";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });

    const body = await req.json();
    const parsed = bookingCreateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });

	const startAt = new Date(parsed.data.startAt);
	const endAt = new Date(parsed.data.endAt);
	const hours = validateBookingWindow(startAt, endAt);

    const spot = await prisma.parkingSpot.findUnique({ where: { id: parsed.data.spotId } });
	if (!spot || spot.status !== "APPROVED") return NextResponse.json({ error: "Место недоступно" }, { status: 404 });

    // Конфликты с существующими бронями
    const overlap = await (prisma as any).booking.findMany({
        where: {
            spotId: spot.id,
            status: { in: ["PENDING", "APPROVED", "PAID"] },
            OR: [
                { startAt: { lt: endAt }, endAt: { gt: startAt } },
            ],
        },
    });
    if (overlap && overlap.length) return NextResponse.json({ error: "Конфликт с существующей бронью" }, { status: 409 });

	const { totalPrice, commissionAmount, ownerAmount, commissionPct } = calcPricing(hours, spot.pricePerHour, 10);

	const booking = await prisma.booking.create({
		data: {
			spotId: spot.id,
            renterId: user.id,
			startAt,
			endAt,
			status: "PENDING",
			totalPrice, commissionAmount, ownerAmount, commissionPct,
		},
	});

	return NextResponse.json({ id: booking.id, status: booking.status, totalPrice });
}

export async function GET() {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });

    // Список броней текущего пользователя (как арендатора)
    const bookings = await (prisma as any).booking.findMany({
        where: { renterId: user.id },
        include: { spot: true },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookings });
}


