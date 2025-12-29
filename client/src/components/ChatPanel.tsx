import React from 'react'
import styled from 'styled-components'
import type { Socket } from 'socket.io-client'
import * as Protocol from 'shared/protocol'
const { ServerEvents = {}, ClientEvents = {} } = Protocol

// Fallbacks si no existen en Protocol
const CHAT_JOIN     = ClientEvents.CHAT_JOIN     ?? 'CHAT_JOIN'
const CHAT_LEAVE    = ClientEvents.CHAT_LEAVE    ?? 'CHAT_LEAVE'
const CHAT_SEND     = ClientEvents.CHAT_SEND     ?? 'CHAT_SEND'
const CHAT_MESSAGE  = ServerEvents.CHAT_MESSAGE  ?? 'CHAT_MESSAGE'
const CHAT_HISTORY  = ServerEvents.CHAT_HISTORY  ?? 'CHAT_HISTORY'
const USER_DATA_UPDATED = 'USER_DATA_UPDATED'

// === Ajustes rápidos del dock (coincidir con tu TopBar/ActionBar) ===
const TOPBAR_H = 56          // alto aprox. del TopBar fijo
const BOTTOM_GAP = 24        // separación sobre la ActionBar
const RIGHT_GAP = 16

type ChatMsg = {
  id: string
  userId?: string
  userName?: string
  text: string
  ts?: number
  subscription?: 'free' | 'bronze' | 'silver' | 'gold' | 'diamond'
  avatar?: string
}

/* Fixed dock: doesn't participate in table layout */
const Dock = styled.div`
  position: fixed;
  right: var(--spacing-md);
  top: calc(var(--topbar-h) + var(--spacing-xs));
  bottom: var(--spacing-xl);
  z-index: 900;              /* debajo del TopBar si este usa ~1000 */
  display: flex;
  align-items: stretch;

  /* El dock no intercepta clicks; su contenido sí */
  pointer-events: none;
  > * { pointer-events: auto; }

  @media (max-width: 980px) {
    right: var(--spacing-xs);
    left: var(--spacing-xs);               /* en móvil, que se haga ancho */
  }

  @media (max-width: 768px) {
    bottom: calc(var(--spacing-lg) + 80px); /* dejar espacio para action bar */
  }

  @media (max-width: 480px) {
    top: calc(var(--topbar-h) + var(--spacing-xs));
    bottom: calc(var(--spacing-md) + 120px); /* más espacio para action bar en móviles pequeños */
  }
`

const Panel = styled.div`
  width: clamp(280px, 26vw, 360px);
  height: 100%;              /* ocupa todo el alto del dock */
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);

  padding: var(--spacing-sm);
  border-radius: var(--border-radius);
  background: rgba(12,12,20,0.58);
  backdrop-filter: blur(6px);
  color: #eef2f7;
  box-shadow: 0 10px 30px rgba(0,0,0,.35);

  overflow: hidden;          /* evita que algo lo desborde */

  @media (max-width: 980px) {
    width: auto;             /* que se adapte al ancho disponible */
  }

  @media (max-width: 768px) {
    padding: var(--spacing-xs);
    gap: var(--spacing-xs);
    border-radius: calc(var(--border-radius) * 0.8);
  }

  @media (max-width: 480px) {
    padding: var(--spacing-xs);
    border-radius: calc(var(--border-radius) * 0.6);
  }
`

const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: var(--spacing-xs);
  font-weight: 700; letter-spacing: .3px;
  padding-bottom: var(--spacing-xs); border-bottom: 1px solid rgba(255,255,255,.08);
  font-size: var(--text-sm);

  @media (max-width: 480px) {
    font-size: var(--text-xs);
    padding-bottom: var(--spacing-xs);
  }
`

const Messages = styled.div`
  flex: 1 1 auto;
  min-height: 0;             /* clave para permitir scroll en flex */
  overflow: auto;
  display: flex; flex-direction: column; gap: var(--spacing-xs);
  padding-right: var(--spacing-xs);         /* no tapa el scroll */
  padding-bottom: var(--spacing-xs);

  @media (max-width: 480px) {
    gap: var(--spacing-xs);
    padding-right: var(--spacing-xs);
    padding-bottom: var(--spacing-xs);
  }
