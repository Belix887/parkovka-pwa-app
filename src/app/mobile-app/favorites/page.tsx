"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FavoriteSpot {
  id: string;
  title: string;
  address: string;
  pricePerHour: number;
  image: string;
  features: string[];
  rating: number;
  distance: number;
  isAvailable: boolean;
  addedAt: string;
}

export default function MobileFavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"added" | "price" | "distance" | "rating">("added");
  const [filterBy, setFilterBy] = useState<"all" | "available" | "unavailable">("all");
  const router = useRouter();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      // Имитация загрузки избранного
      setTimeout(() => {
        const mockFavorites: FavoriteSpot[] = [
          {
            id: "1",
            title: "Парковка у Красной площади",
            address: "Красная площадь, 1, Москва",
            pricePerHour: 200,
            image: "/api/placeholder/400/300",
            features: ["Крытая", "Охраняемая", "Камеры"],
            rating: 4.8,
            distance: 0.5,
            isAvailable: true,
            addedAt: "2024-01-15T10:00:00",
          },
          {
            id: "2",
            title: "Крытая парковка в ТЦ",
            address: "Тверская, 15, Москва",
            pricePerHour: 150,
            image: "/api/placeholder/400/300",
            features: ["Крытая", "Охраняемая", "Для инвалидов"],
            rating: 4.6,
            distance: 1.2,
            isAvailable: false,
            addedAt: "2024-01-14T15:30:00",
          },
          {
            id: "3",
            title: "Парковка у парка",
            address: "Парк Горького, Москва",
            pricePerHour: 100,
            image: "/api/placeholder/400/300",
            features: ["Охраняемая", "Камеры"],
            rating: 4.9,
            distance: 2.1,
            isAvailable: true,
            addedAt: "2024-01-13T12:00:00",
          },
          {
            id: "4",
            title: "Парковка у ВДНХ",
            address: "Проспект Мира, 119, Москва",
            pricePerHour: 80,
            image: "/api/placeholder/400/300",
            features: ["Крытая", "Охраняемая", "Зарядка ЭВ"],
            rating: 4.7,
            distance: 3.5,
            isAvailable: true,
            addedAt: "2024-01-12T09:00:00",
          },
        ];

        setFavorites(mockFavorites);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error loading favorites:", error);
      setLoading(false);
    }
  };

  const removeFromFavorites = async (spotId: string) => {
    try {
      // Имитация удаления из избранного
      setTimeout(() => {
        setFavorites(prev => prev.filter(spot => spot.id !== spotId));
      }, 500);
    } catch (error) {
      console.error("Error removing from favorites:", error);
    }
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString("ru-RU")} ₽/час`;
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} м`;
    }
    return `${distance.toFixed(1)} км`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    });
  };

  const sortedAndFilteredFavorites = favorites
    .filter(spot => {
      if (filterBy === "all") return true;
      if (filterBy === "available") return spot.isAvailable;
      if (filterBy === "unavailable") return !spot.isAvailable;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "added":
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        case "price":
          return a.pricePerHour - b.pricePerHour;
        case "distance":
          return a.distance - b.distance;
        case "rating":
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="mobile-favorites-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка избранного...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-favorites-page">
      {/* Заголовок */}
      <div className="favorites-header">
        <div className="header-top">
          <Link href="/mobile-app/profile" className="back-button">
            <span className="back-icon">←</span>
          </Link>
          <h1 className="page-title">Избранное</h1>
          <div className="header-spacer"></div>
        </div>
      </div>

      {/* Статистика */}
      <div className="favorites-stats">
        <div className="stat-item">
          <div className="stat-icon">❤️</div>
          <div className="stat-value">{favorites.length}</div>
          <div className="stat-label">Всего</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{favorites.filter(s => s.isAvailable).length}</div>
          <div className="stat-label">Доступно</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">
            {favorites.length > 0 
              ? (favorites.reduce((sum, s) => sum + s.rating, 0) / favorites.length).toFixed(1)
              : "0"
            }
          </div>
          <div className="stat-label">Средний рейтинг</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">💰</div>
          <div className="stat-value">
            {favorites.length > 0 
              ? Math.round(favorites.reduce((sum, s) => sum + s.pricePerHour, 0) / favorites.length)
              : "0"
            }₽
          </div>
          <div className="stat-label">Средняя цена</div>
        </div>
      </div>

      {/* Фильтры и сортировка */}
      <div className="favorites-controls">
        <div className="filter-section">
          <h3 className="section-title">Фильтр</h3>
          <div className="filter-buttons">
            <button
              className={`filter-button ${filterBy === "all" ? "active" : ""}`}
              onClick={() => setFilterBy("all")}
            >
              Все ({favorites.length})
            </button>
            <button
              className={`filter-button ${filterBy === "available" ? "active" : ""}`}
              onClick={() => setFilterBy("available")}
            >
              Доступно ({favorites.filter(s => s.isAvailable).length})
            </button>
            <button
              className={`filter-button ${filterBy === "unavailable" ? "active" : ""}`}
              onClick={() => setFilterBy("unavailable")}
            >
              Занято ({favorites.filter(s => !s.isAvailable).length})
            </button>
          </div>
        </div>

        <div className="sort-section">
          <h3 className="section-title">Сортировка</h3>
          <div className="sort-buttons">
            <button
              className={`sort-button ${sortBy === "added" ? "active" : ""}`}
              onClick={() => setSortBy("added")}
            >
              По дате добавления
            </button>
            <button
              className={`sort-button ${sortBy === "price" ? "active" : ""}`}
              onClick={() => setSortBy("price")}
            >
              По цене
            </button>
            <button
              className={`sort-button ${sortBy === "distance" ? "active" : ""}`}
              onClick={() => setSortBy("distance")}
            >
              По расстоянию
            </button>
            <button
              className={`sort-button ${sortBy === "rating" ? "active" : ""}`}
              onClick={() => setSortBy("rating")}
            >
              По рейтингу
            </button>
          </div>
        </div>
      </div>

      {/* Список избранного */}
      <div className="favorites-content">
        {sortedAndFilteredFavorites.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">❤️</div>
            <h3>Нет избранных мест</h3>
            <p>
              {filterBy === "all" 
                ? "Добавьте парковочные места в избранное для быстрого доступа" 
                : `Нет ${filterBy === "available" ? "доступных" : "занятых"} мест в избранном`
              }
            </p>
            <Link href="/mobile-app/catalog" className="cta-button">
              Найти парковку
            </Link>
          </div>
        ) : (
          <div className="favorites-list">
            {sortedAndFilteredFavorites.map((spot) => (
              <div key={spot.id} className="favorite-card">
                <div className="card-image">
                  <img src={spot.image} alt={spot.title} />
                  <div className={`availability-badge ${spot.isAvailable ? "available" : "unavailable"}`}>
                    {spot.isAvailable ? "✅ Доступно" : "❌ Занято"}
                  </div>
                  <button
                    className="remove-favorite-btn"
                    onClick={() => removeFromFavorites(spot.id)}
                  >
                    ❤️
                  </button>
                </div>
                
                <div className="card-content">
                  <div className="card-header">
                    <h3 className="card-title">{spot.title}</h3>
                    <div className="card-price">{formatPrice(spot.pricePerHour)}</div>
                  </div>
                  
                  <div className="card-address">
                    <span className="address-icon">📍</span>
                    {spot.address}
                  </div>
                  
                  <div className="card-features">
                    {spot.features.map((feature, index) => (
                      <span key={index} className="feature-tag">
                        {feature === "Крытая" && "🏠"}
                        {feature === "Охраняемая" && "🛡️"}
                        {feature === "Камеры" && "📹"}
                        {feature === "Для инвалидов" && "♿"}
                        {feature === "Зарядка ЭВ" && "🔌"}
                        {feature === "Широкий въезд" && "🚛"}
                        {feature}
                      </span>
                    ))}
                  </div>
                  
                  <div className="card-stats">
                    <div className="stat-item">
                      <span className="stat-icon">⭐</span>
                      <span className="stat-text">{spot.rating}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-icon">📍</span>
                      <span className="stat-text">{formatDistance(spot.distance)}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-icon">📅</span>
                      <span className="stat-text">Добавлено {formatDate(spot.addedAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="card-actions">
                  <button 
                    className="action-button secondary"
                    onClick={() => router.push(`/mobile-app/spots/${spot.id}`)}
                  >
                    Подробнее
                  </button>
                  {spot.isAvailable && (
                    <button 
                      className="action-button primary"
                      onClick={() => router.push(`/mobile-app/spots/${spot.id}`)}
                    >
                      Забронировать
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
