# 🗄️ Base de Datos PostgreSQL - Poker Night by Banabets

Esta implementación agrega una base de datos PostgreSQL sólida al proyecto de poker, preparada para futuras integraciones de criptomonedas.

## 🚀 Inicio Rápido

### 1. Instalar PostgreSQL

**Windows:**
```bash
# Descargar desde: https://www.postgresql.org/download/windows/
# O usar chocolatey:
choco install postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS:**
```bash
brew install postgresql
```

### 2. Configurar Base de Datos

```bash
# Crear base de datos
createdb poker_game

# Crear usuario (opcional, puedes usar el usuario por defecto)
createuser poker_user
createdb poker_game
```

### 3. Configurar Variables de Entorno

Copia y configura el archivo `config.env`:

```bash
# Copiar archivo de configuración
cp config.env.example config.env

# Editar con tus credenciales
DB_HOST=localhost
DB_PORT=5432
DB_NAME=poker_game
DB_USER=poker_user
DB_PASSWORD=tu_password_seguro
```

### 4. Probar Conexión

```bash
# Probar conexión a PostgreSQL
node test-database.js
```

### 5. Iniciar Servidor

```bash
# El servidor creará las tablas automáticamente
npm run dev:server
```

## 📊 Arquitectura de la Base de Datos

### Tablas Principales

#### 👤 `users`
```sql
- id: UUID (Primary Key)
- username: VARCHAR(50) UNIQUE
- email: VARCHAR(255) UNIQUE (nullable)
- password_hash: VARCHAR(255) (nullable)
- subscription_level: ENUM (free, bronze, silver, gold, diamond)
- avatar: TEXT
- game_balance: DECIMAL(15,2)
- store_credits: INTEGER
- total_earnings: DECIMAL(15,2)
- games_played: INTEGER
- games_won: INTEGER
- win_rate: DECIMAL(5,2)
- is_online: BOOLEAN
- last_seen: TIMESTAMP

-- Campos preparados para criptomonedas
- wallet_address: VARCHAR(100)
- blockchain_type: ENUM (ethereum, solana, polygon, bitcoin)
- is_wallet_connected: BOOLEAN
- crypto_balance: DECIMAL(20,8)

-- Campos de seguridad
- email_verified: BOOLEAN
- two_factor_enabled: BOOLEAN
- login_attempts: INTEGER
- locked_until: TIMESTAMP
```

#### 🎲 `rooms`
```sql
- id: UUID (Primary Key)
- name: VARCHAR(100)
- host_id: UUID (Foreign Key -> users.id)
- max_seats: INTEGER
- small_blind: DECIMAL(10,2)
- big_blind: DECIMAL(10,2)
- buy_in: DECIMAL(10,2)
- status: ENUM (waiting, playing, finished)
- has_bots: BOOLEAN
- hand_number: INTEGER

-- Estadísticas
- total_hands_played: INTEGER
- total_pot: DECIMAL(15,2)
- average_pot: DECIMAL(10,2)
- duration: INTEGER (minutos)

-- Configuración
- allow_spectators: BOOLEAN
- is_private: BOOLEAN
- password: VARCHAR(50)
- game_mode: ENUM (cash, tournament)
```

#### 💰 `transactions`
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key -> users.id)
- type: ENUM (game_buyin, game_win, game_loss, store_purchase, crypto_deposit, etc.)
- status: ENUM (pending, confirmed, failed, cancelled)
- amount: DECIMAL(15,2)
- crypto_amount: DECIMAL(36,18)
- usd_value: DECIMAL(15,2)
- token_symbol: VARCHAR(10)
- blockchain: VARCHAR(20)
- transaction_hash: VARCHAR(100) UNIQUE
- wallet_address: VARCHAR(100)
- room_id: UUID (Foreign Key -> rooms.id)
- hand_number: INTEGER
- description: TEXT
- metadata: JSONB
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- confirmed_at: TIMESTAMP
- processed_at: TIMESTAMP
```

## 🔧 Servicios Implementados

### `UserService`
- ✅ Crear usuarios
- ✅ Buscar por ID/username/email
- ✅ Actualizar balance
- ✅ Actualizar estadísticas
- ✅ Gestionar avatares y usernames
- ✅ Estados online/offline
- ✅ Leaderboard

### `TransactionService`
- ✅ Crear transacciones
- ✅ Buscar transacciones por usuario/tipo
- ✅ Confirmar transacciones
- ✅ Estadísticas de transacciones
- ✅ Soporte nativo para cripto (futuro)

