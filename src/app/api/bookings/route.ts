import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookingCreateSchema } from "@/lib/validation";
import { validateBookingWindow } from "@/lib/availability";
import { calcPricing } from "@/lib/pricing";

export async function POST(req: Request) {
	const body = await req.json();
	const parsed = bookingCreateSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });

	const startAt = new Date(parsed.data.startAt);
	const endAt = new Date(parsed.data.endAt);
	const hours = validateBookingWindow(startAt, endAt);

	const spot = await prisma.parkingSpot.findUnique({ where: { id: parsed.data.spotId } });
	if (!spot || spot.status !== "APPROVED") return NextResponse.json({ error: "Место недоступно" }, { status: 404 });

	const { totalPrice, commissionAmount, ownerAmount, commissionPct } = calcPricing(hours, spot.pricePerHour, 10);

	const booking = await prisma.booking.create({
		data: {
			spotId: spot.id,
			renterId: "REPLACE_WITH_AUTH_USER_ID",
			startAt,
			endAt,
			status: "PENDING",
			totalPrice, commissionAmount, ownerAmount, commissionPct,
		},
	});

	return NextResponse.json({ id: booking.id, status: booking.status, totalPrice });
}

export async function GET() {
	return NextResponse.json({ bookings: [] });
}


