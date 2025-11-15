"use client";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";

// Создаем кастомные иконки для парковочных мест
const parkingIcon = L.divIcon({
  className: 'custom-parking-icon',
  html: `
    <div style="
      font-size: 32px;
      color: #2563eb;
      font-weight: 900;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1;
      text-shadow: 0 2px 4px rgba(255, 255, 255, 0.8);
    ">P</div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

interface ParkingSpot {
  id: string;
  title: string;
  address: string;
  pricePerHour: number;
  geoLat: number;
  geoLng: number;
  covered: boolean;
  guarded: boolean;
  camera: boolean;
  evCharging: boolean;
  disabledAccessible: boolean;
  wideEntrance: boolean;
  spotNumber?: string | null;
  photos: { url: string }[];
}

interface LeafletMapProps {
  center?: [number, number];
  spots?: ParkingSpot[];
  loadSpots?: boolean;
  zoom?: number;
}

export default function LeafletMap({ 
  center = [55.751244, 37.618423], 
  spots = [] as ParkingSpot[],
  loadSpots = false,
  zoom = 12
}: LeafletMapProps) {
  const [mapSpots, setMapSpots] = useState<ParkingSpot[]>(spots);
  const [loading, setLoading] = useState(false);

  // Обновляем маркеры при изменении пропса spots
  useEffect(() => {
    if (!loadSpots) {
      // Принудительно обновляем маркеры при изменении spots
      setMapSpots([...spots]);
    }
  }, [spots, loadSpots]);

  useEffect(() => {
    if (loadSpots) {
      loadParkingSpots();
    }
  }, [loadSpots]);

  const loadParkingSpots = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/spots/map');
      const data = await response.json();
      setMapSpots(data.spots || []);
    } catch (error) {
      console.error('Error loading parking spots:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `${(price / 100).toLocaleString('ru-RU')} ₽/час`;
  };

  const getFeatures = (spot: ParkingSpot) => {
    const features = [];
    if (spot.covered) features.push('Крытая');
    if (spot.guarded) features.push('Охраняемая');
    if (spot.camera) features.push('Камеры');
    if (spot.evCharging) features.push('Зарядка ЭВ');
    if (spot.disabledAccessible) features.push('Для инвалидов');
    if (spot.wideEntrance) features.push('Широкий въезд');
    return features;
  };

  // Группируем места по адресу (нормализованному)
  const groupSpotsByAddress = (spots: ParkingSpot[]) => {
    const groups = new Map<string, ParkingSpot[]>();
    
    spots.forEach(spot => {
      // Нормализуем адрес для группировки (убираем лишние пробелы, приводим к нижнему регистру)
      const normalizedAddress = spot.address.trim().toLowerCase();
      const key = `${spot.geoLat.toFixed(6)}_${spot.geoLng.toFixed(6)}_${normalizedAddress}`;
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(spot);
    });
    
    return groups;
  };

  const spotGroups = groupSpotsByAddress(mapSpots.filter(spot => 
    spot && 
    typeof spot.geoLat === 'number' && 
    typeof spot.geoLng === 'number' &&
    !isNaN(spot.geoLat) && 
    !isNaN(spot.geoLng) &&
    spot.geoLat >= -90 && spot.geoLat <= 90 &&
    spot.geoLng >= -180 && spot.geoLng <= 180
  ));

  // Компонент для обновления центра карты
  function MapCenterUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
      try {
        // Проверяем валидность координат
        if (Array.isArray(center) && center.length === 2 && 
            typeof center[0] === 'number' && typeof center[1] === 'number' &&
            !isNaN(center[0]) && !isNaN(center[1]) &&
            center[0] >= -90 && center[0] <= 90 &&
            center[1] >= -180 && center[1] <= 180) {
          map.setView(center, zoom);
        } else {
          console.error("Invalid center coordinates:", center);
        }
      } catch (error) {
        console.error("Error updating map center:", error);
      }
    }, [center, zoom, map]);
    return null;
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10 rounded-xl">
          <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
            <span className="text-sm font-medium">Загрузка парковок...</span>
          </div>
        </div>
      )}
      
      <MapContainer 
        center={center as [number, number]} 
        zoom={zoom} 
        style={{ height: 400, width: "100%", borderRadius: 12 }}
        className="z-0"
        key={`${center[0]}-${center[1]}-${zoom}`}
      >
        <TileLayer
          attribution=""
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapCenterUpdater center={center as [number, number]} zoom={zoom} />
        
        {Array.from(spotGroups.entries()).map(([key, spots]) => {
          // Берем первую точку для координат маркера
          const firstSpot = spots[0];
          const hasMultipleSpots = spots.length > 1;
          
          return (
            <Marker 
              key={key} 
              position={[firstSpot.geoLat, firstSpot.geoLng] as [number, number]} 
              icon={parkingIcon}
            >
              <Popup maxWidth={hasMultipleSpots ? 400 : 320} className="custom-popup">
                <div className={`p-4 ${hasMultipleSpots ? 'min-w-[360px] max-w-[400px]' : 'min-w-[280px] max-w-[320px]'} bg-white`}>
                  {hasMultipleSpots ? (
                    // Если несколько мест по одному адресу - показываем список
                    <div className="space-y-3">
                      <div className="mb-4 pb-3 border-b border-gray-200">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">
                          Парковочные места
                        </h3>
                        <p className="text-sm text-gray-600 flex items-start gap-1.5">
                          <span className="text-base">📍</span>
                          <span className="flex-1">{firstSpot.address}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Доступно мест: {spots.length}
                        </p>
                      </div>
                      
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {spots.map((spot) => (
                          <div 
                            key={spot.id}
                            className="p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-base text-gray-900 mb-1 leading-tight">
                                  {spot.title}
                                </h4>
                                {spot.spotNumber && (
                                  <p className="text-xs text-gray-600 mb-1">
                                    Номер места: <span className="font-medium text-blue-600">{spot.spotNumber}</span>
                                  </p>
                                )}
                                <div className="text-lg font-bold text-blue-600">
                                  {formatPrice(spot.pricePerHour)}
                                </div>
                              </div>
                              {spot.photos.length > 0 && (
                                <img 
                                  src={spot.photos[0].url} 
                                  alt={spot.title}
                                  className="w-16 h-16 object-cover rounded border border-gray-200"
                                />
                              )}
                            </div>
                            
                            {getFeatures(spot).length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {getFeatures(spot).slice(0, 3).map((feature, index) => (
                                  <span 
                                    key={index}
                                    className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-200"
                                  >
                                    {feature}
                                  </span>
                                ))}
                                {getFeatures(spot).length > 3 && (
                                  <span className="px-2 py-0.5 text-xs text-gray-500">
                                    +{getFeatures(spot).length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            <a 
                              href={`/spots/${spot.id}`}
                              className="inline-block w-full text-center bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 active:bg-blue-800 transition-colors text-xs font-semibold shadow-sm"
                            >
                              Подробнее
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Если одно место - показываем обычную карточку
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-bold text-xl text-gray-900 mb-2 leading-tight">
                          {firstSpot.title}
                        </h3>
                        {firstSpot.spotNumber && (
                          <p className="text-sm text-gray-600 mb-2">
                            Номер места: <span className="font-medium text-blue-600">{firstSpot.spotNumber}</span>
                          </p>
                        )}
                        <p className="text-sm text-gray-700 mb-3 flex items-start gap-1.5">
                          <span className="text-base">📍</span>
                          <span className="flex-1">{firstSpot.address}</span>
                        </p>
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {formatPrice(firstSpot.pricePerHour)}
                        </div>
                      </div>
                      
                      {firstSpot.photos.length > 0 && (
                        <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                          <img 
                            src={firstSpot.photos[0].url} 
                            alt={firstSpot.title}
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      )}
                      
                      {getFeatures(firstSpot).length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-800 mb-2">
                            Особенности:
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {getFeatures(firstSpot).map((feature, index) => (
                              <span 
                                key={index}
                                className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-md border border-blue-200"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="pt-3 border-t border-gray-200">
                        <a 
                          href={`/spots/${firstSpot.id}`}
                          className="inline-block w-full text-center bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm font-semibold shadow-sm"
                        >
                          Подробнее
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}