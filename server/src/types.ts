export type Round = 'waiting'|'preflop'|'flop'|'turn'|'river'|'showdown';

export interface Player {
  id: string;
  name: string;
  stack: number;
  bet: number;
  seat: number;
  isBot: boolean;
  connected: boolean;
  folded: boolean;
  ready: boolean;
  hand: string[];
}

export interface PublicPlayer {
  id: string;
  name: string;
  stack: number;
  bet: number;
  seat: number;
  isBot: boolean;
  connected: boolean;
  folded: boolean;
  ready: boolean;
  hand?: string[];
}

export interface TableState {
  id: string;
  players: PublicPlayer[];
  board: string[];
  pot: number;
  dealerIndex: number;
  currentIndex: number;
  round: Round;
  minRaise: number;
  currentBet: number;
  smallBlind: number;
  bigBlind: number;
  messages: {id:string,name:string,text:string,ts:number}[];
  winner?: {playerId:string, handName:string, bestHand:string[]};
  callAmountFor?: string;
}

// Utility types for error handling
export type ErrorWithMessage = {
  message: string
  stack?: string
}

export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  )
}

export function getErrorMessage(error: unknown): string {
  if (isErrorWithMessage(error)) {
    return error.message
  }
  return String(error)
}
