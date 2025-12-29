import { useCallback } from 'react'

type SoundType =
  // Cartas
  | 'card_deal' | 'card_flip' | 'card_shuffle' | 'card_collect'
  // Fichas
  | 'chip_stack' | 'chip_move' | 'chip_count' | 'chip_allin'
  // Acciones
  | 'button_click' | 'button_hover' | 'fold' | 'raise' | 'call' | 'check' | 'allin'
  // Eventos del juego
  | 'win' | 'lose' | 'draw' | 'new_round' | 'showdown' | 'timer_tick' | 'turn_start'
  // Ambiente
  | 'background_music' | 'ambient_casino' | 'crowd_cheer' | 'tension_build'
  // UI
  | 'notification' | 'error' | 'success' | 'warning'
  // Especiales
  | 'royal_flush' | 'straight_flush' | 'four_kind' | 'full_house' | 'flush' | 'straight'

interface SoundSettings {
  enabled: boolean
  masterVolume: number
  // Volúmenes específicos por categoría
  gameVolume: number
  uiVolume: number
  ambientVolume: number
  musicVolume: number
  // Configuraciones especiales
  enableBackgroundMusic: boolean
  enableAmbientSounds: boolean
  enableHandCombos: boolean
  enableNotifications: boolean
}

// Singleton AudioContext para mejor rendimiento
let sharedAudioContext: AudioContext | null = null
let audioContextInitialized = false

function getAudioContext(): AudioContext {
  if (!sharedAudioContext) {
    sharedAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    audioContextInitialized = true
  }

  // Resume context if suspended (required by some browsers)
  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch(console.warn)
  }

  return sharedAudioContext
}

// Función para detener todos los sonidos activos
export function stopAllSounds() {
  if (sharedAudioContext && audioContextInitialized) {
    try {
      // Detener todos los nodos de audio activos
      sharedAudioContext.suspend()
      // Resume después de un breve delay
      setTimeout(() => {
        if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
          sharedAudioContext.resume().catch(console.warn)
        }
      }, 100)
    } catch (error) {
      console.warn('Error stopping sounds:', error)
    }
  }
}

// Sistema de cooldown para evitar sonidos duplicados
const soundCooldowns = new Map<string, number>()
const COOLDOWN_MS = 150 // 150ms entre sonidos del mismo tipo

function canPlaySound(soundType: string): boolean {
  const now = Date.now()
  const lastPlayed = soundCooldowns.get(soundType) || 0

  if (now - lastPlayed > COOLDOWN_MS) {
    soundCooldowns.set(soundType, now)
    return true
  }

  return false
}

// Función de limpieza para liberar memoria
function cleanupCooldowns() {
  const now = Date.now()
  const toDelete: string[] = []

  soundCooldowns.forEach((time, soundType) => {
    if (now - time > 5000) { // Limpiar cooldowns después de 5 segundos
      toDelete.push(soundType)
    }
  })

  toDelete.forEach(soundType => soundCooldowns.delete(soundType))
}

// Limpiar cooldowns periódicamente
setInterval(cleanupCooldowns, 10000)

