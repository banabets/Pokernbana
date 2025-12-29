import React from 'react'
import * as Protocol from 'shared/protocol'
import BrandingTitle from './components/BrandingTitle'
import BackgroundMusic from './components/BackgroundMusic'
import AudioManager from './components/AudioManager'

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('❌ Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontFamily: 'Arial, sans-serif',
          zIndex: 9999
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center',
            maxWidth: '500px'
          }}>
            <h1 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>🎰 Oops!</h1>
            <h2 style={{ marginBottom: '1rem' }}>Algo salió mal</h2>
            <p style={{ marginBottom: '2rem', opacity: 0.8 }}>
              La aplicación encontró un error inesperado. Por favor, recarga la página para continuar jugando.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                border: 'none',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              🔄 Recargar Página
            </button>
            <details style={{ marginTop: '1rem', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', opacity: 0.7 }}>Detalles técnicos</summary>
              <pre style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '1rem',
                borderRadius: '4px',
                marginTop: '0.5rem',
                fontSize: '12px',
                overflow: 'auto'
              }}>
                {this.state.error?.toString()}
              </pre>
            </details>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Exportar ErrorBoundary para usarlo en main.tsx
export { ErrorBoundary }

const { ServerEvents, ClientEvents } = Protocol
type LobbyRoomSummary = import('./shared/protocol').LobbyRoomSummary


import { useSocket } from './hooks/useSocket'
import Table from './components/Table'
import ChatDock from './components/ChatDock'
import OnlineBadge from './components/OnlineBadge'
import Store from './components/Store'
import CryptoPrices from './components/CryptoPrices'


const SERVER_URL =
  (import.meta as any).env?.VITE_SERVER_URL || 'http://localhost:4000'

/* ----------------------------- TopBar Component ---------------------------- */
function TopBar({
  socket,
  onCreate,
  onStore,
  onLeaderboard,
  onChat,
  onProfile,
  balance,
  avatar,
  userName,
  avatarBorder,
  avatarDecorations,
  subscription,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: {
  socket: Socket
  onCreate: () => void
  onStore: () => void
  onLeaderboard: () => void
  onChat: () => void
  onProfile: () => void
  balance: number
  avatar: string
  userName: string
  avatarBorder: string
  avatarDecorations: string[]
  subscription?: 'free' | 'bronze' | 'silver' | 'gold' | 'diamond'
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
}) {
  return (
    <div className="topbar">
      <div className="title-section">
        <div className="title-container">
          <span className="title-icon title-icon-left">🎰</span>
          <BrandingTitle size="small" />
          <span className="title-icon title-icon-right">🃏</span>
        </div>
        <div className="balance-badge">
          <span className="balance-label">$</span>
          <span className="balance-amount">{balance.toLocaleString()}</span>
        </div>
      </div>

      <button
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      <div className="actions">
        <button className="pill primary" onClick={onCreate}>
          <span className="plus-icon">+</span> Create Table
        </button>
        <button className="pill" onClick={onLeaderboard}>
          Leaderboard
        </button>
        <button className="pill" onClick={onStore}>
          Store
        </button>

        <OnlineBadge socket={socket} />

        <div className="user-info">
          <button className="profile-btn" onClick={onProfile}>
            <div className="user-details">
              <div className="user-name">
                {userName}
                {subscription && subscription !== 'free' && (
                  <span className="subscription-icon">
                    {subscription === 'gold' || subscription === 'diamond' ? '👑' : '💎'}
                  </span>
                )}
              </div>
            </div>

            <div className={`avatar-large avatar-${avatarBorder}`} style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '8px',
              border: '2px solid rgba(255,255,255,0.15)',
              fontSize: '16px'
            }}>
              {avatar && (avatar.startsWith('http') || avatar.startsWith('data:')) ? (
                <img
                  src={avatar}
                  alt="Avatar"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <span style={{ fontSize: '16px' }}>{avatar || '🙂'}</span>
              )}

              {avatarDecorations.slice(0, 2).map((d, i) => (
                <span key={i} className={`decoration decoration-${i}`} style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  fontSize: '10px'
                }}>{d}</span>
              ))}
            </div>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-menu">
            <div className="mobile-menu-header">
              <h3>Menu</h3>
              <button onClick={() => setIsMobileMenuOpen(false)}>✕</button>
            </div>

            <div className="mobile-menu-content">
              <div className="mobile-user-info">
                              <div className={`avatar-large avatar-${avatarBorder}`} style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
                border: '2px solid rgba(255,255,255,0.15)',
                fontSize: '20px'
              }}>
                {avatar && (avatar.startsWith('http') || avatar.startsWith('data:')) ? (
                  <img
                    src={avatar}
                    alt="Avatar"
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <span style={{ fontSize: '20px' }}>{avatar || '🙂'}</span>
                )}
              </div>
                <div className="mobile-user-details">
                  <div className="user-name">{userName}</div>
                  <div className="user-balance">${balance.toLocaleString()}</div>
                </div>
              </div>

              <div className="mobile-menu-buttons">
                <button className="mobile-menu-btn primary" onClick={() => { onCreate(); setIsMobileMenuOpen(false); }}>
                  <span className="plus-icon">+</span> Create Table
                </button>
                <button className="mobile-menu-btn" onClick={() => { onLeaderboard(); setIsMobileMenuOpen(false); }}>
                  🏆 Leaderboard
                </button>
                <button className="mobile-menu-btn" onClick={() => { onStore(); setIsMobileMenuOpen(false); }}>
                  🛒 Store
                </button>
                <button className="mobile-menu-btn" onClick={() => { onChat(); setIsMobileMenuOpen(false); }}>
                  💬 Chat
                </button>
                <button className="mobile-menu-btn" onClick={() => { onProfile(); setIsMobileMenuOpen(false); }}>
                  👤 Profile
                </button>

                <div className="mobile-online-section">
                  <OnlineBadge socket={socket} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------------------------- Store Modal (lite) - OBSOLETO --------------------------- */
