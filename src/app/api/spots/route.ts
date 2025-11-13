import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { spotCreateSchema } from "@/lib/validation";
import { getCurrentUser } from "@/lib/auth";
import { autoModerateSpot } from "@/lib/moderation";

export async function GET(req: Request) {
	const url = new URL(req.url);
	const page = parseInt(url.searchParams.get("page") || "1", 10);
	const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10), 50);
	const skip = (page - 1) * limit;

	const filters: any = {};
	const nums = (key: string) => (url.searchParams.get(key) ? Number(url.searchParams.get(key)) : undefined);
	const bool = (key: string) => (url.searchParams.get(key) === "true" ? true : url.searchParams.get(key) === "false" ? false : undefined);

	const statusFilter = url.searchParams.get("status");
	if (statusFilter) {
		filters.status = statusFilter;
	} else {
		filters.status = { in: ["APPROVED", "AUTO_APPROVED"] };
	}

	const priceMin = nums("priceMin");
	const priceMax = nums("priceMax");
	if (priceMin || priceMax) filters.pricePerHour = { gte: priceMin ?? undefined, lte: priceMax ?? undefined };

	const covered = bool("covered");
	const guarded = bool("guarded");
	const camera = bool("camera");
	const evCharging = bool("evCharging");
	const disabledAccessible = bool("disabledAccessible");
	const wideEntrance = bool("wideEntrance");
	if (covered !== undefined) filters.covered = covered;
	if (guarded !== undefined) filters.guarded = guarded;
	if (camera !== undefined) filters.camera = camera;
	if (evCharging !== undefined) filters.evCharging = evCharging;
	if (disabledAccessible !== undefined) filters.disabledAccessible = disabledAccessible;
	if (wideEntrance !== undefined) filters.wideEntrance = wideEntrance;

	const accessType = url.searchParams.get("accessType");
	if (accessType) filters.accessType = accessType;

	// Список моих мест (владелец): /api/spots?mine=true
	const mine = url.searchParams.get("mine") === "true";
	if (mine) {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
		const mySpots = await prisma.parkingSpot.findMany({
			where: { ownerId: user.id },
			orderBy: { createdAt: "desc" },
			include: { photos: { orderBy: { sortOrder: "asc" }, take: 1 } },
		} as any);
		return NextResponse.json(mySpots);
	}

	const spots = await prisma.parkingSpot.findMany({
		where: filters,
		skip,
		take: limit,
		orderBy: { createdAt: "desc" },
		include: { photos: { orderBy: { sortOrder: "asc" }, take: 1 } },
	});

	return NextResponse.json(spots);
}

export async function POST(req: Request) {
	const body = await req.json();
	const parsed = spotCreateSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
	const user = await getCurrentUser();
	if (!user) return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });

	const {
		title, description, pricePerHour, sizeL, sizeW, sizeH,
		covered, guarded, camera, evCharging, disabledAccessible, wideEntrance,
		accessType, rules, address, geoLat, geoLng, photos,
	} = parsed.data;

	const baseStatus = "PENDING_VERIFICATION";

	const spot = await prisma.parkingSpot.create({
		data: {
			ownerId: user.id,
			status: baseStatus,
			title, description, pricePerHour, sizeL, sizeW, sizeH,
			covered, guarded, camera, evCharging, disabledAccessible, wideEntrance,
			accessType, rules, address, geoLat, geoLng,
			photos: { create: photos.map((url, i) => ({ url, sortOrder: i })) },
		},
	});

	const autoResult = autoModerateSpot(parsed.data);
	const statusAfter =
		autoResult.status === "PENDING_REVIEW"
			? "PENDING_REVIEW"
			: autoResult.status;

	const finalSpot =
		statusAfter === baseStatus
			? spot
			: await prisma.parkingSpot.update({
					where: { id: spot.id },
					data: { status: statusAfter },
			  });

	await prisma.spotModerationLog.create({
		data: {
			spotId: finalSpot.id,
			decision: autoResult.decision,
			statusBefore: baseStatus,
			statusAfter,
			auto: true,
			notes: autoResult.notes,
			meta: {
				score: autoResult.score,
				issues: autoResult.issues,
			},
		},
	} as any);

	return NextResponse.json({ id: finalSpot.id, status: finalSpot.status });
}


