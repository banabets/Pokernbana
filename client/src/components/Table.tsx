// client/src/components/Table.tsx
import React from 'react'
import styled, { keyframes, css } from 'styled-components'
import type { Socket } from 'socket.io-client'
import * as Protocol from 'shared/protocol'
const { ServerEvents = {}, ClientEvents = {} } = Protocol
type TableState = import('shared/protocol').TableState

import PlayingCard from './PlayingCard'
import PlayerSeat from './PlayerSeat'
import ActionBar from './ActionBar'
import ChatPanel from './ChatPanel'

// ===== eventos TIP (fallbacks si no existen en protocol) =====
const TIP_DEALER     = ClientEvents.TIP_DEALER     ?? 'TIP_DEALER'
const DEALER_TIPPED  = ServerEvents.DEALER_TIPPED  ?? 'DEALER_TIPPED'

// Estilos 3D + dealer + POT HUD
import {
  TableWrap, TableTilt, TableRail, TableSurface, FeltNoise,
  FlyCard, DealerFigure, DealerArm, DealerAvatarFallback,
  PotHud, PotLabel, PotAmount,
  PotStackWrap, PotChipToken, PotMore
} from './Table3D.styles'

// ✅ rutas robustas
const BASE       = (import.meta as any).env.BASE_URL || '/'
const DEALER_SRC = `${BASE}assets/dealer.png`
const BG_SRC     = `${BASE}assets/room-bg.png`

// ======== Ajustes visuales ========
const TABLE_OFFSET_CSS = 'clamp(48px, 10vh, 160px)'
const DEALER_IMG_W_PX   = 160
const DEALER_IMG_TOP_PX = -130
// ==================================

// Fondo con imagen
const Backdrop = styled.div<{ $img?: string }>`
  position: fixed;
  inset: 0;
  background:
    radial-gradient(120% 80% at 50% 20%, rgba(0,0,0,.15), rgba(0,0,0,.55) 75%),
    url(${p => p.$img || ''}) center / cover no-repeat;
  z-index: 0;
  pointer-events: none;
`

const ChipDot = styled.div`
  pointer-events: none;
  position: absolute;
  width: 18px; height: 18px; border-radius: 50%;
  transform: translate(-50%, -50%) rotateX(12deg);
  background:
    radial-gradient(circle at 30% 30%, #ffffffb0, transparent 45%),
    linear-gradient(#d33, #a11);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 4px rgba(0,0,0,0.4);
  transition: left 360ms ease-out, top 360ms ease-out, opacity 200ms ease-in;
  will-change: left, top;
`

/* TopBar fijo */
const TopBar = styled.div`
  position: fixed;
  top: var(--spacing-xs);
  left: var(--spacing-xs);
  right: var(--spacing-xs);
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius);
  background: rgba(0,0,0,0.28);
  backdrop-filter: blur(6px);
  color: #fff;
  z-index: 1000;
  pointer-events: none;
  font-size: var(--text-sm);
  > * { pointer-events: auto; }

  @media (max-width: 768px) {
    padding: var(--spacing-xs);
    font-size: var(--text-xs);
    gap: var(--spacing-xs);
  }

  @media (max-width: 480px) {
    top: var(--spacing-xs);
    left: var(--spacing-xs);
    right: var(--spacing-xs);
    flex-wrap: wrap;
    justify-content: center;
  }
`

/* Fila para centrar mesa y chat */
const RoomRow = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  gap: var(--spacing-lg);
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  max-width: min(1500px, 98vw);
  margin: 0 auto;
  padding: 0 var(--spacing-sm);

  @media (max-width: 980px) {
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
  }

  @media (max-width: 768px) {
    padding: 0 var(--spacing-xs);
    gap: var(--spacing-sm);
  }

  @media (max-width: 480px) {
    padding: 0 var(--spacing-xs);
    gap: var(--spacing-xs);
  }
`

const ActionDock = styled.div`
  position: relative;
  width: min(1100px, 95vw);
  margin: clamp(100px, 20vh, 150px) auto 0;
  display: flex;
  justify-content: center;
  z-index: 10;

  @media (max-width: 768px) {
    margin: clamp(80px, 15vh, 120px) auto 0;
    width: 100vw; /* Ancho completo para que ActionBar tome control */
  }

  @media (max-width: 480px) {
    margin: clamp(60px, 10vh, 100px) auto 0;
    width: 100vw; /* Ancho completo para que ActionBar tome control */
  }
`

/* === TIP dealer === */
/* Usamos una variable CSS --tipTop para controlar la altura. */
const TipDock = styled.div`
  position: absolute;
  left: 50%;
  top: var(--tipTop, 14%); /* ← mueve esto con style en el render */
  transform: translate(-50%, -50%) rotateX(12deg);
  display: flex;
  gap: 8px;
  z-index: 9;
  pointer-events: auto;

  /* Móvil: Ajustado para el selector único */
  @media (max-width: 768px) {
    top: var(--tipTop, 8%) !important; /* Un poco más arriba para dar espacio al selector */
    gap: 4px !important; /* Gap cómodo para el selector */
    transform: translate(-50%, -50%) rotateX(2deg) !important; /* Rotación mínima */
    flex-direction: column !important; /* Vertical para el selector */
    align-items: center !important;
  }

  /* Móvil muy pequeño */
  @media (max-width: 480px) {
    top: var(--tipTop, 6%) !important; /* Aún más arriba */
    gap: 3px !important; /* Gap cómodo */
    transform: translate(-50%, -50%) rotateX(1deg) !important; /* Rotación mínima */
    flex-direction: column !important; /* Vertical para el selector */
    align-items: center !important;
  }
