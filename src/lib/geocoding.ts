/**
 * Геокодирование адресов через GraphHopper Geocoding API
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
 * Геокодирование адреса (поиск координат по адресу) через GraphHopper
 */
export async function geocodeAddress(
  address: string,
  city: string = "Москва"
): Promise<GeocodeResult | null> {
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

/**
 * Обратное геокодирование (поиск адреса по координатам) через GraphHopper
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string | null> {
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

