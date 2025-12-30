import React, { useEffect, useRef, useState } from 'react'

interface CasinoAdsCarouselProps {
  tablesAvailable?: number
  onLeaderboard?: () => void
}

const CasinoAdsCarousel: React.FC<CasinoAdsCarouselProps> = ({ tablesAvailable, onLeaderboard }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const ads = [
    {
      id: 1,
      video: '/123.mp4',
      alt: 'VIP Promotion'
    }
  ]

  // Auto-scroll cada 4 segundos
  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isPaused, ads.length])

  // Scroll suave al cambiar de índice
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollAmount = currentIndex * container.offsetWidth
      container.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      })
    }
  }, [currentIndex])

  const handleDotClick = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <div className="casino-ads-container">
      <div className="casino-ads-header">
        <h3 className="casino-ads-title">
          {tablesAvailable !== undefined ? `${tablesAvailable} tables available` : 'Casino Promotions'}
        </h3>
      </div>
      
      <div 
        className="casino-ads-carousel"
        ref={scrollContainerRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {ads.map((ad) => (
          <div key={ad.id} className="casino-ad-slide">
            <video 
              src={ad.video} 
              className="casino-ad-image"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onError={(e) => {
                console.error('Error loading ad video:', ad.video)
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        ))}
      </div>

      {/* Dots indicator - solo mostrar si hay más de 1 slide */}
      {ads.length > 1 && (
        <div className="casino-ads-dots">
          {ads.map((_, index) => (
            <button
              key={index}
              className={`casino-ad-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default CasinoAdsCarousel

