const SUITS = ['s','h','d','c'] as const
const RANKS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'] as const

export type Card = `${typeof RANKS[number]}${typeof SUITS[number]}`

export function freshDeck(): Card[] {
  const deck: Card[] = []
  for (const r of RANKS) for (const s of SUITS) deck.push(`${r}${s}` as Card)
  return deck
}

export function shuffle<T>(a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function toSolver(cards: Card[]): string[] { return cards }
