import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Получаем все бронирования со статусом PENDING
    const requests = await prisma.booking.findMany({
      where: { status: "PENDING" },
      include: {
        spot: {
          select: {
            id: true,
            title: true,
            address: true,
            pricePerHour: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Форматируем данные для отображения
    const formattedRequests = requests.map((request: any) => ({
      id: request.id,
      spotTitle: request.spot.title || `Парковочное место #${request.spot.id}`,
      spotAddress: request.spot.address,
      startAt: new Date(request.startAt).toLocaleString('ru-RU'),
      endAt: new Date(request.endAt).toLocaleString('ru-RU'),
      totalPrice: request.totalPrice,
      status: request.status,
      createdAt: request.createdAt
    }));

    return NextResponse.json({ requests: formattedRequests });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json({ requests: [] });
  }
}


