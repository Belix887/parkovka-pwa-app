import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Тестовые данные для парковочных мест
const mockSpots = {
  "spot-1": {
    id: "spot-1",
    title: "Парковка у Красной площади",
    description: "Удобная парковка в самом центре Москвы, рядом с Красной площадью и ГУМом. Идеально для туристов и деловых встреч. Современная инфраструктура и круглосуточная доступность.",
    pricePerHour: 20000,
    address: "Красная площадь, 1, Москва",
    geoLat: 55.7539,
    geoLng: 37.6208,
    covered: false,
    guarded: true,
    camera: true,
    evCharging: false,
    disabledAccessible: true,
    wideEntrance: true,
    photos: [
      { url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop" },
      { url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop" }
    ]
  },
  "spot-2": {
    id: "spot-2",
    title: "Парковка у ТЦ Афимолл",
    description: "Крытая парковка в торговом центре с круглосуточной охраной. Современные технологии и комфортные условия. Идеально для шопинга и деловых встреч.",
    pricePerHour: 15000,
    address: "Пресненская набережная, 2, Москва",
    geoLat: 55.7489,
    geoLng: 37.5414,
    covered: true,
    guarded: true,
    camera: true,
    evCharging: true,
    disabledAccessible: true,
    wideEntrance: true,
    photos: [
      { url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop" },
      { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop" }
    ]
  },
  "spot-3": {
    id: "spot-3",
    title: "Парковка у Парка Горького",
    description: "Открытая парковка рядом с парком, идеально для прогулок и активного отдыха. Свежий воздух и красивые виды. Отличное место для семейного отдыха.",
    pricePerHour: 10000,
    address: "Крымский Вал, 9, Москва",
    geoLat: 55.7314,
    geoLng: 37.6014,
    covered: false,
    guarded: false,
    camera: true,
    evCharging: false,
    disabledAccessible: true,
    wideEntrance: false,
    photos: [
      { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop" },
      { url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop" }
    ]
  },
  "spot-4": {
    id: "spot-4",
    title: "Парковка у ВДНХ",
    description: "Большая парковка рядом с ВДНХ, много места для крупных автомобилей. Отличное место для семейного отдыха и посещения выставок.",
    pricePerHour: 8000,
    address: "Проспект Мира, 119, Москва",
    geoLat: 55.8270,
    geoLng: 37.6410,
    covered: false,
    guarded: true,
    camera: true,
    evCharging: true,
    disabledAccessible: true,
    wideEntrance: true,
    photos: [
      { url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop" },
      { url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop" }
    ]
  },
  "spot-5": {
    id: "spot-5",
    title: "Парковка у Арбата",
    description: "Историческая парковка в самом сердце старой Москвы. Уникальная атмосфера и близость к достопримечательностям. Идеально для туристов.",
    pricePerHour: 25000,
    address: "Арбат, 1, Москва",
    geoLat: 55.7522,
    geoLng: 37.5915,
    covered: false,
    guarded: true,
    camera: true,
    evCharging: false,
    disabledAccessible: false,
    wideEntrance: false,
    photos: [
      { url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop" },
      { url: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=600&fit=crop" }
    ]
  },
  "spot-6": {
    id: "spot-6",
    title: "Парковка у Сокольников",
    description: "Тихая парковка в зеленом районе, рядом с парком Сокольники. Спокойная обстановка и природа. Отлично для отдыха и прогулок.",
    pricePerHour: 7000,
    address: "Сокольническая площадь, 1, Москва",
    geoLat: 55.7896,
    geoLng: 37.6792,
    covered: false,
    guarded: false,
    camera: false,
    evCharging: false,
    disabledAccessible: true,
    wideEntrance: true,
    photos: [
      { url: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=600&fit=crop" },
      { url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop" }
    ]
  }
};

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // 1) Try DB (or in-memory prisma mock)
    try {
      const dbSpot = await prisma.parkingSpot.findUnique({
        where: { id },
        include: { photos: true },
      } as any);
      if (dbSpot) return NextResponse.json(dbSpot);
    } catch (_e) {
      // ignore and fallback to static mocks below
    }

    // 2) Fallback to static mock map for demo ids like "spot-1"
    const spot = mockSpots[id as keyof typeof mockSpots];
    if (spot) return NextResponse.json(spot);

    return NextResponse.json({ error: "Парковочное место не найдено" }, { status: 404 });
  } catch (error) {
    console.error("Error fetching spot:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}


