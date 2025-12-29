export default function PlayingCard({ c }: { c: string }) {
  if (!c) return null
  const rank = c[0]
  const suit = c[1]
  const red = suit === '♥' || suit === '♦'
  return (
    <div className={`card ${red ? 'red':'black'}`}>
      <div style={{display:'grid', placeItems:'center'}}>
        <div className="r" style={{fontSize:18}}>{rank}</div>
        <div style={{fontSize:18}}>{suit}</div>
      </div>
    </div>
  )
}
