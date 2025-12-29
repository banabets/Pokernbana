import React from 'react'
import { io, Socket } from 'socket.io-client'
import * as ProtocolRaw from '../../shared/protocol.ts'
const Protocol: any = (ProtocolRaw as any).default ?? ProtocolRaw
const { ServerEvents, ClientEvents } = Protocol
type LobbyRoomSummary = import('../../shared/protocol.ts').LobbyRoomSummary
type LeaderboardRow = import('../../shared/protocol.ts').LeaderboardRow

import Table from './components/Table'
import ChatDock from './components/ChatDock'

const SERVER_URL = (import.meta as any).env.VITE_SERVER_URL || 'http://localhost:5174'

function TopBar({onCreate, onStore, onLeaderboard, onChat, balance, avatar}: {onCreate: ()=>void, onStore: ()=>void, onLeaderboard: ()=>void, onChat: ()=>void, balance:number, avatar:string}) {
  return (
    <div className="topbar">
      <div className="title">Hold'em Lobby</div>
      <div className="actions">
        <span className="balance-badge">Balance: ${balance}</span>
        <div className="avatar" style={{marginLeft:8}}>{avatar}</div>
        <button className="pill" onClick={onCreate}>+ Create Room</button>
        <button className="pill" onClick={onLeaderboard}>Leaderboard</button>
        <button className="pill" onClick={onStore}>Store</button>
        <button className="pill" onClick={onChat}>Chat</button>
      </div>
    </div>
  )
}

export default function App(){
  const [socket, setSocket] = React.useState<Socket | null>(null)
  const [rooms, setRooms] = React.useState<LobbyRoomSummary[]>([])
  const [roomId, setRoomId] = React.useState<string | null>(null)
  const [openStore, setOpenStore] = React.useState(false)
  const [openLb, setOpenLb] = React.useState(false)
  const [openChat, setOpenChat] = React.useState(false)
  const [lb, setLb] = React.useState<LeaderboardRow[]>([])

  // Appearance / profile state (single declarations)
  const [skin,setSkin] = React.useState<'green'|'blue'|'purple'>('green')
  const [myBalance,setMyBalance] = React.useState(2000)
  const [avatar,setAvatar] = React.useState('🙂')
  const [theme,setTheme] = React.useState<'casino'|'beach'|'space'>('casino')

  React.useEffect(()=>{
    const el = document.body
    for (const t of ['theme-casino','theme-beach','theme-space']) el.classList.remove(t)
    el.classList.add('theme-'+theme)
  },[theme])

  React.useEffect(()=>{
    const s = io(SERVER_URL, { transports: ['websocket'] })
    setSocket(s)
    s.on('connect', () => s.emit(ClientEvents.JOIN_LOBBY))
    s.on(ServerEvents.LOBBY_STATE, (list: LobbyRoomSummary[]) => setRooms(list))
    s.on(ServerEvents.LEADERBOARD, (rows: LeaderboardRow[]) => setLb(rows))
    return () => { s.disconnect() }
  }, [])

  if (!socket) return <div style={{padding:20}}>Connecting…</div>

  function createRoom(){ socket.emit(ClientEvents.CREATE_ROOM) }
  function join(rid: string){ setRoomId(rid); socket.emit(ClientEvents.JOIN_ROOM, { roomId: rid }) }

  if (roomId) return <Table socket={socket} roomId={roomId} onBack={()=> setRoomId(null)} />

  return (
    <div style={{height:'100%'}}>
      <TopBar balance={myBalance} avatar={avatar} onCreate={createRoom} onStore={()=>setOpenStore(true)} onLeaderboard={()=>{socket.emit(ClientEvents.GET_LEADERBOARD); setOpenLb(true)}} onChat={()=>setOpenChat(true)} />
      <div className="lobby-grid">
        <div className="lobby-main">
          <div className="lb-preview">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <b>Top 3</b>
              <button className="pill" onClick={()=>{socket.emit(ClientEvents.GET_LEADERBOARD); setOpenLb(true)}}>Ver completo</button>
            </div>
            <div>
              {lb.slice(0,3).map((row,i)=> (
                <div key={row.id} className="lb-row">
                  <span>#{i+1} {row.name}</span>
                  <span>${row.earnings}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-list">
            {rooms.map(r=>(
              <div key={r.roomId} className="room-card">
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:10}}>
                  <div><b>{r.name}</b><div style={{opacity:.8, fontSize:12}}>Blinds {r.smallBlind}/{r.bigBlind}</div></div>
                  <div className="badge">{r.players}/{r.seats}</div>
                </div>
                <div style={{display:'flex', gap:8}}>
                  <button onClick={()=>join(r.roomId)} className="pill">Join</button>
                  <button className="pill" onClick={()=>{socket.emit(ClientEvents.START_HAND,{roomId:r.roomId}); setRoomId(r.roomId)}}>Quick Start</button>
                </div>
                <div className="room-avatars">
                  {Array.from({length:r.players}).map((_,i)=>(<div key={i} className="av">🙂</div>))}
                  {r.hasBots && <div className="av">🤖</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <ChatDock socket={socket} avatar={avatar}/>
      </div>

      {openLb && (
        <div className="modal" onClick={()=>setOpenLb(false)}>
          <div className="box" onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <b>Leaderboard</b><button onClick={()=>setOpenLb(false)}>Close</button>
            </div>
            <ol>
              {lb.map((row,i)=>(
                <li key={row.id} style={{display:'flex', gap:8, justifyContent:'space-between'}}>
                  <span>#{i+1} {row.name}</span>
                  <span>${row.earnings}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {openStore && (
        <div className="modal" onClick={()=>setOpenStore(false)}>
          <div className="box" onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <b>Store</b><button onClick={()=>setOpenStore(false)}>Close</button>
            </div>
            <div><b>Skins de mesa</b></div>
            <div style={{display:'flex', gap:8, marginTop:8}}>
              <button className="pill" onClick={()=>setSkin('green')}>Green</button>
              <button className="pill" onClick={()=>setSkin('blue')}>Blue</button>
              <button className="pill" onClick={()=>setSkin('purple')}>Purple</button>
            </div>
            <div style={{marginTop:12}}><b>Avatar</b></div>
            <div style={{display:'flex', gap:8, marginTop:8}}>
              {['🙂','😎','🤖','🐸','🐱','🍊','🦄','👻'].map(a => <button key={a} className="pill" onClick={()=>setAvatar(a)}>{a}</button>)}
            </div>
            <div style={{marginTop:12}}><b>Fondo del Lobby</b></div>
            <div style={{display:'flex', gap:8, marginTop:8}}>
              <button className="pill" onClick={()=>setTheme('casino')}>Casino</button>
              <button className="pill" onClick={()=>setTheme('beach')}>Beach</button>
              <button className="pill" onClick={()=>setTheme('space')}>Space</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
