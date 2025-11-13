# Скрипт для добавления GraphHopper API ключа в .env.local

$envFile = ".env.local"
$graphhopperKey = "aa902198-c697-4891-a0f0-6a443a3e8889"

# Проверяем, существует ли файл .env.local
if (Test-Path $envFile) {
    Write-Host "Файл .env.local найден. Проверяем наличие ключа GraphHopper..." -ForegroundColor Yellow
    
    $content = Get-Content $envFile -Raw
    
    # Проверяем, есть ли уже ключ GraphHopper
    if ($content -match "GRAPHHOPPER_API_KEY") {
        Write-Host "Ключ GraphHopper уже присутствует в файле." -ForegroundColor Green
        Write-Host "Обновляем значение..." -ForegroundColor Yellow
        
        # Обновляем существующий ключ
        $content = $content -replace "GRAPHHOPPER_API_KEY=.*", "GRAPHHOPPER_API_KEY=$graphhopperKey"
        $content = $content -replace "NEXT_PUBLIC_GRAPHHOPPER_API_KEY=.*", "NEXT_PUBLIC_GRAPHHOPPER_API_KEY=$graphhopperKey"
        
        Set-Content -Path $envFile -Value $content -NoNewline
        Write-Host "Ключ GraphHopper обновлен!" -ForegroundColor Green
    } else {
        Write-Host "Добавляем ключ GraphHopper..." -ForegroundColor Yellow
        
        # Добавляем ключи в конец файла
        Add-Content -Path $envFile -Value "`n# GraphHopper API (для маршрутизации)"
        Add-Content -Path $envFile -Value "GRAPHHOPPER_API_KEY=$graphhopperKey"
        Add-Content -Path $envFile -Value "NEXT_PUBLIC_GRAPHHOPPER_API_KEY=$graphhopperKey"
        
        Write-Host "Ключ GraphHopper добавлен!" -ForegroundColor Green
    }
} else {
    Write-Host "Файл .env.local не найден. Создаем новый..." -ForegroundColor Yellow
    
    # Создаем новый файл с ключом
    @"
# GraphHopper API (для маршрутизации)
GRAPHHOPPER_API_KEY=$graphhopperKey
NEXT_PUBLIC_GRAPHHOPPER_API_KEY=$graphhopperKey
"@ | Out-File -FilePath $envFile -Encoding UTF8
    
    Write-Host "Файл .env.local создан с ключом GraphHopper!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Готово! Перезапустите сервер разработки (npm run dev) для применения изменений." -ForegroundColor Cyan

