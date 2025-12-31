import React, { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useSolana, NFTData } from './SolanaProvider'

interface WalletButtonProps {
  onDeposit?: (amount: number, signature: string) => void
  onNFTSelect?: (nft: NFTData) => void
  compact?: boolean
}

const WalletButton: React.FC<WalletButtonProps> = ({ onDeposit, onNFTSelect, compact = false }) => {
  const { connected, connecting } = useWallet()
  const { setVisible } = useWalletModal()
  const { publicKey, balance, nfts, loading, disconnect, depositSOL, walletName } = useSolana()

  const [showMenu, setShowMenu] = useState(false)
  const [showDeposit, setShowDeposit] = useState(false)
  const [showNFTs, setShowNFTs] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [depositLoading, setDepositLoading] = useState(false)
  const [depositError, setDepositError] = useState('')

  const handleConnect = () => {
    setVisible(true)
  }

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount)
    if (isNaN(amount) || amount <= 0) {
      setDepositError('Ingresa una cantidad válida')
      return
    }
    if (amount > balance) {
      setDepositError('Balance insuficiente')
      return
    }

    setDepositLoading(true)
    setDepositError('')

    const result = await depositSOL(amount)

    if (result.success && result.signature) {
      onDeposit?.(amount, result.signature)
      setShowDeposit(false)
      setDepositAmount('')
    } else {
      setDepositError(result.error || 'Error en la transacción')
    }

    setDepositLoading(false)
  }

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  if (!connected) {
    return (
      <button
        className="wallet-connect-btn"
        onClick={handleConnect}
        disabled={connecting}
      >
        <img src="https://phantom.app/img/logo.png" alt="" className="wallet-icon" />
        {connecting ? 'Conectando...' : 'Conectar Wallet'}
      </button>
    )
  }

  if (compact) {
    return (
      <div className="wallet-compact">
        <button className="wallet-compact-btn" onClick={() => setShowMenu(!showMenu)}>
          <span className="wallet-balance">{balance.toFixed(3)} SOL</span>
          <span className="wallet-address">{shortenAddress(publicKey?.toString() || '')}</span>
        </button>

        {showMenu && (
          <div className="wallet-dropdown">
            <div className="wallet-dropdown-header">
              <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${publicKey?.toString()}`} alt="" className="wallet-avatar" />
              <div>
                <div className="wallet-name">{walletName}</div>
                <div className="wallet-addr">{shortenAddress(publicKey?.toString() || '')}</div>
              </div>
            </div>
            <div className="wallet-dropdown-balance">
              <span>Balance:</span>
              <strong>{balance.toFixed(4)} SOL</strong>
            </div>
            <button className="wallet-dropdown-btn deposit" onClick={() => { setShowDeposit(true); setShowMenu(false) }}>
              Depositar SOL
            </button>
            <button className="wallet-dropdown-btn nfts" onClick={() => { setShowNFTs(true); setShowMenu(false) }}>
              Mis NFTs ({nfts.length})
            </button>
            <button className="wallet-dropdown-btn disconnect" onClick={() => { disconnect(); setShowMenu(false) }}>
              Desconectar
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="wallet-connected">
      <div className="wallet-info" onClick={() => setShowMenu(!showMenu)}>
        <img
          src={`https://api.dicebear.com/7.x/identicon/svg?seed=${publicKey?.toString()}`}
          alt="Wallet"
          className="wallet-avatar"
        />
        <div className="wallet-details">
          <span className="wallet-balance-label">{balance.toFixed(3)} SOL</span>
          <span className="wallet-address-label">{shortenAddress(publicKey?.toString() || '')}</span>
        </div>
      </div>

      {showMenu && (
        <div className="wallet-menu">
          <button onClick={() => { setShowDeposit(true); setShowMenu(false) }}>
            Depositar SOL
          </button>
          <button onClick={() => { setShowNFTs(true); setShowMenu(false) }}>
            Mis NFTs
          </button>
          <button onClick={() => { disconnect(); setShowMenu(false) }}>
            Desconectar
          </button>
        </div>
      )}

      {/* Modal de depósito */}
      {showDeposit && (
        <div className="wallet-modal-overlay" onClick={() => setShowDeposit(false)}>
          <div className="wallet-modal" onClick={e => e.stopPropagation()}>
            <h3>Depositar SOL</h3>
            <p className="wallet-modal-balance">Balance disponible: {balance.toFixed(4)} SOL</p>

            <div className="deposit-input-group">
              <input
                type="number"
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                max={balance}
              />
              <span className="deposit-currency">SOL</span>
            </div>

            <div className="deposit-quick-amounts">
              <button onClick={() => setDepositAmount('0.1')}>0.1</button>
              <button onClick={() => setDepositAmount('0.5')}>0.5</button>
              <button onClick={() => setDepositAmount('1')}>1</button>
              <button onClick={() => setDepositAmount(balance.toFixed(2))}>MAX</button>
            </div>

            {depositError && <p className="deposit-error">{depositError}</p>}

            <div className="wallet-modal-actions">
              <button onClick={() => setShowDeposit(false)} className="btn-cancel">Cancelar</button>
              <button onClick={handleDeposit} disabled={depositLoading} className="btn-confirm">
                {depositLoading ? 'Procesando...' : 'Confirmar Depósito'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de NFTs */}
      {showNFTs && (
        <div className="wallet-modal-overlay" onClick={() => setShowNFTs(false)}>
          <div className="wallet-modal nft-modal" onClick={e => e.stopPropagation()}>
            <h3>Mis NFTs</h3>
            <p className="wallet-modal-subtitle">Selecciona un NFT para usar como avatar</p>

            {loading ? (
              <div className="nft-loading">Cargando NFTs...</div>
            ) : nfts.length === 0 ? (
              <div className="nft-empty">No tienes NFTs en este wallet</div>
            ) : (
              <div className="nft-grid">
                {nfts.map(nft => (
                  <div
                    key={nft.mint}
                    className="nft-item"
                    onClick={() => {
                      onNFTSelect?.(nft)
                      setShowNFTs(false)
                    }}
                  >
                    <img src={nft.image} alt={nft.name} onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=NFT'
                    }} />
                    <span className="nft-name">{nft.name}</span>
                    <span className="nft-collection">{nft.collection}</span>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => setShowNFTs(false)} className="btn-close">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default WalletButton
