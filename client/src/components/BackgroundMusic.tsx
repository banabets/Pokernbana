import React, { useEffect, useRef, useCallback } from 'react'
import { useSound } from '../hooks/useSound'

const BackgroundMusic: React.FC = () => {
  const { settings, playSound } = useSound()
  const musicIntervalRef = useRef<NodeJS.Timeout>()
  const ambientIntervalRef = useRef<NodeJS.Timeout>()
  const isPlayingRef = useRef(false)

  // 🎵 Función memoizada para reproducir música
  const playBackgroundMusic = useCallback(() => {
    if (settings.enableBackgroundMusic && settings.musicVolume > 0 && !isPlayingRef.current) {
      isPlayingRef.current = true
      playSound('background_music')
      // Reset flag after sound duration (assuming ~3 seconds)
      setTimeout(() => {
        isPlayingRef.current = false
      }, 3000)
    }
  }, [settings.enableBackgroundMusic, settings.musicVolume, playSound])

  // 🎭 Función memoizada para sonidos ambientales
  const playAmbientSounds = useCallback(() => {
    if (settings.enableAmbientSounds && settings.ambientVolume > 0) {
      const ambientSounds = ['ambient_casino', 'crowd_cheer', 'tension_build']
      const randomSound = ambientSounds[Math.floor(Math.random() * ambientSounds.length)]
      playSound(randomSound, undefined, { force: true })
    }
  }, [settings.enableAmbientSounds, settings.ambientVolume, playSound])

  useEffect(() => {
    // Limpiar intervalos anteriores
    if (musicIntervalRef.current) {
      clearInterval(musicIntervalRef.current)
      musicIntervalRef.current = undefined
    }
    if (ambientIntervalRef.current) {
      clearInterval(ambientIntervalRef.current)
      ambientIntervalRef.current = undefined
    }

    // Iniciar música de fondo solo si está habilitada
    if (settings.enableBackgroundMusic && settings.musicVolume > 0) {
      // Reproducir inmediatamente
      playBackgroundMusic()
      // Repetir cada 2 minutos
      musicIntervalRef.current = setInterval(playBackgroundMusic, 120000)
    }

    // Iniciar sonidos ambientales solo si están habilitados
    if (settings.enableAmbientSounds && settings.ambientVolume > 0) {
      // Primer sonido después de 30 segundos
      const initialTimeout = setTimeout(playAmbientSounds, 30000)
      // Luego cada 45-90 segundos aleatoriamente
      ambientIntervalRef.current = setInterval(() => {
        const delay = Math.random() * 45000
        setTimeout(playAmbientSounds, delay)
      }, 45000)

      return () => {
        clearTimeout(initialTimeout)
      }
    }
  }, [settings.enableBackgroundMusic, settings.enableAmbientSounds, settings.musicVolume, settings.ambientVolume, playBackgroundMusic, playAmbientSounds])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (musicIntervalRef.current) {
        clearInterval(musicIntervalRef.current)
      }
      if (ambientIntervalRef.current) {
        clearInterval(ambientIntervalRef.current)
      }
      isPlayingRef.current = false
    }
  }, [])

  // No renderiza nada visual, solo maneja la música de fondo
  return null
}

export default BackgroundMusic
