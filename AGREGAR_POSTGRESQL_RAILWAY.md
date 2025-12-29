# 🗄️ Cómo Agregar PostgreSQL en Railway

## 📋 Guía Paso a Paso

### **Paso 1: Acceder a Railway Dashboard**

1. Ve a **https://railway.app**
2. Inicia sesión con tu cuenta (GitHub recomendado)
3. Selecciona tu proyecto (si ya lo creaste) o crea uno nuevo

---

### **Paso 2: Agregar Servicio PostgreSQL**

1. En el dashboard de tu proyecto, busca el botón **"+ New"** (arriba a la derecha)
2. Haz clic en **"+ New"**
3. Se abrirá un menú con opciones:
   - **GitHub Repo** (para servicios de código)
   - **Database** ← **Haz clic aquí**
   - **Empty Service**
   - **Template**

4. Haz clic en **"Database"**
5. Verás opciones de bases de datos:
   - **PostgreSQL** ← **Selecciona esta opción**
   - MySQL
   - MongoDB
   - Redis

6. Haz clic en **"Add PostgreSQL"**

---

### **Paso 3: Configuración Automática**

Railway hará lo siguiente automáticamente:

✅ Creará una instancia de PostgreSQL  
✅ Generará credenciales automáticamente  
✅ Creará variables de entorno  
✅ Conectará el servicio a tu proyecto  

**Tiempo estimado:** 1-2 minutos

---

### **Paso 4: Verificar Variables de Entorno**

