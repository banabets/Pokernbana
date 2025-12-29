import { Card, PlayerID, Street, ActionType } from '../../../shared/protocol.js'
import Evaluator from 'poker-evaluator'

export function makeDeck(): Card[] {
  const suits = ['♠','♥','♦','♣'] as const
  const ranks = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'] as const
  const deck: Card[] = []
  for (const r of ranks) for (const s of suits) deck.push(`${r}${s}` as Card)
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

export type Seat = {
  id: PlayerID
  name: string
  stack: number
  bet: number
  seat: number
  folded: boolean
  allIn: boolean
  isBot: boolean
  cards: Card[]
}

export type Table = {
  roomId: string
  seats: Seat[]
  community: Card[]
  pot: number
  dealerPos: number
  currentPos: number
  smallBlind: number
  bigBlind: number
  minRaise: number
  street: Street
  deck: Card[]
  lastAggressor?: PlayerID | null
  lastBetSize: number
}

export function evaluateHand(cards: Card[], board: Card[]) {
  // poker-evaluator expects strings like "As" not "A♠". Normalize quickly.
  const suitMap = {'♠':'s','♥':'h','♦':'d','♣':'c'} as const
  const mapSuit = (s: string) => suitMap[s as keyof typeof suitMap] || 's'
  const conv = (c: Card) => c[0] + mapSuit(c[1]) // 'A' + 's' => 'As'
  const seven = [...cards, ...board].slice(0,7).map(conv)
  const result = Evaluator.evalHand(seven)
  return result // { handType, handRank, value, handName }
}

export function nextPos(table: Table, from: number): number {
  const n = table.seats.length
  for (let i = 1; i < n + 1; i++) {
    const idx = (from + i) % n
    const p = table.seats[idx]
    if (!p) continue
    if (!p.folded && !p.allIn && p.stack + p.bet > 0) return idx
  }
  return from
}