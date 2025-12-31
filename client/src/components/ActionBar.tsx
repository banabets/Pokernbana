import * as Protocol from 'shared/protocol'
const { ClientEvents } = Protocol
type TableState = import('shared/protocol').TableState
import type { Socket } from 'socket.io-client'
import React from 'react'
import styled from 'styled-components'
import { useSound, triggerHapticFeedback } from '../hooks/useSound'

const ActionBarContainer = styled.div`
  position: fixed;
  bottom: var(--spacing-lg);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: rgba(0, 0, 0, 0.9);
  border-radius: var(--border-radius);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
  min-width: clamp(300px, 80vw, 600px);
  max-width: 95vw;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  backdrop-filter: blur(20px);
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);

  @media (max-width: 768px) {
    bottom: 8px; /* Más arriba para no tapar tanto */
    left: 6px;
    right: 6px;
    transform: none;
    padding: 4px 6px; /* Padding aún más pequeño */
    gap: 2px; /* Gap mínimo */
    min-width: auto;
    max-width: none;
    width: calc(100vw - 12px); /* Más ancho para ocupar menos altura */
    flex-direction: row;
    flex-wrap: wrap; /* Permitir wrap */
    justify-content: space-around;
    align-items: center;
    border-radius: 8px; /* Bordes más pequeños */
    background: rgba(0, 0, 0, 0.3); /* Fondo más sutil */
    backdrop-filter: blur(6px); /* Blur más sutil */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); /* Sombra más sutil */
    border: 1px solid rgba(255, 255, 255, 0.08); /* Borde más sutil */
  }

  @media (max-width: 480px) {
    bottom: 6px;
    left: 4px;
    right: 4px;
    transform: none;
    padding: 6px 8px;
    gap: 4px;
    min-width: auto;
    max-width: none;
    width: calc(100vw - 8px);
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  @media (max-width: 380px) {
    bottom: 4px;
    left: 2px;
    right: 2px;
    padding: 4px 6px;
    gap: 3px;
    width: calc(100vw - 4px);
  }
`

const ActionButton = styled.button<{ $variant?: 'primary' | 'success' | 'warning' | 'danger' | 'outline' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--text-sm);
  font-weight: 600;
  line-height: 1.25rem;
  border-radius: calc(var(--border-radius) * 0.8);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
  position: relative;
  overflow: hidden;
  min-width: var(--button-min-width);
  flex: 1;

  @media (max-width: 768px) {
    padding: 3px 6px; /* Padding más pequeño */
    font-size: 11px; /* Fuente más pequeña */
    min-width: 42px; /* Ancho más pequeño */
    flex: 1 1 auto; /* Flex para distribución */
    min-height: 28px; /* Altura más pequeña pero touch-friendly */
    line-height: 0.9rem;
    border-radius: 6px; /* Bordes más pequeños */
    /* Sin fondo individual - usa el contenedor */
    backdrop-filter: none; /* Sin blur individual */
    border: none; /* Sin borde individual */
    box-shadow: none; /* Sin sombra individual */
  }

  @media (max-width: 480px) {
    min-width: 50px;
    flex: 1 1 auto;
    padding: 8px 10px;
    font-size: 11px;
    min-height: 36px;
    line-height: 1rem;
    border-radius: 8px;
    font-weight: 700;
  }

  @media (max-width: 380px) {
    min-width: 42px;
    padding: 6px 8px;
    font-size: 10px;
    min-height: 32px;
    border-radius: 6px;
  }

  &:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  ${({ $variant }) => {
    switch ($variant) {
      case 'success':
        return `
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
          &:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
          }
        `
      case 'warning':
        return `
          background: linear-gradient(135deg, #fa7093 0%, #fee140 100%);
          color: white;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
          &:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
          }
        `
      case 'danger':
        return `
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
          color: white;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
          &:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
          }
        `
      case 'outline':
        return `
          background: transparent;
          border: 2px solid #d1d5db;
          color: #374151;
          &:hover:not(:disabled) {
            background: #f9fafb;
            border-color: #9ca3af;
          }
        `
      default:
        return `
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
          &:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
          }
        `
    }
  }}
`

const BetInput = styled.input`
  padding: var(--spacing-sm) var(--spacing-md);
  border: 2px solid #4b5563;
  border-radius: calc(var(--border-radius) * 0.8);
  background: #1f2937;
  color: white;
  font-size: var(--text-sm);
  font-weight: 500;
  transition: all 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
  min-width: clamp(100px, 20vw, 120px);
  text-align: center;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    min-width: 80px;
    max-width: 100px;
    font-size: 13px;
    padding: 6px 8px;
  }

  @media (max-width: 480px) {
    min-width: 60px;
    max-width: 80px;
    font-size: 13px;
    padding: 6px 8px;
    border-radius: 8px;
  }

  @media (max-width: 380px) {
    min-width: 50px;
    max-width: 70px;
    font-size: 12px;
    padding: 5px 6px;
  }
`

const BetAmount = styled.span`
  color: #f59e0b;
  font-weight: 600;
  font-size: var(--text-sm);

  @media (max-width: 768px) {
    font-size: var(--text-xs);
  }
`

const ActionInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  color: white;
  font-size: var(--text-xs);
  opacity: 0.8;
  text-align: center;

  /* Ocultar completamente en móvil */
  @media (max-width: 768px) {
    display: none;
  }

  @media (max-width: 480px) {
    font-size: clamp(10px, 2.5vw, 12px);
    gap: var(--spacing-xs);
  }
`

