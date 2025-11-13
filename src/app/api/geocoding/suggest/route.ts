import { NextResponse } from "next/server";

const YANDEX_GEOCODER_API_KEY = process.env.YANDEX_MAPS_API_KEY || process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

export async function POST(req: Request) {
  try {
    const { query, city = "Москва" } = await req.json();

    if (!query || typeof query !== "string" || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    if (!YANDEX_GEOCODER_API_KEY) {
      // Fallback: простой поиск через геокодирование
      return NextResponse.json({ suggestions: [] });
    }

    const fullQuery = `${city}, ${query}`;
    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_GEOCODER_API_KEY}&geocode=${encodeURIComponent(fullQuery)}&format=json&results=5`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Yandex Geocoder API error");
    }

    const data = await response.json();
    const featureMembers = data.response?.GeoObjectCollection?.featureMember || [];

    const suggestions = featureMembers.map((member: any) => {
      const geoObject = member.GeoObject;
      const pos = geoObject.Point.pos.split(" ");
      const lng = parseFloat(pos[0]);
      const lat = parseFloat(pos[1]);
      const formattedAddress = geoObject.metaDataProperty?.GeocoderMetaData?.text || query;

      return {
        value: formattedAddress,
        lat,
        lng,
        formattedAddress,
      };
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Address suggestions error:", error);
    return NextResponse.json({ suggestions: [] });
  }
}

