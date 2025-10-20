"use client";

import Link from "next/link";
import { PWAInstallButton } from "@/components/pwa/PWAComponents";

export default function HomePage() {
  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1a2e 50%, #16213e 100%)',
      color: 'white',
      padding: '20px'
    }}>
      {/* Приветственная секция */}
      <section style={{
        textAlign: 'center',
        padding: '40px 0',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
        borderRadius: '24px',
        marginBottom: '30px'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          marginBottom: '16px',
          lineHeight: '1.2'
        }}>
          Найдите идеальное
          <span style={{
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}> парковочное место</span>
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#94a3b8',
          lineHeight: '1.5',
          marginBottom: '0'
        }}>
          Арендуйте частные парковочные места или сдавайте свои в аренду
        </p>
      </section>

      {/* PWA Install Section */}
      <section style={{
        background: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '24px 20px',
        margin: '20px 0',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>📱</div>
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '8px'
            }}>Установите приложение</h2>
            <p style={{
              color: '#94a3b8',
              fontSize: '16px',
              lineHeight: '1.4',
              marginBottom: '16px'
            }}>
              Добавьте приложение на главный экран для быстрого доступа
            </p>
          </div>
          <PWAInstallButton />
        </div>
      </section>

      {/* Быстрые действия */}
      <section style={{ margin: '30px 0' }}>
        <h2 style={{
          fontSize: '22px',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '20px',
          textAlign: 'center'
        }}>Быстрые действия</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px'
        }}>
          <Link href="/catalog" style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '20px',
            textDecoration: 'none',
            color: 'white',
            transition: 'all 0.3s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            minHeight: '120px',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🚗</div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0', color: 'white' }}>Найти парковку</h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0' }}>Поиск по городу</p>
            </div>
          </Link>
          
          <Link href="/map" style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '20px',
            textDecoration: 'none',
            color: 'white',
            transition: 'all 0.3s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            minHeight: '120px',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🗺️</div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0', color: 'white' }}>Карта</h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0' }}>Интерактивная карта</p>
            </div>
          </Link>
          
          <Link href="/spots/create" style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '20px',
            textDecoration: 'none',
            color: 'white',
            transition: 'all 0.3s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            minHeight: '120px',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>➕</div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0', color: 'white' }}>Сдать место</h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0' }}>Добавить парковку</p>
            </div>
          </Link>
          
          <Link href="/pwa-demo" style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '20px',
            textDecoration: 'none',
            color: 'white',
            transition: 'all 0.3s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            minHeight: '120px',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🚀</div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0', color: 'white' }}>PWA Демо</h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0' }}>Тестирование функций</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Популярные места */}
      <section style={{ margin: '30px 0' }}>
        <h2 style={{
          fontSize: '22px',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '20px',
          textAlign: 'center'
        }}>Популярные места</h2>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            overflow: 'hidden',
            transition: 'all 0.3s'
          }}>
            <div style={{ height: '120px', overflow: 'hidden', position: 'relative' }}>
              <img 
                src="https://images.unsplash.com/photo-1520172313-4272701b72c1?w=800&h=600&fit=crop" 
                alt="Парковка у Красной площади"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', margin: '0 0 8px 0' }}>Парковка у Красной площади</h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 8px 0' }}>Красная площадь, 1, Москва</p>
              <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#3b82f6', margin: '0' }}>200 ₽/час</p>
            </div>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            overflow: 'hidden',
            transition: 'all 0.3s'
          }}>
            <div style={{ height: '120px', overflow: 'hidden', position: 'relative' }}>
              <img 
                src="https://images.unsplash.com/photo-1520172313-4272701b72c1?w=800&h=600&fit=crop" 
                alt="Парковка у ТЦ"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', margin: '0 0 8px 0' }}>Парковка у ТЦ</h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 8px 0' }}>Тверская улица, 15, Москва</p>
              <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#3b82f6', margin: '0' }}>150 ₽/час</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}