const ActionBarComponent = React.memo(function ActionBar({ socket, state, me }: { socket: Socket, state: TableState, me: any }) {
  if (!me) return null

  // 🎵 Sistema de sonidos integrado
  const { playSound } = useSound()

  const myTurn = React.useMemo(() => state.toAct === me.id, [state.toAct, me.id])
  const allPlayersAllIn = React.useMemo(() =>
    state.players?.filter(p => !p.folded).every(p => p.isAllIn) || false,
    [state.players]
  )
  const gameInProgress = React.useMemo(() =>
    state.street !== 'ended' && state.street !== 'waiting',
    [state.street]
  )

  const toCall = React.useMemo(() =>
    Math.max(0, (state.currentBet || 0) - (me.bet || 0)),
    [state.currentBet, me.bet]
  )

  const canCheck = React.useMemo(() => toCall <= 0, [toCall])
  const minBet = React.useMemo(() =>
    Math.max(state.minRaise, toCall || state.bigBlind),
    [state.minRaise, toCall, state.bigBlind]
  )

  const [amt, setAmt] = React.useState(minBet)

  React.useEffect(() => {
    setAmt(minBet)
  }, [minBet])

  // Only log in development and when values actually change
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 ACTION BAR:', { myTurn, toAct: state.toAct, allPlayersAllIn, gameInProgress })
    }
  }, [myTurn, state.toAct, allPlayersAllIn, gameInProgress])

  const handleAction = React.useCallback((action: string, amount?: number) => {
    if (!myTurn) return

    // 🎵 Sonidos y efectos hápticos para cada acción
    switch (action) {
      case 'fold':
        playSound('fold')
        triggerHapticFeedback('medium')
        break
      case 'call':
        playSound('call')
        playSound('chip_move')
        triggerHapticFeedback('light')
        break
      case 'check':
        playSound('check')
        triggerHapticFeedback('light')
        break
      case 'raise':
      case 'bet':
        playSound('raise')
        playSound('chip_stack')
        triggerHapticFeedback('medium')
        break
      case 'allin':
        playSound('allin')
        playSound('chip_allin')
        triggerHapticFeedback('heavy')
        break
    }

    socket.emit(ClientEvents.PLAYER_ACTION, {
      roomId: state.roomId,
      action,
      amount
    })
  }, [myTurn, socket, state.roomId, playSound])

  const handleBetChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    if (value >= 0) {
      setAmt(value)
    }
  }, [])

  // 🎵 Handlers para sonidos de hover con debouncing
  const handleButtonHover = React.useCallback(() => {
    // Solo reproducir hover si no hay un hover reciente (debouncing)
    const now = Date.now()
    const lastHover = (window as any).__lastHover || 0
    if (now - lastHover > 100) { // 100ms de debouncing
      playSound('button_hover')
      ;(window as any).__lastHover = now
    }
  }, [playSound])

  const handleButtonClick = React.useCallback(() => {
    // Solo reproducir click si no hay un click reciente (debouncing)
    const now = Date.now()
    const lastClick = (window as any).__lastClick || 0
    if (now - lastClick > 200) { // 200ms de debouncing
      playSound('button_click')
      ;(window as any).__lastClick = now
    }
  }, [playSound])

  return (
    <ActionBarContainer>
      <ActionButton
        $variant="danger"
        disabled={!myTurn}
        onClick={() => handleAction('fold')}
        onMouseEnter={handleButtonHover}
      >
        FOLD
      </ActionButton>

      {canCheck ? (
        <ActionButton
          $variant="outline"
          disabled={!myTurn}
          onClick={() => handleAction('check')}
          onMouseEnter={handleButtonHover}
        >
          CHECK
        </ActionButton>
      ) : (
        <ActionButton
          $variant="success"
          disabled={!myTurn}
          onClick={() => handleAction('call')}
          onMouseEnter={handleButtonHover}
        >
          CALL <BetAmount>${toCall}</BetAmount>
        </ActionButton>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <BetInput
          type="number"
          disabled={!myTurn}
          value={amt}
          min={minBet}
          onChange={handleBetChange}
          placeholder="Amount"
        />
        <ActionInfo>
          Min: ${minBet}
        </ActionInfo>
      </div>

      {canCheck ? (
        <ActionButton
          $variant="warning"
          disabled={!myTurn || amt < minBet}
          onClick={() => handleAction('bet', amt)}
          onMouseEnter={handleButtonHover}
        >
          BET <BetAmount>${amt}</BetAmount>
        </ActionButton>
      ) : (
        <ActionButton
          $variant="warning"
          disabled={!myTurn || amt < minBet}
          onClick={() => handleAction('raise', amt)}
          onMouseEnter={handleButtonHover}
        >
          RAISE <BetAmount>${amt}</BetAmount>
        </ActionButton>
      )}

      <ActionButton
        $variant="primary"
        disabled={!myTurn}
        onClick={() => handleAction('allin')}
        onMouseEnter={handleButtonHover}
      >
        ALL-IN
      </ActionButton>

      {myTurn && (
        <ActionInfo>
          Your turn! {canCheck ? 'You can check or bet' : `You need to call $${toCall} or raise`}
        </ActionInfo>
      )}

      {allPlayersAllIn && gameInProgress && (
        <ActionInfo style={{ backgroundColor: '#2d5a2d', color: '#90EE90', border: '2px solid #4CAF50' }}>
          🎯 All players are all-in! Game advancing automatically...
        </ActionInfo>
      )}

      {!myTurn && !allPlayersAllIn && gameInProgress && (
        <ActionInfo>
          Waiting for other players...
        </ActionInfo>
      )}
    </ActionBarContainer>
  )
})

export default ActionBarComponent