export function useSound(settings?: Partial<SoundSettings>) {
  const defaultSettings: SoundSettings = {
    enabled: true,
    masterVolume: 0.8,
    gameVolume: 0.6,
    uiVolume: 0.4,
    ambientVolume: 0.3,
    musicVolume: 0.2,
    enableBackgroundMusic: true,
    enableAmbientSounds: true,
    enableHandCombos: true,
    enableNotifications: true,
    ...settings
  }

  const getVolumeForType = useCallback((soundType: SoundType, customVolume?: number) => {
    if (customVolume !== undefined) return customVolume

    let categoryVolume = 1.0

    // Determinar categoría del sonido y aplicar volumen correspondiente
    if (['card_deal', 'card_flip', 'card_shuffle', 'card_collect', 'chip_stack', 'chip_move', 'chip_count', 'chip_allin', 'fold', 'raise', 'call', 'check', 'allin', 'win', 'lose', 'draw', 'new_round', 'showdown', 'timer_tick', 'turn_start', 'royal_flush', 'straight_flush', 'four_kind', 'full_house', 'flush', 'straight'].includes(soundType)) {
      categoryVolume = defaultSettings.gameVolume
    } else if (['button_click', 'button_hover', 'notification', 'error', 'success', 'warning'].includes(soundType)) {
      categoryVolume = defaultSettings.uiVolume
    } else if (['background_music', 'ambient_casino', 'crowd_cheer', 'tension_build'].includes(soundType)) {
      categoryVolume = defaultSettings.ambientVolume
    }

    return categoryVolume * defaultSettings.masterVolume
  }, [defaultSettings])

  const playSound = useCallback((soundType: SoundType, customVolume?: number, options?: { force?: boolean }) => {
    if (!defaultSettings.enabled && !options?.force) return

    // Verificar configuraciones específicas
    if (['background_music'].includes(soundType) && !defaultSettings.enableBackgroundMusic) return
    if (['ambient_casino', 'crowd_cheer', 'tension_build'].includes(soundType) && !defaultSettings.enableAmbientSounds) return
    if (['notification', 'error', 'success', 'warning'].includes(soundType) && !defaultSettings.enableNotifications) return
    if (['royal_flush', 'straight_flush', 'four_kind', 'full_house', 'flush', 'straight'].includes(soundType) && !defaultSettings.enableHandCombos) return

    // Sistema de cooldown para evitar sonidos duplicados (excepto sonidos críticos)
    const criticalSounds = ['win', 'lose', 'royal_flush', 'allin', 'new_round', 'showdown']
    if (!criticalSounds.includes(soundType) && !canPlaySound(soundType) && !options?.force) {
      return
    }

    const volume = getVolumeForType(soundType, customVolume)

    // Use shared audio context for better performance
    const audioContext = getAudioContext()

    switch (soundType) {
      case 'card_deal':
        playCardDeal(audioContext, volume)
        break
      case 'chip_stack':
        playChipStack(audioContext, volume)
        break
      case 'button_click':
        playButtonClick(audioContext, volume)
        break
      case 'win':
        playWinSound(audioContext, volume)
        break
      case 'lose':
        playLoseSound(audioContext, volume)
        break
      case 'fold':
        playFoldSound(audioContext, volume)
        break
      case 'raise':
        playRaiseSound(audioContext, volume)
        break
      case 'call':
        playCallSound(audioContext, volume)
        break
      case 'check':
        playCheckSound(audioContext, volume)
        break
      case 'timer_tick':
        playTimerTick(audioContext, volume)
        break
      // Nuevos sonidos de cartas
      case 'card_flip':
        playCardFlip(audioContext, volume)
        break
      case 'card_shuffle':
        playCardShuffle(audioContext, volume)
        break
      case 'card_collect':
        playCardCollect(audioContext, volume)
        break
      // Nuevos sonidos de fichas
      case 'chip_move':
        playChipMove(audioContext, volume)
        break
      case 'chip_count':
        playChipCount(audioContext, volume)
        break
      case 'chip_allin':
        playChipAllIn(audioContext, volume)
        break
      // Nuevos sonidos de acciones
      case 'button_hover':
        playButtonHover(audioContext, volume)
        break
      case 'allin':
        playAllInSound(audioContext, volume)
        break
      // Nuevos sonidos de eventos
      case 'draw':
        playDrawSound(audioContext, volume)
        break
      case 'new_round':
        playNewRoundSound(audioContext, volume)
        break
      case 'showdown':
        playShowdownSound(audioContext, volume)
        break
      case 'turn_start':
        playTurnStartSound(audioContext, volume)
        break
      // Sonidos ambientales
      case 'background_music':
        playBackgroundMusic(audioContext, volume)
        break
      case 'ambient_casino':
        playAmbientCasino(audioContext, volume)
        break
      case 'crowd_cheer':
        playCrowdCheer(audioContext, volume)
        break
      case 'tension_build':
        playTensionBuild(audioContext, volume)
        break
      // Sonidos de UI
      case 'notification':
        playNotification(audioContext, volume)
        break
      case 'error':
        playError(audioContext, volume)
        break
      case 'success':
        playSuccess(audioContext, volume)
        break
      case 'warning':
        playWarning(audioContext, volume)
        break
      // Sonidos de manos especiales
      case 'royal_flush':
        playRoyalFlush(audioContext, volume)
        break
      case 'straight_flush':
        playStraightFlush(audioContext, volume)
        break
      case 'four_kind':
        playFourKind(audioContext, volume)
        break
      case 'full_house':
        playFullHouse(audioContext, volume)
        break
      case 'flush':
        playFlush(audioContext, volume)
        break
      case 'straight':
        playStraight(audioContext, volume)
        break
    }
  }, [defaultSettings, getVolumeForType])

  const updateSettings = useCallback((newSettings: Partial<SoundSettings>) => {
    Object.assign(defaultSettings, newSettings)
  }, [])

  return {
    playSound,
    updateSettings,
    stopAllSounds,
    settings: defaultSettings,
    isEnabled: defaultSettings.enabled,
    masterVolume: defaultSettings.masterVolume,
    gameVolume: defaultSettings.gameVolume,
    uiVolume: defaultSettings.uiVolume,
    ambientVolume: defaultSettings.ambientVolume,
    musicVolume: defaultSettings.musicVolume
  }
}

