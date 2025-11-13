import { NextResponse } from "next/server";

const YANDEX_GEOCODER_API_KEY = process.env.YANDEX_MAPS_API_KEY || process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

export async function POST(req: Request) {
  try {
    const { address, city = "Москва" } = await req.json();

    if (!address || typeof address !== "string") {
      return NextResponse.json(
        { error: "Адрес обязателен" },
        { status: 400 }
      );
    }

    if (!YANDEX_GEOCODER_API_KEY) {
      return NextResponse.json(
        { error: "Yandex Maps API ключ не настроен" },
        { status: 500 }
      );
    }

    const fullAddress = `${city}, ${address}`;
    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_GEOCODER_API_KEY}&geocode=${encodeURIComponent(fullAddress)}&format=json&results=1`;

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
    const pos = geoObject.Point.pos.split(" ");
    const lng = parseFloat(pos[0]);
    const lat = parseFloat(pos[1]);
    const formattedAddress = geoObject.metaDataProperty?.GeocoderMetaData?.text || address;

    return NextResponse.json({
      lat,
      lng,
      formattedAddress,
      city: geoObject.metaDataProperty?.GeocoderMetaData?.Address?.Components?.find(
        (c: any) => c.kind === "locality"
      )?.name,
      street: geoObject.metaDataProperty?.GeocoderMetaData?.Address?.Components?.find(
        (c: any) => c.kind === "street"
      )?.name,
      house: geoObject.metaDataProperty?.GeocoderMetaData?.Address?.Components?.find(
        (c: any) => c.kind === "house"
      )?.name,
    });
  } catch (error) {
    console.error("Geocoding error:", error);
    return NextResponse.json(
      { error: "Ошибка геокодирования" },
      { status: 500 }
    );
  }
}

