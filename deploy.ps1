# Script de Deployment para Poker Game en Windows
# Uso: .\deploy.ps1 [comando] [ambiente]

param(
    [Parameter(Mandatory=$false)]
    [string]$Command = "help",

    [Parameter(Mandatory=$false)]
    [string]$Environment = "dev"
)

# Configuración
$DOCKER_COMPOSE_FILE = "docker-compose.yml"
$PROJECT_NAME = "poker-game"

# Colores para output
$RED = "Red"
$GREEN = "Green"
$YELLOW = "Yellow"
$BLUE = "Blue"
$CYAN = "Cyan"
$MAGENTA = "Magenta"

function Write-Color {
    param($Text, $Color = "White")
    Write-Host $Text -ForegroundColor $Color
}

function Write-Log {
    param($Message)
    Write-Color "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message" $BLUE
}

function Write-Success {
    param($Message)
    Write-Color "✅ $Message" $GREEN
}

function Write-Warning {
    param($Message)
    Write-Color "⚠️  $Message" $YELLOW
}

function Write-Error {
    param($Message)
    Write-Color "❌ $Message" $RED
}

# Verificar dependencias
function Test-Dependencies {
    Write-Log "Verificando dependencias..."

    try {
        $dockerVersion = docker --version 2>$null
        Write-Success "Docker: $dockerVersion"
    } catch {
        Write-Error "Docker no está instalado o no está en el PATH"
        Write-Color "Instala Docker desde: https://www.docker.com/products/docker-desktop" $CYAN
        exit 1
    }

    try {
        $composeVersion = docker-compose --version 2>$null
        Write-Success "Docker Compose: $composeVersion"
    } catch {
        Write-Error "Docker Compose no está instalado"
        exit 1
    }

    Write-Success "Dependencias verificadas"
}

# Construir imágenes
function Build-Images {
    Write-Log "Construyendo imágenes Docker..."

    if ($Environment -eq "prod") {
        # Construcción de producción (sin cache)
        docker-compose -f $DOCKER_COMPOSE_FILE build --no-cache
    } else {
        # Construcción de desarrollo (con cache)
        docker-compose -f $DOCKER_COMPOSE_FILE build
    }

    Write-Success "Imágenes construidas"
}

# Iniciar servicios
function Start-Services {
    Write-Log "Iniciando servicios..."

    if ($Environment -eq "prod") {
        # Producción: detach mode
        docker-compose -f $DOCKER_COMPOSE_FILE up -d
        Write-Success "Servicios iniciados en modo detached"

        # Esperar a que los servicios estén saludables
        Write-Log "Esperando que los servicios estén listos..."
        Start-Sleep -Seconds 30

        # Verificar estado
        docker-compose -f $DOCKER_COMPOSE_FILE ps
    } else {
        # Desarrollo: attached mode
        Write-Color "Presiona Ctrl+C para detener los servicios" $YELLOW
        docker-compose -f $DOCKER_COMPOSE_FILE up
    }
}

# Detener servicios
function Stop-Services {
    Write-Log "Deteniendo servicios..."
    docker-compose -f $DOCKER_COMPOSE_FILE down
    Write-Success "Servicios detenidos"
}

# Limpiar recursos
function Clear-Resources {
    Write-Log "Limpiando recursos no utilizados..."
    docker system prune -f
    docker volume prune -f
    Write-Success "Limpieza completada"
}

# Mostrar estado
function Show-Status {
    Write-Log "Estado de los servicios:"
    docker-compose -f $DOCKER_COMPOSE_FILE ps
    Write-Host ""
    Write-Log "Uso de recursos:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
}

# Mostrar logs
function Show-Logs {
    Write-Log "Mostrando logs de los servicios..."
    docker-compose -f $DOCKER_COMPOSE_FILE logs -f
}

# Despliegue completo
function Deploy-Full {
    Test-Dependencies
    Stop-Services
    Clear-Resources
    Build-Images
    Start-Services
}

# Función principal
switch ($Command) {
    "start" {
        Test-Dependencies
        Build-Images
        Start-Services
    }
    "stop" {
        Stop-Services
    }
    "restart" {
        Stop-Services
        Start-Sleep -Seconds 5
        Start-Services
    }
    "build" {
        Test-Dependencies
        Build-Images
    }
    "status" {
        Show-Status
    }
    "logs" {
        Show-Logs
    }
    "cleanup" {
        Clear-Resources
    }
    "full-deploy" {
        Deploy-Full
    }
    "help" {
        Write-Color "Script de Deployment para Poker Game" $CYAN
        Write-Host ""
        Write-Color "Uso: .\deploy.ps1 [comando] [ambiente]" $YELLOW
        Write-Host ""
        Write-Color "Comandos disponibles:" $GREEN
        Write-Host "  start        - Iniciar servicios"
        Write-Host "  stop         - Detener servicios"
        Write-Host "  restart      - Reiniciar servicios"
        Write-Host "  build        - Construir imágenes"
        Write-Host "  status       - Ver estado de servicios"
        Write-Host "  logs         - Ver logs de servicios"
        Write-Host "  cleanup      - Limpiar recursos"
        Write-Host "  full-deploy  - Despliegue completo"
        Write-Host ""
        Write-Color "Ambientes:" $GREEN
        Write-Host "  dev          - Desarrollo (por defecto)"
        Write-Host "  prod         - Producción"
        Write-Host ""
        Write-Color "Ejemplos:" $CYAN
        Write-Host "  .\deploy.ps1 start dev"
        Write-Host "  .\deploy.ps1 full-deploy prod"
        Write-Host "  .\deploy.ps1 stop"
    }
    default {
        Write-Error "Comando no reconocido: $Command"
        Write-Host ""
        Write-Host "Ejecuta '.\deploy.ps1 help' para ver comandos disponibles"
        exit 1
    }
}
