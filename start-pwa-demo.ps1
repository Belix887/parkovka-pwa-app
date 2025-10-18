# PWA Demo Startup Script for Windows
Write-Host "🚀 Запуск PWA демонстрации Парковка" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Проверка Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js найден: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js не установлен. Установите Node.js для продолжения." -ForegroundColor Red
    exit 1
}

# Проверка npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm найден: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm не установлен. Установите npm для продолжения." -ForegroundColor Red
    exit 1
}

# Установка зависимостей
Write-Host "📦 Установка зависимостей..." -ForegroundColor Yellow
npm install

# Сборка проекта
Write-Host "🔨 Сборка проекта..." -ForegroundColor Yellow
npm run build

# Запуск сервера
Write-Host "🌐 Запуск сервера на http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Для тестирования PWA:" -ForegroundColor Cyan
Write-Host "1. Откройте http://localhost:3000/mobile-app в Chrome" -ForegroundColor White
Write-Host "2. Найдите кнопку 'Установить' в адресной строке" -ForegroundColor White
Write-Host "3. Или перейдите в меню браузера > Установить приложение" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Демо страница PWA: http://localhost:3000/mobile-app/pwa-demo" -ForegroundColor Cyan
Write-Host ""
Write-Host "✨ Готово! Приложение готово для демонстрации инвесторам." -ForegroundColor Green

npm start
