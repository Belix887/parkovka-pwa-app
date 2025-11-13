import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/availability";
import { z } from "zod";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: spotId } = await params;
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");

    if (!dateParam) {
      return NextResponse.json(
        { error: "Параметр date обязателен (формат: YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const parsed = dateSchema.safeParse(dateParam);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Некорректный формат даты. Используйте YYYY-MM-DD" },
        { status: 400 }
      );
    }

    const date = new Date(parsed.data + "T00:00:00Z");

    // Проверяем существование места
    const spot = await prisma.parkingSpot.findUnique({
      where: { id: spotId },
    });

    if (!spot) {
      return NextResponse.json(
        { error: "Парковочное место не найдено" },
        { status: 404 }
      );
    }

    if (spot.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Парковочное место недоступно для бронирования" },
        { status: 403 }
      );
    }

    const slots = await getAvailableSlots(spotId, date, prisma);

    return NextResponse.json({
      date: parsed.data,
      spotId,
      availableSlots: slots.map((slot) => ({
        start: slot.start.toISOString(),
        end: slot.end.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Availability API error:", error);
    return NextResponse.json(
      { error: "Ошибка сервера при получении доступности" },
      { status: 500 }
    );
  }
}

