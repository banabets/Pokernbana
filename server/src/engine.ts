import * as ProtocolRaw from '../../shared/protocol.js'
const Protocol: any = (ProtocolRaw as any).default ?? ProtocolRaw

type Card = import('../../shared/protocol.js').Card
type Street = import('../../shared/protocol.js').Street
type TableState = import('../../shared/protocol.js').TableState
type ClientAction = import('../../shared/protocol.js').ClientAction

const { ServerEvents } = Protocol

const RANKS = ['2','3','4','5','6','7','8','9','T','J','Q','K','A'] as const
const SUITS = ['♠','♥','♦','♣'] as const
const RANK_INDEX: Record<string, number> = Object.fromEntries(RANKS.map((r,i)=>[r,i]))

export type EngineSeat = {
  id: string
  name: string
  stack: number
  seat: number
  isBot: boolean
  folded: boolean
  isAllIn: boolean
  bet: number
  hand: Card[]
  avatar?: string
}

export type RoomData = {
  id: string
  name: string
  seatsMax: number
  seats: EngineSeat[]
  smallBlind: number
  bigBlind: number
  status: 'waiting'|'running'
  handNumber: number
  dealerPos: number
}

export type PayoutHook = (winnerIds: string[], amountEach: number, handNumber: number) => void

export class Engine {
  room: RoomData
  community: Card[] = []
  deck: Card[] = []
  pot = 0
  street: Street = 'ended'
  minRaise = 0
  currentBet = 0
  toAct: string | null = null
  currentPos = 0

  private timers = new Set<ReturnType<typeof setTimeout>>()
  private turnTimer: ReturnType<typeof setTimeout> | null = null
  private readonly TURN_MS = 25000
  private readonly BOT_THINK_MIN = 700
  private readonly BOT_THINK_MAX = 1600

  constructor(room: RoomData, private emit: (event: string, payload: any) => void, private onPayout?: PayoutHook) {
    this.room = room
    if (this.room.dealerPos == null) this.room.dealerPos = 0
  }

  destroy() {
    for (const t of this.timers) clearTimeout(t)
    this.timers.clear()
    if (this.turnTimer) clearTimeout(this.turnTimer)
    this.turnTimer = null
  }

