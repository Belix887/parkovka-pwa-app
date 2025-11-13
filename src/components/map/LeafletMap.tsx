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
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: white;
      font-weight: bold;
    ">P</div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
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
        
        {mapSpots.length > 0 && mapSpots.filter(spot => 
          spot && 
          typeof spot.geoLat === 'number' && 
          typeof spot.geoLng === 'number' &&
          !isNaN(spot.geoLat) && 
          !isNaN(spot.geoLng) &&
          spot.geoLat >= -90 && spot.geoLat <= 90 &&
          spot.geoLng >= -180 && spot.geoLng <= 180
        ).map((spot) => (
          <Marker 
            key={spot.id} 
            position={[spot.geoLat, spot.geoLng] as [number, number]} 
            icon={parkingIcon}
          >
            <Popup>
              <div className="p-3 min-w-[250px]">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 mb-1">
                      {spot.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      📍 {spot.address}
                    </p>
                    <div className="text-lg font-bold text-blue-600">
                      {formatPrice(spot.pricePerHour)}
                    </div>
                  </div>
                  
                  {spot.photos.length > 0 && (
                    <div className="rounded-lg overflow-hidden">
                      <img 
                        src={spot.photos[0].url} 
                        alt={spot.title}
                        className="w-full h-24 object-cover"
                      />
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">
                      Особенности:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {getFeatures(spot).map((feature, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <a 
                      href={`/spots/${spot.id}`}
                      className="inline-block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Подробнее
                    </a>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}