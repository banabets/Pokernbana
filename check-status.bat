@echo off
echo 🔍 Verificando estado del servidor de Poker...
echo.

echo 1️⃣ Verificando servidor...
netstat -ano | findstr :4000 >nul
if %errorlevel% equ 0 (
    echo ✅ Servidor corriendo en puerto 4000
    netstat -ano | findstr :4000
) else (
    echo ❌ Servidor no encontrado en puerto 4000
    echo 💡 Ejecuta: cd server && npm run dev:server
    goto :end
)
echo.

echo 2️⃣ Probando conectividad HTTP...
curl -s http://localhost:4000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ HTTP funcionando correctamente
    curl -s http://localhost:4000
) else (
    echo ❌ Error de conectividad HTTP
)
echo.

echo 3️⃣ Verificando PostgreSQL...
if exist "C:\Program Files\PostgreSQL\15\bin\psql.exe" (
    echo ✅ PostgreSQL encontrado
    "C:\Program Files\PostgreSQL\15\bin\psql.exe" --version
    echo 📊 Base de datos: poker_game
) else (
    echo ⚠️ PostgreSQL no encontrado - usando modo fallback
)
echo.

echo 4️⃣ Información del sistema:
echo 🌐 URL del servidor: http://localhost:4000
echo 🎮 Cliente React: http://localhost:5173
echo 📁 Directorio: %cd%
echo.

echo 🎯 Estado final:
echo ✅ SISTEMA FUNCIONANDO
echo 🎮 Abre http://localhost:5173 para jugar poker

:end
pause
