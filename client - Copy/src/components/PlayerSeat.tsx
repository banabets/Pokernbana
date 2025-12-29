import PlayingCard from './PlayingCard'
type Player = import('../../../shared/protocol.ts').TableState['players'][number]

export default function PlayerSeat({ p, isDealer, isTurn }: { p: Player, isDealer?: boolean, isTurn?: boolean }) {
  return (
    <div className="seat">
      <div style={{display:'flex', alignItems:'center', marginBottom:6}}>
        <div className="avatar">{p.isBot ? '🤖' : '🙂'}</div>
        <div style={{fontWeight:800}}>{p.name}</div>
        <div style={{marginLeft:'auto'}} className="badge">Stack {p.stack}</div>
      </div>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        {(p.hand ?? []).map((c,i)=> <PlayingCard key={i} c={c}/> )}
        <div className="badge">Bet {p.bet}</div>
        {isTurn && <div style={{marginLeft:'auto'}}>⏳</div>}
      </div>
      {isDealer && <div className="dealer">D</div>}
    </div>
  )
}
