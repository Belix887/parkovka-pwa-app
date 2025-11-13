import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const DEFAULT_STATUSES = [
	"PENDING_VERIFICATION",
	"PENDING_REVIEW",
	"AUTO_REJECTED",
] as const;

export async function GET(request: Request) {
	try {
		const user = await getCurrentUser();
		if (!user || user.role !== "ADMIN") {
			return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
		}

		const url = new URL(request.url);
		const status = url.searchParams.get("status");
		const takeParam = url.searchParams.get("take");
		const take = takeParam ? Math.min(Number(takeParam) || 20, 100) : 20;

		const spots = await prisma.parkingSpot.findMany({
			where: status
				? { status: status as any }
				: { status: { in: DEFAULT_STATUSES as unknown as string[] } },
			orderBy: { createdAt: "desc" },
			take,
			include: {
				owner: true,
				photos: { orderBy: { sortOrder: "asc" }, take: 1 },
				moderationLogs: {
					orderBy: { createdAt: "desc" },
					take: 5,
				},
			},
		} as any);

		return NextResponse.json({
			items: spots.map((spot) => ({
				id: spot.id,
				status: spot.status,
				title: spot.title,
				address: spot.address,
				createdAt: spot.createdAt,
				pricePerHour: spot.pricePerHour,
				owner: spot.owner
					? {
							id: spot.owner.id,
							email: spot.owner.email,
							name: spot.owner.name,
					  }
					: null,
				photo: spot.photos?.[0]?.url ?? null,
				moderationLogs: spot.moderationLogs ?? [],
			})),
		});
	} catch (error: unknown) {
		console.error("[admin spots moderation] list error", error);
		return NextResponse.json(
			{ error: "Не удалось загрузить список" },
			{ status: 500 }
		);
	}
}

