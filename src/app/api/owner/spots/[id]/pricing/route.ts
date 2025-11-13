import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
	pricePerHour: z.number().int().positive().max(1_000_000),
});

export async function PATCH(
	req: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const user = await getCurrentUser();
		if (!user || user.role !== "OWNER") {
			return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
		}

		const { id } = params;
		const body = await req.json();
		const parsed = updateSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Некорректные данные", details: parsed.error.errors },
				{ status: 400 }
			);
		}

		const spot = await prisma.parkingSpot.findUnique({ where: { id } });
		if (!spot || spot.ownerId !== user.id) {
			return NextResponse.json({ error: "Место не найдено" }, { status: 404 });
		}

		const updated = await prisma.parkingSpot.update({
			where: { id },
			data: { pricePerHour: parsed.data.pricePerHour },
		});

		return NextResponse.json({
			id: updated.id,
			pricePerHour: updated.pricePerHour,
		});
	} catch (error: unknown) {
		console.error("update pricing error:", error);
		return NextResponse.json(
			{ error: "Не удалось обновить тариф" },
			{ status: 500 }
		);
	}
}