`

const Bubble = styled.div<{ $mine?: boolean }>`
  align-self: ${({ $mine }) => ($mine ? 'flex-end' : 'flex-start')};
  max-width: 85%;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: calc(var(--border-radius) * 0.8);
  background: ${({ $mine }) => ($mine ? 'rgba(84,255,138,0.15)' : 'rgba(255,255,255,0.08)')};
  box-shadow: inset 0 1px 0 rgba(255,255,255,.06);
  font-size: var(--text-sm); line-height: 1.25;

  > .meta {
    display: block;
    font-size: var(--text-xs);
    opacity: .7;
    margin-bottom: var(--spacing-xs);
  }
  white-space: pre-wrap;

  @media (max-width: 768px) {
    padding: var(--spacing-xs);
    font-size: var(--text-xs);
    border-radius: calc(var(--border-radius) * 0.6);

    > .meta {
      font-size: clamp(10px, 2.5vw, 12px);
      margin-bottom: var(--spacing-xs);
    }
  }

  @media (max-width: 480px) {
    max-width: 90%;
    padding: var(--spacing-xs);
  }
`

const InputRow = styled.form`
  flex: 0 0 auto;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--spacing-xs);

  @media (max-width: 480px) {
    gap: var(--spacing-xs);
  }
`

const TextArea = styled.textarea`
  resize: none;
  height: clamp(36px, 8vw, 42px);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: calc(var(--border-radius) * 0.6);
  background: rgba(0,0,0,0.35);
  border: 1px solid rgba(255,255,255,0.06);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.06);
  color: #fff;
  font-size: var(--text-sm);
  line-height: 1.25;
  outline: none;

  @media (max-width: 768px) {
    height: clamp(32px, 7vw, 38px);
    padding: var(--spacing-xs);
    font-size: var(--text-xs);
  }

  @media (max-width: 480px) {
    height: clamp(28px, 6vw, 36px);
    padding: var(--spacing-xs);
    font-size: clamp(12px, 3vw, 14px);
  }
`

const SendBtn = styled.button`
  height: clamp(36px, 8vw, 42px);
  padding: 0 var(--spacing-sm);
  border-radius: calc(var(--border-radius) * 0.6);
  background: #3da06a;
  color: white;
  font-weight: 700;
  font-size: var(--text-sm);
  border: none;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(0,0,0,.25);
  white-space: nowrap;
  &:disabled { opacity: .5; cursor: not-allowed; }

  @media (max-width: 768px) {
    height: clamp(32px, 7vw, 38px);
    padding: 0 var(--spacing-xs);
    font-size: var(--text-xs);
  }

  @media (max-width: 480px) {
    height: clamp(28px, 6vw, 36px);
    padding: 0 var(--spacing-xs);
    font-size: var(--text-xs);
    min-width: 50px;
  }
