import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const createSchema = z.object({
	renterId: z.string().min(1),
	reason: z.string().max(500).optional(),
});

const deleteSchema = z.object({
	id: z.string().min(1),
});

export async function GET() {
	try {
		const user = await getCurrentUser();
		if (!user || user.role !== "OWNER") {
			return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
		}

		const entries = await prisma.blacklistEntry.findMany({
			where: { ownerId: user.id },
			include: { renter: true },
			orderBy: { createdAt: "desc" },
		});

		return NextResponse.json(
			entries.map((entry) => ({
				id: entry.id,
				renterId: entry.renterId,
				renterName: entry.renter?.name || entry.renter?.email || "Арендатор",
				reason: entry.reason || "Не указано",
				createdAt: entry.createdAt,
			}))
		);
	} catch (error: unknown) {
		console.error("blacklist fetch error:", error);
		return NextResponse.json(
			{ error: "Не удалось загрузить черный список" },
			{ status: 500 }
		);
	}
}

export async function POST(req: Request) {
	try {
		const user = await getCurrentUser();
		if (!user || user.role !== "OWNER") {
			return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
		}

		const body = await req.json();
		const parsed = createSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Некорректные данные", details: parsed.error.errors },
				{ status: 400 }
			);
		}

		// избегаем дублей
		const existing = await prisma.blacklistEntry.findMany({
			where: { ownerId: user.id, renterId: parsed.data.renterId },
			take: 1,
		});
		if (existing.length > 0) {
			return NextResponse.json(
				{ error: "Арендатор уже в черном списке" },
				{ status: 409 }
			);
		}

		const entry = await prisma.blacklistEntry.create({
			data: {
				ownerId: user.id,
				renterId: parsed.data.renterId,
				reason: parsed.data.reason,
			},
			include: { renter: true },
		});

		return NextResponse.json({
			id: entry.id,
			renterId: entry.renterId,
			renterName: entry.renter?.name || entry.renter?.email || "Арендатор",
			reason: entry.reason || "Не указано",
			createdAt: entry.createdAt,
		});
	} catch (error: unknown) {
		console.error("blacklist create error:", error);
		return NextResponse.json(
			{ error: "Не удалось добавить в черный список" },
			{ status: 500 }
		);
	}
}

export async function DELETE(req: Request) {
	try {
		const user = await getCurrentUser();
		if (!user || user.role !== "OWNER") {
			return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
		}

		const body = await req.json();
		const parsed = deleteSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Некорректные данные", details: parsed.error.errors },
				{ status: 400 }
			);
		}

		const entry = await prisma.blacklistEntry.findUnique({
			where: { id: parsed.data.id },
		});
		if (!entry || entry.ownerId !== user.id) {
			return NextResponse.json({ error: "Запись не найдена" }, { status: 404 });
		}

		await prisma.blacklistEntry.delete({ where: { id: parsed.data.id } });
		return NextResponse.json({ success: true });
	} catch (error: unknown) {
		console.error("blacklist delete error:", error);
		return NextResponse.json(
			{ error: "Не удалось удалить запись из черного списка" },
			{ status: 500 }
		);
	}
}

