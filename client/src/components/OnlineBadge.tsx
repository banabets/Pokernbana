import React from 'react'
import type { Socket } from 'socket.io-client'
import * as Protocol from 'shared/protocol'
const { ClientEvents, ServerEvents } = Protocol

type OnlineCountPayload = { count: number }

export default function OnlineBadge({ socket }: { socket: Socket }) {
  const [n, setN] = React.useState(0)

  React.useEffect(() => {
    const onCount = (p: OnlineCountPayload) => setN(p?.count ?? 0)
    socket.on(ServerEvents.ONLINE_COUNT, onCount)
    socket.emit(ClientEvents.GET_ONLINE_COUNT) // pide el valor actual al montar
    return () => socket.off(ServerEvents.ONLINE_COUNT, onCount)
  }, [socket])

  return (
    <div className="pill online-pill">
      <span className="online-dot" />
      {n} online
    </div>
  )
}
