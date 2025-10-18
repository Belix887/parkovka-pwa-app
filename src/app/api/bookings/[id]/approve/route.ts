import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    
    // Находим бронирование
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { spot: true }
    });

    if (!booking) {
      return NextResponse.json({ error: "Бронирование не найдено" }, { status: 404 });
    }

    // Обновляем статус на APPROVED
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "APPROVED" }
    });

    return NextResponse.json({ 
      success: true, 
      booking: updatedBooking 
    });
  } catch (error) {
    console.error("Error approving booking:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}