`

const TipButton = styled.button`
  height: 32px; padding: 0 10px;
  border-radius: 999px;
  background: rgba(0,0,0,.35);
  color: #fff; border: 1px solid rgba(255,255,255,.12);
  font-weight: 700; cursor: pointer;
  backdrop-filter: blur(4px);

  /* Móvil: Botón TIP único más grande y prominente */
  @media (max-width: 768px) {
    height: 32px !important; /* Tamaño normal para mejor usabilidad */
    padding: 0 12px !important; /* Padding cómodo */
    font-size: 0.8rem !important; /* Texto legible */
    font-weight: 700 !important; /* Negrita para prominencia */
    min-width: 60px !important; /* Ancho adecuado */
    border-radius: 8px !important; /* Bordes redondeados */

    &.active {
      background: rgba(84, 255, 138, 0.3) !important;
      border-color: rgba(84, 255, 138, 0.5) !important;
      color: #54ff8a !important;
    }
  }

  /* Móvil muy pequeño */
  @media (max-width: 480px) {
    height: 28px !important; /* Un poco más pequeño pero aún usable */
    padding: 0 10px !important; /* Padding cómodo */
    font-size: 0.75rem !important; /* Texto legible */
    font-weight: 700 !important; /* Negrita para prominencia */
    min-width: 55px !important; /* Ancho adecuado */
    border-radius: 6px !important; /* Bordes redondeados */

    &.active {
      background: rgba(84, 255, 138, 0.3) !important;
      border-color: rgba(84, 255, 138, 0.5) !important;
      color: #54ff8a !important;
    }
  }
`

const TipMenu = styled.div`
  display: flex; gap: 6px;
  background: rgba(0,0,0,.4);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 999px;
  padding: 4px;
  backdrop-filter: blur(4px);

  /* Móvil: Selector más espaciado y visible */
  @media (max-width: 768px) {
    gap: 6px !important; /* Gap cómodo para el selector */
    padding: 8px !important; /* Padding generoso */
    border-radius: 12px !important; /* Bordes redondeados */
    background: rgba(0, 0, 0, 0.7) !important; /* Fondo más visible */
    backdrop-filter: blur(8px) !important; /* Blur para el selector */
    border: 1px solid rgba(255, 255, 255, 0.2) !important; /* Borde sutil */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important; /* Sombra */
    flex-direction: row !important; /* Horizontal para el selector */
    flex-wrap: wrap !important; /* Permitir wrap */
    justify-content: center !important;
    max-width: 200px !important; /* Ancho máximo para el selector */
  }

  /* Móvil muy pequeño */
  @media (max-width: 480px) {
    gap: 4px !important; /* Gap cómodo */
    padding: 6px !important; /* Padding generoso */
    border-radius: 10px !important; /* Bordes redondeados */
    background: rgba(0, 0, 0, 0.7) !important; /* Fondo más visible */
    backdrop-filter: blur(6px) !important; /* Blur para el selector */
    border: 1px solid rgba(255, 255, 255, 0.2) !important; /* Borde sutil */
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25) !important; /* Sombra */
    flex-direction: row !important; /* Horizontal para el selector */
    flex-wrap: wrap !important; /* Permitir wrap */
    justify-content: center !important;
    max-width: 180px !important; /* Ancho máximo más pequeño */
  }
`

const TipAmt = styled.button`
  min-width: 42px; height: 28px;
  border-radius: 999px; border: none;
  cursor: pointer; font-weight: 800;
  background: #f0c45a; color: #1a1200;

  /* Móvil más pequeño - ultra ultra compacto */
  @media (max-width: 768px) {
    min-width: 22px !important; /* Ultra más pequeño */
    height: 18px !important; /* Ultra más pequeño */
    font-size: 0.55rem !important; /* Texto ultra ultra pequeño */
    font-weight: 700 !important; /* Mantener negrita */
    border-radius: 6px !important; /* Bordes ultra pequeños */
    padding: 0 2px !important; /* Padding mínimo */
  }

  /* Móvil muy pequeño - ultra ultra compacto */
  @media (max-width: 480px) {
    min-width: 20px !important; /* Ultra ultra pequeño */
    height: 14px !important; /* Ultra ultra pequeño */
    font-size: 0.5rem !important; /* Texto ultra mínimo */
    font-weight: 600 !important; /* Negrita reducida */
    border-radius: 4px !important; /* Bordes ultra pequeños */
    padding: 0 1px !important; /* Padding ultra mínimo */
  }
`

const tipFly = keyframes`
  0%   { transform: translate(var(--fromX,0), var(--fromY,0)) rotateX(12deg) scale(0.8); opacity:.0; }
  80%  { transform: translate(calc(var(--fromX,0) * .1), calc(var(--fromY,0) * .1)) rotateX(12deg) scale(1); opacity:1; }
  100% { transform: translate(0,0) rotateX(12deg) scale(1); opacity:0; }
`
// Moneda de casino que coincide con las del jackpot
const CasinoChip = styled.div<{
  $chipColor: string;
  $borderColor: string;
  $textColor: string;
  $amount: number;
}>`
  position: absolute;
  left: 50%; top: 50%;
  width: ${props => props.$amount >= 10 ? '32px' : '28px'};
  height: ${props => props.$amount >= 10 ? '32px' : '28px'};
  border-radius: 50%;
  transform: translate(-50%,-50%) rotateX(12deg);
  animation: ${tipFly} 520ms ease-out both;
  z-index: 8;

  /* Chips ultra pequeños en móvil */
  @media (max-width: 768px) {
    width: ${props => props.$amount >= 10 ? '20px' : '16px'};
    height: ${props => props.$amount >= 10 ? '20px' : '16px'};
  }

  /* Chips ultra pequeños en móvil pequeño */
  @media (max-width: 480px) {
    width: ${props => props.$amount >= 10 ? '16px' : '12px'};
    height: ${props => props.$amount >= 10 ? '16px' : '12px'};
  }
  pointer-events: none;

  /* MISMO diseño que las PotChipToken del jackpot */
  ${({ $amount }) => {
    switch ($amount) {
      case 1:    return css`
        background:
          radial-gradient(circle at 30% 30%, #ffffff 0%, #ffebee 40%, #ff6b6b 55%, #b71c1c 100%),
          radial-gradient(circle at 70% 70%, rgba(255,255,255,0.6) 0%, transparent 50%);
      `;
      case 5:   return css`
        background:
          radial-gradient(circle at 30% 30%, #ffffff 0%, #e3f2fd 40%, #6bb0ff 55%, #1c43b7 100%),
          radial-gradient(circle at 70% 70%, rgba(255,255,255,0.6) 0%, transparent 50%);
      `;
      case 10:   return css`
        background:
          radial-gradient(circle at 30% 30%, #ffffff 0%, #e8f5e8 40%, #59c46b 55%, #197a2c 100%),
          radial-gradient(circle at 70% 70%, rgba(255,255,255,0.6) 0%, transparent 50%);
      `;
      case 25:   return css`
        background:
          radial-gradient(circle at 30% 30%, #ffffff 0%, #fff8e1 40%, #ffe066 55%, #b38a00 100%),
          radial-gradient(circle at 70% 70%, rgba(255,255,255,0.6) 0%, transparent 50%);
      `;
    }
  }}

  /* Sombras y texturas premium IGUALES que las del jackpot */
  border: 2px solid rgba(255,215,0,0.3);
  box-shadow:
    inset 0 2px 4px rgba(255,255,255,0.4),
    inset 0 -2px 4px rgba(0,0,0,0.3),
    0 6px 12px rgba(0,0,0,0.4);

  /* Valor de la moneda */
  &::after {
    content: '${props => props.$amount}';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: ${props => props.$amount >= 10 ? '11px' : '9px'};
    font-weight: 700;
    color: white;
    text-shadow: 0 1px 2px rgba(0,0,0,0.8);
    z-index: 1;
  }

  /* Efecto de profundidad */
  &::before {
    content: '';
    position: absolute;
    top: -1px;
    left: -1px;
    right: -1px;
    bottom: -1px;
    border-radius: 50%;
    border: 1px solid rgba(255,215,0,0.2);
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);
  }
