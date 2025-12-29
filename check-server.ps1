# Script para verificar el estado del servidor de Poker

Write-Host "🔍 Verificando estado del servidor de Poker..." -ForegroundColor Green
Write-Host ""

# Verificar si el servidor está corriendo
Write-Host "1️⃣ Verificando servidor..." -ForegroundColor Yellow
try {
    $connections = netstat -ano | findstr :4000
    if ($connections) {
        Write-Host "✅ Servidor corriendo en puerto 4000" -ForegroundColor Green
        Write-Host "📊 Conexiones activas:" -ForegroundColor Cyan
        $connections | ForEach-Object { Write-Host "   $_" -ForegroundColor White }
    } else {
        Write-Host "❌ Servidor no encontrado en puerto 4000" -ForegroundColor Red
        Write-Host "💡 Ejecuta: cd server && npm run dev:server" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Error verificando servidor: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Verificar conectividad HTTP
Write-Host "2️⃣ Probando conectividad HTTP..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ HTTP funcionando correctamente" -ForegroundColor Green
        Write-Host "📄 Respuesta: $($response.Content)" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️ Respuesta HTTP: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error de conectividad HTTP: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Verificar PostgreSQL
Write-Host "3️⃣ Verificando PostgreSQL..." -ForegroundColor Yellow
try {
    $pgVersion = & "C:\Program Files\PostgreSQL\15\bin\psql.exe" --version 2>$null
    if ($pgVersion) {
        Write-Host "✅ PostgreSQL: $pgVersion" -ForegroundColor Green
        Write-Host "📊 Base de datos: poker_game" -ForegroundColor Cyan

        # Probar conexión a la base de datos
        try {
            $env:PGPASSWORD = "postgres123"
            $testResult = & "C:\Program Files\PostgreSQL\15\bin\psql.exe" -h localhost -U postgres -d poker_game -c "SELECT COUNT(*) FROM users;" 2>$null
            if ($testResult -match "\d+") {
                Write-Host "✅ Conexión a base de datos exitosa" -ForegroundColor Green
            } else {
                Write-Host "⚠️ Base de datos existe pero sin tablas" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "⚠️ Error conectando a base de datos: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️ PostgreSQL no encontrado - usando modo fallback" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ PostgreSQL no disponible - modo fallback activo" -ForegroundColor Yellow
}

Write-Host ""

# Información del sistema
Write-Host "4️⃣ Información del sistema:" -ForegroundColor Yellow
Write-Host "🌐 URL del servidor: http://localhost:4000" -ForegroundColor Cyan
Write-Host "🎮 Cliente React: http://localhost:5173" -ForegroundColor Cyan
Write-Host "📁 Directorio: $(Get-Location)" -ForegroundColor White

Write-Host ""

# Estado final
Write-Host "🎯 Estado del sistema:" -ForegroundColor Green
if ($connections -and $response.StatusCode -eq 200) {
    Write-Host "✅ TODO FUNCIONANDO CORRECTAMENTE" -ForegroundColor Green
    Write-Host "🎮 Puedes abrir http://localhost:5173 para jugar" -ForegroundColor Cyan
} else {
    Write-Host "⚠️ Sistema parcialmente funcional" -ForegroundColor Yellow
}

# Limpiar variables
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
