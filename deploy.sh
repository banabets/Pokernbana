#!/bin/bash

# Script de Deployment Automatizado para Poker Game
# Uso: ./deploy.sh [ambiente]
# Ejemplos:
#   ./deploy.sh dev     # Despliegue de desarrollo
#   ./deploy.sh prod    # Despliegue de producción
#   ./deploy.sh stop    # Detener servicios

set -e

ENVIRONMENT=${1:-dev}
PROJECT_NAME="poker-game"
DOCKER_COMPOSE_FILE="docker-compose.yml"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar dependencias
check_dependencies() {
    log "Verificando dependencias..."

    if ! command -v docker &> /dev/null; then
        error "Docker no está instalado"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose no está instalado"
        exit 1
    fi

    success "Dependencias verificadas"
}

# Construir imágenes
build_images() {
    log "Construyendo imágenes Docker..."

    if [ "$ENVIRONMENT" = "prod" ]; then
        # Construcción de producción (sin cache)
        docker-compose -f $DOCKER_COMPOSE_FILE build --no-cache
    else
        # Construcción de desarrollo (con cache)
        docker-compose -f $DOCKER_COMPOSE_FILE build
    fi

    success "Imágenes construidas"
}

# Iniciar servicios
start_services() {
    log "Iniciando servicios..."

    if [ "$ENVIRONMENT" = "prod" ]; then
        # Producción: detach mode
        docker-compose -f $DOCKER_COMPOSE_FILE up -d
        success "Servicios iniciados en modo detached"

        # Esperar a que los servicios estén saludables
        log "Esperando que los servicios estén listos..."
        sleep 30

        # Verificar estado
        docker-compose -f $DOCKER_COMPOSE_FILE ps
    else
        # Desarrollo: attached mode
        docker-compose -f $DOCKER_COMPOSE_FILE up
    fi
}

# Detener servicios
stop_services() {
    log "Deteniendo servicios..."
    docker-compose -f $DOCKER_COMPOSE_FILE down
    success "Servicios detenidos"
}

# Limpiar contenedores e imágenes
cleanup() {
    log "Limpiando recursos no utilizados..."
    docker system prune -f
    docker volume prune -f
    success "Limpieza completada"
}

# Mostrar estado
show_status() {
    log "Estado de los servicios:"
    docker-compose -f $DOCKER_COMPOSE_FILE ps
    echo ""
    log "Uso de recursos:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
}

# Mostrar logs
show_logs() {
    log "Mostrando logs de los servicios..."
    docker-compose -f $DOCKER_COMPOSE_FILE logs -f
}

# Función principal
main() {
    case $1 in
        start|up)
            check_dependencies
            build_images
            start_services
            ;;
        stop|down)
            stop_services
            ;;
        restart)
            stop_services
            sleep 5
            start_services
            ;;
        build)
            check_dependencies
            build_images
            ;;
        status|ps)
            show_status
            ;;
        logs)
            show_logs
            ;;
        cleanup|clean)
            cleanup
            ;;
        full-deploy)
            check_dependencies
            stop_services
            cleanup
            build_images
            start_services
            ;;
        *)
            echo "Uso: $0 {start|stop|restart|build|status|logs|cleanup|full-deploy} [ambiente]"
            echo ""
            echo "Ejemplos:"
            echo "  $0 start dev     # Iniciar en desarrollo"
            echo "  $0 start prod    # Iniciar en producción"
            echo "  $0 stop          # Detener servicios"
            echo "  $0 restart       # Reiniciar servicios"
            echo "  $0 build         # Construir imágenes"
            echo "  $0 status        # Ver estado"
            echo "  $0 logs          # Ver logs"
            echo "  $0 cleanup       # Limpiar recursos"
            echo "  $0 full-deploy   # Despliegue completo"
            exit 1
            ;;
    esac
}

# Ejecutar función principal
main "$@"
