import React from 'react'
import styled, { keyframes, css } from 'styled-components'

// === Animaciones ===
const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.9) translateY(-20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
`

const pulse = keyframes`
  0%,100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
`

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`

const glow = keyframes`
  0%,100% { filter: drop-shadow(0 0 10px rgba(84,255,138,0.3)); }
  50% { filter: drop-shadow(0 0 20px rgba(84,255,138,0.6)); }
`

// === Tipos ===
interface LeaderboardRow {
  id: string
  name: string
  earnings: number
}

interface LeaderboardModalProps {
  isOpen: boolean
  onClose: () => void
  leaderboard: LeaderboardRow[]
}

// === Paleta de Colores EXACTA del Sitio Web ===
const colors = {
  // Colores principales del sitio web (exactamente los mismos)
  primary: '#54ff8a',      // Verde principal del sitio
  secondary: '#00a0ff',    // Azul del sitio
  accent: '#ffd700',       // Amarillo del sitio
  
  // Variaciones más suaves
  primarySoft: 'rgba(84,255,138,0.8)',
  secondarySoft: 'rgba(0,160,255,0.8)',
  accentSoft: 'rgba(255,215,0,0.8)',
  
  // Colores de fondo (exactamente los mismos del sitio)
  bgPrimary: 'rgba(8,32,18,0.95)',
  bgSecondary: 'rgba(16,65,39,0.95)',
  bgTertiary: 'rgba(10,44,26,0.95)',
  
  // Colores de texto (exactamente los mismos del sitio)
  textPrimary: '#eaf5ea',
  textSecondary: 'rgba(234,245,234,0.8)',
  textMuted: 'rgba(234,245,234,0.6)',
  
  // Colores de borde (exactamente los mismos del sitio)
  borderPrimary: 'rgba(84,255,138,0.2)',
  borderSecondary: 'rgba(0,160,255,0.2)',
  borderAccent: 'rgba(255,215,0,0.2)',
  
  // Colores de estado (exactamente los mismos del sitio)
  success: '#54ff8a',      // Verde del sitio
  warning: '#ffd700',      // Amarillo del sitio
  danger: '#ff4757',       // Rojo del sitio
  info: '#00a0ff'          // Azul del sitio
}

// === Componentes Estilizados ===
const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(15px);
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: ${fadeIn} 0.3s ease-out;
  overscroll-behavior: contain;
  touch-action: none;
`

const ModalContainer = styled.div`
  background: linear-gradient(135deg,
    ${colors.bgPrimary} 0%,
    ${colors.bgSecondary} 50%,
    ${colors.bgTertiary} 100%);
  border: 2px solid ${colors.borderPrimary};
  border-radius: 24px;
  padding: 0;
  max-width: 800px;
  width: 90vw;
  max-height: 85vh;
  overflow: hidden;
  box-shadow:
    0 25px 50px rgba(0,0,0,0.6),
    0 0 50px ${colors.primarySoft},
    inset 0 1px 0 rgba(255,255,255,0.1);
  backdrop-filter: blur(20px);
  position: relative;
  overscroll-behavior: contain;
  touch-action: pan-y;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${colors.primary}, ${colors.secondary}, ${colors.accent});
    border-radius: 24px 24px 0 0;
  }
`

const ModalHeader = styled.div`
  padding: 24px 32px 20px;
  border-bottom: 1px solid ${colors.borderPrimary};
  background: linear-gradient(135deg, 
    rgba(84,255,138,0.1), 
    rgba(0,160,255,0.05));
  position: relative;
`

const Title = styled.h2`
  margin: 0;
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 1px;
  background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}, ${colors.accent});
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${shimmer} 3s ease-in-out infinite;
  text-shadow: 0 0 30px ${colors.primarySoft};
  display: flex;
  align-items: center;
  gap: 12px;
  
  &::before {
    content: '🏆';
    font-size: 32px;
    animation: ${glow} 2s ease-in-out infinite;
  }
`

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 24px;
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
  color: ${colors.textPrimary};
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: ${colors.danger};
    transform: scale(1.1);
    box-shadow: 0 0 20px ${colors.danger};
  }
`

const ModalContent = styled.div`
  padding: 24px 32px 32px;
  max-height: 60vh;
  overflow-y: auto;
  overscroll-behavior: contain;
  touch-action: pan-y;
  
  /* Scrollbar personalizado */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.3);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, ${colors.secondary}, ${colors.primary});
  }
`

const LeaderboardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const LeaderboardRow = styled.div<{ $rank: number }>`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, 
    rgba(84,255,138,0.05) 0%, 
    rgba(0,160,255,0.03) 100%);
  border: 1px solid ${colors.borderPrimary};
  border-radius: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  /* Efectos especiales para top 3 con colores EXACTOS del sitio */
  ${({ $rank }) => $rank === 1 && css`
    background: linear-gradient(135deg, 
      rgba(84,255,138,0.15) 0%, 
      rgba(84,255,138,0.05) 100%);
    border-color: ${colors.primary};
    box-shadow: 0 8px 25px ${colors.primarySoft};
    
    &::before {
      content: '👑';
      position: absolute;
      left: -10px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 24px;
      animation: ${pulse} 2s ease-in-out infinite;
      filter: drop-shadow(0 0 10px ${colors.primary});
    }
  `}
  
  ${({ $rank }) => $rank === 2 && css`
    background: linear-gradient(135deg, 
      rgba(0,160,255,0.15) 0%, 
      rgba(0,160,255,0.05) 100%);
    border-color: ${colors.secondary};
    box-shadow: 0 6px 20px ${colors.secondarySoft};
    
    &::before {
      content: '🥈';
      position: absolute;
      left: -10px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 20px;
      animation: ${pulse} 2s ease-in-out infinite;
      filter: drop-shadow(0 0 10px ${colors.secondary});
    }
  `}
  
  ${({ $rank }) => $rank === 3 && css`
    background: linear-gradient(135deg, 
      rgba(255,215,0,0.15) 0%, 
      rgba(255,215,0,0.05) 100%);
    border-color: ${colors.accent};
    box-shadow: 0 4px 15px ${colors.accentSoft};
    
    &::before {
      content: '🥉';
      position: absolute;
      left: -10px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 18px;
      animation: ${pulse} 2s ease-in-out infinite;
      filter: drop-shadow(0 0 10px ${colors.accent});
    }
  `}
  
  &:hover {
    transform: translateX(8px) scale(1.02);
    background: linear-gradient(135deg, 
      rgba(84,255,138,0.1) 0%, 
      rgba(0,160,255,0.06) 100%);
    border-color: ${colors.primary};
    box-shadow: 0 8px 25px ${colors.primarySoft};
  }
`

const RankBadge = styled.div<{ $rank: number }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 18px;
  margin-right: 20px;
  position: relative;
  
  ${({ $rank }) => $rank === 1 && css`
    background: linear-gradient(135deg, ${colors.primary}, #00ff88);
    color: #000;
    box-shadow: 0 0 20px ${colors.primarySoft};
    animation: ${pulse} 2s ease-in-out infinite;
  `}
  
  ${({ $rank }) => $rank === 2 && css`
    background: linear-gradient(135deg, ${colors.secondary}, #0080ff);
    color: white;
    box-shadow: 0 0 15px ${colors.secondarySoft};
  `}
  
  ${({ $rank }) => $rank === 3 && css`
    background: linear-gradient(135deg, ${colors.accent}, #ffaa00);
    color: #000;
    box-shadow: 0 0 15px ${colors.accentSoft};
  `}
  
  ${({ $rank }) => $rank > 3 && css`
    background: linear-gradient(135deg, ${colors.success}, ${colors.primary});
    color: #000;
    border: 2px solid ${colors.borderPrimary};
  `}
`

const PlayerInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const PlayerName = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: ${colors.textPrimary};
  letter-spacing: 0.5px;
`

const PlayerId = styled.span`
  font-size: 12px;
  color: ${colors.textMuted};
  font-family: monospace;
`

const Earnings = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
`

const EarningsAmount = styled.span`
  font-size: 20px;
  font-weight: 900;
  color: ${colors.success};
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 10px ${colors.success};
`

const EarningsLabel = styled.span`
  font-size: 11px;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${colors.textMuted};
  
  &::before {
    content: '📊';
    font-size: 48px;
    display: block;
    margin-bottom: 16px;
    opacity: 0.5;
  }
`

const StatsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background: rgba(0,0,0,0.3);
  border-top: 1px solid ${colors.borderPrimary};
  font-size: 14px;
  color: ${colors.textSecondary};
`

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  
  .value {
    font-size: 18px;
    font-weight: 700;
    color: ${colors.primary};
  }
  
  .label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    opacity: 0.8;
  }
`

// === Componente Principal ===
export default function LeaderboardModal({ isOpen, onClose, leaderboard }: LeaderboardModalProps) {
  const totalPlayers = leaderboard.length
  const totalEarnings = leaderboard.reduce((sum, player) => sum + player.earnings, 0)
  const avgEarnings = totalPlayers > 0 ? Math.round(totalEarnings / totalPlayers) : 0

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <ModalOverlay
      $isOpen={isOpen}
      onClick={onClose}
      style={{
        overscrollBehavior: 'contain',
        touchAction: 'none'
      }}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <ModalContainer
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <ModalHeader>
          <Title>Leaderboard Global</Title>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <ModalContent
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {leaderboard.length === 0 ? (
            <EmptyState>
              <h3>No data available</h3>
              <p>Players will appear here when they start playing</p>
            </EmptyState>
          ) : (
            <LeaderboardList>
              {leaderboard.map((player, index) => (
                <LeaderboardRow key={player.id} $rank={index + 1}>
                  <RankBadge $rank={index + 1}>
                    {index + 1}
                  </RankBadge>
                  
                  <PlayerInfo>
                    <PlayerName>{player.name || `Player-${player.id.slice(0,4)}`}</PlayerName>
                    <PlayerId>ID: {player.id}</PlayerId>
                  </PlayerInfo>
                  
                  <Earnings>
                    <EarningsAmount>${player.earnings.toLocaleString()}</EarningsAmount>
                    <EarningsLabel>Ganancias</EarningsLabel>
                  </Earnings>
                </LeaderboardRow>
              ))}
            </LeaderboardList>
          )}
        </ModalContent>
        
        <StatsBar>
          <StatItem>
            <span className="value">{totalPlayers}</span>
            <span className="label">Jugadores</span>
          </StatItem>
          <StatItem>
            <span className="value">${totalEarnings.toLocaleString()}</span>
            <span className="label">Total Ganancias</span>
          </StatItem>
          <StatItem>
            <span className="value">${avgEarnings.toLocaleString()}</span>
            <span className="label">Promedio</span>
          </StatItem>
        </StatsBar>
      </ModalContainer>
    </ModalOverlay>
  )
}
