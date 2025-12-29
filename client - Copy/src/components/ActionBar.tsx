import * as ProtocolRaw from '../../../shared/protocol.ts'
const Protocol: any = (ProtocolRaw as any).default ?? ProtocolRaw
const { ClientEvents } = Protocol
type TableState = import('../../../shared/protocol.ts').TableState
import type { Socket } from 'socket.io-client'
import React from 'react'

export default function ActionBar({ socket, state }: { socket: Socket, state: TableState }) {
  const me = state.players.find(p => p.id === socket.id)
  if (!me) return null
  const myTurn = state.toAct === socket.id
  const toCall = Math.max(0, (state.currentBet || 0) - (me.bet || 0))
  const [amt, setAmt] = React.useState(Math.max(state.minRaise, toCall || state.bigBlind))
  React.useEffect(()=> setAmt(Math.max(state.minRaise, toCall || state.bigBlind)), [toCall, state.minRaise, state.bigBlind])

  return (
    <div className="actionbar">
      <button className="pill" disabled={!myTurn} onClick={()=> socket.emit(ClientEvents.PLAYER_ACTION, { roomId: state.roomId, action: 'fold' })}>FOLD</button>
      {toCall <= 0
        ? <button className="pill" disabled={!myTurn} onClick={()=> socket.emit(ClientEvents.PLAYER_ACTION, { roomId: state.roomId, action: 'check' })}>CHECK</button>
        : <button className="pill" disabled={!myTurn} onClick={()=> socket.emit(ClientEvents.PLAYER_ACTION, { roomId: state.roomId, action: 'call' })}>CALL {toCall}</button>
      }
      <input type="number" disabled={!myTurn} value={amt} min={Math.max(state.minRaise, toCall || state.bigBlind)} onChange={e=>setAmt(Number(e.target.value))}/>
      {toCall <= 0
        ? <button className="pill" disabled={!myTurn} onClick={()=> socket.emit(ClientEvents.PLAYER_ACTION, { roomId: state.roomId, action: 'bet', amount: amt })}>BET</button>
        : <button className="pill" disabled={!myTurn} onClick={()=> socket.emit(ClientEvents.PLAYER_ACTION, { roomId: state.roomId, action: 'raise', amount: amt })}>RAISE</button>
      }
      <button className="pill" disabled={!myTurn} onClick={()=> socket.emit(ClientEvents.PLAYER_ACTION, { roomId: state.roomId, action: 'allin' })}>ALL-IN</button>
    </div>
  )
}
