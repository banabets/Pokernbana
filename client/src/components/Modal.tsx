import React from 'react'
import styled, { keyframes } from 'styled-components'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'small' | 'medium' | 'large' | 'fullscreen'
  showCloseButton?: boolean
  closeOnBackdrop?: boolean
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnBackdrop = true
}: ModalProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <ModalBackdrop onClick={handleBackdropClick}>
      <ModalContainer
        $size={size}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {(title || showCloseButton) && (
          <ModalHeader>
            {title && <ModalTitle id="modal-title">{title}</ModalTitle>}
            {showCloseButton && (
              <CloseButton onClick={onClose} aria-label="Cerrar modal">
                ×
              </CloseButton>
            )}
          </ModalHeader>
        )}
        <ModalContent>
          {children}
        </ModalContent>
      </ModalContainer>
    </ModalBackdrop>
  )
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease-out;
`

const ModalContainer = styled.div<{ $size: string }>`
  background: linear-gradient(180deg, rgba(16,65,39,0.95), rgba(10,44,26,0.95));
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 24px 60px rgba(0,0,0,0.5);
  animation: ${slideIn} 0.3s ease-out;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  ${({ $size }) => {
    switch ($size) {
      case 'small':
        return 'width: 90%; max-width: 400px;'
      case 'large':
        return 'width: 90%; max-width: 800px;'
      case 'fullscreen':
        return 'width: 95vw; height: 95vh;'
      default: // medium
        return 'width: 90%; max-width: 600px;'
    }
  }}
`

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  margin-bottom: 20px;
`

const ModalTitle = styled.h2`
  margin: 0;
  color: #f1f5f9;
  font-size: 1.5rem;
  font-weight: 600;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255,255,255,0.1);
    color: #f1f5f9;
  }

  &:focus {
    outline: 2px solid #4ade80;
    outline-offset: 2px;
  }
`

const ModalContent = styled.div`
  padding: 0 24px 24px;
  overflow-y: auto;
  color: #e2e8f0;

  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255,255,255,0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.3);
    border-radius: 3px;

    &:hover {
      background: rgba(255,255,255,0.5);
    }
  }
`
