// Prueba simple para verificar que el servidor recibe el evento de suscripción
import { io } from 'socket.io-client'

console.log('🧪 PRUEBA RÁPIDA: Evento de suscripción\n')

const clientId = 'test-user-' + Date.now()
const UPDATE_SUBSCRIPTION = 'updateSubscription'

const socket = io('http://localhost:4000', {
  transports: ['polling', 'websocket'],
  timeout: 5000,
  query: { clientId }
})

socket.on('connect', () => {
  console.log('✅ Conectado - enviando evento inmediatamente...')
  console.log('📤 Enviando evento de suscripción...')
  socket.emit(UPDATE_SUBSCRIPTION, 'gold')
  console.log('✅ Evento enviado')
})

socket.on('USER_CONNECTED', (data) => {
  console.log('📡 Respuesta del servidor:', data)
  console.log('💎 Suscripción:', data.subscription)

  if (data.subscription === 'gold') {
    console.log('🎉 ✅ EVENTO PROCESADO CORRECTAMENTE!')
  } else {
    console.log('❌ ❌ EVENTO NO PROCESADO')
  }

  socket.disconnect()
  process.exit(0)
})

socket.on('connect_error', (error) => {
  console.log('❌ Error de conexión:', error.message)
  process.exit(1)
})

// Escuchar todos los eventos para debugging
socket.onAny((event, ...args) => {
  console.log('📡 EVENTO RECIBIDO:', event, args)
})

setTimeout(() => {
  console.log('⏰ Timeout')
  socket.disconnect()
  process.exit(1)
}, 5000)
