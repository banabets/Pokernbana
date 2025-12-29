import React from 'react'
export default function Chat({ onSend }:{ onSend:(t:string)=>void }){
  const [t,setT] = React.useState('')
  return (<div className="input">
    <input type="text" placeholder="Type a message" value={t} onChange={e=>setT(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ onSend(t); setT('') }}}/>
    <button className="btn primary" onClick={()=>{ onSend(t); setT('') }}>Send</button>
  </div>)
}