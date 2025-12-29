// client/src/components/PlayerSeat.tsx
import React from 'react'
import styled, { keyframes, css } from 'styled-components'
import type { Card } from 'shared/protocol'

// Componente para mostrar username con indicador de premium
const UsernameWithBadge = ({
  name,
  subscription,
  isSmall = false
}: {
  name: string,
  subscription?: 'free' | 'bronze' | 'silver' | 'gold' | 'diamond',
  isSmall?: boolean
}) => {
  const getBadgeIcon = () => {
    switch (subscription) {
      case 'bronze':
      case 'silver':
        return '💎' // Diamond for Bronze/Silver
      case 'gold':
      case 'diamond':
        return '👑' // Crown for Gold/Diamond
      default:
        return null
    }
  }

  const getBadgeColor = () => {
    switch (subscription) {
      case 'bronze':
      case 'silver':
        return '#60a5fa' // Light blue for diamond
      case 'gold':
      case 'diamond':
        return '#fbbf24' // Gold for crown
      default:
        return 'transparent'
    }
  }

  const badgeIcon = getBadgeIcon()
  const badgeColor = getBadgeColor()

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: isSmall ? '12px' : '14px',
      fontWeight: '600'
    }}>
      {name}
                {badgeIcon && (
            <span style={{
              color: badgeColor,
              fontSize: isSmall ? '12px' : '14px',
              fontWeight: 'normal',
              verticalAlign: 'middle',
              lineHeight: '1',
              filter: subscription === 'gold' || subscription === 'diamond' ? 'drop-shadow(0 0 3px rgba(251, 191, 36, 0.6))' : 'drop-shadow(0 0 2px rgba(96, 165, 250, 0.4))'
            }}>
              {badgeIcon}
            </span>
          )}
    </span>
  )
}

// ========== SISTEMA DE PERSONAJES ==========
const CHARACTER_SETS = {
  // Personajes para jugadores humanos (más elegantes)
  human: [
    '🧑‍💼', '👩‍💼', '🧑‍🎓', '👩‍🎓', '🧑‍💻', '👩‍💻', '🧑‍🔬', '👩‍🔬',
    '🧑‍🎨', '👩‍🎨', '🧑‍🍳', '👩‍🍳', '🧑‍🚀', '👩‍🚀', '🧑‍⚖️', '👩‍⚖️'
  ],
  // Personajes para bots (más temáticos de casino)
  bot: [
    '🤖', '🎭', '👻', '🦊', '🐺', '🦉', '🦇', '🐱',
    '🐶', '🐼', '🐨', '🦁', '🐯', '🦄', '🐲', '🎪'
  ]
}

// Función para obtener personaje basado en ID y tipo
function getCharacterForPlayer(playerId: string, isBot: boolean): string {
  const charSet = isBot ? CHARACTER_SETS.bot : CHARACTER_SETS.human

  // Crear hash simple del ID para consistencia
  let hash = 0
  for (let i = 0; i < playerId.length; i++) {
    hash = ((hash << 5) - hash) + playerId.charCodeAt(i)
    hash = hash & hash // Convertir a 32bit integer
  }

  const index = Math.abs(hash) % charSet.length
  return charSet[index]
}

type Player = {
  id: string
  name: string
  stack: number
  bet?: number
  isBot?: boolean
  isAllIn?: boolean
  hand?: Card[]
  subscription?: 'free' | 'bronze' | 'silver' | 'gold' | 'diamond'
}

