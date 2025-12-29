import React from 'react'
import type { Socket } from 'socket.io-client'
import * as ProtocolRaw from '../../../shared/protocol.ts'
const Protocol: any = (ProtocolRaw as any).default ?? ProtocolRaw
const { ClientEvents, ServerEvents } = Protocol

export default function ChatDock({ socket, avatar }: { socket: Socket, avatar: string }){
  const [chat, setChat] = React.useState<{id:string;userId:string;userName:string;text:string;ts:number}[]>([])
  const [v, setV] = React.useState('')
  const me = socket.id

  React.useEffect(()=>{
    const onMsg = (msg:any)=> setChat(prev => [...prev.slice(-200), msg])
    socket.on(ServerEvents.CHAT, onMsg)
    return ()=> socket.off(ServerEvents.CHAT, onMsg)
  }, [socket])

  function send(t: string){
    const s = t.trim()
    if(!s) return
    socket.emit(ClientEvents.SEND_CHAT, s)
    setV('')
  }

  const quick = ['👏','🔥','😎','🎉','🤑']
  return (
    <aside className="chat-dock">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6}}>
        <b>Lobby Chat</b>
        <div style={{display:'flex', alignItems:'center', gap:6}}>
          <div className="avatar" style={{width:28,height:28}}>{avatar}</div>
        </div>
      </div>
      <div className="chat-list">
        {chat.map(m=>{
          const isMe = m.userId === me
          return (
            <div key={m.id} className="chat-row" style={{justifyContent: isMe ? 'flex-end' : 'flex-start'}}>
              {!isMe && <div className="avatar" style={{width:28,height:28}}>{m.userName.slice(0,1)}</div>}
              <div className={"chat-msg"+(isMe?" me":"")}>
                <b style={{opacity:.9}}>{isMe? 'You' : m.userName}</b>: {m.text}
              </div>
            </div>
          )
        })}
      </div>
      <div className="chat-emoji">
        {quick.map(e => <button key={e} className="pill" onClick={()=>send(e)}>{e}</button>)}
      </div>
      <div className="chat-input">
        <input value={v} placeholder="Type a message…" onChange={e=>setV(e.target.value)} onKeyDown={e=> e.key==='Enter' && send(v)}/>
        <button className="pill" onClick={()=>send(v)}>Send</button>
      </div>
    </aside>
  )
}
