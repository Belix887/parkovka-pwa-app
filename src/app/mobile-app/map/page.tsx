"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function MobileMapPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Имитируем загрузку карты
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

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
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🗺️</div>
        <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Загрузка карты...</h2>
        <p style={{ color: '#94a3b8', textAlign: 'center' }}>Подготавливаем интерактивную карту</p>
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
          Интерактивная карта
        </h1>
        <p style={{
          color: '#94a3b8',
          fontSize: '16px'
        }}>
          Найдите парковку рядом с вами
        </p>
      </div>

      {/* Заглушка карты */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        height: '400px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Имитация карты */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: 'linear-gradient(45deg, #1a1a2e 25%, #16213e 25%, #16213e 50%, #1a1a2e 50%, #1a1a2e 75%, #16213e 75%)',
          backgroundSize: '20px 20px',
          opacity: '0.3'
        }} />
        
        {/* Маркеры парковок */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '30%',
          width: '12px',
          height: '12px',
          background: '#3b82f6',
          borderRadius: '50%',
          border: '2px solid white',
          boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
        }} />
        
        <div style={{
          position: 'absolute',
          top: '40%',
          right: '25%',
          width: '12px',
          height: '12px',
          background: '#8b5cf6',
          borderRadius: '50%',
          border: '2px solid white',
          boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)'
        }} />
        
        <div style={{
          position: 'absolute',
          bottom: '30%',
          left: '20%',
          width: '12px',
          height: '12px',
          background: '#10b981',
          borderRadius: '50%',
          border: '2px solid white',
          boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
        }} />

        {/* Центральный контент */}
        <div style={{
          position: 'relative',
          zIndex: '1',
          textAlign: 'center',
          background: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
          <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Карта загружена</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Интерактивная карта с парковочными местами
          </p>
        </div>
      </div>

      {/* Контролы карты */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '20px'
      }}>
        <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Управление картой</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px'
        }}>
          <button style={{
            background: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid #3b82f6',
            borderRadius: '8px',
            padding: '12px',
            color: 'white',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📍 Моё местоположение
          </button>
          <button style={{
            background: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid #3b82f6',
            borderRadius: '8px',
            padding: '12px',
            color: 'white',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🔍 Поиск рядом
          </button>
          <button style={{
            background: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid #3b82f6',
            borderRadius: '8px',
            padding: '12px',
            color: 'white',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🚗 Доступные места
          </button>
          <button style={{
            background: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid #3b82f6',
            borderRadius: '8px',
            padding: '12px',
            color: 'white',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ⏰ Ближайшие
          </button>
        </div>
      </div>

      {/* Легенда */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '20px'
      }}>
        <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Легенда</h3>
        <div style={{ display: 'grid', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              background: '#3b82f6',
              borderRadius: '50%',
              border: '2px solid white'
            }} />
            <span style={{ fontSize: '14px' }}>Доступные места</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              background: '#8b5cf6',
              borderRadius: '50%',
              border: '2px solid white'
            }} />
            <span style={{ fontSize: '14px' }}>Занятые места</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              background: '#10b981',
              borderRadius: '50%',
              border: '2px solid white'
            }} />
            <span style={{ fontSize: '14px' }}>Премиум места</span>
          </div>
        </div>
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