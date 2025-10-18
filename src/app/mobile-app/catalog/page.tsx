"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Spot {
  id: string;
  title: string;
  address: string;
  pricePerHour: number;
  features: string[];
  photos?: { url: string }[];
}

export default function MobileCatalogPage() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Моковые данные для демонстрации
    const mockSpots: Spot[] = [
      {
        id: 'spot-1',
        title: 'Парковка у Красной площади',
        address: 'Красная площадь, 1, Москва',
        pricePerHour: 20000,
        features: ['Охрана', 'Видеонаблюдение'],
        photos: [{ url: 'https://images.unsplash.com/photo-1520172313-4272701b72c1?w=800&h=600&fit=crop' }]
      },
      {
        id: 'spot-2',
        title: 'Парковка у ТЦ "Европейский"',
        address: 'Площадь Киевского Вокзала, 2, Москва',
        pricePerHour: 15000,
        features: ['Крытая', 'EV Зарядка'],
        photos: [{ url: 'https://images.unsplash.com/photo-1520172313-4272701b72c1?w=800&h=600&fit=crop' }]
      },
      {
        id: 'spot-3',
        title: 'Парковка у Москва-Сити',
        address: 'Пресненская наб., 10, Москва',
        pricePerHour: 25000,
        features: ['Охрана', 'Широкий въезд'],
        photos: [{ url: 'https://images.unsplash.com/photo-1520172313-4272701b72c1?w=800&h=600&fit=crop' }]
      },
      {
        id: 'spot-4',
        title: 'Парковка у Арбата',
        address: 'Арбат, 15, Москва',
        pricePerHour: 18000,
        features: ['Центр города', 'Пешеходная зона'],
        photos: [{ url: 'https://images.unsplash.com/photo-1520172313-4272701b72c1?w=800&h=600&fit=crop' }]
      },
      {
        id: 'spot-5',
        title: 'Парковка у ВДНХ',
        address: 'Проспект Мира, 119, Москва',
        pricePerHour: 12000,
        features: ['Большая территория', 'Рядом с метро'],
        photos: [{ url: 'https://images.unsplash.com/photo-1520172313-4272701b72c1?w=800&h=600&fit=crop' }]
      }
    ];

    // Имитируем загрузку
    setTimeout(() => {
      setSpots(mockSpots);
      setLoading(false);
    }, 1000);
  }, []);

  const formatPrice = (price: number) => {
    return `${(price / 100).toLocaleString('ru-RU')} ₽/час`;
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1a2e 50%, #16213e 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '20px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
        <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Загрузка каталога...</h2>
        <p style={{ color: '#94a3b8', textAlign: 'center' }}>Ищем лучшие парковочные места для вас</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1a2e 50%, #16213e 100%)',
      color: 'white',
      padding: '20px'
    }}>
      {/* Заголовок */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        padding: '20px 0'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          marginBottom: '10px',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Каталог парковок
        </h1>
        <p style={{
          color: '#94a3b8',
          fontSize: '16px'
        }}>
          Найдено {spots.length} парковочных мест
        </p>
      </div>

      {/* Фильтры */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '20px'
      }}>
        <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Фильтры</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px'
        }}>
          <button style={{
            background: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid #3b82f6',
            borderRadius: '8px',
            padding: '8px 12px',
            color: 'white',
            fontSize: '14px'
          }}>
            🔒 Охрана
          </button>
          <button style={{
            background: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid #3b82f6',
            borderRadius: '8px',
            padding: '8px 12px',
            color: 'white',
            fontSize: '14px'
          }}>
            🏠 Крытая
          </button>
          <button style={{
            background: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid #3b82f6',
            borderRadius: '8px',
            padding: '8px 12px',
            color: 'white',
            fontSize: '14px'
          }}>
            ⚡ EV Зарядка
          </button>
          <button style={{
            background: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid #3b82f6',
            borderRadius: '8px',
            padding: '8px 12px',
            color: 'white',
            fontSize: '14px'
          }}>
            📍 Центр
          </button>
        </div>
      </div>

      {/* Список парковок */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {spots.map((spot) => (
          <Link 
            key={spot.id} 
            href={`/mobile-app/spots/${spot.id}`}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              overflow: 'hidden',
              textDecoration: 'none',
              color: 'white',
              transition: 'all 0.3s',
              display: 'block'
            }}
          >
            <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
              <img 
                src={spot.photos?.[0]?.url || 'https://via.placeholder.com/400x200'} 
                alt={spot.title}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover' 
                }}
              />
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(0, 0, 0, 0.7)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#3b82f6'
              }}>
                {formatPrice(spot.pricePerHour)}
              </div>
            </div>
            
            <div style={{ padding: '16px' }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                marginBottom: '8px',
                color: 'white'
              }}>
                {spot.title}
              </h3>
              
              <p style={{ 
                fontSize: '14px', 
                color: '#94a3b8', 
                marginBottom: '12px',
                lineHeight: '1.4'
              }}>
                📍 {spot.address}
              </p>
              
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px'
              }}>
                {spot.features.map((feature, index) => (
                  <span 
                    key={index}
                    style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      color: '#3b82f6'
                    }}
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Кнопка "Назад" */}
      <div style={{
        textAlign: 'center',
        marginTop: '30px',
        paddingBottom: '20px'
      }}>
        <Link 
          href="/"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '12px 24px',
            textDecoration: 'none',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'inline-block'
          }}
        >
          ← Назад на главную
        </Link>
      </div>
    </div>
  );
}
