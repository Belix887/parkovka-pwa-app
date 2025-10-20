import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendEmail } from "@/lib/notifications";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
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

    // Уведомление арендатора по email (если известно)
    try {
      const renter = await prisma.user.findUnique({ where: { id: booking.renterId } });
      if (renter?.email) {
        await sendEmail(
          renter.email,
          "Бронирование подтверждено",
          `<p>Ваша бронь на "${booking.spot?.title ?? 'Парковочное место'}" подтверждена.</p>`
        );
      }
    } catch {}

    return NextResponse.json({ 
      success: true, 
      booking: updatedBooking 
    });
  } catch (error) {
    console.error("Error approving booking:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}