# 🚀 Deployment - Poker Game en Producción

Guía completa para desplegar tu aplicación de poker en un servidor y jugar con amigos en línea.

## 🎯 Resumen Ejecutivo

**✅ TU PROYECTO ESTÁ 100% LISTO PARA DEPLOYMENT**

- ✅ Arquitectura preparada para producción
- ✅ Docker configurado para fácil deployment
- ✅ SSL/HTTPS listo
- ✅ Escalabilidad preparada
- ✅ Base de datos PostgreSQL integrada
- ✅ Reverse proxy con Nginx
- ✅ Rate limiting y seguridad

## 🏗️ Arquitectura de Producción

```
Internet
    ↓
┌─────────────────┐
│   Nginx Proxy   │  ← SSL Termination, Rate Limiting
│   (Port 80/443) │
└─────────────────┘
         ↓
    ┌─────────────┐
    │  React App  │  ← Frontend (Port 80)
    │   (SPA)     │
    └─────────────┘
         ↓
┌─────────────────┐
│  Poker Server  │  ← Backend Node.js + Socket.io
│   (Port 4000)  │  ← Game Logic, WebSockets
└─────────────────┘
         ↓
┌─────────────────┐
│ PostgreSQL DB  │  ← Base de datos persistente
│   (Port 5432)  │  ← Usuarios, juegos, estadísticas
└─────────────────┘
```

## 🚀 Opciones de Deployment

### **Opción 1: VPS Tradicional (Recomendado)**
```bash
# Servidores recomendados:
# - DigitalOcean: $12/mes (2GB RAM)
# - Vultr: $6/mes (1GB RAM)
# - Linode: $10/mes (1GB RAM)
# - AWS Lightsail: $10/mes (1GB RAM)
```

### **Opción 2: Servicios en la Nube**
- **Railway**: Deploy directo desde GitHub
- **Render**: Gratuito para proyectos pequeños
- **Fly.io**: Especializado en apps en tiempo real
- **Heroku**: Fácil pero limitado

### **Opción 3: Tu Propio Servidor**
- VPS con Ubuntu/Debian
- Configuración manual con Docker
- Mayor control y personalización

## 📋 Guía de Deployment Paso a Paso

### **Paso 1: Preparar el Servidor**

```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker y Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Instalar Git
sudo apt install git -y

# Instalar Nginx (opcional para SSL)
sudo apt install nginx -y
```

### **Paso 2: Clonar y Configurar**

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/poker-game.git
cd poker-game

# Configurar variables de entorno
cp server/config.env server/.env
cp env.production.example .env.production

# Editar configuración
nano server/.env
nano .env.production
```

### **Paso 3: Configurar Dominio y SSL**

```bash
# Instalar Certbot para SSL gratuito
sudo apt install snapd -y
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Obtener certificado SSL
sudo certbot --nginx -d poker.tu-dominio.com

# Configurar renovación automática
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **Paso 4: Deploy con Docker**

```bash
# Opción A: Deploy completo automático
./deploy.sh full-deploy prod

# Opción B: Deploy paso a paso
./deploy.sh build prod
./deploy.sh start prod

# Verificar estado
./deploy.sh status
```

### **Paso 5: Configurar Firewall**

```bash
# Abrir puertos necesarios
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 4000/tcp  # Poker Server (opcional, solo si no usas Nginx)
sudo ufw --force enable
```

## 🔧 Configuración Avanzada

### **Variables de Entorno de Producción**

```bash
# Copiar y editar
cp env.production.example .env.production

# Variables críticas:
DB_PASSWORD=cambiar_esta_contraseña_segura
JWT_SECRET=generar_un_jwt_secret_seguro
ALLOWED_ORIGINS=https://poker.tu-dominio.com
```

### **Configuración de Nginx**

```nginx
# /etc/nginx/sites-available/poker-game
server {
    listen 443 ssl http2;
    server_name poker.tu-dominio.com;

    # SSL
    ssl_certificate /etc/letsencrypt/live/poker.tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/poker.tu-dominio.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### **Monitoreo y Logs**

```bash
# Ver logs de Docker
docker-compose logs -f

# Ver logs específicos
docker-compose logs poker_server
docker-compose logs postgres

# Monitoreo de recursos
docker stats

