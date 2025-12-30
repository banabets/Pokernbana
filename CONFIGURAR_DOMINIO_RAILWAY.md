# 🌐 Cómo Configurar Dominio en Railway

## 📋 Opciones de Dominio

Railway ofrece dos opciones:
1. **Dominio gratuito de Railway** (rápido y fácil)
2. **Dominio personalizado** (requiere dominio propio)

---

## 🚀 Opción 1: Dominio Gratuito de Railway (Recomendado para Empezar)

### **Paso 1: Generar Dominio de Railway**

1. En Railway Dashboard, ve a tu **servicio principal**
2. Haz clic en la pestaña **"Settings"**
3. Busca la sección **"Domains"** o **"Networking"**
4. Haz clic en **"Generate Domain"** o **"Add Domain"**
5. Railway te dará una URL como: `tu-app.railway.app`

**¡Listo!** Tu aplicación estará disponible en esa URL.

---

### **Paso 2: Verificar que Funciona**

1. Copia la URL que Railway te dio
2. Ábrela en tu navegador
3. Deberías ver tu aplicación de poker

**Ejemplo de URL:**
```
https://poker-night-production.up.railway.app
```

---

## 🎯 Opción 2: Dominio Personalizado (Para Producción)

Si tienes un dominio propio (ej: `poker.tu-dominio.com`):

### **Paso 1: Agregar Dominio Personalizado en Railway**

1. En Railway Dashboard → Tu Servicio → **Settings**
2. Busca la sección **"Domains"**
3. Haz clic en **"Custom Domain"** o **"Add Custom Domain"**
4. Ingresa tu dominio (ej: `poker.tu-dominio.com`)
5. Railway te mostrará instrucciones para configurar DNS

---

### **Paso 2: Configurar DNS en tu Proveedor**

Railway te dará una de estas opciones:

#### **Opción A: CNAME (Recomendado)**

1. Ve a tu proveedor de DNS (Namecheap, GoDaddy, Cloudflare, etc.)
2. Agrega un registro **CNAME**:
   - **Tipo:** `CNAME`
   - **Nombre/Host:** `poker` (o `@` para el dominio raíz)
   - **Valor/Destino:** `tu-app.railway.app` (la URL de Railway)
   - **TTL:** `Auto` o `3600`

**Ejemplo:**
```
Tipo: CNAME
Nombre: poker
Valor: poker-night-production.up.railway.app
```

---

#### **Opción B: A Record (Alternativa)**

Si Railway te da una IP:

1. Agrega un registro **A**:
   - **Tipo:** `A`
   - **Nombre:** `poker`
   - **Valor:** `IP que Railway te proporciona`
   - **TTL:** `Auto` o `3600`

---

### **Paso 3: Esperar Propagación DNS**

1. La propagación DNS puede tardar **5 minutos a 48 horas**
2. Normalmente toma **10-30 minutos**
3. Railway configurará SSL automáticamente con Let's Encrypt

---

### **Paso 4: Verificar SSL**

1. Después de la propagación DNS, Railway configurará SSL automáticamente
2. Puede tardar **5-10 minutos** adicionales
3. Verifica que la URL funcione con `https://`

---

## 🔧 Configuración por Proveedor de DNS

### **Namecheap**

1. Ve a **Domain List** → Selecciona tu dominio → **Advanced DNS**
2. Agrega nuevo registro:
   - **Type:** `CNAME Record`
   - **Host:** `poker`
   - **Value:** `tu-app.railway.app`
   - **TTL:** `Automatic`
3. Guarda los cambios

---

### **GoDaddy**

1. Ve a **My Products** → **DNS**
2. Agrega nuevo registro:
   - **Type:** `CNAME`
   - **Name:** `poker`
   - **Value:** `tu-app.railway.app`
   - **TTL:** `1 Hour`
3. Guarda

---

### **Cloudflare (Recomendado)**

1. Ve a tu dominio en Cloudflare
2. Ve a **DNS** → **Records**
3. Agrega nuevo registro:
   - **Type:** `CNAME`
   - **Name:** `poker`
   - **Target:** `tu-app.railway.app`
   - **Proxy status:** `DNS only` (naranja apagado) o `Proxied` (naranja encendido)
   - **TTL:** `Auto`
4. Guarda

**Nota:** Si usas Cloudflare Proxy (naranja), Railway puede tardar más en configurar SSL.

---

## ✅ Verificación

### **Verificar que el Dominio Funciona:**

1. Espera 10-30 minutos después de configurar DNS
2. Abre tu dominio en el navegador: `https://poker.tu-dominio.com`
3. Deberías ver tu aplicación

### **Verificar SSL:**

1. La URL debería empezar con `https://`
2. Deberías ver un candado 🔒 en el navegador
3. Railway configura SSL automáticamente

---

## 🐛 Troubleshooting

### **Problema: Dominio no carga**

**Solución:**
1. Verifica que el DNS esté configurado correctamente
2. Espera más tiempo (hasta 48 horas)
3. Usa herramientas como `nslookup` o `dig` para verificar DNS:
   ```bash
   nslookup poker.tu-dominio.com
   ```

---

### **Problema: SSL no funciona**

**Solución:**
1. Espera 5-10 minutos después de que el DNS funcione
2. Railway configura SSL automáticamente
3. Verifica en Railway Dashboard que el dominio esté "Active"
4. Si usas Cloudflare Proxy, desactívalo temporalmente

---

### **Problema: Error de certificado SSL**

**Solución:**
1. Verifica que el dominio apunte correctamente a Railway
2. Espera a que Railway genere el certificado
3. Reinicia el servicio en Railway si es necesario

---

## 📝 Notas Importantes

1. **SSL Automático:** Railway configura SSL automáticamente con Let's Encrypt
2. **Renovación Automática:** Railway renueva los certificados automáticamente
3. **Propagación DNS:** Puede tardar hasta 48 horas (normalmente 10-30 minutos)
4. **Subdominios:** Puedes usar subdominios como `poker.tu-dominio.com`, `app.tu-dominio.com`, etc.

---

## 🎯 Resumen Rápido

### **Dominio Gratuito de Railway:**
1. Settings → Domains → Generate Domain
2. ¡Listo! Usa la URL que Railway te da

### **Dominio Personalizado:**
1. Settings → Domains → Custom Domain
2. Ingresa tu dominio
3. Configura CNAME en tu proveedor DNS
4. Espera propagación (10-30 min)
5. Railway configura SSL automáticamente

---

## 🔗 URLs de Ejemplo

**Dominio de Railway:**
```
https://poker-night-production.up.railway.app
```

**Dominio Personalizado:**
```
https://poker.tu-dominio.com
https://app.tu-dominio.com
https://juego.tu-dominio.com
```

---

## ✅ Checklist

- [ ] Dominio generado o configurado en Railway
- [ ] DNS configurado en proveedor (si es dominio personalizado)
- [ ] Esperado propagación DNS (10-30 minutos)
- [ ] SSL configurado automáticamente por Railway
- [ ] URL funciona en el navegador
- [ ] Aplicación carga correctamente

---

**¿Necesitas ayuda con algún paso específico de la configuración del dominio?** 🚀


