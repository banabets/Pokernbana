import { Server, Socket } from 'socket.io'
import { z } from 'zod'
import {
  ServerEvents, ClientEvents,
  CreateRoomPayload, JoinRoomPayload,
  LobbyRoomSummary, TableState, PlayerActionPayload, PlayerPublic
} from '../../../shared/protocol.js'
import { makeDeck, Table, Seat, nextPos, evaluateHand } from './engine'
import { runBotTick } from '../bot/simpleBot'

const createRoomSchema = z.object({
  name: z.string().min(1).max(30),
  seats: z.number().int().min(2).max(5),
  smallBlind: z.number().int().min(1),
  bigBlind: z.number().int().min(2),
  buyIn: z.number().int().min(50).default(2000),
  withBots: z.boolean().optional()
})

type Room = {
  id: string
  name: string
  seats: number
  table: Table
  sockets: Map<string, Socket>
  spectators: Set<string>
  chat: { userName: string, text: string, ts: number }[]
  status: 'waiting' | 'running'
}

export function createLobby(io: Server) {
  const rooms = new Map<string, Room>()
  const userRoom = new Map<string, string>()

  function summarizeRoom(room: Room): LobbyRoomSummary {
    const players = room.table.seats.filter(Boolean).length
    return {
      roomId: room.id,
      name: room.name,
      seats: room.seats,
      players,
      smallBlind: room.table.smallBlind,
      bigBlind: room.table.bigBlind,
      status: room.status,
      hasBots: room.table.seats.some(s => s?.isBot)
    }
  }

  function broadcastLobby() {
    const list = Array.from(rooms.values()).map(summarizeRoom)
    io.emit(ServerEvents.LOBBY_STATE, list)
  }

  function toPublic(p: Seat): PlayerPublic {
    return {
      id: p.id, name: p.name, seat: p.seat, stack: p.stack,
      hasActed: p.bet > 0, isAllIn: p.allIn, isBot: p.isBot,
      bet: p.bet
    }
  }

  function tableToState(room: Room): TableState {
    const t = room.table
    return {
      roomId: room.id,
      players: t.seats.map(toPublic),
      community: t.community,
      pot: t.pot,
      sidePots: [],
      dealerPos: t.dealerPos,
      currentPos: t.currentPos,
      smallBlind: t.smallBlind,
      bigBlind: t.bigBlind,
      minRaise: t.minRaise,
      street: t.street,
      toAct: t.seats[t.currentPos]?.id ?? null,
      currentBet: t.lastBetSize,
      handNumber: 0,
      seats: room.seats, // max seats for this room
      started: room.status === 'running',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
  }

  function sendRoomState(room: Room) {
    const state = tableToState(room)
    io.to(room.id).emit(ServerEvents.TABLE_STATE, state)
  }

  function handleCreateRoom(socket: Socket, userId: string, userName: string, payload: CreateRoomPayload) {
    const parsed = createRoomSchema.safeParse(payload)
    if (!parsed.success) {
      socket.emit(ServerEvents.ERROR, parsed.error.flatten())
      return
    }
    const id = `room-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
    const { name, seats, smallBlind, bigBlind, buyIn, withBots } = parsed.data
    const room: Room = {
      id, name, seats,
      sockets: new Map(),
      spectators: new Set(),
      chat: [],
      status: 'waiting',
      table: {
        roomId: id,
        seats: [],
        community: [],
        pot: 0,
        dealerPos: 0,
        currentPos: 0,
        smallBlind, bigBlind,
        minRaise: bigBlind,
        street: 'ended',
        deck: [],
        lastAggressor: null,
        lastBetSize: 0,
      }
    }

    rooms.set(id, room)
    broadcastLobby()

    // FIXED SEATS: Creator always takes seat 1 (bottom center)
    const seat: Seat = {
      id: userId, name: userName, stack: buyIn, bet: 0, seat: 1,
      folded: false, allIn: false, isBot: false, cards: []
    }
    room.table.seats.push(seat)
    userRoom.set(userId, id)
    socket.join(id)
    room.sockets.set(userId, socket)

    // FIXED SEATS: Bots take specific seats
    if (withBots) {
      const fixedBotSeats = [
        { number: 2, name: 'Bot A' }, // Top-left
        { number: 3, name: 'Bot B' }, // Top-right
        { number: 4, name: 'Bot C' }, // Bottom-left
        { number: 5, name: 'Bot D' }  // Bottom-right
      ]

      const maxBots = Math.min(seats - 1, 4) // Max 4 bots
      for (let i = 0; i < maxBots; i++) {
        const botId = `bot-${Math.random().toString(36).slice(2, 8)}`
        room.table.seats.push({
          id: botId, name: fixedBotSeats[i].name, stack: buyIn, bet: 0,
          seat: fixedBotSeats[i].number, // Asiento fijo
          folded: false, allIn: false, isBot: true, cards: []
        })
      }
    }

    sendRoomState(room)
  }

  function handleJoinRoom(socket: Socket, userId: string, userName: string, payload: JoinRoomPayload) {
    const room = rooms.get(payload.roomId)
    if (!room) return socket.emit(ServerEvents.ERROR, { message: 'Room not found' })
    if (room.table.seats.length >= room.seats) return socket.emit(ServerEvents.ERROR, { message: 'Room is full' })
    const already = room.table.seats.find(s => s.id === userId)
    if (!already) {
      room.table.seats.push({
        id: userId, name: userName, stack: room.table.bigBlind * 200, bet: 0,
        seat: room.table.seats.length,
        folded: false, allIn: false, isBot: false, cards: []
      })
    }
    userRoom.set(userId, room.id)
    socket.join(room.id)
    room.sockets.set(userId, socket)
    sendRoomState(room)
  }

  function handleLeaveRoom(socket: Socket, userId: string) {
    const roomId = userRoom.get(userId)
    if (!roomId) return
    const room = rooms.get(roomId)
    if (!room) return
    room.table.seats = room.table.seats.filter(s => s.id != userId)
    userRoom.delete(userId)
    room.sockets.delete(userId)
    socket.leave(roomId)
    sendRoomState(room)
  }

  function handleDisconnect(userId: string) {
    handleLeaveRoom({leave:()=>{}, emit:()=>{}} as any, userId)
  }

  // Start a new hand in a room
  function startHand(room: Room) {
    const t = room.table
    t.deck = makeDeck()
    t.community = []
    t.pot = 0
    t.street = 'preflop'
    t.dealerPos = (t.dealerPos + 1) % t.seats.length
    t.currentPos = (t.dealerPos + 1) % t.seats.length

    // reset seats
    for (const p of t.seats) {
      p.cards = [t.deck.pop()!, t.deck.pop()!]
      p.bet = 0
      p.folded = false
      p.allIn = false
    }

    // blinds
    const sb = t.seats[t.currentPos]
    sb.bet = Math.min(sb.stack, t.smallBlind); sb.stack -= sb.bet
    t.currentPos = (t.currentPos + 1) % t.seats.length
    const bb = t.seats[t.currentPos]
    bb.bet = Math.min(bb.stack, t.bigBlind); bb.stack -= bb.bet
    t.minRaise = t.bigBlind
    t.lastAggressor = bb.id
    t.lastBetSize = t.bigBlind

    t.currentPos = (t.currentPos + 1) % t.seats.length
    room.status = 'running'
    sendRoomState(room)
  }

  function progressStreet(room: Room) {
    const t = room.table
    // move bets to pot
    for (const p of t.seats) { t.pot += p.bet; p.bet = 0 }
    if (t.street === 'preflop') {
      // flop
      t.deck.pop() // burn
      t.community = [t.deck.pop()!, t.deck.pop()!, t.deck.pop()!]
      t.street = 'flop'
      t.currentPos = nextPos(t, t.dealerPos)
    } else if (t.street === 'flop') {
      t.deck.pop()
      t.community.push(t.deck.pop()!)
      t.street = 'turn'
      t.currentPos = nextPos(t, t.dealerPos)
    } else if (t.street === 'turn') {
      t.deck.pop()
      t.community.push(t.deck.pop()!)
      t.street = 'river'
      t.currentPos = nextPos(t, t.dealerPos)
    } else if (t.street === 'river') {
      t.street = 'showdown'
    }
    sendRoomState(room)
  }

  function handlePlayerAction(socket: Socket, userId: string, payload: PlayerActionPayload) {
    const roomId = userRoom.get(userId)
    if (!roomId) return
    const room = rooms.get(roomId)!
    const t = room.table
    const seatIdx = t.seats.findIndex(s => s.id === userId)
    if (seatIdx < 0) return
    if (t.seats[t.currentPos]?.id !== userId) return

    const player = t.seats[seatIdx]

    switch (payload.type) {
      case 'fold':
        player.folded = true as any
        break
      case 'check':
        if (player.bet === Math.max(...t.seats.map(s => s.bet))) {
          // OK
        } else {
          return socket.emit(ServerEvents.ERROR, { message: 'Cannot check. Please call, bet, or fold.' })
        }
        break
      case 'call': {
        const toCall = Math.max(...t.seats.map(s => s.bet)) - player.bet
        const paid = Math.min(toCall, player.stack)
        player.stack -= paid
        player.bet += paid
        if (paid < toCall) player.allIn = true
        break
      }
      case 'bet': {
        const amount = Math.floor(payload.amount || 0)
        if (amount < t.bigBlind) return socket.emit(ServerEvents.ERROR, { message: 'Bet too small.' })
        if (amount > player.stack) return socket.emit(ServerEvents.ERROR, { message: 'Bet exceeds stack.' })
        player.stack -= amount
        player.bet += amount
        t.minRaise = amount
        t.lastAggressor = player.id
        t.lastBetSize = amount
        break
      }
      case 'raise': {
        const amount = Math.floor(payload.amount || 0)
        const toCall = Math.max(...t.seats.map(s => s.bet)) - player.bet
        const raiseSize = amount - toCall
        if (raiseSize < t.minRaise) return socket.emit(ServerEvents.ERROR, { message: 'Raise too small.' })
        if (amount > player.stack + toCall) return socket.emit(ServerEvents.ERROR, { message: 'Raise exceeds stack.' })
        player.stack -= amount
        player.bet += amount
        t.minRaise = raiseSize
        t.lastAggressor = player.id
        t.lastBetSize = amount
        break
      }
      case 'allin': {
        const toTop = player.stack
        player.bet += toTop
        player.stack = 0
        player.allIn = true
        t.lastAggressor = player.id
        t.lastBetSize = toTop
        break
      }
    }

    // advance action
    t.currentPos = nextPos(t, t.currentPos)
    sendRoomState(room)
  }

  function sendLobbyState(socket: Socket) {
    const list = Array.from(rooms.values()).map(summarizeRoom)
    socket.emit(ServerEvents.LOBBY_STATE, list)
  }

  // Expose handlers to index.ts
  return {
    sendLobbyState,
    handleCreateRoom,
    handleJoinRoom,
    handleLeaveRoom,
    handleDisconnect,
    startHand: (roomId: string) => rooms.get(roomId) && startHand(rooms.get(roomId)!),
    handlePlayerAction,
  }
}