/*
function StoreModal({
  open,
  onClose,
  theme,
  setTheme,
  skin,
  setSkin,
  storeCredits,
  setStoreCredits,
  addNotification,
}: {
  open: boolean
  onClose: () => void
  theme: string
  setTheme: (t: any) => void
  skin: string
  setSkin: (s: any) => void
  storeCredits: number
  setStoreCredits: (v: (x: number) => number | number) => void
  addNotification: (msg: string) => void
}) {
  if (!open) return null

  const skins = [
    { name: 'Green Felt', skin: 'green', price: 0 },
    { name: 'Blue Felt', skin: 'blue', price: 100 },
    { name: 'Purple Felt', skin: 'purple', price: 200 },
  ]

  const themes = [
    { name: 'Casino', theme: 'casino', price: 0 },
    { name: 'Neon', theme: 'neon', price: 0 },
    { name: 'Dark', theme: 'dark', price: 0 },
    { name: 'Beach', theme: 'beach', price: 150 },
    { name: 'Space', theme: 'space', price: 250 },
    { name: 'Cyberpunk', theme: 'cyberpunk', price: 500 },
    { name: 'Sunset', theme: 'sunset', price: 300 },
    { name: 'Matrix', theme: 'matrix', price: 600 },
    { name: 'Fire', theme: 'fire', price: 400 },
    { name: 'Ocean', theme: 'ocean', price: 350 },
  ]

  const buySkin = (s: (typeof skins)[number]) => {
    if (storeCredits < s.price) return addNotification('Not enough store credits!')
    setSkin(s.skin as any)
    if (s.price > 0) setStoreCredits((c) => c - s.price)
    addNotification(`Table skin changed to ${s.name}`)
  }

  const buyTheme = (t: (typeof themes)[number]) => {
    if (storeCredits < t.price) return addNotification('Not enough store credits!')
    setTheme(t.theme as any)
    if (t.price > 0) setStoreCredits((c) => c - t.price)
    addNotification(`Theme changed to ${t.name}`)
  }

  return (
    <div className="modal" onClick={onClose}>
      <div className="box" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <b>🛒 Store</b>
          <button onClick={onClose}>✕</button>
        </div>

        <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
          <div>
            <div style={{ marginBottom: 6, opacity: 0.8, fontSize: 12 }}>🎲 Table Skins</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 8 }}>
              {skins.map((s) => (
                <button key={s.skin} className="pill" onClick={() => buySkin(s)}>
                  {s.name} {s.price ? `· ${s.price}c` : '· FREE'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ marginBottom: 6, opacity: 0.8, fontSize: 12 }}>🌈 Themes</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0,1fr))', gap: 8 }}>
              {themes.map((t) => (
                <button
                  key={t.theme}
                  className="pill"
                  style={{
                    border:
                      theme === t.theme ? '1px solid rgba(100,200,255,.6)' : '1px solid rgba(255,255,255,.2)',
                  }}
                  onClick={() => buyTheme(t)}
                >
                  {t.name} {t.price ? `· ${t.price}c` : '· FREE'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 8, opacity: 0.8, fontSize: 12 }}>
            Credits: <b>{storeCredits}</b>
          </div>
        </div>
      </div>
    </div>
  )
}
*/

/* --------------------------------- App ------------------------------------ */
// Hook personalizado para sincronizar balance
function useBalanceSync(socket: any) {
  const [tableState, setTableState] = React.useState<any>(null)

  React.useEffect(() => {
    if (!socket) return

    const handleTableState = (state: any) => {
      setTableState(state)
    }

    socket.on('tableState', handleTableState)

    return () => {
      socket.off('tableState', handleTableState)
    }
  }, [socket])

  return tableState
}

