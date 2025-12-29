import React from 'react'
import styled from 'styled-components'
import { useSound } from '../hooks/useSound'

const DebugContainer = styled.div`
  position: fixed;
  bottom: 100px;
  left: 20px;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  z-index: 1000;
  backdrop-filter: blur(20px);
  max-width: 300px;
  font-size: 12px;
`

const DebugTitle = styled.h4`
  color: #f59e0b;
  margin: 0 0 var(--spacing-sm) 0;
  font-size: 14px;
`

const DebugItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  color: white;
`

const DebugValue = styled.span`
  color: #f59e0b;
  font-weight: 600;
`

const TestButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  margin-top: var(--spacing-sm);
`

const TestButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: scale(0.95);
  }
`

interface AudioDebugProps {
  isVisible?: boolean
}

const AudioDebug: React.FC<AudioDebugProps> = ({ isVisible = false }) => {
  const { settings, playSound, stopAllSounds } = useSound()

  if (!isVisible) return null

  const testSounds = [
    'button_click', 'card_deal', 'chip_stack',
    'win', 'lose', 'royal_flush', 'allin'
  ]

  return (
    <DebugContainer>
      <DebugTitle>🎵 Audio Debug</DebugTitle>

      <DebugItem>
        <span>Enabled:</span>
        <DebugValue>{settings.enabled ? '✅' : '❌'}</DebugValue>
      </DebugItem>

      <DebugItem>
        <span>Master Vol:</span>
        <DebugValue>{Math.round(settings.masterVolume * 100)}%</DebugValue>
      </DebugItem>

      <DebugItem>
        <span>Game Vol:</span>
        <DebugValue>{Math.round(settings.gameVolume * 100)}%</DebugValue>
      </DebugItem>

      <DebugItem>
        <span>UI Vol:</span>
        <DebugValue>{Math.round(settings.uiVolume * 100)}%</DebugValue>
      </DebugItem>

      <DebugItem>
        <span>Ambient Vol:</span>
        <DebugValue>{Math.round(settings.ambientVolume * 100)}%</DebugValue>
      </DebugItem>

      <DebugItem>
        <span>BG Music:</span>
        <DebugValue>{settings.enableBackgroundMusic ? '✅' : '❌'}</DebugValue>
      </DebugItem>

      <DebugItem>
        <span>Ambient:</span>
        <DebugValue>{settings.enableAmbientSounds ? '✅' : '❌'}</DebugValue>
      </DebugItem>

      <TestButtons>
        {testSounds.map(sound => (
          <TestButton
            key={sound}
            onClick={() => playSound(sound as any)}
          >
            {sound}
          </TestButton>
        ))}
        <TestButton onClick={stopAllSounds}>
          🔇 Stop All
        </TestButton>
      </TestButtons>
    </DebugContainer>
  )
}

export default AudioDebug
