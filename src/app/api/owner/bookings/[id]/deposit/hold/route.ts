import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const payloadSchema = z.object({
	depositAmount: z.number().int().min(0).optional(),
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

		const json = await request.json().catch(() => ({}));
		const parsed = payloadSchema.safeParse(json);
		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Некорректные данные", details: parsed.error.flatten() },
				{ status: 400 }
			);
		}

		const depositAmount =
			parsed.data.depositAmount !== undefined
				? parsed.data.depositAmount
				: booking.depositAmount;

		await prisma.booking.update({
			where: { id: booking.id },
			data: {
				depositAmount,
				depositStatus: depositAmount > 0 ? "HELD" : "NOT_REQUIRED",
				disputeOpenedAt: new Date(),
				penaltyReason: parsed.data.reason ?? booking.penaltyReason,
			},
		});

		if (depositAmount > 0) {
			await prisma.depositTransaction.create({
				data: {
					bookingId: booking.id,
					type: "HOLD",
					amount: depositAmount,
					description: parsed.data.reason ?? "Депозит заблокирован владельцем",
					createdById: user.id,
				},
			});
		}

		return NextResponse.json({ success: true });
	} catch (error: unknown) {
		console.error("[deposit hold]", error);
		return NextResponse.json(
			{ error: "Не удалось заблокировать депозит" },
			{ status: 500 }
		);
	}
}

