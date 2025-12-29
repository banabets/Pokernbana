import * as ProtocolRaw from '../../shared/protocol.js'
const Protocol: any = (ProtocolRaw as any).default ?? ProtocolRaw

type Card = import('../../shared/protocol.js').Card
type Street = import('../../shared/protocol.js').Street
type TableState = import('../../shared/protocol.js').TableState
type ClientAction = import('../../shared/protocol.js').ClientAction

const { ServerEvents } = Protocol

const RANKS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'] as const
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
  hasActed: boolean
  avatar?: string
  subscription?: 'free' | 'bronze' | 'silver' | 'gold' | 'diamond'
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
  community?: Card[]
  pot?: number
  currentPos?: number
  minRaise?: number
  currentBet?: number
  street?: Street
  toAct?: string | null
  started?: boolean
  createdAt?: number
}

export type PayoutHook = (winnerIds: string[], amountEach: number, handNumber: number) => void

export class ImprovedEngine {
  room: RoomData
  community: Card[] = []
  deck: Card[] = []
  pot = 0
  street: Street = 'ended'
  minRaise = 0
  currentBet = 0
  toAct: string | null = null
  currentPos = 0
  lastRaisePos = -1 // Track who made the last raise

  private timers = new Set<ReturnType<typeof setTimeout>>()
  private turnTimer: ReturnType<typeof setTimeout> | null = null
  private readonly TURN_MS = 25000
  private readonly BOT_THINK_MIN = 1000
  private readonly BOT_THINK_MAX = 3000

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
  
  notFolded() { 
    return this.room.seats.filter(s => !s.folded && Array.isArray(s.hand) && s.hand.length === 2) 
  }
  
  amountToCall(seat: EngineSeat) { 
    return Math.max(0, this.currentBet - seat.bet) 
  }
  
