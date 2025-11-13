import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, restrictToRoles } from "@/lib/auth";
import { sendBookingApprovedNotification } from "@/lib/notifications";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser().catch(() => null);
    if (!user) return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
    try {
      restrictToRoles(user, ["OWNER", "ADMIN"]);
    } catch {
      return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
    }
    const { id: bookingId } = await params;
    
    // Находим бронирование
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { spot: true }
    });

    if (!booking) {
      return NextResponse.json({ error: "Бронирование не найдено" }, { status: 404 });
    }

    if (booking.spot.ownerId !== user.id) {
      return NextResponse.json({ error: "Нет прав на действие" }, { status: 403 });
    }

    // Обновляем статус на APPROVED
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "APPROVED" }
    });

    // Уведомление арендатора по email
    try {
      const renter = await prisma.user.findUnique({ where: { id: booking.renterId } });
      if (renter?.email) {
        sendBookingApprovedNotification(renter.email, {
          spotTitle: booking.spot?.title ?? "Парковочное место",
          spotAddress: booking.spot?.address ?? "",
          startAt: new Date(booking.startAt),
          endAt: new Date(booking.endAt),
        }).catch((err) => console.error("Failed to send notification:", err));
      }
    } catch (err) {
      console.error("Notification error:", err);
    }

    return NextResponse.json({ 
      success: true, 
      booking: updatedBooking 
    });
  } catch (error) {
    console.error("Error approving booking:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}