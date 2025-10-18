"use client";
import dynamic from "next/dynamic";
import { MotionCard, CardHeader, CardContent } from "@/components/ui/MotionCard";
import { InteractiveFilters } from "@/components/ui/InteractiveFilters";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";

const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), { ssr: false });

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Красивый градиентный фон */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-primary)] opacity-10"></div>
        
        {/* Анимированные частицы */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-2 h-2 bg-[var(--accent-primary)] rounded-full animate-pulse opacity-60"></div>
          <div className="absolute top-40 right-20 w-1 h-1 bg-[var(--accent-secondary)] rounded-full animate-pulse opacity-40" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-60 left-1/4 w-1.5 h-1.5 bg-[var(--accent-success)] rounded-full animate-pulse opacity-50" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-80 right-1/3 w-1 h-1 bg-[var(--accent-warning)] rounded-full animate-pulse opacity-30" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-32 right-10 w-2 h-2 bg-[var(--accent-primary)] rounded-full animate-pulse opacity-40" style={{ animationDelay: '1.5s' }}></div>
        </div>
        
        {/* Декоративные элементы */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-[var(--accent-primary)] to-transparent rounded-full opacity-5 blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-tl from-[var(--accent-secondary)] to-transparent rounded-full opacity-5 blur-xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-primary)] rounded-full opacity-3 blur-2xl"></div>
        </div>
        <div className="container relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-8 animate-fade-in-up">
              <Logo href="/" size="lg" showText={true} className="hover:scale-110 transition-transform duration-300" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up">
              <span className="text-white drop-shadow-2xl">Найдите идеальное</span>
              <br />
              <span className="bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-primary)] bg-clip-text text-transparent drop-shadow-lg">парковочное место</span>
            </h1>
            <p className="text-xl text-white mb-8 animate-fade-in-up drop-shadow-lg" style={{ animationDelay: '0.2s' }}>
              Арендуйте частные парковочные места или сдавайте свои в аренду. 
              Быстро, удобно и безопасно.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Link 
                href="/spots/create" 
                className="group relative px-8 py-4 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-secondary)] to-[var(--accent-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative z-10 flex items-center gap-2">
                  <span className="text-xl">🚀</span>
                  Сдать место
                </span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </Link>
              <Link 
                href="#catalog" 
                className="group relative px-8 py-4 border-2 border-[var(--accent-primary)] text-[var(--accent-primary)] rounded-2xl hover:bg-[var(--accent-primary)] hover:text-white transition-all duration-500 font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-[var(--accent-primary)] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                <span className="relative z-10 flex items-center gap-2">
                  <span className="text-xl">🔍</span>
                  Найти место
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[var(--bg-secondary)]">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4 drop-shadow-lg">
              Почему выбирают нас?
            </h2>
            <p className="text-[var(--text-primary)] text-lg max-w-2xl mx-auto font-medium">
              Мы делаем аренду парковочных мест простой и выгодной для всех
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <MotionCard className="text-center group hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0.1s' }}>
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative w-full h-full rounded-2xl bg-[var(--accent-primary)] bg-opacity-20 flex items-center justify-center text-[var(--accent-primary)] text-3xl group-hover:scale-110 transition-transform duration-300">
                  🚗
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--accent-primary)] rounded-full flex items-center justify-center text-white text-sm font-bold">
                  ✓
                </div>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent-primary)] transition-colors duration-300 drop-shadow-sm">
                Удобный поиск
              </h3>
              <p className="text-[var(--text-primary)] group-hover:text-[var(--text-primary)] transition-colors duration-300 font-medium">
                Находите парковочные места рядом с нужным адресом с помощью интерактивной карты
              </p>
            </MotionCard>

            <MotionCard className="text-center group hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0.2s' }}>
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-success)] to-[var(--accent-primary)] rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative w-full h-full rounded-2xl bg-[var(--accent-success)] bg-opacity-20 flex items-center justify-center text-[var(--accent-success)] text-3xl group-hover:scale-110 transition-transform duration-300">
                  💰
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--accent-success)] rounded-full flex items-center justify-center text-white text-sm font-bold">
                  ₽
                </div>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent-success)] transition-colors duration-300 drop-shadow-sm">
                Выгодные цены
              </h3>
              <p className="text-[var(--text-primary)] group-hover:text-[var(--text-primary)] transition-colors duration-300 font-medium">
                Арендуйте места по доступным ценам или зарабатывайте на сдаче своего места
              </p>
            </MotionCard>

            <MotionCard className="text-center group hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0.3s' }}>
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-warning)] to-[var(--accent-success)] rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative w-full h-full rounded-2xl bg-[var(--accent-warning)] bg-opacity-20 flex items-center justify-center text-[var(--accent-warning)] text-3xl group-hover:scale-110 transition-transform duration-300">
                  🔒
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--accent-warning)] rounded-full flex items-center justify-center text-white text-sm font-bold">
                  🛡️
                </div>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent-warning)] transition-colors duration-300 drop-shadow-sm">
                Безопасность
              </h3>
              <p className="text-[var(--text-primary)] group-hover:text-[var(--text-primary)] transition-colors duration-300 font-medium">
                Все сделки защищены, проверенные владельцы и гарантия возврата средств
              </p>
            </MotionCard>
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section id="catalog" className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4 drop-shadow-lg">
              Каталог парковок
            </h2>
            <p className="text-[var(--text-primary)] text-lg font-medium">
              Выберите подходящее место из доступных вариантов
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <MotionCard glass>
              <CardHeader 
                title="Интерактивные фильтры" 
                subtitle="Настройте параметры и увидите результаты в реальном времени"
                icon="🔍"
              />
              <CardContent>
                <InteractiveFilters />
              </CardContent>
        </MotionCard>

        <MotionCard>
              <CardHeader 
                title="Карта парковок" 
                subtitle="Интерактивная карта с доступными местами"
                icon="🗺️"
              />
              <CardContent>
                <div className="rounded-xl overflow-hidden h-96">
                  <LeafletMap loadSpots={true} />
                </div>
              </CardContent>
        </MotionCard>
      </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Красивый градиентный фон */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-primary)]"></div>
        
        {/* Анимированные волны */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-5 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-3 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        {/* Декоративные элементы */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full opacity-10 animate-bounce"></div>
          <div className="absolute top-20 right-20 w-16 h-16 bg-white rounded-full opacity-15 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white rounded-full opacity-20 animate-bounce" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-10 right-1/3 w-8 h-8 bg-white rounded-full opacity-25 animate-bounce" style={{ animationDelay: '1.5s' }}></div>
        </div>
        
        <div className="container text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in-up">
            Готовы начать? 🚀
          </h2>
          <p className="text-white text-xl mb-10 opacity-90 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Присоединяйтесь к тысячам пользователей, которые уже экономят на парковке
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Link 
              href="/register" 
              className="group relative px-10 py-5 bg-white text-[var(--accent-primary)] rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
              <span className="relative z-10 flex items-center gap-3">
                <span className="text-2xl">✨</span>
                Зарегистрироваться
              </span>
            </Link>
            <Link 
              href="/login" 
              className="group relative px-10 py-5 border-2 border-white text-white rounded-2xl hover:bg-white hover:text-[var(--accent-primary)] transition-all duration-500 font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              <span className="relative z-10 flex items-center gap-3">
                <span className="text-2xl">🔑</span>
                Войти в аккаунт
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
