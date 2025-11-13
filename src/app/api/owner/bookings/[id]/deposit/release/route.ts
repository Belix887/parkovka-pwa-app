import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
	_request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const user = await getCurrentUser();
		if (!user || user.role !== "OWNER") {
			return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
		}

		const booking = await prisma.booking.findUnique({
			where: { id: params.id },
			include: { spot: true },
		});
		if (!booking || booking.spot.ownerId !== user.id) {
			return NextResponse.json({ error: "Бронирование не найдено" }, { status: 404 });
		}

		if (booking.depositStatus !== "HELD" && booking.depositStatus !== "PARTIALLY_RELEASED") {
			return NextResponse.json(
				{ error: "Депозит не находится в удержании" },
				{ status: 400 }
			);
		}

		await prisma.booking.update({
			where: { id: booking.id },
			data: {
				depositStatus: "RELEASED",
				penaltyAmount: 0,
				penaltyReason: null,
				disputeResolvedAt: new Date(),
			},
		});

		await prisma.depositTransaction.create({
			data: {
				bookingId: booking.id,
				type: "RELEASE",
				amount: booking.depositAmount,
				description: "Депозит возвращен владельцем",
				createdById: user.id,
			},
		});

		return NextResponse.json({ success: true });
	} catch (error: unknown) {
		console.error("[deposit release]", error);
		return NextResponse.json(
			{ error: "Не удалось обновить депозит" },
			{ status: 500 }
		);
	}
}

