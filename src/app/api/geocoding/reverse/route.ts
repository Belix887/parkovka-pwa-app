import { NextResponse } from "next/server";

const GRAPHHOPPER_API_KEY = process.env.GRAPHHOPPER_API_KEY || process.env.NEXT_PUBLIC_GRAPHHOPPER_API_KEY || "aa902198-c697-4891-a0f0-6a443a3e8889";

export async function POST(req: Request) {
  try {
    const { lat, lng } = await req.json();

    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json(
        { error: "Координаты обязательны" },
        { status: 400 }
      );
    }

    if (!GRAPHHOPPER_API_KEY) {
      return NextResponse.json(
        { error: "GraphHopper API ключ не настроен" },
        { status: 500 }
      );
    }

    // GraphHopper Reverse Geocoding API
    const url = `https://graphhopper.com/api/1/geocode?point=${lat},${lng}&reverse=true&key=${GRAPHHOPPER_API_KEY}&limit=1&locale=ru`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("GraphHopper Reverse Geocoding API error");
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
    const address = hit.name 
      ? `${hit.name}${hit.housenumber ? `, ${hit.housenumber}` : ""}`
      : hit.street
      ? `${hit.street}${hit.housenumber ? `, ${hit.housenumber}` : ""}${hit.city ? `, ${hit.city}` : ""}`
      : null;

    return NextResponse.json({ address });
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return NextResponse.json(
      { error: "Ошибка обратного геокодирования" },
      { status: 500 }
    );
  }
}

