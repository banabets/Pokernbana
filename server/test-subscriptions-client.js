// Script de prueba para verificar que las suscripciones se cargan correctamente
import { io } from 'socket.io-client'

console.log('🧪 Probando carga de suscripciones del servidor...')

const socket = io('http://localhost:4000', {
  transports: ['polling', 'websocket'],
  timeout: 5000,
  query: { clientId: 'test-user-123' } // Usar un userId que existe en el archivo
})

socket.on('connect', () => {
  console.log('✅ Conectado al servidor')
})

socket.on('USER_CONNECTED', (data) => {
  console.log('📡 Datos recibidos del servidor:', data)
  console.log('💎 Suscripción recibida:', data.subscription)

  if (data.subscription === 'gold') {
    console.log('🎉 ✅ SUSCRIPCIÓN CARGADA CORRECTAMENTE!')
  } else {
    console.log('❌ ❌ SUSCRIPCIÓN NO CARGADA - Recibido:', data.subscription)
  }

  socket.disconnect()
  process.exit(0)
})

socket.on('connect_error', (error) => {
  console.log('❌ Error de conexión:', error.message)
  process.exit(1)
})

setTimeout(() => {
  console.log('⏰ Timeout - cerrando conexión')
  socket.disconnect()
  process.exit(1)
}, 10000)

