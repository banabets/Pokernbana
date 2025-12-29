// Script de prueba para verificar persistencia de suscripciones
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SUBSCRIPTIONS_FILE = './data/userSubscriptions.json'

// Función para cargar suscripciones
function loadSubscriptions() {
  try {
    const filePath = path.resolve(SUBSCRIPTIONS_FILE)
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8')
      const subscriptions = JSON.parse(data)
      console.log('✅ Suscripciones cargadas:', subscriptions)
      return subscriptions
    } else {
      console.log('❌ Archivo de suscripciones no existe')
      return {}
    }
  } catch (error) {
    console.log('❌ Error cargando suscripciones:', error.message)
    return {}
  }
}

// Función para guardar suscripciones
function saveSubscriptions(subscriptions) {
  try {
    const filePath = path.resolve(SUBSCRIPTIONS_FILE)
    const dirPath = path.dirname(filePath)

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }

    fs.writeFileSync(filePath, JSON.stringify(subscriptions, null, 2))
    console.log('✅ Suscripciones guardadas:', subscriptions)
  } catch (error) {
    console.log('❌ Error guardando suscripciones:', error.message)
  }
}

// Probar funcionalidad
console.log('🧪 Probando persistencia de suscripciones...\n')

// Cargar suscripciones existentes
const existing = loadSubscriptions()

// Agregar una nueva suscripción de prueba
const testUserId = 'test-user-' + Date.now()
existing[testUserId] = 'gold'

console.log('\n📝 Agregando suscripción de prueba:', testUserId, '=', existing[testUserId])

// Guardar suscripciones actualizadas
saveSubscriptions(existing)

console.log('\n🔄 Recargando suscripciones...')
const reloaded = loadSubscriptions()

console.log('\n🎯 Verificación:')
console.log('- Suscripción guardada:', reloaded[testUserId] === 'gold' ? '✅' : '❌')
console.log('- Archivo existe:', fs.existsSync(path.resolve(SUBSCRIPTIONS_FILE)) ? '✅' : '❌')
