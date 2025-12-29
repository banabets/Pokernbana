# Script completo de configuración de PostgreSQL y migración
# Ejecutar una vez completada la instalación de PostgreSQL

Write-Host "🚀 Configuración completa de PostgreSQL para Poker Game..." -ForegroundColor Green
Write-Host ""

# Paso 1: Verificar PostgreSQL
Write-Host "1️⃣ Verificando PostgreSQL..." -ForegroundColor Yellow
try {
    $pgVersion = & "C:\Program Files\PostgreSQL\15\bin\psql.exe" --version 2>$null
    if ($pgVersion) {
        Write-Host "✅ PostgreSQL: $pgVersion" -ForegroundColor Green
    } else {
        Write-Host "⚠️ PostgreSQL no encontrado." -ForegroundColor Yellow
        Write-Host "📥 Instalando PostgreSQL automáticamente..." -ForegroundColor Cyan

        # Instalar PostgreSQL usando winget si está disponible
        try {
            winget install --id PostgreSQL.PostgreSQL.15 --silent --accept-package-agreements --accept-source-agreements
            Write-Host "✅ PostgreSQL instalado exitosamente" -ForegroundColor Green
            Start-Sleep -Seconds 5
        } catch {
            Write-Host "❌ Error instalando PostgreSQL automáticamente" -ForegroundColor Red
            Write-Host "📝 Instala manualmente desde: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
            Write-Host "   - Configura contraseña: postgres123" -ForegroundColor White
            Write-Host "   - Puerto: 5432" -ForegroundColor White
            Write-Host "" -ForegroundColor White
            Write-Host "💡 Mientras tanto, ejecuta el servidor con el modo fallback:" -ForegroundColor Cyan
            Write-Host "   cd server && npm run dev:server" -ForegroundColor White
            exit 1
        }
    }
} catch {
    Write-Host "⚠️ PostgreSQL no está en el PATH." -ForegroundColor Yellow
    Write-Host "📝 Si ya instalaste PostgreSQL, agrega al PATH: C:\Program Files\PostgreSQL\15\bin\" -ForegroundColor White
    Write-Host "💡 O instala desde: https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
    Write-Host "" -ForegroundColor White
    Write-Host "🚀 Ejecutando servidor en modo fallback..." -ForegroundColor Green
    cd server
    npm run dev:server
    exit 0
}

# Paso 2: Crear base de datos
Write-Host ""
Write-Host "2️⃣ Creando base de datos..." -ForegroundColor Yellow
try {
    $env:PGPASSWORD = "postgres123"
    & "C:\Program Files\PostgreSQL\15\bin\createdb.exe" -h localhost -U postgres poker_game 2>$null
    Write-Host "✅ Base de datos 'poker_game' creada" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Base de datos ya existe o error: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Paso 3: Probar conexión
Write-Host ""
Write-Host "3️⃣ Probando conexión..." -ForegroundColor Yellow
try {
    $env:PGPASSWORD = "postgres123"
    $result = & "C:\Program Files\PostgreSQL\15\bin\psql.exe" -h localhost -U postgres -d poker_game -c "SELECT version();" 2>$null
    if ($result -match "PostgreSQL") {
        Write-Host "✅ Conexión exitosa" -ForegroundColor Green
    } else {
        Write-Host "❌ Error de conexión" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error de conexión: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Asegúrate de que el servicio PostgreSQL esté corriendo" -ForegroundColor Yellow
    exit 1
}

# Paso 4: Iniciar servidor
Write-Host ""
Write-Host "4️⃣ Iniciando servidor..." -ForegroundColor Yellow
Write-Host "📝 El servidor se iniciará automáticamente con PostgreSQL" -ForegroundColor Cyan
Write-Host "📝 Los datos existentes se migrarán automáticamente" -ForegroundColor Cyan
Write-Host ""

# Cambiar al directorio del servidor
cd server

# Ejecutar el servidor
Write-Host "🚀 Ejecutando: npm run dev:server" -ForegroundColor Green
Write-Host "📊 Espera a ver ""PostgreSQL database initialized successfully""" -ForegroundColor Cyan
Write-Host ""

npm run dev:server

# Limpiar
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
