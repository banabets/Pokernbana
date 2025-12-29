import { Server } from 'socket.io'
import { Table } from '../game/engine.js'

// Very naive bot: acts randomly with some bias based on street
export function runBotTick(io: Server, table: Table) {
  // Placeholder. In real implementation, evaluate equity and choose action.
  // This file is here to guide where bot logic would live.
}