import React from 'react'
import styled, { keyframes } from 'styled-components'
import type { TableState } from 'shared/protocol'

const slideInRight = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`

const slideInTop = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`

const NotificationContainer = styled.div<{ $type: 'success' | 'warning' | 'error' | 'info' }>`
  position: fixed;
  top: var(--space-6);
  right: var(--space-6);
  padding: var(--space-4) var(--space-6);
  background: rgba(0, 0, 0, 0.95);
  border-radius: var(--radius-xl);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  box-shadow: var(--shadow-2xl);
  color: white;
  font-weight: 500;
  z-index: 10000;
  animation: ${slideInRight} var(--transition-bounce);
  max-width: 400px;
  border-left: 4px solid ${({ $type }) => {
    switch ($type) {
      case 'success': return 'var(--success-500)'
      case 'warning': return 'var(--warning-500)'
      case 'error': return 'var(--danger-500)'
      default: return 'var(--primary-500)'
    }
  }};

  @media (max-width: 768px) {
    top: var(--space-4);
    right: var(--space-4);
    left: var(--space-4);
    max-width: none;
  }
`

const CenterNotification = styled.div<{ $type: 'success' | 'warning' | 'error' | 'info' }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: var(--space-6) var(--space-8);
  background: rgba(0, 0, 0, 0.95);
  border-radius: var(--radius-2xl);
  border: 2px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  box-shadow: var(--shadow-2xl);
  color: white;
  font-weight: 600;
  z-index: 10001;
  animation: ${fadeIn} var(--transition-bounce);
  text-align: center;
  min-width: 300px;
  border-color: ${({ $type }) => {
    switch ($type) {
      case 'success': return 'var(--success-500)'
      case 'warning': return 'var(--warning-500)'
      case 'error': return 'var(--danger-500)'
      default: return 'var(--primary-500)'
    }
  }};
`

const NotificationTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: var(--space-2);
  color: white;
`

const NotificationMessage = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
  line-height: 1.4;
`

const WinnerList = styled.div`
  margin-top: var(--space-3);
  padding: var(--space-3);
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-lg);
`

const WinnerItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`

const HandResult = styled.div`
  font-size: 0.8rem;
  opacity: 0.7;
  font-style: italic;
`

const PotAmount = styled.span`
  color: var(--warning-500);
  font-weight: 700;
  font-size: 1.2rem;
`

const StreetIndicator = styled.div<{ $street: string }>`
  position: fixed;
  top: var(--space-6);
  left: 50%;
  transform: translateX(-50%);
  padding: var(--space-3) var(--space-6);
  background: rgba(0, 0, 0, 0.8);
  border-radius: var(--radius-xl);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  font-weight: 600;
  z-index: 9999;
  animation: ${slideInTop} var(--transition-bounce);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.9rem;
  
  ${({ $street }) => {
    switch ($street) {
      case 'preflop': return 'border-color: var(--primary-500);'
      case 'flop': return 'border-color: var(--success-500);'
      case 'turn': return 'border-color: var(--warning-500);'
      case 'river': return 'border-color: var(--danger-500);'
      case 'showdown': return 'border-color: var(--warning-500); background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1));'
      default: return 'border-color: var(--neutral-500);'
    }
  }}
`

interface GameNotificationsProps {
  state: TableState
  previousState?: TableState
}

export default function GameNotifications({ state, previousState }: GameNotificationsProps) {
  const [notifications, setNotifications] = React.useState<Array<{
    id: string
    type: 'success' | 'warning' | 'error' | 'info'
    title: string
    message: string
    duration?: number
  }>>([])

  const [showStreetIndicator, setShowStreetIndicator] = React.useState(false)

  // Show street indicator when street changes
  React.useEffect(() => {
    if (previousState && previousState.street !== state.street) {
      setShowStreetIndicator(true)
      const timer = setTimeout(() => setShowStreetIndicator(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [state.street, previousState])

  // Show showdown results
  React.useEffect(() => {
    if (state.street === 'showdown' && previousState?.street === 'river') {
      const activePlayers = state.players.filter(p => !p.folded && !p.isAllIn)
      
      if (activePlayers.length === 1) {
        // Single winner
        const winner = activePlayers[0]
        addNotification('success', 'Winner!', `${winner.name} wins $${state.pot}!`)
      } else if (activePlayers.length > 1) {
        // Multiple players in showdown
        addNotification('info', 'Showdown!', `Evaluating hands for ${activePlayers.length} players...`)
      }
    }
  }, [state.street, state.pot, state.players, previousState])

  // Show hand start
  React.useEffect(() => {
    if (previousState && state.handNumber !== previousState.handNumber) {
      addNotification('info', 'New Hand', `Hand #${state.handNumber} starting...`, 3000)
    }
  }, [state.handNumber, previousState])

  const addNotification = (
    type: 'success' | 'warning' | 'error' | 'info',
    title: string,
    message: string,
    duration = 5000
  ) => {
    const id = Math.random().toString(36).substr(2, 9)
    setNotifications(prev => [...prev, { id, type, title, message, duration }])
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, duration)
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <>
      {/* Street Indicator */}
      {showStreetIndicator && (
        <StreetIndicator $street={state.street}>
          {state.street === 'preflop' && '🃏 Preflop'}
          {state.street === 'flop' && '🃏 Flop'}
          {state.street === 'turn' && '🃏 Turn'}
          {state.street === 'river' && '🃏 River'}
          {state.street === 'showdown' && '🏆 Showdown'}
        </StreetIndicator>
      )}

      {/* Notifications */}
      {notifications.map((notification, index) => (
        <NotificationContainer
          key={notification.id}
          $type={notification.type}
          style={{ top: `${var('--space-6')} + ${index * 80}px` }}
          onClick={() => removeNotification(notification.id)}
        >
          <NotificationTitle>{notification.title}</NotificationTitle>
          <NotificationMessage>{notification.message}</NotificationMessage>
        </NotificationContainer>
      ))}

      {/* Pot Display */}
      {state.pot > 0 && (
        <NotificationContainer $type="info" style={{ bottom: '120px', top: 'auto' }}>
          <NotificationTitle>Pot</NotificationTitle>
          <NotificationMessage>
            <PotAmount>${state.pot}</PotAmount>
          </NotificationMessage>
        </NotificationContainer>
      )}
    </>
  )
}

