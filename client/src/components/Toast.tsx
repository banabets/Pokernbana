import React from 'react'
import styled, { keyframes } from 'styled-components'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  message: string
  type: ToastType
  duration?: number
  onClose: () => void
}

export default function Toast({ message, type, duration = 4000, onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <ToastContainer $type={type}>
      <ToastIcon $type={type}>{getIcon(type)}</ToastIcon>
      <ToastMessage>{message}</ToastMessage>
      <ToastClose onClick={onClose}>×</ToastClose>
    </ToastContainer>
  )
}

function getIcon(type: ToastType) {
  switch (type) {
    case 'success': return '✓'
    case 'error': return '✕'
    case 'warning': return '⚠'
    case 'info': return 'ℹ'
  }
}

const slideIn = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`

const ToastContainer = styled.div<{ $type: ToastType }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(0,0,0,0.9);
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  backdrop-filter: blur(8px);
  animation: ${slideIn} 0.3s ease-out;
  max-width: 400px;
  margin-bottom: 8px;

  ${({ $type }) => {
    switch ($type) {
      case 'success': return 'border-left: 4px solid #4ade80;'
      case 'error': return 'border-left: 4px solid #ef4444;'
      case 'warning': return 'border-left: 4px solid #f59e0b;'
      case 'info': return 'border-left: 4px solid #3b82f6;'
    }
  }}
`

const ToastIcon = styled.div<{ $type: ToastType }>`
  font-size: 18px;
  font-weight: bold;
  min-width: 24px;

  ${({ $type }) => {
    switch ($type) {
      case 'success': return 'color: #4ade80;'
      case 'error': return 'color: #ef4444;'
      case 'warning': return 'color: #f59e0b;'
      case 'info': return 'color: #3b82f6;'
    }
  }}
`

const ToastMessage = styled.div`
  flex: 1;
  color: #f1f5f9;
  font-size: 14px;
  line-height: 1.4;
`

const ToastClose = styled.button`
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255,255,255,0.1);
    color: #f1f5f9;
  }
`