// Sound generation functions using Web Audio API
function playCardDeal(audioContext: AudioContext, volume: number) {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1)

  gainNode.gain.setValueAtTime(0, audioContext.currentTime)
  gainNode.gain.linearRampToValueAtTime(volume * 0.3, audioContext.currentTime + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.1)
}

function playChipStack(audioContext: AudioContext, volume: number) {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
  oscillator.frequency.linearRampToValueAtTime(100, audioContext.currentTime + 0.3)

  gainNode.gain.setValueAtTime(0, audioContext.currentTime)
  gainNode.gain.linearRampToValueAtTime(volume * 0.2, audioContext.currentTime + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.3)
}

function playButtonClick(audioContext: AudioContext, volume: number) {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.setValueAtTime(1000, audioContext.currentTime)

  gainNode.gain.setValueAtTime(0, audioContext.currentTime)
  gainNode.gain.linearRampToValueAtTime(volume * 0.1, audioContext.currentTime + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.05)
}

function playWinSound(audioContext: AudioContext, volume: number) {
  // Create a triumphant ascending melody
  const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6

  notes.forEach((frequency, index) => {
    setTimeout(() => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume * 0.15, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    }, index * 100)
  })
}

function playLoseSound(audioContext: AudioContext, volume: number) {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.setValueAtTime(300, audioContext.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.5)

  gainNode.gain.setValueAtTime(0, audioContext.currentTime)
  gainNode.gain.linearRampToValueAtTime(volume * 0.2, audioContext.currentTime + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.5)
}

function playFoldSound(audioContext: AudioContext, volume: number) {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2)

  gainNode.gain.setValueAtTime(0, audioContext.currentTime)
  gainNode.gain.linearRampToValueAtTime(volume * 0.15, audioContext.currentTime + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.2)
}

function playRaiseSound(audioContext: AudioContext, volume: number) {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
  oscillator.frequency.linearRampToValueAtTime(800, audioContext.currentTime + 0.1)

  gainNode.gain.setValueAtTime(0, audioContext.currentTime)
  gainNode.gain.linearRampToValueAtTime(volume * 0.2, audioContext.currentTime + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.1)
}

function playCallSound(audioContext: AudioContext, volume: number) {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.setValueAtTime(400, audioContext.currentTime)

  gainNode.gain.setValueAtTime(0, audioContext.currentTime)
  gainNode.gain.linearRampToValueAtTime(volume * 0.1, audioContext.currentTime + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.08)
}

function playCheckSound(audioContext: AudioContext, volume: number) {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.setValueAtTime(300, audioContext.currentTime)

  gainNode.gain.setValueAtTime(0, audioContext.currentTime)
  gainNode.gain.linearRampToValueAtTime(volume * 0.08, audioContext.currentTime + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.06)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.06)
}

function playTimerTick(audioContext: AudioContext, volume: number) {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.setValueAtTime(1000, audioContext.currentTime)

  gainNode.gain.setValueAtTime(0, audioContext.currentTime)
  gainNode.gain.linearRampToValueAtTime(volume * 0.05, audioContext.currentTime + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.03)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.03)
}

// Utility function for haptic feedback
export function triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light') {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [50],
      medium: [100],
      heavy: [200]
    }
    navigator.vibrate(patterns[type])
  }
}

// 🎴 Nuevas funciones de sonido para cartas
function playCardFlip(audioContext: AudioContext, volume: number) {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
  oscillator.frequency.linearRampToValueAtTime(400, audioContext.currentTime + 0.05)

  gainNode.gain.setValueAtTime(0, audioContext.currentTime)
  gainNode.gain.linearRampToValueAtTime(volume * 0.2, audioContext.currentTime + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.05)
}