export default function PlayerSeat({
  p,
  isDealer,
  isTurn,
  isMe,
  street,
  avatarScale = 1,     // 👈 nuevo prop (opcional)
  selectedAvatar,      // 👈 nuevo prop para avatar personalizado
  subscription,        // 👈 nuevo prop para subscription
}: {
  p: Player
  isDealer?: boolean
  isTurn?: boolean
  isMe?: boolean
  street?: string
  avatarScale?: number
  selectedAvatar?: string // 👈 nuevo prop para avatar personalizado
  subscription?: 'free' | 'bronze' | 'silver' | 'gold' | 'diamond' // 👈 nuevo prop para subscription
}) {
  // Obtener avatar: del servidor si existe, o de localStorage si es el usuario actual
  const serverAvatar = p.avatar // Avatar que viene del servidor
  const localAvatar = isMe ? localStorage.getItem('selectedAvatar') : null

  // Prioridad: servidor > localStorage (solo para usuario actual) > personaje generado
  const character = serverAvatar || (isMe && localAvatar) || getCharacterForPlayer(p.id, p.isBot)

  // Debug logs para verificar sincronización (solo si hay cambios)
  if (serverAvatar && serverAvatar !== character) {
    console.log(`🎭 PlayerSeat ${p.name}: avatar updated to "${character}"`)
  }

  // Determinar qué cartas mostrar
  const shouldShowRealCards = isMe || (street === 'showdown' || street === 'ended')
  const cardsToShow = shouldShowRealCards ? (p.hand ?? []) : []

  return (
    <SeatCard $active={!!isTurn}>
      <Header>
        <AvatarWrap $active={!!isTurn} $scale={avatarScale}>
          {/* Personaje único basado en ID y tipo */}
          <CharacterDisplay $isBot={p.isBot} $isTurn={!!isTurn}>
            {character && character.startsWith('http') ? (
              // Es una URL de imagen (GIF/avatar personalizado)
              <img
                src={character}
                alt="Avatar"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%', // Hacer la imagen perfectamente circular
                  display: 'block' // Evitar espacio extra debajo de la imagen
                }}
                onError={(e) => {
                  // Si la imagen falla, mostrar emoji por defecto
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const fallback = document.createElement('span')
                  fallback.textContent = getCharacterForPlayer(p.id, p.isBot)
                  if (target.parentNode) {
                    target.parentNode.appendChild(fallback)
                  }
                }}
              />
            ) : (
              // Es un emoji o caracter normal
              character || getCharacterForPlayer(p.id, p.isBot)
            )}
          </CharacterDisplay>
          {isDealer && <DealerChip>D</DealerChip>}
        </AvatarWrap>
        <Name title={p.name}>
          <UsernameWithBadge
            name={p.name}
            subscription={p.subscription || (isMe ? subscription : undefined)}
            isSmall={true}
          />
        </Name>
        <Stack>Stack {p.stack}</Stack>
      </Header>

      <Body>
        <Cards>
          {shouldShowRealCards ? (
            // Mostrar cartas reales si es mi mano o showdown
            cardsToShow.map((c, i) => (
              <CardStub key={i}>{c}</CardStub>
            ))
          ) : (
            // Mostrar cartas boca abajo para oponentes
            Array.from({ length: 2 }, (_, i) => (
              <CardStub key={i} $hidden={true}>
                🂠
              </CardStub>
            ))
          )}
        </Cards>
        <Bet>Bet {p.bet ?? 0}</Bet>
      </Body>
    </SeatCard>
  )
}

/* ====== estilos ====== */

const pulse = keyframes`
  0%,100% { box-shadow: 0 0 0 rgba(0,0,0,0), 0 0 0 0 rgba(84,255,138,0.0); }
  50%     { box-shadow: 0 0 0 rgba(0,0,0,0), 0 0 22px 2px rgba(84,255,138,0.65); }
`

const ring = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(84,255,138,0.6); }
  70%  { box-shadow: 0 0 0 8px rgba(84,255,138,0.0); }
  100% { box-shadow: 0 0 0 0 rgba(84,255,138,0.0); }
`

// Animación especial para personajes de bot
const botGlow = keyframes`
  0%, 100% {
    text-shadow: 0 0 8px rgba(255,107,53,0.4), 0 0 16px rgba(255,107,53,0.2);
    filter: brightness(1.1);
  }
  50% {
    text-shadow: 0 0 12px rgba(255,107,53,0.6), 0 0 20px rgba(255,107,53,0.3);
    filter: brightness(1.2);
  }
`

// Personaje mejorado con efectos visuales - aún más pequeño
const CharacterDisplay = styled.div<{ $isBot: boolean; $isTurn: boolean }>`
  font-size: 2.0rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${props => props.$isBot
    ? 'linear-gradient(135deg, rgba(255,107,53,0.15), rgba(255,69,0,0.1))'
    : 'linear-gradient(135deg, rgba(84,255,138,0.15), rgba(34,197,94,0.1))'};
  border: 2px solid ${props => props.$isBot ? 'rgba(255,107,53,0.3)' : 'rgba(84,255,138,0.3)'};
  box-shadow:
    inset 0 2px 4px rgba(0,0,0,0.1),
    0 4px 8px rgba(0,0,0,0.2);

  /* Efectos especiales para bots */
  ${props => props.$isBot && css`
    animation: ${botGlow} 3s ease-in-out infinite;
    border-color: rgba(255,107,53,0.5);
  `}

  /* Efectos cuando es el turno del jugador */
  ${props => props.$isTurn && css`
    box-shadow:
      inset 0 2px 4px rgba(0,0,0,0.1),
      0 0 20px rgba(84,255,138,0.6),
      0 0 40px rgba(84,255,138,0.3);
    border-color: rgba(84,255,138,0.8);
    transform: scale(1.05);
  `}

  /* Hover effects */
  &:hover {
    transform: scale(1.1);
    transition: transform 0.2s ease;
  }

  /* Responsive */
  @media (max-width: 768px) {
    font-size: 2.0rem;
    width: 44px;
    height: 44px;
  }
