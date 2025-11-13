import { NextResponse } from "next/server";

const GRAPHHOPPER_API_KEY = process.env.GRAPHHOPPER_API_KEY || process.env.NEXT_PUBLIC_GRAPHHOPPER_API_KEY || "aa902198-c697-4891-a0f0-6a443a3e8889";

export async function POST(req: Request) {
  try {
    const { address, city = "Москва" } = await req.json();

    if (!address || typeof address !== "string") {
      return NextResponse.json(
        { error: "Адрес обязателен" },
        { status: 400 }
      );
    }

    if (!GRAPHHOPPER_API_KEY) {
      return NextResponse.json(
        { error: "GraphHopper API ключ не настроен" },
        { status: 500 }
      );
    }

    // GraphHopper Geocoding API
    const fullAddress = `${city}, ${address}`;
    const url = `https://graphhopper.com/api/1/geocode?q=${encodeURIComponent(fullAddress)}&key=${GRAPHHOPPER_API_KEY}&limit=1&locale=ru`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("GraphHopper Geocoding API error");
    }

    const data = await response.json();
    const hits = data.hits || [];

    if (hits.length === 0) {
      return NextResponse.json(
        { error: "Адрес не найден" },
        { status: 404 }
      );
    }

    const hit = hits[0];
    const point = hit.point;
    const lat = point.lat;
    const lng = point.lng;
    
    // Формируем адрес из компонентов
    const components = hit.name || hit.street || hit.city || address;
    const formattedAddress = hit.name 
      ? `${hit.name}${hit.housenumber ? `, ${hit.housenumber}` : ""}`
      : hit.street
      ? `${hit.street}${hit.housenumber ? `, ${hit.housenumber}` : ""}, ${hit.city || city}`
      : fullAddress;

    return NextResponse.json({
      lat,
      lng,
      formattedAddress,
      city: hit.city || city,
      street: hit.street || hit.name,
      house: hit.housenumber,
    });
  } catch (error) {
    console.error("Geocoding error:", error);
    return NextResponse.json(
      { error: "Ошибка геокодирования" },
      { status: 500 }
    );
  }
}