export default function App() {
  // Estado para el menú móvil
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  // Estado para el chat móvil (flotante vs expandido)
  const [isMobileChatExpanded, setIsMobileChatExpanded] = React.useState(false)
  const [showMobileChat, setShowMobileChat] = React.useState(false)
  const [unreadChatMessages, setUnreadChatMessages] = React.useState(0)

  // Callback para manejar datos restaurados del servidor
  const handleDataRestored = React.useCallback((data: {
    subscription?: 'free' | 'bronze' | 'silver' | 'gold' | 'diamond',
    avatar?: string
  }) => {
    if (data.subscription && data.subscription !== 'free') {
      setSubscription(data.subscription)
      console.log('💎 APP: Subscription restored from server:', data.subscription)
    }
    if (data.avatar && data.avatar !== '🙂') {
      setAvatar(data.avatar)
      console.log('🎭 APP: Avatar restored from server:', data.avatar)
    }
  }, [])

  const { socket, isConnected, connectionStatus, joinLobby, createRoom: createRoomFromHook, joinRoom, getLeaderboard, me } = useSocket(handleDataRestored)
  const tableState = useBalanceSync(socket)
  console.log('App.tsx: socket available:', !!socket, 'isConnected:', isConnected, 'connectionStatus:', connectionStatus)

  // Estados de la aplicación
  const [rooms, setRooms] = React.useState<LobbyRoomSummary[]>([])
  const [roomId, setRoomId] = React.useState<string | null>(null)



  // Usuario
  const [myBalance, setMyBalance] = React.useState(2000)
  const [previousStack, setPreviousStack] = React.useState<number | null>(null)
  const [storeCredits, setStoreCredits] = React.useState(() => {
    // Para el usuario "Banana", iniciar con 10,000 créditos
    const savedName = localStorage.getItem('userName')
    return savedName === 'Banana' ? 10000 : 500
  })
  const [avatar, setAvatar] = React.useState<string>(() => {
    // Cargar avatar desde localStorage al inicializar
    const savedAvatar = localStorage.getItem('selectedAvatar')
    return savedAvatar || '🙂'
  })
  const [userName, setUserName] = React.useState(() => {
    const savedName = localStorage.getItem('userName')
    return savedName || 'Player123'
  })
  const [avatarDecorations, setAvatarDecorations] = React.useState<string[]>([])
  const [avatarBorder, setAvatarBorder] = React.useState<string>('none')
  const [subscription, setSubscription] = React.useState<'free' | 'bronze' | 'silver' | 'gold' | 'diamond'>(() => {
    const savedSubscription = localStorage.getItem('userSubscription')
    console.log('💎 APP: Loading subscription from localStorage:', savedSubscription)
    return (savedSubscription as 'free' | 'bronze' | 'silver' | 'gold' | 'diamond') || 'free'
  })

  // Perfil
  const [newUserName, setNewUserName] = React.useState(() => {
    const savedName = localStorage.getItem('userName')
    return savedName || 'Player123'
  })
  const [editingName, setEditingName] = React.useState(false)

  // Mantener newUserName sincronizado con userName
  React.useEffect(() => {
    setNewUserName(userName)
  }, [userName])

  // Los datos se envían automáticamente desde el hook useSocket cuando se conecta

  // Notificaciones
  const [notifications, setNotifications] = React.useState<string[]>([])

  const addNotification = (msg: string) => {
    setNotifications((n) => [...n, msg])
    setTimeout(() => setNotifications((n) => n.slice(1)), 4000)
  }

      // Sync header balance with player stack on table
  React.useEffect(() => {
    if (!tableState || !socket || !me) return

    const myPlayer = tableState.players?.find((p: any) => p.id === me.id)
    if (!myPlayer) {
      // If we're not at the table, reset previousStack for next time
      if (previousStack !== null) {
        console.log('🏠 Returning to lobby, current balance:', myBalance)
        setPreviousStack(null)
      }
      return
    }

    const currentStack = myPlayer.stack
    const previousStackValue = previousStack

          // If this is the first time we see the stack (just joined the table), initialize
    if (previousStack === null) {
      console.log(`🎲 Joining table, initial balance: $${currentStack}`)
      setMyBalance(currentStack)
      setPreviousStack(currentStack)
      addNotification(`🎲 You joined the table with $${currentStack}!`)
      return
    }

    // If stack changed, update header balance
    if (currentStack !== previousStackValue) {
      const difference = currentStack - previousStackValue
      console.log(`💰 Balance update: ${difference >= 0 ? '+' : ''}${difference} (${previousStackValue} → ${currentStack})`)

      setMyBalance(currentStack)
      setPreviousStack(currentStack)

      // Mostrar notificación de ganancia/pérdida significativa
      if (Math.abs(difference) >= 10) { // Solo notificar cambios significativos
        if (difference > 0) {
          addNotification(`🎉 ¡Ganaste $${difference}!`)
        } else if (difference < 0) {
          addNotification(`💸 Perdiste $${Math.abs(difference)}`)
        }
      }
    }
  }, [tableState, socket, previousStack]) // Removed myBalance and addNotification from dependencies

      // Debug: Show balance status in console (development only)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Balance sync status:', {
        myBalance,
        previousStack,
        tableState: tableState ? 'active' : 'null',
        userId: me?.id,
        socketId: socket?.id
      })
    }
  }, [myBalance, previousStack, tableState?.roomId, me?.id, socket?.id]) // More specific dependencies

      // Reset state when leaving a table
  React.useEffect(() => {
    if (roomId === null && previousStack !== null) {
      console.log('🏠 Leaving table, resetting balance state')
      setPreviousStack(null)
    }
  }, [roomId, previousStack])

  // Handle server errors
  React.useEffect(() => {
    const handleServerError = (event: any) => {
      const error = event.detail
      console.log('🚨 SERVER ERROR received in App:', error)

      if (error.type === 'INSUFFICIENT_BALANCE') {
        addNotification(`❌ ${error.message}`)
      } else {
        addNotification(`❌ Error del servidor: ${error.message || 'Error desconocido'}`)
      }
    }

    window.addEventListener('serverError', handleServerError)
    return () => window.removeEventListener('serverError', handleServerError)
  }, [addNotification])
  const [openStore, setOpenStore] = React.useState(false)
  const [openLb, setOpenLb] = React.useState(false)
  const [openChat, setOpenChat] = React.useState(false)
  const [openProfile, setOpenProfile] = React.useState(false)
  const [openCreateRoom, setOpenCreateRoom] = React.useState(false)
  const [lb, setLb] = React.useState<LeaderboardRow[]>([])

  // Stats
  const [playerStats] = React.useState({
    gamesPlayed: 0,
    gamesWon: 0,
    totalEarnings: 0,
    bestHand: 'High Card',
    winRate: 0,
  })

  // Room config
  const [roomConfig, setRoomConfig] = React.useState({
    name: '',
    seats: 5,
    smallBlind: 5,
    bigBlind: 10,
    buyIn: 2000,
  })

  // Apariencia
  const [skin, setSkin] = React.useState<'green' | 'blue' | 'purple' | 'gold' | 'crystal' | 'red' | 'black' | 'rainbow' | 'neon' | 'sunset' | 'ocean' | 'lava' | 'ice' | 'forest' | 'royal' | 'galaxy' | 'diamond' | 'platinum' | 'emerald'>('green')
  const [theme, setTheme] = React.useState<
    'casino' | 'beach' | 'space' | 'neon' | 'cyberpunk' | 'dark' | 'sunset' | 'matrix' | 'fire' | 'ocean'
  >('casino')

  // Modal states
  const [seats, setSeats] = React.useState(5)
  const [sb, setSb] = React.useState(5)
  const [bb, setBb] = React.useState(10)
  const [withBots, setWithBots] = React.useState(true)

  // Tema en <body>
  React.useEffect(() => {
    const el = document.body
    const all = [
      'theme-casino',
      'theme-beach',
      'theme-space',
      'theme-neon',
      'theme-cyberpunk',
      'theme-dark',
      'theme-sunset',
      'theme-matrix',
      'theme-fire',
      'theme-ocean',
    ]
    all.forEach((c) => el.classList.remove(c))
    el.classList.add(`theme-${theme}`)
  }, [theme])

  // Socket events
  React.useEffect(() => {
    if (!socket) return
    console.log('Setting up socket event listeners...')

    socket.on('connect', () => {
      console.log('Socket connected, joining lobby...')
      addNotification('Server Connected')
      console.log('Calling joinLobby()...')
      joinLobby()
    })
    
    socket.on('disconnect', () => addNotification('Server Disconnected'))
    
    console.log('Registering LOBBY_STATE listener for event:', ServerEvents.LOBBY_STATE)
    socket.on(ServerEvents.LOBBY_STATE, (list: LobbyRoomSummary[]) => {
      console.log('Received lobby state:', list)
      console.log('Number of rooms:', list.length)
      console.log('Setting rooms state...')
      setRooms(list)
    })
    socket.on(ServerEvents.LEADERBOARD, (rows: LeaderboardRow[]) => {
      console.log('🏆 CLIENT: Leaderboard received:', rows.length, 'winners')
      if (rows.length > 0) {
        console.log('🏆 CLIENT: Top 3 winners:', rows.slice(0, 3).map(w => `${w.name}: $${w.earnings}`))
      }
      setLb(rows)
    })

    return () => {
      socket.disconnect()
    }
  }, [socket, isConnected])

  // Auto-refresh lobby (reduced frequency to prevent sync issues)
  React.useEffect(() => {
    if (!socket) return
    const id = setInterval(() => joinLobby(), 1800000) // 30 minutes instead of 5 minutes
    return () => clearInterval(id)
  }, [socket, joinLobby])

  if (!socket || !isConnected) {
    const statusMessage = connectionStatus === 'error' ? 'Connection failed. Retrying...' :
                         connectionStatus === 'connecting' ? 'Connecting to server...' :
                         'Initializing connection...'
    return <div style={{ padding: 20, textAlign: 'center' }}>
      <div>{statusMessage}</div>
      <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
        Status: {connectionStatus}
      </div>
    </div>
  }

  // Actions
  const openCreateRoomModal = () => {
    setOpenCreateRoom(true)
  }

  const join = (rid: string) => {
    console.log('🎯 APP: Join button clicked for room:', rid)
    console.log('🎯 APP: Current socket status:', { socket: !!socket, isConnected })
    console.log('🎯 APP: Connection status:', connectionStatus)

    setRoomId(rid)
    joinRoom(rid)

    // Enviar avatar y username actuales al servidor después de unirse
    if (socket && isConnected) {
      setTimeout(() => {
        // Enviar avatar si es diferente del por defecto
        if (avatar && avatar !== '🙂') {
          console.log('🎭 AVATAR: Sending current avatar to server after joining:', avatar)
          socket.emit(ClientEvents.UPDATE_AVATAR, avatar)
          console.log('🎭 AVATAR: Avatar sent successfully after joining room')
        }

        // Enviar username si es diferente del por defecto
        if (userName && userName !== 'Player123') {
          console.log('👤 USERNAME: Sending current username to server after joining:', userName)
          socket.emit(ClientEvents.UPDATE_USERNAME, userName.trim())
          console.log('👤 USERNAME: Username sent successfully after joining room')
        }
      }, 500) // Pequeño delay para asegurar que joinRoom se complete
    }
  }

  const handleCreateRoom = () => {
    if (!socket) {
      console.log('Socket not available')
      return
    }
    if (!isConnected) {
      console.log('Not connected to server')
      return
    }
    
    const config = {
      name: roomConfig.name,
      seats: seats,
      smallBlind: sb,
      bigBlind: bb,
      buyIn: roomConfig.buyIn,
      withBots
    }
    
    console.log('Creating room with config:', config)
    createRoomFromHook(config)
    setOpenCreateRoom(false)
  }

  if (roomId) {
            return <Table socket={socket} roomId={roomId} me={me || {}} selectedAvatar={avatar} skin={skin} subscription={subscription} onBack={() => {
          // Levantar del asiento antes de volver al lobby
          socket.emit('LEAVE_SEAT', { roomId })
          socket.emit('RETURN_TO_LOBBY')
          setRoomId(null)
        }} />
  }

  /* --------------------------------- RETURN -------------------------------- */
  return (
    <AudioManager>
      {/* 🎵 Música de fondo automática */}
      <BackgroundMusic />

      <div style={{ height: '100%' }}>
        <TopBar
        socket={socket}
        balance={myBalance}
        avatar={avatar}
        userName={userName}
        avatarBorder={avatarBorder}
        avatarDecorations={avatarDecorations}
        subscription={subscription}
        onCreate={openCreateRoomModal}
        onStore={() => setOpenStore(true)}
        onLeaderboard={() => {
          getLeaderboard()
          setOpenLb(true)
        }}
        onChat={() => setOpenChat(true)}
        onProfile={() => setOpenProfile(true)}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Lobby */}
      <div className="lobby-grid">
        <div className="lobby-main mobile-layout">
          {/* Crypto Prices */}
          <CryptoPrices tablesAvailable={rooms.length} onLeaderboard={() => { getLeaderboard(); setOpenLb(true); }} />

          {/* Rooms */}
          <div className="card-list">
            {console.log('Rendering rooms:', rooms)}
            {rooms.map((r) => (
              <div key={r.roomId} className="room-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <b>{r.name}</b>
                    <div style={{ opacity: 0.8, fontSize: 12, marginTop: 12, marginBottom: 4, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>
                      👥 Max {r.seats} players
                    </div>
                  </div>
                  <div className={`room-status ${r.status === 'waiting' ? 'waiting' : 'playing'}`}>{r.status === 'waiting' ? 'Waiting' : 'Playing'}</div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <button onClick={() => join(r.roomId)} className="pill">
                    <span style={{ marginRight: 4 }}>🎯</span>
                    Join
                  </button>
                  <button
                    className="pill"
                    onClick={() => {
                      // First join the table
                      joinRoom(r.roomId)
                      setRoomId(r.roomId)

                      // Sincronizar avatar y username como en el botón Join normal
                      if (socket && isConnected) {
                        setTimeout(() => {
                          // Enviar avatar si es diferente del por defecto
                          if (avatar && avatar !== '🙂') {
                            console.log('🎭 AVATAR: Sending current avatar to server after quick start:', avatar)
                            socket.emit(ClientEvents.UPDATE_AVATAR, avatar)
                            console.log('🎭 AVATAR: Avatar sent successfully after quick start')
                          }

                          // Enviar username si es diferente del por defecto
                          if (userName && userName !== 'Player123') {
                            console.log('👤 USERNAME: Sending current username to server after quick start:', userName)
                            socket.emit(ClientEvents.UPDATE_USERNAME, userName.trim())
                            console.log('👤 USERNAME: Username sent successfully after quick start')
                          }
                        }, 500) // Delay mayor para asegurar que joinRoom se complete
                      }

                      // Then start the hand
                      setTimeout(() => {
                        socket.emit(ClientEvents.START_HAND, { roomId: r.roomId })
                      }, 600) // Aumentar delay para que la sincronización termine primero
                    }}
                  >
                    <span style={{ marginRight: 4 }}>⚡</span>
                    Quick Start
                  </button>
                </div>

                <div className="room-avatars">
                  {Array.from({ length: r.players }).map((_, i) => (
                    <div key={i} className="av">
                      🙂
                    </div>
                  ))}
                  {r.hasBots && <div className="av">🤖</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat normal para desktop */}
        <div className="desktop-chat">
          <ChatDock socket={socket} avatar={avatar} roomId={null} subscription={subscription} me={me} />
        </div>

        {/* Chat móvil flotante */}
        <div className="mobile-chat">
          {/* Botón flotante de chat */}
          {!showMobileChat && (
            <button
              className="mobile-chat-toggle"
              onClick={() => {
                setShowMobileChat(true);
                setUnreadChatMessages(0); // Reset counter when opening chat
              }}
              aria-label="Open chat"
            >
              💬
              {/* Badge para mensajes no leídos */}
              {unreadChatMessages > 0 && (
                <span className="chat-notification-badge">
                  {unreadChatMessages > 99 ? '99+' : unreadChatMessages}
                </span>
              )}
            </button>
          )}

          {/* Chat expandido */}
          {showMobileChat && (
            <div className="mobile-chat-expanded">
              <div className="mobile-chat-header">
                <h3>Table Chat</h3>
                <button
                  className="mobile-chat-close"
                  onClick={() => {
                    setShowMobileChat(false)
                    setIsMobileChatExpanded(false)
                  }}
                  aria-label="Close chat"
                >
                  ✕
                </button>
              </div>

              <div className="mobile-chat-content">
                <ChatDock
                  socket={socket}
                  avatar={avatar}
                  roomId={null}
                  subscription={subscription}
                  me={me}
                  isMobile={true}
                  onUnreadCountChange={(count) => {
                    // Solo incrementar si el chat está cerrado
                    if (!showMobileChat) {
                      setUnreadChatMessages(prev => prev + count);
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard Modal */}
      {openLb && (
        <div className="modal" onClick={() => setOpenLb(false)}>
          <div className="box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b>🏆 Leaderboard</b>
              <button onClick={() => setOpenLb(false)}>✕</button>
            </div>
            <ol>
              {lb.map((row, i) => (
                <li key={row.id} style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                  <span>
                    #{i + 1} {row.name}
                  </span>
                  <span>${row.earnings.toLocaleString()}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Store Modal */}
      <Store
        socket={socket}
        openStore={openStore}
        setOpenStore={setOpenStore}
        theme={theme}
        setTheme={setTheme}
        skin={skin}
        setSkin={setSkin}
        storeCredits={storeCredits}
        setStoreCredits={setStoreCredits}
        addNotification={addNotification}
        subscription={subscription}
        setSubscription={setSubscription}
      />

      {/* Profile Modal */}
      {openProfile && (
        <div className="modal" onClick={() => setOpenProfile(false)}>
          <div
            className="box profile-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 720,
              width: '95%',
              maxHeight: '85vh',
              overflow: 'auto',
              borderRadius: 16,
              padding: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b>👤 User Profile</b>
              <button onClick={() => setOpenProfile(false)}>✕</button>
            </div>



            <div style={{ display: 'flex', gap: 24, marginTop: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {/* Avatar */}
              <div style={{ flex: '0 0 220px', textAlign: 'center' }}>
                <div
                  style={{
                    width: 140,
                    height: 140,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 70,
                    overflow: 'hidden',
                    marginBottom: 12,
                    margin: '0 auto 12px',
                    border: '2px solid rgba(255,255,255,.15)',
                  }}
                >
                  {avatar && (avatar.startsWith('http') || avatar.startsWith('data:')) ? (
                    <img
                      src={avatar}
                      alt="Avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span>{avatar}</span>
                  )}
                </div>

                <div style={{ display: 'grid', gap: 8 }}>
                  <label
                    htmlFor="profile-upload"
                    className="pill"
                    style={{ textAlign: 'center', cursor: 'pointer', userSelect: 'none' }}
                  >
                    📤 Upload Image
                  </label>
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (!f) return
                      const reader = new FileReader()
                      reader.onload = (ev) => {
                        const v = ev.target?.result as string
                        if (v) {
                          setAvatar(v)
                          addNotification('Custom avatar uploaded!')
                        }
                      }
                      reader.readAsDataURL(f)
                    }}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 32px)', gap: 4, justifyContent: 'center', maxHeight: '120px', overflowY: 'auto' }}>
                    {[
                      '👨', '👩', '🧑', '👴', '👵', '🧓', '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓',
                      '👨‍🔬', '👩‍🔬', '👨‍💻', '👩‍💻', '👨‍🍳', '👩‍🍳', '👨‍🎨', '👩‍🎨', '👨‍⚖️', '👩‍⚖️',
                      '🤠', '👨‍🚀', '👩‍🚀', '🕵️‍♂️', '🕵️‍♀️', '👮‍♂️', '👮‍♀️', '🚀', '⚽', '🎨',
                      '😊', '😎', '🤓', '😉', '🙃', '🤗', '🤔', '😐', '🙄', '😴'
                    ].map((e) => (
                      <button
                        key={e}
                        title={e}
                        onClick={() => {
                          console.log('🎭 AVATAR: Changing avatar to:', e)
                          console.log('🎭 AVATAR: Current avatar state:', avatar)
                          setAvatar(e)
                          console.log('🎭 AVATAR: Avatar state after setAvatar:', e)
                          // Guardar en localStorage para persistencia
                          localStorage.setItem('selectedAvatar', e)
                          // Enviar al servidor para sincronización con otros jugadores
                          console.log('🎭 AVATAR: About to send avatar update. Socket exists:', !!socket)
                          console.log('🎭 AVATAR: Socket connected:', socket?.connected)
                          console.log('🎭 AVATAR: Socket readyState:', socket?.readyState)
                          if (socket && socket.connected) {
                            console.log('🎭 AVATAR: Sending UPDATE_AVATAR to server:', e)
                            socket.emit(ClientEvents.UPDATE_AVATAR, e)
                            console.log('🎭 AVATAR: UPDATE_AVATAR emitted successfully')
                          } else {
                            console.log('🎭 AVATAR: Socket not connected or not available')
                            console.log('🎭 AVATAR: Socket details:', {
                              exists: !!socket,
                              connected: socket?.connected,
                              readyState: socket?.readyState,
                              id: socket?.id
                            })
                          }
                          addNotification('Avatar changed')
                        }}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          border: '1px solid rgba(255,255,255,.2)',
                          background: 'rgba(0,0,0,.3)',
                          color: 'white',
                          fontSize: 18,
                          lineHeight: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {e}
                      </button>
                    ))}
                  </div>

                  {/* GIF Avatars */}
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>🎬 Animated GIFs</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 34px)', gap: 6, justifyContent: 'center' }}>
                      {[
                        'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif', // Party popper
                        'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExemRscXBoMWFqODFobnNzeXo3d3Mwb3dnMTN6YXJ6ZmQ1ejIxOTBzZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/WLBCjqiUPFHPkvQUjy/giphy.gif', // Trophy
                        'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif', // Stars
                        'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExeGl2MG5semk5c2VvM2NibzQ0N3pjYjNyMGpuZ21hdWxzOGxieTY2ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/n1mNS67yQhtzzAN5H3/giphy.gif', // Heart eyes
                        'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWlicDIwa3A3ZWh2c2ozMWFsb2xqYjloeTIwenZkYnlud2hiejNwMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Wi7j4wl3xunV1xh2Ct/giphy.gif', // Lightning
                        'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3JyaGtnazdjdzVpdWNjZGMzY2Z1djlvcjB1NG5tNW9nbWx2YjNzNCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/HChtj3gzcVsXK/giphy.gif', // Sparkles
                        'https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif', // Trophy (duplicate - will be fixed)
                        'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExYTRxY25rZzZkZWlpYXFjcTB5djg2Y3gwcGhwOHE2aDA5Mzd4cWN5NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3ohs7HdhQA4ffttvrO/giphy.gif', // Crown
                        'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExa3FvM25yOTJ4NnAyNjY4bTd3MWl3a3U1c2Q1NG9tcG12dHZwcWhjMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/zKRlxWqdP4NTok3Ppl/giphy.gif', // Burger
                        'https://media.giphy.com/media/xUPGGDNsLvqsBOhuU0/giphy.gif', // Fire
                        'https://media.giphy.com/media/26n6WywJyh39n1pBu/giphy.gif', // Dancing
                        'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExMmN4YmRra2o5am0xeWp0NGV4dTZhdmoyazYxeHQzcnNsd3dpZ3J6aCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ukwPlCmJ5RmlqvQCpA/giphy.gif', // Celebration
                        'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3QyMW52azJvYzBmd3RtdndiY2VlcTYxbG5yNHV1cGVubmRqb25iZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oEdv8elIVRa3daNl6/giphy.gif', // Cool
                        'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzZrcmk0aXA2bjBiMDdzazliNHJoNzRmYjg2aXZlYmJ5OWJicWNiYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/aQwvKKi4Lv3t63nZl9/giphy.gif', // Money
                        'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExeG5pMjd5emp6ZnRkMzdyd2l1ajR4Nm5samk0YjF4dDIwNnNtdWp0MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Lopx9eUi34rbq/giphy.gif' // Rocket
                      ].map((gifUrl, i) => (
                        <button
                          key={`gif-${i}`}
                          title={`GIF Avatar ${i + 1}`}
                          onClick={() => {
                                                        setAvatar(gifUrl)
                            // Guardar en localStorage para persistencia
                            localStorage.setItem('selectedAvatar', gifUrl)
                                          // Enviar al servidor para sincronización con otros jugadores
              if (socket && socket.connected) {
                socket.emit(ClientEvents.UPDATE_AVATAR, gifUrl)
              }
                            addNotification('Animated avatar selected!')
                          }}
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 8,
                            border: '1px solid rgba(255,255,255,.2)',
                            background: 'rgba(0,0,0,.3)',
                            overflow: 'hidden',
                            padding: 0,
                            transition: 'border-color 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(100,200,255,.6)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,.2)'
                          }}
                        >
                          <img
                            src={gifUrl}
                            alt={`GIF ${i + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: '4px',
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSJyZ2JhKDAsMCwwLDAuMykiIHJ4PSI0Ii8+Cjx0ZXh0IHg9IjEyIiB5PSIxNSIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+❌PC90ZXh0Pgo8L3N2Zz4='
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side */}
              <div style={{ flex: '1 1 360px', minWidth: 300 }}>
                {/* Username */}
                <div
                  style={{
                    marginBottom: 16,
                    padding: 12,
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,.12)',
                    background: 'rgba(0,0,0,.25)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <b>Username</b>
                    {!editingName && (
                      <button className="pill" onClick={() => setEditingName(true)}>
                        Edit
                      </button>
                    )}
                  </div>

                  {editingName ? (
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        maxLength={20}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          borderRadius: 8,
                          border: '1px solid rgba(255,255,255,.2)',
                          background: 'rgba(0,0,0,.4)',
                          color: 'white',
                        }}
                      />
                      <button
                        className="pill"
                        disabled={!newUserName.trim() || newUserName === userName}
                        onClick={() => {
                          if (newUserName.trim() && newUserName !== userName) {
                            // Enviar al servidor para sincronización
                            console.log('👤 USERNAME: About to send username update. Socket exists:', !!socket)
                            console.log('👤 USERNAME: Socket connected:', socket?.connected)
                            console.log('👤 USERNAME: Socket readyState:', socket?.readyState)
                            if (socket && socket.connected) {
                              console.log('👤 USERNAME: Sending UPDATE_USERNAME to server:', newUserName.trim())
                              socket.emit(ClientEvents.UPDATE_USERNAME, newUserName.trim())
                              console.log('👤 USERNAME: UPDATE_USERNAME emitted successfully')
                              console.log('👤 CLIENT: Username updated to:', newUserName.trim())
                            } else {
                              console.log('👤 USERNAME: Socket not connected or not available')
                              console.log('👤 USERNAME: Socket details:', {
                                exists: !!socket,
                                connected: socket?.connected,
                                readyState: socket?.readyState,
                                id: socket?.id
                              })
                            }
                            setUserName(newUserName.trim())
                            // Guardar en localStorage para persistencia
                            localStorage.setItem('userName', newUserName.trim())
                            addNotification(`✅ Username updated to ${newUserName.trim()}`)
                          }
                          setEditingName(false)
                        }}
                      >
                        Save
                      </button>
                      <button
                        className="pill"
                        onClick={() => {
                          setNewUserName(userName)
                          setEditingName(false)
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      marginTop: 8,
                      fontSize: 16,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {userName}
                      {subscription && subscription !== 'free' && (
                        <span style={{
                          color: subscription === 'gold' || subscription === 'diamond' ? '#fbbf24' : '#60a5fa',
                          fontSize: '16px',
                          fontWeight: 'normal',
                          verticalAlign: 'middle',
                          lineHeight: '1',
                          filter: subscription === 'gold' || subscription === 'diamond' ? 'drop-shadow(0 0 3px rgba(251, 191, 36, 0.6))' : 'drop-shadow(0 0 2px rgba(96, 165, 250, 0.4))'
                        }}>
                          {subscription === 'gold' || subscription === 'diamond' ? '👑' : '💎'}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Decorations / Border */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div
                    style={{
                      flex: '1 1 160px',
                      padding: 12,
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,.12)',
                      background: 'rgba(0,0,0,.25)',
                    }}
                  >
                    <div style={{ marginBottom: 8 }}>
                      <b>Border</b>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {['none', 'gold', 'rainbow'].map((b) => (
                        <button
                          key={b}
                          className="pill"
                          style={{
                            backgroundColor: avatarBorder === b ? 'rgba(100,200,255,0.3)' : undefined,
                            border: avatarBorder === b ? '1px solid rgba(100,200,255,0.6)' : undefined
                          }}
                          onClick={() => {
                            setAvatarBorder(b)
                            addNotification(`Border: ${b}`)
                            console.log('Border changed to:', b) // Debug
                          }}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      flex: '1 1 160px',
                      padding: 12,
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,.12)',
                      background: 'rgba(0,0,0,.25)',
                    }}
                  >
                    <div style={{ marginBottom: 8 }}>
                      <b>Decorations</b>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {['👑', '💎', '🔥', '⚡', '⭐'].map((d) => (
                        <button
                          key={d}
                          className="pill"
                          onClick={() => {
                            setAvatarDecorations((prev) =>
                              prev.includes(d) ? prev : [...prev, d],
                            )
                            addNotification(`+ ${d}`)
                          }}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div
                  style={{
                    marginTop: 16,
                    padding: 12,
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,.12)',
                    background: 'rgba(0,0,0,.25)',
                  }}
                >
                  <b>Account Statistics</b>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, minmax(0,1fr))',
                      gap: 12,
                      marginTop: 10,
                    }}
                  >
                    <div className="stat">
                      <div>💰 Earnings</div>
                      <div>${playerStats.totalEarnings.toLocaleString()}</div>
                    </div>
                    <div className="stat">
                      <div>📈 Win Rate</div>
                      <div>{playerStats.winRate}%</div>
                    </div>
                    <div className="stat">
                      <div>🃏 Games</div>
                      <div>{playerStats.gamesPlayed}</div>
                    </div>
                    <div className="stat">
                      <div>🎯 Wins</div>
                      <div>{playerStats.gamesWon}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* little toast area */}
            {notifications.length > 0 && (
              <div style={{ marginTop: 16, opacity: 0.8, fontSize: 12, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>
                {notifications[0]}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Room Modal */}
      {openCreateRoom && (
        <div className="modal" onClick={() => setOpenCreateRoom(false)}>
          <div className="box" onClick={(e) => e.stopPropagation()} style={{
            maxWidth: '500px',
            width: '90%',
            padding: '20px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(84,255,138,0.1), rgba(0,160,255,0.05))',
            border: '2px solid rgba(84,255,138,0.2)',
            backdropFilter: 'blur(15px)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, color: '#54ff8a', fontSize: '24px', fontWeight: '900' }}>🎲 Create Table</h2>
              <button
                onClick={() => setOpenCreateRoom(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#54ff8a',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              {/* Table Name - Compact */}
              <div>
                <input
                  type="text"
                  value={roomConfig.name}
                  onChange={(e) => setRoomConfig({...roomConfig, name: e.target.value})}
                  placeholder="Table name..."
                  maxLength={20}
                  style={{
                    width: '180px',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    border: '2px solid rgba(84,255,138,0.2)',
                    background: 'rgba(0,0,0,0.3)',
                    color: '#eaf5ea',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Single Blind Amount Slider */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#eaf5ea', fontWeight: '600' }}>
                  💰 Blind Amount: <span style={{ color: '#54ff8a' }}>${bb}</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={bb}
                  onChange={(e) => {
                    setBb(Number(e.target.value));
                    setSb(Math.floor(Number(e.target.value) / 2)); // Small blind is half of big blind
                  }}
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    background: 'linear-gradient(to right, #54ff8a, #00a0ff, #ffd700)',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '12px', color: '#888' }}>
                  <span>$5</span>
                  <span>$100</span>
                </div>
              </div>

              {/* Seats and Bots - Simplified */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#eaf5ea', fontWeight: '600' }}>👥</span>
                  <select
                    value={seats}
                    onChange={(e) => setSeats(Number(e.target.value))}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '4px',
                      border: '2px solid rgba(84,255,138,0.2)',
                      background: 'rgba(0,0,0,0.3)',
                      color: '#eaf5ea',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  >
                    {[2,3,4,5].map(num => (
                      <option key={num} value={num} style={{ background: '#1a1a1a', color: '#eaf5ea' }}>{num}</option>
                    ))}
                  </select>
                  <span style={{ color: '#888', fontSize: '12px' }}>seats</span>
                </div>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#eaf5ea',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={withBots}
                    onChange={(e) => setWithBots(e.target.checked)}
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: '#54ff8a'
                    }}
                  />
                  🤖 Bots
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button
                onClick={() => setOpenCreateRoom(false)}
                style={{
                  padding: '12px 18px',
                  borderRadius: '8px',
                  border: '2px solid rgba(255,255,255,0.2)',
                  background: 'transparent',
                  color: '#eaf5ea',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRoom}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #54ff8a, #00a0ff)',
                  color: '#0a1a0f',
                  fontWeight: '900',
                  cursor: 'pointer',
                  fontSize: '16px',
                  boxShadow: '0 4px 15px rgba(84,255,138,0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                ⚡ Create Table
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AudioManager>
  )
}
