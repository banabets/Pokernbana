# Instalación manual de PostgreSQL para Windows
# Descarga e instala PostgreSQL sin Chocolatey

Write-Host "🚀 Instalando PostgreSQL manualmente..." -ForegroundColor Green

# URLs de descarga de PostgreSQL
$postgresqlUrl = "https://get.enterprisedb.com/postgresql/postgresql-15.4-1-windows-x64.exe"
$installerPath = "$env:TEMP\postgresql-installer.exe"

Write-Host "📥 Descargando PostgreSQL..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $postgresqlUrl -OutFile $installerPath -UseBasicParsing
    Write-Host "✅ Descarga completada" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al descargar PostgreSQL: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "📝 Descarga manual desde: $postgresqlUrl" -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Ejecutando instalador..." -ForegroundColor Yellow
Write-Host "⚠️  IMPORTANTE: Durante la instalación:" -ForegroundColor Red
Write-Host "   1. Selecciona 'PostgreSQL Server' cuando aparezca" -ForegroundColor White
Write-Host "   2. Configura contraseña: 'postgres123'" -ForegroundColor White
Write-Host "   3. Puerto: 5432 (por defecto)" -ForegroundColor White
Write-Host "   4. Instala pgAdmin también" -ForegroundColor White
Write-Host "" -ForegroundColor White

Start-Process -FilePath $installerPath -Wait

# Limpiar archivo de instalación
Remove-Item $installerPath -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "🎯 Configuración posterior a la instalación:" -ForegroundColor Cyan
Write-Host "1. Agregar PostgreSQL al PATH del sistema:" -ForegroundColor White
Write-Host "   - Busca 'Variables de entorno' en el menú Inicio" -ForegroundColor White
Write-Host "   - Edita 'Path' en Variables del sistema" -ForegroundColor White
Write-Host "   - Agrega: C:\Program Files\PostgreSQL\15\bin\" -ForegroundColor White
Write-Host ""
Write-Host "2. Crear base de datos:" -ForegroundColor White
Write-Host "   createdb poker_game" -ForegroundColor White
Write-Host ""
Write-Host "3. Reiniciar PowerShell y probar:" -ForegroundColor White
Write-Host "   psql --version" -ForegroundColor White
Write-Host ""
Write-Host "4. Configurar archivo config.env en la carpeta server" -ForegroundColor White

Write-Host ""
Write-Host "💡 Una vez completado, ejecuta:" -ForegroundColor Green
Write-Host "   cd server && npm run dev:server" -ForegroundColor Green
