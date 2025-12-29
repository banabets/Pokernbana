import React from 'react'
import styled, { keyframes } from 'styled-components'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  color?: string
  message?: string
  overlay?: boolean
}

export default function LoadingSpinner({
  size = 'medium',
  color = '#4ade80',
  message = 'Cargando...',
  overlay = false
}: LoadingSpinnerProps) {
  const Container = overlay ? OverlayContainer : InlineContainer

  return (
    <Container>
      <SpinnerContainer $size={size}>
        <SpinnerRing $color={color} $size={size} />
        <SpinnerCenter $size={size} />
        <SpinnerDot $color={color} $size={size} />
      </SpinnerContainer>
      {message && <LoadingMessage $size={size}>{message}</LoadingMessage>}
    </Container>
  )
}

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`

const OverlayContainer = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(4px);
  z-index: 9999;
`

const InlineContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
`

const SpinnerContainer = styled.div<{ $size: string }>`
  position: relative;
  ${({ $size }) => {
    switch ($size) {
      case 'small': return 'width: 32px; height: 32px;'
      case 'large': return 'width: 80px; height: 80px;'
      default: return 'width: 56px; height: 56px;'
    }
  }}
`

const SpinnerRing = styled.div<{ $color: string; $size: string }>`
  position: absolute;
  inset: 0;
  border: 2px solid rgba(255,255,255,0.1);
  border-top: 2px solid ${({ $color }) => $color};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;

  ${({ $size }) => {
    switch ($size) {
      case 'small': return 'border-width: 1.5px;'
      case 'large': return 'border-width: 3px;'
      default: return 'border-width: 2px;'
    }
  }}
`

const SpinnerCenter = styled.div<{ $size: string }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0,0,0,0.8);
  border-radius: 50%;

  ${({ $size }) => {
    switch ($size) {
      case 'small': return 'width: 8px; height: 8px;'
      case 'large': return 'width: 24px; height: 24px;'
      default: return 'width: 16px; height: 16px;'
    }
  }}
`

const SpinnerDot = styled.div<{ $color: string; $size: string }>`
  position: absolute;
  top: 2px;
  left: 50%;
  transform: translateX(-50%);
  background: ${({ $color }) => $color};
  border-radius: 50%;
  animation: ${pulse} 1.5s ease-in-out infinite;

  ${({ $size }) => {
    switch ($size) {
      case 'small': return 'width: 3px; height: 3px;'
      case 'large': return 'width: 8px; height: 8px;'
      default: return 'width: 5px; height: 5px;'
    }
  }}
`

const LoadingMessage = styled.div<{ $size: string }>`
  margin-top: 16px;
  color: #f1f5f9;
  text-align: center;
  font-weight: 500;

  ${({ $size }) => {
    switch ($size) {
      case 'small': return 'font-size: 12px;'
      case 'large': return 'font-size: 16px;'
      default: return 'font-size: 14px;'
    }
  }}
`
