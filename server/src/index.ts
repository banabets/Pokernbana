import express from 'express'
import http from 'http'
import cors from 'cors'
import { Server } from 'socket.io'
import fetch from 'node-fetch'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'

import {
  ServerEvents,
  ClientEvents,
  LobbyRoomSummary,
  ClientAction,
  LeaderboardRow,
  CreateRoomPayload,
  JoinRoomPayload,
  PlayerActionPayload,
  TableState,
  PlayerPublic
} from './shared/protocol.js'

import { ImprovedEngine, RoomData, PayoutHook } from './engine-improved.js'
import { getErrorMessage } from './types.js'

// Importar inicialización de base de datos con fallback
import { initDatabase } from './database-init.js'
import { DatabaseFallback } from './database-fallback.js'

const app = express()
app.use(cors())

// Servir archivos estáticos del frontend (para Railway)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Ruta al frontend build (desde server/dist/server/src/ hasta client/dist/)
const clientDistPath = join(__dirname, '../../../../client/dist')

// Servir frontend estático si existe (producción)
if (existsSync(clientDistPath)) {
  console.log('📦 Serving static frontend from:', clientDistPath)
  app.use(express.static(clientDistPath))
  
  // Todas las rutas no-API sirven el index.html (SPA routing)
  app.get('*', (req, res, next) => {
    // Si es una ruta de API, continuar
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next()
    }
    // Si no, servir el index.html
    res.sendFile(join(clientDistPath, 'index.html'))
  })
} else {
  // En desarrollo, solo responder en la ruta raíz
  app.get('/', (_req: any, res: any) => res.send('Holdem server up'))
}

