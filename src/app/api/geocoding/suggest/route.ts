import { NextResponse } from "next/server";

const GRAPHHOPPER_API_KEY = process.env.GRAPHHOPPER_API_KEY || process.env.NEXT_PUBLIC_GRAPHHOPPER_API_KEY || "aa902198-c697-4891-a0f0-6a443a3e8889";

export async function POST(req: Request) {
  try {
    const { query, city = "Москва" } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    if (!GRAPHHOPPER_API_KEY) {
      return NextResponse.json({ 
        suggestions: [],
        error: "GraphHopper API ключ не настроен"
      });
    }

    // GraphHopper Geocoding API для автодополнения
    // Пробуем несколько вариантов запроса
    const queries = [
      `${city}, ${query}`, // С городом
      query, // Без города
    ];

    for (const fullQuery of queries) {
      try {
        const url = `https://graphhopper.com/api/1/geocode?q=${encodeURIComponent(fullQuery)}&key=${GRAPHHOPPER_API_KEY}&limit=5&locale=ru`;

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          const hits = data.hits || [];

          if (hits.length > 0) {
            const suggestions = hits.map((hit: any) => {
              const point = hit.point;
              const lat = point.lat;
              const lng = point.lng;
              
              // Формируем адрес
              const formattedAddress = hit.name 
                ? `${hit.name}${hit.housenumber ? `, ${hit.housenumber}` : ""}`
                : hit.street
                ? `${hit.street}${hit.housenumber ? `, ${hit.housenumber}` : ""}${hit.city ? `, ${hit.city}` : ""}`
                : fullQuery;

              return {
                value: formattedAddress,
                lat,
                lng,
                formattedAddress,
              };
            });

            if (suggestions.length > 0) {
              return NextResponse.json({ suggestions });
            }
          }
        }
      } catch (err) {
        console.error("GraphHopper geocoding query error:", err);
        continue; // Пробуем следующий вариант
      }
    }

    // Если ничего не найдено, возвращаем пустой массив
    return NextResponse.json({ suggestions: [] });
  } catch (error) {
    console.error("Address suggestions error:", error);
    return NextResponse.json({ 
      suggestions: [],
      error: error instanceof Error ? error.message : "Ошибка при поиске адресов"
    });
  }
}