`

// Funciones auxiliares para colores
function lightenColor(color: string, percent: number): string {
  // Convertir hex a RGB y aclarar
  const num = parseInt(color.replace("#", ""), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = (num >> 8 & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
}

function darkenColor(color: string, percent: number): string {
  const num = parseInt(color.replace("#", ""), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) - amt
  const G = (num >> 8 & 0x00FF) - amt
  const B = (num & 0x0000FF) - amt
  return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
    (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
    (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1)
}

// Botón de ficha para el menú de tips
const ChipButton = styled.button<{ $chipColor: string; $amount: number }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(0,0,0,0.6);
  border: 2px solid ${props => props.$chipColor};
  border-radius: 20px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);

  &:hover {
    background: rgba(0,0,0,0.8);
    border-color: ${props => lightenColor(props.$chipColor, 20)};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }

  /* Móvil: ChipButtons más pequeños para el selector */
  @media (max-width: 768px) {
    padding: 4px 8px !important; /* Padding más pequeño */
    font-size: 11px !important; /* Fuente más pequeña */
    gap: 4px !important; /* Gap más pequeño */
    min-width: 50px !important; /* Ancho mínimo */
    border-radius: 16px !important; /* Bordes más pequeños */
  }

  /* Móvil muy pequeño */
  @media (max-width: 480px) {
    padding: 3px 6px !important; /* Padding aún más pequeño */
    font-size: 10px !important; /* Fuente más pequeña */
    gap: 3px !important; /* Gap más pequeño */
    min-width: 45px !important; /* Ancho mínimo más pequeño */
    border-radius: 14px !important; /* Bordes más pequeños */
  }

  &:active {
    transform: translateY(0);
  }

  span {
    color: ${props => lightenColor(props.$chipColor, 30)};
    font-weight: 700;
  }
`

// Mini chip que coincide con las del jackpot
const ChipDisplay = styled.div<{ $chipColor: string; $borderColor: string; $amount: number }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;

  /* MISMO gradiente que las PotChipToken */
  ${({ $amount }) => {
    switch ($amount) {
      case 1:    return css`
        background:
          radial-gradient(circle at 30% 30%, #ffffff 0%, #ffebee 40%, #ff6b6b 55%, #b71c1c 100%),
          radial-gradient(circle at 70% 70%, rgba(255,255,255,0.6) 0%, transparent 50%);
      `;
      case 5:   return css`
        background:
          radial-gradient(circle at 30% 30%, #ffffff 0%, #e3f2fd 40%, #6bb0ff 55%, #1c43b7 100%),
          radial-gradient(circle at 70% 70%, rgba(255,255,255,0.6) 0%, transparent 50%);
      `;
      case 10:   return css`
        background:
          radial-gradient(circle at 30% 30%, #ffffff 0%, #e8f5e8 40%, #59c46b 55%, #197a2c 100%),
          radial-gradient(circle at 70% 70%, rgba(255,255,255,0.6) 0%, transparent 50%);
      `;
      case 25:   return css`
        background:
          radial-gradient(circle at 30% 30%, #ffffff 0%, #fff8e1 40%, #ffe066 55%, #b38a00 100%),
          radial-gradient(circle at 70% 70%, rgba(255,255,255,0.6) 0%, transparent 50%);
      `;
    }
  }}

  /* Mismas sombras y bordes que las del jackpot */
  border: 1px solid rgba(255,215,0,0.3);
  box-shadow:
    inset 0 1px 2px rgba(255,255,255,0.4),
    inset 0 -1px 2px rgba(0,0,0,0.3),
    0 3px 6px rgba(0,0,0,0.3);

  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 1px rgba(0,0,0,0.8);
