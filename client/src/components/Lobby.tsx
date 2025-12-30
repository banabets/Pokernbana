// client/src/components/Lobby.tsx
import React from 'react'
import styled, { keyframes, css } from 'styled-components'
import type { Socket } from 'socket.io-client'
import * as ProtocolRaw from 'shared/protocol'
import BrandingTitle from './BrandingTitle'
import { useSound } from '../hooks/useSound'
import SoundSettings from './SoundSettings'
const Protocol: any = (ProtocolRaw as any).default ?? ProtocolRaw
const { ServerEvents = {}, ClientEvents = {} } = Protocol
type LobbyRoomSummary = import('../shared/protocol').LobbyRoomSummary

// ==== fallbacks de eventos (por si no existen en protocol) ====
const JOIN_LOBBY       = ClientEvents.JOIN_LOBBY       ?? 'JOIN_LOBBY'
const CREATE_ROOM      = ClientEvents.CREATE_ROOM      ?? 'CREATE_ROOM'
const JOIN_ROOM        = ClientEvents.JOIN_ROOM        ?? 'JOIN_ROOM'
const GET_ONLINE_COUNT = ClientEvents.GET_ONLINE_COUNT ?? 'GET_ONLINE_COUNT'
const ONLINE_COUNT     = ServerEvents.ONLINE_COUNT     ?? 'ONLINE_COUNT'
const LOBBY_STATE      = ServerEvents.LOBBY_STATE      ?? 'LOBBY_STATE'
const GET_LEADERBOARD  = ClientEvents.GET_LEADERBOARD  ?? 'GET_LEADERBOARD'
const LEADERBOARD      = ServerEvents.LEADERBOARD      ?? 'LEADERBOARD'

// === Estilos Mejorados ===
const float = keyframes`
  0%,100% { transform: translateY(0) rotate(0deg) }
  50%     { transform: translateY(-8px) rotate(5deg) }
`

const pulse = keyframes`
  0%,100% { box-shadow: 0 0 0 0 rgba(84,255,138,0), 0 0 20px rgba(0,0,0,0.3) }
  50%     { box-shadow: 0 0 0 8px rgba(84,255,138,.1), 0 0 30px rgba(84,255,138,0.2) }
`

const shimmer = keyframes`
  0% { background-position: -200% 0 }
  100% { background-position: 200% 0 }
`

const glow = keyframes`
  0%,100% { filter: drop-shadow(0 0 10px rgba(84,255,138,0.3)) }
  50% { filter: drop-shadow(0 0 20px rgba(84,255,138,0.6)) }
`

const Wrap = styled.div`
  min-height: 100dvh; /* Dynamic viewport height */
  padding: 20px;
  background:
    radial-gradient(ellipse 200% 100% at 50% 0%, #0a1a0f 0%, #0d2518 25%, #0f2a1d 50%, #0a1a0f 100%),
    linear-gradient(135deg, rgba(84,255,138,0.03) 0%, rgba(0,160,255,0.02) 50%, rgba(255,215,0,0.01) 100%),
    linear-gradient(45deg, rgba(255,0,150,0.01) 0%, rgba(255,100,0,0.01) 100%);
  color: #eaf5ea;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  font-size: 16px;
  line-height: 1.5;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(circle at 20% 80%, rgba(84,255,138,0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(0,160,255,0.03) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(255,215,0,0.02) 0%, transparent 50%);
    pointer-events: none;
    z-index: -1;
  }

  &::after {
    content: '';
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(84,255,138,0.02) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    z-index: -1;
    animation: ${pulse} 8s ease-in-out infinite;
  }
`

const Top = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 12px;
  max-width: 1200px;
  margin: 0 auto 14px;
