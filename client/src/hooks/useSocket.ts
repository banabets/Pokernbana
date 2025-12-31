import React from 'react'
import { io, Socket } from 'socket.io-client'
import * as Protocol from 'shared/protocol'

const { ServerEvents = {}, ClientEvents = {} } = Protocol

type State = any

// Debounce utility for performance
function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  return ((...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), ms)
  }) as T
}

export function useSocket(onDataRestored?: (data: {
  subscription?: 'free' | 'bronze' | 'silver' | 'gold' | 'diamond',
  avatar?: string
}) => void){
  const [state,setState] = React.useState<State>({ players:[], board:[], messages:[], round:'waiting', pot:0 })
  const [me,setMe] = React.useState<any>(null)
  const [isConnected, setIsConnected] = React.useState(false)
  const [connectionStatus, setConnectionStatus] = React.useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting')

  // Debug: Track connection attempts
  const connectionCount = React.useRef(0)

  const socketRef = React.useRef<Socket | null>(null)
  const stateRef = React.useRef<State | null>(null)
  
  React.useEffect(() => {
    connectionCount.current++
    console.log(`🔌 useSocket: Initializing hook (attempt #${connectionCount.current})`)
    console.log('useSocket: Current me state:', me)
    console.log('useSocket: Current isConnected:', isConnected)

    // Disconnect existing socket if any
    if (socketRef.current) {
      console.log('🔌 useSocket: Disconnecting existing socket before creating new one')
      socketRef.current.disconnect()
      socketRef.current = null
    }

    console.log('useSocket: Creating socket connection...')

    // Load or create persistent client ID
    let uniqueId = localStorage.getItem('clientId')
    if (!uniqueId) {
      // Create new persistent client ID
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 8)
      uniqueId = `${timestamp}-${randomId}`
      localStorage.setItem('clientId', uniqueId)
      console.log('🔑 CLIENT: Created new persistent client ID:', uniqueId)
    } else {
      console.log('🔑 CLIENT: Using existing persistent client ID:', uniqueId)
    }

    // Debug: Mostrar qué se está enviando al servidor
    console.log('🔑 CLIENT: Sending clientId to server:', uniqueId)

    // Detectar automáticamente la URL del servidor
    // En producción (Railway), usar la misma URL que el frontend
    // En desarrollo, detectar si estamos en localhost o IP de red local
    const isProduction = import.meta.env.PROD
    let serverUrl: string
    
    if (isProduction) {
      serverUrl = window.location.origin // Mismo dominio que el frontend en Railway
    } else {
      // En desarrollo, detectar si estamos accediendo desde IP de red local
      const currentHost = window.location.hostname
      if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
        serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000'
      } else {
        // Si accedemos desde IP de red (192.168.x.x), usar esa IP para el servidor también
        serverUrl = `http://${currentHost}:4000`
      }
    }
    console.log('🔗 CLIENT: Connecting to server at:', serverUrl)

    const newSocket = io(serverUrl, {
      transports: ['polling', 'websocket'],
      timeout: 20000, // 20 segundos timeout
      forceNew: false,
      reconnection: true,
      reconnectionAttempts: Infinity, // Reconexión infinita
      reconnectionDelay: 1000, // 1 segundo inicial
      reconnectionDelayMax: 5000, // Max 5 segundos entre intentos
      randomizationFactor: 0.3,
      upgrade: true,
      // Add unique identifier to ensure completely separate connections
      query: { clientId: uniqueId }
    })

    console.log('🔌 useSocket: Generated unique client ID:', uniqueId)
    console.log('🔌 useSocket: Created socket with ID:', newSocket.id)

    socketRef.current = newSocket

    // Escuchar eventos del servidor - debounced for performance (16ms = ~60fps)
    const handleTableStateRaw = (s:State) => {
      // Detectar si todos hicieron all-in y mostrar notificación
      const activePlayers = s.players?.filter(p => !p.folded) || []
      const allAllIn = activePlayers.length > 1 && activePlayers.every(p => p.isAllIn)
      const prevAllAllIn = stateRef.current?.players?.filter(p => !p.folded).every(p => p.isAllIn) || false

      if (allAllIn && !prevAllAllIn) {
        console.log('🎯 ALL PLAYERS ALL-IN DETECTED! Showing notification...')
        // Aquí podríamos emitir un evento para mostrar notificación
      }

      // IMPORTANTE: Verificar si es el turno de un bot y manejar el turno
      if (s.toAct && s.players) {
        const currentPlayer = s.players.find(p => p.id === s.toAct)
        console.log('🎯 CLIENT: Current player to act:', currentPlayer?.name, 'isBot:', currentPlayer?.isBot)

        // Si es un bot, el servidor debería manejar automáticamente el turno
        // Pero si el servidor no está llamando scheduleTurn(), necesitamos verificar por qué
        if (currentPlayer?.isBot && s.street !== 'ended') {
          console.log('🤖 CLIENT: It\'s a bot\'s turn - server should handle this automatically')
          console.log('🤖 CLIENT: Current state - street:', s.street, 'toAct:', s.toAct)
        }
      }

      setState(s)
      stateRef.current = s

      // Buscar al jugador actual usando múltiples identificadores
      const possibleIds = [
        me?.id,                           // ID del estado me
        localStorage.getItem('myUserId'), // ID guardado en localStorage
        newSocket.id                      // socket.id como último recurso
      ].filter(Boolean) // Filtrar valores null/undefined

      for (const id of possibleIds) {
        const mine = s.players?.find((p:any)=>p.id === id)
        if (mine) {
          setMe(mine)
          break // Encontramos al jugador, salimos del loop
        }
      }
    }

    // Debounced handler - prevents excessive re-renders during rapid state updates
    const handleTableState = debounce(handleTableStateRaw, 16)

    const handleUserConnected = (data: {
      userId: string,
      userName: string,
      subscription?: 'free' | 'bronze' | 'silver' | 'gold' | 'diamond',
      avatar?: string,
      storeCredits?: number
    }) => {

      // Verificar si ya tenemos un usuario diferente
      if (me && me.id && me.id !== data.userId) {
        // Warning silencioso - no necesitamos logs para esto
      }

      // Actualizar el estado con el userId correcto
      setMe({ id: data.userId, name: data.userName })
      // Guardar userId en localStorage como respaldo
      localStorage.setItem('myUserId', data.userId)

      // Si el servidor nos envía datos restaurados, actualizar localStorage y notificar
      if (data.subscription && data.subscription !== 'free') {
        localStorage.setItem('userSubscription', data.subscription)
        console.log('💎 CLIENT: Restored subscription from server:', data.subscription)
      }

      if (data.avatar && data.avatar !== '🙂') {
        localStorage.setItem('selectedAvatar', data.avatar)
        console.log('🎭 CLIENT: Restored avatar from server:', data.avatar)
      }

      // Notificar al componente padre sobre los datos restaurados
      if (onDataRestored && (data.subscription || data.avatar)) {
        onDataRestored({
          subscription: data.subscription,
          avatar: data.avatar
        })
      }
    }

    const handleConnect = () => {
      console.log('🔌 useSocket: Socket connected successfully')
      setIsConnected(true)
      setConnectionStatus('connected')

      // Record lobby join time to prevent duplicate JOIN_LOBBY
      const now = Date.now()
      localStorage.setItem('lastLobbyJoin', now.toString())
      newSocket.emit(ClientEvents.JOIN_LOBBY)
      // Avatar se enviará desde el componente App cuando sea necesario
    }

    const handleDisconnect = (reason: any) => {
      setIsConnected(false)
      setConnectionStatus('disconnected')
    }

    const handleAnyEvent = (event: any, ...args: any[]) => {
      // Silent event logging
    }

    const handleConnectError = (error: any) => {
      console.error('🔴 CLIENT: Connection error:', error)
      console.error('🔴 CLIENT: Error details:', {
        message: error.message,
        description: error.description,
        context: error.context,
        type: error.type
      })
      setIsConnected(false)
      setConnectionStatus('error')
    }

    const handleReconnect = (attemptNumber: any) => {
      console.log('Reconnected after', attemptNumber, 'attempts')
      setIsConnected(true)
      // Avoid multiple JOIN_LOBBY emissions by checking if we recently joined
      const lastJoinTime = localStorage.getItem('lastLobbyJoin')
      const now = Date.now()
      const timeSinceLastJoin = lastJoinTime ? now - parseInt(lastJoinTime) : Infinity

      if (timeSinceLastJoin > 10000) { // Only re-join if more than 10 seconds have passed
        console.log('Re-joining lobby after reconnection...')
        localStorage.setItem('lastLobbyJoin', now.toString())
        newSocket.emit(ClientEvents.JOIN_LOBBY)
      } else {
        console.log('Skipping lobby re-join (recently joined within 10 seconds)')
      }
    }

    const handleReconnectError = (error: any) => {
      console.error('Reconnection error:', error)
      setIsConnected(false)
    }

    const handleError = (error: any) => {
      console.error('🚨 CLIENT: Server error received:', error)
      // Emitir un evento personalizado para que App.tsx pueda manejarlo
      window.dispatchEvent(new CustomEvent('serverError', { detail: error }))
    }

    const handleStoreCreditsUpdate = (data: { credits: number }) => {
      console.log('💰 CLIENT: Store credits updated:', data.credits)
      // Emitir evento para que App.tsx actualice el estado
      window.dispatchEvent(new CustomEvent('storeCreditsUpdate', { detail: { credits: data.credits } }))
    }

    // Set up event listeners
    newSocket.on(ServerEvents.TABLE_STATE, handleTableState)
    newSocket.on('USER_CONNECTED', handleUserConnected)
    newSocket.on('ERROR', handleError)
    newSocket.on('STORE_CREDITS_UPDATE', handleStoreCreditsUpdate)
    newSocket.on('connect', handleConnect)
    newSocket.on('disconnect', handleDisconnect)
    newSocket.onAny(handleAnyEvent)
    newSocket.on('connect_error', handleConnectError)
    newSocket.on('reconnect', handleReconnect)
    newSocket.on('reconnect_error', handleReconnectError)

    // Return cleanup function
    return () => {
      console.log('useSocket: Cleaning up socket connection...')
      newSocket.off(ServerEvents.TABLE_STATE, handleTableState)
      newSocket.off('USER_CONNECTED', handleUserConnected)
      newSocket.off('ERROR', handleError)
      newSocket.off('STORE_CREDITS_UPDATE', handleStoreCreditsUpdate)
      newSocket.off('connect', handleConnect)
      newSocket.off('disconnect', handleDisconnect)
      newSocket.offAny(handleAnyEvent)
      newSocket.off('connect_error', handleConnectError)
      newSocket.off('reconnect', handleReconnect)
      newSocket.off('reconnect_error', handleReconnectError)
      newSocket.disconnect()
    }

  }, [])
  
  function joinLobby(){
    console.log('useSocket.joinLobby called, socket:', !!socketRef.current, 'isConnected:', isConnected)
    if (socketRef.current && isConnected) {
      console.log('Emitting JOIN_LOBBY event')
      // Reset the lobby join timestamp to allow immediate re-join
      localStorage.setItem('lastLobbyJoin', '0')
      socketRef.current.emit(ClientEvents.JOIN_LOBBY)
    } else {
      console.log('Cannot emit JOIN_LOBBY - socket or connection issue')
    }
  }

  function forceLobbySync(){
    console.log('🔄 Forcing lobby synchronization...')
    if (socketRef.current) {
      // Clear any cached timestamps
      localStorage.removeItem('lastLobbyJoin')
      // Force immediate re-join
      socketRef.current.emit(ClientEvents.JOIN_LOBBY)
    }
  }

  function createRoom(config?: any){
    console.log('useSocket.createRoom called with:', config)
    console.log('Socket available:', !!socketRef.current)
    console.log('Is connected:', isConnected)
    console.log('ClientEvents.CREATE_ROOM:', ClientEvents.CREATE_ROOM)

    if (socketRef.current && isConnected) {
      console.log('Emitting CREATE_ROOM event')
      socketRef.current.emit(ClientEvents.CREATE_ROOM, config)
    } else {
      console.log('Cannot emit CREATE_ROOM - socket or connection issue')
    }
  }

  function joinRoom(roomId: string){
    console.log('🚪 CLIENT: joinRoom called with roomId:', roomId)
    console.log('🚪 CLIENT: socketRef.current exists:', !!socketRef.current)
    console.log('🚪 CLIENT: isConnected:', isConnected)
    console.log('🚪 CLIENT: socket id:', socketRef.current?.id)

    if (socketRef.current && isConnected) {
      console.log('🚪 CLIENT: Joining room:', roomId)
      console.log('🚪 CLIENT: Emitting JOIN_ROOM event')
      socketRef.current.emit(ClientEvents.JOIN_ROOM, { roomId })
      console.log('🚪 CLIENT: JOIN_ROOM event emitted successfully')
    } else {
      console.log('❌ CLIENT: Cannot join room - socket or connection issue')
      console.log('❌ CLIENT: socketRef.current:', socketRef.current)
      console.log('❌ CLIENT: isConnected:', isConnected)
    }
  }

  function startHand(roomId: string){
    if (socketRef.current && isConnected) {
      socketRef.current.emit(ClientEvents.START_HAND, { roomId })
    }
  }

  function changeSeat(roomId: string, seatNumber: number){
    if (socketRef.current && isConnected) {
      console.log('🎯 CLIENT: Changing seat to', seatNumber, 'in room', roomId)
      socketRef.current.emit(ClientEvents.CHANGE_SEAT, { roomId, seatNumber })
    }
  }

  function playerAction(payload: any){
    if (socketRef.current && isConnected) {
      console.log('🎯 CLIENT: Sending player action:', payload)
      socketRef.current.emit(ClientEvents.PLAYER_ACTION, payload)
    } else {
      console.log('❌ CLIENT: Cannot send action - socket or connection issue')
    }
  }

  function sendChat(text: string){
    if (socketRef.current && isConnected && text.trim()) {
      socketRef.current.emit(ClientEvents.SEND_CHAT, text)
    }
  }

  function getLeaderboard(){
    console.log('🏆 CLIENT: Requesting leaderboard from server')
    if (socketRef.current && isConnected) {
      socketRef.current.emit(ClientEvents.GET_LEADERBOARD)
    } else {
      console.log('🏆 CLIENT: Cannot request leaderboard - socket not connected')
    }
  }

  function getOnlineCount(){
    if (socketRef.current && isConnected) {
      socketRef.current.emit(ClientEvents.GET_ONLINE_COUNT)
    }
  }

  return {
    socket: socketRef.current,
    isConnected,
    connectionStatus,
    state,
    me,
    joinLobby,
    forceLobbySync,
    createRoom,
    joinRoom,
    startHand,
    changeSeat,
    playerAction,
    sendChat,
    getLeaderboard,
    getOnlineCount
  }
}
