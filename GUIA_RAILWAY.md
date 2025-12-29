# 🚂 Guía Completa: Deploy en Railway

## 📋 Tabla de Contenidos
1. [Requisitos Previos](#requisitos-previos)
2. [Paso 1: Crear Cuenta en Railway](#paso-1-crear-cuenta-en-railway)
3. [Paso 2: Preparar el Repositorio](#paso-2-preparar-el-repositorio)
4. [Paso 3: Conectar Repositorio a Railway](#paso-3-conectar-repositorio-a-railway)
5. [Paso 4: Configurar Variables de Entorno](#paso-4-configurar-variables-de-entorno)
6. [Paso 5: Agregar Base de Datos PostgreSQL](#paso-5-agregar-base-de-datos-postgresql)
7. [Paso 6: Deploy y Verificar](#paso-6-deploy-y-verificar)
8. [Paso 7: Configurar Dominio Personalizado (Opcional)](#paso-7-configurar-dominio-personalizado-opcional)
9. [Troubleshooting](#troubleshooting)

---

## ✅ Requisitos Previos

- ✅ Cuenta de GitHub (gratis)
- ✅ Repositorio del proyecto en GitHub
- ✅ Cuenta de Railway (gratis con $5 crédito/mes)

---

## 🚀 Paso 1: Crear Cuenta en Railway

### 1.1. Ir a Railway
1. Abre tu navegador y ve a: **https://railway.app**
2. Haz clic en **"Start a New Project"** o **"Login"**

### 1.2. Iniciar Sesión
- Opción A: **Con GitHub** (Recomendado)
  - Haz clic en **"Login with GitHub"**
  - Autoriza Railway para acceder a tus repositorios
  - Selecciona los repositorios que Railway puede acceder (o todos)

- Opción B: **Con Email**
  - Ingresa tu email y crea una contraseña
  - Verifica tu email

### 1.3. Verificar Plan
- El plan **gratuito** incluye **$5 de crédito por mes**
- Es suficiente para desarrollo y testing
- Para producción, considera el plan **Pro ($20/mes)**

---

## 📦 Paso 2: Preparar el Repositorio

### 2.1. Verificar que el Proyecto Esté en GitHub

```bash
# Si aún no has subido el proyecto a GitHub:
cd /Users/g/Downloads/POKERCLEANVIP-master

# Inicializar git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Hacer commit inicial
git commit -m "Initial commit - Ready for Railway"

# Agregar remoto de GitHub (reemplaza con tu URL)
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git

# Subir a GitHub
git push -u origin main
```

### 2.2. Verificar Archivos de Configuración

Asegúrate de que estos archivos existan en la raíz del proyecto:

- ✅ `railway.json` - Configuración de Railway
- ✅ `nixpacks.toml` - Configuración de build
- ✅ `package.json` - Con script `build:railway`
- ✅ `server/package.json` - Con script `build`
- ✅ `client/package.json` - Con script `build`

**Todos estos archivos ya están configurados en tu proyecto** ✅

---

## 🔗 Paso 3: Conectar Repositorio a Railway

### 3.1. Crear Nuevo Proyecto

1. En Railway Dashboard, haz clic en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Si es la primera vez, autoriza Railway para acceder a GitHub

### 3.2. Seleccionar Repositorio

1. Busca tu repositorio en la lista: `POKERCLEANVIP-master`
2. Haz clic en el repositorio
3. Railway detectará automáticamente la configuración

### 3.3. Configurar el Servicio

Railway detectará automáticamente:
- ✅ **Build Command**: `npm run build:railway`
- ✅ **Start Command**: `node server/dist/index.js`
- ✅ **Node.js 18**

**No necesitas cambiar nada** - Railway usará `railway.json` y `nixpacks.toml`

---

## ⚙️ Paso 4: Configurar Variables de Entorno

### 4.1. Abrir Configuración de Variables

1. En Railway Dashboard, haz clic en tu servicio
2. Ve a la pestaña **"Variables"**
3. Haz clic en **"New Variable"**

### 4.2. Agregar Variables Básicas

Agrega estas variables (Railway ya tiene algunas):

| Variable | Valor | Notas |
|----------|-------|-------|
| `NODE_ENV` | `production` | Entorno de producción |
| `PORT` | `$PORT` | Railway lo asigna automáticamente |
| `HOST` | `0.0.0.0` | Aceptar conexiones de cualquier IP |

**Nota:** `PORT` ya está configurado automáticamente por Railway, pero puedes agregarlo manualmente si quieres.

### 4.3. Variables Opcionales

Si necesitas configuración adicional:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `JWT_SECRET` | `tu_secret_super_seguro` | Solo si usas autenticación JWT |
| `ALLOWED_ORIGINS` | `https://tu-app.railway.app` | CORS origins permitidos |

---

## 🗄️ Paso 5: Agregar Base de Datos PostgreSQL

### 5.1. Agregar Servicio PostgreSQL

1. En Railway Dashboard, en tu proyecto
2. Haz clic en **"+ New"** → **"Database"** → **"Add PostgreSQL"**
3. Railway creará automáticamente una instancia de PostgreSQL

### 5.2. Variables de PostgreSQL Automáticas

Railway creará automáticamente estas variables:

- `PGHOST` - Host de PostgreSQL
- `PGPORT` - Puerto de PostgreSQL
- `PGDATABASE` - Nombre de la base de datos
- `PGUSER` - Usuario de PostgreSQL
- `PGPASSWORD` - Contraseña de PostgreSQL

**Tu código ya está preparado para usar estas variables** ✅

### 5.3. Verificar Conexión

El servidor intentará conectarse automáticamente a PostgreSQL cuando inicie.
Si PostgreSQL no está disponible, usará el modo "fallback" (en memoria).

---

## 🚀 Paso 6: Deploy y Verificar

### 6.1. Iniciar Deploy

1. Railway iniciará el deploy automáticamente cuando conectes el repositorio
2. O puedes hacer clic en **"Deploy"** manualmente
3. Ve a la pestaña **"Deployments"** para ver el progreso

### 6.2. Monitorear el Build

En la pestaña **"Deployments"**, verás:

```
📦 Installing dependencies...
🔨 Building client...
⚙️ Building server...
✅ Build completed!
🚀 Starting server...
```

**Tiempo estimado:** 3-5 minutos

### 6.3. Ver Logs

1. Haz clic en el deployment más reciente
2. Ve a la pestaña **"Logs"**
3. Deberías ver:
   ```
   🚀 Starting poker server...
   📍 PORT: 4000, HOST: 0.0.0.0
   ✅ Server listening on http://0.0.0.0:4000
   🎮 Poker server ready for multiplayer!
   ```

### 6.4. Obtener URL Pública

1. En Railway Dashboard, ve a tu servicio
2. Haz clic en la pestaña **"Settings"**
3. En **"Domains"**, haz clic en **"Generate Domain"**
4. Railway te dará una URL como: `tu-app.railway.app`

### 6.5. Probar la Aplicación

1. Abre la URL en tu navegador
2. Deberías ver el lobby del juego de poker
3. Prueba crear una mesa y jugar

---

## 🌐 Paso 7: Configurar Dominio Personalizado (Opcional)

### 7.1. Agregar Dominio Personalizado

1. En Railway Dashboard, ve a **Settings** → **Domains**
2. Haz clic en **"Custom Domain"**
3. Ingresa tu dominio (ej: `poker.tu-dominio.com`)
4. Railway te dará instrucciones para configurar DNS

### 7.2. Configurar DNS

En tu proveedor de DNS (Namecheap, GoDaddy, Cloudflare, etc.):

**Tipo:** `CNAME`  
**Nombre:** `poker` (o `@` para el dominio raíz)  
**Valor:** `tu-app.railway.app` (la URL de Railway)

**O:**

**Tipo:** `A`  
**Nombre:** `poker`  
**Valor:** IP de Railway (Railway te la proporcionará)

### 7.3. SSL Automático

Railway configura SSL automáticamente con Let's Encrypt.
Solo espera 5-10 minutos después de configurar DNS.

---

## 🔧 Troubleshooting

### ❌ Error: "Build failed"

**Problema:** El build falla durante la instalación o compilación.

**Solución:**
1. Revisa los logs en Railway Dashboard
2. Verifica que `package.json` tenga todos los scripts necesarios
3. Asegúrate de que `build:railway` esté definido en `package.json`
4. Verifica que no haya errores de TypeScript

**Comando para probar localmente:**
```bash
npm run build:railway
```

---

### ❌ Error: "Cannot find module 'server/dist/index.js'"

**Problema:** El servidor no se compiló correctamente.

**Solución:**
1. Verifica que `server/tsconfig.json` tenga `"outDir": "dist"`
2. Verifica que el build se complete sin errores
3. Revisa los logs de build en Railway

**Verificar estructura localmente:**
```bash
cd server
npm run build
ls -la dist/
```

---

### ❌ Error: "Port already in use"

**Problema:** Railway no puede asignar el puerto.

**Solución:**
- Railway asigna el puerto automáticamente
- Asegúrate de usar `process.env.PORT` en el código
- No hardcodees el puerto 4000

**Verificar en código:**
```typescript
const PORT = Number(process.env.PORT || 4000)
```

---

### ❌ Error: "Database connection failed"

**Problema:** No se puede conectar a PostgreSQL.

**Solución:**
1. Verifica que el servicio PostgreSQL esté corriendo en Railway
2. Verifica que las variables de entorno de PostgreSQL estén configuradas
3. El código tiene fallback - debería funcionar sin DB también

**Verificar variables:**
- `PGHOST`
- `PGPORT`
- `PGDATABASE`
- `PGUSER`
- `PGPASSWORD`

---

### ❌ Error: "WebSocket connection failed"

**Problema:** Socket.io no se conecta.

**Solución:**
1. Verifica que el servidor esté corriendo
2. Verifica que la URL del servidor sea correcta
3. En producción, el cliente usa `window.location.origin` automáticamente

**Verificar en código:**
El cliente ahora detecta automáticamente la URL del servidor en producción.

---

### ❌ Error: "Frontend not loading"

**Problema:** El frontend no se muestra.

**Solución:**
1. Verifica que el build del cliente se complete
2. Verifica que `client/dist` exista después del build
3. El servidor sirve el frontend automáticamente desde `client/dist`

**Verificar estructura:**
```bash
ls -la client/dist/
```

---

## 📊 Monitoreo y Logs

### Ver Logs en Tiempo Real

1. En Railway Dashboard, ve a tu servicio
2. Haz clic en la pestaña **"Logs"**
3. Verás logs en tiempo real

### Métricas

Railway proporciona métricas básicas:
- CPU Usage
- Memory Usage
- Network Traffic

Ve a **Settings** → **Metrics** para ver gráficos.

---

## 🔄 Actualizar la Aplicación

### Deploy Automático

Railway hace deploy automático cuando:
- Haces push a la rama principal (main/master)
- Haces merge de un Pull Request

### Deploy Manual

1. En Railway Dashboard, ve a tu servicio
2. Haz clic en **"Deploy"** → **"Redeploy"**
3. Selecciona el commit que quieres deployar

---

## 💰 Costos

### Plan Gratuito
- **$5 crédito por mes**
- Suficiente para desarrollo/testing
- **Límites:**
  - 500 horas de ejecución
  - 1GB de almacenamiento
  - 100GB de transferencia

### Plan Pro ($20/mes)
- **Créditos ilimitados**
- Mejor para producción
- **Incluye:**
  - Ejecución ilimitada
  - 5GB de almacenamiento
  - 1TB de transferencia
  - Soporte prioritario

### Estimación de Costos

**Desarrollo/Testing:**
- Servidor: ~$3-5/mes
- PostgreSQL: ~$2-3/mes
- **Total: ~$5-8/mes** (dentro del plan gratuito)

**Producción:**
- Servidor: ~$10-15/mes
- PostgreSQL: ~$5-8/mes
- **Total: ~$15-23/mes** (recomendado plan Pro)

---

## ✅ Checklist Final

Antes de considerar el deploy completo, verifica:

- [ ] Repositorio en GitHub
- [ ] Cuenta de Railway creada
- [ ] Repositorio conectado a Railway
- [ ] Variables de entorno configuradas
- [ ] PostgreSQL agregado y corriendo
- [ ] Build completado sin errores
- [ ] Servidor iniciado correctamente
- [ ] URL pública generada
- [ ] Aplicación accesible en el navegador
- [ ] WebSockets funcionando
- [ ] Base de datos conectada (opcional)

---

## 🎉 ¡Listo!

Tu aplicación de poker debería estar corriendo en Railway.

**URL de tu app:** `https://tu-app.railway.app`

Comparte esta URL con tus amigos y comienza a jugar poker en línea! 🃏🎰

---

## 📞 Soporte

Si tienes problemas:

1. **Revisa los logs** en Railway Dashboard
2. **Verifica la documentación** de Railway: https://docs.railway.app
3. **Comunidad Railway:** https://discord.gg/railway

---

**Última actualización:** 2024-01-XX  
**Versión de la guía:** 1.0

