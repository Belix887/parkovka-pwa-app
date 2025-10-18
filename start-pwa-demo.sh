#!/bin/bash

echo "🚀 Запуск PWA демонстрации Парковка"
echo "=================================="

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен. Установите Node.js для продолжения."
    exit 1
fi

# Проверка npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm не установлен. Установите npm для продолжения."
    exit 1
fi

echo "✅ Node.js и npm найдены"

# Установка зависимостей
echo "📦 Установка зависимостей..."
npm install

# Сборка проекта
echo "🔨 Сборка проекта..."
npm run build

# Запуск сервера
echo "🌐 Запуск сервера на http://localhost:3000"
echo ""
echo "📱 Для тестирования PWA:"
echo "1. Откройте http://localhost:3000/mobile-app в Chrome"
echo "2. Найдите кнопку 'Установить' в адресной строке"
echo "3. Или перейдите в меню браузера > Установить приложение"
echo ""
echo "🎯 Демо страница PWA: http://localhost:3000/mobile-app/pwa-demo"
echo ""
echo "✨ Готово! Приложение готово для демонстрации инвесторам."

npm start