Railway creará automáticamente estas variables de entorno:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PGHOST` | Host de PostgreSQL | `containers-us-west-xxx.railway.app` |
| `PGPORT` | Puerto de PostgreSQL | `5432` |
| `PGDATABASE` | Nombre de la base de datos | `railway` |
| `PGUSER` | Usuario de PostgreSQL | `postgres` |
| `PGPASSWORD` | Contraseña de PostgreSQL | `password_generada` |

**Para ver las variables:**

1. En Railway Dashboard, haz clic en tu servicio PostgreSQL
2. Ve a la pestaña **"Variables"**
3. Verás todas las variables listadas

---

### **Paso 5: Conectar Variables al Servicio Principal**

Las variables de PostgreSQL están disponibles automáticamente para todos los servicios en el mismo proyecto.

**Tu código ya está preparado para usar estas variables:**

El servidor detecta automáticamente las variables de Railway:
- `PGHOST` → `DB_HOST`
- `PGPORT` → `DB_PORT`
- `PGDATABASE` → `DB_NAME`
- `PGUSER` → `DB_USER`
- `PGPASSWORD` → `DB_PASSWORD`

**No necesitas hacer nada más** - El código tiene fallback si no hay PostgreSQL.

---

### **Paso 6: Verificar Conexión**

Una vez que Railway termine de crear PostgreSQL:

1. Ve a la pestaña **"Logs"** de tu servicio principal
2. Deberías ver mensajes como:
   ```
   🚀 Starting poker server...
   📍 PORT: 4000, HOST: 0.0.0.0
   🔄 Attempting to initialize PostgreSQL database...
   ✅ PostgreSQL database initialized successfully
   ```

O si PostgreSQL no está disponible:
   ```
   ⚠️ PostgreSQL not available, continuing with fallback mode...
   ✅ Fallback database confirmed
   ```

---

## 🎯 Métodos Alternativos

### **Método 1: Desde el Dashboard Principal**

1. En el dashboard de tu proyecto
2. Haz clic en **"+ New"** (botón grande)
3. Selecciona **"Database"**
4. Selecciona **"PostgreSQL"**

### **Método 2: Desde el Menú Lateral**

1. En el dashboard de tu proyecto
2. Busca la sección de servicios
3. Haz clic en **"+ New Service"**
4. Selecciona **"Database"** → **"PostgreSQL"**

---

## 📊 Verificar que PostgreSQL Está Corriendo

### **En Railway Dashboard:**

1. Deberías ver un nuevo servicio llamado **"PostgreSQL"** o **"Postgres"**
2. El estado debería ser **"Active"** o **"Running"**
3. Verás un ícono de base de datos 🗄️

### **En los Logs:**

1. Haz clic en el servicio PostgreSQL
2. Ve a la pestaña **"Logs"**
3. Deberías ver:
   ```
   PostgreSQL is ready to accept connections
   ```

---

## 🔧 Configuración Avanzada (Opcional)

### **Cambiar Nombre del Servicio:**

1. Haz clic en el servicio PostgreSQL
2. Ve a **"Settings"**
3. Cambia el nombre si lo deseas

### **Ver Detalles de Conexión:**

1. Haz clic en el servicio PostgreSQL
2. Ve a la pestaña **"Variables"**
3. Ahí verás todas las credenciales

### **Conectar con Cliente Externo:**

Puedes usar herramientas como:
- **pgAdmin**
- **DBeaver**
- **TablePlus**
- **psql** (línea de comandos)

**Usa las variables de entorno de Railway para conectarte.**

---

## 🐛 Troubleshooting

### ❌ **No veo la opción "Database"**

**Solución:**
- Asegúrate de estar en el dashboard del proyecto (no en la página principal)
- Verifica que tengas permisos en el proyecto
- Intenta refrescar la página

---

### ❌ **PostgreSQL no se crea**

**Solución:**
- Verifica que tengas créditos disponibles en Railway
- Revisa los logs en Railway Dashboard
- Intenta crear el servicio nuevamente

---

### ❌ **No puedo ver las variables de entorno**

**Solución:**
1. Haz clic en el servicio PostgreSQL (no en el servicio principal)
2. Ve a la pestaña **"Variables"**
3. Las variables deberían estar ahí

**Nota:** Las variables están en el servicio PostgreSQL, pero están disponibles para todos los servicios del proyecto.

---

### ❌ **El servidor no se conecta a PostgreSQL**

**Solución:**
1. Verifica que PostgreSQL esté corriendo (estado "Active")
2. Verifica que las variables de entorno estén configuradas
3. Revisa los logs del servidor para ver errores de conexión
4. El código tiene fallback - debería funcionar sin PostgreSQL también

---

## ✅ Checklist

Después de agregar PostgreSQL, verifica:

- [ ] Servicio PostgreSQL aparece en el dashboard
- [ ] Estado del servicio es "Active" o "Running"
- [ ] Variables de entorno están disponibles (`PGHOST`, `PGPORT`, etc.)
- [ ] Logs del servidor muestran conexión exitosa (o fallback)
- [ ] La aplicación funciona correctamente

---

## 📝 Notas Importantes

1. **Variables Automáticas:** Railway crea las variables automáticamente. No necesitas configurarlas manualmente.

2. **Disponibilidad Global:** Las variables de PostgreSQL están disponibles para todos los servicios en el mismo proyecto.

3. **Fallback:** Tu código tiene un sistema de fallback. Si PostgreSQL no está disponible, la app funcionará en modo memoria.

4. **Costo:** PostgreSQL en Railway usa créditos. El plan gratuito ($5/mes) es suficiente para desarrollo.

5. **Persistencia:** Los datos se guardan automáticamente. No necesitas configurar backups manualmente (Railway lo hace).

---

## 🎉 ¡Listo!

Una vez que agregues PostgreSQL:

1. ✅ Railway creará la instancia automáticamente
2. ✅ Las variables estarán disponibles
3. ✅ Tu servidor se conectará automáticamente
4. ✅ Los datos se guardarán persistentemente

**No necesitas hacer nada más** - Todo está configurado automáticamente! 🚀

---

## 📞 Ayuda Adicional

Si tienes problemas:

1. **Revisa los logs** en Railway Dashboard
2. **Documentación de Railway:** https://docs.railway.app/databases/postgres
3. **Comunidad Railway:** https://discord.gg/railway

---

**Última actualización:** 2024-01-XX

