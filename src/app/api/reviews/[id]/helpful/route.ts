import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Отметить отзыв как полезный
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

    // Проверяем, существует ли отзыв
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json({ error: "Отзыв не найден" }, { status: 404 });
    }

    // TODO: В будущем можно добавить таблицу ReviewHelpful для отслеживания,
    // кто уже отметил отзыв как полезный, чтобы избежать дубликатов
    // Пока просто увеличиваем счетчик

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        helpfulCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      helpfulCount: updatedReview.helpfulCount,
    });
  } catch (error) {
    console.error("Error marking review as helpful:", error);
    return NextResponse.json(
      { error: "Ошибка отметки отзыва" },
      { status: 500 }
    );
  }
}

