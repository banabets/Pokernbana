import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles/app.css'
import './styles/theme.css'
import './styles/professional-ui.css'

// Asegurar que el scroll esté en la parte superior al cargar
const resetScroll = () => {
  // Forzar scroll a 0 de múltiples formas
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  document.documentElement.scrollLeft = 0
  document.body.scrollTop = 0
  document.body.scrollLeft = 0
  
  // También para cualquier contenedor con scroll
  const scrollableElements = document.querySelectorAll('[style*="overflow"], .lobby-main, .chat-dock, .chat-list, #root')
  scrollableElements.forEach(el => {
    if (el instanceof HTMLElement) {
      el.scrollTop = 0
      el.scrollLeft = 0
    }
  })
}

// Prevenir el scroll restoration del navegador ANTES de todo
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

// Ejecutar inmediatamente
resetScroll()

// Ejecutar después de que el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    resetScroll()
    setTimeout(resetScroll, 0)
    setTimeout(resetScroll, 100)
  })
} else {
  resetScroll()
  setTimeout(resetScroll, 0)
  setTimeout(resetScroll, 100)
}

// Ejecutar después de que la página esté completamente cargada
window.addEventListener('load', () => {
  resetScroll()
  setTimeout(resetScroll, 0)
  setTimeout(resetScroll, 50)
  setTimeout(resetScroll, 200)
})

// También cuando React termine de renderizar
setTimeout(() => {
  resetScroll()
}, 300)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
