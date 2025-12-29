declare module 'poker-evaluator' {
  export interface HandResult {
    handType: number
    handRank: number
    value: number
    handName: string
  }

  export function evalHand(cards: string[]): HandResult
  export function getHandName(handType: number): string
}
