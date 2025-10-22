"use client";

import Link from "next/link";
import { PWAInstallButton } from "@/components/pwa/PWAComponents";
import { MobileNavigation } from "@/components/ui/MobileNavigation";
import { getCurrentUser } from "@/lib/auth";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)] w-full max-w-full overflow-x-hidden">
      {/* Мобильная навигация */}
      <MobileNavigation />
      
      {/* Основной контент с отступом для мобильной шапки */}
      <div className="pt-14 md:pt-0 w-full max-w-full">
        <div className="container w-full max-w-full">
          {/* Приветственная секция */}
          <section className="text-center py-4 md:py-12 mb-3 md:mb-8 w-full max-w-full">
            <div className="bg-gradient-to-r from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 rounded-lg md:rounded-3xl p-3 md:p-12 w-full max-w-full">
              <h1 className="text-lg md:text-4xl font-bold mb-2 md:mb-6 leading-tight break-words">
                Найдите идеальное
                <span className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
                  {" "}парковочное место
                </span>
              </h1>
              <p className="text-[var(--text-secondary)] text-xs md:text-lg leading-relaxed max-w-full break-words">
                Арендуйте частные парковочные места или сдавайте свои в аренду
              </p>
            </div>
          </section>


          {/* Быстрые действия */}
          <section className="mb-3 md:mb-8 w-full max-w-full">
            <h2 className="text-base md:text-2xl font-bold text-[var(--text-primary)] mb-3 md:mb-6 text-center break-words">
              Быстрые действия
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-6 w-full max-w-full">
              <Link 
                href="/catalog" 
                className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-lg md:rounded-2xl p-2 md:p-6 text-center transition-all duration-300 hover:bg-[var(--bg-card)] hover:scale-105 min-h-[80px] md:min-h-[140px] flex flex-col items-center justify-center w-full max-w-full"
              >
                <div className="text-xl md:text-4xl mb-1 md:mb-3">🚗</div>
                <h3 className="text-xs md:text-base font-bold text-[var(--text-primary)] mb-1 break-words">
                  Найти парковку
                </h3>
                <p className="text-xs md:text-sm text-[var(--text-secondary)] break-words">
                  Поиск по городу
                </p>
              </Link>
              
              <Link 
                href="/map" 
                className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-lg md:rounded-2xl p-2 md:p-6 text-center transition-all duration-300 hover:bg-[var(--bg-card)] hover:scale-105 min-h-[80px] md:min-h-[140px] flex flex-col items-center justify-center w-full max-w-full"
              >
                <div className="text-xl md:text-4xl mb-1 md:mb-3">🗺️</div>
                <h3 className="text-xs md:text-base font-bold text-[var(--text-primary)] mb-1 break-words">
                  Карта
                </h3>
                <p className="text-xs md:text-sm text-[var(--text-secondary)] break-words">
                  Интерактивная карта
                </p>
              </Link>
              
              <Link 
                href="/spots/create" 
                className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-lg md:rounded-2xl p-2 md:p-6 text-center transition-all duration-300 hover:bg-[var(--bg-card)] hover:scale-105 min-h-[80px] md:min-h-[140px] flex flex-col items-center justify-center w-full max-w-full"
              >
                <div className="text-xl md:text-4xl mb-1 md:mb-3">➕</div>
                <h3 className="text-xs md:text-base font-bold text-[var(--text-primary)] mb-1 break-words">
                  Сдать место
                </h3>
                <p className="text-xs md:text-sm text-[var(--text-secondary)] break-words">
                  Добавить парковку
                </p>
              </Link>
              
              <Link 
                href="/pwa-install" 
                className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-lg md:rounded-2xl p-2 md:p-6 text-center transition-all duration-300 hover:bg-[var(--bg-card)] hover:scale-105 min-h-[80px] md:min-h-[140px] flex flex-col items-center justify-center w-full max-w-full"
              >
                <div className="text-xl md:text-4xl mb-1 md:mb-3">📱</div>
                <h3 className="text-xs md:text-base font-bold text-[var(--text-primary)] mb-1 break-words">
                  Установить приложение
                </h3>
                <p className="text-xs md:text-sm text-[var(--text-secondary)] break-words">
                  PWA инструкции
                </p>
              </Link>
            </div>
          </section>

          {/* Популярные места */}
          <section className="mb-4 md:mb-12 w-full max-w-full">
            <h2 className="text-base md:text-2xl font-bold text-[var(--text-primary)] mb-3 md:mb-6 text-center break-words">
              Популярные места
            </h2>
            <div className="space-y-2 md:space-y-6 w-full max-w-full">
              <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-lg md:rounded-2xl overflow-hidden transition-all duration-300 hover:bg-[var(--bg-card)] w-full max-w-full">
                <div className="h-20 md:h-40 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1520172313-4272701b72c1?w=800&h=600&fit=crop" 
                    alt="Парковка у Красной площади"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2 md:p-6">
                  <h3 className="text-sm md:text-xl font-bold text-[var(--text-primary)] mb-1 md:mb-2 break-words">
                    Парковка у Красной площади
                  </h3>
                  <p className="text-xs md:text-base text-[var(--text-secondary)] mb-1 md:mb-3 break-words">
                    Красная площадь, 1, Москва
                  </p>
                  <p className="text-sm md:text-lg font-bold text-[var(--accent-primary)]">
                    200 ₽/час
                  </p>
                </div>
              </div>
              
              <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-lg md:rounded-2xl overflow-hidden transition-all duration-300 hover:bg-[var(--bg-card)] w-full max-w-full">
                <div className="h-20 md:h-40 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1520172313-4272701b72c1?w=800&h=600&fit=crop" 
                    alt="Парковка у ТЦ"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2 md:p-6">
                  <h3 className="text-sm md:text-xl font-bold text-[var(--text-primary)] mb-1 md:mb-2 break-words">
                    Парковка у ТЦ
                  </h3>
                  <p className="text-xs md:text-base text-[var(--text-secondary)] mb-1 md:mb-3 break-words">
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