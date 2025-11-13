import { NextResponse } from "next/server";

const YANDEX_GEOCODER_API_KEY = process.env.YANDEX_MAPS_API_KEY || process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

export async function POST(req: Request) {
  try {
    const { query, city = "Москва" } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Используем обычный Geocoder API для поиска (более надежный вариант)
    // Yandex Suggest API требует отдельной подписки и может не работать с обычным ключом

    // Используем обычный Geocoder API для поиска адресов
    if (YANDEX_GEOCODER_API_KEY) {
      // Пробуем несколько вариантов запроса для лучших результатов
      const queries = [
        `${city}, ${query}`, // С городом
        query, // Без города (может найти адреса в других городах, но лучше для Москвы)
      ];

      for (const fullQuery of queries) {
        try {
          const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_GEOCODER_API_KEY}&geocode=${encodeURIComponent(fullQuery)}&format=json&results=5&kind=house,street`;

          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            const featureMembers = data.response?.GeoObjectCollection?.featureMember || [];

            if (featureMembers.length > 0) {
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

              if (suggestions.length > 0) {
                return NextResponse.json({ suggestions });
              }
            }
          }
        } catch (err) {
          console.error("Geocoding query error:", err);
          continue; // Пробуем следующий вариант
        }
      }
    } else {
      console.warn("Yandex Maps API ключ не настроен. Автодополнение адресов не будет работать.");
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

