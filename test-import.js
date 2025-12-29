// Script de prueba para verificar imports
console.log('Testing imports...')

try {
  // Prueba 1: Import desde la raíz del proyecto
  const { ClientEvents } = await import('./shared/protocol.js')
  console.log('✅ Import from root: SUCCESS')
  console.log('ClientEvents.UPDATE_SUBSCRIPTION:', ClientEvents.UPDATE_SUBSCRIPTION)
} catch (error) {
  console.log('❌ Import from root: FAILED')
  console.log('Error:', error.message)
}

try {
  // Prueba 2: Import con extensión .ts
  const { ClientEvents } = await import('./shared/protocol.ts')
  console.log('✅ Import with .ts extension: SUCCESS')
} catch (error) {
  console.log('❌ Import with .ts extension: FAILED')
  console.log('Error:', error.message)
}

try {
  // Prueba 3: Import sin extensión
  const { ClientEvents } = await import('./shared/protocol')
  console.log('✅ Import without extension: SUCCESS')
} catch (error) {
  console.log('❌ Import without extension: FAILED')
  console.log('Error:', error.message)
}


