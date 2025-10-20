import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });

    // Заявки только для мест текущего владельца со статусом PENDING
    const requests = await (prisma as any).booking.findMany({
      where: {
        status: "PENDING",
        spot: { ownerId: user.id },
      },
      include: { spot: { select: { id: true, title: true, address: true, pricePerHour: true } } },
      orderBy: { createdAt: "desc" },
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