// ========== CRYPTO PRICES PROXY ==========
app.get('/api/crypto-prices', async (_req: any, res: any) => {
  try {
    console.log('💰 SERVER: Fetching crypto prices from CoinGecko...')

    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?' +
      'ids=solana,bitcoin,ethereum,litecoin&' +
      'vs_currencies=usd&' +
      'include_24hr_change=true'
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API responded with status: ${response.status}`)
    }

    const data = await response.json()
    console.log('💰 SERVER: Crypto prices fetched successfully:', Object.keys(data as object).length, 'cryptos')

    // Add cache headers for better performance
    res.setHeader('Cache-Control', 'public, max-age=30') // Cache for 30 seconds
    res.json(data)

  } catch (error) {
    console.error('💰 SERVER: Error fetching crypto prices:', error)
    res.status(500).json({
      error: 'Failed to fetch crypto prices',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  transports: ['polling', 'websocket'],
  pingTimeout: 60000,      // 60 segundos para responder al ping
  pingInterval: 25000,     // Ping cada 25 segundos
  upgradeTimeout: 30000,   // 30 segundos para upgrade a websocket
  maxHttpBufferSize: 1e6,  // 1MB max buffer
  connectTimeout: 45000    // 45 segundos para conectar
})
console.log('🚀 SERVER: Socket.IO server configured with extended timeouts')

// ========== GLOBAL ERROR HANDLERS ==========
// Prevenir que el servidor se caiga por errores no capturados
process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION - Server will continue running:')
  console.error(err.name, err.message)
  console.error(err.stack)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED REJECTION - Server will continue running:')
  console.error('Promise:', promise)
  console.error('Reason:', reason)
})

const engines = new Map<string, ImprovedEngine>()
const rooms = new Map<string, RoomData>()
const leaderboard = new Map<string, { name: string, earnings: number }>()

/** ===== Player Balances ===== */
const playerBalances = new Map<string, number>()
// Map to track which table each user is at
const userRooms = new Map<string, string>()

// Function to get bot avatar based on name
function getBotAvatar(botName: string): string {
  const botAvatars: { [key: string]: string } = {
    'Bot A': '🤖',
    'Bot B': '🎭',
    'Bot C': '👻',
    'Bot D': '🦊'
  }
  return botAvatars[botName] || '🤖'
}

/** ===== Online users counter ===== */
const onlineSockets = new Set<string>()
function broadcastOnlineCount() {
  io.emit(ServerEvents.ONLINE_COUNT, { count: onlineSockets.size })
}

/** ===== Lobby helpers ===== */
function lobbySummary(): LobbyRoomSummary[] {
  return Array.from(rooms.values()).map(r => ({
    roomId: r.id, name: r.name, seats: r.seatsMax, players: r.seats.length,
    smallBlind: r.smallBlind, bigBlind: r.bigBlind, status: r.status, hasBots: r.seats.some(s=>s.isBot)
  }))
}

/** ===== Leaderboard payout hook ===== */
const onPayout: PayoutHook = (winnerIds, amountEach, handNumber) => {
  for (const room of rooms.values()) {
    for (const w of winnerIds) {
      const seat = room.seats.find(s=>s.id===w)
      if (!seat) continue

      // SOLO agregar ganadores al leaderboard (earnings > 0)
      if (amountEach > 0) {
        const entry = leaderboard.get(w) || { name: seat.name, earnings: 0 }
        entry.earnings += amountEach
        entry.name = seat.name
        leaderboard.set(w, entry)
      }
    }
  }

  // Enviar SOLO ganadores (ordenados por earnings)
  const winnersOnly = Array.from(leaderboard.entries())
    .filter(([_, v]) => v.earnings > 0) // Solo con ganancias positivas
    .map(([id, v])=>({ id, name: v.name, earnings: v.earnings }))
    .sort((a,b)=> b.earnings - a.earnings).slice(0, 50)

  console.log('🏆 SERVER: Leaderboard updated after payout')
  console.log('🏆 SERVER: Winners found:', winnersOnly.length)
  if (winnersOnly.length > 0) {
    console.log('🏆 SERVER: Top 3 winners:', winnersOnly.slice(0, 3).map(w => `${w.name}: $${w.earnings}`))
  }

  // Siempre enviar (incluso si está vacío para mostrar "No winners yet")
  io.emit(ServerEvents.LEADERBOARD, winnersOnly)
}

/** ===== Utility functions for tables ===== */
function removePlayerFromRoom(userId: string, roomId: string) {
  const room = rooms.get(roomId)
  if (!room) return false

  const playerIndex = room.seats.findIndex(s => s.id === userId)
  if (playerIndex === -1) return false

  // Save player balance before removing
  const removedPlayer = room.seats[playerIndex]
  const currentBalance = removedPlayer.stack
  playerBalances.set(userId, currentBalance)
  console.log('💰 SERVER: Saved balance for', removedPlayer.name, ':', currentBalance)

  // Remove player from table
  room.seats.splice(playerIndex, 1)
  console.log('🚪 SERVER: Removed player', removedPlayer.name, 'from room', roomId)

  // If table is empty, delete it
  if (room.seats.length === 0) {
    rooms.delete(roomId)
    console.log('🏠 SERVER: Room', roomId, 'is now empty, removing from lobby')

    // Detener el engine si existe
    const engine = engines.get(roomId)
    if (engine) {
      engines.delete(roomId)
      console.log('🛑 SERVER: Stopped engine for empty room', roomId)
    }
  } else {
    // If players remain, update table state
    const engine = engines.get(roomId)
    if (engine) {
      engine.room = room // Actualizar la referencia al room en el engine
      engine.pushState()
    }
  }

  return true
}

/** ===== Table chat (room-scoped) ===== */
// Fallbacks compatibles con el cliente
const CHAT_JOIN     = ClientEvents.CHAT_JOIN     ?? 'CHAT_JOIN'
const CHAT_LEAVE    = ClientEvents.CHAT_LEAVE    ?? 'CHAT_LEAVE'
const CHAT_SEND     = ClientEvents.CHAT_SEND     ?? 'CHAT_SEND'
const CHAT_MESSAGE  = ServerEvents.CHAT_MESSAGE  ?? 'CHAT_MESSAGE'
const CHAT_HISTORY  = ServerEvents.CHAT_HISTORY  ?? 'CHAT_HISTORY'

// ===== TIP dealer (fallbacks) =====
const TIP_DEALER    = ClientEvents.TIP_DEALER    ?? 'TIP_DEALER'
const UPDATE_AVATAR = ClientEvents.UPDATE_AVATAR
const UPDATE_USERNAME = ClientEvents.UPDATE_USERNAME
const UPDATE_SUBSCRIPTION = ClientEvents.UPDATE_SUBSCRIPTION

// Nuevo evento para notificar cambios en datos de usuario
const USER_DATA_UPDATED = 'USER_DATA_UPDATED'

console.log('🔧 SERVER: ClientEvents loaded:', { UPDATE_AVATAR, UPDATE_USERNAME, UPDATE_SUBSCRIPTION })
const DEALER_TIPPED = ServerEvents.DEALER_TIPPED ?? 'DEALER_TIPPED'

// canal interno de socket.io para cada room
const chan = (roomId: string) => `room:${roomId}`
// historial por room (capado)
const chatHistory = new Map<string, Array<{id:string,userId:string,name:string,text:string,ts:number,subscription?:'free'|'bronze'|'silver'|'gold'|'diamond',avatar?:string}>>()
const CHAT_CAP = 200
// historial del chat global del lobby (capado)
const globalChatHistory: Array<{id:string,userId:string,name:string,text:string,ts:number,subscription?:'free'|'bronze'|'silver'|'gold'|'diamond',avatar?:string}> = []
const GLOBAL_CHAT_CAP = 100

// Map para almacenar nombres de usuario dinámicos por userId
const userNames = new Map<string, string>()
// Map para almacenar subscriptions de usuario por userId
const userSubscriptions = new Map<string, 'free' | 'bronze' | 'silver' | 'gold' | 'diamond'>()
// Map para almacenar créditos de store por userId
const userStoreCredits = new Map<string, number>()

// Archivo para persistir suscripciones premium
const SUBSCRIPTIONS_FILE = './data/userSubscriptions.json'
// Archivo para persistir créditos de store
const STORE_CREDITS_FILE = './data/userStoreCredits.json'

// Función para cargar suscripciones desde archivo
async function loadUserSubscriptions() {
  try {
    console.log('💎 SERVER: Starting to load user subscriptions...')
    // Usar imports dinámicos para compatibilidad con ES modules
    const fs = await import('fs')
    const path = await import('path')

    const filePath = path.resolve(SUBSCRIPTIONS_FILE)
    console.log('💎 SERVER: Subscriptions file path:', filePath)

    const dirPath = path.dirname(filePath)

    // Crear directorio si no existe
    if (!fs.existsSync(dirPath)) {
      console.log('💎 SERVER: Creating subscriptions directory:', dirPath)
      fs.mkdirSync(dirPath, { recursive: true })
    }

    if (fs.existsSync(filePath)) {
      console.log('💎 SERVER: Subscriptions file exists, reading...')
      const data = fs.readFileSync(filePath, 'utf8')
      console.log('💎 SERVER: Raw file data:', data)
      const subscriptions = JSON.parse(data)
      console.log('💎 SERVER: Parsed subscriptions:', subscriptions)

      for (const [userId, subscription] of Object.entries(subscriptions)) {
        userSubscriptions.set(userId, subscription as 'free' | 'bronze' | 'silver' | 'gold' | 'diamond')
        console.log('💎 SERVER: Loaded subscription for', userId, ':', subscription)
      }
      console.log('💎 SERVER: Loaded', userSubscriptions.size, 'user subscriptions from file')
    } else {
      console.log('💎 SERVER: Subscriptions file does not exist')
    }
  } catch (error) {
    console.log('💎 SERVER: Error loading user subscriptions:', getErrorMessage(error))
    console.log('💎 SERVER: Error stack:', error instanceof Error ? error.stack : 'No stack available')
  }
}

// Función para guardar suscripciones al archivo
async function saveUserSubscriptions() {
  try {
    // Usar imports dinámicos para compatibilidad con ES modules
    const fs = await import('fs')
    const path = await import('path')

    const filePath = path.resolve(SUBSCRIPTIONS_FILE)
    const dirPath = path.dirname(filePath)

    // Crear directorio si no existe
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }

    const subscriptions = Object.fromEntries(userSubscriptions)
    fs.writeFileSync(filePath, JSON.stringify(subscriptions, null, 2))
    console.log('💎 SERVER: Saved', userSubscriptions.size, 'user subscriptions to file')
  } catch (error) {
    console.log('💎 SERVER: Error saving user subscriptions:', getErrorMessage(error))
  }
}

// Función para cargar créditos de store desde archivo
async function loadUserStoreCredits() {
  try {
    console.log('💰 SERVER: Starting to load user store credits...')
    const fs = await import('fs')
    const path = await import('path')

    const filePath = path.resolve(STORE_CREDITS_FILE)
    const dirPath = path.dirname(filePath)

    // Crear directorio si no existe
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }

    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8')
      const credits = JSON.parse(data)

      // Convertir claves string a números y poblar el Map
      for (const [userId, creditAmount] of Object.entries(credits)) {
        userStoreCredits.set(userId, Number(creditAmount))
      }

      console.log('💰 SERVER: Loaded', userStoreCredits.size, 'user store credits from file')
    } else {
      console.log('💰 SERVER: No store credits file found, will create on first save')
    }
  } catch (error) {
    console.log('💰 SERVER: Error loading user store credits:', getErrorMessage(error))
  }
}

// Función para guardar créditos de store en archivo
async function saveUserStoreCredits() {
  try {
    const fs = await import('fs')
    const path = await import('path')

    const filePath = path.resolve(STORE_CREDITS_FILE)
    const dirPath = path.dirname(filePath)

    // Crear directorio si no existe
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }

    const credits = Object.fromEntries(userStoreCredits)
    fs.writeFileSync(filePath, JSON.stringify(credits, null, 2))
    console.log('💰 SERVER: Saved', userStoreCredits.size, 'user store credits to file')
  } catch (error) {
    console.log('💰 SERVER: Error saving user store credits:', getErrorMessage(error))
  }
}
// Map para almacenar avatares de usuario por userId
const userAvatars = new Map<string, string>()
// mapeo socket -> room actual del chat (para auto-leave)
const socketRoom = new Map<string, string>()

// Cargar suscripciones al iniciar el servidor
loadUserSubscriptions().catch(error => {
  console.log('💎 SERVER: Failed to load subscriptions on startup:', getErrorMessage(error))
})

// Cargar créditos de store al iniciar el servidor
loadUserStoreCredits().catch(error => {
  console.log('💰 SERVER: Failed to load store credits on startup:', getErrorMessage(error))
})

io.on('connection', async (socket) => {
  console.log('🔗 SERVER: ========== NEW SOCKET CONNECTION ==========')
  console.log('🔗 SERVER: Socket ID:', socket.id)
  console.log('🔗 SERVER: Socket connected:', socket.connected)

  // Obtener o generar ID único persistente del cliente
  let userId = socket.handshake.query.clientId as string
  let userName: string

  console.log('🔑 SERVER: Received clientId from socket query:', userId)

  if (!userId) {
    // Si no hay clientId, generar uno nuevo (para compatibilidad)
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    userId = `${timestamp}-${random}`
    userName = 'User-' + random.toUpperCase()
    console.log('🔑 SERVER: No clientId provided, generated new userId:', userId)
  } else {
    // Usar el ID persistente del cliente
    userName = userNames.get(userId) || 'User-' + userId.slice(-6).toUpperCase()
    console.log('🔑 SERVER: Using persistent clientId:', userId, 'with userName:', userName)
  }

  // Restaurar suscripción si existe
  const savedSubscription = userSubscriptions.get(userId)
  console.log('💎 SERVER: Checking subscription for user', userId, '- savedSubscription:', savedSubscription, '- userSubscriptions size:', userSubscriptions.size)
  if (savedSubscription && savedSubscription !== 'free') {
    console.log('💎 SERVER: Restored subscription for user', userId, ':', savedSubscription)
  } else {
    console.log('💎 SERVER: No saved subscription found for user', userId, '- using free')
  }

  // Restaurar avatar si existe
  const savedAvatar = userAvatars.get(userId)
  if (savedAvatar) {
    console.log('🎭 SERVER: Restored avatar for user', userId, ':', savedAvatar)
  }

  // Guardar el nombre del usuario
  userNames.set(userId, userName)

  // Asignar 10,000 créditos al usuario "Banana"
  if (userName === 'Banana') {
    const currentCredits = userStoreCredits.get(userId) || 0
    if (currentCredits < 10000) {
      userStoreCredits.set(userId, 10000)
      await saveUserStoreCredits()
      console.log('🍌 SERVER: Assigned 10,000 credits to user Banana (userId:', userId, ')')
    }
  }

  // Inicializar créditos si no existen (500 por defecto)
  if (!userStoreCredits.has(userId)) {
    userStoreCredits.set(userId, 500)
    console.log('💰 SERVER: Initialized credits for new user:', userId, '- 500 credits')
  }

  console.log('🎯 NEW CONNECTION!')
  console.log('🎯 Socket ID (from Socket.IO):', socket.id)
  console.log('🎯 Generated User ID:', userId)
  console.log('🎯 Generated User Name:', userName)
  console.log('🎯 Total connections:', onlineSockets.size + 1)
  console.log('🎯 SERVER: All event listeners registered successfully for user:', userId)
  console.log('💰 Current credits for user:', userStoreCredits.get(userId) || 0)

  // Enviar el userId y datos restaurados al cliente
  const userData = {
    userId,
    userName,
    subscription: savedSubscription || 'free',
    avatar: savedAvatar || '🙂',
    storeCredits: userStoreCredits.get(userId) || 500
  }
  socket.emit('USER_CONNECTED', userData)
  console.log('📡 SERVER: Sent USER_CONNECTED to client:', userData)
  console.log('📡 SERVER: Socket ID:', socket.id)
  console.log('📡 SERVER: All current online users:', Array.from(onlineSockets))

  // === Online counter ===
  onlineSockets.add(userId)
  broadcastOnlineCount()

  socket.on(ClientEvents.GET_ONLINE_COUNT, () => {
    socket.emit(ServerEvents.ONLINE_COUNT, { count: onlineSockets.size })
  })
  
  socket.on(ClientEvents.GET_LEADERBOARD, () => {
    console.log('🏆 SERVER: Leaderboard requested by client:', userId)

    // Enviar SOLO ganadores (ordenados por earnings)
    const winnersOnly = Array.from(leaderboard.entries())
      .filter(([_, v]) => v.earnings > 0) // Solo con ganancias positivas
      .map(([id, v])=>({ id, name: v.name, earnings: v.earnings }))
      .sort((a,b)=> b.earnings - a.earnings).slice(0, 50)

    console.log('🏆 SERVER: Sending leaderboard with', winnersOnly.length, 'winners')
    if (winnersOnly.length > 0) {
      console.log('🏆 SERVER: Top winner:', winnersOnly[0])
    }

    socket.emit(ServerEvents.LEADERBOARD, winnersOnly)
  })

  console.log('🎯 SERVER: About to register UPDATE_AVATAR listener for user:', userId)

  // === Update Avatar ===
  socket.on(UPDATE_AVATAR, async (avatar: string) => {
    console.log('🎭 SERVER: ========== AVATAR UPDATE RECEIVED ==========')
    console.log('🎭 SERVER: Avatar update received:', avatar, 'for user:', userId)
    console.log('🎭 SERVER: Avatar parameter type:', typeof avatar)
    console.log('🎭 SERVER: Avatar parameter length:', avatar?.length)
    console.log('🎭 SERVER: Socket connected:', socket.connected)
    console.log('🎭 SERVER: Socket id:', socket.id)
    console.log('🎭 SERVER: Current userAvatars map size:', userAvatars.size)
    console.log('🎭 SERVER: Current userNames map size:', userNames.size)
    console.log('🎭 SERVER: User exists in userAvatars:', userAvatars.has(userId))
    console.log('🎭 SERVER: User exists in userNames:', userNames.has(userId))

    // Buscar al usuario en todas las rooms
    console.log('🎭 SERVER: Searching for user in rooms...')

    for (const [roomId, room] of rooms) {
      const playerIndex = room.seats.findIndex(s => s.id === userId)

      if (playerIndex !== -1) {
        // Actualizar el avatar del jugador
        console.log('🎭 SERVER: Found player in room', roomId, '- updating avatar')
        room.seats[playerIndex].avatar = avatar
        // Actualizar el Map global de avatares
        userAvatars.set(userId, avatar)
        console.log('🎭 SERVER: Updated userAvatars Map for user:', userId, 'to:', avatar)
        console.log('🎭 SERVER: userAvatars Map now contains:', userAvatars.size, 'entries')
        console.log('🎭 SERVER: userNames Map now contains:', userNames.size, 'entries')

        // Guardar suscripciones en archivo (por consistencia)
        await saveUserSubscriptions()

        // Actualizar historial de chat global del lobby
        globalChatHistory.forEach(msg => {
          if (msg.userId === userId) {
            msg.avatar = avatar
          }
        })

        // Actualizar historial de chat por room
        for (const [roomId, chatHist] of chatHistory) {
          chatHist.forEach(msg => {
            if (msg.userId === userId) {
              msg.avatar = avatar
            }
          })
        }

        // Notificar cambio de datos de usuario a TODOS los clientes conectados
        console.log('🎭 SERVER: Broadcasting user data update globally')
        const userDataUpdate = {
          userId,
          avatar,
          userName: userNames.get(userId),
          subscription: userSubscriptions.get(userId) || 'free'
        }
        console.log('🎭 SERVER: Sending USER_DATA_UPDATED:', userDataUpdate)
        console.log('🎭 SERVER: Total connected sockets:', io.sockets.sockets.size)
        io.emit(USER_DATA_UPDATED, userDataUpdate)
        console.log('🎭 SERVER: USER_DATA_UPDATED emitted to all clients')

        // Notificar a todos los jugadores en la room sobre el cambio
        console.log('🎭 SERVER: Broadcasting avatar update to room:', roomId)

        const tableStateData = {
          roomId,
          players: room.seats,
          community: room.community || [],
          pot: room.pot || 0,
          dealerPos: room.dealerPos || -1,
          currentPos: room.currentPos || 0,
          smallBlind: room.smallBlind || 5,
          bigBlind: room.bigBlind || 10,
          minRaise: room.minRaise || 0,
          currentBet: room.currentBet || 0,
          street: room.street || 'waiting',
          toAct: room.toAct || null,
          handNumber: room.handNumber || 0,
          seats: room.seatsMax || 5,
          started: room.started || false,
          createdAt: room.createdAt || Date.now(),
          updatedAt: Date.now()
        }

        io.to(chan(roomId)).emit(ServerEvents.TABLE_STATE, tableStateData)
        console.log('🎭 SERVER: Avatar update broadcasted to room:', roomId)
        break
      }
    }
  })

  console.log('🎯 SERVER: About to register UPDATE_USERNAME listener for user:', userId)

  // === Update Username ===
  socket.on(UPDATE_USERNAME, (newName: string) => {
    console.log('👤 SERVER: ========== USERNAME UPDATE RECEIVED ==========')
    console.log('👤 SERVER: Username update requested for user:', userId, 'new name:', newName)
    console.log('👤 SERVER: Socket connected:', socket.connected)
    console.log('👤 SERVER: Socket id:', socket.id)
    console.log('👤 SERVER: Current userNames map size:', userNames.size)
    console.log('👤 SERVER: Current userAvatars map size:', userAvatars.size)
    console.log('👤 SERVER: User exists in userNames:', userNames.has(userId))
    console.log('👤 SERVER: User exists in userAvatars:', userAvatars.has(userId))

    // Validar el nombre
    const cleanName = String(newName || '').trim().slice(0, 20) // Max 20 caracteres
    if (!cleanName) {
      console.log('👤 SERVER: Invalid username, ignoring')
      return
    }

    // Actualizar el nombre en el Map global
    userNames.set(userId, cleanName)
    console.log('👤 SERVER: Updated userNames Map for user:', userId, 'to:', cleanName)

    // Buscar al usuario en todas las rooms
    for (const [roomId, room] of rooms) {
      const playerIndex = room.seats.findIndex(s => s.id === userId)

      if (playerIndex !== -1) {
        // Actualizar el nombre del jugador
        room.seats[playerIndex].name = cleanName
        console.log('👤 SERVER: Username updated for player in room:', roomId)

        // Actualizar historial de chat para este usuario en esta room
        const roomChatHistory = chatHistory.get(roomId)
        if (roomChatHistory) {
          roomChatHistory.forEach(msg => {
            if (msg.userId === userId) {
              msg.name = cleanName
            }
          })
          console.log('👤 SERVER: Updated chat history for user in room:', roomId)
        }

        // Notificar cambio de datos de usuario a TODOS los clientes conectados
        console.log('👤 SERVER: Broadcasting user data update globally')
        const userDataUpdate = {
          userId,
          avatar: userAvatars.get(userId),
          userName: cleanName,
          subscription: userSubscriptions.get(userId) || 'free'
        }
        console.log('👤 SERVER: Sending USER_DATA_UPDATED:', userDataUpdate)
        console.log('👤 SERVER: Total connected sockets:', io.sockets.sockets.size)
        io.emit(USER_DATA_UPDATED, userDataUpdate)
        console.log('👤 SERVER: USER_DATA_UPDATED emitted to all clients')

        // Notificar a todos los jugadores en la room sobre el cambio
        console.log('👤 SERVER: Broadcasting username update to room:', roomId)
        io.to(chan(roomId)).emit(ServerEvents.TABLE_STATE, {
          roomId,
          players: room.seats,
          community: room.community || [],
          pot: room.pot || 0,
          dealerPos: room.dealerPos || -1,
          currentPos: room.currentPos || 0,
          smallBlind: room.smallBlind || 5,
          bigBlind: room.bigBlind || 10,
          minRaise: room.minRaise || 0,
          currentBet: room.currentBet || 0,
          street: room.street || 'waiting',
          toAct: room.toAct || null,
          handNumber: room.handNumber || 0,
          seats: room.seatsMax || 5,
          started: room.started || false,
          createdAt: room.createdAt || Date.now(),
          updatedAt: Date.now()
        })

        // Enviar historial de chat actualizado a todos los usuarios en la room
        if (roomChatHistory && roomChatHistory.length > 0) {
          console.log('👤 SERVER: Sending updated chat history to room:', roomId)
          io.to(chan(roomId)).emit(CHAT_HISTORY, roomChatHistory)
        }

        break
      }
    }

    // Actualizar historial de chat global del lobby
    globalChatHistory.forEach(msg => {
      if (msg.userId === userId) {
        msg.name = cleanName
        msg.avatar = userAvatars.get(userId) || '🙂' // Actualizar avatar también
      }
    })

    // Actualizar historial de chat por room
    for (const [roomId, chatHist] of chatHistory) {
      chatHist.forEach(msg => {
        if (msg.userId === userId) {
          msg.name = cleanName
          msg.avatar = userAvatars.get(userId) || '🙂' // Actualizar avatar también
        }
      })
    }

    console.log('👤 SERVER: Updated global chat history for user')

    // Enviar historial de chat global actualizado a todos los usuarios conectados
    if (globalChatHistory.length > 0) {
      console.log('👤 SERVER: Sending updated global chat history to all users')
      io.emit('GLOBAL_CHAT_HISTORY', globalChatHistory)
    }
  })

  // === Update Subscription ===
  console.log('🔧 SERVER: Registering UPDATE_SUBSCRIPTION handler for user:', userId)
  socket.on(UPDATE_SUBSCRIPTION, async (subscription: 'free' | 'bronze' | 'silver' | 'gold' | 'diamond') => {
    console.log('💎 SERVER: 🎯 EVENTO RECIBIDO - Subscription update requested for user:', userId, 'new subscription:', subscription)

    // Validar el subscription
    const validSubscriptions = ['free', 'bronze', 'silver', 'gold', 'diamond']
    if (!validSubscriptions.includes(subscription)) {
      console.log('💎 SERVER: Invalid subscription, ignoring')
      return
    }

    // Buscar al usuario en todas las rooms
    for (const [roomId, room] of rooms) {
      const playerIndex = room.seats.findIndex(s => s.id === userId)

      if (playerIndex !== -1) {
        // Actualizar la subscription del jugador
        room.seats[playerIndex].subscription = subscription
        // Actualizar el Map global de subscriptions
        userSubscriptions.set(userId, subscription)

        // Si es la primera vez que se actualiza el subscription, también actualizar el avatar
        if (!userAvatars.has(userId) && room.seats[playerIndex].avatar) {
          userAvatars.set(userId, room.seats[playerIndex].avatar)
        }

        // Actualizar historial de chat global del lobby
        globalChatHistory.forEach(msg => {
          if (msg.userId === userId) {
            msg.subscription = subscription
          }
        })

        // Actualizar historial de chat por room
        for (const [roomId, chatHist] of chatHistory) {
          chatHist.forEach(msg => {
            if (msg.userId === userId) {
              msg.subscription = subscription
            }
          })
        }

        // Guardar suscripciones en archivo
        await saveUserSubscriptions()

        console.log('💎 SERVER: Subscription updated for player in room:', roomId)

        // Notificar a todos los jugadores en la room sobre el cambio
        console.log('💎 SERVER: Broadcasting subscription update to room:', roomId)
        io.to(chan(roomId)).emit(ServerEvents.TABLE_STATE, {
          roomId,
          players: room.seats,
          community: room.community || [],
          pot: room.pot || 0,
          dealerPos: room.dealerPos || -1,
          currentPos: room.currentPos || 0,
          smallBlind: room.smallBlind || 5,
          bigBlind: room.bigBlind || 10,
          minRaise: room.minRaise || 0,
          currentBet: room.currentBet || 0,
          street: room.street || 'waiting',
          toAct: room.toAct || null,
          handNumber: room.handNumber || 0,
          seats: room.seatsMax || 5,
          started: room.status === 'running',
          createdAt: room.createdAt || Date.now(),
          updatedAt: Date.now()
        })
        break
      }
    }
  })

  // === Lobby ===
  socket.on(ClientEvents.JOIN_LOBBY, () => {
    console.log('JOIN_LOBBY received from', userId)
    const lobbyState = lobbySummary()
    console.log('Sending lobby state to client:', lobbyState.length, 'rooms')
    socket.emit(ServerEvents.LOBBY_STATE, lobbyState)
    // Enviar historial del chat global en evento separado
    socket.emit('GLOBAL_CHAT_HISTORY', globalChatHistory)
    
    // Enviar leaderboard inicial SOLO con ganadores
    const winnersOnly = Array.from(leaderboard.entries())
      .filter(([_, v]) => v.earnings > 0) // Solo con ganancias positivas
      .map(([id, v])=>({ id, name: v.name, earnings: v.earnings }))
      .sort((a,b)=> b.earnings - a.earnings).slice(0, 50)

    console.log('🏆 SERVER: Sending initial leaderboard to client:', userId, 'with', winnersOnly.length, 'winners')
    if (winnersOnly.length > 0) {
      console.log('🏆 SERVER: Top winner on init:', winnersOnly[0])
    }

    socket.emit(ServerEvents.LEADERBOARD, winnersOnly)
  })
  
  // === Volver al Lobby desde Room ===
  socket.on('RETURN_TO_LOBBY', () => {
    // Save player balance before leaving room
    const userRoomId = userRooms.get(userId)
    if (userRoomId) {
      const room = rooms.get(userRoomId)
      if (room) {
        const userSeat = room.seats.find(s => s.id === userId)
        if (userSeat) {
          const currentBalance = userSeat.stack
          playerBalances.set(userId, currentBalance)
          console.log('💰 SERVER: Saved balance on RETURN_TO_LOBBY for', userId, ':', currentBalance)
        }
      }
    }

    // Enviar historial del chat global al volver del room
    socket.emit('GLOBAL_CHAT_HISTORY', globalChatHistory)
  })

  socket.on(ClientEvents.CREATE_ROOM, (config?: any) => {
    console.log('CREATE_ROOM received from', userId, 'with config:', config)

    // Check if user has enough balance to create a table
    const roomCreationCost = 50 // Fixed cost to create a table
    console.log('💰 SERVER: Room creation cost:', roomCreationCost)

    // Find user in existing table to check balance
    let userBalance = 2000 // Default balance for new users
    for (const room of rooms.values()) {
      const userSeat = room.seats.find(s => s.id === userId)
      if (userSeat) {
        userBalance = userSeat.stack
        break
      }
    }

    console.log('💰 SERVER: User', userId, 'balance:', userBalance)

    if (userBalance < roomCreationCost) {
      console.log('❌ SERVER: User', userId, 'has insufficient balance for room creation')
      socket.emit('ERROR', { type: 'INSUFFICIENT_BALANCE', message: `$${roomCreationCost} required to create a table` })
      return
    }

    const id = 'room-' + Date.now().toString(36)
    const room: RoomData = {
      id,
      name: config?.name?.trim() ? config.name : ('Table ' + Math.floor(Math.random()*100)),
      seatsMax: config?.seats || 5,
      seats: [],
      smallBlind: config?.smallBlind || 5,
      bigBlind: config?.bigBlind || 10,
      status: 'waiting',
      handNumber: 0,
      dealerPos: -1,
      creatorId: userId // El creador de la sala
    }
    const buyInAmount = config?.buyIn || 2000
    // Deduct table creation cost from user balance
    const finalStack = userBalance - roomCreationCost
    console.log('💰 SERVER: Deducting room creation cost:', roomCreationCost, 'from user', userId)
    console.log('💰 SERVER: User balance:', userBalance, '->', finalStack)

    // FIXED SEATS: Human user always takes seat 1 (bottom center)
    room.seats.push({ id: userId, name: userName, stack: finalStack, seat: 1, isBot: false, folded:false, isAllIn:false, bet:0, hand:[], hasActed: false, avatar: '🙂' })

    // FIXED SEATS: Bots take specific seats in fixed order
    if (config?.withBots) {
      const fixedBotSeats = [
        { number: 2, name: 'Bot A' }, // Top-left
        { number: 3, name: 'Bot B' }, // Top-right
        { number: 4, name: 'Bot C' }, // Bottom-left
        { number: 5, name: 'Bot D' }  // Bottom-right
      ]

      const maxBots = Math.min(room.seatsMax - 1, 4) // Max 4 bots to leave space for human
      for (let i = 0; i < maxBots; i++) {
        const botId = `bot-${Math.random().toString(36).slice(2, 8)}`
        room.seats.push({
          id: botId,
          name: fixedBotSeats[i].name,
          stack: buyInAmount,
          seat: fixedBotSeats[i].number, // Asiento fijo
          isBot: true,
          folded: false,
          isAllIn: false,
          bet: 0,
          hand: [],
          hasActed: false,
          avatar: getBotAvatar(fixedBotSeats[i].name)
        })
      }
    }
    rooms.set(id, room)

    // tip bank per table
    ;(room as any).tipsBank = 0

    const engine = new ImprovedEngine(room, (event, payload)=> io.to(chan(room.id)).emit(event, payload), onPayout)
    engines.set(id, engine)

    console.log('Room created successfully:', id, 'with', room.seats.length, 'seats')
    const lobbyState = lobbySummary()
    console.log('Broadcasting lobby state:', lobbyState)
    io.emit(ServerEvents.LOBBY_STATE, lobbyState)
  })

  console.log('🎧 SERVER: Setting up JOIN_ROOM listener for socket:', socket.id)
  socket.on(ClientEvents.JOIN_ROOM, (payload: { roomId: string }) => {
    console.log('🚪 SERVER: JOIN_ROOM received from:', socket.id, 'userId:', userId, 'payload:', payload)
    console.log('🚪 SERVER: ClientEvents.JOIN_ROOM:', ClientEvents.JOIN_ROOM)

    const room = rooms.get(payload?.roomId)
    console.log('🚪 SERVER: Room found:', !!room, 'roomId:', payload?.roomId)
    console.log('🚪 SERVER: Available rooms:', Array.from(rooms.keys()))
    if (!room) {
      console.log('❌ SERVER: Room not found:', payload?.roomId)
      return
    }

    // If user is already at another table, remove from previous table
    const previousRoomId = userRooms.get(userId)
    if (previousRoomId && previousRoomId !== payload.roomId) {
      console.log('🔄 SERVER: User', userId, 'moving from room', previousRoomId, 'to room', payload.roomId)
      removePlayerFromRoom(userId, previousRoomId)

      // Notify players from previous table
      const prevEngine = engines.get(previousRoomId)
      if (prevEngine) {
        prevEngine.pushState()
      }
    }

    // Check if this user already has a seat at the table
    const mySeat = room.seats.find(s => s.id === userId)
    console.log('🚪 SERVER: Looking for existing seat for userId:', userId)
    console.log('🚪 SERVER: Found seat:', !!mySeat)
    console.log('🚪 SERVER: Current room seats:', room.seats.map(s => ({ id: s.id, name: s.name, isBot: s.isBot })))

    // Si el usuario ya tiene un asiento, no hacer nada (es una reconexión)
    if (mySeat) {
      console.log('🚪 SERVER: User already has a seat, skipping seat assignment')
    } else if (room.seats.length < room.seatsMax) {
      // Solo agregar nuevo usuario si hay espacio
      const inHand = room.status === 'running'

      // Encontrar el primer asiento disponible (1-based)
      let availableSeat = 1
      const occupiedSeats = room.seats.map(s => s.seat)
      while (occupiedSeats.includes(availableSeat) && availableSeat <= room.seatsMax) {
        availableSeat++
      }

      // Use saved balance or default to 2000
      const savedBalance = playerBalances.get(userId) || 2000
      console.log('💰 SERVER: Using saved balance for', userId, ':', savedBalance)

      room.seats.push({
        id: userId,
        name: userName,
        stack: savedBalance,
        seat: availableSeat,
        isBot: false,
        folded: inHand,
        isAllIn: false,
        bet: 0,
        hand: [],
        hasActed: false,
        avatar: '🙂'
      })
      console.log('👤 SERVER: Added new human player to room:', room.id)
      console.log('👤 SERVER: Player ID:', userId)
      console.log('👤 SERVER: Player Name:', userName)
      console.log('👤 SERVER: Seat:', availableSeat)
      console.log('👤 SERVER: Total players:', room.seats.length)
      console.log('👤 SERVER: All players in room:', room.seats.map(s => ({ id: s.id, name: s.name, isBot: s.isBot })))
    }

    // Update user-to-table mapping
    userRooms.set(userId, room.id)
    console.log('📍 SERVER: Updated user room mapping:', userId, '->', room.id)

    // also join the table channel to receive scoped events
    socket.join(chan(room.id))

    io.emit(ServerEvents.LOBBY_STATE, lobbySummary())
    const engine = engines.get(room.id)!

    // Send updated state to ALL players at the table
    if (engine) {
      const state = {
        roomId: room.id,
        players: room.seats.map(s => ({
          id: s.id, name: s.name, stack: s.stack, seat: s.seat,
          hasActed: s.hasActed, isAllIn: s.isAllIn, isBot: s.isBot,
          bet: s.bet, hand: s.hand, avatar: s.avatar, subscription: s.subscription,
        })),
        community: engine.community,
        pot: engine.pot,
        dealerPos: room.dealerPos,
        currentPos: engine.currentPos,
        smallBlind: room.smallBlind,
        bigBlind: room.bigBlind,
        minRaise: engine.minRaise,
        currentBet: engine.currentBet,
        street: engine.street,
        toAct: engine.toAct,
        handNumber: room.handNumber,
        seats: room.seatsMax,
        started: room.status === 'running',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      // Send to ALL players at the table (including the new one)
      console.log('📡 SERVER: About to send TABLE_STATE to room:', room.id)
      console.log('📡 SERVER: State includes players:', state.players.map(p => ({ id: p.id, name: p.name, isBot: p.isBot })))
      io.to(chan(room.id)).emit(ServerEvents.TABLE_STATE, state)
      console.log('📡 SERVER: Sent updated table state to ALL players in room:', room.id, 'Total players:', room.seats.length)
    }
  })

  socket.on(ClientEvents.START_HAND, (payload: { roomId: string }) => {
    const engine = payload?.roomId ? engines.get(payload.roomId) : undefined
    if (!engine) return
    engine.startHand()
  })

  socket.on(ClientEvents.PLAYER_ACTION, (payload: ClientAction) => {
    console.log('ACTION from', userId, payload)
    const engine = payload?.roomId ? engines.get(payload.roomId) : undefined
    if (!engine) return
    engine.applyAction(userId, payload.action, payload.amount)
  })

  socket.on('REQUEST_TABLE_STATE', (payload: { roomId: string }) => {
    console.log('📡 SERVER: REQUEST_TABLE_STATE received from:', socket.id, 'for room:', payload.roomId)
    const room = rooms.get(payload.roomId)
    if (!room) {
      console.log('❌ SERVER: Room not found for state request:', payload.roomId)
      return
    }

    const engine = engines.get(payload.roomId)
    if (!engine) {
      console.log('❌ SERVER: Engine not found for state request:', payload.roomId)
      return
    }

    const state = {
      roomId: room.id,
      players: room.seats.map(s => ({
        id: s.id, name: s.name, stack: s.stack, seat: s.seat,
        hasActed: s.hasActed, isAllIn: s.isAllIn, isBot: s.isBot,
        bet: s.bet, hand: s.hand, avatar: s.avatar,
      })),
      community: engine.community,
      pot: engine.pot,
      dealerPos: room.dealerPos,
      currentPos: engine.currentPos,
      smallBlind: room.smallBlind,
      bigBlind: room.bigBlind,
      minRaise: engine.minRaise,
      currentBet: engine.currentBet,
      street: engine.street,
      toAct: engine.toAct,
      handNumber: room.handNumber,
      seats: room.seatsMax,
      started: room.status === 'running',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    socket.emit(ServerEvents.TABLE_STATE, state)
    console.log('📡 SERVER: Sent requested table state to:', socket.id)
  })

  socket.on(ClientEvents.CHANGE_SEAT, (payload: { roomId: string, seatNumber: number }) => {
    console.log('🎯 SERVER: CHANGE_SEAT received!')
    console.log('🎯 SERVER: Payload:', payload)
    console.log('🎯 SERVER: From user:', userId)
    console.log('🎯 SERVER: ClientEvents.CHANGE_SEAT:', ClientEvents.CHANGE_SEAT)
    const room = rooms.get(payload.roomId)
    if (!room) {
      console.log('❌ SERVER: Room not found for seat change:', payload.roomId)
      return
    }

    const playerSeat = room.seats.find(s => s.id === userId)
    console.log('🎯 SERVER: Looking for player seat, found:', !!playerSeat)
    console.log('🎯 SERVER: Room seats:', room.seats.map(s => ({ id: s.id, seat: s.seat })))

    if (!playerSeat) {
      console.log('❌ SERVER: Player not found in room for seat change:', userId)
      return
    }

    // Verificar si el asiento está disponible
    const seatTaken = room.seats.find(s => s.seat === payload.seatNumber && s.id !== userId)
    console.log('🎯 SERVER: Checking if seat', payload.seatNumber, 'is taken:', !!seatTaken)

    if (seatTaken) {
      console.log('❌ SERVER: Seat', payload.seatNumber, 'is already taken by', seatTaken.id)
      return
    }

    // Change the player's seat
    const oldSeat = playerSeat.seat
    playerSeat.seat = payload.seatNumber
    console.log('✅ SERVER: Player', userId, 'changed from seat', oldSeat, 'to seat', payload.seatNumber)
    console.log('✅ SERVER: Updated room seats:', room.seats.map(s => ({ id: s.id, seat: s.seat })))

    // Send update to all players
    const engine = engines.get(payload.roomId)
    if (engine) {
      const state = {
        roomId: room.id,
        players: room.seats.map(s => ({
          id: s.id, name: s.name, stack: s.stack, seat: s.seat,
          hasActed: s.hasActed, isAllIn: s.isAllIn, isBot: s.isBot,
          bet: s.bet, hand: s.hand, avatar: s.avatar,
        })),
        community: engine.community,
        pot: engine.pot,
        dealerPos: room.dealerPos,
        currentPos: engine.currentPos,
        smallBlind: room.smallBlind,
        bigBlind: room.bigBlind,
        minRaise: engine.minRaise,
        currentBet: engine.currentBet,
        street: engine.street,
        toAct: engine.toAct,
        handNumber: room.handNumber,
        seats: room.seatsMax,
        started: room.status === 'running',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      console.log('📡 SERVER: Broadcasting updated table state to all players in room:', room.id)
      console.log('📡 SERVER: New state players:', state.players.map(p => ({ id: p.id, seat: p.seat })))
      io.to(chan(room.id)).emit(ServerEvents.TABLE_STATE, state)
      console.log('✅ SERVER: Sent updated table state after seat change to room:', room.id)
    }
  })

  // LEAVE_SEAT: Levantar del asiento cuando se vuelve al lobby
  socket.on('LEAVE_SEAT', (payload: { roomId: string }) => {
    console.log('🚪 SERVER: LEAVE_SEAT received!')
    console.log('🚪 SERVER: Payload:', payload)
    console.log('🚪 SERVER: From user:', userId)

    const room = rooms.get(payload.roomId)
    if (!room) {
      console.log('❌ SERVER: Room not found for leave seat:', payload.roomId)
      return
    }

    // Encontrar y remover al jugador del asiento
    const seatIndex = room.seats.findIndex(s => s.id === userId)
    if (seatIndex !== -1) {
      const removedSeat = room.seats[seatIndex]
      const currentBalance = removedSeat.stack
      playerBalances.set(userId, currentBalance)
      console.log('💰 SERVER: Saved balance on LEAVE_SEAT for', userId, ':', currentBalance)

      room.seats.splice(seatIndex, 1)
      console.log('✅ SERVER: Player', userId, 'left seat', removedSeat.seat, 'in room', payload.roomId)

      // Notificar a todos los jugadores en la room sobre el cambio
      const engine = engines.get(payload.roomId)
      if (engine) {
        const state = {
          roomId: room.id,
          players: room.seats.map(s => ({
            id: s.id, name: s.name, stack: s.stack, seat: s.seat,
            hasActed: s.hasActed, isAllIn: s.isAllIn, isBot: s.isBot,
            bet: s.bet, hand: s.hand, avatar: s.avatar,
          })),
          community: engine.community,
          pot: engine.pot,
          dealerPos: room.dealerPos,
          currentPos: engine.currentPos,
          smallBlind: room.smallBlind,
          bigBlind: room.bigBlind,
          minRaise: engine.minRaise,
          currentBet: engine.currentBet,
          street: engine.street,
          toAct: engine.toAct,
          handNumber: room.handNumber,
          seats: room.seatsMax,
          started: room.status === 'running',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        console.log('📡 SERVER: Broadcasting updated table state after player left seat')
        io.to(chan(room.id)).emit(ServerEvents.TABLE_STATE, state)
      }
    } else {
      console.log('⚠️ SERVER: Player', userId, 'was not seated in room', payload.roomId)
    }
  })

  /** ===== Table chat handlers ===== */
  socket.on(CHAT_JOIN, ({ roomId }: { roomId: string }) => {
    if (!roomId) return
    // leave previous chat room (if it existed)
    const prev = socketRoom.get(socket.id)
    if (prev && prev !== roomId) {
      socket.leave(chan(prev))
    }
    socketRoom.set(socket.id, roomId)
    socket.join(chan(roomId))

    const hist = chatHistory.get(roomId) ?? []
    socket.emit(CHAT_HISTORY, hist)
  })

  socket.on(CHAT_LEAVE, ({ roomId }: { roomId: string }) => {
    if (!roomId) return
    socket.leave(chan(roomId))
    if (socketRoom.get(socket.id) === roomId) socketRoom.delete(socket.id)
  })

  socket.on(CHAT_SEND, ({ roomId, text }: { roomId: string, text: string }) => {
    if (!roomId) return
    const msg = String(text ?? '').slice(0, 300).trim()
    if (!msg) return
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2,7),
      userId,
      name: userNames.get(userId) || userName, // Usar el nombre actualizado del Map
      text: msg,
      ts: Date.now(),
      subscription: userSubscriptions.get(userId) || 'free', // Incluir subscription
      avatar: userAvatars.get(userId) || '🙂' // Incluir avatar
    }
    console.log('💬 SERVER: Created chat message:', {
      id: entry.id,
      userId: entry.userId,
      name: entry.name,
      avatar: entry.avatar,
      hasAvatar: !!entry.avatar
    })
    const hist = chatHistory.get(roomId) ?? []
    hist.push(entry)
    if (hist.length > CHAT_CAP) hist.splice(0, hist.length - CHAT_CAP)
    chatHistory.set(roomId, hist)

    io.to(chan(roomId)).emit(CHAT_MESSAGE, entry)
  })

  /** ===== TIP dealer per table ===== */
  socket.on(TIP_DEALER, (payload: { roomId:string, amount:number }) => {
    try {
      const { roomId, amount } = payload || ({} as any)
      const a = Math.max(1, Math.floor(Number(amount) || 0))
      if (!roomId || a <= 0) return

      const room = rooms.get(roomId)
      if (!room) return
      const seat = room.seats.find(s => s.id === userId)
      if (!seat) return
      if ((seat.stack ?? 0) < a) return

      // deduct stack and accumulate tips
      seat.stack -= a
      ;(room as any).tipsBank = ((room as any).tipsBank || 0) + a

      // notify only the table
      io.to(chan(roomId)).emit(DEALER_TIPPED, {
        roomId,
        fromId: userId,
        fromName: seat.name,
        amount: a,
        totalTips: (room as any).tipsBank
      })

      // refresca estado para que todos vean el nuevo stack
      const engine = engines.get(roomId)
      ;(engine as any)?.pushState?.()
    } catch (e) {
      console.error('TIP_DEALER error', e)
    }
  })

  /** ===== Chat global del lobby con persistencia ===== */
  socket.on(ClientEvents.SEND_CHAT, (text: string) => {
    const msg = String(text ?? '').slice(0,300).trim()
    if (!msg) return

    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2,7),
      userId,
      name: userNames.get(userId) || userName, // Usar el nombre actualizado del Map
      text: msg,
      ts: Date.now(),
      subscription: userSubscriptions.get(userId) || 'free', // Incluir subscription
      avatar: userAvatars.get(userId) || '🙂' // Incluir avatar
    }
    
    // Guardar en historial global
    globalChatHistory.push(entry)
    if (globalChatHistory.length > GLOBAL_CHAT_CAP) {
      globalChatHistory.splice(0, globalChatHistory.length - GLOBAL_CHAT_CAP)
    }
    
    // Enviar a todos los usuarios con evento específico para chat global
    io.emit('GLOBAL_CHAT_MESSAGE', entry)
  })

  /** ===== Gestión de Créditos del Store ===== */
  socket.on('SYNC_STORE_CREDITS', (credits: number) => {
    console.log('💰 SERVER: Syncing store credits for user', userId, '- Credits:', credits)
    userStoreCredits.set(userId, credits)
    saveUserStoreCredits().catch(error => {
      console.log('💰 SERVER: Error saving store credits:', error.message)
    })
  })

  socket.on('GET_STORE_CREDITS', () => {
    const credits = userStoreCredits.get(userId) || 500
    console.log('💰 SERVER: Sending store credits to user', userId, '- Credits:', credits)
    socket.emit('STORE_CREDITS_UPDATE', { credits })
  })

  socket.on(ClientEvents.GET_LEADERBOARD, () => {
    console.log('🏆 SERVER: Leaderboard requested by client (2nd handler):', userId)

    const winnersOnly = Array.from(leaderboard.entries())
      .filter(([_, v]) => v.earnings > 0) // Solo con ganancias positivas
      .map(([id, v])=>({ id, name: v.name, earnings: v.earnings }))
      .sort((a,b)=> b.earnings - a.earnings).slice(0, 50)

    console.log('🏆 SERVER: Sending leaderboard with', winnersOnly.length, 'winners (2nd handler)')
    socket.emit(ServerEvents.LEADERBOARD, winnersOnly)
  })

  // === Disconnect ===
  socket.on('disconnect', () => {
    // Save player balance before disconnecting
    const userRoomId = userRooms.get(userId)
    if (userRoomId) {
      const room = rooms.get(userRoomId)
      if (room) {
        const userSeat = room.seats.find(s => s.id === userId)
        if (userSeat) {
          const currentBalance = userSeat.stack
          playerBalances.set(userId, currentBalance)
          console.log('💰 SERVER: Saved balance on disconnect for', userId, ':', currentBalance)
        }
      }
    }

    // limpieza chat
    const prev = socketRoom.get(socket.id)
    if (prev) {
      socket.leave(chan(prev))
      socketRoom.delete(socket.id)
    }

    // Clean up user-to-table mapping
    userRooms.delete(userId)

    // Clean up username mapping
    userNames.delete(userId)
    // Clean up subscription mapping
    userSubscriptions.delete(userId)
    // Clean up avatar mapping
    userAvatars.delete(userId)

    onlineSockets.delete(userId)
    broadcastOnlineCount()
  })
})

const PORT = Number(process.env.PORT || 4000)
const HOST = process.env.HOST || '0.0.0.0' // Aceptar conexiones desde cualquier IP

// Función principal para iniciar el servidor
async function startServer() {
  console.log('🚀 Starting poker server...')
  console.log(`📍 PORT: ${PORT}, HOST: ${HOST}`)
  console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV}`)
  
  let databaseMode = 'fallback'; // Start with fallback for faster startup

  // Start HTTP server immediately
  server.listen(PORT, HOST, () => {
    console.log(`✅ Server listening on http://${HOST}:${PORT}`)
    console.log(`🎮 Poker server ready for multiplayer!`)
    console.log(`🗄️ Database: Fallback (In-Memory) - for Railway compatibility`)
  })

  // Initialize database in background
  setTimeout(async () => {
    try {
      console.log('🔄 Attempting to initialize PostgreSQL database in background...')
      await initDatabase()
      databaseMode = 'postgresql';
      console.log('✅ PostgreSQL database initialized successfully')
    } catch (error) {
      console.log('⚠️ PostgreSQL not available, continuing with fallback mode...')
      console.log('Error:', getErrorMessage(error))
      
      try {
        await DatabaseFallback.initialize()
        console.log('✅ Fallback database confirmed')
      } catch (fallbackError) {
        console.error('❌ Fallback database failed:', fallbackError)
      }
    }
  }, 1000) // Initialize DB after server starts
}

// Iniciar el servidor
startServer()