`

// Contenedor del asiento (todo el rectángulo) - Más pequeño
const SeatCard = styled.div<{ $active: boolean }>`
  position: relative;
  width: 300px;
  max-width: 34vw;
  padding: 10px 12px;
  border-radius: 16px;
  color: #e8f6ee;
  background: linear-gradient(180deg,
    rgba(16,65,39,0.85),
    rgba(10,44,26,0.85),
    rgba(5,25,15,0.9)
  );
  box-shadow:
    inset 0 2px 0 rgba(255,255,255,0.08),
    inset 0 -1px 0 rgba(0,0,0,0.2),
    0 12px 28px rgba(0,0,0,0.4),
    0 0 0 1px rgba(255,255,255,0.05);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(84,255,138,0.1);

  ${({ $active }) =>
    $active &&
    css`
      animation: ${pulse} 1.6s ease-in-out infinite;
      outline: 2px solid rgba(84, 255, 138, 0.35);
      outline-offset: 2px;
    `}
`

const Header = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  padding: 5px 8px;
  background: linear-gradient(90deg,
    rgba(0,0,0,0.1),
    rgba(84,255,138,0.05),
    rgba(0,0,0,0.1)
  );
  border-radius: 8px;
  border: 1px solid rgba(84,255,138,0.08);
`

// Contenedor del avatar (simplificado para el nuevo diseño)
const AvatarWrap = styled.div<{ $active: boolean; $scale: number }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  /* 👇 escala visual del avatar, NO afecta el layout */
  transform: scale(${p => p.$scale || 1});
  transform-origin: center;
  transition: transform 160ms ease;
  will-change: transform;
  z-index: 2;

  /* Mantener solo el efecto de halo cuando está activo */
  ${({ $active }) =>
    $active &&
    css`
      &::after{
        content:'';
        position:absolute;
        top: -8px;
        left: -8px;
        right: -8px;
        bottom: -8px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(84,255,138,0.3) 0%, transparent 70%);
        animation: ${ring} 1.5s ease-out infinite;
        z-index: -1;
      }
    `}
`

const DealerChip = styled.div`
  position: absolute;
  right: -2px; bottom: -2px;
  width: 16px; height: 16px;
  border-radius: 50%;
  background: #f7d97b;
  color: #222;
  font-weight: 700;
  font-size: 9px;
  display: grid; place-items: center;
  box-shadow:
    0 2px 4px rgba(0,0,0,0.2),
    inset 0 1px 0 rgba(255,255,255,0.9);
`

const Name = styled.div`
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  color: #ffffff;
  background: linear-gradient(90deg, #ffffff, #e8f6ee);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const Stack = styled.div`
  opacity: 0.9;
  font-size: 11px;
  font-weight: 600;
  color: #84ff8a;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  background: rgba(0,0,0,0.2);
  padding: 3px 6px;
  border-radius: 6px;
  border: 1px solid rgba(84,255,138,0.2);
`

const Body = styled.div`
  display: flex; align-items: center; gap: 12px;
`

const Cards = styled.div`
  display: flex; gap: 6px;
`

const CardStub = styled.div<{ $hidden?: boolean }>`
  width: 36px; height: 50px;
  border-radius: 6px;
  display: grid; place-items: center;
  font-weight: 700;
  font-size: 11px;
  box-shadow:
    0 4px 8px rgba(0,0,0,0.25),
    inset 0 1px 0 rgba(255,255,255,0.8);

  ${({ $hidden }) => $hidden ? `
    /* Estilo para cartas ocultas */
    background:
      radial-gradient(circle at 30% 30%, #1a1a1a, #2a2a2a 50%, #1a1a1a),
      linear-gradient(45deg, #1a1a1a 25%, transparent 25%, transparent 75%, #1a1a1a 75%),
      linear-gradient(-45deg, #1a1a1a 25%, transparent 25%, transparent 75%, #1a1a1a 75%);
    background-size: 4px 4px, 20px 20px, 20px 20px;
    color: #666;
    border: 2px solid #333;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 8px;
      left: 8px;
      right: 8px;
      bottom: 8px;
      background: repeating-linear-gradient(
        45deg,
        #333,
        #333 2px,
        #444 2px,
        #444 4px
      );
      border-radius: 4px;
    }

    /* Ocultar el texto de la carta cuando está boca abajo */
    > * {
      opacity: 0.3;
      filter: blur(1px);
    }
  ` : `
    /* Estilo para cartas visibles */
    background: #fff;
    color: #222;
    border: 1px solid #ddd;
  `}
`

const Bet = styled.div`
  margin-left: auto;
  opacity: .9;
`
