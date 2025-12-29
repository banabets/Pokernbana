// Script completo para probar el flujo de suscripciones premium
import { io } from 'socket.io-client'

console.log('🔬 PRUEBA COMPLETA: Flujo de suscripciones premium\n')

const clientId = 'test-user-' + Date.now()
console.log(`🆔 Usando clientId: ${clientId}`)

// Evento correcto para actualizar suscripción
const UPDATE_SUBSCRIPTION = 'updateSubscription'

let socket = null

async function testSubscriptionFlow() {
  console.log('📋 PASO 1: Conectar por primera vez (debería ser free)')

  socket = io('http://localhost:4000', {
    transports: ['polling', 'websocket'],
    timeout: 5000,
    query: { clientId }
  })

  return new Promise((resolve) => {
    socket.on('connect', () => {
      console.log('✅ Conectado al servidor')
    })

    socket.on('USER_CONNECTED', (data) => {
      console.log('📡 Primera conexión - Datos recibidos:', data)
      console.log('💎 Suscripción inicial:', data.subscription)

      socket.disconnect()
      resolve(data.subscription)
    })

    socket.on('connect_error', (error) => {
      console.log('❌ Error de conexión:', error.message)
      resolve(null)
    })
  })
}

async function purchaseSubscription() {
  console.log('\n📋 PASO 2: Comprar suscripción premium')

  socket = io('http://localhost:4000', {
    transports: ['polling', 'websocket'],
    timeout: 5000,
    query: { clientId }
  })

  return new Promise((resolve) => {
    socket.on('connect', () => {
      console.log('✅ Reconectado al servidor')

      // Simular compra de suscripción premium
      setTimeout(() => {
        console.log('💳 Enviando compra de suscripción GOLD...')
        socket.emit(UPDATE_SUBSCRIPTION, 'gold')
      }, 1000)
    })

    socket.on('USER_CONNECTED', (data) => {
      console.log('📡 Conexión después de compra - Datos:', data)

      if (data.subscription === 'gold') {
        console.log('🎉 ✅ SUSCRIPCIÓN COMPRADA EXITOSAMENTE!')
        socket.disconnect()
        resolve(true)
      }
    })

    socket.on('connect_error', (error) => {
      console.log('❌ Error de conexión:', error.message)
      resolve(false)
    })
  })
}

async function testPersistence() {
  console.log('\n📋 PASO 3: Simular recarga de página (nueva conexión)')

  socket = io('http://localhost:4000', {
    transports: ['polling', 'websocket'],
    timeout: 5000,
    query: { clientId }
  })

  return new Promise((resolve) => {
    socket.on('connect', () => {
      console.log('✅ Nueva conexión (simulando recarga de página)')
    })

    socket.on('USER_CONNECTED', (data) => {
      console.log('📡 Datos después de "recarga":', data)
      console.log('💎 Suscripción después de recarga:', data.subscription)

      socket.disconnect()

      if (data.subscription === 'gold') {
        console.log('🎉 ✅ SUSCRIPCIÓN PERSISTENTE - ¡ÉXITO TOTAL!')
        resolve(true)
      } else {
        console.log('❌ ❌ SUSCRIPCIÓN PERDIDA - ¡FALLÓ!')
        resolve(false)
      }
    })

    socket.on('connect_error', (error) => {
      console.log('❌ Error de conexión:', error.message)
      resolve(false)
    })
  })
}

async function runTest() {
  try {
    // Paso 1: Conectar por primera vez
    const initialSubscription = await testSubscriptionFlow()
    if (initialSubscription !== 'free') {
      console.log('⚠️  ADVERTENCIA: La suscripción inicial no es free')
    }

    // Paso 2: Comprar suscripción
    const purchaseSuccess = await purchaseSubscription()
    if (!purchaseSuccess) {
      console.log('❌ FALLÓ: No se pudo comprar la suscripción')
      return
    }

    // Esperar un momento para que se guarde
    console.log('⏳ Esperando que se guarde la suscripción...')
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Paso 3: Simular recarga de página
    const persistenceSuccess = await testPersistence()

    console.log('\n' + '='.repeat(50))
    if (persistenceSuccess) {
      console.log('🎉 RESULTADO FINAL: ✅ SUSCRIPCIONES PREMIUM FUNCIONAN PERFECTAMENTE')
      console.log('   - Se compran correctamente')
      console.log('   - Se guardan en el servidor')
      console.log('   - Se mantienen después de recargar')
    } else {
      console.log('❌ RESULTADO FINAL: ❌ SUSCRIPCIONES PREMIUM FALLAN')
    }
    console.log('='.repeat(50))

  } catch (error) {
    console.log('💥 ERROR en la prueba:', error.message)
  } finally {
    process.exit(0)
  }
}

// Ejecutar la prueba completa
runTest()

setTimeout(() => {
  console.log('⏰ Timeout global - terminando prueba')
  if (socket) socket.disconnect()
  process.exit(1)
}, 30000)
