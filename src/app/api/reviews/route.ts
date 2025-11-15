import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reviewCreateSchema } from "@/lib/validation";
import { getCurrentUser } from "@/lib/auth";

// Создать отзыв
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = reviewCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Некорректные данные",
          details: parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const { spotId, bookingId, rating, title, comment, photos } = parsed.data;

    // Проверяем, существует ли место
    const spot = await prisma.parkingSpot.findUnique({
      where: { id: spotId },
    });

    if (!spot || spot.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Парковочное место не найдено или не одобрено" },
        { status: 404 }
      );
    }

    // Если указано бронирование, проверяем его
    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking || booking.renterId !== user.id || booking.spotId !== spotId) {
        return NextResponse.json(
          { error: "Бронирование не найдено или не принадлежит вам" },
          { status: 404 }
        );
      }

      // Проверяем, не оставлен ли уже отзыв на это бронирование
      const existingReview = await prisma.review.findUnique({
        where: { bookingId },
      });

      if (existingReview) {
        return NextResponse.json(
          { error: "Отзыв на это бронирование уже оставлен" },
          { status: 400 }
        );
      }

      // Проверяем, что бронирование завершено (endAt в прошлом)
      if (booking.endAt > new Date()) {
        return NextResponse.json(
          { error: "Можно оставить отзыв только после завершения бронирования" },
          { status: 400 }
        );
      }
    }

    // Проверяем, не оставил ли пользователь уже отзыв на это место
    // (если не указано бронирование, разрешаем только один отзыв на место)
    if (!bookingId) {
      const existingReview = await prisma.review.findFirst({
        where: {
          spotId,
          renterId: user.id,
        },
      });

      if (existingReview) {
        return NextResponse.json(
          { error: "Вы уже оставили отзыв на это место" },
          { status: 400 }
        );
      }
    }

    // Создаем отзыв
    const review = await prisma.review.create({
      data: {
        spotId,
        renterId: user.id,
        bookingId: bookingId || null,
        rating,
        title: title || null,
        comment,
        status: "PENDING", // На модерации
        photos: photos && photos.length > 0
          ? {
              create: photos.map((url, index) => ({
                url,
                sortOrder: index,
              })),
            }
          : undefined,
      },
      include: {
        renter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        photos: true,
      },
    });

    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        spotId: review.spotId,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        status: review.status,
        createdAt: review.createdAt,
        renter: review.renter,
        photos: review.photos,
      },
    });
  } catch (error: any) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Ошибка создания отзыва" },
      { status: 500 }
    );
  }
}

