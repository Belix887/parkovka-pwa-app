import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { reviewUpdateSchema } from "@/lib/validation";
import { ReviewStatus } from "@prisma/client";

// Получить отзыв
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const review = await prisma.review.findUnique({
      where: { id },
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
        spot: {
          select: {
            id: true,
            title: true,
            address: true,
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json({ error: "Отзыв не найден" }, { status: 404 });
    }

    return NextResponse.json({
      review: {
        id: review.id,
        spotId: review.spotId,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        status: review.status,
        ownerResponse: review.ownerResponse,
        ownerResponseAt: review.ownerResponseAt,
        helpfulCount: review.helpfulCount,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        renter: review.renter,
        photos: review.photos,
        spot: review.spot,
      },
    });
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { error: "Ошибка получения отзыва" },
      { status: 500 }
    );
  }
}

// Обновить отзыв
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = reviewUpdateSchema.safeParse(body);

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

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return NextResponse.json({ error: "Отзыв не найден" }, { status: 404 });
    }

    // Проверяем права (только автор может редактировать)
    if (review.renterId !== user.id) {
      return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
    }

    // Проверяем, можно ли редактировать (в течение 24 часов)
    const hoursSinceCreation =
      (new Date().getTime() - review.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation > 24) {
      return NextResponse.json(
        { error: "Отзыв можно редактировать только в течение 24 часов после создания" },
        { status: 400 }
      );
    }

    // Обновляем отзыв
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        rating: parsed.data.rating,
        title: parsed.data.title,
        comment: parsed.data.comment,
        status: ReviewStatus.PENDING, // Снова на модерации после редактирования
        photos: parsed.data.photos
          ? {
              deleteMany: {},
              create: parsed.data.photos.map((url, index) => ({
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
        photos: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      review: {
        id: updatedReview.id,
        rating: updatedReview.rating,
        title: updatedReview.title,
        comment: updatedReview.comment,
        status: updatedReview.status,
        photos: updatedReview.photos,
      },
    });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "Ошибка обновления отзыва" },
      { status: 500 }
    );
  }
}

// Удалить отзыв (мягкое удаление)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
    }

    const { id } = await params;

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return NextResponse.json({ error: "Отзыв не найден" }, { status: 404 });
    }

    // Проверяем права (автор или модератор)
    const isAuthor = review.renterId === user.id;
    const isModerator = user.role === "ADMIN";

    if (!isAuthor && !isModerator) {
      return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
    }

    // Мягкое удаление
    await prisma.review.update({
      where: { id },
      data: {
        status: ReviewStatus.HIDDEN,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Отзыв удален",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Ошибка удаления отзыва" },
      { status: 500 }
    );
  }
}

