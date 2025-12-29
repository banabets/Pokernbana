import React, { useState } from 'react'
import { ClientEvents } from 'shared/protocol'

interface StoreProps {
  socket: any
  openStore: boolean
  setOpenStore: (open: boolean) => void
  skin: 'green' | 'blue' | 'purple' | 'gold' | 'crystal' | 'red' | 'black' | 'rainbow' | 'neon' | 'sunset' | 'ocean' | 'lava' | 'ice' | 'forest' | 'royal' | 'galaxy' | 'diamond' | 'platinum' | 'emerald'
  setSkin: (skin: 'green' | 'blue' | 'purple' | 'gold' | 'crystal' | 'red' | 'black' | 'rainbow' | 'neon' | 'sunset' | 'ocean' | 'lava' | 'ice' | 'forest' | 'royal' | 'galaxy' | 'diamond' | 'platinum' | 'emerald') => void
  theme: 'casino' | 'beach' | 'space' | 'neon' | 'cyberpunk' | 'dark' | 'sunset' | 'matrix' | 'fire' | 'ocean'
  setTheme: (theme: 'casino' | 'beach' | 'space' | 'neon' | 'cyberpunk' | 'dark' | 'sunset' | 'matrix' | 'fire' | 'ocean') => void
  storeCredits: number
  setStoreCredits: (credits: number | ((prev: number) => number)) => void
  addNotification: (message: string) => void
  subscription: SubscriptionLevel
  setSubscription: (level: SubscriptionLevel) => void
}

export type SubscriptionLevel = 'free' | 'bronze' | 'silver' | 'gold' | 'diamond'

interface Product {
  id: string
  name: string
  description: string
  price: number
  icon: string
  preview: string
  category: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  owned?: boolean
}