`

export default function ChatPanel({
  socket,
  roomId,
  myId,
  myName,
  myAvatar,
  subscription
}: {
  socket: Socket,
  roomId: string,
  myId?: string
  myName?: string
  myAvatar?: string
  subscription?: 'free' | 'bronze' | 'silver' | 'gold' | 'diamond'
}) {
  const [msgs, setMsgs] = React.useState<ChatMsg[]>([])
  const [text, setText] = React.useState('')
  const endRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    console.log('🎯 CHATPANEL: Setting up listeners for roomId:', roomId)
    console.log('🎯 CHATPANEL: Socket connected:', socket?.connected)
    console.log('🎯 CHATPANEL: Socket id:', socket?.id)

    const onHistory = (history: ChatMsg[]) => {
      console.log('📚 CHATPANEL: Received chat history:', history?.length || 0, 'messages')
      history?.forEach((msg, index) => {
        console.log(`📚 CHATPANEL: Message ${index}:`, {
          id: msg.id,
          userId: msg.userId,
          userName: msg.userName,
          avatar: msg.avatar,
          hasAvatar: !!msg.avatar
        })
      })
      setMsgs(history || [])
    }

    const onMessage = (m: ChatMsg) => {
      console.log('💬 CHATPANEL: Received new message:', {
        id: m.id,
        userId: m.userId,
        userName: m.userName,
        avatar: m.avatar,
        hasAvatar: !!m.avatar
      })

      setMsgs(prev => {
        // Remover mensaje optimista si existe (empieza con 'temp-')
        const filteredPrev = prev.filter(msg => !msg.id.startsWith('temp-') || msg.userId !== m.userId)

        // Actualizar avatares en mensajes existentes del mismo usuario
        const updatedPrev = filteredPrev.map(existingMsg => {
          if (existingMsg.userId === m.userId && existingMsg.avatar !== m.avatar) {
            console.log('🔄 CHATPANEL: Updating avatar for existing message:', existingMsg.id, 'from:', existingMsg.avatar, 'to:', m.avatar)
            return {
              ...existingMsg,
              avatar: m.avatar,
              userName: m.userName
            }
          }
          return existingMsg
        })

        return [...updatedPrev, m]
      })
    }

    // Actualizar mensajes existentes cuando cambian los datos de un usuario
    const onUserDataUpdated = (userData: { userId: string, avatar?: string, userName?: string, subscription?: string }) => {
      console.log('🔄 CLIENT: ChatPanel - ========== USER_DATA_UPDATED RECEIVED ==========')
      console.log('🔄 CLIENT: ChatPanel - User data updated received:', userData)
      console.log('🔄 CLIENT: ChatPanel - Avatar in update:', userData.avatar)
      console.log('🔄 CLIENT: ChatPanel - UserName in update:', userData.userName)
      console.log('🔄 CLIENT: ChatPanel - Current socket connected:', socket?.connected)
      console.log('🔄 CLIENT: ChatPanel - Current socket id:', socket?.id)
      console.log('🔄 CLIENT: ChatPanel - Current messages before update:', msgs.length)

      // Verificar si hay mensajes de este usuario
      const userMessages = msgs.filter(msg => msg.userId === userData.userId)
      console.log('🔄 CLIENT: ChatPanel - Messages found for user:', userMessages.length)
      userMessages.forEach((msg, index) => {
        console.log(`🔄 CLIENT: ChatPanel - User message ${index}:`, {
          id: msg.id,
          userId: msg.userId,
          currentAvatar: msg.avatar,
          currentUserName: msg.userName
        })
      })

      setMsgs(prev => {
        const updatedMsgs = prev.map(msg => {
          if (msg.userId === userData.userId) {
            console.log('🔄 CLIENT: ChatPanel - Updating message for user:', userData.userId)
            console.log('🔄 CLIENT: ChatPanel - Old message:', { userName: msg.userName, avatar: msg.avatar })
            const updatedMsg = {
              ...msg,
              avatar: userData.avatar !== undefined ? userData.avatar : msg.avatar,
              userName: userData.userName !== undefined ? userData.userName : msg.userName,
              subscription: userData.subscription !== undefined ? userData.subscription as any : msg.subscription
            }
            console.log('🔄 CLIENT: ChatPanel - New message:', { userName: updatedMsg.userName, avatar: updatedMsg.avatar })
            return updatedMsg
          }
          return msg
        })
        console.log('🔄 CLIENT: ChatPanel - Messages updated, new count:', updatedMsgs.length)
        return updatedMsgs
      })
    }

    console.log('🎯 CHATPANEL: Emitting CHAT_JOIN for roomId:', roomId)
    socket.emit(CHAT_JOIN, { roomId })

    console.log('🎯 CHATPANEL: Registering TABLE chat listeners...')
    socket.on(CHAT_HISTORY, onHistory)
    socket.on(CHAT_MESSAGE, onMessage)
    socket.on(USER_DATA_UPDATED, onUserDataUpdated)
    console.log('🎯 CHATPANEL: Table chat listeners registered successfully')

    return () => {
      console.log('🎯 CHATPANEL: Cleaning up listeners for roomId:', roomId)
      socket.emit(CHAT_LEAVE, { roomId })
      socket.off(CHAT_HISTORY, onHistory)
      socket.off(CHAT_MESSAGE, onMessage)
      socket.off(USER_DATA_UPDATED, onUserDataUpdated)
      console.log('🎯 CHATPANEL: Listeners cleaned up successfully')
    }
  }, [socket, roomId])

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs.length])

  // ⬇️ Con "eco optimista" mejorado: mostramos el mensaje inmediatamente con avatar
  const send = React.useCallback(() => {
    const t = text.trim()
    if (!t) return

    // Crear mensaje optimista con nuestros datos actuales
    const optimisticMsg: ChatMsg = {
      id: `temp-${Date.now()}`,
      userId: myId || '',
      userName: myName || 'You',
      text: t,
      ts: Date.now(),
      subscription: subscription,
      avatar: myAvatar || '🙂'
    }

    console.log('💬 CHATPANEL: Sending optimistic message:', {
      id: optimisticMsg.id,
      userId: optimisticMsg.userId,
      userName: optimisticMsg.userName,
      avatar: optimisticMsg.avatar
    })

    // Mostrar mensaje inmediatamente (eco optimista)
    setMsgs(prev => [...prev, optimisticMsg])

    // Enviar al servidor
    socket.emit(CHAT_SEND, { roomId, text: t })
    setText('')

    // Reemplazar mensaje optimista con el real cuando llegue del servidor
    setTimeout(() => {
      setMsgs(prev => prev.filter(msg => msg.id !== optimisticMsg.id))
    }, 5000) // Remover mensaje optimista después de 5 segundos si no llega el real
  }, [text, roomId, socket, myId, myName, myAvatar, subscription])

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <Dock>
      <Panel>
        <Header>
          <span>Table Chat</span>
        </Header>

        <Messages>
          {msgs.map(m => {
            const mine = !!myId && m.userId === myId
            const displayName = mine ? 'You' : (m.userName || m.userId?.slice(0,4) || 'Player')

            console.log('🎨 CHATPANEL: Rendering message:', {
              id: m.id,
              userId: m.userId,
              userName: m.userName,
              avatar: m.avatar,
              mine,
              displayName
            })

            return (
              <Bubble key={m.id} $mine={mine}>
                <span className="meta" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {!mine && m.avatar ? (
                    console.log('🎨 CHATPANEL: Showing avatar for message:', m.id, 'avatar:', m.avatar, 'mine:', mine, 'userId:', m.userId),
                    <span style={{
                      marginRight: '4px',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}>
                      {m.avatar.startsWith('http') || m.avatar.startsWith('data:') ? (
                        <img
                          src={m.avatar}
                          alt="avatar"
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '1px solid rgba(255,255,255,0.2)',
                            marginRight: '4px'
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: '12px', marginRight: '4px' }}>{m.avatar || '🙂'}</span>
                      )}
                    </span>
                  ) : (
                    console.log('🎨 CHATPANEL: NOT showing avatar for message:', m.id, 'mine:', mine, 'hasAvatar:', !!m.avatar, 'avatar:', m.avatar, 'userId:', m.userId)
                  )}
                  {displayName}
                  {(mine ? subscription : m.subscription) && (mine ? subscription : m.subscription) !== 'free' && (
                    <span style={{
                      color: (mine ? subscription : m.subscription) === 'gold' || (mine ? subscription : m.subscription) === 'diamond' ? '#fbbf24' : '#60a5fa',
                      fontSize: '12px',
                      fontWeight: 'normal',
                      verticalAlign: 'middle',
                      lineHeight: '1',
                      filter: (mine ? subscription : m.subscription) === 'gold' || (mine ? subscription : m.subscription) === 'diamond' ? 'drop-shadow(0 0 3px rgba(251, 191, 36, 0.6))' : 'drop-shadow(0 0 2px rgba(96, 165, 250, 0.4))'
                    }}>
                      {(mine ? subscription : m.subscription) === 'gold' || (mine ? subscription : m.subscription) === 'diamond' ? '👑' : '💎'}
                    </span>
                  )}
                  :
                </span>&nbsp;
                {m.text}
              </Bubble>
            )
          })}
          <div ref={endRef} />
        </Messages>

        <InputRow onSubmit={(e)=>{ e.preventDefault(); send(); }}>
          <TextArea
            value={text}
            onChange={e=>setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a message… (Enter to send, Shift+Enter = line break)"
            style={{
              fontSize: 'clamp(12px, 3vw, 14px)'
            }}
          />
          <SendBtn type="submit" disabled={!text.trim()}>Send</SendBtn>
        </InputRow>
      </Panel>
    </Dock>
  )
}
