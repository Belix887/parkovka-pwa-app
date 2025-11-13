import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const payloadSchema = z.object({
	penaltyAmount: z.number().int().min(0).optional(),
	reason: z.string().max(500).optional(),
});

export async function POST(
	request: Request,
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

		if (
			booking.depositStatus !== "HELD" &&
			booking.depositStatus !== "PARTIALLY_RELEASED" &&
			booking.depositStatus !== "PENDING"
		) {
			return NextResponse.json(
				{ error: "Депозит не удерживается и не может быть списан" },
				{ status: 400 }
			);
		}

		const json = await request.json().catch(() => ({}));
		const parsed = payloadSchema.safeParse(json);
		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Некорректные данные", details: parsed.error.flatten() },
				{ status: 400 }
			);
		}

		const penaltyAmount =
			parsed.data.penaltyAmount !== undefined
				? Math.min(parsed.data.penaltyAmount, booking.depositAmount)
				: booking.depositAmount;

		await prisma.booking.update({
			where: { id: booking.id },
			data: {
				depositStatus: "FORFEITED",
				penaltyAmount,
				penaltyReason: parsed.data.reason ?? "Средства удержаны владельцем",
				disputeResolvedAt: new Date(),
			},
		});

		await prisma.depositTransaction.create({
			data: {
				bookingId: booking.id,
				type: "FORFEIT",
				amount: penaltyAmount,
				description: parsed.data.reason ?? "Депозит удержан владельцем",
				createdById: user.id,
			},
		});

		return NextResponse.json({ success: true });
	} catch (error: unknown) {
		console.error("[deposit forfeit]", error);
		return NextResponse.json(
			{ error: "Не удалось удержать депозит" },
			{ status: 500 }
		);
	}
}

