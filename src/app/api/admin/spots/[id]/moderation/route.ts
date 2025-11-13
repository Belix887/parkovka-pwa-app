import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
	status: z.enum(["APPROVED", "REJECTED", "AUTO_REJECTED", "AUTO_APPROVED", "PENDING_REVIEW"]),
	notes: z.string().max(500).optional(),
});

export async function PATCH(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const user = await getCurrentUser();
		if (!user || user.role !== "ADMIN") {
			return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
		}

		const body = await request.json();
		const parsed = updateSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Некорректные данные", details: parsed.error.flatten() },
				{ status: 400 }
			);
		}

		const booking = await prisma.parkingSpot.findUnique({
			where: { id: params.id },
		});
		if (!booking) {
			return NextResponse.json({ error: "Место не найдено" }, { status: 404 });
		}

		const previousStatus = booking.status;
		const nextStatus = parsed.data.status;

		const updated = await prisma.parkingSpot.update({
			where: { id: params.id },
			data: { status: nextStatus },
		});

		const decision =
			nextStatus === "APPROVED" || nextStatus === "AUTO_APPROVED"
				? "MANUAL_APPROVED"
				: nextStatus === "REJECTED" || nextStatus === "AUTO_REJECTED"
				? "MANUAL_REJECTED"
				: "AUTO_FLAGGED";

		await prisma.spotModerationLog.create({
			data: {
				spotId: updated.id,
				decision,
				statusBefore: previousStatus,
				statusAfter: nextStatus,
				auto: false,
				reviewerId: user.id,
				notes: parsed.data.notes,
			},
		} as any);

		return NextResponse.json({
			id: updated.id,
			status: updated.status,
		});
	} catch (error: unknown) {
		console.error("[admin spot moderation] update error", error);
		return NextResponse.json(
			{ error: "Не удалось обновить статус" },
			{ status: 500 }
		);
	}
}

