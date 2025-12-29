# Script para instalar PostgreSQL en Windows
# Ejecutar con: powershell -ExecutionPolicy Bypass -File install-postgresql.ps1

Write-Host "🚀 Instalando PostgreSQL..." -ForegroundColor Green

# Verificar si Chocolatey está instalado
try {
    choco --version > $null 2>&1
    Write-Host "✅ Chocolatey encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Chocolatey no está instalado" -ForegroundColor Red
    Write-Host "📥 Instalando Chocolatey..." -ForegroundColor Yellow

    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

    # Recargar el PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# Instalar PostgreSQL
Write-Host "📦 Instalando PostgreSQL..." -ForegroundColor Yellow
choco install postgresql --version=15.4 -y

# Verificar instalación
Write-Host "🔍 Verificando instalación..." -ForegroundColor Yellow
try {
    $pgVersion = & "C:\Program Files\PostgreSQL\15\bin\psql.exe" --version
    Write-Host "✅ PostgreSQL instalado correctamente:" -ForegroundColor Green
    Write-Host $pgVersion -ForegroundColor Green
} catch {
    Write-Host "❌ Error al verificar PostgreSQL" -ForegroundColor Red
    Write-Host "Asegúrate de que PostgreSQL esté en el PATH del sistema" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Crear base de datos: createdb poker_game" -ForegroundColor White
Write-Host "2. Configurar config.env en la carpeta server" -ForegroundColor White
Write-Host "3. Reiniciar el servidor" -ForegroundColor White
Write-Host ""
Write-Host "💡 O usa el modo fallback temporal ejecutando el servidor" -ForegroundColor Yellow