## 🔮 Preparado para Criptomonedas

### Características Implementadas

#### 1. **Campos Extensibles**
- `wallet_address`: Dirección de wallet
- `blockchain_type`: Tipo de blockchain
- `crypto_balance`: Balance en cripto
- `token_symbol`: Símbolo del token
- `transaction_hash`: Hash de transacción blockchain

#### 2. **Tipos de Transacción para Cripto**
```typescript
'crypto_deposit'      // Depósitos
'crypto_withdrawal'   // Retiros
'crypto_swap'         // Intercambios
'bonus'              // Bonos
'referral'           // Referidos
'subscription'       // Suscripciones
```

#### 3. **Soporte Multi-Blockchain**
```typescript
type BlockchainType =
  | 'ethereum' | 'polygon' | 'arbitrum'  // EVM compatible
  | 'solana' | 'solana-devnet'           // Solana
  | 'bitcoin' | 'bitcoin-testnet'        // Bitcoin
```

### Próximas Integraciones

#### 🚀 **Fase 2: Wallets**
- Conexión con MetaMask/WalletConnect
- Soporte para múltiples wallets
- Gestión segura de claves privadas

#### 🚀 **Fase 3: Pagos con Cripto**
- Apuestas con tokens
- Compras en tienda con crypto
- Conversión automática USD ↔ Crypto

#### 🚀 **Fase 4: DeFi Integration**
- Staking rewards
- Liquidity pools
- NFT collectibles

## 📋 Scripts Disponibles

### Migraciones
```bash
# Migrar datos existentes
cd database/migrations
npx ts-node migrate-existing-data.ts

# Verificar estado de migración
npx ts-node migrate-existing-data.ts check
```

### Testing
```bash
# Probar conexión a base de datos
node test-database.js

# Ejecutar tests (cuando se implementen)
npm test
```

### Desarrollo
```bash
# Iniciar solo servidor con DB
npm run dev:server

# Ver logs de base de datos
tail -f logs/database.log
```

## 🔐 Seguridad

### Medidas Implementadas
- ✅ Hash de contraseñas con bcrypt
- ✅ Validación de inputs
- ✅ Protección contra SQL injection (ORM)
- ✅ Rate limiting preparado
- ✅ Logs de auditoría

### Para Producción
- 🔒 Configurar SSL/TLS
- 🔒 Usar connection pooling
- 🔒 Implementar backups automáticos
- 🔒 Configurar monitoring
- 🔒 Usar variables de entorno seguras

## 📊 Monitorización

### Métricas Disponibles
- 👥 Usuarios activos
- 🎲 Partidas jugadas
- 💰 Volumen de transacciones
- 📈 Estadísticas de rendimiento
- 🔗 Estado de conexiones

### Dashboard (Futuro)
- Panel de administración
- Analytics en tiempo real
- Reportes automáticos
- Alertas de seguridad

## 🚨 Troubleshooting

### Problemas Comunes

#### ❌ "Connection refused"
```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

#### ❌ "Database does not exist"
```bash
# Crear base de datos
createdb poker_game

# O con psql:
psql -c "CREATE DATABASE poker_game;"
```

#### ❌ "Permission denied"
```bash
# Otorgar permisos al usuario
psql -c "GRANT ALL PRIVILEGES ON DATABASE poker_game TO poker_user;"
```

### Logs de Debug
```bash
# Ver logs del servidor
tail -f logs/server.log

# Ver logs de base de datos
tail -f logs/database.log
```

## 🎯 Próximos Pasos

### Inmediatos
- [ ] Probar migración de datos existentes
- [ ] Implementar sistema de sesiones
- [ ] Agregar validaciones adicionales
- [ ] Crear tests unitarios

### Futuro
- [ ] Integración con criptomonedas
- [ ] Sistema de referidos
- [ ] Análisis avanzado de jugadas
- [ ] API REST para aplicaciones móviles
- [ ] Sistema de torneos

---

## 💡 Consejos para Desarrolladores

1. **Siempre usar transacciones** para operaciones complejas
2. **Implementar índices** para consultas frecuentes
3. **Usar migraciones** para cambios en el esquema
4. **Mantener backups regulares** de la base de datos
5. **Monitorear rendimiento** de consultas
6. **Documentar cambios** en el esquema

¿Necesitas ayuda con algún aspecto específico? 🚀