  // ---------- utils ----------
  makeDeck(): Card[] {
    const d: Card[] = []
    for (const r of RANKS) for (const s of SUITS) d.push(`${r}${s}` as Card)
    return d
  }
  shuffle<T>(a: T[]): T[] {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  nextIndex(i: number) { return (i + 1) % this.room.seats.length }
  seatAt(i: number) { return this.room.seats[i] }
  notFolded() { return this.room.seats.filter(s => !s.folded && Array.isArray(s.hand) && s.hand.length === 2) }
  amountToCall(seat: EngineSeat) { return Math.max(0, this.currentBet - seat.bet) }
  everyoneMatched() { 
    const result = this.room.seats.every(s => s.folded || s.isAllIn || s.bet === this.currentBet)
    console.log('🔍 everyoneMatched check:', {
      street: this.street,
      currentBet: this.currentBet,
      seats: this.room.seats.map(s => ({
        id: s.id,
        name: s.name,
        folded: s.folded,
        isAllIn: s.isAllIn,
        bet: s.bet,
        stack: s.stack
      })),
      result
    })
    return result
  }

  // ---------- cycle ----------
  startHand() {
    if (this.room.seats.length < 2) return
    this.room.status = 'running'
    this.room.handNumber = (this.room.handNumber ?? 0) + 1
    this.clearAllTimers()

    this.community = []
    this.deck = this.shuffle(this.makeDeck())
    this.pot = 0
    this.street = 'preflop'
    this.minRaise = this.room.bigBlind
    this.currentBet = 0
    for (const s of this.room.seats) {
      s.folded = false
      s.isAllIn = false
      s.bet = 0
      s.hand = [this.deck.pop()!, this.deck.pop()!]
    }

    this.room.dealerPos = this.nextIndex(this.room.dealerPos)
    const sbIdx = this.nextIndex(this.room.dealerPos)
    const bbIdx = this.nextIndex(sbIdx)
    this.postBlind(sbIdx, this.room.smallBlind)
    this.postBlind(bbIdx, this.room.bigBlind)
    this.currentBet = this.room.bigBlind

    this.currentPos = this.nextIndex(bbIdx)
    this.toAct = this.seatAt(this.currentPos).id

    this.pushState()
    this.scheduleTurn()
  }

  postBlind(i: number, amount: number) {
    const s = this.seatAt(i)
    const pay = Math.min(amount, s.stack)
    s.stack -= pay; s.bet += pay; this.pot += pay
  }

  applyAction(playerId: string, action: ClientAction['action'], amount?: number) {
    if (!this.toAct || playerId !== this.toAct) return
    const seat = this.room.seats.find(s => s.id === playerId)
    if (!seat || seat.folded || seat.isAllIn) return

    if (this.turnTimer) clearTimeout(this.turnTimer), this.turnTimer = null
    const toCall = this.amountToCall(seat)

    switch (action) {
      case 'fold': seat.folded = true; break
      case 'check': if (toCall > 0) return; break
      case 'call': {
        const pay = Math.min(toCall, seat.stack)
        seat.stack -= pay; seat.bet += pay; this.pot += pay
        if (seat.stack === 0) seat.isAllIn = true
        break
      }
      case 'bet':
      case 'raise': {
        const minTotal = this.currentBet + this.minRaise
        const target = Math.max(minTotal, amount ?? 0)
        const put = Math.min(seat.stack, target - seat.bet)
        if (put <= 0) return
        seat.stack -= put; seat.bet += put; this.pot += put
        this.minRaise = Math.max(this.minRaise, seat.bet - this.currentBet, this.room.bigBlind)
        this.currentBet = Math.max(this.currentBet, seat.bet)
        break
      }
      case 'allin': {
        const put = seat.stack
        seat.stack = 0; seat.bet += put; this.pot += put; seat.isAllIn = true
        if (seat.bet > this.currentBet) {
          this.minRaise = Math.max(this.minRaise, seat.bet - this.currentBet, this.room.bigBlind)
          this.currentBet = seat.bet
        }
        break
      }
    }

    const vivos = this.notFolded()
    if (vivos.length === 1) { vivos[0].stack += this.pot; this.onPayout?.([vivos[0].id], this.pot, this.room.handNumber); this.endHand('ended'); return }

    this.advanceTurn()
    
    console.log('🔄 Checking if everyone matched...')
    if (this.everyoneMatched()) {
      console.log('✅ Everyone matched! Calling advanceStreet...')
      this.advanceStreet()
    } else {
      console.log('❌ Not everyone matched yet')
    }

    this.pushState()
    this.scheduleTurn()
  }

  advanceTurn() {
    let tries = 0
    do {
      this.currentPos = this.nextIndex(this.currentPos)
      tries++
      if (tries > this.room.seats.length + 2) break
    } while (this.seatAt(this.currentPos).folded || this.seatAt(this.currentPos).isAllIn)
    const s = this.seatAt(this.currentPos)
    this.toAct = (s.folded || s.isAllIn) ? null : s.id
  }

  advanceStreet() {
    console.log('🚀 advanceStreet called!', {
      from: this.street,
      currentBet: this.currentBet,
      pot: this.pot
    })
    
    for (const s of this.room.seats) s.bet = 0
    this.currentBet = 0
    this.minRaise = this.room.bigBlind

    if (this.street === 'preflop') {
      this.community.push(this.deck.pop()!, this.deck.pop()!, this.deck.pop()!)
      this.street = 'flop'; this.currentPos = this.nextIndex(this.room.dealerPos)
      console.log('🃏 Moved to FLOP, community:', this.community)
    } else if (this.street === 'flop') {
      this.community.push(this.deck.pop()!)
      this.street = 'turn'; this.currentPos = this.nextIndex(this.room.dealerPos)
      console.log('🃏 Moved to TURN, community:', this.community)
    } else if (this.street === 'turn') {
      this.community.push(this.deck.pop()!)
      this.street = 'river'; this.currentPos = this.nextIndex(this.room.dealerPos)
      console.log('🃏 Moved to RIVER, community:', this.community)
    } else if (this.street === 'river') {
      // Showdown: evaluate
      console.log('🏆 SHOWDOWN! Evaluating hands...')
      const contenders = this.notFolded()
      const ranked = contenders.map(s => ({ s, r: this.bestOfSeven([...this.community, ...s.hand]) }))
      ranked.sort((a,b)=> this.cmpRank(b.r, a.r))
      const best = ranked[0].r
      const winners = ranked.filter(x => this.cmpRank(x.r, best) === 0).map(x=>x.s)
      const amountEach = Math.floor(this.pot / winners.length)
      for (const w of winners) w.stack += amountEach
      this.onPayout?.(winners.map(w=>w.id), amountEach, this.room.handNumber)
      this.endHand('showdown'); return
    }

    let tries = 0
    while ((this.seatAt(this.currentPos).folded || this.seatAt(this.currentPos).isAllIn) && tries <= this.room.seats.length+2) {
      this.currentPos = this.nextIndex(this.currentPos); tries++
    }
    const s = this.seatAt(this.currentPos)
    this.toAct = (s.folded || s.isAllIn) ? null : s.id
  }

  endHand(finalStreet: Street) {
    if (this.turnTimer) clearTimeout(this.turnTimer), this.turnTimer = null
    this.street = finalStreet; this.toAct = null
    this.pushState()
    const t = setTimeout(()=> this.startHand(), 1200); this.timers.add(t)
  }

  private scheduleTurn() {
    if (!this.toAct) return
    if (this.turnTimer) clearTimeout(this.turnTimer), this.turnTimer = null

    const seat = this.room.seats.find(s => s.id === this.toAct)
    if (!seat) return

    if (seat.isBot) {
      const think = this.BOT_THINK_MIN + Math.random()*(this.BOT_THINK_MAX - this.BOT_THINK_MIN)
      this.turnTimer = setTimeout(()=>{
        const action = this.chooseBotAction(seat)
        this.applyAction(seat.id, action.type, action.amount)
      }, think)
    } else {
      const toCall = this.amountToCall(seat)
      this.turnTimer = setTimeout(()=>{
        const def = toCall > 0 ? 'fold' : 'check'
        this.applyAction(seat.id, def as any)
      }, this.TURN_MS)
    }
  }

  private chooseBotAction(seat: EngineSeat): { type: 'fold'|'check'|'call'|'bet'|'raise'|'allin', amount?: number } {
    const toCall = this.amountToCall(seat)
    const [r1, s1] = [seat.hand[0][0], seat.hand[0][1] as any]
    const [r2, s2] = [seat.hand[1][0], seat.hand[1][1] as any]
    const hi = Math.max(RANK_INDEX[r1], RANK_INDEX[r2])
    const lo = Math.min(RANK_INDEX[r1], RANK_INDEX[r2])
    const pair = r1 === r2
    const suited = s1 === s2

    let score = hi*2 + (pair ? 6 : 0) + (suited ? 1 : 0) + (Math.abs(hi-lo) <= 1 ? 1 : 0)
    if (this.street !== 'preflop') {
      const ranksOnBoard = this.community.map(c=>c[0])
      if (ranksOnBoard.includes(r1) || ranksOnBoard.includes(r2)) score += 2
    }

    const minRaise = Math.max(this.room.bigBlind, this.minRaise)
    const raiseTo = Math.max(this.currentBet + minRaise, this.room.bigBlind*2)
    if (seat.stack <= toCall) return { type: 'allin' }

    if (toCall === 0) {
      if (score >= 12 && Math.random() < 0.7) return { type: 'bet', amount: raiseTo }
      return { type: 'check' }
    } else {
      if (score <= 7 && Math.random() < 0.8) return { type: 'fold' }
      if (score >= 12 && Math.random() < 0.6) return { type: 'raise', amount: raiseTo }
      return { type: 'call' }
    }
  }

  // ---------- hand evaluator (7 to 5) ----------
  private bestOfSeven(cards: Card[]) {
    // choose best 5-card rank out of 7
    let best = this.rank5(cards.slice(0,5))
    const idx = [0,1,2,3,4,5,6]
    for (let a=0;a<7;a++) for (let b=a+1;b<7;b++) {
      const left = idx.filter(i=>i!==a && i!==b).map(i=>cards[i] as Card)
      const r = this.rank5(left)
      if (this.cmpRank(r, best) > 0) best = r
    }
    return best
  }

  private cmpRank(a: number[], b: number[]) {
    for (let i=0;i<Math.max(a.length,b.length);i++){
      const x = a[i] ?? 0, y = b[i] ?? 0
      if (x > y) return 1
      if (x < y) return -1
    }
    return 0
  }

  private rank5(cards: Card[]): number[] {
    // returns [cat, ...kickers] where higher is better
    // cats: 8 SF, 7 4K, 6 FH, 5 F, 4 S, 3 3K, 2 2P, 1 1P, 0 HC
    const ranks = cards.map(c=>c[0])
    const suits = cards.map(c=>c[1])
    const counts: Record<string, number> = {}
    for (const r of ranks) counts[r] = (counts[r]||0)+1
    const entries = Object.entries(counts).sort((a,b)=> (b[1]-a[1]) || (RANK_INDEX[b[0]]-RANK_INDEX[a[0]]))
    const isFlush = new Set(suits).size === 1
    const uniqRanks = [...new Set(ranks)].map(r=>RANK_INDEX[r]).sort((a,b)=>b-a)
    // Straight (A can be low)
    const straightHigh = this.straightHigh(uniqRanks)

    if (isFlush && straightHigh >= 0) return [8, straightHigh]
    if (entries[0][1] === 4) {
      const four = RANK_INDEX[entries[0][0]]; const kicker = uniqRanks.find(x=>x!==four) ?? 0
      return [7, four, kicker]
    }
    if (entries[0][1] === 3 && entries[1]?.[1] === 2) {
      const trips = RANK_INDEX[entries[0][0]]; const pair = RANK_INDEX[entries[1][0]]
      return [6, trips, pair]
    }
    if (isFlush) return [5, ...uniqRanks]
    if (straightHigh >= 0) return [4, straightHigh]
    if (entries[0][1] === 3) {
      const trips = RANK_INDEX[entries[0][0]]
      const kickers = uniqRanks.filter(x=>x!==trips)
      return [3, trips, ...kickers]
    }
    if (entries[0][1] === 2 && entries[1]?.[1] === 2) {
      const p1 = RANK_INDEX[entries[0][0]], p2 = RANK_INDEX[entries[1][0]]
      const hi = Math.max(p1,p2), lo = Math.min(p1,p2)
      const kicker = uniqRanks.find(x=>x!==hi && x!==lo) ?? 0
      return [2, hi, lo, kicker]
    }
    if (entries[0][1] === 2) {
      const pair = RANK_INDEX[entries[0][0]]
      const kickers = uniqRanks.filter(x=>x!==pair)
      return [1, pair, ...kickers]
    }
    return [0, ...uniqRanks]
  }

  private straightHigh(sortedDesc: number[]): number {
    // sortedDesc are unique rank indexes high->low
    // check A-5 straight as special (A counts as 12 -> as 3 low)
    const set = new Set(sortedDesc)
    // A-5 low: ranks A,5,4,3,2 -> high should be 3 (for 5-high)
    const A = RANK_INDEX['A']
    if (set.has(A) && set.has(3) && set.has(2) && set.has(1) && set.has(0)) return 3
    let count = 1
    for (let i=0;i<sortedDesc.length-1;i++){
      if (sortedDesc[i] - 1 === sortedDesc[i+1]) {
        count++
        if (count >= 5) return sortedDesc[i-3]
      } else count = 1
    }
    return -1
  }

  private pushState() {
    const state: TableState = {
      roomId: this.room.id,
      players: this.room.seats.map(s => ({
        id: s.id, name: s.name, stack: s.stack, seat: s.seat,
        hasActed: false, isAllIn: s.isAllIn, isBot: s.isBot,
        bet: s.bet, hand: s.hand, avatar: s.avatar,
      })),
      community: [...this.community],
      pot: this.pot, dealerPos: this.room.dealerPos, currentPos: this.currentPos,
      smallBlind: this.room.smallBlind, bigBlind: this.room.bigBlind,
      minRaise: this.minRaise, currentBet: this.currentBet,
      street: this.street, toAct: this.toAct, handNumber: this.room.handNumber,
      seats: this.room.seatsMax, started: true,
      createdAt: Date.now(), updatedAt: Date.now(),
    }
    this.emit(ServerEvents.TABLE_STATE, state)
  }

  private clearAllTimers() {
    for (const t of this.timers) clearTimeout(t)
    this.timers.clear()
    if (this.turnTimer) clearTimeout(this.turnTimer)
    this.turnTimer = null
  }
}
