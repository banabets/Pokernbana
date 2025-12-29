import React from 'react'
import { io, Socket } from 'socket.io-client'
type State = any
let socket: Socket | null = null
export function useSocket(){
  const [state,setState] = React.useState<State>({ players:[], board:[], messages:[], round:'waiting', pot:0 })
  const [me,setMe] = React.useState<any>(null)
  React.useEffect(() => {
    if (!socket) {
      socket = io('http://localhost:4000', { transports:['websocket'] })
      socket.on('state', (s:State) => {
        setState(s)
        if (me) { const mine = s.players?.find((p:any)=>p.id===me.id); setMe(mine || me) }
      })
    }
    return () => {}
  }, [])
  function join(name:string){
    socket?.emit('join', name)
    const sync = (s:State) => {
      const found = s.players?.slice().reverse().find((p:any)=>p.name===name && !p.isBot)
      if (found) { setMe(found); socket?.off('state', sync as any) }
    }
    socket?.on('state', sync as any)
  }
  function ready(){ socket?.emit('ready') }
  function sendChat(text:string){ if(text.trim()) socket?.emit('chat:send', text) }
  function act(payload:any){ socket?.emit('action', payload) }
  return { state, me, join, ready, sendChat, act }
}