function playCardShuffle(audioContext: AudioContext, volume: number) {
  // Simular sonido de mezclar cartas con múltiples frecuencias
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      const freq = 200 + Math.random() * 400
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume * 0.1, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    }, i * 30)
  }
}

function playCardCollect(audioContext: AudioContext, volume: number) {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.setValueAtTime(300, audioContext.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.3)

  gainNode.gain.setValueAtTime(0, audioContext.currentTime)
  gainNode.gain.linearRampToValueAtTime(volume * 0.25, audioContext.currentTime + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.3)
}

// 💰 Nuevas funciones de sonido para fichas
function playChipMove(audioContext: AudioContext, volume: number) {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.setValueAtTime(180, audioContext.currentTime)
  oscillator.frequency.linearRampToValueAtTime(120, audioContext.currentTime + 0.15)

  gainNode.gain.setValueAtTime(0, audioContext.currentTime)
  gainNode.gain.linearRampToValueAtTime(volume * 0.15, audioContext.currentTime + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.15)
}

function playChipCount(audioContext: AudioContext, volume: number) {
  // Sonido de contar fichas con patrón rítmico
  const pattern = [0, 0.1, 0.2, 0.3, 0.4, 0.5]
  pattern.forEach((delay, index) => {
    setTimeout(() => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(250 + index * 20, audioContext.currentTime)

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume * 0.08, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.05)
    }, delay * 1000)
  })
}

function playChipAllIn(audioContext: AudioContext, volume: number) {
  // Sonido dramático para all-in
  const notes = [400, 500, 600, 700, 800]
  notes.forEach((freq, index) => {
    setTimeout(() => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume * 0.3, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    }, index * 80)
  })
}

// 🎯 Nuevas funciones de sonido para acciones
function playButtonHover(audioContext: AudioContext, volume: number) {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.setValueAtTime(800, audioContext.currentTime)

  gainNode.gain.setValueAtTime(0, audioContext.currentTime)
  gainNode.gain.linearRampToValueAtTime(volume * 0.05, audioContext.currentTime + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.02)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.02)
}

function playAllInSound(audioContext: AudioContext, volume: number) {
  // Sonido épico para all-in
  const frequencies = [300, 400, 500, 600, 700, 800]
  frequencies.forEach((freq, index) => {
    setTimeout(() => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume * 0.25, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.15)
    }, index * 50)
  })
}

// 🎲 Nuevas funciones de sonido para eventos del juego
function playDrawSound(audioContext: AudioContext, volume: number) {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.setValueAtTime(250, audioContext.currentTime)
  oscillator.frequency.linearRampToValueAtTime(200, audioContext.currentTime + 0.3)

  gainNode.gain.setValueAtTime(0, audioContext.currentTime)
  gainNode.gain.linearRampToValueAtTime(volume * 0.2, audioContext.currentTime + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.3)
}

function playNewRoundSound(audioContext: AudioContext, volume: number) {
  const notes = [400, 500, 600]
  notes.forEach((freq, index) => {
    setTimeout(() => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume * 0.15, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    }, index * 100)
  })
}

function playShowdownSound(audioContext: AudioContext, volume: number) {
  // Sonido dramático de showdown
  const pattern = [600, 700, 800, 900, 1000]
  pattern.forEach((freq, index) => {
    setTimeout(() => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume * 0.2, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.08)
    }, index * 60)
  })
}

function playTurnStartSound(audioContext: AudioContext, volume: number) {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.setValueAtTime(500, audioContext.currentTime)
  oscillator.frequency.linearRampToValueAtTime(600, audioContext.currentTime + 0.1)

  gainNode.gain.setValueAtTime(0, audioContext.currentTime)
  gainNode.gain.linearRampToValueAtTime(volume * 0.12, audioContext.currentTime + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.1)
}

// 🎵 Funciones de sonido ambientales
function playBackgroundMusic(audioContext: AudioContext, volume: number) {
  // Música de fondo simple pero atmosférica
  const melody = [400, 450, 500, 450, 400, 350, 300, 350]
  melody.forEach((freq, index) => {
    setTimeout(() => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume * 0.05, audioContext.currentTime + 0.1)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.0)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 1.0)
    }, index * 800)
  })
}

