import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { spotCreateSchema } from "@/lib/validation";

export async function GET(req: Request) {
	const url = new URL(req.url);
	const page = parseInt(url.searchParams.get("page") || "1", 10);
	const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10), 50);
	const skip = (page - 1) * limit;

	const filters: any = { status: "APPROVED" };
	const nums = (key: string) => (url.searchParams.get(key) ? Number(url.searchParams.get(key)) : undefined);
	const bool = (key: string) => (url.searchParams.get(key) === "true" ? true : url.searchParams.get(key) === "false" ? false : undefined);

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

	const {
		title, description, pricePerHour, sizeL, sizeW, sizeH,
		covered, guarded, camera, evCharging, disabledAccessible, wideEntrance,
		accessType, rules, address, geoLat, geoLng, photos,
	} = parsed.data;

	const spot = await prisma.parkingSpot.create({
		data: {
			ownerId: "REPLACE_WITH_AUTH_USER_ID",
			status: "PENDING_REVIEW",
			title, description, pricePerHour, sizeL, sizeW, sizeH,
			covered, guarded, camera, evCharging, disabledAccessible, wideEntrance,
			accessType, rules, address, geoLat, geoLng,
			photos: { create: photos.map((url, i) => ({ url, sortOrder: i })) },
		},
	});

	return NextResponse.json({ id: spot.id, status: spot.status });
}


