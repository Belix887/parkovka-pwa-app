import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { addDays, endOfDay, formatISO, startOfDay } from "date-fns";

export async function GET() {
	try {
		const user = await getCurrentUser();
		if (!user || user.role !== "OWNER") {
			return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
		}

		const now = new Date();
		const rangeStart = startOfDay(addDays(now, -7));
		const rangeEnd = endOfDay(addDays(now, 30));

		const [spots, bookings, blacklist] = await Promise.all([
			prisma.parkingSpot.findMany({
				where: { ownerId: user.id },
				orderBy: { createdAt: "desc" },
			}),
			prisma.booking.findMany({
				where: { spot: { ownerId: user.id } },
				include: { spot: true, renter: true, depositTransactions: true } as any,
				orderBy: { startAt: "asc" },
			}),
			prisma.blacklistEntry.findMany({
				where: { ownerId: user.id },
				include: { renter: true },
			}),
		]);

		const totalEarnings = bookings
			.filter((booking) => booking.status === "PAID" || booking.status === "APPROVED")
			.reduce((sum, booking) => sum + (booking.ownerAmount ?? 0), 0);

		const upcomingBookings = bookings.filter((booking) => new Date(booking.endAt) >= now);
		const cancelledBookings = bookings.filter(
			(booking) => booking.status === "CANCELLED" || booking.status === "DECLINED"
		);
		const expiredBookings = bookings.filter(
			(booking) => new Date(booking.endAt) < now && booking.status === "APPROVED"
		);

		const occupancyRate =
			spots.length === 0
				? 0
				: Math.min(
						100,
						Math.round((upcomingBookings.length / spots.length) * 100)
				  );

		const calendarBookings = bookings
			.filter((booking) => {
				const start = new Date(booking.startAt);
				return start >= rangeStart && start <= rangeEnd;
			})
			.map((booking) => ({
				id: booking.id,
				spotId: booking.spotId,
				spotTitle: booking.spot?.title ?? "Парковка",
				renterName: booking.renter?.name || booking.renter?.email || "Арендатор",
				status: booking.status,
				startAt: formatISO(new Date(booking.startAt)),
				endAt: formatISO(new Date(booking.endAt)),
			}));

		const emergencyBookings = [
			...cancelledBookings,
			...expiredBookings.filter(
				(expired) =>
					!cancelledBookings.find((cancelled) => cancelled.id === expired.id) // избегаем дублей
			),
		].map((booking) => ({
			id: booking.id,
			spotId: booking.spotId,
			spotTitle: booking.spot?.title ?? "Парковка",
			renterId: booking.renterId,
			renterName: booking.renter?.name || booking.renter?.email || "Арендатор",
			status: booking.status,
			startAt: formatISO(new Date(booking.startAt)),
			endAt: formatISO(new Date(booking.endAt)),
			ownerAmount: booking.ownerAmount ?? 0,
		}));

		const blacklistEntries = blacklist.map((entry) => ({
			id: entry.id,
			renterId: entry.renterId,
			renterName: entry.renter?.name || entry.renter?.email || "Арендатор",
			reason: entry.reason || "Не указано",
			createdAt: formatISO(new Date(entry.createdAt)),
		}));

		const depositHeld = bookings
			.filter(
				(booking) =>
					booking.depositStatus === "HELD" ||
					booking.depositStatus === "PARTIALLY_RELEASED" ||
					booking.depositStatus === "PENDING"
			)
			.reduce((sum, booking) => sum + (booking.depositAmount ?? 0), 0);

		const depositReleased = bookings
			.filter((booking) => booking.depositStatus === "RELEASED")
			.reduce((sum, booking) => sum + (booking.depositAmount ?? 0), 0);

		const conflictBookings = bookings
			.filter(
				(booking) =>
					booking.depositStatus === "HELD" ||
					booking.depositStatus === "PARTIALLY_RELEASED" ||
					booking.depositStatus === "FORFEITED" ||
					booking.penaltyAmount > 0 ||
					booking.disputeOpenedAt
			)
			.map((booking) => ({
				id: booking.id,
				spotId: booking.spotId,
				spotTitle: booking.spot?.title ?? "Парковка",
				renterId: booking.renterId,
				renterName: booking.renter?.name || booking.renter?.email || "Арендатор",
				depositAmount: booking.depositAmount,
				depositStatus: booking.depositStatus,
				penaltyAmount: booking.penaltyAmount,
				penaltyReason: booking.penaltyReason,
				disputeOpenedAt: booking.disputeOpenedAt
					? formatISO(new Date(booking.disputeOpenedAt))
					: null,
				disputeResolvedAt: booking.disputeResolvedAt
					? formatISO(new Date(booking.disputeResolvedAt))
					: null,
				transactions: (booking.depositTransactions ?? []).map((tx) => ({
					id: tx.id,
					type: tx.type,
					amount: tx.amount,
					description: tx.description,
					createdAt: formatISO(new Date(tx.createdAt)),
				})),
			}));

		return NextResponse.json({
			stats: {
				totalEarnings,
				upcomingBookings: upcomingBookings.length,
				occupancyRate,
				activeSpots: spots.length,
				depositHeld,
				depositReleased,
				conflicts: conflictBookings.length,
			},
			spots: spots.map((spot) => ({
				id: spot.id,
				title: spot.title,
				pricePerHour: spot.pricePerHour,
				status: spot.status,
				address: spot.address,
			})),
			calendar: calendarBookings,
			emergency: emergencyBookings,
			blacklist: blacklistEntries,
			conflicts: conflictBookings,
		});
	} catch (error: unknown) {
		console.error("owner dashboard error:", error);
		return NextResponse.json(
			{ error: "Не удалось загрузить данные дашборда" },
			{ status: 500 }
		);
	}
}

