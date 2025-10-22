"use client";

import Link from "next/link";
import { PWAInstallButton } from "@/components/pwa/PWAComponents";
import { MobileNavigation } from "@/components/ui/MobileNavigation";
import { getCurrentUser } from "@/lib/auth";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)]">
      {/* Мобильная навигация */}
      <MobileNavigation />
      
      {/* Основной контент с отступом для мобильной шапки */}
      <div className="pt-14 md:pt-0">
        <div className="container">
          {/* Приветственная секция */}
          <section className="text-center py-6 md:py-12 mb-4 md:mb-8">
            <div className="bg-gradient-to-r from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 rounded-xl md:rounded-3xl p-4 md:p-12">
              <h1 className="text-xl md:text-4xl font-bold mb-3 md:mb-6 leading-tight">
                Найдите идеальное
                <span className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
                  {" "}парковочное место
                </span>
              </h1>
              <p className="text-[var(--text-secondary)] text-sm md:text-lg leading-relaxed max-w-2xl mx-auto">
                Арендуйте частные парковочные места или сдавайте свои в аренду
              </p>
            </div>
          </section>

          {/* PWA Install Section */}
          <section className="bg-[var(--bg-surface)] backdrop-blur-xl rounded-xl md:rounded-2xl p-4 md:p-8 mb-4 md:mb-8 border border-[var(--border-primary)]">
            <div className="text-center">
              <div className="text-3xl md:text-6xl mb-3 md:mb-4">📱</div>
              <h2 className="text-lg md:text-2xl font-bold text-[var(--text-primary)] mb-2 md:mb-3">
                Установите приложение
              </h2>
              <p className="text-[var(--text-secondary)] text-xs md:text-base mb-4 md:mb-6 max-w-md mx-auto">
                Добавьте приложение на главный экран для быстрого доступа
              </p>
              <PWAInstallButton />
            </div>
          </section>

          {/* Быстрые действия */}
          <section className="mb-4 md:mb-8">
            <h2 className="text-lg md:text-2xl font-bold text-[var(--text-primary)] mb-4 md:mb-6 text-center">
              Быстрые действия
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              <Link 
                href="/catalog" 
                className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl md:rounded-2xl p-3 md:p-6 text-center transition-all duration-300 hover:bg-[var(--bg-card)] hover:scale-105 min-h-[100px] md:min-h-[140px] flex flex-col items-center justify-center"
              >
                <div className="text-2xl md:text-4xl mb-2 md:mb-3">🚗</div>
                <h3 className="text-xs md:text-base font-bold text-[var(--text-primary)] mb-1">
                  Найти парковку
                </h3>
                <p className="text-xs md:text-sm text-[var(--text-secondary)]">
                  Поиск по городу
                </p>
              </Link>
              
              <Link 
                href="/map" 
                className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl md:rounded-2xl p-3 md:p-6 text-center transition-all duration-300 hover:bg-[var(--bg-card)] hover:scale-105 min-h-[100px] md:min-h-[140px] flex flex-col items-center justify-center"
              >
                <div className="text-2xl md:text-4xl mb-2 md:mb-3">🗺️</div>
                <h3 className="text-xs md:text-base font-bold text-[var(--text-primary)] mb-1">
                  Карта
                </h3>
                <p className="text-xs md:text-sm text-[var(--text-secondary)]">
                  Интерактивная карта
                </p>
              </Link>
              
              <Link 
                href="/spots/create" 
                className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl md:rounded-2xl p-3 md:p-6 text-center transition-all duration-300 hover:bg-[var(--bg-card)] hover:scale-105 min-h-[100px] md:min-h-[140px] flex flex-col items-center justify-center"
              >
                <div className="text-2xl md:text-4xl mb-2 md:mb-3">➕</div>
                <h3 className="text-xs md:text-base font-bold text-[var(--text-primary)] mb-1">
                  Сдать место
                </h3>
                <p className="text-xs md:text-sm text-[var(--text-secondary)]">
                  Добавить парковку
                </p>
              </Link>
              
              <Link 
                href="/pwa-demo" 
                className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl md:rounded-2xl p-3 md:p-6 text-center transition-all duration-300 hover:bg-[var(--bg-card)] hover:scale-105 min-h-[100px] md:min-h-[140px] flex flex-col items-center justify-center"
              >
                <div className="text-2xl md:text-4xl mb-2 md:mb-3">🚀</div>
                <h3 className="text-xs md:text-base font-bold text-[var(--text-primary)] mb-1">
                  PWA Демо
                </h3>
                <p className="text-xs md:text-sm text-[var(--text-secondary)]">
                  Тестирование функций
                </p>
              </Link>
            </div>
          </section>

          {/* Популярные места */}
          <section className="mb-6 md:mb-12">
            <h2 className="text-lg md:text-2xl font-bold text-[var(--text-primary)] mb-4 md:mb-6 text-center">
              Популярные места
            </h2>
            <div className="space-y-3 md:space-y-6">
              <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl md:rounded-2xl overflow-hidden transition-all duration-300 hover:bg-[var(--bg-card)]">
                <div className="h-24 md:h-40 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1520172313-4272701b72c1?w=800&h=600&fit=crop" 
                    alt="Парковка у Красной площади"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 md:p-6">
                  <h3 className="text-sm md:text-xl font-bold text-[var(--text-primary)] mb-1 md:mb-2">
                    Парковка у Красной площади
                  </h3>
                  <p className="text-xs md:text-base text-[var(--text-secondary)] mb-2 md:mb-3">
                    Красная площадь, 1, Москва
                  </p>
                  <p className="text-sm md:text-lg font-bold text-[var(--accent-primary)]">
                    200 ₽/час
                  </p>
                </div>
              </div>
              
              <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl md:rounded-2xl overflow-hidden transition-all duration-300 hover:bg-[var(--bg-card)]">
                <div className="h-24 md:h-40 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1520172313-4272701b72c1?w=800&h=600&fit=crop" 
                    alt="Парковка у ТЦ"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 md:p-6">
                  <h3 className="text-sm md:text-xl font-bold text-[var(--text-primary)] mb-1 md:mb-2">
                    Парковка у ТЦ
                  </h3>
                  <p className="text-xs md:text-base text-[var(--text-secondary)] mb-2 md:mb-3">
                    Тверская улица, 15, Москва
                  </p>
                  <p className="text-sm md:text-lg font-bold text-[var(--accent-primary)]">
                    150 ₽/час
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}