`

export default function Table({
  socket,
  roomId,
  onBack,
  me,
  selectedAvatar,
  skin,
  subscription
}: {
  socket: Socket,
  roomId: string,
  onBack: ()=>void,
  me: any,
  selectedAvatar?: string,
  skin?: 'green' | 'blue' | 'purple' | 'gold' | 'crystal' | 'red' | 'black' | 'rainbow' | 'neon' | 'sunset' | 'ocean' | 'lava' | 'ice' | 'forest' | 'royal' | 'galaxy' | 'diamond' | 'platinum' | 'emerald',
  subscription?: 'free' | 'bronze' | 'silver' | 'gold' | 'diamond'
}) {
  console.log('🎭 TABLE: Component rendered with selectedAvatar:', selectedAvatar)
  const [state, setState] = React.useState<TableState | null>(null)
  const [isSeated, setIsSeated] = React.useState(false)

  // Wrapper para onBack que también maneja levantarse del asiento
  const handleBackToLobby = React.useCallback(() => {
    console.log('🎯 TABLE: Back to Lobby clicked - leaving seat')
    setIsSeated(false) // Actualizar estado local
    onBack() // Llamar a la función original
  }, [onBack])
  const [showSeatSelector, setShowSeatSelector] = React.useState(false)
  const [hasShownSeatSelector, setHasShownSeatSelector] = React.useState(false)

  // Estado para el chat flotante
  const [showMobileChat, setShowMobileChat] = React.useState(false)
  const [unreadChatMessages, setUnreadChatMessages] = React.useState(0)
  const [showTipSelector, setShowTipSelector] = React.useState(false)

  // 👇 identifica tu userId único (múltiples respaldos para máxima compatibilidad)
  const myId = me?.id || localStorage.getItem('myUserId') || socket?.id || null




  // Ya no necesitamos mostrar automáticamente el selector modal
  // Los usuarios pueden hacer click en las sillas vacías directamente en la mesa

  // Sincronizar isSeated con el estado del servidor
  React.useEffect(() => {
    if (state && myId) {
      const playerOnServer = state.players.find(p => p.id === myId)
      if (playerOnServer && !isSeated) {
        console.log('🔄 SYNC: Player already seated, updating local state')
        setIsSeated(true)
      }
    }
  }, [state, myId, isSeated])

  // ======= POSICIONES/TAMAÑOS =======
  const DEALER_TOP = 3
  const POT_TOP = 35
  const COMMUNITY_TOP = window.innerWidth <= 768 ? 60 : 58 // Un poco más abajo en móvil
  const COMMUNITY_SCALE = window.innerWidth <= 768 ? 1.1 : 1.30 // Un poco más grande en móvil
  // ==================================

  const tableRef = React.useRef<HTMLDivElement>(null!)
  const prevRef = React.useRef<TableState | null>(null)
  const prevDealRef = React.useRef<TableState | null>(null)

  const [chips, setChips] = React.useState<
    {id:string,left:number,top:number,toLeft:number,toTop:number}[]
  >([])
  const [deals, setDeals] = React.useState<
    {id:string, toLeft:number, toTop:number, fromLeft:number, fromTop:number}[]
  >([])
  const [armSwing, setArmSwing] = React.useState(false)
  const [hasDealerImage, setHasDealerImage] = React.useState(true)

  // animaciones TIP
  const [tips, setTips] = React.useState<
    { id:string, toLeft:number, toTop:number, fromLeft:number, fromTop:number }[]
  >([])

  const fmtMoney = (n:number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  const [potPulse, setPotPulse] = React.useState(false)
  const prevPotRef = React.useRef(0)
  React.useEffect(() => {
    if (!state) return
    if (state.pot > prevPotRef.current) {
      setPotPulse(true)
      const t = setTimeout(() => setPotPulse(false), 500)
      prevPotRef.current = state.pot
      return () => clearTimeout(t)
    }
    prevPotRef.current = state.pot
  }, [state?.pot])

  // ========== FIXED SEATS ==========
  // Fixed seat system like real casino tables
  // Posiciones base para PC
  const FIXED_SEATS_PC = {
    1: { left: 50, top: 50 + 48, name: 'Seat 1 (Bottom)' },        // Seat 1: Bottom center
    2: { left: 50 - 43, top: 50 - 38, name: 'Seat 2 (Top-Left)' }, // Seat 2: Top-left
    3: { left: 50 + 43, top: 50 - 38, name: 'Seat 3 (Top-Right)' }, // Seat 3: Top-right
    4: { left: 50 - 43, top: 50 + 38, name: 'Seat 4 (Bottom-Left)' }, // Seat 4: Bottom-left
    5: { left: 50 + 43, top: 50 + 38, name: 'Seat 5 (Bottom-Right)' } // Seat 5: Bottom-right
  }

  // Posiciones para móvil - perfectamente simétricas
  const FIXED_SEATS_MOBILE = {
    1: { left: 50, top: 50 + 45, name: 'Seat 1 (Bottom)' },         // Seat 1: Centro abajo
    2: { left: 50 - 40, top: 50 - 35, name: 'Seat 2 (Top-Left)' }, // Seat 2: Simétrico
    3: { left: 50 + 40, top: 50 - 35, name: 'Seat 3 (Top-Right)' }, // Seat 3: Simétrico
    4: { left: 50 - 40, top: 50 + 28, name: 'Seat 4 (Bottom-Left)' }, // Seat 4: Más arriba para no pegar con 1
    5: { left: 50 + 40, top: 50 + 28, name: 'Seat 5 (Bottom-Right)' } // Seat 5: Más arriba para no pegar con 1
  }

  // Posiciones para móvil muy pequeño - perfectamente simétricas
  const FIXED_SEATS_SMALL_MOBILE = {
    1: { left: 50, top: 50 + 42, name: 'Seat 1 (Bottom)' },         // Seat 1: Centro abajo
    2: { left: 50 - 42, top: 50 - 32, name: 'Seat 2 (Top-Left)' }, // Seat 2: Simétrico con 4
    3: { left: 50 + 42, top: 50 - 32, name: 'Seat 3 (Top-Right)' }, // Seat 3: Simétrico con 5
    4: { left: 50 - 42, top: 50 + 25, name: 'Seat 4 (Bottom-Left)' }, // Seat 4: Aún más arriba
    5: { left: 50 + 42, top: 50 + 25, name: 'Seat 5 (Bottom-Right)' } // Seat 5: Aún más arriba
  }

  // Seleccionar posiciones según dispositivo
  const FIXED_SEATS = window.innerWidth <= 480 ? FIXED_SEATS_SMALL_MOBILE :
                     window.innerWidth <= 768 ? FIXED_SEATS_MOBILE :
                     FIXED_SEATS_PC

  function seatPos(seatNumber:number, N:number){
    // Use the REAL seat number (from server) for fixed positions
    // This ensures consistency between client and server

    if (FIXED_SEATS[seatNumber as keyof typeof FIXED_SEATS]) {
      return {
        left: FIXED_SEATS[seatNumber as keyof typeof FIXED_SEATS].left,
        top: FIXED_SEATS[seatNumber as keyof typeof FIXED_SEATS].top
      }
    }

    // Fallback para asientos no definidos
    return { left: 50, top: 50 + 48 }
  }

  // precarga dealer
  React.useEffect(() => {
    const img = new Image()
    img.onload = () => setHasDealerImage(true)
    img.onerror = () => setHasDealerImage(false)
    img.src = DEALER_SRC
  }, [])

  React.useEffect(()=> () => { prevRef.current = null; prevDealRef.current = null }, [])

  // fichas → POT
  React.useEffect(()=>{
    if (!state || !prevRef.current) { prevRef.current = state; return }
    const prev = prevRef.current
    const N = state.players.length
    for (let i=0;i<N;i++){
      const a = state.players[i], b = prev.players[i]
      if (!a || !b) continue
      const delta = (a.bet||0) - (b.bet||0)
      if (delta > 0){
        const p = seatPos(i,N)
        const id = Math.random().toString(36).slice(2)
        const chip = {id, left:p.left, top:p.top, toLeft:50, toTop:POT_TOP + 2}
        setChips(c=>[...c, chip])
        setTimeout(()=> setChips(c=> c.map(x=> x.id===id ? ({...x, left:x.toLeft, top:x.toTop}) : x)), 30)
        setTimeout(()=> setChips(c=>c.filter(x=>x.id!==id)), 800)
      }
    }
    prevRef.current = state
  },[state])

  // reparto
  React.useEffect(() => {
    if (!state) return
    const prev = prevDealRef.current
    prevDealRef.current = state

    const N = state.players.length
    if (!N) return

    const dealerLeft = 50
    const dealerTop  = DEALER_TOP

    const swingOnce = () => {
      setArmSwing(true)
      setTimeout(() => setArmSwing(false), 380)
    }

    const enqueueDeal = (toLeft:number, toTop:number) => {
      const id = Math.random().toString(36).slice(2)
      setDeals(arr => [...arr, { id, toLeft, toTop, fromLeft: dealerLeft, fromTop: dealerTop }])
      swingOnce()
      setTimeout(() => setDeals(arr => arr.filter(x => x.id !== id)), 380)
    }

    if (!prev) return

    if (state.street === 'preflop' && prev.street !== 'preflop') {
      state.players.forEach((p, i) => {
        const seatNumber = p.seat || 1
        const {left, top} = seatPos(seatNumber, N)
        enqueueDeal(left, top)
      })
    }

    if (state.community.length > prev.community.length) {
      enqueueDeal(50, COMMUNITY_TOP)
    }
  }, [state])

  // escuchar tips de otros
  React.useEffect(() => {
    const onTipped = (payload: { roomId:string, fromId:string, amount:number }) => {
      if (!state) return
      const N = state.players.length
      const fromPlayer = state.players.find(p => p.id === payload.fromId)
      if (!fromPlayer) return

      const seatNumber = fromPlayer.seat || 1
      const { left, top } = seatPos(seatNumber, N)
      const id = Math.random().toString(36).slice(2)
      setTips(arr => [...arr, {
        id,
        toLeft: 50,
        toTop:  DEALER_TOP,
        fromLeft: left,
        fromTop:  top
      }])
      setTimeout(() => setTips(arr => arr.filter(x => x.id !== id)), 540)
    }

    socket.on(DEALER_TIPPED, onTipped)
    return () => { socket.off(DEALER_TIPPED, onTipped) }
  }, [socket, state])

  React.useEffect(() => {
    console.log('🏓 TABLE: Setting up TABLE_STATE listener for socket:', socket.id)

    const onState = (s: TableState) => {
      console.log('🏓 TABLE: === PROCESSING STATE UPDATE ===')
      console.log('🎮 TABLE: Received state update:', {
        street: s.street,
        pot: s.pot,
        toAct: s.toAct,
        currentBet: s.currentBet,
        players: s.players?.length,
        activePlayers: s.players?.filter(p => !p.folded).length
      })
      console.log('🎲 TABLE: Full state details:', JSON.stringify(s, null, 2))
      console.log('👤 TABLE: My socket ID:', socket.id)
      console.log('👤 TABLE: Players in state:', s.players?.map(p => ({ id: p.id, name: p.name, seat: p.seat, isBot: p.isBot })))

      // Log current state before update
      console.log('📋 TABLE: Previous state street:', state?.street)

      // Si es la primera vez que recibimos estado y no hemos mostrado el selector, mostrarlo
      if (!state && !hasShownSeatSelector) {
        console.log('🎯 TABLE: First state update - showing seat selector')
        setShowSeatSelector(true)
        setHasShownSeatSelector(true)
      }

      // Preservar avatares en primera actualización de estado
      if (!state && s.players) {
        const mySelectedAvatar = localStorage.getItem('selectedAvatar')
        if (mySelectedAvatar) {
          const myPlayer = s.players.find(p => p.id === socket.id)
          if (myPlayer && !myPlayer.avatar) {
            console.log(`🎭 TABLE: Setting initial avatar for ${myPlayer.name}: ${mySelectedAvatar}`)
            myPlayer.avatar = mySelectedAvatar
          }
        }
      }

      // Enviar avatar al servidor si es necesario
      if (s.players) {
        const myPlayer = s.players.find(p => p.id === socket.id)
        const localAvatar = localStorage.getItem('selectedAvatar')

        if (myPlayer && localAvatar && myPlayer.avatar !== localAvatar) {
          console.log(`🎭 TABLE: Avatar mismatch detected. Server: "${myPlayer.avatar}", Local: "${localAvatar}". Sending update to server.`)
          socket.emit(ClientEvents.UPDATE_AVATAR, localAvatar)
        }
      }

      // Verificar si hubo un cambio de asiento
      if (state && s.players) {
        const myOldPlayer = state.players.find(p => p.id === socket.id)
        const myNewPlayer = s.players.find(p => p.id === socket.id)

        if (myOldPlayer && myNewPlayer && myOldPlayer.seat !== myNewPlayer.seat) {
          console.log('🔄 TABLE: Seat change detected!')
          console.log('🔄 TABLE: Old seat:', myOldPlayer.seat, 'New seat:', myNewPlayer.seat)
        }

        // Preservar información de avatares del estado anterior
        if (state.players && s.players) {
          s.players = s.players.map(newPlayer => {
            const oldPlayer = state.players.find(p => p.id === newPlayer.id)
            if (oldPlayer && oldPlayer.avatar && !newPlayer.avatar) {
              console.log(`🎭 TABLE: Preserving avatar for ${newPlayer.name}: ${oldPlayer.avatar}`)
              return { ...newPlayer, avatar: oldPlayer.avatar }
            }

            // También preservar el avatar del localStorage si es el usuario actual
            if (newPlayer.id === socket.id && !newPlayer.avatar) {
              const localAvatar = localStorage.getItem('selectedAvatar')
              if (localAvatar) {
                console.log(`🎭 TABLE: Restoring local avatar for ${newPlayer.name}: ${localAvatar}`)
                return { ...newPlayer, avatar: localAvatar }
              }
            }

            return newPlayer
          })
        }
      }

      setState(s)

      // Log after update
      console.log('✅ TABLE: State updated successfully')
      console.log('🏓 TABLE: === END STATE PROCESSING ===')
    }

    // Verificar que el evento esté definido
    console.log('🏓 TABLE: ServerEvents.TABLE_STATE:', ServerEvents.TABLE_STATE)

    socket.on(ServerEvents.TABLE_STATE, onState)
    console.log('🏓 TABLE: TABLE_STATE listener registered')

    return () => {
      console.log('🏓 TABLE: Removing TABLE_STATE listener')
      socket.off(ServerEvents.TABLE_STATE, onState)
    }
  }, [socket])

  function startHand() { socket.emit(ClientEvents.START_HAND, { roomId }) }

  if (!state) {
    return (
      <div style={{padding:12}}>
        <button onClick={handleBackToLobby}>Back</button>
        {/* Solo mostrar texto en PC */}
        {window.innerWidth > 768 && <span> Waiting for table state…</span>}
      </div>
    )
  }

  // Las sillas ahora están directamente en la mesa - no necesitamos pantalla modal

  const N = state.players.length || 1

  // 👇 nombre/seat del jugador local
  const mySeat = myId ? state.players.find(p => p.id === myId) : undefined
  const myName = mySeat?.name

  console.log('🎮 PLAYER INFO:', {
    myId: myId || 'null',
    mySeat: mySeat?.seat,
    myName,
    totalPlayers: state.players.length,
    isSeated,
    players: state.players.map(p => ({ id: p.id, name: p.name, seat: p.seat }))
  })

  // Mostrar TODAS las sillas (1-5) incluso las vacías
  const allSeats = Array.from({ length: state.seats }, (_, i) => {
    const seatNumber = i + 1
    const playerInSeat = state.players.find(p => p.seat === seatNumber)
    const { left, top } = seatPos(seatNumber, state.seats)
    const isDealer = playerInSeat && playerInSeat.seat === (state.dealerPos + 1)
    const isTurn = playerInSeat && state.toAct === playerInSeat.id
    const isMe = playerInSeat && !!myId && playerInSeat.id === myId
    const isEmpty = !playerInSeat



    // console.log(`🪑 Seat ${seatNumber}:`, { playerInSeat: !!playerInSeat, isMe, isEmpty, playerId: playerInSeat?.id, myId: myId || 'null' })

    return (
      <div
        key={`seat-${seatNumber}`}
        style={{
          position:'absolute',
          left:`${left}%`,
          top:`${top}%`,
          transform:'translate(-50%,-50%)',
          zIndex: 3,
        }}
      >
        {playerInSeat ? (
          // Silla ocupada - mostrar PlayerSeat
          (() => {
            console.log(`🎭 TABLE: Passing avatar to PlayerSeat for ${playerInSeat.name}:`, {
              selectedAvatar,
              isMe,
              playerId: playerInSeat.id
            })
            return (
              <PlayerSeat
                p={playerInSeat}
                isDealer={isDealer}
                isTurn={isTurn}
                isMe={isMe}
                street={state.street}
                avatarScale={isMe ? 1.15 : 1}
                selectedAvatar={selectedAvatar}
                subscription={subscription}
              />
            )
          })()
        ) : (
          // Silla vacía - mostrar silla clickable
          <div
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()

              console.log(`🖱️ SEAT ${seatNumber} CLICKED`)
              console.log(`🔍 DEBUG INFO:`, {
                seatNumber,
                myId: myId || 'NULL',
                isSeated,
                socketConnected: socket?.connected,
                socketId: socket?.id,
                hasState: !!state,
                playersCount: state?.players?.length || 0
              })

              if (!myId) {
                console.log('❌ BLOCKED: No socket connection (myId is null)')
                return
              }

              if (!socket?.connected) {
                console.log('❌ BLOCKED: Socket not connected')
                return
              }

              if (isSeated) {
                console.log(`🔄 CHANGING: Player moving to seat ${seatNumber}`)
              } else {
                console.log(`🆕 SITTING: Player sitting on seat ${seatNumber}`)
              }

              // Actualizar estado local
              setIsSeated(true)
              console.log('✅ LOCAL STATE: setIsSeated(true) completed')

              // Cambiar asiento real en el servidor
              console.log('🎯 REQUESTING: Seat change to server')
              console.log('🎯 EMITTING: changeSeat with:', { roomId, seatNumber })
              socket.emit('changeSeat', { roomId, seatNumber })
              console.log('✅ EMITTED: changeSeat event sent')

              // TODO: Implementar cambio de asiento real en el servidor
              // changeSeat(roomId, seatNumber)
            }}
            style={{
              width: 'clamp(60px, 12vw, 80px)',
              height: 'clamp(60px, 12vw, 80px)',
              borderRadius: '50%',
              background: myId ? 'rgba(84, 255, 138, 0.3)' : 'rgba(84, 255, 138, 0.1)',
              border: myId ? '2px solid #54ff8a' : '2px solid rgba(84, 255, 138, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: myId ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              boxShadow: myId ? '0 0 15px rgba(84, 255, 138, 0.4)' : 'none',
              padding: 'var(--spacing-xs)',
            }}
            onMouseEnter={(e) => {
              if (myId) {
                e.currentTarget.style.transform = 'scale(1.1)'
                e.currentTarget.style.boxShadow = '0 0 20px rgba(84, 255, 138, 0.6)'
              }
            }}
            onMouseLeave={(e) => {
              if (myId) {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 0 15px rgba(84, 255, 138, 0.4)'
              }
            }}
          >
            <div style={{
              textAlign: 'center',
              color: myId ? '#54ff8a' : 'rgba(84, 255, 138, 0.5)',
              fontSize: 'clamp(10px, 3vw, 12px)',
              fontWeight: 'bold',
              lineHeight: '1.2',
            }}>
              <div style={{
                fontSize: 'clamp(14px, 4vw, 18px)',
                marginBottom: 'var(--spacing-xs)'
              }}>🎲</div>
              <div>{seatNumber}</div>

              {/* Debug info - solo mostrar en desktop */}
              <div style={{
                fontSize: 'clamp(6px, 2vw, 8px)',
                opacity: 0.6,
                marginTop: 'var(--spacing-xs)',
                display: 'none'
              }}>
                myId: {myId ? myId.slice(0, 4) : 'null'}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  })

  type Denom = 5|10|25|50|100|500|1000
  const DENOMS: Denom[] = [1000, 500, 100, 50, 25, 10, 5]

  function chipsForAmount(amount: number): Denom[] {
    const out: Denom[] = []
    let rest = Math.max(0, Math.floor(amount))
    for (const d of DENOMS) {
      const cnt = Math.floor(rest / d)
      for (let i=0;i<cnt;i++) out.push(d)
      rest -= cnt * d
    }
    if (rest > 0) out.push(5)
    out.sort((a,b)=>a-b)
    return out
  }

  const potTokens = chipsForAmount(state.pot)
  const COLS = 3, ROWS = 6
  const CAPACITY = COLS * ROWS
  const needsOverflow = potTokens.length > CAPACITY
  const shown = needsOverflow ? potTokens.slice(0, CAPACITY - 1) : potTokens
  const overflowCount = needsOverflow ? (potTokens.length - (CAPACITY - 1)) : 0
  const twistDeg = (v:number) => ((v * 13) % 10) - 5

  // === acciones TIP con MONEDAS DE CASINO ===
  const tipQuick = [
    { amount: 1, label: '$1' },    // $1 - Rojo (definido en CSS)
    { amount: 5, label: '$5' },    // $5 - Azul (definido en CSS)
    { amount: 10, label: '$10' },  // $10 - Verde (definido en CSS)
    { amount: 25, label: '$25' }   // $25 - Amarillo (definido en CSS)
  ]
  const canTip = !!mySeat
  const sendTip = (amount:number) => {
    if (!canTip) return
    const a = Math.max(1, Math.floor(amount))
    if ((mySeat!.stack ?? 0) < a) return

    // Optimista: animación desde MI asiento con moneda de casino
    if (mySeat) {
      const seatNumber = mySeat.seat || 1
      const { left, top } = seatPos(seatNumber, state.players.length)
      const id = Math.random().toString(36).slice(2)
      setTips(arr => [...arr, {
        id,
        toLeft:50,
        toTop:DEALER_TOP,
        fromLeft:left,
        fromTop:top,
        amount: a,
        chipColor: '#ffffff',
        borderColor: '#d4af37',
        textColor: '#ffffff'
      }])
      setTimeout(() => setTips(arr => arr.filter(x => x.id !== id)), 540)
    }

    socket.emit(TIP_DEALER, { roomId, amount: a })
  }

  // Función que usa los mismos colores que las PotChipToken
  const getChipStyle = (amount: number) => {
    // Los colores ya están definidos en el CSS del CasinoChip
    return { color: '#ffffff', borderColor: '#d4af37', textColor: '#ffffff' }
  }

  return (
    <div style={{ position:'relative', zIndex:1 }}>
      <Backdrop $img={BG_SRC} />

      <TopBar className="table-topbar">
        <button onClick={handleBackToLobby}>Back to Lobby</button>
        <div>
          Room: {state.roomId} • <b>Pot {state.pot}</b> • Bet {state.currentBet} • Street {state.street} • To act {state.toAct?.slice(0,4)}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={startHand}>Start hand</button>
        </div>
      </TopBar>

      {/* Fila: mesa + chat */}
      <RoomRow style={{ marginTop: TABLE_OFFSET_CSS }}>
        <TableWrap>
          <TableTilt>
            <TableRail />
            <TableSurface ref={tableRef} skin={skin}>
              <FeltNoise skin={skin} />

              {hasDealerImage
                ? <DealerFigure src={DEALER_SRC} alt="Dealer" style={{ width: `${DEALER_IMG_W_PX}px`, top: `${DEALER_IMG_TOP_PX}px` }}/>
                : <DealerAvatarFallback>🧑‍💼</DealerAvatarFallback>}
              <DealerArm $swing={armSwing} />

              {/* TIP dock — controla la altura con --tipTop */}
              <TipDock>
                {/* Móvil: Solo botón TIP que abre selector */}
                {window.innerWidth <= 768 ? (
                  <>
                    <TipButton
                      onClick={() => setShowTipSelector(!showTipSelector)}
                      className={showTipSelector ? 'active' : ''}
                    >
                      TIP
                    </TipButton>
                    {showTipSelector && (
                      <TipMenu className="mobile-tip-selector">
                        {tipQuick.map(chip => (
                          <ChipButton
                            key={chip.amount}
                            $chipColor="#ffffff"
                            $amount={chip.amount}
                            onClick={() => {
                              sendTip(chip.amount)
                              setShowTipSelector(false) // Cerrar selector después de seleccionar
                            }}
                            title={`Tip $${chip.amount}`}
                          >
                            <ChipDisplay
                              $chipColor="#ffffff"
                              $borderColor="#d4af37"
                              $amount={chip.amount}
                            />
                            <span>{chip.label}</span>
                          </ChipButton>
                        ))}
                      </TipMenu>
                    )}
                  </>
                ) : (
                  /* PC: Diseño completo normal */
                  <>
                    <TipButton onClick={()=>sendTip(1)}>Tip</TipButton>
                    <TipMenu>
                      {tipQuick.map(chip => (
                        <ChipButton
                          key={chip.amount}
                          $chipColor="#ffffff"
                          $amount={chip.amount}
                          onClick={()=>sendTip(chip.amount)}
                          title={`Tip $${chip.amount}`}
                        >
                          <ChipDisplay
                            $chipColor="#ffffff"
                            $borderColor="#d4af37"
                            $amount={chip.amount}
                          />
                          <span>{chip.label}</span>
                        </ChipButton>
                      ))}
                    </TipMenu>
                  </>
                )}
              </TipDock>

              {/* Animaciones de TIP con MONEDAS DE CASINO */}
              {tips.map(t => (
                <CasinoChip
                  key={t.id}
                  $chipColor="#ffffff"
                  $borderColor="#d4af37"
                  $textColor="#ffffff"
                  $amount={t.amount || 1}
                  style={{
                    left: `${t.toLeft}%`,
                    top:  `${t.toTop}%`,
                    ['--fromX' as any]: `${t.fromLeft - t.toLeft}%`,
                    ['--fromY' as any]: `${t.fromTop  - t.toTop }%`,
                  } as React.CSSProperties}
                />
              ))}

              <PotHud $pulse={potPulse} style={{ top: `${POT_TOP}%` }}>
                <PotStackWrap>
                  {shown.map((d, i) => {
                    const col = Math.floor(i / ROWS)
                    const row = i % ROWS
                    const twist = twistDeg(i + d)
                    return (
                      <PotChipToken
                        key={`${d}-${i}`}
                        $denom={d}
                        style={{
                          ['--col' as any]: col,
                          ['--row' as any]: row,
                          ['--twist' as any]: `${twist}deg`,
                        } as React.CSSProperties}
                      />
                    )
                  })}
                  {overflowCount > 0 && (
                    <PotMore
                      style={{
                        ['--col' as any]: Math.floor(shown.length / ROWS),
                        ['--row' as any]: shown.length % ROWS,
                      } as React.CSSProperties}
                    >
                      +{overflowCount}
                    </PotMore>
                  )}
                </PotStackWrap>
                <PotLabel>POT</PotLabel>
                <PotAmount>{fmtMoney(state.pot)}</PotAmount>
              </PotHud>

              <div
                className="center-area community-cards"
                style={{
                  position:'absolute',
                  left:'50%',
                  top:`${COMMUNITY_TOP}%`,
                  transform:`translate(-50%,-50%) rotateX(0deg) scale(${COMMUNITY_SCALE})`,
                  transformOrigin:'center center',
                  display:'flex',
                  gap: window.innerWidth <= 768 ? 8 : 10, // Gap ligeramente más pequeño en móvil
                  zIndex: 6,
                  pointerEvents: 'none',
                }}
              >
                {state.community.map((c,i)=> <PlayingCard key={i} c={c} tableCard={true} />)}
              </div>

              {deals.map(d => (
                <FlyCard
                  key={d.id}
                  style={{
                    left: `${d.toLeft}%`,
                    top:  `${d.toTop}%`,
                    ['--fromX' as any]: `${d.fromLeft - d.toLeft}%`,
                    ['--fromY' as any]: `${d.fromTop  - d.toTop }%`,
                    zIndex: 7,
                  } as React.CSSProperties}
                />
              ))}

              {chips.map(c=> (
                <ChipDot key={c.id} style={{left:`${c.left}%`, top:`${c.top}%`}} />
              ))}

              {allSeats}
            </TableSurface>
          </TableTilt>
        </TableWrap>

        {/* Chat normal para desktop */}
        <div className="desktop-chat-table">
          <ChatPanel
            socket={socket}
            roomId={roomId}
            myId={myId || undefined}
            myName={myName || undefined}
            myAvatar={selectedAvatar}
            subscription={subscription}
          />
        </div>

        {/* Chat móvil flotante para mesa */}
        <div className="mobile-chat-table">
          {/* Botón flotante de chat */}
          {!showMobileChat && (
            <button
              className="mobile-chat-toggle-table"
              onClick={() => {
                setShowMobileChat(true);
                setUnreadChatMessages(0);
              }}
              aria-label="Open table chat"
            >
              💬
              {/* Badge para mensajes no leídos */}
              {unreadChatMessages > 0 && (
                <span className="chat-notification-badge-table">
                  {unreadChatMessages > 99 ? '99+' : unreadChatMessages}
                </span>
              )}
            </button>
          )}

          {/* Chat expandido */}
          {showMobileChat && (
            <div className="mobile-chat-expanded-table">
              <div className="mobile-chat-header-table">
                <h3>Table Chat</h3>
                <button
                  className="mobile-chat-close-table"
                  onClick={() => {
                    setShowMobileChat(false)
                  }}
                  aria-label="Close table chat"
                >
                  ✕
                </button>
              </div>

              <div className="mobile-chat-content-table">
                <ChatPanel
                  socket={socket}
                  roomId={roomId}
                  myId={myId || undefined}
                  myName={myName || undefined}
                  myAvatar={selectedAvatar}
                  subscription={subscription}
                />
              </div>
            </div>
          )}
        </div>
      </RoomRow>

      <ActionDock>
        <ActionBar socket={socket} state={state} me={me}/>
      </ActionDock>

      {/* Contenedor sticky para botones flotantes en móvil */}
      <div className="table-sticky-buttons">
        <div className="table-back-button">
          <button onClick={handleBackToLobby}>← Lobby</button>
        </div>

        <div className="table-start-button">
          <button onClick={startHand}>⚡ Start</button>
        </div>
      </div>
    </div>
  )
}
