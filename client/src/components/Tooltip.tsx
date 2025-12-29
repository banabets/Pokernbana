import React from 'react'
import styled, { keyframes } from 'styled-components'

interface TooltipProps {
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  children: React.ReactElement
  disabled?: boolean
}

export default function Tooltip({
  content,
  position = 'top',
  delay = 300,
  children,
  disabled = false
}: TooltipProps) {
  const [visible, setVisible] = React.useState(false)
  const timeoutRef = React.useRef<NodeJS.Timeout>()

  const showTooltip = () => {
    if (disabled) return
    timeoutRef.current = setTimeout(() => setVisible(true), delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setVisible(false)
  }

  return (
    <TooltipContainer
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {visible && (
        <TooltipBubble $position={position}>
          {content}
          <TooltipArrow $position={position} />
        </TooltipBubble>
      )}
    </TooltipContainer>
  )
}

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`

const TooltipContainer = styled.div`
  position: relative;
  display: inline-block;
`

const TooltipBubble = styled.div<{ $position: string }>`
  position: absolute;
  background: rgba(0,0,0,0.95);
  color: #f1f5f9;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  z-index: 1000;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  animation: ${fadeIn} 0.2s ease-out;
  pointer-events: none;

  ${({ $position }) => {
    switch ($position) {
      case 'top':
        return `
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 8px;
        `
      case 'bottom':
        return `
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 8px;
        `
      case 'left':
        return `
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          margin-right: 8px;
        `
      case 'right':
        return `
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          margin-left: 8px;
        `
    }
  }}
`

const TooltipArrow = styled.div<{ $position: string }>`
  position: absolute;
  width: 0;
  height: 0;
  border: 6px solid transparent;

  ${({ $position }) => {
    switch ($position) {
      case 'top':
        return `
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          border-top-color: rgba(0,0,0,0.95);
          border-bottom: none;
        `
      case 'bottom':
        return `
          top: -6px;
          left: 50%;
          transform: translateX(-50%);
          border-bottom-color: rgba(0,0,0,0.95);
          border-top: none;
        `
      case 'left':
        return `
          right: -6px;
          top: 50%;
          transform: translateY(-50%);
          border-left-color: rgba(0,0,0,0.95);
          border-right: none;
        `
      case 'right':
        return `
          left: -6px;
          top: 50%;
          transform: translateY(-50%);
          border-right-color: rgba(0,0,0,0.95);
          border-left: none;
        `
    }
  }}
`
