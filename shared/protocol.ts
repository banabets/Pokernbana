// shared/protocol.ts
export type Suit = '♠' | '♥' | '♦' | '♣'
export type Rank = '2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'10'|'J'|'Q'|'K'|'A'
export type Card = `${Rank}${Suit}`
export type Street = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'ended'
export type PlayerID = string
export type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'allin'

export interface PlayerPublic {
  id: PlayerID
  name: string
  stack: number
  seat: number
  hasActed: boolean
  isAllIn: boolean
  isBot: boolean
  bet: number
  hand?: Card[]
  avatar?: string
  subscription?: 'free' | 'bronze' | 'silver' | 'gold' | 'diamond'
}

export interface TableState {
  roomId: string
  players: PlayerPublic[]
  community: Card[]
  pot: number
  dealerPos: number
  currentPos: number
  smallBlind: number
  bigBlind: number
  minRaise: number
  currentBet: number
  street: Street
  toAct: PlayerID | null
  handNumber: number
  seats: number
  started: boolean
  createdAt: number
  updatedAt: number
  sidePots?: any[]
  creatorId?: string
}

export interface LobbyRoomSummary {
  roomId: string
  name: string
  seats: number
  players: number
  smallBlind: number
  bigBlind: number
  status: 'waiting' | 'running'
  hasBots: boolean
}

export type ClientAction = {
  roomId: string
  action: ActionType
  amount?: number
}

export interface LeaderboardRow {
  id: string
  name: string
  earnings: number
}

// Payload types for client events
export interface CreateRoomPayload {
  name: string
  seats: number
  smallBlind: number
  bigBlind: number
  buyIn: number
  withBots?: boolean
}

export interface JoinRoomPayload {
  roomId: string
}

export interface PlayerActionPayload {
  roomId: string
  action: ActionType
  amount?: number
  type?: string
}

/** ===== Online users ===== */
export type OnlineCountPayload = { count: number }

export const ServerEvents = {
  LOBBY_STATE: 'lobbyState',
  TABLE_STATE: 'tableState',
  CHAT: 'chat',
  ERROR: 'error',
  LEADERBOARD: 'leaderboard',

  /** Conteo de usuarios online (broadcast/puntual) */
  ONLINE_COUNT: 'onlineCount',
  
  /** Chat por mesa */
  CHAT_MESSAGE: 'chatMessage',
  CHAT_HISTORY: 'chatHistory',
  DEALER_TIPPED: 'dealerTipped',
} as const

export const ClientEvents = {
  JOIN_LOBBY: 'joinLobby',
  CREATE_ROOM: 'createRoom',
  JOIN_ROOM: 'joinRoom',
  START_HAND: 'startHand',
  PLAYER_ACTION: 'playerAction',
  SEND_CHAT: 'sendChat',
  GET_LEADERBOARD: 'getLeaderboard',

  /** Solicitar el conteo actual de usuarios online */
  GET_ONLINE_COUNT: 'getOnlineCount',

  /** Chat por mesa */
  CHAT_JOIN: 'chatJoin',
  CHAT_LEAVE: 'chatLeave',
  CHAT_SEND: 'chatSend',
  TIP_DEALER: 'tipDealer',
  UPDATE_AVATAR: 'updateAvatar',
  UPDATE_USERNAME: 'updateUsername',
  UPDATE_SUBSCRIPTION: 'updateSubscription',

  /** Cambio de asiento */
  CHANGE_SEAT: 'changeSeat',
} as const