export default function Store({
  openStore,
  setOpenStore,
  skin,
  setSkin,
  theme,
  setTheme,
  storeCredits,
  setStoreCredits,
  addNotification,
  subscription,
  setSubscription
}: StoreProps) {
  const [selectedCategory, setSelectedCategory] = useState('themes')

  // Productos expandidos con más categorías
  const products: Product[] = [
    // Table Skins - Expanded Collection
    // Classic Colors
    { id: 'green-felt', name: 'Green Felt', description: 'Classic casino green', price: 0, icon: '🎲', preview: '🟢', category: 'skins', rarity: 'common', owned: skin === 'green' },
    { id: 'blue-felt', name: 'Blue Felt', description: 'Elegant blue velvet', price: 100, icon: '💎', preview: '🔵', category: 'skins', rarity: 'rare', owned: skin === 'blue' },
    { id: 'purple-felt', name: 'Purple Felt', description: 'Royal purple luxury', price: 200, icon: '👑', preview: '🟣', category: 'skins', rarity: 'epic', owned: skin === 'purple' },
    { id: 'red-felt', name: 'Red Felt', description: 'Bold crimson passion', price: 150, icon: '❤️', preview: '🔴', category: 'skins', rarity: 'rare', owned: skin === 'red' },
    { id: 'black-felt', name: 'Black Felt', description: 'Mysterious midnight', price: 250, icon: '🌙', preview: '⚫', category: 'skins', rarity: 'epic', owned: skin === 'black' },

    // Premium Colors
    { id: 'gold-felt', name: 'Gold Felt', description: 'Premium gold edition', price: 500, icon: '🥇', preview: '🟡', category: 'skins', rarity: 'legendary', owned: skin === 'gold' },
    { id: 'crystal-felt', name: 'Crystal Felt', description: 'Diamond crystal shine', price: 800, icon: '💎', preview: '✨', category: 'skins', rarity: 'legendary', owned: skin === 'crystal' },
    { id: 'rainbow-felt', name: 'Rainbow Felt', description: 'Colorful spectrum', price: 600, icon: '🌈', preview: '🎨', category: 'skins', rarity: 'legendary', owned: skin === 'rainbow' },

    // Themed Colors
    { id: 'neon-felt', name: 'Neon Felt', description: 'Electric cyber glow', price: 300, icon: '⚡', preview: '🌈', category: 'skins', rarity: 'epic', owned: skin === 'neon' },
    { id: 'sunset-felt', name: 'Sunset Felt', description: 'Golden hour warmth', price: 350, icon: '🌅', preview: '🧡', category: 'skins', rarity: 'epic', owned: skin === 'sunset' },
    { id: 'ocean-felt', name: 'Ocean Felt', description: 'Deep sea mystery', price: 400, icon: '🌊', preview: '💙', category: 'skins', rarity: 'epic', owned: skin === 'ocean' },
    { id: 'lava-felt', name: 'Lava Felt', description: 'Volcanic heat', price: 450, icon: '🌋', preview: '🔴', category: 'skins', rarity: 'legendary', owned: skin === 'lava' },
    { id: 'ice-felt', name: 'Ice Felt', description: 'Arctic frost', price: 380, icon: '🧊', preview: '❄️', category: 'skins', rarity: 'epic', owned: skin === 'ice' },
    { id: 'forest-felt', name: 'Forest Felt', description: 'Natural woodland', price: 320, icon: '🌲', preview: '🟢', category: 'skins', rarity: 'rare', owned: skin === 'forest' },
    { id: 'royal-felt', name: 'Royal Felt', description: 'Imperial majesty', price: 700, icon: '👑', preview: '💜', category: 'skins', rarity: 'legendary', owned: skin === 'royal' },

    // Special Edition
    { id: 'galaxy-felt', name: 'Galaxy Felt', description: 'Cosmic starfield', price: 900, icon: '🌌', preview: '✨', category: 'skins', rarity: 'legendary' },
    { id: 'diamond-felt', name: 'Diamond Felt', description: 'Ultimate luxury', price: 1200, icon: '💎', preview: '💎', category: 'skins', rarity: 'legendary' },
    { id: 'platinum-felt', name: 'Platinum Felt', description: 'Pure elegance', price: 1000, icon: '⚪', preview: '🤍', category: 'skins', rarity: 'legendary' },
    { id: 'emerald-felt', name: 'Emerald Felt', description: 'Precious gemstone', price: 850, icon: '💚', preview: '💚', category: 'skins', rarity: 'legendary' },

    // Themes
    { id: 'casino-theme', name: 'Casino Classic', description: 'Traditional casino feel', price: 0, icon: '🎰', preview: '🎰', category: 'themes', rarity: 'common', owned: theme === 'casino' },
    { id: 'neon-theme', name: 'Neon Cyber', description: 'Futuristic neon lights', price: 0, icon: '🌆', preview: '⚡', category: 'themes', rarity: 'common', owned: theme === 'neon' },
    { id: 'dark-theme', name: 'Dark Mode', description: 'Easy on the eyes', price: 0, icon: '🌙', preview: '🌑', category: 'themes', rarity: 'common', owned: theme === 'dark' },
    { id: 'beach-theme', name: 'Beach Paradise', description: 'Tropical island vibes', price: 150, icon: '🏖️', preview: '🌴', category: 'themes', rarity: 'rare', owned: theme === 'beach' },
    { id: 'space-theme', name: 'Space Explorer', description: 'Cosmic adventure', price: 250, icon: '🚀', preview: '🌌', category: 'themes', rarity: 'rare', owned: theme === 'space' },
    { id: 'cyberpunk-theme', name: 'Cyberpunk', description: 'High-tech future', price: 500, icon: '🤖', preview: '💾', category: 'themes', rarity: 'epic', owned: theme === 'cyberpunk' },
    { id: 'sunset-theme', name: 'Sunset Bliss', description: 'Golden hour magic', price: 300, icon: '🌅', preview: '🌆', category: 'themes', rarity: 'rare', owned: theme === 'sunset' },
    { id: 'matrix-theme', name: 'Matrix Code', description: 'Digital rain effect', price: 600, icon: '💊', preview: '📊', category: 'themes', rarity: 'epic', owned: theme === 'matrix' },
    { id: 'fire-theme', name: 'Fire Storm', description: 'Burning hot effects', price: 400, icon: '🔥', preview: '🌋', category: 'themes', rarity: 'epic', owned: theme === 'fire' },
    { id: 'ocean-theme', name: 'Ocean Deep', description: 'Underwater mystery', price: 350, icon: '🌊', preview: '🐠', category: 'themes', rarity: 'rare', owned: theme === 'ocean' },

    // Avatars - Unique GIF Collection
    { id: 'avatar-king', name: 'Poker King', description: 'Rule the tables', price: 300, icon: '👑', preview: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHBzZHppcGN1a2E1cmpiZHM3eXRpcm9ldzBxZWNlb2p1d3ljZnEwdSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5rIswVA3x6xw0jEuKh/giphy.gif', category: 'avatars', rarity: 'epic' },
    { id: 'avatar-queen', name: 'Poker Queen', description: 'Elegant and fierce', price: 250, icon: '👸', preview: 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExZmhwbTZrZDdzdnpvODd5MHE3OXI5MWttdjJrODcwYm5odXpnMDR5ayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LdzhWzAObvhtWAMSfj/giphy.gif', category: 'avatars', rarity: 'rare' },
    { id: 'avatar-joker', name: 'Joker Wild', description: 'Chaos and fun', price: 400, icon: '🃏', preview: 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWpjZjhla2l5OXh4ZXF0dWs1ZTg1aXFqNzZkOTRtNTVxcTdwcjBodSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/yOt4iUfeWtk88/giphy.gif', category: 'avatars', rarity: 'epic' },
    { id: 'avatar-robot', name: 'AI Assistant', description: 'Future is here', price: 350, icon: '🤖', preview: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExYmhvemVobDl2ZnZ4emIxcTVjMmMycW8zZjE5ZTFleW94M2tnNG91NiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5k5vZwRFZR5aZeniqb/giphy.gif', category: 'avatars', rarity: 'rare' },
    { id: 'avatar-alien', name: 'Space Visitor', description: 'From another world', price: 500, icon: '👽', preview: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExYXNxbnpvcmFlb2V5M2g3OG5lM2RsYmp0Z3o2OXUyNnphczh4bm13NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/RD3NWYui3Hq66klIXo/giphy.gif', category: 'avatars', rarity: 'legendary' },
    { id: 'avatar-detective', name: 'Poker Detective', description: 'Solve the game', price: 280, icon: '🕵️', preview: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbHVpbDRyN3prNXJsc3Frdnpna2gxaTdneHFhNWN3NjI2ZWlzNW43eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/WmoN5PijdSE7JiwOFG/giphy.gif', category: 'avatars', rarity: 'rare' },
    { id: 'avatar-ninja', name: 'Shadow Ninja', description: 'Stealth and precision', price: 320, icon: '🥷', preview: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXVtbWg0MTcyOGNqaGtxMjFoaHRkbnI3MDVrYWd3cTRzanozOWM3dSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/2sXdH0WGO0q7JsJGGp/giphy.gif', category: 'avatars', rarity: 'epic' },
    { id: 'avatar-wizard', name: 'Magic Wizard', description: 'Mystical powers', price: 380, icon: '🧙', preview: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2RnZTR3NXh4bGw2NWltZHJrOWZkbXNlb3F6YTI3ODd4cjBrb3M5bCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0ExsgrTuACbtPaqQ/giphy.gif', category: 'avatars', rarity: 'epic' },
    { id: 'avatar-superhero', name: 'Casino Hero', description: 'Save the day', price: 450, icon: '🦸', preview: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDBxZHZwenhxOWJlZWp1eWF6MHF2ODluZGN5N200eW1xaGFidHl6MiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ShZ1AHZ1AKyt2/giphy.gif', category: 'avatars', rarity: 'legendary' },
    { id: 'avatar-pirate', name: 'Treasure Pirate', description: 'Hunt for gold', price: 290, icon: '🏴‍☠️', preview: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHhxMDFocGNzcnRidHJ0aHY0OXNvcHBvOGRoc244MXQ0bmVza3dwdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ildLrpK7sOV9ky6NOf/giphy.gif', category: 'avatars', rarity: 'rare' },

    // Effects
    { id: 'effect-confetti', name: 'Victory Confetti', description: 'Celebrate your wins', price: 150, icon: '🎉', preview: '🎊', category: 'effects', rarity: 'rare' },
    { id: 'effect-fireworks', name: 'Fireworks Show', description: 'Spectacular celebration', price: 200, icon: '🎆', preview: '✨', category: 'effects', rarity: 'rare' },
    { id: 'effect-rainbow', name: 'Rainbow Trail', description: 'Colorful victory path', price: 180, icon: '🌈', preview: '🎨', category: 'effects', rarity: 'rare' },
    { id: 'effect-gold-rain', name: 'Gold Rain', description: 'Shower of gold coins', price: 250, icon: '💰', preview: '🪙', category: 'effects', rarity: 'epic' },

    // Boosters
    { id: 'booster-luck', name: 'Luck Booster', description: 'Increase win chances', price: 100, icon: '🍀', preview: '⭐', category: 'boosters', rarity: 'rare' },
    { id: 'booster-speed', name: 'Speed Boost', description: 'Faster game rounds', price: 80, icon: '⚡', preview: '💨', category: 'boosters', rarity: 'common' },
    { id: 'booster-vision', name: 'Card Vision', description: 'See opponent cards', price: 300, icon: '👁️', preview: '🔮', category: 'boosters', rarity: 'epic' },
    { id: 'booster-shield', name: 'Protection Shield', description: 'Block bad luck', price: 150, icon: '🛡️', preview: '🔒', category: 'boosters', rarity: 'rare' }
  ]

  const categories = [
    { id: 'subscriptions', name: 'Premium', icon: '💎', count: 4 },
    { id: 'themes', name: 'Themes', icon: '🎨', count: products.filter(p => p.category === 'themes').length },
    { id: 'skins', name: 'Table Skins', icon: '🎲', count: products.filter(p => p.category === 'skins').length },
    { id: 'avatars', name: 'Avatars', icon: '👤', count: products.filter(p => p.category === 'avatars').length },
    { id: 'effects', name: 'Effects', icon: '✨', count: products.filter(p => p.category === 'effects').length },
    { id: 'boosters', name: 'Boosters', icon: '⚡', count: products.filter(p => p.category === 'boosters').length }
  ]

  // Información de subscripciones premium
  const subscriptionPlans = [
    {
      level: 'free' as SubscriptionLevel,
      name: 'FREE',
      price: '$0',
      color: 'rgba(150, 150, 150, 0.8)',
      icon: '🆓',
      benefits: [
        'Basic game access',
        '5 simultaneous tables',
        'Basic themes',
        'Lobby advertisements'
      ],
      monthlyCredits: 0,
      freeItems: 0,
      discount: '0%'
    },
    {
      level: 'bronze' as SubscriptionLevel,
      name: 'BRONZE',
      price: '$5/month',
      color: 'rgba(205, 127, 50, 0.8)',
      icon: '🥉',
      benefits: [
        '+50 Store Credits monthly',
        '1 Free rare item per month',
        'No lobby advertisements',
        'Special profile badge',
        'Premium chat access',
        '10% discount on rare items'
      ],
      monthlyCredits: 50,
      freeItems: 1,
      discount: '10%'
    },
    {
      level: 'silver' as SubscriptionLevel,
      name: 'SILVER',
      price: '$10/month',
      color: 'rgba(192, 192, 192, 0.8)',
      icon: '🥈',
      benefits: [
        '+100 Store Credits monthly',
        '2 Free rare items per month',
        'Early access to themes',
        'Advanced statistics',
        'Notification customization',
        '20% discount on epic items',
        'Priority support'
      ],
      monthlyCredits: 100,
      freeItems: 2,
      discount: '20%'
    },
    {
      level: 'gold' as SubscriptionLevel,
      name: 'GOLD',
      price: '$20/month',
      color: 'rgba(255, 215, 0, 0.8)',
      icon: '🥇',
      benefits: [
        '+200 Store Credits monthly',
        '3 Free epic items per month',
        'All premium themes',
        'Tournament spectator mode',
        'Global statistics',
        '30% discount on all items',
        'VIP chat with Gold members',
        'Exclusive invitations'
      ],
      monthlyCredits: 200,
      freeItems: 3,
      discount: '30%'
    },
    {
      level: 'diamond' as SubscriptionLevel,
      name: 'DIAMOND',
      price: '$50/month',
      color: 'rgba(185, 242, 255, 0.8)',
      icon: '💎',
      benefits: [
        'Unlimited Store Credits',
        'ALL items unlocked',
        'Full profile customization',
        'Custom name on tables',
        'Beta features access',
        '24/7 chat support',
        'VIP event invitations',
        'Unlimited private tables',
        'Advanced global statistics'
      ],
      monthlyCredits: 9999, // Ilimitado
      freeItems: 99, // Ilimitado
      discount: '50%'
    }
  ]

  const buyProduct = (product: Product) => {
    // Aplicar descuentos basados en subscripción
    let discountedPrice = product.price
    if (subscription === 'bronze' && product.rarity === 'rare') discountedPrice = Math.floor(product.price * 0.9)
    if (subscription === 'silver' && product.rarity === 'epic') discountedPrice = Math.floor(product.price * 0.8)
    if (subscription === 'gold') discountedPrice = Math.floor(product.price * 0.7)
    if (subscription === 'diamond') discountedPrice = Math.floor(product.price * 0.5)

    if (storeCredits >= discountedPrice) {
      setStoreCredits(prev => prev - discountedPrice)
      addNotification(`🎉 Purchased ${product.name}!`)

      // Handle different product types
      if (product.category === 'skins') {
        setSkin(product.id.replace('-felt', '') as any)
      } else if (product.category === 'themes') {
        setTheme(product.id.replace('-theme', '') as any)
      }
    } else {
      addNotification('❌ Not enough store credits!')
    }
  }

  const subscribeToPlan = (plan: typeof subscriptionPlans[0]) => {
    // Aquí iría la lógica de pago real
    if (plan.level === 'free') {
      setSubscription('free')
      addNotification('✅ Switched to Free plan')
    } else {
      // Simular compra exitosa
      setSubscription(plan.level)
      addNotification(`🎉 Subscribed to ${plan.name} plan!`)
    }

    // Enviar actualización al servidor
    if (socket && socket.connected) {
      socket.emit(ClientEvents.UPDATE_SUBSCRIPTION, plan.level)
      console.log('💎 CLIENT: Subscription updated to:', plan.level)
    }

    // Guardar en localStorage para persistencia
    localStorage.setItem('userSubscription', plan.level)
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'rgba(150, 150, 150, 0.8)'
      case 'rare': return 'rgba(0, 150, 255, 0.8)'
      case 'epic': return 'rgba(150, 0, 255, 0.8)'
      case 'legendary': return 'rgba(255, 150, 0, 0.8)'
      default: return 'rgba(150, 150, 150, 0.8)'
    }
  }

  if (!openStore) return null

  return (
    <div
      className="modal"
      onClick={() => setOpenStore(false)}
      style={{
        overscrollBehavior: 'contain',
        touchAction: 'none'
      }}
    >
      <div
        className="box store-modal"
        onClick={e => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.85), rgba(20, 20, 20, 0.9))',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          maxWidth: '900px',
          width: '95%',
          maxHeight: window.innerWidth <= 768 ? '75vh' : '80vh',
          overflow: 'hidden',
          backdropFilter: 'blur(15px)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(255, 255, 255, 0.05)',
          animation: 'storeEntrance 0.5s ease-out',
          position: 'relative',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y'
        }}
      >
        {/* Botón de cerrar en esquina superior derecha */}
        <button
          onClick={() => setOpenStore(false)}
          style={{
            position: 'absolute',
            top: window.innerWidth <= 768 ? '8px' : '12px',
            right: window.innerWidth <= 768 ? '12px' : '16px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: window.innerWidth <= 768 ? 18 : 20,
            fontWeight: 600,
            cursor: 'pointer',
            padding: window.innerWidth <= 768 ? '6px 10px' : '8px 12px',
            borderRadius: '12px',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(8px)',
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
            ;(e.target as HTMLElement).style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
            ;(e.target as HTMLElement).style.transform = 'scale(1)'
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: window.innerWidth <= 768 ? '16px 16px 12px 16px' : '20px 32px 16px 32px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(255, 255, 255, 0.02)',
          minHeight: window.innerWidth <= 768 ? 'auto' : '80px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: window.innerWidth <= 768 ? '12px' : '20px' }}>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: window.innerWidth <= 768 ? 20 : 28,
                fontWeight: 800,
                color: '#ffffff',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                letterSpacing: '0.5px',
                lineHeight: '1.2'
              }}>
                🛒 Store
              </h1>
            </div>

            {/* Credits y Plan en una línea para móvil */}
            {window.innerWidth <= 768 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '2px'
              }}>
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>💎</span>
                  {storeCredits.toLocaleString()}
                  <span>💎</span>
                </div>
                <div style={{
                  fontSize: '10px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}>
                  <span style={{
                    color: subscriptionPlans.find(p => p.level === subscription)?.color || 'rgba(150, 150, 150, 0.8)',
                    fontSize: '11px'
                  }}>
                    {subscriptionPlans.find(p => p.level === subscription)?.icon || '🆓'}
                  </span>
                  <span>
                    {subscriptionPlans.find(p => p.level === subscription)?.name || 'FREE'}
                    {subscription !== 'free' && ` (${subscriptionPlans.find(p => p.level === subscription)?.discount}%)`}
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <div style={{
                  fontSize: 14,
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginTop: 2,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span>💎</span>
                  {storeCredits.toLocaleString()} Credits
                  <span>💎</span>
                </div>

                {/* Subscription Info */}
                <div style={{
                  fontSize: 12,
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginTop: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{
                    color: subscriptionPlans.find(p => p.level === subscription)?.color || 'rgba(150, 150, 150, 0.8)',
                    fontSize: '14px'
                  }}>
                    {subscriptionPlans.find(p => p.level === subscription)?.icon || '🆓'}
                  </span>
                  <span>
                    {subscriptionPlans.find(p => p.level === subscription)?.name || 'FREE'} Plan
                    {subscription !== 'free' && ` (${subscriptionPlans.find(p => p.level === subscription)?.discount} discount)`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        {window.innerWidth <= 768 ? (
          // Diseño de cuadrícula para móvil
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.02)',
              overscrollBehavior: 'contain',
              touchAction: 'pan-y'
            }}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '6px',
              maxWidth: '300px',
              margin: '0 auto'
            }}>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  style={{
                    background: selectedCategory === category.id
                      ? 'rgba(255, 255, 255, 0.15)'
                      : 'rgba(255, 255, 255, 0.08)',
                    border: `1px solid ${selectedCategory === category.id ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)'}`,
                    color: selectedCategory === category.id ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: '8px 4px',
                    borderRadius: '10px',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    minHeight: '50px',
                    justifyContent: 'center',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== category.id) {
                      (e.target as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.12)'
                      ;(e.target as HTMLElement).style.transform = 'scale(1.05)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== category.id) {
                      (e.target as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.08)'
                      ;(e.target as HTMLElement).style.transform = 'scale(1)'
                    }
                  }}
                >
                  <span style={{ fontSize: '16px', lineHeight: '1' }}>{category.icon}</span>
                  <span style={{
                    fontSize: '8px',
                    lineHeight: '1',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%'
                  }}>
                    {category.name}
                  </span>
                  <span style={{
                    background: 'rgba(255, 215, 0, 0.3)',
                    color: 'rgba(255, 255, 255, 0.9)',
                    padding: '1px 3px',
                    borderRadius: '4px',
                    fontSize: '7px',
                    fontWeight: 800,
                    lineHeight: '1'
                  }}>
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Diseño horizontal para desktop
          <div style={{
            display: 'flex',
            gap: '8px',
            padding: '16px 32px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            overflowX: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255, 215, 0, 0.3) transparent',
            scrollBehavior: 'smooth'
          }}>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  background: selectedCategory === category.id
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${selectedCategory === category.id ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                  color: selectedCategory === category.id ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  minWidth: '100px',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category.id) {
                    (e.target as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                    ;(e.target as HTMLElement).style.transform = 'translateY(-2px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category.id) {
                    (e.target as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                    ;(e.target as HTMLElement).style.transform = 'translateY(0)'
                  }
                }}
              >
                <span style={{ fontSize: '18px' }}>{category.icon}</span>
                <span>{category.name}</span>
                <span style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  padding: '2px 6px',
                  borderRadius: '8px',
                  fontSize: '10px',
                  fontWeight: 700
                }}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Products Grid */}
        <div
          style={{
            padding: window.innerWidth <= 768 ? '16px 16px' : '24px 32px',
            maxHeight: window.innerWidth <= 768 ? '420px' : '400px',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255, 215, 0, 0.3) transparent',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            touchAction: 'pan-y'
          }}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: selectedCategory === 'subscriptions'
              ? 'repeat(auto-fit, minmax(280px, 1fr))'
              : window.innerWidth <= 768
                ? 'repeat(auto-fill, minmax(140px, 1fr))'
                : 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: window.innerWidth <= 768 ? '12px' : '16px',
            animation: 'fadeInGrid 0.5s ease-out'
          }}>
            {
              selectedCategory === 'subscriptions' ? (
                subscriptionPlans.map(plan => (
                  <div
                    key={plan.level}
                    style={{
                      background: subscription === plan.level
                        ? 'rgba(50, 200, 100, 0.1)'
                        : 'rgba(255, 255, 255, 0.03)',
                      border: `2px solid ${subscription === plan.level ? 'rgba(50, 200, 100, 0.3)' : plan.color}`,
                      borderRadius: '16px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      backdropFilter: 'blur(5px)',
                      minHeight: '300px',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                    onClick={() => subscribeToPlan(plan)}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.transform = 'translateY(-4px)'
                      ;(e.target as HTMLElement).style.boxShadow = '0 12px 30px rgba(255, 215, 0, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.transform = 'translateY(0)'
                      ;(e.target as HTMLElement).style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    {/* Current Plan Badge */}
                    {subscription === plan.level && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(50, 200, 100, 0.9)',
                        color: '#ffffff',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 800,
                        textTransform: 'uppercase'
                      }}>
                        ACTIVE
                      </div>
                    )}

                    {/* Plan Header */}
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                      <div style={{ fontSize: '48px', marginBottom: '8px' }}>{plan.icon}</div>
                      <h3 style={{
                        margin: '0 0 4px 0',
                        fontSize: '24px',
                        fontWeight: 900,
                        color: '#ffffff',
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                      }}>
                        {plan.name}
                      </h3>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: 800,
                        color: plan.color,
                        textShadow: '0 0 8px rgba(255, 255, 255, 0.3)'
                      }}>
                        {plan.price}
                      </div>
                    </div>

                    {/* Monthly Benefits */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: 'rgba(255, 255, 255, 0.9)'
                      }}>
                        <span>💎</span>
                        <span>+{plan.monthlyCredits === 9999 ? '∞' : plan.monthlyCredits} Credits/month</span>
                      </div>
                      {plan.freeItems > 0 && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '8px',
                          fontSize: '14px',
                          fontWeight: 700,
                          color: 'rgba(255, 255, 255, 0.9)'
                        }}>
                          <span>🎁</span>
                          <span>{plan.freeItems === 99 ? '∞' : plan.freeItems} Free items/month</span>
                        </div>
                      )}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: plan.color
                      }}>
                        <span>💰</span>
                        <span>{plan.discount} discount</span>
                      </div>
                    </div>

                    {/* Benefits List */}
                    <div style={{ flex: 1 }}>
                      {plan.benefits.map((benefit, index) => (
                        <div
                          key={index}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            marginBottom: '6px',
                            fontSize: '12px',
                            color: 'rgba(200, 200, 200, 0.9)',
                            lineHeight: '1.4'
                          }}
                        >
                          <span style={{ color: plan.color, fontSize: '10px', marginTop: '2px' }}>✓</span>
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>

                    {/* Subscribe Button */}
                    <button
                      disabled={subscription === plan.level}
                      style={{
                        background: subscription === plan.level
                          ? 'rgba(50, 200, 100, 0.2)'
                          : plan.level === 'free' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                        border: `1px solid ${subscription === plan.level ? 'rgba(50, 200, 100, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
                        color: subscription === plan.level ? 'rgba(80, 255, 80, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                        fontSize: '14px',
                        fontWeight: 800,
                        padding: '12px 20px',
                        borderRadius: '12px',
                        cursor: subscription === plan.level ? 'default' : 'pointer',
                        transition: 'all 0.3s ease',
                        width: '100%',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginTop: '16px'
                      }}
                      onMouseEnter={(e) => {
                        if (subscription !== plan.level) {
                          (e.target as HTMLElement).style.transform = 'scale(1.02)'
                          ;(e.target as HTMLElement).style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.5)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (subscription !== plan.level) {
                          (e.target as HTMLElement).style.transform = 'scale(1)'
                          ;(e.target as HTMLElement).style.boxShadow = 'none'
                        }
                      }}
                    >
                      {subscription === plan.level ? '✓ ACTIVE' : plan.level === 'free' ? 'CURRENT' : 'SUBSCRIBE'}
                    </button>
                  </div>
                ))
              ) : (
                products.filter(product => product.category === selectedCategory).map(product => (
                <div
                  key={product.id}
                  style={{
                    background: product.owned
                      ? 'rgba(50, 200, 100, 0.1)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${product.owned ? 'rgba(50, 200, 100, 0.3)' : 'rgba(255, 255, 255, 0.1)'} `,
                    borderRadius: '12px',
                    padding: window.innerWidth <= 768 ? '12px' : '16px',
                    cursor: product.owned ? 'default' : 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    backdropFilter: 'blur(5px)'
                  }}
                  onClick={() => !product.owned && buyProduct(product)}
                  onMouseEnter={(e) => {
                    if (!product.owned) {
                      (e.target as HTMLElement).style.transform = 'translateY(-8px) scale(1.02)'
                      ;(e.target as HTMLElement).style.boxShadow = '0 12px 30px rgba(255, 215, 0, 0.4)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!product.owned) {
                      (e.target as HTMLElement).style.transform = 'translateY(0) scale(1)'
                      ;(e.target as HTMLElement).style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)'
                    }
                  }}
                >
                  {/* Rarity Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: getRarityColor(product.rarity),
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)'
                  }}>
                    {product.rarity}
                  </div>

                  {/* Product Preview */}
                  <div style={{
                    textAlign: 'center',
                    marginBottom: '12px',
                    fontSize: window.innerWidth <= 768 ? '36px' : '48px',
                    animation: 'bounce 2s ease-in-out infinite'
                  }}>
                    {product.preview.startsWith('http') ? (
                      <img
                        src={product.preview}
                        alt={product.name}
                        style={{
                          width: window.innerWidth <= 768 ? '60px' : '80px',
                          height: window.innerWidth <= 768 ? '60px' : '80px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          border: '2px solid rgba(255, 255, 255, 0.3)'
                        }}
                      />
                    ) : (
                      product.preview
                    )}
                  </div>

                  {/* Product Info */}
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{
                      margin: '0 0 4px 0',
                      fontSize: window.innerWidth <= 768 ? '14px' : '16px',
                      fontWeight: 800,
                      color: '#ffffff',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
                    }}>
                      {product.icon} {product.name}
                    </h3>

                    <p style={{
                      margin: '0 0 12px 0',
                      fontSize: window.innerWidth <= 768 ? '11px' : '12px',
                      color: 'rgba(200, 200, 200, 0.8)',
                      lineHeight: '1.3'
                    }}>
                      {product.description}
                    </p>

                      {/* Price with discount */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      marginBottom: '8px'
                    }}>
                        {product.price > 0 && (() => {
                          let discountedPrice = product.price
                          let discountPercent = 0

                          if (subscription === 'bronze' && product.rarity === 'rare') {
                            discountedPrice = Math.floor(product.price * 0.9)
                            discountPercent = 10
                          } else if (subscription === 'silver' && product.rarity === 'epic') {
                            discountedPrice = Math.floor(product.price * 0.8)
                            discountPercent = 20
                          } else if (subscription === 'gold') {
                            discountedPrice = Math.floor(product.price * 0.7)
                            discountPercent = 30
                          } else if (subscription === 'diamond') {
                            discountedPrice = Math.floor(product.price * 0.5)
                            discountPercent = 50
                          }

                          return (
                            <>
                              {discountPercent > 0 && (
                                <span style={{
                                  fontSize: '12px',
                                  color: 'rgba(255, 150, 150, 0.8)',
                                  textDecoration: 'line-through'
                                }}>
                                  {product.price} 💎
                                </span>
                              )}
                      <span style={{
                        fontSize: '16px',
                        fontWeight: 800,
                        color: product.price === 0 ? 'rgba(80, 255, 80, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                        textShadow: product.price === 0 ? 'none' : '0 0 4px rgba(255, 255, 255, 0.3)'
                      }}>
                                {product.price === 0 ? 'FREE' : `${discountedPrice} 💎`}
                              </span>
                              {discountPercent > 0 && (
                                <span style={{
                                  fontSize: '10px',
                                  background: 'rgba(255, 100, 100, 0.8)',
                                  color: 'white',
                                  padding: '2px 4px',
                                  borderRadius: '4px',
                                  fontWeight: 800
                                }}>
                                  -{discountPercent}%
                                </span>
                              )}
                            </>
                          )
                        })()}
                        {product.price === 0 && (
                          <span style={{
                            fontSize: '16px',
                            fontWeight: 800,
                            color: 'rgba(80, 255, 80, 0.8)'
                          }}>
                            FREE
                      </span>
                        )}
                    </div>

                    {/* Buy Button */}
                    {product.owned ? (
                      <div style={{
                        background: 'rgba(50, 200, 100, 0.1)',
                        color: 'rgba(80, 255, 80, 0.8)',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        textAlign: 'center',
                        border: '1px solid rgba(50, 200, 100, 0.3)'
                      }}>
                        ✓ OWNED
                      </div>
                    ) : (
                      <button
                        disabled={storeCredits < product.price}
                        style={{
                          background: storeCredits < product.price
                            ? 'rgba(255, 100, 100, 0.1)'
                            : 'rgba(255, 255, 255, 0.1)',
                          border: `1px solid ${storeCredits < product.price ? 'rgba(255, 100, 100, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
                          color: storeCredits < product.price ? 'rgba(255, 150, 150, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                          fontSize: window.innerWidth <= 768 ? '11px' : '13px',
                          fontWeight: 700,
                          padding: window.innerWidth <= 768 ? '6px 12px' : '8px 16px',
                          borderRadius: '8px',
                          cursor: storeCredits < product.price ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s ease',
                          width: '100%',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                        onMouseEnter={(e) => {
                          if (storeCredits >= product.price) {
                            (e.target as HTMLElement).style.transform = 'scale(1.05)'
                            ;(e.target as HTMLElement).style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.5)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (storeCredits >= product.price) {
                            (e.target as HTMLElement).style.transform = 'scale(1)'
                            ;(e.target as HTMLElement).style.boxShadow = 'none'
                          }
                        }}
                      >
                        {storeCredits < product.price ? '❌ INSUFFICIENT' : '🛒 BUY NOW'}
                      </button>
                    )}

                  {/* Hover effect overlay */}
                  {!product.owned && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 107, 53, 0.1))',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      pointerEvents: 'none',
                      borderRadius: '14px'
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.opacity = '1'
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.opacity = '0'
                    }}
                    />
                  )}
                </div>
                  </div>
                ))
              )
            }
          </div>
        </div>
      </div>
    </div>
  )
}