  everyoneMatched() { 
    const activePlayers = this.room.seats.filter(s => !s.folded && !s.isAllIn)
    if (activePlayers.length <= 1) return true
    
    const result = activePlayers.every(s => s.bet === this.currentBet)
    console.log('🔍 everyoneMatched check:', {
      street: this.street,
      currentBet: this.currentBet,
      activePlayers: activePlayers.map(s => ({
        id: s.id,
        name: s.name,
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
    this.lastRaisePos = -1
    
    for (const s of this.room.seats) {
      s.folded = false
      s.isAllIn = false
      s.bet = 0
      s.hasActed = false
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

    console.log('🎮 Starting new hand:', {
      handNumber: this.room.handNumber,
      dealer: this.room.dealerPos,
      smallBlind: sbIdx,
      bigBlind: bbIdx,
      firstToAct: this.toAct
    })

    console.log('📡 Pushing state after advanceStreet/advanceTurn')
    this.pushState()

    // Only schedule turn if we have an active player to act
    if (this.toAct) {
      console.log('🎯 Scheduling turn for player:', this.toAct)
      this.scheduleTurn()
    } else {
      console.log('⏸️ No player to act, skipping turn scheduling')
    }
  }

  postBlind(i: number, amount: number) {
    const s = this.seatAt(i)
    const pay = Math.min(amount, s.stack)
    s.stack -= pay; s.bet += pay; this.pot += pay
    console.log(`💰 Posted blind: ${s.name} pays ${pay}`)
  }

  applyAction(playerId: string, action: ClientAction['action'], amount?: number) {
    if (!this.toAct || playerId !== this.toAct) return
    const seat = this.room.seats.find(s => s.id === playerId)
    if (!seat || seat.folded || seat.isAllIn) return

    if (this.turnTimer) clearTimeout(this.turnTimer), this.turnTimer = null
    const toCall = this.amountToCall(seat)

    console.log(`🎯 Player action: ${seat.name} ${action}${amount ? ` $${amount}` : ''}`)

    switch (action) {
      case 'fold': 
        seat.folded = true; 
        break
      case 'check': 
        if (toCall > 0) return; 
        break
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
        this.lastRaisePos = this.currentPos

        // CRÍTICO: Mark player as all-in if they have no stack left
        if (seat.stack === 0) {
          seat.isAllIn = true
          console.log(`💰 ${seat.name} went all-in with bet/raise (remaining stack: ${seat.stack})`)
        }
        break
      }
      case 'allin': {
        const put = seat.stack
        seat.stack = 0; seat.bet += put; this.pot += put; seat.isAllIn = true
        if (seat.bet > this.currentBet) {
          this.minRaise = Math.max(this.minRaise, seat.bet - this.currentBet, this.room.bigBlind)
          this.currentBet = seat.bet
          this.lastRaisePos = this.currentPos
        }
        break
      }
    }

    seat.hasActed = true

    // Check for immediate win (all but one folded)
    const vivos = this.notFolded()
    if (vivos.length === 1) { 
      console.log(`🏆 Last player standing: ${vivos[0].name} wins $${this.pot}`)
      vivos[0].stack += this.pot; 
      this.onPayout?.([vivos[0].id], this.pot, this.room.handNumber); 
      this.endHand('ended'); 
      return 
    }

    this.advanceTurn()

    // CRÍTICO: Check if this was the last active player's action and others are all-in
    const activePlayersAfterAction = this.room.seats.filter(s => !s.folded && !s.isAllIn)
    const allInPlayersAfterAction = this.room.seats.filter(s => s.isAllIn)
    const nonFoldedAfterAction = this.room.seats.filter(s => !s.folded)

    // If only one active player remains and others are all-in, go to showdown
    if (activePlayersAfterAction.length === 1 && allInPlayersAfterAction.length >= 1 && nonFoldedAfterAction.length > 1) {
      console.log('🏆 LAST PLAYER ACTION WITH ALL-IN OPPONENTS: Going directly to showdown')
      console.log('🏆 Active player:', activePlayersAfterAction[0].name, 'All-in opponents:', allInPlayersAfterAction.length)
      console.log('🏆 All non-folded players:', nonFoldedAfterAction.map(p => ({name: p.name, allIn: p.isAllIn, stack: p.stack})))

      // Double check that the last active player is actually all-in now
      const lastPlayer = activePlayersAfterAction[0]
      if (lastPlayer.stack === 0 && !lastPlayer.isAllIn) {
        lastPlayer.isAllIn = true
        console.log(`🏆 Correcting: ${lastPlayer.name} marked as all-in (stack was 0)`)
      }

      this.performShowdown()
      return
    }

    // Check if betting round is complete
    const everyoneMatched = this.everyoneMatched()
    const allActiveHaveActed = this.allActivePlayersHaveActed()
    const allPlayersAllIn = this.room.seats.filter(s => !s.folded).every(s => s.isAllIn)
    const activePlayers = this.room.seats.filter(s => !s.folded && !s.isAllIn)
    const allInPlayers = this.room.seats.filter(s => s.isAllIn)
    const foldedPlayers = this.room.seats.filter(s => s.folded)

    console.log('🔍 Detailed betting round status:', {
      everyoneMatched,
      allActiveHaveActed,
      allPlayersAllIn,
      activePlayersCount: activePlayers.length,
      allInPlayersCount: allInPlayers.length,
      foldedPlayersCount: foldedPlayers.length,
      toAct: this.toAct,
      street: this.street,
      currentBet: this.currentBet
    })

    // Debug: Show status of each player
    console.log('👥 Player statuses:')
    this.room.seats.forEach((s, i) => {
      console.log(`  Player ${i}: ${s.name} - folded: ${s.folded}, allIn: ${s.isAllIn}, acted: ${s.hasActed}, stack: ${s.stack}, bet: ${s.bet}`)
    })

    // Priority: Check if all active (non-folded) players are all-in first
    const activeNonFoldedPlayers = this.room.seats.filter(s => !s.folded)
    const allActivePlayersAllIn = activeNonFoldedPlayers.length > 1 && activeNonFoldedPlayers.every(s => s.isAllIn)

    // CRÍTICO: Check if only one active player remains (not all-in) while others are all-in
    const lastActivePlayerRemaining = activePlayers.length === 1 && allInPlayers.length >= 1 && activeNonFoldedPlayers.length > 1

    if (allActivePlayersAllIn) {
      console.log('🎯 ALL ACTIVE PLAYERS ALL-IN: Advancing to next street immediately')
      console.log('🎯 Active non-folded players:', activeNonFoldedPlayers.map(p => ({name: p.name, allIn: p.isAllIn, stack: p.stack})))
      console.log('🎯 Current street:', this.street, '-> Next street will be:', this.street === 'flop' ? 'turn' : this.street === 'turn' ? 'river' : 'showdown')

      // Special handling for turn -> river transition
      if (this.street === 'turn') {
        console.log('🎯 TURNING TO RIVER: All players all-in, revealing river card')
      }

      try {
        this.advanceStreet()
        console.log('✅ advanceStreet() completed successfully')
      } catch (error) {
        console.error('❌ Error in advanceStreet():', error)
      }
      return
    }

    // Handle case where only one active player remains (not all-in) while others are all-in
    if (lastActivePlayerRemaining) {
      console.log('🎯 LAST ACTIVE PLAYER REMAINING: Will go to showdown after this action')
      console.log('🎯 Last active player:', activePlayers[0].name, 'All-in players:', allInPlayers.length)

      // After this player acts, we'll go to showdown, so we don't advance street yet
      // The showdown will be triggered after the player's action in the next applyAction call
    }

    // Check if all non-folded players are now all-in (including the last player who just acted)
    const allNonFoldedAllIn = nonFoldedAfterAction.length > 1 && nonFoldedAfterAction.every(s => s.isAllIn)

    if (allNonFoldedAllIn) {
      console.log('🎯 ALL NON-FOLDED PLAYERS NOW ALL-IN: Going to showdown')
      console.log('🎯 All players status:', nonFoldedAfterAction.map(p => ({name: p.name, allIn: p.isAllIn, stack: p.stack})))
      this.performShowdown()
      return
    }

    // Then check normal betting round completion
    if (everyoneMatched && allActiveHaveActed) {
      console.log('✅ Betting round complete! Moving to next street...')
      try {
        this.advanceStreet()
        console.log('✅ advanceStreet() completed successfully')
      } catch (error) {
        console.error('❌ Error in advanceStreet():', error)
      }
    } else {
      console.log('❌ Betting round not complete yet - scheduling next turn')
      console.log('🔍 Round completion details:', {
        everyoneMatched,
        allActiveHaveActed,
        activePlayersCount: activePlayers.length,
        allInPlayersCount: allInPlayers.length,
        nonFoldedCount: nonFoldedAfterAction.length,
        street: this.street,
        currentBet: this.currentBet
      })

      // Only schedule turn if we actually have a player to act
      if (this.toAct) {
        console.log('🎯 Scheduling turn for player:', this.toAct)
        console.log('🚀 CALLING scheduleTurn() NOW')
        this.scheduleTurn()
        console.log('✅ scheduleTurn() called successfully')
      } else {
        console.log('⏸️ No player to act, checking if round should advance...')

        // Emergency check: if we're in post-flop and all active players have acted
        if (this.street !== 'preflop' && activePlayers.length > 0) {
          const allActiveActed = activePlayers.every(p => p.hasActed)
          console.log('🔍 Emergency check - all active acted:', allActiveActed)

          if (allActiveActed) {
            console.log('🚨 EMERGENCY: All active players have acted in post-flop round, forcing advance')
            this.advanceStreet()
          } else {
            console.log('⏸️ Round not complete yet, but no one to act - this might be a logic error')
          }
        } else if (activePlayers.length === 0) {
          // CRITICAL: All active players are all-in
          const nonFoldedPlayers = this.room.seats.filter(seat => !seat.folded)
          const allAllIn = nonFoldedPlayers.length > 1 && nonFoldedPlayers.every(seat => seat.isAllIn)

          console.log('🔍 TURN/RIVER ALL-IN CHECK:', {
            activePlayersCount: activePlayers.length,
            nonFoldedPlayers: nonFoldedPlayers.length,
            allAllIn,
            street: this.street,
            nonFoldedDetails: nonFoldedPlayers.map(p => ({name: p.name, allIn: p.isAllIn, stack: p.stack}))
          })

          if (allAllIn) {
            console.log('🚨 TURN/RIVER ALL PLAYERS ALL-IN: Advancing to next street immediately')
            this.advanceStreet()
          } else {
            console.log('⏸️ TURN/RIVER: Some players folded but not all remaining are all-in')
          }
        } else {
          console.log('⏸️ TURN/RIVER: Still have active players or in preflop')
        }
      }
    }

    this.pushState()
  }

  allActivePlayersHaveActed(): boolean {
    const activePlayers = this.room.seats.filter(s => !s.folded && !s.isAllIn)
    const nonFoldedPlayers = this.room.seats.filter(s => !s.folded)

    // If there are no active players (all all-in), then the round is complete
    if (activePlayers.length === 0 && nonFoldedPlayers.length > 1) {
      return true
    }

    // Normal case: verify that all active players have acted
    return activePlayers.every(s => s.hasActed)
  }

  advanceTurn() {
    let tries = 0
    console.log('🔄 advanceTurn: Starting from position', this.currentPos, 'street:', this.street)

    do {
      this.currentPos = this.nextIndex(this.currentPos)
      tries++
      if (tries > this.room.seats.length + 2) {
        console.log('🔄 advanceTurn: Max tries reached, breaking')
        break
      }

      const currentSeat = this.seatAt(this.currentPos)
      console.log(`🔄 advanceTurn: Checking seat ${this.currentPos} (${currentSeat.name}): folded=${currentSeat.folded}, allIn=${currentSeat.isAllIn}, hasActed=${currentSeat.hasActed}`)
    } while (this.seatAt(this.currentPos).folded || this.seatAt(this.currentPos).isAllIn)

    const s = this.seatAt(this.currentPos)
    this.toAct = (s.folded || s.isAllIn) ? null : s.id

    console.log(`🔄 advanceTurn: Final result - toAct: ${this.toAct}, currentPos: ${this.currentPos}`)

    // Check for last active player scenario
    const activePlayers = this.room.seats.filter(seat => !seat.folded && !seat.isAllIn)
    const allInPlayers = this.room.seats.filter(seat => s.isAllIn)
    const nonFoldedPlayers = this.room.seats.filter(seat => !seat.folded)

    // If only one active player remains and others are all-in, set flag for showdown
    if (activePlayers.length === 1 && allInPlayers.length >= 1 && nonFoldedPlayers.length > 1 && this.toAct) {
      console.log('🔄 LAST ACTIVE PLAYER DETECTED in advanceTurn:', activePlayers[0].name)
      console.log('🔄 This player\'s next action will trigger showdown')
      // Don't set toAct to null, let the player act and then go to showdown
    }

    // Emergency check: if no one can act, force advance street
    if (activePlayers.length === 0) {
      console.log('🚨 EMERGENCY: No active players found, forcing street advance')
      this.advanceStreet()
    }
  }

  advanceStreet() {
    try {
      console.log('🚀 advanceStreet called!', {
        from: this.street,
        currentBet: this.currentBet,
        pot: this.pot,
        activePlayers: this.room.seats.filter(s => !s.folded).length,
        allInPlayers: this.room.seats.filter(s => s.isAllIn).length
      })

      // Check if we need to go to showdown (all players all-in on river)
      if (this.street === 'river') {
        console.log('🏆 Reached river, going to showdown')
        this.performShowdown()
        return
      }
    
    // Reset betting state
    for (const s of this.room.seats) {
      s.bet = 0
      // Players who are all-in have already acted fully, so they keep hasActed = true
      // Only reset hasActed for players who can still act (not folded and not all-in)
      if (!s.folded && !s.isAllIn) {
        s.hasActed = false
      }
      // Note: folded players and all-in players keep their hasActed status
    }
    this.currentBet = 0
    this.minRaise = this.room.bigBlind
    this.lastRaisePos = -1

    if (this.street === 'preflop') {
      this.community.push(this.deck.pop()!, this.deck.pop()!, this.deck.pop()!)
      this.street = 'flop';
      this.currentPos = this.nextIndex(this.room.dealerPos)
      console.log('🃏 Moved to FLOP, community:', this.community)
      console.log('🎯 After moving to flop - currentPos:', this.currentPos, 'toAct will be set next')
    } else if (this.street === 'flop') {
      this.community.push(this.deck.pop()!)
      this.street = 'turn'; 
      this.currentPos = this.nextIndex(this.room.dealerPos)
      console.log('🃏 Moved to TURN, community:', this.community)
    } else if (this.street === 'turn') {
      this.community.push(this.deck.pop()!)
      this.street = 'river';
      this.currentPos = this.nextIndex(this.room.dealerPos)
      console.log('🃏 Moved to RIVER, community:', this.community)

      // Check if all active players are all-in immediately after moving to river
      const activeAfterRiver = this.room.seats.filter(seat => !seat.folded && !seat.isAllIn)
      const nonFoldedAfterRiver = this.room.seats.filter(seat => !seat.folded)
      const allAllInAfterRiver = nonFoldedAfterRiver.length > 1 && nonFoldedAfterRiver.every(seat => seat.isAllIn)

      console.log('🔍 RIVER CHECK: Active players after river:', activeAfterRiver.length, 'All all-in:', allAllInAfterRiver)

      if (allAllInAfterRiver) {
        console.log('🏆 ALL PLAYERS ALL-IN ON RIVER: Going directly to showdown')
        this.performShowdown()
        return
      }
    }

          // Find first active player to actE ese en
    let tries = 0
    const activePlayers = this.room.seats.filter(seat => !seat.folded && !seat.isAllIn)
    const allInPlayers = this.room.seats.filter(seat => seat.isAllIn)
    const foldedPlayers = this.room.seats.filter(seat => seat.folded)

    console.log('🎯 Finding next player to act after street advance:', {
      activePlayers: activePlayers.length,
      allInPlayers: allInPlayers.length,
      foldedPlayers: foldedPlayers.length,
      totalPlayers: this.room.seats.length,
      street: this.street
    })

    // Note: All-in detection is handled in applyAction() to avoid duplication

    // Find next active player
    while ((this.seatAt(this.currentPos).folded || this.seatAt(this.currentPos).isAllIn) && tries <= this.room.seats.length+2) {
      this.currentPos = this.nextIndex(this.currentPos); tries++
    }
    const s = this.seatAt(this.currentPos)
    this.toAct = (s.folded || s.isAllIn) ? null : s.id

      console.log('🎯 Next player to act:', this.toAct, 'seat:', s.name, 'folded:', s.folded, 'allIn:', s.isAllIn)
      console.log('🎯 About to call scheduleTurn() if toAct is not null')

      // Final check: if no one can act after street advance, this is expected when all are all-in
      if (this.toAct === null) {
        const nonFoldedPlayers = this.room.seats.filter(seat => !seat.folded)
        const allAllIn = nonFoldedPlayers.every(seat => seat.isAllIn)
        if (allAllIn) {
          console.log('✅ All remaining players are all-in, advancing to next street immediately')
          // Programar avance automático al siguiente street después de un pequeño delay
          setTimeout(() => {
            console.log('🚀 AUTO-ADVANCE: All players all-in, advancing street')
            this.advanceStreet()
          }, 2000) // 2 seconds for players to see the state
        } else {
          console.log('⚠️ No player to act but not all players are all-in - this might be an issue')
        }
      }

      console.log('✅ advanceStreet completed successfully')

      // CRITICAL: After changing street, verify if there's a player to act
      if (this.toAct) {
        console.log('🚀 POST-STREET-ADVANCE: Scheduling turn for player:', this.toAct)
        console.log('🚀 POST-STREET-ADVANCE: Current state - street:', this.street, 'toAct:', this.toAct)
        this.scheduleTurn()
        console.log('✅ POST-STREET-ADVANCE: scheduleTurn() called after street advance')
      } else {
        console.log('⏸️ POST-STREET-ADVANCE: No player to act after street advance')
        // Verify if all players are all-in and we need to advance automatically
        const activePlayersAfterAdvance = this.room.seats.filter(seat => !seat.folded && !seat.isAllIn)
        if (activePlayersAfterAdvance.length === 0 && this.room.seats.filter(seat => !seat.folded).length > 1) {
          console.log('🚨 POST-STREET-ADVANCE: All players all-in, should advance to next street immediately')
          // Here we could add logic to advance automatically if all players are all-in
        }
      }
    } catch (error) {
      console.error('❌ Error in advanceStreet():', error)
      // Try to recover by pushing state anyway
      try {
        this.pushState()
      } catch (pushError) {
        console.error('❌ Error pushing state after advanceStreet error:', pushError)
      }
    }
  }

  performShowdown() {
    const contenders = this.notFolded()
    console.log(`🏆 Showdown with ${contenders.length} players`)
    
    if (contenders.length === 1) {
      // Only one player left, they win
      const winner = contenders[0]
      winner.stack += this.pot
      console.log(`🏆 Single winner: ${winner.name} wins $${this.pot}`)
      this.onPayout?.([winner.id], this.pot, this.room.handNumber)
      this.endHand('showdown')
      return
    }

    // Evaluate all hands
    const ranked = contenders.map(s => {
      // Validate player's hand
      const validHand = s.hand.filter(card => card && typeof card === 'string' && card.length >= 2)
      const validCommunity = this.community.filter(card => card && typeof card === 'string' && card.length >= 2)

      console.log(`🏆 Evaluating hand for ${s.name}:`, {
        originalHand: s.hand,
        validHand: validHand.length,
        validCommunity: validCommunity.length,
        totalCards: validHand.length + validCommunity.length
      })

      const allCards = [...validCommunity, ...validHand]

      return {
        s,
        r: this.bestOfSeven(allCards),
        handName: this.getHandName(allCards)
      }
    })
    
    ranked.sort((a,b)=> this.cmpRank(b.r, a.r))
    const best = ranked[0].r
    const winners = ranked.filter(x => this.cmpRank(x.r, best) === 0).map(x=>x.s)
    const amountEach = Math.floor(this.pot / winners.length)
    
    console.log('🏆 Hand evaluation results:')
    ranked.forEach((r, i) => {
      console.log(`${i+1}. ${r.s.name}: ${r.handName} (${r.r.join(',')})`)
    })
    
    console.log(`🏆 Winners: ${winners.map(w => w.name).join(', ')} each get $${amountEach}`)
    
    for (const w of winners) w.stack += amountEach
    this.onPayout?.(winners.map(w=>w.id), amountEach, this.room.handNumber)
    this.endHand('showdown')
  }

  endHand(finalStreet: Street) {
    if (this.turnTimer) clearTimeout(this.turnTimer), this.turnTimer = null
    this.street = finalStreet; this.toAct = null
    console.log('📡 Pushing final state before ending hand...')
    this.pushState()
    console.log('🎮 Hand ended, starting new hand in 3 seconds...')
    const t = setTimeout(()=> this.startHand(), 3000); this.timers.add(t)
  }

  private scheduleTurn() {
    console.log('🎯 === SCHEDULETURN STARTED ===')
    console.log('🎯 scheduleTurn called with toAct:', this.toAct)
    console.log('🎯 Current game state - street:', this.street, 'pot:', this.pot, 'currentBet:', this.currentBet)

    // Additional check: verify if there are any active players
    const activePlayers = this.room.seats.filter(seat => !seat.folded && !seat.isAllIn)
    console.log('🎯 Active players count:', activePlayers.length)

    if (!this.toAct) {
      console.log('⏸️ No player to act, skipping turn scheduling')
      // If no one can act but we still have active players, there might be a logic error
      if (activePlayers.length > 0) {
        console.log('🚨 WARNING: toAct is null but there are active players:', activePlayers.map(p => p.name))
        // Force advance turn to find the correct player
        this.advanceTurn()
        // Try again after advancing turn
        if (this.toAct) {
          console.log('✅ Found active player after re-advancing:', this.toAct)
          this.scheduleTurn()
        }
      }
      return
    }
    if (this.turnTimer) clearTimeout(this.turnTimer), this.turnTimer = null

    const seat = this.room.seats.find(s => s.id === this.toAct)
    if (!seat) return

    if (seat.isBot) {
      const think = this.BOT_THINK_MIN + Math.random()*(this.BOT_THINK_MAX - this.BOT_THINK_MIN)
      this.turnTimer = setTimeout(()=>{
        const action = this.chooseBotAction(seat)
        console.log(`🤖 Bot ${seat.name} decides: ${action.type}${action.amount ? ` $${action.amount}` : ''}`)
        this.applyAction(seat.id, action.type, action.amount)
      }, think)
    } else {
      const toCall = this.amountToCall(seat)
      this.turnTimer = setTimeout(()=>{
        const def = toCall > 0 ? 'fold' : 'check'
        console.log(`⏰ Timeout for ${seat.name}, defaulting to ${def}`)
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

    // Calculate hand strength
    let score = hi*2 + (pair ? 6 : 0) + (suited ? 1 : 0) + (Math.abs(hi-lo) <= 1 ? 1 : 0)
    
    // Adjust for board cards
    if (this.street !== 'preflop') {
      const ranksOnBoard = this.community.map(c=>c[0])
      if (ranksOnBoard.includes(r1) || ranksOnBoard.includes(r2)) score += 2
      
      // Check for potential draws
      const allCards = [...this.community, ...seat.hand]
      const flushDraw = this.hasFlushDraw(allCards)
      const straightDraw = this.hasStraightDraw(allCards)
      if (flushDraw) score += 3
      if (straightDraw) score += 2
    }

    // Position and pot odds consideration
    const potOdds = toCall / (this.pot + toCall)
    const position = this.getPosition(seat)
    const positionBonus = position === 'late' ? 2 : position === 'middle' ? 1 : 0
    score += positionBonus

    // More conservative betting strategy
    const minRaise = Math.max(this.room.bigBlind, this.minRaise)
    const raiseTo = Math.max(this.currentBet + minRaise, this.room.bigBlind*2)
    
    // Don't bet more than 1/3 of stack unless very strong
    const maxBet = Math.min(seat.stack, Math.floor(seat.stack / 3))
    const aggressiveBet = Math.min(raiseTo, maxBet)

    if (toCall === 0) {
      // Can check
      if (score >= 15 && Math.random() < 0.6) {
        return { type: 'bet', amount: Math.min(raiseTo, maxBet) }
      }
      return { type: 'check' }
    } else {
      // Must call or raise
      if (score <= 8 && potOdds > 0.3) {
        return { type: 'fold' }
      }
      if (score >= 18 && Math.random() < 0.7) {
        return { type: 'raise', amount: aggressiveBet }
      }
      if (score >= 12 && potOdds < 0.4) {
        return { type: 'call' }
      }
      return { type: 'fold' }
    }
  }

  private getPosition(seat: EngineSeat): 'early' | 'middle' | 'late' {
    const dealerPos = this.room.dealerPos
    const seatPos = seat.seat
    const totalSeats = this.room.seats.length
    
    const relativePos = (seatPos - dealerPos + totalSeats) % totalSeats
    const positionRatio = relativePos / totalSeats
    
    if (positionRatio < 0.33) return 'early'
    if (positionRatio < 0.66) return 'middle'
    return 'late'
  }

  private hasFlushDraw(cards: Card[]): boolean {
    const suits = cards.map(c => c[1])
    const suitCounts: Record<string, number> = {}
    for (const suit of suits) {
      suitCounts[suit] = (suitCounts[suit] || 0) + 1
    }
    return Object.values(suitCounts).some(count => count >= 4)
  }

  private hasStraightDraw(cards: Card[]): boolean {
    const ranks = cards.map(c => RANK_INDEX[c[0]]).sort((a, b) => a - b)
    const uniqueRanks = [...new Set(ranks)]
    
    for (let i = 0; i < uniqueRanks.length - 2; i++) {
      if (uniqueRanks[i+2] - uniqueRanks[i] <= 2) return true
    }
    return false
  }

  // ---------- hand evaluator (7 to 5) ----------
  private bestOfSeven(cards: Card[]) {
    // Filter out undefined/null cards and ensure we have at least 5 valid cards
    const validCards = cards.filter(c => c && typeof c === 'string' && c.length >= 2)
    if (validCards.length < 5) {
      console.error('❌ Not enough valid cards for hand evaluation:', { total: cards.length, valid: validCards.length, cards })
      // Return a default high card hand if we don't have enough cards
      return [0, 12, 11, 10, 9] // A, K, Q, J, 10 high
    }

    // choose best 5-card rank out of valid cards
    let best = this.rank5(validCards.slice(0,5))
    const idx = Array.from({length: Math.min(validCards.length, 7)}, (_, i) => i)

    // Only try combinations if we have at least 7 cards
    if (validCards.length >= 7) {
      for (let a=0;a<validCards.length;a++) for (let b=a+1;b<validCards.length;b++) {
        const left = idx.filter(i=>i!==a && i!==b).slice(0,5).map(i=>validCards[i] as Card)
        if (left.length === 5) {
          const r = this.rank5(left)
          if (this.cmpRank(r, best) > 0) best = r
        }
      }
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

  private getHandName(cards: Card[]): string {
    try {
      const rank = this.bestOfSeven(cards)
      const handNames = [
        'High Card', 'Pair', 'Two Pair', 'Three of a Kind',
        'Straight', 'Flush', 'Full House', 'Four of a Kind', 'Straight Flush'
      ]
      return handNames[rank[0]] || 'Unknown'
    } catch (error) {
      console.error('❌ Error in getHandName:', error, 'cards:', cards)
      return 'Unknown'
    }
  }

  private rank5(cards: Card[]): number[] {
    // returns [cat, ...kickers] where higher is better
    // cats: 8 SF, 7 4K, 6 FH, 5 F, 4 S, 3 3K, 2 2P, 1 1P, 0 HC

    // Ensure we have exactly 5 cards and they are valid
    if (!cards || cards.length !== 5) {
      console.error('❌ rank5 called with invalid card count:', cards?.length ?? 'undefined')
      return [0, 12, 11, 10, 9] // Default high card
    }

    // Validate each card
    const validCards = cards.filter(c => c && typeof c === 'string' && c.length >= 2)
    if (validCards.length !== 5) {
      console.error('❌ rank5 called with invalid cards:', cards, 'valid:', validCards.length)
      return [0, 12, 11, 10, 9] // Default high card
    }

    const ranks = validCards.map(c=>c[0])
    const suits = validCards.map(c=>c[1])
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

  public pushState() {
    const state: TableState = {
      roomId: this.room.id,
      players: this.room.seats.map(s => ({
        id: s.id, name: s.name, stack: s.stack, seat: s.seat,
        hasActed: s.hasActed, isAllIn: s.isAllIn, isBot: s.isBot,
        bet: s.bet, hand: s.hand, avatar: s.avatar, subscription: s.subscription,
      })),
      community: [...this.community],
      pot: this.pot, dealerPos: this.room.dealerPos, currentPos: this.currentPos,
      smallBlind: this.room.smallBlind, bigBlind: this.room.bigBlind,
      minRaise: this.minRaise, currentBet: this.currentBet,
      street: this.street, toAct: this.toAct, handNumber: this.room.handNumber,
      seats: this.room.seatsMax, started: true,
      createdAt: Date.now(), updatedAt: Date.now(),
    }

    console.log('🚀 SERVER: Sending TABLE_STATE to room:', this.room.id)
    console.log('📊 SERVER: State details:', {
      street: state.street,
      pot: state.pot,
      toAct: state.toAct,
      players: state.players?.length,
      activePlayers: state.players?.filter(p => !p.isAllIn || !p.hasActed).length,
      allInPlayers: state.players?.filter(p => p.isAllIn).length
    })

    this.emit(ServerEvents.TABLE_STATE, state)
    console.log('✅ SERVER: TABLE_STATE sent successfully')
  }

  private clearAllTimers() {
    console.log('🧹 Clearing all timers...')
    for (const t of this.timers) {
      try {
        clearTimeout(t)
      } catch (e) {
        console.error('Error clearing timer:', e)
      }
    }
    this.timers.clear()
    if (this.turnTimer) {
      try {
        clearTimeout(this.turnTimer)
      } catch (e) {
        console.error('Error clearing turn timer:', e)
      }
      this.turnTimer = null
    }
    console.log('✅ All timers cleared')
  }
}
