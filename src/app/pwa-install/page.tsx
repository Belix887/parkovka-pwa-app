"use client";

import { PWAInstallButton } from "@/components/pwa/PWAComponents";
import { MobileNavigation } from "@/components/ui/MobileNavigation";
import { MotionCard, CardHeader, CardContent } from "@/components/ui/MotionCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function PWAInstallPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)] w-full max-w-full overflow-x-hidden">
      {/* Мобильная навигация */}
      <MobileNavigation />
      
      {/* Основной контент с отступом для мобильной шапки */}
      <div className="pt-14 md:pt-0 w-full max-w-full">
        <div className="container w-full max-w-full">
          {/* Заголовок страницы */}
          <section className="text-center py-4 md:py-8 mb-4 md:mb-8 w-full max-w-full">
            <div className="bg-gradient-to-r from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 rounded-lg md:rounded-3xl p-4 md:p-8 w-full max-w-full">
              <div className="text-4xl md:text-8xl mb-4 md:mb-6">📱</div>
              <h1 className="text-xl md:text-4xl font-bold mb-3 md:mb-4 leading-tight break-words">
                Установите приложение
              </h1>
              <p className="text-[var(--text-secondary)] text-sm md:text-lg leading-relaxed max-w-full break-words">
                Добавьте приложение на главный экран для быстрого доступа
              </p>
            </div>
          </section>

          {/* Основная карточка установки */}
          <section className="mb-4 md:mb-8 w-full max-w-full">
            <MotionCard className="mobile-card">
              <CardHeader 
                title="Установка приложения" 
                subtitle="Следуйте инструкциям для вашего устройства"
                icon="📱"
              />
              <CardContent>
                <div className="text-center mb-6">
                  <PWAInstallButton />
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-[var(--bg-tertiary)] rounded-xl">
                    <h3 className="font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                      <span className="text-lg">📱</span>
                      Для мобильных устройств
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Нажмите кнопку "Установить приложение" выше, затем следуйте инструкциям браузера
                    </p>
                  </div>
                  
                  <div className="p-4 bg-[var(--bg-tertiary)] rounded-xl">
                    <h3 className="font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                      <span className="text-lg">💻</span>
                      Для компьютеров
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Приложение будет добавлено в меню "Пуск" или на рабочий стол
                    </p>
                  </div>
                </div>
              </CardContent>
            </MotionCard>
          </section>

          {/* Подробные инструкции */}
          <section className="mb-4 md:mb-8 w-full max-w-full">
            <MotionCard className="mobile-card">
              <CardHeader 
                title="Подробные инструкции" 
                subtitle="Пошаговое руководство по установке"
                icon="📋"
              />
              <CardContent>
                <div className="space-y-6">
                  {/* Android Chrome */}
                  <div className="p-4 bg-[var(--bg-tertiary)] rounded-xl">
                    <h3 className="font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                      <span className="text-lg">🤖</span>
                      Android (Chrome)
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-[var(--text-secondary)]">
                      <li>Нажмите кнопку "Установить приложение"</li>
                      <li>В появившемся диалоге нажмите "Добавить на главный экран"</li>
                      <li>Подтвердите установку</li>
                      <li>Приложение появится на главном экране</li>
                    </ol>
                  </div>

                  {/* iOS Safari */}
                  <div className="p-4 bg-[var(--bg-tertiary)] rounded-xl">
                    <h3 className="font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                      <span className="text-lg">🍎</span>
                      iOS (Safari)
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-[var(--text-secondary)]">
                      <li>Нажмите кнопку "Установить приложение"</li>
                      <li>Нажмите кнопку "Поделиться" внизу экрана</li>
                      <li>Выберите "На экран Домой"</li>
                      <li>Нажмите "Добавить"</li>
                    </ol>
                  </div>

                  {/* Desktop */}
                  <div className="p-4 bg-[var(--bg-tertiary)] rounded-xl">
                    <h3 className="font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                      <span className="text-lg">💻</span>
                      Компьютер (Chrome/Edge)
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-[var(--text-secondary)]">
                      <li>Нажмите кнопку "Установить приложение"</li>
                      <li>В адресной строке появится иконка установки</li>
                      <li>Нажмите на иконку установки</li>
                      <li>Подтвердите установку</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </MotionCard>
          </section>

          {/* Преимущества PWA */}
          <section className="mb-4 md:mb-8 w-full max-w-full">
            <MotionCard className="mobile-card">
              <CardHeader 
                title="Преимущества приложения" 
                subtitle="Почему стоит установить наше приложение"
                icon="✨"
              />
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[var(--bg-tertiary)] rounded-xl">
                    <div className="text-2xl mb-2">🚀</div>
                    <h3 className="font-bold text-[var(--text-primary)] mb-2">Быстрый доступ</h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Запуск приложения одним касанием с главного экрана
                    </p>
                  </div>
                  
                  <div className="p-4 bg-[var(--bg-tertiary)] rounded-xl">
                    <div className="text-2xl mb-2">📱</div>
                    <h3 className="font-bold text-[var(--text-primary)] mb-2">Нативный вид</h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Выглядит и работает как обычное мобильное приложение
                    </p>
                  </div>
                  
                  <div className="p-4 bg-[var(--bg-tertiary)] rounded-xl">
                    <div className="text-2xl mb-2">🔔</div>
                    <h3 className="font-bold text-[var(--text-primary)] mb-2">Уведомления</h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Получайте уведомления о бронированиях и статусах
                    </p>
                  </div>
                  
                  <div className="p-4 bg-[var(--bg-tertiary)] rounded-xl">
                    <div className="text-2xl mb-2">💾</div>
                    <h3 className="font-bold text-[var(--text-primary)] mb-2">Офлайн режим</h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Работает даже при слабом интернет-соединении
                    </p>
                  </div>
                </div>
              </CardContent>
            </MotionCard>
          </section>

          {/* Отладочная информация */}
          <section className="mb-4 md:mb-8 w-full max-w-full">
            <MotionCard className="mobile-card">
              <CardHeader 
                title="Отладочная информация" 
                subtitle="Техническая информация для разработчиков"
                icon="🔧"
              />
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-[var(--bg-tertiary)] rounded-xl">
                    <h3 className="font-bold text-[var(--text-primary)] mb-2">Статус PWA</h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Приложение поддерживает все основные функции PWA
                    </p>
                  </div>
                  
                  <div className="p-4 bg-[var(--bg-tertiary)] rounded-xl">
                    <h3 className="font-bold text-[var(--text-primary)] mb-2">Поддерживаемые браузеры</h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Chrome, Safari, Firefox, Edge (последние версии)
                    </p>
                  </div>
                  
                  <div className="p-4 bg-[var(--bg-tertiary)] rounded-xl">
                    <h3 className="font-bold text-[var(--text-primary)] mb-2">Размер приложения</h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      ~2.5 MB (без кэширования данных)
                    </p>
                  </div>
                </div>
              </CardContent>
            </MotionCard>
          </section>

          {/* Кнопка возврата */}
          <section className="mb-6 md:mb-12 w-full max-w-full">
            <div className="text-center">
              <Link href="/">
                <Button variant="outline" size="lg" className="mobile-btn" icon="🏠">
                  Вернуться на главную
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
