import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookingCreateSchema } from "@/lib/validation";
import { validateBookingWindow, checkSpotAvailability } from "@/lib/availability";
import { calcPricing } from "@/lib/pricing";
import { restrictToRoles, requireUser } from "@/lib/auth";
import { sendBookingCreatedNotification } from "@/lib/notifications";

export async function POST(req: Request) {
    const user = await requireUser().catch(() => null);
    if (!user) return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
    try {
        restrictToRoles(user, ["RENTER", "OWNER", "ADMIN"]);
    } catch {
        return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = bookingCreateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });

    // Извлекаем геолокацию (опционально)
    const renterLat = typeof body.renterLat === "number" ? body.renterLat : null;
    const renterLng = typeof body.renterLng === "number" ? body.renterLng : null;

	const startAt = new Date(parsed.data.startAt);
	const endAt = new Date(parsed.data.endAt);
	const hours = validateBookingWindow(startAt, endAt);

    const spot = await prisma.parkingSpot.findUnique({ where: { id: parsed.data.spotId } });
	if (!spot || spot.status !== "APPROVED") return NextResponse.json({ error: "Место недоступно" }, { status: 404 });

    // Расширенная проверка доступности
    const availability = await checkSpotAvailability(parsed.data.spotId, startAt, endAt, prisma);
    if (!availability.available) {
        const conflictInfo = availability.conflicts.length > 0
            ? `Конфликт с ${availability.conflicts.length} существующим(и) бронированием(ями) или блокировкой(ами)`
            : "Время недоступно для бронирования";
        return NextResponse.json({ 
            error: conflictInfo,
            conflicts: availability.conflicts.map(c => ({
                id: c.id,
                startAt: c.startAt || c.from,
                endAt: c.endAt || c.to,
            }))
        }, { status: 409 });
    }

	// Получаем политику депозита из места
	const depositRequired = (spot as any).depositRequired || false;
	const depositAmount = (spot as any).depositAmount || null;
	const depositPercent = (spot as any).depositPercent || null;

	// Рассчитываем цену с учетом динамического ценообразования
	const startDate = new Date(startAt);
	const timeOfDay = startDate.getHours();
	const dayOfWeek = startDate.getDay();

	const pricing = calcPricing(hours, spot.pricePerHour, 10, {
		depositRequired,
		depositAmount: depositAmount ? Number(depositAmount) : undefined,
		depositPercent: depositPercent ? Number(depositPercent) : undefined,
		timeOfDay,
		dayOfWeek,
	});

	const { totalPrice, commissionAmount, ownerAmount, commissionPct, depositAmount: calculatedDeposit } = pricing;

	// Если есть геолокация, рассчитываем маршрут
	let routeDistance: number | null = null;
	let routeDuration: number | null = null;
	let routePolyline: string | null = null;

	if (renterLat !== null && renterLng !== null) {
		try {
			const { calculateRoute } = await import("@/lib/routing");
			const route = await calculateRoute(
				{ lat: renterLat, lng: renterLng },
				{ lat: spot.geoLat, lng: spot.geoLng },
				{ mode: "driving" }
			);
			if (route) {
				routeDistance = route.distance;
				routeDuration = route.duration;
				routePolyline = route.geometry;
			}
		} catch (err) {
			console.error("Failed to calculate route:", err);
			// Продолжаем без маршрута
		}
	}

	const booking = await prisma.booking.create({
		data: {
			spotId: spot.id,
            renterId: user.id,
			startAt,
			endAt,
			status: "PENDING",
			totalPrice, commissionAmount, ownerAmount, commissionPct,
			depositAmount: calculatedDeposit,
			depositStatus: calculatedDeposit > 0 ? "PENDING" : "NOT_REQUIRED",
			renterLat,
			renterLng,
			routeDistance,
			routeDuration,
			routePolyline,
		} as any,
	});

	// Отправляем уведомления (асинхронно, не блокируем ответ)
	try {
		const owner = await prisma.user.findUnique({ where: { id: spot.ownerId } });
		if (owner?.email && user.email) {
			sendBookingCreatedNotification(
				user.email,
				owner.email,
				{
					id: booking.id,
					spotTitle: spot.title,
					spotAddress: spot.address,
					startAt,
					endAt,
					totalPrice,
				}
			).catch((err) => console.error("Failed to send notification:", err));
		}
	} catch (err) {
		console.error("Notification error:", err);
		// Не прерываем создание бронирования из-за ошибки уведомления
	}

	return NextResponse.json({ id: booking.id, status: booking.status, totalPrice });
}

export async function GET() {
    const user = await requireUser().catch(() => null);
    if (!user) return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });

    // Список броней текущего пользователя (как арендатора)
    const bookings = await (prisma as any).booking.findMany({
        where: { renterId: user.id },
        include: { spot: true },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookings });
}


