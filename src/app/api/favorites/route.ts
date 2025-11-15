import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Получить список избранного
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
    }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10), 50);
    const skip = (page - 1) * limit;

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        spot: {
          include: {
            photos: { orderBy: { sortOrder: "asc" }, take: 1 },
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            reviews: {
              where: { status: "APPROVED" },
              select: {
                rating: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const total = await prisma.favorite.count({
      where: { userId: user.id },
    });

    return NextResponse.json({
      favorites: favorites.map((fav) => {
        const reviews = fav.spot.reviews || [];
        const averageRating = reviews.length > 0
          ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
          : 0;
        const reviewCount = reviews.length;

        return {
          id: fav.id,
          spotId: fav.spotId,
          createdAt: fav.createdAt,
          spot: {
            id: fav.spot.id,
            title: fav.spot.title,
            description: fav.spot.description,
            address: fav.spot.address,
            pricePerHour: fav.spot.pricePerHour,
            geoLat: fav.spot.geoLat,
            geoLng: fav.spot.geoLng,
            covered: fav.spot.covered,
            guarded: fav.spot.guarded,
            camera: fav.spot.camera,
            evCharging: fav.spot.evCharging,
            disabledAccessible: fav.spot.disabledAccessible,
            wideEntrance: fav.spot.wideEntrance,
            spotNumber: fav.spot.spotNumber,
            status: fav.spot.status,
            averageRating,
            reviewCount,
            photos: fav.spot.photos.map((p) => ({ url: p.url })),
          },
        };
      }),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Ошибка получения избранного" },
      { status: 500 }
    );
  }
}

// Добавить в избранное
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
    }

    const body = await req.json();
    const { spotId } = body;

    if (!spotId || typeof spotId !== "string") {
      return NextResponse.json(
        { error: "Не указан spotId" },
        { status: 400 }
      );
    }

    // Проверяем, существует ли место
    const spot = await prisma.parkingSpot.findUnique({
      where: { id: spotId },
    });

    if (!spot) {
      return NextResponse.json(
        { error: "Парковочное место не найдено" },
        { status: 404 }
      );
    }

    // Проверяем, не добавлено ли уже в избранное
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_spotId: {
          userId: user.id,
          spotId: spotId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Уже в избранном",
        favorite: existing,
      });
    }

    // Добавляем в избранное
    const favorite = await prisma.favorite.create({
      data: {
        userId: user.id,
        spotId: spotId,
      },
      include: {
        spot: {
          include: {
            photos: { orderBy: { sortOrder: "asc" }, take: 1 },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Добавлено в избранное",
      favorite: {
        id: favorite.id,
        spotId: favorite.spotId,
        createdAt: favorite.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Error adding to favorites:", error);
    
    // Обработка ошибки уникального ограничения
    if (error.code === "P2002") {
      return NextResponse.json({
        success: true,
        message: "Уже в избранном",
      });
    }

    return NextResponse.json(
      { error: "Ошибка добавления в избранное" },
      { status: 500 }
    );
  }
}