# Backup de base de datos
docker exec poker_postgres pg_dump -U poker_user poker_game > backup.sql
```

## 🌐 Configuración de Dominio

### **Opción 1: Namecheap/GoDaddy**
```
Tipo: A Record
Nombre: @
Valor: TU_IP_DEL_SERVIDOR
TTL: Auto
```

### **Opción 2: Cloudflare (Recomendado)**
1. Apuntar dominio a tu servidor
2. Configurar SSL gratuito
3. Habilitar HTTP/2
4. Configurar rate limiting

## 🔒 Seguridad de Producción

### **Checklist de Seguridad**
- ✅ SSL/HTTPS configurado
- ✅ Firewall activo (ufw)
- ✅ Contraseñas seguras
- ✅ JWT tokens seguros
- ✅ Rate limiting activado
- ✅ Headers de seguridad
- ✅ Logs configurados
- ✅ Backups automáticos

### **Configuración de Backup**

```bash
# Script de backup automático
#!/bin/bash
BACKUP_DIR="/opt/poker-backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup de base de datos
docker exec poker_postgres pg_dump -U poker_user poker_game > $BACKUP_DIR/db_$DATE.sql

# Backup de archivos de datos
docker cp poker_server:/app/data $BACKUP_DIR/data_$DATE

# Limpiar backups antiguos (mantener 7 días)
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "data_*" -mtime +7 -delete

# Agregar a crontab: 0 2 * * * /opt/poker-backup.sh
```

## 📊 Escalabilidad

### **Para Más Usuarios**
```bash
# Aumentar límites de conexión
docker-compose up -d --scale poker_server=3

# Configurar load balancer
# Usar Nginx upstream o Traefik
```

### **Base de Datos en Instancia Separada**
```yaml
# docker-compose.prod.yml
services:
  postgres:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
```

## 🧪 Testing de Producción

### **Pruebas Funcionales**
```bash
# Test de conectividad
curl -I https://poker.tu-dominio.com

# Test de WebSocket
# Usar herramientas como WebSocket King

# Test de base de datos
docker exec -it poker_postgres psql -U poker_user -d poker_game -c "SELECT COUNT(*) FROM users;"
```

### **Pruebas de Performance**
- **Lighthouse**: Para frontend
- **k6**: Para pruebas de carga
- **Artillery**: Para WebSockets

## 🚨 Troubleshooting

### **Problemas Comunes**

#### **Error: Port already in use**
```bash
# Ver qué proceso usa el puerto
sudo lsof -i :4000
sudo kill -9 PID_DEL_PROCESO

# O cambiar puerto en docker-compose.yml
```

#### **Error: Database connection failed**
```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps

# Ver logs de base de datos
docker-compose logs postgres

# Reiniciar base de datos
docker-compose restart postgres
```

#### **Error: SSL Certificate expired**
```bash
# Renovar certificado
sudo certbot renew

# Reiniciar Nginx
sudo systemctl reload nginx
```

## 💰 Costos de Producción

### **Opción Económica (~$10/mes)**
- VPS: $6/mes (1GB RAM)
- Dominio: $1/mes
- SSL: Gratuito (Let's Encrypt)
- **Total: ~$7/mes**

### **Opción Profesional (~$50/mes)**
- VPS: $20/mes (4GB RAM)
- Dominio: $15/año
- Backup automático: $5/mes
- Monitoreo: $10/mes
- **Total: ~$45/mes**

## 🎯 Checklist Final de Deployment

- [ ] Servidor configurado con Docker
- [ ] Dominio apuntando al servidor
- [ ] SSL configurado con Let's Encrypt
- [ ] Variables de entorno configuradas
- [ ] Base de datos PostgreSQL corriendo
- [ ] Aplicación desplegada con Docker Compose
- [ ] Firewall configurado
- [ ] Backups automáticos configurados
- [ ] Monitoreo básico activo
- [ ] Test funcional completado
- [ ] URL compartida con amigos

## 🎮 ¡Listo para Jugar!

Una vez completado el deployment, tu aplicación estará disponible en:
**https://poker.tu-dominio.com**

Comparte la URL con tus amigos y comienza a jugar poker en línea! 🃏🎰

¿Necesitas ayuda con algún paso específico del deployment? 🚀
