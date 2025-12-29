# Script de configuración de PostgreSQL para Poker Game
# Ejecutar después de instalar PostgreSQL

Write-Host "🔧 Configurando PostgreSQL para Poker Game..." -ForegroundColor Green

# Verificar que PostgreSQL esté instalado
Write-Host "🔍 Verificando instalación de PostgreSQL..." -ForegroundColor Yellow
try {
    $pgVersion = & "C:\Program Files\PostgreSQL\15\bin\psql.exe" --version 2>$null
    if ($pgVersion) {
        Write-Host "✅ PostgreSQL encontrado: $pgVersion" -ForegroundColor Green
    } else {
        throw "PostgreSQL no encontrado"
    }
} catch {
    Write-Host "❌ PostgreSQL no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "📝 Asegúrate de que PostgreSQL esté instalado y el directorio bin esté en el PATH" -ForegroundColor Yellow
    exit 1
}

# Crear base de datos
Write-Host "📦 Creando base de datos 'poker_game'..." -ForegroundColor Yellow
try {
    $env:PGPASSWORD = "postgres123"
    & "C:\Program Files\PostgreSQL\15\bin\createdb.exe" -h localhost -U postgres poker_game
    Write-Host "✅ Base de datos 'poker_game' creada exitosamente" -ForegroundColor Green
} catch {
    Write-Host "⚠️ La base de datos ya existe o hubo un error: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Probar conexión
Write-Host "🔌 Probando conexión a la base de datos..." -ForegroundColor Yellow
try {
    $env:PGPASSWORD = "postgres123"
    $result = & "C:\Program Files\PostgreSQL\15\bin\psql.exe" -h localhost -U postgres -d poker_game -c "SELECT version();"
    if ($result -match "PostgreSQL") {
        Write-Host "✅ Conexión exitosa a PostgreSQL" -ForegroundColor Green
    } else {
        throw "No se pudo conectar"
    }
} catch {
    Write-Host "❌ Error de conexión: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "📝 Verifica que el servicio PostgreSQL esté corriendo" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Para iniciar el servidor con PostgreSQL:" -ForegroundColor Cyan
Write-Host "   cd server" -ForegroundColor White
Write-Host "   npm run dev:server" -ForegroundColor White
Write-Host ""
Write-Host "📝 Para verificar que funciona:" -ForegroundColor Cyan
Write-Host "   - Abre http://localhost:4000 en el navegador" -ForegroundColor White
Write-Host "   - Deberías ver 'Holdem server up'" -ForegroundColor White
Write-Host "   - Los logs deberían mostrar 'PostgreSQL database initialized successfully'" -ForegroundColor White

# Limpiar variable de entorno
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
