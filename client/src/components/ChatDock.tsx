import React from 'react'
import type { Socket } from 'socket.io-client'
import * as Protocol from 'shared/protocol'
import EmojiPicker from './EmojiPicker'
const { ClientEvents, ServerEvents } = Protocol

type ChatMsg = { id: string; userId: string; userName: string; text: string; ts: number; subscription?: 'free' | 'bronze' | 'silver' | 'gold' | 'diamond'; avatar?: string }

export default function ChatDock({ socket, avatar, roomId, subscription, isMobile = false, onUnreadCountChange, me }: {
  socket: Socket,
  avatar: string,
  roomId?: string,
  subscription?: 'free' | 'bronze' | 'silver' | 'gold' | 'diamond',
  isMobile?: boolean,
  onUnreadCountChange?: (count: number) => void,
  me?: any
}){
  const [chat, setChat] = React.useState<ChatMsg[]>([])
  const [v, setV] = React.useState('')
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false)
  const [typingUsers, setTypingUsers] = React.useState<Set<string>>(new Set())
  const typingTimeoutRef = React.useRef<{ [key: string]: NodeJS.Timeout }>({})
  const myId = me?.id || localStorage.getItem('myUserId') || socket?.id || null

  // refs para autoscroll y detección de “estoy en el fondo”
  const listRef = React.useRef<HTMLDivElement|null>(null)
  const bottomRef = React.useRef<HTMLDivElement|null>(null)
  const [unread, setUnread] = React.useState(0)

  // input auto-ajustable
  const taRef = React.useRef<HTMLTextAreaElement|null>(null)
  const MAX_TA = 120
  const autoSize = () => {
    const ta = taRef.current
    if (!ta) return
    // recalcular sin provocar "saltos" del viewport
    ta.style.height = 'auto'
    const next = Math.min(MAX_TA, ta.scrollHeight)
    ta.style.height = next + 'px'
    ta.style.overflowY = ta.scrollHeight > MAX_TA ? 'auto' : 'hidden'

    // si estabas al fondo, permanece al fondo
    const el = listRef.current
    if (el) {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 8
      if (atBottom) bottomRef.current?.scrollIntoView({ block: 'end' })
    }
  }

  function formatTime(ts: number){
    const d = new Date(ts)
    const hh = String(d.getHours()).padStart(2,'0')
    const mm = String(d.getMinutes()).padStart(2,'0')
    return `${hh}:${mm}`
  }

  // Table chat with persistence
  React.useEffect(() => {
    if (!roomId) return

    // Join table chat
    socket.emit('CHAT_JOIN', { roomId })
    
    // Listen for chat history
    const onHistory = (history: ChatMsg[]) => {
      setChat(history)
      // Scroll al final después de cargar el historial
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'auto' })
      }, 100)
    }
    
    // Escuchar nuevos mensajes
    const onMessage = (msg: ChatMsg) => {
      console.log('💬 CHATDOCK: Received table message:', {
        id: msg.id,
        userId: msg.userId,
        userName: msg.userName,
        avatar: msg.avatar,
        hasAvatar: !!msg.avatar
      })

      setChat(prev => {
        // Remover mensaje optimista si existe (empieza con 'temp-')
        const filteredPrev = prev.filter(existingMsg => !existingMsg.id.startsWith('temp-') || existingMsg.userId !== msg.userId)

        // Actualizar avatares en mensajes existentes del mismo usuario
        const updatedPrev = filteredPrev.map(existingMsg => {
          if (existingMsg.userId === msg.userId && existingMsg.avatar !== msg.avatar) {
            console.log('🔄 CHATDOCK: Updating avatar for existing message:', existingMsg.id, 'from:', existingMsg.avatar, 'to:', msg.avatar)
            return {
              ...existingMsg,
              avatar: msg.avatar,
              userName: msg.userName
            }
          }
          return existingMsg
        })

        return [...updatedPrev.slice(-198), msg] // -198 para dejar espacio para el nuevo
      })

      // Notificar sobre mensaje no leído si estamos en modo móvil y hay callback
      if (isMobile && onUnreadCountChange && msg.userId !== myId) {
        onUnreadCountChange(1)
      }
    }

    // Actualizar mensajes existentes cuando cambian los datos de un usuario
    const onUserDataUpdated = (userData: { userId: string, avatar?: string, userName?: string, subscription?: string }) => {
      console.log('🔄 CLIENT: ChatDock Table - ========== USER_DATA_UPDATED RECEIVED ==========')
      console.log('🔄 CLIENT: ChatDock Table - User data updated received:', userData)
      console.log('🔄 CLIENT: ChatDock Table - Current socket connected:', socket?.connected)
      console.log('🔄 CLIENT: ChatDock Table - Current socket id:', socket?.id)
      console.log('🔄 CLIENT: ChatDock Table - Current messages before update:', chat.length)

      // Verificar si hay mensajes de este usuario
      const userMessages = chat.filter(msg => msg.userId === userData.userId)
      console.log('🔄 CLIENT: ChatDock Table - Messages found for user:', userMessages.length)

      setChat(prev => {
        const updatedChat = prev.map(msg => {
          if (msg.userId === userData.userId) {
            console.log('🔄 CLIENT: ChatDock Table - Updating message for user:', userData.userId)
            console.log('🔄 CLIENT: ChatDock Table - Old message:', { userName: msg.userName, avatar: msg.avatar })
            const updatedMsg = {
              ...msg,
              avatar: userData.avatar !== undefined ? userData.avatar : msg.avatar,
              userName: userData.userName !== undefined ? userData.userName : msg.userName,
              subscription: userData.subscription !== undefined ? userData.subscription as any : msg.subscription
            }
            console.log('🔄 CLIENT: ChatDock Table - New message:', { userName: updatedMsg.userName, avatar: updatedMsg.avatar })
            return updatedMsg
          }
          return msg
        })
        console.log('🔄 CLIENT: ChatDock Table - Messages updated, new count:', updatedChat.length)
        return updatedChat
      })
    }

    // Typing indicators
    const onTypingStart = (data: { userId: string, userName?: string }) => {
      if (data.userId !== myId) {
        setTypingUsers(prev => new Set([...prev, data.userId]))
      }
    }
    
    const onTypingStop = (data: { userId: string }) => {
      setTypingUsers(prev => {
        const next = new Set(prev)
        next.delete(data.userId)
        return next
      })
    }

    socket.on('CHAT_HISTORY', onHistory)
    socket.on('CHAT_MESSAGE', onMessage)
    socket.on('USER_DATA_UPDATED', onUserDataUpdated)
    socket.on('TYPING_START', onTypingStart)
    socket.on('TYPING_STOP', onTypingStop)
    
    return () => {
      socket.off('CHAT_HISTORY', onHistory)
      socket.off('CHAT_MESSAGE', onMessage)
      socket.off('USER_DATA_UPDATED', onUserDataUpdated)
      socket.off('TYPING_START', onTypingStart)
      socket.off('TYPING_STOP', onTypingStop)
      socket.emit('CHAT_LEAVE', { roomId })
    }
  }, [socket, roomId, myId])

  // Chat global como fallback (solo si no hay roomId)
  React.useEffect(() => {
    console.log('🎯 CHATDOCK: Setting up GLOBAL chat listeners, roomId:', roomId)
    console.log('🎯 CHATDOCK: Socket connected:', socket?.connected)
    console.log('🎯 CHATDOCK: Socket id:', socket?.id)

    if (roomId) return

    console.log('🎯 CHATDOCK: Initializing global chat...')

    // Cargar historial desde localStorage como respaldo
    const savedChat = localStorage.getItem('globalChatHistory')
    if (savedChat) {
      try {
        const parsed = JSON.parse(savedChat)
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log('🎯 CHATDOCK: Loaded chat history from localStorage:', parsed.length, 'messages')

          // Verificar si necesitamos actualizar avatares en el historial cargado
          const myUserId = localStorage.getItem('myUserId')
          const myAvatar = localStorage.getItem('selectedAvatar') || '🙂'
          const myUsername = localStorage.getItem('userName') || 'Player123'

          console.log('🎯 CHATDOCK: Checking if avatar sync needed for user:', myUserId)
          console.log('🎯 CHATDOCK: Current avatar:', myAvatar, 'username:', myUsername)

          // Actualizar mensajes del usuario actual en el historial cargado
          // NOTA: Solo podemos actualizar nuestros propios mensajes ya que no tenemos
          // información de avatares de otros usuarios en el cliente
          const updatedHistory = parsed.map((msg: ChatMsg) => {
            if (msg.userId === myUserId) {
              console.log('🎯 CHATDOCK: Updating stored message avatar for user:', myUserId)
              return {
                ...msg,
                userName: myUsername,
                avatar: myAvatar
              }
            }
            // Para otros usuarios, mantener el avatar que tenían cuando se guardó
            // El servidor enviará mensajes actualizados cuando sea necesario
            return msg
          })

          setChat(updatedHistory)
          console.log('🎯 CHATDOCK: Chat history updated with current user data')
        }
      } catch (e) {
        console.warn('Error parsing saved chat:', e)
      }
    }
    
    // Listen for chat history global
    const onHistory = (history: ChatMsg[]) => {
      setChat(history)
      // Guardar en localStorage
      localStorage.setItem('globalChatHistory', JSON.stringify(history))
      // Scroll al final después de cargar el historial
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'auto' })
      }, 100)
    }
    
    // Escuchar nuevos mensajes del chat global
    const onMsg = (msg: ChatMsg) => {
      console.log('💬 CHATDOCK: Received global message:', {
        id: msg.id,
        userId: msg.userId,
        userName: msg.userName,
        avatar: msg.avatar,
        hasAvatar: !!msg.avatar
      })

      setChat(prev => {
        // Remover mensaje optimista si existe (empieza con 'temp-')
        const filteredPrev = prev.filter(existingMsg => !existingMsg.id.startsWith('temp-') || existingMsg.userId !== msg.userId)

        // Actualizar avatares en mensajes existentes del mismo usuario
        const updatedPrev = filteredPrev.map(existingMsg => {
          if (existingMsg.userId === msg.userId && existingMsg.avatar !== msg.avatar) {
            console.log('🔄 CHATDOCK: Updating avatar for existing message:', existingMsg.id, 'from:', existingMsg.avatar, 'to:', msg.avatar)
            return {
              ...existingMsg,
              avatar: msg.avatar,
              userName: msg.userName
            }
          }
          return existingMsg
        })

        const newChat = [...updatedPrev.slice(-198), msg] // -198 para dejar espacio para el nuevo
        // Guardar en localStorage
        localStorage.setItem('globalChatHistory', JSON.stringify(newChat))
        console.log('💾 CHATDOCK: Saved updated chat history to localStorage')
        return newChat
      })

      // Notificar sobre mensaje no leído si estamos en modo móvil y hay callback
      if (isMobile && onUnreadCountChange && msg.userId !== myId) {
        onUnreadCountChange(1)
      }
    }

    // Actualizar mensajes existentes cuando cambian los datos de un usuario
    const onUserDataUpdated = (userData: { userId: string, avatar?: string, userName?: string, subscription?: string }) => {
      console.log('🔄 CLIENT: ChatDock Global - User data updated received:', userData)
      console.log('🔄 CLIENT: ChatDock Global - Current messages before update:', chat.length)
      setChat(prev => {
        const updatedChat = prev.map(msg => {
          if (msg.userId === userData.userId) {
            console.log('🔄 CLIENT: ChatDock Global - Updating message for user:', userData.userId)
            return {
              ...msg,
              avatar: userData.avatar !== undefined ? userData.avatar : msg.avatar,
              userName: userData.userName !== undefined ? userData.userName : msg.userName,
              subscription: userData.subscription !== undefined ? userData.subscription as any : msg.subscription
            }
          }
          return msg
        })
        console.log('🔄 CLIENT: ChatDock Global - Messages updated, new count:', updatedChat.length)
        // Actualizar localStorage con los mensajes actualizados
        localStorage.setItem('globalChatHistory', JSON.stringify(updatedChat))
        console.log('🔄 CLIENT: ChatDock Global - Updated localStorage with new avatar data')
        return updatedChat
      })
    }

    // Escuchar eventos separados para chat global
    console.log('🎯 CHATDOCK: Registering global chat listeners...')
    // Typing indicators for global chat
    const onTypingStart = (data: { userId: string, userName?: string }) => {
      if (data.userId !== myId) {
        setTypingUsers(prev => new Set([...prev, data.userId]))
      }
    }
    
    const onTypingStop = (data: { userId: string }) => {
      setTypingUsers(prev => {
        const next = new Set(prev)
        next.delete(data.userId)
        return next
      })
    }

    socket.on('GLOBAL_CHAT_HISTORY', onHistory)
    // IMPORTANTE: Solo escuchar mensajes globales, NO mensajes de mesa
    socket.on('GLOBAL_CHAT_MESSAGE', onMsg)  // Evento específico para chat global
    socket.on('USER_DATA_UPDATED', onUserDataUpdated)
    socket.on('GLOBAL_TYPING_START', onTypingStart)
    socket.on('GLOBAL_TYPING_STOP', onTypingStop)
    console.log('🎯 CHATDOCK: Global chat listeners registered successfully')
    
    return () => {
      console.log('🎯 CHATDOCK: Cleaning up global chat listeners...')
      socket.off('GLOBAL_CHAT_HISTORY', onHistory)
      socket.off('GLOBAL_CHAT_MESSAGE', onMsg)  // Evento específico para chat global
      socket.off('USER_DATA_UPDATED', onUserDataUpdated)
      socket.off('GLOBAL_TYPING_START', onTypingStart)
      socket.off('GLOBAL_TYPING_STOP', onTypingStop)
      console.log('🎯 CHATDOCK: Global chat listeners cleaned up')
    }
  }, [socket, roomId, myId])

  // Sincronización reactiva para cambios de avatar/username en chat global
  React.useEffect(() => {
    if (roomId) return // Solo para chat global

    const myUserId = localStorage.getItem('myUserId')
    if (!myUserId) return

    console.log('🎯 CHATDOCK: Reactive sync - checking for avatar/username changes')

    setChat(prev => {
      const myAvatar = localStorage.getItem('selectedAvatar') || '🙂'
      const myUsername = localStorage.getItem('userName') || 'Player123'

      console.log('🎯 CHATDOCK: Reactive sync - current values:', { avatar: myAvatar, username: myUsername })

      const updatedChat = prev.map((msg: ChatMsg) => {
        if (msg.userId === myUserId) {
          const needsUpdate = msg.avatar !== myAvatar || msg.userName !== myUsername
          if (needsUpdate) {
            console.log('🎯 CHATDOCK: Reactive sync - updating message:', msg.id)
            return {
              ...msg,
              userName: myUsername,
              avatar: myAvatar
            }
          }
        }
        return msg
      })

      // Actualizar localStorage si hubo cambios
      if (updatedChat.some((msg, index) => msg !== prev[index])) {
        console.log('🎯 CHATDOCK: Reactive sync - saving updated history to localStorage')
        localStorage.setItem('globalChatHistory', JSON.stringify(updatedChat))
      }

      return updatedChat
    })
  }, [roomId])

  // Sincronización reactiva cuando cambian valores en localStorage
  React.useEffect(() => {
    if (roomId) return // Solo para chat global

    console.log('🎯 CHATDOCK: Reactive sync - checking for changes in localStorage')

    const myUserId = localStorage.getItem('myUserId')
    if (!myUserId) return

    setChat(prev => {
      const myAvatar = localStorage.getItem('selectedAvatar') || '🙂'
      const myUsername = localStorage.getItem('userName') || 'Player123'

      console.log('🎯 CHATDOCK: Reactive sync - current values:', { avatar: myAvatar, username: myUsername })

      const updatedChat = prev.map((msg: ChatMsg) => {
        if (msg.userId === myUserId) {
          const needsUpdate = msg.avatar !== myAvatar || msg.userName !== myUsername
          if (needsUpdate) {
            console.log('🎯 CHATDOCK: Reactive sync - updating message:', msg.id)
            return {
              ...msg,
              userName: myUsername,
              avatar: myAvatar
            }
          }
        }
        return msg
      })

      // Actualizar localStorage si hubo cambios
      if (updatedChat.some((msg, index) => msg !== prev[index])) {
        console.log('🎯 CHATDOCK: Reactive sync - saving updated history to localStorage')
        localStorage.setItem('globalChatHistory', JSON.stringify(updatedChat))
      }

      return updatedChat
    })
  }, [localStorage.getItem('selectedAvatar'), localStorage.getItem('userName'), roomId])

  // autoscroll al montar y cuando hay mensajes si estás al fondo
  React.useEffect(()=>{
    const el = listRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 8
    if (atBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' })
      setUnread(0)
    } else {
      setUnread(u => u + 1)
    }
  }, [chat])

  // resetea badge cuando vuelves al fondo
  React.useEffect(()=>{
    const el = listRef.current
    if (!el) return
    const onScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 8
      if (atBottom) setUnread(0)
    }
    el.addEventListener('scroll', onScroll)
    return ()=> el.removeEventListener('scroll', onScroll)
  }, [])

  // asegura altura correcta al montar (placeholder, etc.)
  React.useEffect(()=>{ autoSize() }, [])

  function send(text: string){
    const t = String(text || '').trim()
    if (!t) return

    // Crear mensaje optimista con nuestros datos actuales
    const myId = me?.id || localStorage.getItem('myUserId') || socket?.id || null
    const myName = me?.name || localStorage.getItem('userName') || 'Player123'

    const optimisticMsg: ChatMsg = {
      id: `temp-${Date.now()}`,
      userId: myId || '',
      userName: myName,
      text: t,
      ts: Date.now(),
      subscription: subscription,
      avatar: avatar || '🙂'
    }

    console.log('💬 CHATDOCK: Sending optimistic message:', {
      id: optimisticMsg.id,
      userId: optimisticMsg.userId,
      userName: optimisticMsg.userName,
      avatar: optimisticMsg.avatar,
      roomId: roomId
    })

    // Mostrar mensaje inmediatamente (eco optimista)
    setChat(prev => [...prev, optimisticMsg])

    if (roomId) {
      // Table chat with persistence
      socket.emit('CHAT_SEND', { roomId, text: t })
    } else {
      // Global chat as fallback
      socket.emit(ClientEvents.SEND_CHAT, t)
    }

    setV('')
    autoSize()

    // Reemplazar mensaje optimista con el real cuando llegue del servidor
    setTimeout(() => {
      setChat(prev => prev.filter(msg => msg.id !== optimisticMsg.id))
    }, 5000) // Remover mensaje optimista después de 5 segundos si no llega el real
  }

  const quick = ['👏','🔥','🍌','💰','🏆','🎰','🎲']

  return (
    <aside className={`chat-dock ${isMobile ? 'mobile-chat-mode' : ''}`}>
      <div className="chat-list" ref={listRef}>
        {chat.map((msg, i) => {
          const prev = chat[i-1]
          const sameAuthor = prev && prev.userId === msg.userId && (msg.ts - prev.ts) < 120000
          const isMe = msg.userId === myId
          return (
            <div key={msg.id} className="chat-row" style={{justifyContent: isMe ? 'flex-end' : 'flex-start'}}>
              <div className="chat-avatar">
                {msg.avatar && (msg.avatar.startsWith('http') || msg.avatar.startsWith('data:')) ? (
                  <img
                    src={msg.avatar}
                    alt="avatar"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <span style={{ fontSize: '16px' }}>{msg.avatar || '🙂'}</span>
                )}
              </div>
              <div className={`chat-bubble ${isMe ? 'me' : ''}`}>
                <div className="meta">
                  <span className="name" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {isMe ? 'You' : (msg.name || 'Player')}
                            {msg.subscription && msg.subscription !== 'free' && (
        <span style={{
          color: msg.subscription === 'gold' || msg.subscription === 'diamond' ? '#fbbf24' : '#60a5fa',
          fontSize: '12px',
          fontWeight: 'normal',
          verticalAlign: 'middle',
          lineHeight: '1',
          filter: msg.subscription === 'gold' || msg.subscription === 'diamond' ? 'drop-shadow(0 0 3px rgba(251, 191, 36, 0.6))' : 'drop-shadow(0 0 2px rgba(96, 165, 250, 0.4))'
        }}>
          {msg.subscription === 'gold' || msg.subscription === 'diamond' ? '👑' : '💎'}
        </span>
      )}
                  </span>
                  <span className="time" title={new Date(msg.ts).toLocaleString()}>{formatTime(msg.ts)}</span>
                </div>
                <div className="text">{msg.text}</div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {unread > 0 && (
        <button
          className="pill unread-pill"
          onClick={()=>{
            const el = listRef.current
            if (!el) return
            el.scrollTop = el.scrollHeight
            setUnread(0)
          }}
        >
          {unread} nuevos ↓
        </button>
      )}

      <div className="chat-emoji">
        {quick.map(e => (
          <button key={e} className="pill" onClick={()=>send(e)}>{e}</button>
        ))}
        <button 
          className="pill" 
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          style={{ position: 'relative' }}
        >
          😀
          {showEmojiPicker && (
            <div style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: '8px' }}>
              <EmojiPicker
                onEmojiSelect={(emoji) => {
                  setV(prev => prev + emoji)
                  setShowEmojiPicker(false)
                  autoSize()
                }}
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>
          )}
        </button>
      </div>

      {typingUsers.size > 0 && (
        <div className="typing-indicator">
          <span>
            {Array.from(typingUsers).map((userId, idx, arr) => {
              const userName = chat.find(m => m.userId === userId)?.userName || 'Someone'
              if (idx === arr.length - 1 && arr.length > 1) return ` and ${userName}`
              if (idx === arr.length - 1) return `${userName}`
              return `${userName}, `
            })}
          </span>
          <span className="typing-dots">
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
          </span>
        </div>
      )}

      <div className="chat-input">
        <textarea
          ref={taRef}
          rows={1}
          value={v}
          placeholder="Type a message… (Enter sends, Shift+Enter line break)"
          onInput={e => { 
            const value = (e.target as HTMLTextAreaElement).value
            setV(value)
            autoSize()
            
            // Emit typing indicator
            if (value.trim() && socket) {
              if (roomId) {
                socket.emit('TYPING_START', { roomId })
              } else {
                socket.emit('GLOBAL_TYPING_START')
              }
              
              // Clear existing timeout
              if (typingTimeoutRef.current[myId || '']) {
                clearTimeout(typingTimeoutRef.current[myId || ''])
              }
              
              // Stop typing after 3 seconds of inactivity
              typingTimeoutRef.current[myId || ''] = setTimeout(() => {
                if (roomId) {
                  socket.emit('TYPING_STOP', { roomId })
                } else {
                  socket.emit('GLOBAL_TYPING_STOP')
                }
              }, 3000)
            }
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { 
              e.preventDefault()
              send(v)
              // Stop typing when sending
              if (socket) {
                if (roomId) {
                  socket.emit('TYPING_STOP', { roomId })
                } else {
                  socket.emit('GLOBAL_TYPING_STOP')
                }
              }
            }
          }}
        />
        <button className="send-btn" onClick={()=>{
          send(v)
          // Stop typing when sending
          if (socket) {
            if (roomId) {
              socket.emit('TYPING_STOP', { roomId })
            } else {
              socket.emit('GLOBAL_TYPING_STOP')
            }
          }
        }}>Send</button>
      </div>
    </aside>
  )
}
