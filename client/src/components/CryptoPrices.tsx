import React, { useState, useEffect } from 'react'

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

const SERVER_URL = ''

const CRYPTO_LIST: CryptoInfo[] = [
  { id: 'solana', symbol: 'SOL', name: 'SOL', icon: '◎' },
  { id: 'bitcoin', symbol: 'BTC', name: 'BTC', icon: '₿' },
  { id: 'ethereum', symbol: 'ETH', name: 'ETH', icon: 'Ξ' },
  { id: 'litecoin', symbol: 'LTC', name: 'LTC', icon: 'Ł' }
]

const CryptoPrices: React.FC<{ tablesAvailable: number; onLeaderboard?: () => void }> = ({ tablesAvailable, onLeaderboard }) => {
  const [cryptoData, setCryptoData] = useState<CryptoData>({})
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
          <b className="lb-title">💰 Crypto Prices</b>
          <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: 2, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>
            {lastUpdate && (
              <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
            )}
            {!lastUpdate && loading && <span>Loading...</span>}
            {error && <span style={{ color: '#ef4444' }}>{error}</span>}
            <br />
            {tablesAvailable} tables available
          </div>
        </div>
        <button
          className="pill"
          onClick={() => onLeaderboard && onLeaderboard()}
          style={{ fontSize: '12px' }}
        >
          🏆 View Leaderboard
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
                <div className="crypto-price">
                  {formatPrice(data.usd)}
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
