import React from 'react'
import type { Socket } from 'socket.io-client'
import * as ProtocolRaw from '../../../shared/protocol.ts'
const Protocol: any = (ProtocolRaw as any).default ?? ProtocolRaw
const { ServerEvents, ClientEvents } = Protocol
type TableState = import('../../../shared/protocol.ts').TableState
import PlayingCard from './PlayingCard'
import PlayerSeat from './PlayerSeat'
import ActionBar from './ActionBar'

export default function Table({ socket, roomId, onBack }: { socket: Socket, roomId: string, onBack: ()=>void }) {
  const [state, setState] = React.useState<TableState | null>(null)

  const tableRef = React.useRef<HTMLDivElement>(null as any)
  const prevRef = React.useRef<TableState | null>(null)
  const [chips, setChips] = React.useState<{id:string,left:number,top:number,toLeft:number,toTop:number}[]>([])

  function seatPos(i:number, N:number){
    const r = 36, startDeg = 90
    const theta = (startDeg - i*(360/N)) * Math.PI/180
    const left = 50 + r*Math.cos(theta)
    const top  = 50 + r*Math.sin(theta)
    return {left, top}
  }

  React.useEffect(()=>{
    return () => { prevRef.current = null }
  },[])

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
        const chip = {id, left:p.left, top:p.top, toLeft:50, toTop:16}
        setChips(c=>[...c, chip])
        // auto remove later
        setTimeout(()=> setChips(c=>c.filter(x=>x.id!==id)), 750)
        // trigger animation to target on next tick
        setTimeout(()=> setChips(c=> c.map(x=> x.id===id ? {...x, left:x.toLeft, top:x.toTop} : x)), 30)
      }
    }
    prevRef.current = state
  },[state])


  React.useEffect(() => {
    const onState = (s: TableState) => setState(s)
    socket.on(ServerEvents.TABLE_STATE, onState)
    return () => { socket.off(ServerEvents.TABLE_STATE, onState) }
  }, [socket])

  function startHand() { socket.emit(ClientEvents.START_HAND, { roomId }) }

  if (!state) return <div style={{padding:12}}><button onClick={onBack}>Back</button> Waiting for table state…</div>

  const N = state.players.length || 1
  const r = 36
  const startDeg = 90
  const seats = state.players.map((p, i) => {
    const theta = (startDeg - i*(360/N)) * Math.PI/180
    const left = 50 + r*Math.cos(theta)
    const top  = 50 + r*Math.sin(theta)
    const isDealer = i === state.dealerPos
    const isTurn = state.toAct === p.id
    return (
      <div key={p.id} style={{position:'absolute', left:`${left}%`, top:`${top}%`, transform:'translate(-50%,-50%)'}}>
        <PlayerSeat p={p} isDealer={isDealer} isTurn={isTurn}/>
      </div>
    )
  })

  return (
    <div className="table-wrap">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6}}>
        <button onClick={onBack}>Back</button>
        <div style={{opacity:.95}}>
          Room: {state.roomId} • <b>Pot {state.pot}</b> • Bet {state.currentBet} • Street {state.street} • To act {state.toAct?.slice(0,4)}
        </div>
        <button onClick={startHand}>Start hand</button>
      </div>

      <div ref={tableRef} className={`table-oval skin-green`}>
        <div className="dealer-icon">💛</div><div className="pot">POT {state.pot}</div>
        <div className="center-area">{state.community.map((c,i)=> <PlayingCard key={i} c={c}/>)}</div>
        {seats}
        {chips.map(c=> (
          <div key={c.id} className='chip' style={{left:`${c.left}%`, top:`${c.top}%`}}/>
        ))}
        <ActionBar socket={socket} state={state}/>
      </div>
    </div>
  )
}
