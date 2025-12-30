import React, { useState, useEffect, useRef } from 'react'

interface CryptoData {
  [key: string]: {
    usd: number
    usd_24h_change: number
  }
}

interface CryptoInfo {
  id: string
  symbol: string
  name: string
  icon: string
}

interface PriceHistory {
  [key: string]: number[]
}

const SERVER_URL = ''

const CRYPTO_LIST: CryptoInfo[] = [
  { id: 'solana', symbol: 'SOL', name: 'SOL', icon: '◎' },
  { id: 'bitcoin', symbol: 'BTC', name: 'BTC', icon: '₿' },
  { id: 'ethereum', symbol: 'ETH', name: 'ETH', icon: 'Ξ' }
]

// Componente de mini gráfico (sparkline)
const MiniChart: React.FC<{ data: number[]; isPositive: boolean }> = ({ data, isPositive }) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const width = 60
  const height = 24
  const padding = 2

  if (!data || data.length < 2) {
    return <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>--</div>
  }

  // Determinar si el precio está subiendo basándose en la tendencia
  // Comparar el último precio con el primero
  const firstPrice = data[0]
  const lastPrice = data[data.length - 1]
  const isRising = lastPrice >= firstPrice

  // Normalizar los datos para que quepan en el gráfico
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1 // Evitar división por cero

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2)
    const y = height - padding - ((value - min) / range) * (height - padding * 2)
    return `${x},${y}`
  }).join(' ')

  // Usar verde si el precio está subiendo, rojo si está bajando
  const color = isRising ? '#22c55e' : '#ef4444'

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ display: 'block' }}
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Relleno del área bajo la línea */}
      <polygon
        points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
        fill={color}
        fillOpacity="0.1"
      />
    </svg>
  )
}

const CryptoPrices: React.FC<{ tablesAvailable: number; onLeaderboard?: () => void }> = ({ tablesAvailable, onLeaderboard }) => {
  const [cryptoData, setCryptoData] = useState<CryptoData>({})
  const [priceHistory, setPriceHistory] = useState<PriceHistory>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchCryptoPrices = async () => {
    try {
      setLoading(true)
      setError(null)

      // Use backend proxy to avoid CORS issues
      const response = await fetch(`${SERVER_URL}/api/crypto-prices`)

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }

      const data: CryptoData = await response.json()
      setCryptoData(data)
      setLastUpdate(new Date())
      
      // Actualizar historial de precios para los gráficos
      setPriceHistory(prev => {
        const newHistory: PriceHistory = { ...prev }
        CRYPTO_LIST.forEach(crypto => {
          if (data[crypto.id]) {
            if (!newHistory[crypto.id]) {
              newHistory[crypto.id] = []
            }
            // Mantener solo los últimos 20 puntos
            newHistory[crypto.id] = [...newHistory[crypto.id], data[crypto.id].usd].slice(-20)
          }
        })
        return newHistory
      })
      
      console.log('💰 CRYPTO: Prices updated via backend proxy:', data)
    } catch (err) {
      console.error('💰 CRYPTO: Error fetching prices:', err)
      setError('Failed to load crypto prices')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchCryptoPrices()

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchCryptoPrices, 30000)

    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price: number): string => {
    if (price >= 1000) {
      return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
    } else if (price >= 1) {
      return `$${price.toFixed(2)}`
    } else {
      return `$${price.toFixed(4)}`
    }
  }

  const formatChange = (change: number): string => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(1)}%`
  }

  const getChangeClass = (change: number): string => {
    return change >= 0 ? 'positive' : 'negative'
  }

  const openCryptoChart = (cryptoId: string) => {
    // Open in new tab to CoinGecko
    window.open(`https://www.coingecko.com/en/coins/${cryptoId}`, '_blank')
  }

  return (
    <div className="lb-preview">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: '700', 
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
            color: '#ffffff'
          }}>
            {tablesAvailable} tables available
          </div>
        </div>
        <button
          className="pill"
          onClick={() => onLeaderboard && onLeaderboard()}
          style={{ fontSize: '12px' }}
        >
          View Leaderboard
        </button>
      </div>

      <div className="crypto-prices-list">
        {loading && !error ? (
          // Loading state
          CRYPTO_LIST.map((crypto) => (
            <div key={crypto.id} className="crypto-card loading">
              <div className="crypto-header">
                <div className="crypto-icon">{crypto.icon}</div>
                <div className="crypto-name">{crypto.name}</div>
              </div>
              <div className="crypto-price loading-text">Loading...</div>
              <div className="crypto-change loading-text">--</div>
            </div>
          ))
        ) : error ? (
          // Error state
          <div className="crypto-error">
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
            <div>Unable to load crypto prices</div>
            <button
              className="pill"
              onClick={fetchCryptoPrices}
              style={{ marginTop: '8px', fontSize: '12px' }}
            >
              🔄 Retry
            </button>
          </div>
        ) : (
          // Success state
          CRYPTO_LIST.map((crypto) => {
            const data = cryptoData[crypto.id]
            if (!data) return null

            return (
              <div
                key={crypto.id}
                className="crypto-card"
                onClick={() => openCryptoChart(crypto.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="crypto-header">
                  <div className="crypto-icon">{crypto.icon}</div>
                  <div className="crypto-name">{crypto.symbol}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', marginBottom: '2px' }}>
                  <div className="crypto-price" style={{ marginBottom: 0 }}>
                    {formatPrice(data.usd)}
                  </div>
                  <MiniChart 
                    data={priceHistory[crypto.id] || []} 
                    isPositive={data.usd_24h_change >= 0}
                  />
                </div>
                <div className={`crypto-change ${getChangeClass(data.usd_24h_change)}`}>
                  {formatChange(data.usd_24h_change)}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default CryptoPrices
