import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { reviewResponseSchema } from "@/lib/validation";

// Ответ владельца на отзыв
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
    }

    const { id: reviewId } = await params;
    const body = await req.json();
    const parsed = reviewResponseSchema.safeParse(body);

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

    // Получаем отзыв с информацией о месте
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        spot: {
          select: {
            id: true,
            ownerId: true,
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json({ error: "Отзыв не найден" }, { status: 404 });
    }

    // Проверяем, что пользователь - владелец места
    if (review.spot.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Только владелец места может ответить на отзыв" },
        { status: 403 }
      );
    }

    // Проверяем, не оставлен ли уже ответ
    if (review.ownerResponse) {
      return NextResponse.json(
        { error: "Ответ на этот отзыв уже оставлен" },
        { status: 400 }
      );
    }

    // Обновляем отзыв с ответом
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        ownerResponse: parsed.data.response,
        ownerResponseAt: new Date(),
      },
      include: {
        renter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      review: {
        id: updatedReview.id,
        ownerResponse: updatedReview.ownerResponse,
        ownerResponseAt: updatedReview.ownerResponseAt,
      },
    });
  } catch (error) {
    console.error("Error adding owner response:", error);
    return NextResponse.json(
      { error: "Ошибка добавления ответа" },
      { status: 500 }
    );
  }
}

