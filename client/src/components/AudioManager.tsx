import React, { useEffect, useRef, useCallback, createContext, useContext } from 'react'
import { useSound, stopAllSounds } from '../hooks/useSound'

// Contexto para el estado de audio global
interface AudioContextType {
  isInGame: boolean
  setIsInGame: (inGame: boolean) => void
  currentScreen: string
  setCurrentScreen: (screen: string) => void
}

const AudioContext = createContext<AudioContextType | null>(null)

export const useAudioContext = () => {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useAudioContext must be used within AudioManager')
  }
  return context
}

interface AudioManagerProps {
  children: React.ReactNode
}

const AudioManager: React.FC<AudioManagerProps> = ({ children }) => {
  const { settings } = useSound()
  const [isInGame, setIsInGame] = React.useState(false)
  const [currentScreen, setCurrentScreen] = React.useState('lobby')
  const lastSoundTimeRef = useRef<{[key: string]: number}>({})
  const soundCooldownMs = 150 // Cooldown mínimo entre sonidos del mismo tipo

  // Función para reproducir sonidos con cooldown inteligente
  const playSoundSmart = useCallback((soundType: string, volume?: number) => {
    const now = Date.now()
    const lastTime = lastSoundTimeRef.current[soundType] || 0

    // Aplicar cooldown solo para sonidos UI y acciones repetitivas
    const uiSounds = ['button_click', 'button_hover', 'notification']
    if (uiSounds.includes(soundType) && (now - lastTime) < soundCooldownMs) {
      return // Ignorar sonido si está en cooldown
    }

    lastSoundTimeRef.current[soundType] = now

    // Importar y usar useSound dinámicamente
    import('../hooks/useSound').then(({ useSound: useSoundHook }) => {
      // Nota: En un componente real, usaríamos el hook directamente
      // Aquí solo mostramos la lógica
    })
  }, [])

  // Gestionar cambios de pantalla
  useEffect(() => {
    switch (currentScreen) {
      case 'lobby':
        // Música de lobby
        if (settings.enableBackgroundMusic && !isInGame) {
          // La BackgroundMusic component se encargará
        }
        break
      case 'game':
        // Música de juego más intensa
        if (settings.enableBackgroundMusic && isInGame) {
          // Podríamos cambiar la música aquí
        }
        break
      case 'store':
      case 'settings':
        // Silenciar música ambiental en pantallas de menú
        if (settings.enableBackgroundMusic) {
          // Podríamos bajar el volumen aquí
        }
        break
    }
  }, [currentScreen, isInGame, settings.enableBackgroundMusic])

  // Limpiar cooldowns periódicamente
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now()
      Object.keys(lastSoundTimeRef.current).forEach(soundType => {
        if (now - lastSoundTimeRef.current[soundType] > 5000) {
          delete lastSoundTimeRef.current[soundType]
        }
      })
    }, 5000)

    return () => clearInterval(cleanup)
  }, [])

  // Función para detener sonidos cuando cambiamos de pantalla
  const handleScreenChange = useCallback((newScreen: string) => {
    setCurrentScreen(newScreen)

    // Detener sonidos ambientales cuando entramos a pantallas de menú
    if (['store', 'settings', 'profile'].includes(newScreen)) {
      // Detener música de fondo temporalmente
      stopAllSounds()
    }
  }, [])

  const contextValue: AudioContextType = {
    isInGame,
    setIsInGame,
    currentScreen,
    setCurrentScreen: handleScreenChange
  }

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  )
}

export default AudioManager
