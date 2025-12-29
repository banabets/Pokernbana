import React from 'react'
export default function Lobby({ join, name, setName, players }:{ join: (n:string)=>void, name:string, setName:(s:string)=>void, players:any[]}){
  return (<div style={{padding:16, display:'grid', gap:12}}>
    <div><strong>Lobby</strong></div>
    <div style={{display:'grid', gap:8}}>
      <input type="text" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} />
      <button className="btn primary" onClick={()=>join(name || 'Player')}>Join Table</button>
    </div>
    <div style={{borderTop:'1px solid var(--line)', paddingTop:12}}>
      <strong>Players</strong>
      <div style={{display:'grid', gap:6, marginTop:8}}>
        {(players||[]).map((p:any)=>(<div key={p.id} className="player">{p.name} {p.ready ? '✅' : ''} {p.isBot ? '🤖' : ''} — stack {p.stack}</div>))}
      </div>
    </div>
    <p style={{opacity:.8}}>Tip: the layout is fijo para que lobby y chat no colapsen.</p>
  </div>)
}