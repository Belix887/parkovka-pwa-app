/**
 * Геокодирование адресов через Yandex Geocoder API
 */

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
  city?: string;
  street?: string;
  house?: string;
}

export interface GeocodeSuggestion {
  value: string;
  lat: number;
  lng: number;
  formattedAddress: string;
}

/**
 * Геокодирование адреса (поиск координат по адресу)
 */
export async function geocodeAddress(
  address: string,
  city: string = "Москва"
): Promise<GeocodeResult | null> {
  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
  
  // Если нет API ключа, используем fallback через серверный API
  if (!apiKey) {
    try {
      const response = await fetch("/api/geocoding/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, city }),
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error("Geocoding API error:", error);
    }
    return null;
  }

  // Прямой запрос к Yandex Geocoder API (если ключ доступен на клиенте)
  try {
    const fullAddress = `${city}, ${address}`;
    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&geocode=${encodeURIComponent(fullAddress)}&format=json&results=1`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Yandex Geocoder API error");
    }

    const data = await response.json();
    const featureMember = data.response?.GeoObjectCollection?.featureMember?.[0];
    
    if (!featureMember) {
      return null;
    }

    const geoObject = featureMember.GeoObject;
    const pos = geoObject.Point.pos.split(" ");
    const lng = parseFloat(pos[0]);
    const lat = parseFloat(pos[1]);
    const formattedAddress = geoObject.metaDataProperty?.GeocoderMetaData?.text || address;

    return {
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
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

/**
 * Обратное геокодирование (поиск адреса по координатам)
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
  
  if (!apiKey) {
    try {
      const response = await fetch("/api/geocoding/reverse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng }),
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.address;
      }
    } catch (error) {
      console.error("Reverse geocoding API error:", error);
    }
    return null;
  }

  try {
    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&geocode=${lng},${lat}&format=json&results=1`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Yandex Geocoder API error");
    }

    const data = await response.json();
    const featureMember = data.response?.GeoObjectCollection?.featureMember?.[0];
    
    if (!featureMember) {
      return null;
    }

    const geoObject = featureMember.GeoObject;
    return geoObject.metaDataProperty?.GeocoderMetaData?.text || null;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}

/**
 * Автодополнение адресов (suggestions)
 */
export async function suggestAddresses(
  query: string,
  city: string = "Москва"
): Promise<GeocodeSuggestion[]> {
  try {
    const response = await fetch("/api/geocoding/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, city }),
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.suggestions || [];
    }
  } catch (error) {
    console.error("Address suggestions API error:", error);
  }
  return [];
}