`

const Title = styled.h1`
  margin: 0;
  font-size: clamp(28px, 3vw, 42px);
  font-weight: 900;
  letter-spacing: .8px;
  display: flex;
  align-items: center;
  gap: 15px;
  background: linear-gradient(135deg, #54ff8a, #00a0ff, #ffd700);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${shimmer} 4s ease-in-out infinite;
  text-shadow: 0 0 30px rgba(84,255,138,0.3);

  &::before{
    content:'🎲';
    font-size: 2.5em;
    animation: ${glow} 2s ease-in-out infinite;
  }

  &::after{
    content:'';
    width: 20px; height: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #54ff8a, #00a0ff, #ffd700);
    animation: ${float} 3s ease-in-out infinite;
    filter: drop-shadow(0 0 15px rgba(84,255,138,0.5));
    box-shadow: 0 0 20px rgba(84,255,138,0.3);
  }
`

const Online = styled.div`
  padding: 8px 14px;
  border-radius: 25px;
  background: linear-gradient(135deg, rgba(84,255,138,0.1), rgba(0,160,255,0.1));
  border: 2px solid rgba(84,255,138,0.3);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  font-size: 14px;
  letter-spacing: 0.5px;
  color: #54ff8a;
  text-shadow: 0 0 10px rgba(84,255,138,0.5);
  box-shadow: 0 4px 15px rgba(84,255,138,0.2);
  animation: ${pulse} 3s ease-in-out infinite;
  backdrop-filter: blur(10px);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;

  &::before {
    content: '👥';
    margin-right: 6px;
  }
`

const CreateBtn = styled.button`
  height: 56px;
  padding: 0 24px;
  border-radius: 28px;
  background: linear-gradient(135deg, #54ff8a, #00a0ff, #ffd700);
  background-size: 200% 200%;
  border: none;
  color: #0a1a0f;
  font-weight: 900;
  font-size: 16px;
  letter-spacing: 0.5px;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(84,255,138,0.4);
  animation: ${shimmer} 3s ease-in-out infinite;
  transition: all 0.3s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 12px 35px rgba(84,255,138,0.6);
    filter: brightness(1.1);
  }

  &:active {
    transform: translateY(-1px) scale(1.02);
  }

  &::before {
    content: '⚡';
    margin-right: 8px;
    font-size: 18px;
  }
`

const Toolbar = styled.div`
  max-width: 1200px;
  margin: 0 auto 12px;
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 10px;
  align-items: center;
`

const Search = styled.input`
  height: 38px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(0,0,0,.3);
  color: #fff;
  outline: none;
`

const Select = styled.select`
  height: 38px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(0,0,0,.3);
  color: #fff;
  outline: none;
`

const Grid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
`

const Card = styled.div<{ $busy?: boolean }>`
  position: relative;
  border-radius: 20px;
  padding: 16px;
  background:
    linear-gradient(135deg, rgba(84,255,138,0.1) 0%, rgba(0,160,255,0.05) 50%, rgba(255,215,0,0.03) 100%),
    radial-gradient(ellipse at top, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%),
    linear-gradient(180deg, rgba(16,65,39,0.8) 0%, rgba(10,44,26,0.7) 100%);
  border: 2px solid rgba(84,255,138,0.2);
  box-shadow:
    0 20px 40px rgba(0,0,0,0.4),
    0 0 30px rgba(84,255,138,0.1),
    inset 0 1px 0 rgba(255,255,255,0.1);
  transition: all 0.3s ease;
  transform: perspective(800px) rotateX(0deg) rotateY(0deg);
  will-change: transform;
  backdrop-filter: blur(10px);
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  font-size: 14px;
  color: #eaf5ea;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #54ff8a, #00a0ff, #ffd700);
    opacity: 0.7;
  }

  &:hover{
    transform: perspective(800px) rotateX(5deg) rotateY(-5deg) translateY(-8px);
    box-shadow:
      0 30px 60px rgba(0,0,0,0.5),
      0 0 50px rgba(84,255,138,0.3),
      inset 0 1px 0 rgba(255,255,255,0.15);
    border-color: rgba(84,255,138,0.4);
  }

  ${({ $busy }) => $busy && css`
    &::after{
      content:'🔴 EN JUEGO';
      position:absolute; top:12px; right:12px;
      font-size: 10px; font-weight: 900;
      padding: 6px 10px; border-radius: 15px;
      background: linear-gradient(135deg, #ff4757, #ff3838);
      color: white;
      text-shadow: 0 0 5px rgba(0,0,0,0.5);
      box-shadow: 0 2px 8px rgba(255,71,87,0.3);
      animation: ${pulse} 2s ease-in-out infinite;
      letter-spacing: 0.5px;
    }
  `}
`

const TablePreview = styled.div`
  height: 130px;
  margin-bottom: 12px;
  border-radius: 16px;
  background:
    radial-gradient(ellipse at center, rgba(84,255,138,0.1) 0%, rgba(0,160,255,0.05) 50%, rgba(255,215,0,0.03) 100%),
    linear-gradient(135deg, #0f3f20 0%, #0a2515 50%, #0f3f20 100%);
  border: 2px solid rgba(84,255,138,0.2);
  box-shadow:
    inset 0 15px 30px rgba(0,0,0,0.5),
    0 8px 20px rgba(84,255,138,0.1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(5px);

  /* Mesa de poker estilizada */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 40px;
    background: radial-gradient(ellipse, rgba(139,69,19,0.8) 0%, rgba(101,67,33,0.9) 100%);
    border-radius: 50%;
    box-shadow: 0 4px 15px rgba(0,0,0,0.4);
  }

  /* Chips de poker animadas */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(circle at 25% 30%, rgba(84,255,138,0.3) 2px, transparent 3px),
      radial-gradient(circle at 75% 70%, rgba(0,160,255,0.3) 2px, transparent 3px),
      radial-gradient(circle at 50% 50%, rgba(255,215,0,0.3) 2px, transparent 3px);
    animation: ${float} 4s ease-in-out infinite;
  }
`

const Row = styled.div`
  display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 8px;
`
const Meta = styled.div`
  font-size: 14px; opacity: .9;
  b { font-size: 16px; font-weight: 700; }
`
const Join = styled.button`
  height: 44px; padding: 0 20px; border-radius: 22px;
  border: none; cursor: pointer; font-weight: 800; color: #0a1a0f;
  background: linear-gradient(135deg, #54ff8a, #00a0ff);
  background-size: 200% 200%;
  animation: ${shimmer} 3s ease-in-out infinite;
  box-shadow: 0 4px 15px rgba(84,255,138,0.3);
  transition: all 0.3s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  font-size: 16px;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover{
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 20px rgba(84,255,138,0.5);
    filter: brightness(1.1);
  }

  &:active {
    transform: translateY(0) scale(1.02);
  }

  &::before {
    content: '🎯';
    margin-right: 6px;
  }
`

const Pill = styled.span`
  display:inline-flex; align-items:center; gap:6px;
  padding: 6px 12px; border-radius: 20px; font-size:12px; font-weight:700;
  background: linear-gradient(135deg, rgba(84,255,138,0.1), rgba(0,160,255,0.1));
  border: 2px solid rgba(84,255,138,0.2);
  color: #54ff8a;
  text-shadow: 0 0 5px rgba(84,255,138,0.3);
  box-shadow: 0 2px 8px rgba(84,255,138,0.15);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(84,255,138,0.25);
    border-color: rgba(84,255,138,0.4);
  }
`

const Board = styled.div`
  position: sticky;
  top: 20px;
  align-self: start;
  padding: 16px;
  border-radius: 20px;
  background:
    linear-gradient(135deg, rgba(84,255,138,0.1) 0%, rgba(0,160,255,0.05) 100%),
    rgba(0,0,0,0.3);
  border: 2px solid rgba(84,255,138,0.2);
  box-shadow:
    0 20px 40px rgba(0,0,0,0.4),
    0 0 30px rgba(84,255,138,0.1),
    inset 0 1px 0 rgba(255,255,255,0.1);
  min-width: 280px;
  backdrop-filter: blur(15px);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      0 25px 50px rgba(0,0,0,0.5),
      0 0 40px rgba(84,255,138,0.2),
      inset 0 1px 0 rgba(255,255,255,0.15);
    border-color: rgba(84,255,138,0.3);
  }
`

const BoardTitle = styled.h3`
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 0.8px;
  color: #54ff8a;
  text-shadow: 0 0 10px rgba(84,255,138,0.5);
  background: linear-gradient(135deg, #54ff8a, #00a0ff);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${shimmer} 3s ease-in-out infinite;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;

  &::before {
    content: '🏆';
    margin-right: 8px;
    font-size: 18px;
    animation: ${glow} 2s ease-in-out infinite;
  }
`

const Flex = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: 14px;
  grid-template-columns: 1fr minmax(260px, 300px);
  @media (max-width: 1000px){
    grid-template-columns: 1fr;
  }
`

const LBRow = styled.div`
  display:flex; justify-content:space-between; gap: 12px; padding: 8px 12px;
  margin: 4px 0;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(84,255,138,0.05) 0%, rgba(0,160,255,0.03) 100%);
  border: 1px solid rgba(84,255,138,0.1);
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  font-size: 14px;
  color: #eaf5ea;

  &:hover {
    transform: translateX(4px);
    background: linear-gradient(135deg, rgba(84,255,138,0.08) 0%, rgba(0,160,255,0.05) 100%);
    border-color: rgba(84,255,138,0.2);
    box-shadow: 0 4px 12px rgba(84,255,138,0.1);
  }

  b {
    font-variant-numeric: tabular-nums;
    color: #54ff8a;
    font-weight: 800;
    font-size: 14px;
    text-shadow: 0 0 5px rgba(84,255,138,0.3);
  }
`



function emoji(i:number){ // avatar emoji rápido
  const list = ['😀','😎','🤠','🧙‍♂️','🦊','🐼','🐯','🦄','🐸','🦉','🐨','🐵']
  return list[i % list.length]
}

export default function Lobby({
  socket,
  onJoinRoom,
}: {
  socket: Socket,
  onJoinRoom: (roomId: string)=>void
}) {
  const { playSound } = useSound()
  const [rooms, setRooms] = React.useState<LobbyRoomSummary[]>([])
  const [online, setOnline] = React.useState(0)
  const [leader, setLeader] = React.useState<Array<{id:string,name:string,earnings:number}>>([])
  const [q, setQ] = React.useState('')
  const [sort, setSort] = React.useState<'players'|'blinds'|'name'>('players')
  const [showSoundSettings, setShowSoundSettings] = React.useState(false)




  React.useEffect(() => {
    const onLobby   = (list: LobbyRoomSummary[]) => {
    console.log('📡 Lobby received rooms:', list)
    console.log('📱 Is mobile:', window.innerWidth <= 768)
    setRooms(list || [])
    // 🎵 Sonido cuando se actualiza la lista de salas
    playSound('notification')
  }
    const onOnline  = ({ count }: {count:number}) => {
      const prevCount = online
      setOnline(count ?? 0)
      // 🎵 Sonido cuando cambia el conteo de usuarios online
      if (count > prevCount && count > 0) {
        playSound('success')
      }
    }
    const onLeader  = (rows: any[]) => {
      setLeader(rows || [])
      // 🎵 Sonido cuando se actualiza el leaderboard
      if (rows && rows.length > 0) {
        playSound('notification')
      }
    }

    console.log('🎯 Joining lobby...')
    // 🎵 Sonido de entrada al lobby
    playSound('success')
    socket.emit(JOIN_LOBBY)
    socket.emit(GET_ONLINE_COUNT)
    socket.emit(GET_LEADERBOARD)

    // Re-intentar obtener rooms después de 2 segundos (por si acaso)
    const retryTimer = setTimeout(() => {
      console.log('🔄 Retrying to get rooms...')
      socket.emit(JOIN_LOBBY)
    }, 2000)

    socket.on(LOBBY_STATE, onLobby)
    socket.on(ONLINE_COUNT, onOnline)
    socket.on(LEADERBOARD, onLeader)

    return () => {
      clearTimeout(retryTimer)
      socket.off(LOBBY_STATE, onLobby)
      socket.off(ONLINE_COUNT, onOnline)
      socket.off(LEADERBOARD, onLeader)
    }
  }, [socket])

  // Memoized filtering for performance
  const filtered = React.useMemo(() => {
    return rooms
      .filter(r => (r.name || r.roomId).toLowerCase().includes(q.toLowerCase()))
      .sort((a,b)=>{
        if (sort==='players') return (b.players/(b.seats||1)) - (a.players/(a.seats||1))
        if (sort==='blinds')  return (b.bigBlind||0) - (a.bigBlind||0)
        return (a.name||'').localeCompare(b.name||'')
      })
  }, [rooms, q, sort])

  const quickJoin = (roomId: string) => {
    console.log('🚪 CLIENT: Quick Join called for room:', roomId)
    console.log('🚪 CLIENT: Socket connected:', socket.connected)
    console.log('🚪 CLIENT: Socket ID:', socket.id)
    console.log('🚪 CLIENT: JOIN_ROOM event name:', JOIN_ROOM)
    // 🎵 Sonido cuando se une a una sala
    playSound('success')
    playSound('notification')
    socket.emit(JOIN_ROOM, { roomId })
    console.log('🚪 CLIENT: JOIN_ROOM event emitted to server')
    onJoinRoom(roomId)
  }



  return (
    <Wrap>
      <Top>
        <BrandingTitle showSubtitle={false} />
        <Online>👥 Online: <b>{online}</b></Online>
        <CreateBtn onClick={() => {
          // Crear mesa con configuración por defecto
          const config = {
            name: `Mesa ${Math.floor(Math.random() * 1000)}`,
            seats: 5,
            smallBlind: 5,
            bigBlind: 10,
            buyIn: 2000,
            withBots: true
          }
          socket.emit(CREATE_ROOM, config)
        }}>+ Crear mesa</CreateBtn>
      </Top>

      <Toolbar>
        <Search placeholder="Buscar mesa…" value={q} onChange={e=>setQ(e.target.value)} />
        <Select value={sort} onChange={e=>setSort(e.target.value as any)}>
          <option value="players">Más concurridas</option>
          <option value="blinds">Ciegas más altas</option>
          <option value="name">Nombre (A–Z)</option>
        </Select>
        <Pill title="Consejo: clic en la tarjeta para previsualizar">
          🎲 Consejos: Quick Join, hover, filtros
        </Pill>
      </Toolbar>

      <Flex>
        <Grid>
          {filtered.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#666',
              fontSize: '16px',
              background: 'rgba(0,0,0,0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{fontSize: '24px', marginBottom: '10px'}}>🎰</div>
              <div>No tables available</div>
              <div style={{fontSize: '14px', marginTop: '8px', opacity: 0.7}}>
                Create the first table to start playing
              </div>
            </div>
          ) : (
            filtered.map((r, idx) => {
            const fill = Math.round((r.players / (r.seats || 1)) * 100)
            return (
              <Card key={r.roomId} $busy={r.status === 'running'}>
                <TablePreview />
                <Row>
                  <Meta>
                    <b>{r.name || r.roomId}</b><br/>
                    {r.players}/{r.seats} jugadores
                  </Meta>
                  <Join onClick={()=>quickJoin(r.roomId)}>Quick Join</Join>
                </Row>
                <Row style={{marginTop:8}}>
                  <Pill>🪪 {emoji(idx)} Mesa #{r.roomId.slice(-3)}</Pill>
                  <Pill title="Ocupación">
                    {fill}% ocupación
                  </Pill>
                </Row>
              </Card>
            )
          })
          )}
        </Grid>

        <Board>
          <BoardTitle>🏆 Ranking (Top 5)</BoardTitle>
          {leader.slice(0,5).map((row,i)=>(
            <LBRow key={row.id}>
              <span>{i+1}. {row.name || row.id.slice(0,4)}</span>
              <b>${row.earnings}</b>
            </LBRow>
          ))}
        </Board>
      </Flex>

      {/* 🎵 Botón de configuración de sonido */}
      <SoundSettingsButton onClick={() => setShowSoundSettings(true)}>
        🎵 Audio
      </SoundSettingsButton>

      {/* 🎵 Modal de configuración de sonido */}
      <SoundSettings
        isOpen={showSoundSettings}
        onClose={() => setShowSoundSettings(false)}
      />

    </Wrap>
  )
}

// 🎵 Estilos para el botón de configuración de sonido
const SoundSettingsButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
  transition: all 0.3s ease;
  z-index: 1001;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.6);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 768px) {
    bottom: 100px; /* Arriba del action bar en móvil */
    right: 20px;
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
`
