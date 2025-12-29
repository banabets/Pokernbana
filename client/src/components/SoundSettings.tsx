import React from 'react'
import styled from 'styled-components'
import { useSound } from '../hooks/useSound'

const SettingsContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.9);
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
  backdrop-filter: blur(20px);
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  min-width: 300px;

  @media (max-width: 768px) {
    position: static;
    margin: var(--spacing-md);
    width: calc(100vw - 2 * var(--spacing-md));
  }
`

const SettingsTitle = styled.h3`
  color: white;
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--text-lg);
  font-weight: 600;
  text-align: center;
`

const SettingGroup = styled.div`
  margin-bottom: var(--spacing-lg);

  &:last-child {
    margin-bottom: 0;
  }
`

const GroupTitle = styled.h4`
  color: #f59e0b;
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--text-sm);
  font-weight: 500;
`

const SliderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`

const SliderLabel = styled.label`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  font-size: var(--text-sm);
`

const SliderValue = styled.span`
  color: #f59e0b;
  font-weight: 600;
`

const Slider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  -webkit-appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-xs) 0;
`

const ToggleLabel = styled.label`
  color: white;
  font-size: var(--text-sm);
  cursor: pointer;
`

const Toggle = styled.input`
  width: 50px;
  height: 24px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  position: relative;
  cursor: pointer;
  outline: none;
  -webkit-appearance: none;

  &:checked {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  }

  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    transition: transform 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  &:checked::before {
    transform: translateX(26px);
  }
`

const TestButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: calc(var(--border-radius) * 0.8);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
  width: 100%;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`

const CloseButton = styled.button`
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
`

interface SoundSettingsProps {
  isOpen: boolean
  onClose: () => void
}

const SoundSettingsComponent: React.FC<SoundSettingsProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, playSound } = useSound()

  if (!isOpen) return null

  const handleVolumeChange = (category: keyof typeof settings, value: number) => {
    updateSettings({ [category]: value / 100 })
  }

  const handleToggleChange = (setting: keyof typeof settings) => {
    updateSettings({ [setting]: !settings[setting] })
  }

  const testSound = (soundType: string) => {
    playSound(soundType as any)
  }

  return (
    <SettingsContainer>
      <CloseButton onClick={onClose}>×</CloseButton>

      <SettingsTitle>🎵 Audio Settings</SettingsTitle>

      {/* Volúmenes principales */}
      <SettingGroup>
        <GroupTitle>🎚️ Master Volume</GroupTitle>
        <SliderContainer>
          <SliderLabel>
            Master: <SliderValue>{Math.round(settings.masterVolume * 100)}%</SliderValue>
          </SliderLabel>
          <Slider
            type="range"
            min="0"
            max="100"
            value={settings.masterVolume * 100}
            onChange={(e) => handleVolumeChange('masterVolume', Number(e.target.value))}
          />
        </SliderContainer>
      </SettingGroup>

      {/* Volúmenes por categoría */}
      <SettingGroup>
        <GroupTitle>🔊 Category Volumes</GroupTitle>
        <SliderContainer>
          <SliderLabel>
            Game Sounds: <SliderValue>{Math.round(settings.gameVolume * 100)}%</SliderValue>
          </SliderLabel>
          <Slider
            type="range"
            min="0"
            max="100"
            value={settings.gameVolume * 100}
            onChange={(e) => handleVolumeChange('gameVolume', Number(e.target.value))}
          />
        </SliderContainer>

        <SliderContainer>
          <SliderLabel>
            UI Sounds: <SliderValue>{Math.round(settings.uiVolume * 100)}%</SliderValue>
          </SliderLabel>
          <Slider
            type="range"
            min="0"
            max="100"
            value={settings.uiVolume * 100}
            onChange={(e) => handleVolumeChange('uiVolume', Number(e.target.value))}
          />
        </SliderContainer>

        <SliderContainer>
          <SliderLabel>
            Ambient: <SliderValue>{Math.round(settings.ambientVolume * 100)}%</SliderValue>
          </SliderLabel>
          <Slider
            type="range"
            min="0"
            max="100"
            value={settings.ambientVolume * 100}
            onChange={(e) => handleVolumeChange('ambientVolume', Number(e.target.value))}
          />
        </SliderContainer>

        <SliderContainer>
          <SliderLabel>
            Music: <SliderValue>{Math.round(settings.musicVolume * 100)}%</SliderValue>
          </SliderLabel>
          <Slider
            type="range"
            min="0"
            max="100"
            value={settings.musicVolume * 100}
            onChange={(e) => handleVolumeChange('musicVolume', Number(e.target.value))}
          />
        </SliderContainer>
      </SettingGroup>

      {/* Configuraciones específicas */}
      <SettingGroup>
        <GroupTitle>⚙️ Features</GroupTitle>

        <ToggleContainer>
          <ToggleLabel onClick={() => handleToggleChange('enableBackgroundMusic')}>
            🎼 Background Music
          </ToggleLabel>
          <Toggle
            type="checkbox"
            checked={settings.enableBackgroundMusic}
            onChange={() => handleToggleChange('enableBackgroundMusic')}
          />
        </ToggleContainer>

        <ToggleContainer>
          <ToggleLabel onClick={() => handleToggleChange('enableAmbientSounds')}>
            🎭 Ambient Sounds
          </ToggleLabel>
          <Toggle
            type="checkbox"
            checked={settings.enableAmbientSounds}
            onChange={() => handleToggleChange('enableAmbientSounds')}
          />
        </ToggleContainer>

        <ToggleContainer>
          <ToggleLabel onClick={() => handleToggleChange('enableHandCombos')}>
            🃏 Hand Combination Sounds
          </ToggleLabel>
          <Toggle
            type="checkbox"
            checked={settings.enableHandCombos}
            onChange={() => handleToggleChange('enableHandCombos')}
          />
        </ToggleContainer>

        <ToggleContainer>
          <ToggleLabel onClick={() => handleToggleChange('enableNotifications')}>
            🔔 Notification Sounds
          </ToggleLabel>
          <Toggle
            type="checkbox"
            checked={settings.enableNotifications}
            onChange={() => handleToggleChange('enableNotifications')}
          />
        </ToggleContainer>
      </SettingGroup>

      {/* Botones de prueba */}
      <SettingGroup>
        <GroupTitle>🧪 Test Sounds</GroupTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <TestButton onClick={() => testSound('card_deal')}>🎴 Deal Card</TestButton>
          <TestButton onClick={() => testSound('chip_stack')}>💰 Chip Stack</TestButton>
          <TestButton onClick={() => testSound('button_click')}>🔘 Button</TestButton>
          <TestButton onClick={() => testSound('win')}>🏆 Win</TestButton>
          <TestButton onClick={() => testSound('royal_flush')}>👑 Royal Flush</TestButton>
          <TestButton onClick={() => testSound('allin')}>💥 All-In</TestButton>
        </div>
      </SettingGroup>
    </SettingsContainer>
  )
}

export default SoundSettingsComponent
