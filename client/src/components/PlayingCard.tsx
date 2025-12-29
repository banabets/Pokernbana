import React, { useEffect, useRef } from 'react'
import { useSound } from '../hooks/useSound'

interface PlayingCardProps {
  c: string
  tableCard?: boolean
  animate?: boolean
  delay?: number
  soundType?: 'deal' | 'flip' | 'collect'
}

export default function PlayingCard({ c, tableCard, animate = false, delay = 0, soundType = 'deal' }: PlayingCardProps) {
  const { playSound } = useSound()
  const cardRef = useRef<HTMLDivElement>(null)
  const hasPlayedSound = useRef(false)

  if (!c) return null

  // Handle 10 cards (3 characters: "10♠") vs regular cards (2 characters: "A♠")
  let rank: string
  let suit: string

  if (c.length === 3 && c.startsWith('10')) {
    // 10 card: "10♠" -> rank="10", suit="♠"
    rank = '10'
    suit = c[2]
  } else {
    // Regular card: "A♠" -> rank="A", suit="♠"
    rank = c[0]
    suit = c[1]
  }

  const red = suit === '♥' || suit === '♦'

  // 🎵 Efectos de sonido y animación
  useEffect(() => {
    if (!animate || hasPlayedSound.current) return

    const timer = setTimeout(() => {
      // Reproducir sonido según el tipo
      switch (soundType) {
        case 'deal':
          playSound('card_deal')
          break
        case 'flip':
          playSound('card_flip')
          break
        case 'collect':
          playSound('card_collect')
          break
      }

      // Animación de entrada
      if (cardRef.current) {
        cardRef.current.style.transform = 'scale(0) rotateY(180deg)'
        cardRef.current.style.opacity = '0'

        setTimeout(() => {
          if (cardRef.current) {
            cardRef.current.style.transition = 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
            cardRef.current.style.transform = 'scale(1) rotateY(0deg)'
            cardRef.current.style.opacity = '1'
          }
        }, 50)
      }

      hasPlayedSound.current = true
    }, delay)

    return () => clearTimeout(timer)
  }, [c, animate, delay, soundType, playSound])

  return (
    <div
      ref={cardRef}
      className={`card ${red ? 'red':'black'} ${tableCard ? 'table-card' : ''}`}
      style={{
        transform: animate ? 'scale(0) rotateY(180deg)' : undefined,
        opacity: animate ? 0 : undefined,
        transition: animate ? 'none' : undefined
      }}
    >
      <div style={{display:'grid', placeItems:'center'}}>
        <div className="r" style={{fontSize: tableCard ? 16 : 18}}>{rank}</div>
        <div style={{fontSize: tableCard ? 16 : 18}}>{suit}</div>
      </div>
    </div>
  )
}
