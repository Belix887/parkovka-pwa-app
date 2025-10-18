import { NextResponse } from "next/server";

// Тестовые парковочные места в Москве
const mockSpots = [
  {
    id: "spot-1",
    title: "Парковка у Красной площади",
    address: "Красная площадь, 1, Москва",
    pricePerHour: 20000, // 200 рублей
    geoLat: 55.7539,
    geoLng: 37.6208,
    covered: false,
    guarded: true,
    camera: true,
    evCharging: false,
    disabledAccessible: true,
    wideEntrance: true,
    photos: [{ url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop" }]
  },
  {
    id: "spot-2", 
    title: "Парковка у ТЦ Афимолл",
    address: "Пресненская набережная, 2, Москва",
    pricePerHour: 15000, // 150 рублей
    geoLat: 55.7489,
    geoLng: 37.5414,
    covered: true,
    guarded: true,
    camera: true,
    evCharging: true,
    disabledAccessible: true,
    wideEntrance: true,
    photos: [{ url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop" }]
  },
  {
    id: "spot-3",
    title: "Парковка у Парка Горького", 
    address: "Крымский Вал, 9, Москва",
    pricePerHour: 10000, // 100 рублей
    geoLat: 55.7314,
    geoLng: 37.6014,
    covered: false,
    guarded: false,
    camera: true,
    evCharging: false,
    disabledAccessible: true,
    wideEntrance: false,
    photos: [{ url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop" }]
  },
  {
    id: "spot-4",
    title: "Парковка у ВДНХ",
    address: "Проспект Мира, 119, Москва", 
    pricePerHour: 8000, // 80 рублей
    geoLat: 55.8270,
    geoLng: 37.6410,
    covered: false,
    guarded: true,
    camera: true,
    evCharging: true,
    disabledAccessible: true,
    wideEntrance: true,
    photos: [{ url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop" }]
  },
  {
    id: "spot-5",
    title: "Парковка у Арбата",
    address: "Арбат, 1, Москва",
    pricePerHour: 25000, // 250 рублей
    geoLat: 55.7522,
    geoLng: 37.5915,
    covered: false,
    guarded: true,
    camera: true,
    evCharging: false,
    disabledAccessible: false,
    wideEntrance: false,
    photos: [{ url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop" }]
  },
  {
    id: "spot-6",
    title: "Парковка у Сокольников",
    address: "Сокольническая площадь, 1, Москва",
    pricePerHour: 7000, // 70 рублей
    geoLat: 55.7896,
    geoLng: 37.6792,
    covered: false,
    guarded: false,
    camera: false,
    evCharging: false,
    disabledAccessible: true,
    wideEntrance: true,
    photos: [{ url: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&h=300&fit=crop" }]
  }
];

export async function GET() {
  try {
    // Возвращаем тестовые данные
    return NextResponse.json({ spots: mockSpots });
  } catch (error) {
    console.error("Error fetching spots for map:", error);
    return NextResponse.json({ spots: [] });
  }
}
