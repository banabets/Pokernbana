// Prueba simple para verificar si el servidor responde
import { io } from 'socket.io-client'

console.log('🔍 Verificando respuesta del servidor...\n')

const socket = io('http://localhost:4000', {
  transports: ['polling', 'websocket'],
  timeout: 2000
})

let connected = false

socket.on('connect', () => {
  connected = true
  console.log('✅ SERVIDOR RESPONDE - Conexión exitosa!')
  console.log('🔗 Socket ID:', socket.id)
  socket.disconnect()
  process.exit(0)
})

socket.on('connect_error', (error) => {
  console.log('❌ SERVIDOR NO RESPONDE')
  console.log('📋 Error:', error.message)
  process.exit(1)
})

socket.on('error', (error) => {
  console.log('❌ Error de socket:', error.message)
})

// Timeout después de 3 segundos
setTimeout(() => {
  if (!connected) {
    console.log('⏰ Timeout - El servidor no responde en 3 segundos')
    socket.disconnect()
    process.exit(1)
  }
}, 3000)

