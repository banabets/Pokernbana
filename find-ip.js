// Script para encontrar la IP local automáticamente
const { networkInterfaces } = require('os')

console.log('🔍 Buscando tu IP local...\n')

const nets = networkInterfaces()
const results = []

for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    // Solo IPv4 y no localhost
    if (net.family === 'IPv4' && !net.internal) {
      results.push({
        name: name,
        address: net.address,
        netmask: net.netmask
      })
    }
  }
}

if (results.length === 0) {
  console.log('❌ No se encontraron interfaces de red activas')
  console.log('💡 Asegúrate de estar conectado a una red WiFi o Ethernet')
} else {
  console.log('✅ Interfaces de red encontradas:\n')

  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.name}:`)
    console.log(`   📍 IP: ${result.address}`)
    console.log(`   🌐 Para acceder desde móvil: http://${result.address}:5173`)
    console.log('')
  })

  // Sugerir la primera IP como la más probable
  const suggestedIP = results[0].address
  console.log('🎯 IP RECOMENDADA PARA TU TELÉFONO:')
  console.log(`   http://${suggestedIP}:5173`)
  console.log('')
  console.log('📝 Para configurar permanentemente:')
  console.log(`   Crea client/.env con: VITE_SERVER_URL=http://${suggestedIP}:4000`)
}

console.log('\n📖 Para más detalles, lee MOBILE_SETUP.md')


