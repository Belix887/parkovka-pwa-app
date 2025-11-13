import { NextResponse } from "next/server";

const YANDEX_GEOCODER_API_KEY = process.env.YANDEX_MAPS_API_KEY || process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

export async function POST(req: Request) {
  try {
    const { lat, lng } = await req.json();

    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json(
        { error: "Координаты обязательны" },
        { status: 400 }
      );
    }

    if (!YANDEX_GEOCODER_API_KEY) {
      return NextResponse.json(
        { error: "Yandex Maps API ключ не настроен" },
        { status: 500 }
      );
    }

    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_GEOCODER_API_KEY}&geocode=${lng},${lat}&format=json&results=1`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Yandex Geocoder API error");
    }

    const data = await response.json();
    const featureMember = data.response?.GeoObjectCollection?.featureMember?.[0];

    if (!featureMember) {
      return NextResponse.json(
        { error: "Адрес не найден" },
        { status: 404 }
      );
    }

    const geoObject = featureMember.GeoObject;
    const address = geoObject.metaDataProperty?.GeocoderMetaData?.text || null;

    return NextResponse.json({ address });
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return NextResponse.json(
      { error: "Ошибка обратного геокодирования" },
      { status: 500 }
    );
  }
}

