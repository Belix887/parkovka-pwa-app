import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Проверить статус избранного
export async function GET(
  req: Request,
  { params }: { params: Promise<{ spotId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ isFavorite: false });
    }

    const { spotId } = await params;

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_spotId: {
          userId: user.id,
          spotId: spotId,
        },
      },
    });

    return NextResponse.json({
      isFavorite: !!favorite,
    });
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return NextResponse.json({ isFavorite: false });
  }
}

// Удалить из избранного
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ spotId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
    }

    const { spotId } = await params;

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_spotId: {
          userId: user.id,
          spotId: spotId,
        },
      },
    });

    if (!favorite) {
      return NextResponse.json(
        { error: "Не найдено в избранном" },
        { status: 404 }
      );
    }

    await prisma.favorite.delete({
      where: {
        id: favorite.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Удалено из избранного",
    });
  } catch (error) {
    console.error("Error removing from favorites:", error);
    return NextResponse.json(
      { error: "Ошибка удаления из избранного" },
      { status: 500 }
    );
  }
}

