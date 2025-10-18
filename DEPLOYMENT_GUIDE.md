# 🚀 Деплой на Vercel - БЕСПЛАТНО!

## 📋 Пошаговая инструкция

### 1. Подготовка проекта

#### Создайте файл `.env.local` (если нужно):
```bash
# Для продакшена
NEXT_PUBLIC_BASE_URL=https://your-app-name.vercel.app
```

#### Обновите `next.config.ts` для продакшена:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['@/components', '@/lib']
  },
  // PWA configuration
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // Для продакшена
  output: 'standalone',
};

export default nextConfig;
```

### 2. Создание GitHub репозитория

#### Инициализация Git:
```bash
git init
git add .
git commit -m "Initial commit: PWA Parking App"
```

#### Создание репозитория на GitHub:
1. Перейдите на [github.com](https://github.com)
2. Нажмите "New repository"
3. Название: `parkovka-pwa-app`
4. Сделайте публичным (для бесплатного Vercel)
5. Создайте репозиторий

#### Загрузка кода:
```bash
git remote add origin https://github.com/YOUR_USERNAME/parkovka-pwa-app.git
git branch -M main
git push -u origin main
```

### 3. Деплой на Vercel

#### Способ 1: Через веб-интерфейс (РЕКОМЕНДУЮ)
1. Перейдите на [vercel.com](https://vercel.com)
2. Нажмите "Sign up" и войдите через GitHub
3. Нажмите "New Project"
4. Выберите ваш репозиторий `parkovka-pwa-app`
5. Нажмите "Deploy"

#### Способ 2: Через CLI
```bash
# Установка Vercel CLI
npm i -g vercel

# Деплой
vercel

# Следуйте инструкциям:
# - Логин через GitHub
# - Выберите проект
# - Настройки по умолчанию
```

### 4. Настройка домена (опционально)

#### Бесплатный домен:
- Vercel предоставляет домен: `your-app-name.vercel.app`
- Можно подключить свой домен (если есть)

#### Настройка кастомного домена:
1. В панели Vercel перейдите в "Domains"
2. Добавьте ваш домен
3. Настройте DNS записи

### 5. Проверка PWA функций

После деплоя проверьте:
- [ ] Приложение загружается
- [ ] PWA манифест работает: `https://your-app.vercel.app/manifest.json`
- [ ] Service Worker регистрируется
- [ ] Кнопка установки появляется
- [ ] Офлайн режим работает

## 🎯 Результат

После деплоя у вас будет:
- ✅ **URL**: `https://your-app-name.vercel.app`
- ✅ **SSL сертификат**: Автоматически
- ✅ **CDN**: По всему миру
- ✅ **Автоматические обновления**: При push в GitHub
- ✅ **PWA функции**: Полностью работают

## 💰 Стоимость: БЕСПЛАТНО!

- Vercel: $0/месяц
- GitHub: $0/месяц
- Домен: $0 (используем .vercel.app)

**Общая стоимость: $0 в месяц!**

## 🚀 Следующие шаги

1. Создайте GitHub репозиторий
2. Загрузите код
3. Подключите к Vercel
4. Получите ссылку для демонстрации инвесторам!

---
*Готово к деплою! 🎉*
