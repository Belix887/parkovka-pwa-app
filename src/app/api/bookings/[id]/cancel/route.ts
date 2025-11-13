import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, restrictToRoles } from "@/lib/auth";
import { calculateRefund } from "@/lib/pricing";
import { sendBookingCancelledNotification } from "@/lib/notifications";
import { z } from "zod";

const cancelSchema = z.object({
	reason: z.string().max(500).optional(),
});

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const user = await requireUser().catch(() => null);
		if (!user) {
			return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
		}

		const { id: bookingId } = await params;
		const body = await req.json();
		const parsed = cancelSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Некорректные данные", details: parsed.error.issues },
				{ status: 400 }
			);
		}

		// Получаем бронирование с информацией о месте
		const booking = await prisma.booking.findUnique({
			where: { id: bookingId },
			include: {
				spot: true,
				renter: true,
			},
		});

		if (!booking) {
			return NextResponse.json({ error: "Бронирование не найдено" }, { status: 404 });
		}

		// Проверяем права: только арендатор или владелец могут отменить
		const isRenter = booking.renterId === user.id;
		const isOwner = booking.spot.ownerId === user.id;

		if (!isRenter && !isOwner) {
			return NextResponse.json(
				{ error: "Недостаточно прав для отмены бронирования" },
				{ status: 403 }
			);
		}

		// Проверяем, можно ли отменить
		if (booking.status === "CANCELLED") {
			return NextResponse.json(
				{ error: "Бронирование уже отменено" },
				{ status: 400 }
			);
		}

		if (booking.status === "DECLINED") {
			return NextResponse.json(
				{ error: "Бронирование уже отклонено" },
				{ status: 400 }
			);
		}

		// Получаем политику отмены из места (или дефолтные значения)
		const cancellationPolicy =
			(booking.spot as any).cancellationPolicy || "MODERATE";
		const cancellationDeadlineHours =
			(booking.spot as any).cancellationDeadlineHours || 24;

		// Рассчитываем возврат
		const refund = calculateRefund(
			{
				totalPrice: booking.totalPrice,
				depositAmount: booking.depositAmount || 0,
				startAt: new Date(booking.startAt),
				createdAt: new Date(booking.createdAt),
			},
			cancellationPolicy as "FLEXIBLE" | "MODERATE" | "STRICT",
			cancellationDeadlineHours
		);

		// Обновляем статус бронирования
		const updatedBooking = await prisma.booking.update({
			where: { id: bookingId },
			data: {
				status: "CANCELLED",
				penaltyAmount: refund.penalty,
				penaltyReason: parsed.data.reason || refund.reason,
			} as any,
		});

		// Отправляем уведомления
		try {
			const owner = await prisma.user.findUnique({
				where: { id: booking.spot.ownerId },
			});

			if (owner?.email && booking.renter?.email) {
				sendBookingCancelledNotification(
					booking.renter.email,
					owner.email,
					{
						spotTitle: booking.spot.title,
						startAt: new Date(booking.startAt),
						reason: parsed.data.reason || refund.reason,
					},
					isRenter ? "renter" : "owner"
				).catch((err) => console.error("Failed to send notification:", err));
			}
		} catch (err) {
			console.error("Notification error:", err);
		}

		return NextResponse.json({
			success: true,
			booking: updatedBooking,
			refund: {
				amount: refund.refundAmount,
				deposit: refund.depositRefund,
				penalty: refund.penalty,
				reason: refund.reason,
			},
		});
	} catch (error) {
		console.error("Cancel booking error:", error);
		return NextResponse.json(
			{ error: "Ошибка сервера при отмене бронирования" },
			{ status: 500 }
		);
	}
}
