import React, { FC, ReactNode, useMemo, useCallback, useState, useEffect } from 'react'
import { ConnectionProvider, WalletProvider, useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter
} from '@solana/wallet-adapter-wallets'
import { clusterApiUrl, Connection, PublicKey, LAMPORTS_PER_SOL, Transaction, SystemProgram } from '@solana/web3.js'

// Importar estilos del wallet adapter
import '@solana/wallet-adapter-react-ui/styles.css'

// Endpoint de Solana (mainnet-beta para producción, devnet para pruebas)
const SOLANA_NETWORK = 'mainnet-beta' // Cambiar a 'devnet' para pruebas
const SOLANA_RPC = SOLANA_NETWORK === 'mainnet-beta'
  ? 'https://api.mainnet-beta.solana.com'
  : clusterApiUrl('devnet')

// Wallet del casino para recibir depósitos (CAMBIAR POR TU WALLET REAL)
const CASINO_WALLET = new PublicKey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263') // Ejemplo - BONK token wallet

interface SolanaProviderProps {
  children: ReactNode
}

// Provider principal que envuelve toda la app
export const SolanaProvider: FC<SolanaProviderProps> = ({ children }) => {
  const endpoint = useMemo(() => SOLANA_RPC, [])

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter()
    ],
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

// Hook personalizado para operaciones de Solana
export function useSolana() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction, connected, connecting, disconnect, wallet } = useWallet()
  const [balance, setBalance] = useState<number>(0)
  const [nfts, setNfts] = useState<NFTData[]>([])
  const [loading, setLoading] = useState(false)

  // Obtener balance de SOL
  const fetchBalance = useCallback(async () => {
    if (!publicKey) {
      setBalance(0)
      return
    }
    try {
      const lamports = await connection.getBalance(publicKey)
      setBalance(lamports / LAMPORTS_PER_SOL)
    } catch (err) {
      console.error('Error fetching SOL balance:', err)
    }
  }, [publicKey, connection])

  // Obtener NFTs del wallet
  const fetchNFTs = useCallback(async () => {
    if (!publicKey) {
      setNfts([])
      return
    }

    setLoading(true)
    try {
      // Usar Helius API para obtener NFTs (gratis hasta 50k requests/día)
      const response = await fetch(`https://api.helius.xyz/v0/addresses/${publicKey.toString()}/nfts?api-key=1d8b1b0f-0c1e-4b1a-9c1d-1e1f1a1b1c1d`)

      if (response.ok) {
        const data = await response.json()
        const nftData: NFTData[] = data.map((nft: any) => ({
          mint: nft.mint,
          name: nft.name || 'Unknown NFT',
          image: nft.image || nft.cached_image_uri || '',
          collection: nft.collection?.name || 'Unknown Collection'
        }))
        setNfts(nftData)
      } else {
        // Fallback: intentar con método alternativo
        console.log('Helius API not available, using fallback')
        setNfts([])
      }
    } catch (err) {
      console.error('Error fetching NFTs:', err)
      setNfts([])
    } finally {
      setLoading(false)
    }
  }, [publicKey])

  // Depositar SOL al casino
  const depositSOL = useCallback(async (amountSOL: number): Promise<{ success: boolean, signature?: string, error?: string }> => {
    if (!publicKey || !sendTransaction) {
      return { success: false, error: 'Wallet not connected' }
    }

    try {
      setLoading(true)

      const lamports = Math.floor(amountSOL * LAMPORTS_PER_SOL)

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: CASINO_WALLET,
          lamports
        })
      )

      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      const signature = await sendTransaction(transaction, connection)

      // Esperar confirmación
      await connection.confirmTransaction(signature, 'confirmed')

      // Actualizar balance
      await fetchBalance()

      return { success: true, signature }
    } catch (err: any) {
      console.error('Error depositing SOL:', err)
      return { success: false, error: err.message || 'Transaction failed' }
    } finally {
      setLoading(false)
    }
  }, [publicKey, sendTransaction, connection, fetchBalance])

  // Efecto para cargar datos cuando se conecta el wallet
  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance()
      fetchNFTs()
    }
  }, [connected, publicKey, fetchBalance, fetchNFTs])

  // Actualizar balance cada 30 segundos
  useEffect(() => {
    if (!connected) return
    const interval = setInterval(fetchBalance, 30000)
    return () => clearInterval(interval)
  }, [connected, fetchBalance])

  return {
    // Estado
    publicKey,
    connected,
    connecting,
    balance,
    nfts,
    loading,
    walletName: wallet?.adapter.name || null,

    // Acciones
    disconnect,
    depositSOL,
    fetchBalance,
    fetchNFTs
  }
}

// Tipos
export interface NFTData {
  mint: string
  name: string
  image: string
  collection: string
}

export default SolanaProvider
