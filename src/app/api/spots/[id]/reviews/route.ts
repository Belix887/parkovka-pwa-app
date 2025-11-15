import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Получить отзывы места
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: spotId } = await params;
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "10", 10), 50);
    const skip = (page - 1) * limit;
    const sort = url.searchParams.get("sort") || "newest"; // newest, oldest, highest, lowest
    const ratingFilter = url.searchParams.get("rating"); // Фильтр по рейтингу

    // Проверяем, существует ли место
    const spot = await prisma.parkingSpot.findUnique({
      where: { id: spotId },
      select: { id: true },
    });

    if (!spot) {
      return NextResponse.json({ error: "Место не найдено" }, { status: 404 });
    }

    // Строим запрос
    const where: any = {
      spotId,
      status: "APPROVED", // Только одобренные отзывы
    };

    if (ratingFilter) {
      const rating = parseInt(ratingFilter, 10);
      if (rating >= 1 && rating <= 5) {
        where.rating = rating;
      }
    }

    // Сортировка
    let orderBy: any = {};
    switch (sort) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "highest":
        orderBy = { rating: "desc" };
        break;
      case "lowest":
        orderBy = { rating: "asc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    // Получаем отзывы
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          renter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          photos: {
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    // Вычисляем статистику рейтингов
    const ratingStats = await prisma.review.groupBy({
      by: ["rating"],
      where: {
        spotId,
        status: "APPROVED",
      },
      _count: {
        rating: true,
      },
    });

    const ratingDistribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingStats.forEach((stat) => {
      ratingDistribution[stat.rating] = stat._count.rating;
    });

    // Средний рейтинг
    const avgRatingResult = await prisma.review.aggregate({
      where: {
        spotId,
        status: "APPROVED",
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    return NextResponse.json({
      reviews: reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        ownerResponse: review.ownerResponse,
        ownerResponseAt: review.ownerResponseAt,
        helpfulCount: review.helpfulCount,
        createdAt: review.createdAt,
        renter: {
          id: review.renter.id,
          name: review.renter.name || "Анонимный пользователь",
        },
        photos: review.photos.map((p) => ({ url: p.url })),
      })),
      statistics: {
        averageRating: avgRatingResult._avg.rating || 0,
        totalReviews: avgRatingResult._count.rating || 0,
        ratingDistribution,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Ошибка получения отзывов" },
      { status: 500 }
    );
  }
}

