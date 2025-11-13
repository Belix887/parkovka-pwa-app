import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
    const { id } = await params;

    const booking = await (prisma as any).booking.findUnique({
      where: { id },
      include: { 
        spot: {
          select: {
            id: true,
            title: true,
            address: true,
            pricePerHour: true,
            geoLat: true,
            geoLng: true,
            ownerId: true,
            cancellationPolicy: true,
            cancellationDeadlineHours: true,
          }
        },
        renter: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      },
    });
    if (!booking) return NextResponse.json({ error: "Бронирование не найдено" }, { status: 404 });

    const isRenter = booking.renterId === user.id;
    const isOwner = booking.spot?.ownerId === user.id;
    if (!isRenter && !isOwner) return NextResponse.json({ error: "Нет прав на просмотр" }, { status: 403 });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}


