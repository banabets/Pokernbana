import React from 'react'
import PlayingCard from './PlayingCard'

export default function CardTest() {
  // Test cards including 10 cards
  const testCards = [
    'A♠', 'K♠', 'Q♠', 'J♠', '10♠', '9♠', '8♠', '7♠', '6♠', '5♠', '4♠', '3♠', '2♠',
    'A♥', 'K♥', 'Q♥', 'J♥', '10♥', '9♥', '8♥', '7♥', '6♥', '5♥', '4♥', '3♥', '2♥',
    'A♦', 'K♦', 'Q♦', 'J♦', '10♦', '9♦', '8♦', '7♦', '6♦', '5♦', '4♦', '3♦', '2♦',
    'A♣', 'K♣', 'Q♣', 'J♣', '10♣', '9♣', '8♣', '7♣', '6♣', '5♣', '4♣', '3♣', '2♣'
  ]

  return (
    <div style={{ padding: '20px', background: '#1a1a1a', minHeight: '100dvh' }}>
      <h2 style={{ color: 'white', marginBottom: '20px' }}>Card Display Test</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
        gap: '10px',
        maxWidth: '800px'
      }}>
        {testCards.map((card, index) => (
          <div key={index} style={{ textAlign: 'center' }}>
            <PlayingCard c={card} />
            <div style={{ color: 'white', fontSize: '12px', marginTop: '5px' }}>
              {card}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '30px', color: 'white' }}>
        <h3>Test Results:</h3>
        <p>Check if all cards display correctly, especially the 10 cards (should show "10" not "T")</p>
      </div>
    </div>
  )
}