function playAmbientCasino(audioContext: AudioContext, volume: number) {
  // Ruido de fondo de casino
  const bufferSize = audioContext.sampleRate * 2
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
  const output = buffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i++) {
    output[i] = (Math.random() * 2 - 1) * 0.1
  }

  const source = audioContext.createBufferSource()
  const gainNode = audioContext.createGain()

  source.buffer = buffer
  source.connect(gainNode)
  gainNode.connect(audioContext.destination)

  gainNode.gain.setValueAtTime(volume * 0.02, audioContext.currentTime)

  source.start()
  source.stop(audioContext.currentTime + 3)
}

function playCrowdCheer(audioContext: AudioContext, volume: number) {
  // Aplausos y vítores
  for (let i = 0; i < 15; i++) {
    setTimeout(() => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      const freq = 200 + Math.random() * 800
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume * 0.08, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    }, i * 20 + Math.random() * 50)
  }
}

function playTensionBuild(audioContext: AudioContext, volume: number) {
  // Construcción de tensión
  const frequencies = [200, 220, 240, 260, 280, 300]
  frequencies.forEach((freq, index) => {
    setTimeout(() => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume * 0.1, audioContext.currentTime + 0.1)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 2.0)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 2.0)
    }, index * 200)
  })
}

// 🔔 Funciones de sonido para UI
function playNotification(audioContext: AudioContext, volume: number) {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
  oscillator.frequency.linearRampToValueAtTime(600, audioContext.currentTime + 0.1)

  gainNode.gain.setValueAtTime(0, audioContext.currentTime)
  gainNode.gain.linearRampToValueAtTime(volume * 0.15, audioContext.currentTime + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.1)
}

function playError(audioContext: AudioContext, volume: number) {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.setValueAtTime(300, audioContext.currentTime)
  oscillator.frequency.linearRampToValueAtTime(200, audioContext.currentTime + 0.3)

  gainNode.gain.setValueAtTime(0, audioContext.currentTime)
  gainNode.gain.linearRampToValueAtTime(volume * 0.2, audioContext.currentTime + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.3)
}

function playSuccess(audioContext: AudioContext, volume: number) {
  const notes = [400, 500, 600]
  notes.forEach((freq, index) => {
    setTimeout(() => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume * 0.15, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.15)
    }, index * 80)
  })
}

function playWarning(audioContext: AudioContext, volume: number) {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
  oscillator.frequency.linearRampToValueAtTime(400, audioContext.currentTime + 0.2)

  gainNode.gain.setValueAtTime(0, audioContext.currentTime)
  gainNode.gain.linearRampToValueAtTime(volume * 0.12, audioContext.currentTime + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.2)
}

// 🏆 Funciones de sonido para manos especiales
function playRoyalFlush(audioContext: AudioContext, volume: number) {
  // Secuencia épica para Royal Flush
  const royalMelody = [523, 587, 659, 698, 784, 880] // Do, Re, Mi, Fa, Sol, La
  royalMelody.forEach((freq, index) => {
    setTimeout(() => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume * 0.25, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    }, index * 150)
  })
}

function playStraightFlush(audioContext: AudioContext, volume: number) {
  const notes = [400, 450, 500, 550, 600]
  notes.forEach((freq, index) => {
    setTimeout(() => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume * 0.2, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.25)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.25)
    }, index * 120)
  })
}

function playFourKind(audioContext: AudioContext, volume: number) {
  const notes = [300, 400, 500, 600, 700]
  notes.forEach((freq, index) => {
    setTimeout(() => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume * 0.18, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    }, index * 100)
  })
}

function playFullHouse(audioContext: AudioContext, volume: number) {
  const notes = [350, 400, 350, 450, 400]
  notes.forEach((freq, index) => {
    setTimeout(() => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume * 0.15, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.15)
    }, index * 80)
  })
}

function playFlush(audioContext: AudioContext, volume: number) {
  const notes = [400, 500, 600, 500, 400]
  notes.forEach((freq, index) => {
    setTimeout(() => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume * 0.12, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    }, index * 60)
  })
}

function playStraight(audioContext: AudioContext, volume: number) {
  const notes = [300, 350, 400, 450, 500]
  notes.forEach((freq, index) => {
    setTimeout(() => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume * 0.1, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.08)
    }, index * 50)
  })
}
