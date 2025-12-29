# 🎮 Acceso Móvil - Configuración del Juego Poker

## 📱 Cómo Jugar desde tu Teléfono

### Paso 1: Encuentra tu IP Local

#### Windows (PowerShell):
```powershell
ipconfig
```

Busca la línea `Dirección IPv4` en tu adaptador de red principal:
```
Adaptador de Ethernet Ethernet:
   Dirección IPv4. . . . . . . . . . . . . : 192.168.1.100
```

#### Windows (CMD):
```cmd
ipconfig | findstr "Dirección IPv4"
```

### Paso 2: Configura las Variables de Entorno

Crea un archivo `.env` en la carpeta `client/`:

```env
# client/.env
VITE_SERVER_URL=http://TU_IP_LOCAL:4000
```

**Ejemplo:**
```env
VITE_SERVER_URL=http://192.168.1.100:4000
```

### Paso 3: Reinicia los Servidores

1. **Detén los servidores actuales** (Ctrl+C en las terminales)

2. **Reinicia el servidor:**
   ```bash
   cd server
   npm run dev
   ```

3. **Reinicia el cliente:**
   ```bash
   cd client
   npm run dev
   ```

### Paso 4: Accede desde tu Teléfono

1. **Asegúrate de que tu teléfono esté conectado a la misma red WiFi**

2. **Abre el navegador en tu teléfono**

3. **Ve a la URL:**
   ```
   http://TU_IP_LOCAL:5173
   ```

   **Ejemplo:**
   ```
   http://192.168.1.100:5173
   ```

## 🔧 Solución Rápida (Sin Variables de Entorno)

Si no quieres crear archivos `.env`, puedes:

1. **Ejecutar el cliente normalmente:**
   ```bash
   cd client
   npm run dev
   ```

2. **Acceder desde tu teléfono usando:**
   ```
   http://TU_IP_LOCAL:5173
   ```

El cliente se conectará automáticamente al servidor corriendo en tu computadora.

## 🛠️ Troubleshooting

### ❌ "No se puede conectar al servidor"
- Verifica que ambos dispositivos estén en la misma red WiFi
- Confirma que tu IP local no haya cambiado
- Asegúrate de que el firewall no bloquee el puerto 4000

### ❌ "Página no carga"
- Verifica que el cliente esté corriendo en el puerto 5173
- Intenta acceder desde tu computadora primero: `http://localhost:5173`

### ❌ "Juego no funciona en móvil"
- Algunos navegadores móviles pueden tener limitaciones
- Prueba con Chrome o Safari
- Asegúrate de que JavaScript esté habilitado

## 📊 Puertos Utilizados

- **Cliente (Vite):** `http://TU_IP:5173`
- **Servidor (Node.js):** `http://TU_IP:4000`
- **WebSocket:** Se conecta automáticamente al servidor

## 🎯 Resumen Rápido

1. **IP local:** Ejecuta `ipconfig` en Windows
2. **Cliente:** `http://TU_IP:5173`
3. **Servidor:** Corre automáticamente en segundo plano
4. **Mismo WiFi:** Teléfono y computadora deben estar conectados

¡Listo! Ahora puedes jugar Poker desde tu teléfono. 🎲📱


