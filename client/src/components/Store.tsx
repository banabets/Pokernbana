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
  const isMobile = window.innerWidth <= 768

  // Productos expandidos con más categorías
  const products: Product[] = [
    // Table Skins
    { id: 'green-felt', name: 'Green Felt', description: 'Classic casino green', price: 0, icon: '🎲', preview: '🟢', category: 'skins', rarity: 'common', owned: skin === 'green' },
    { id: 'blue-felt', name: 'Blue Felt', description: 'Elegant blue velvet', price: 100, icon: '💎', preview: '🔵', category: 'skins', rarity: 'rare', owned: skin === 'blue' },
    { id: 'purple-felt', name: 'Purple Felt', description: 'Royal purple luxury', price: 200, icon: '👑', preview: '🟣', category: 'skins', rarity: 'epic', owned: skin === 'purple' },
    { id: 'red-felt', name: 'Red Felt', description: 'Bold crimson passion', price: 150, icon: '❤️', preview: '🔴', category: 'skins', rarity: 'rare', owned: skin === 'red' },
    { id: 'black-felt', name: 'Black Felt', description: 'Mysterious midnight', price: 250, icon: '🌙', preview: '⚫', category: 'skins', rarity: 'epic', owned: skin === 'black' },
    { id: 'gold-felt', name: 'Gold Felt', description: 'Premium gold edition', price: 500, icon: '🥇', preview: '🟡', category: 'skins', rarity: 'legendary', owned: skin === 'gold' },
    { id: 'crystal-felt', name: 'Crystal Felt', description: 'Diamond crystal shine', price: 800, icon: '💎', preview: '✨', category: 'skins', rarity: 'legendary', owned: skin === 'crystal' },
    { id: 'rainbow-felt', name: 'Rainbow Felt', description: 'Colorful spectrum', price: 600, icon: '🌈', preview: '🎨', category: 'skins', rarity: 'legendary', owned: skin === 'rainbow' },
    { id: 'neon-felt', name: 'Neon Felt', description: 'Electric cyber glow', price: 300, icon: '⚡', preview: '🌈', category: 'skins', rarity: 'epic', owned: skin === 'neon' },
    { id: 'sunset-felt', name: 'Sunset Felt', description: 'Golden hour warmth', price: 350, icon: '🌅', preview: '🧡', category: 'skins', rarity: 'epic', owned: skin === 'sunset' },
    { id: 'ocean-felt', name: 'Ocean Felt', description: 'Deep sea mystery', price: 400, icon: '🌊', preview: '💙', category: 'skins', rarity: 'epic', owned: skin === 'ocean' },
    { id: 'lava-felt', name: 'Lava Felt', description: 'Volcanic heat', price: 450, icon: '🌋', preview: '🔴', category: 'skins', rarity: 'legendary', owned: skin === 'lava' },
    { id: 'ice-felt', name: 'Ice Felt', description: 'Arctic frost', price: 380, icon: '🧊', preview: '❄️', category: 'skins', rarity: 'epic', owned: skin === 'ice' },
    { id: 'forest-felt', name: 'Forest Felt', description: 'Natural woodland', price: 320, icon: '🌲', preview: '🟢', category: 'skins', rarity: 'rare', owned: skin === 'forest' },
    { id: 'royal-felt', name: 'Royal Felt', description: 'Imperial majesty', price: 700, icon: '👑', preview: '💜', category: 'skins', rarity: 'legendary', owned: skin === 'royal' },
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

    // Avatars
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
    { id: 'skins', name: 'Skins', icon: '🎲', count: products.filter(p => p.category === 'skins').length },
    { id: 'avatars', name: 'Avatars', icon: '👤', count: products.filter(p => p.category === 'avatars').length },
    { id: 'effects', name: 'Effects', icon: '✨', count: products.filter(p => p.category === 'effects').length },
    { id: 'boosters', name: 'Boosters', icon: '⚡', count: products.filter(p => p.category === 'boosters').length }
  ]

  const subscriptionPlans = [
    {
      level: 'free' as SubscriptionLevel,
      name: 'FREE',
      price: '$0',
      color: 'rgba(150, 150, 150, 0.8)',
      icon: '🆓',
      benefits: ['Basic game access', '5 simultaneous tables', 'Basic themes', 'Lobby advertisements'],
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
      benefits: ['+50 Store Credits monthly', '1 Free rare item per month', 'No lobby advertisements', 'Special profile badge', 'Premium chat access', '10% discount on rare items'],
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
      benefits: ['+100 Store Credits monthly', '2 Free rare items per month', 'Early access to themes', 'Advanced statistics', 'Notification customization', '20% discount on epic items', 'Priority support'],
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
      benefits: ['+200 Store Credits monthly', '3 Free epic items per month', 'All premium themes', 'Tournament spectator mode', 'Global statistics', '30% discount on all items', 'VIP chat with Gold members', 'Exclusive invitations'],
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
      benefits: ['Unlimited Store Credits', 'ALL items unlocked', 'Full profile customization', 'Custom name on tables', 'Beta features access', '24/7 chat support', 'VIP event invitations', 'Unlimited private tables', 'Advanced global statistics'],
      monthlyCredits: 9999,
      freeItems: 99,
      discount: '50%'
    }
  ]

  const buyProduct = (product: Product) => {
    let discountedPrice = product.price
    if (subscription === 'bronze' && product.rarity === 'rare') discountedPrice = Math.floor(product.price * 0.9)
    if (subscription === 'silver' && product.rarity === 'epic') discountedPrice = Math.floor(product.price * 0.8)
    if (subscription === 'gold') discountedPrice = Math.floor(product.price * 0.7)
    if (subscription === 'diamond') discountedPrice = Math.floor(product.price * 0.5)

    if (storeCredits >= discountedPrice) {
      setStoreCredits(prev => prev - discountedPrice)
      addNotification(`🎉 Purchased ${product.name}!`)

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
    if (plan.level === 'free') {
      setSubscription('free')
      addNotification('✅ Switched to Free plan')
    } else {
      setSubscription(plan.level)
      addNotification(`🎉 Subscribed to ${plan.name} plan!`)
    }

    if (socket && socket.connected) {
      socket.emit(ClientEvents.UPDATE_SUBSCRIPTION, plan.level)
      console.log('💎 CLIENT: Subscription updated to:', plan.level)
    }

    localStorage.setItem('userSubscription', plan.level)
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'rgba(150, 150, 150, 0.9)'
      case 'rare': return 'rgba(0, 150, 255, 0.9)'
      case 'epic': return 'rgba(150, 0, 255, 0.9)'
      case 'legendary': return 'rgba(255, 150, 0, 0.9)'
      default: return 'rgba(150, 150, 150, 0.9)'
    }
  }

  const getDiscountedPrice = (product: Product) => {
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

    return { discountedPrice, discountPercent }
  }

  if (!openStore) return null

  const currentPlan = subscriptionPlans.find(p => p.level === subscription)

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
          background: 'linear-gradient(135deg, rgba(10, 10, 20, 0.95), rgba(20, 15, 30, 0.98))',
          border: '2px solid rgba(255, 215, 0, 0.2)',
          borderRadius: '24px',
          maxWidth: isMobile ? '95%' : '1100px',
          width: '95%',
          maxHeight: isMobile ? '90vh' : '85vh',
          overflow: 'hidden',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.1)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header Section */}
        <div style={{
          padding: isMobile ? '16px' : '24px 32px',
          borderBottom: '2px solid rgba(255, 215, 0, 0.15)',
          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.05), rgba(255, 107, 53, 0.05))',
          position: 'relative'
        }}>
          {/* Close Button */}
          <button
            onClick={() => setOpenStore(false)}
            style={{
              position: 'absolute',
              top: isMobile ? '12px' : '20px',
              right: isMobile ? '12px' : '24px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              fontSize: isMobile ? 20 : 24,
              fontWeight: 600,
              cursor: 'pointer',
              width: isMobile ? '32px' : '40px',
              height: isMobile ? '32px' : '40px',
              borderRadius: '12px',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.background = 'rgba(255, 100, 100, 0.3)'
              ;(e.target as HTMLElement).style.transform = 'rotate(90deg) scale(1.1)'
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.1)'
              ;(e.target as HTMLElement).style.transform = 'rotate(0deg) scale(1)'
            }}
          >
            ✕
          </button>

          {/* Title and Credits */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: '16px',
            flexWrap: isMobile ? 'wrap' : 'nowrap'
          }}>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: isMobile ? 24 : 32,
                fontWeight: 900,
                background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '1px',
                marginBottom: '8px'
              }}>
                🛒 Store
              </h1>
              {!isMobile && (
                <p style={{
                  margin: 0,
                  fontSize: 14,
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontWeight: 500
                }}>
                  Customize your poker experience
                </p>
              )}
            </div>

            {/* Credits Display */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '8px',
              background: 'rgba(255, 215, 0, 0.1)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              borderRadius: '16px',
              padding: isMobile ? '10px 14px' : '14px 20px',
              minWidth: isMobile ? '140px' : '180px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: isMobile ? 18 : 22,
                fontWeight: 800,
                color: '#ffd700'
              }}>
                <span>💎</span>
                <span>{storeCredits.toLocaleString()}</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: isMobile ? 11 : 12,
                color: 'rgba(255, 255, 255, 0.7)'
              }}>
                <span style={{ fontSize: isMobile ? 14 : 16 }}>
                  {currentPlan?.icon}
                </span>
                <span style={{ fontWeight: 600 }}>
                  {currentPlan?.name}
                </span>
                {subscription !== 'free' && (
                  <span style={{
                    background: 'rgba(255, 215, 0, 0.2)',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    fontSize: 10,
                    fontWeight: 700
                  }}>
                    {currentPlan?.discount} OFF
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div style={{
          padding: isMobile ? '12px' : '16px 32px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(0, 0, 0, 0.2)',
          overflowX: 'auto',
          scrollbarWidth: 'thin'
        }}>
          <div style={{
            display: 'flex',
            gap: isMobile ? '8px' : '12px',
            minWidth: 'max-content'
          }}>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  background: selectedCategory === category.id
                    ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 107, 53, 0.2))'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: `2px solid ${selectedCategory === category.id ? 'rgba(255, 215, 0, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
                  color: selectedCategory === category.id ? '#ffd700' : 'rgba(255, 255, 255, 0.7)',
                  fontSize: isMobile ? 12 : 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: isMobile ? '10px 14px' : '12px 20px',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexShrink: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category.id) {
                    (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.1)'
                    ;(e.target as HTMLElement).style.transform = 'translateY(-2px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category.id) {
                    (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.05)'
                    ;(e.target as HTMLElement).style.transform = 'translateY(0)'
                  }
                }}
              >
                <span style={{ fontSize: isMobile ? 16 : 18 }}>{category.icon}</span>
                <span>{category.name}</span>
                <span style={{
                  background: 'rgba(255, 215, 0, 0.2)',
                  color: '#ffd700',
                  padding: '2px 6px',
                  borderRadius: '8px',
                  fontSize: isMobile ? 9 : 10,
                  fontWeight: 800,
                  minWidth: '20px',
                  textAlign: 'center'
                }}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div style={{
          flex: 1,
          padding: isMobile ? '16px' : '24px 32px',
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255, 215, 0, 0.3) transparent'
        }}>
          {selectedCategory === 'subscriptions' ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {subscriptionPlans.map(plan => {
                const isActive = subscription === plan.level
                return (
                  <div
                    key={plan.level}
                    onClick={() => subscribeToPlan(plan)}
                    style={{
                      background: isActive
                        ? 'linear-gradient(135deg, rgba(50, 200, 100, 0.15), rgba(50, 200, 100, 0.05))'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                      border: `2px solid ${isActive ? 'rgba(50, 200, 100, 0.5)' : plan.color}`,
                      borderRadius: '20px',
                      padding: '24px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.transform = 'translateY(-4px)'
                      ;(e.target as HTMLElement).style.boxShadow = `0 15px 40px ${plan.color}40`
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.transform = 'translateY(0)'
                      ;(e.target as HTMLElement).style.boxShadow = 'none'
                    }}
                  >
                    {isActive && (
                      <div style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'rgba(50, 200, 100, 0.9)',
                        color: '#ffffff',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: 11,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}>
                        ✓ Active
                      </div>
                    )}

                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                      <div style={{ fontSize: '56px', marginBottom: '12px' }}>{plan.icon}</div>
                      <h3 style={{
                        margin: '0 0 8px 0',
                        fontSize: '28px',
                        fontWeight: 900,
                        color: '#ffffff',
                        textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                      }}>
                        {plan.name}
                      </h3>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: 800,
                        color: plan.color,
                        textShadow: `0 0 12px ${plan.color}`
                      }}>
                        {plan.price}
                      </div>
                    </div>

                    <div style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '20px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginBottom: '12px',
                        fontSize: 16,
                        fontWeight: 700,
                        color: '#ffd700'
                      }}>
                        <span>💎</span>
                        <span>+{plan.monthlyCredits === 9999 ? '∞' : plan.monthlyCredits} Credits/month</span>
                      </div>
                      {plan.freeItems > 0 && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          marginBottom: '12px',
                          fontSize: 16,
                          fontWeight: 700,
                          color: '#ffd700'
                        }}>
                          <span>🎁</span>
                          <span>{plan.freeItems === 99 ? '∞' : plan.freeItems} Free items/month</span>
                        </div>
                      )}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontSize: 16,
                        fontWeight: 700,
                        color: plan.color
                      }}>
                        <span>💰</span>
                        <span>{plan.discount} discount on all items</span>
                      </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      {plan.benefits.map((benefit, index) => (
                        <div
                          key={index}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            marginBottom: '8px',
                            fontSize: 13,
                            color: 'rgba(255, 255, 255, 0.8)',
                            lineHeight: '1.5'
                          }}
                        >
                          <span style={{ color: plan.color, fontSize: 16, marginTop: '2px' }}>✓</span>
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      disabled={isActive}
                      style={{
                        background: isActive
                          ? 'rgba(50, 200, 100, 0.2)'
                          : 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 107, 53, 0.2))',
                        border: `2px solid ${isActive ? 'rgba(50, 200, 100, 0.5)' : 'rgba(255, 215, 0, 0.5)'}`,
                        color: isActive ? 'rgba(80, 255, 80, 0.8)' : '#ffd700',
                        fontSize: 14,
                        fontWeight: 800,
                        padding: '14px 24px',
                        borderRadius: '12px',
                        cursor: isActive ? 'default' : 'pointer',
                        transition: 'all 0.3s ease',
                        width: '100%',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}
                    >
                      {isActive ? '✓ Current Plan' : plan.level === 'free' ? 'Select' : 'Subscribe'}
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile
                ? 'repeat(auto-fill, minmax(140px, 1fr))'
                : 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: isMobile ? '12px' : '20px'
            }}>
              {products.filter(product => product.category === selectedCategory).map(product => {
                const { discountedPrice, discountPercent } = getDiscountedPrice(product)
                const canAfford = storeCredits >= discountedPrice

                return (
                  <div
                    key={product.id}
                    onClick={() => !product.owned && canAfford && buyProduct(product)}
                    style={{
                      background: product.owned
                        ? 'linear-gradient(135deg, rgba(50, 200, 100, 0.15), rgba(50, 200, 100, 0.05))'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                      border: `2px solid ${product.owned ? 'rgba(50, 200, 100, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                      borderRadius: '16px',
                      padding: isMobile ? '14px' : '18px',
                      cursor: product.owned ? 'default' : canAfford ? 'pointer' : 'not-allowed',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      opacity: product.owned ? 1 : canAfford ? 1 : 0.6
                    }}
                    onMouseEnter={(e) => {
                      if (!product.owned && canAfford) {
                        (e.target as HTMLElement).style.transform = 'translateY(-6px) scale(1.02)'
                        ;(e.target as HTMLElement).style.boxShadow = '0 15px 40px rgba(255, 215, 0, 0.4)'
                        ;(e.target as HTMLElement).style.borderColor = 'rgba(255, 215, 0, 0.6)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!product.owned && canAfford) {
                        (e.target as HTMLElement).style.transform = 'translateY(0) scale(1)'
                        ;(e.target as HTMLElement).style.boxShadow = 'none'
                        ;(e.target as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    {/* Rarity Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: getRarityColor(product.rarity),
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: 9,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
                    }}>
                      {product.rarity}
                    </div>

                    {/* Owned Badge */}
                    {product.owned && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: 'rgba(50, 200, 100, 0.9)',
                        color: '#ffffff',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: 9,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        ✓ Owned
                      </div>
                    )}

                    {/* Preview */}
                    <div style={{
                      textAlign: 'center',
                      marginBottom: '14px',
                      height: isMobile ? '80px' : '100px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {product.preview.startsWith('http') ? (
                        <img
                          src={product.preview}
                          alt={product.name}
                          style={{
                            width: isMobile ? '70px' : '90px',
                            height: isMobile ? '70px' : '90px',
                            borderRadius: '12px',
                            objectFit: 'cover',
                            border: '2px solid rgba(255, 215, 0, 0.3)'
                          }}
                        />
                      ) : (
                        <div style={{
                          fontSize: isMobile ? '48px' : '64px',
                          filter: product.owned ? 'none' : canAfford ? 'none' : 'grayscale(100%) opacity(0.5)'
                        }}>
                          {product.preview}
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div style={{ textAlign: 'center' }}>
                      <h3 style={{
                        margin: '0 0 6px 0',
                        fontSize: isMobile ? 14 : 16,
                        fontWeight: 800,
                        color: '#ffffff',
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}>
                        <span>{product.icon}</span>
                        <span>{product.name}</span>
                      </h3>

                      <p style={{
                        margin: '0 0 12px 0',
                        fontSize: isMobile ? 11 : 12,
                        color: 'rgba(200, 200, 200, 0.8)',
                        lineHeight: '1.4',
                        minHeight: isMobile ? '32px' : '36px'
                      }}>
                        {product.description}
                      </p>

                      {/* Price */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        marginBottom: '12px',
                        flexWrap: 'wrap'
                      }}>
                        {product.price > 0 && (
                          <>
                            {discountPercent > 0 && (
                              <span style={{
                                fontSize: 12,
                                color: 'rgba(255, 150, 150, 0.8)',
                                textDecoration: 'line-through'
                              }}>
                                {product.price}💎
                              </span>
                            )}
                            <span style={{
                              fontSize: isMobile ? 16 : 18,
                              fontWeight: 800,
                              color: canAfford ? '#ffd700' : 'rgba(255, 100, 100, 0.8)',
                              textShadow: canAfford ? '0 0 8px rgba(255, 215, 0, 0.5)' : 'none'
                            }}>
                              {discountedPrice}💎
                            </span>
                            {discountPercent > 0 && (
                              <span style={{
                                background: 'rgba(255, 100, 100, 0.9)',
                                color: 'white',
                                padding: '2px 6px',
                                borderRadius: '6px',
                                fontSize: 10,
                                fontWeight: 800
                              }}>
                                -{discountPercent}%
                              </span>
                            )}
                          </>
                        )}
                        {product.price === 0 && (
                          <span style={{
                            fontSize: isMobile ? 16 : 18,
                            fontWeight: 800,
                            color: 'rgba(80, 255, 80, 0.9)',
                            textShadow: '0 0 8px rgba(80, 255, 80, 0.5)'
                          }}>
                            FREE
                          </span>
                        )}
                      </div>

                      {/* Buy Button */}
                      {product.owned ? (
                        <div style={{
                          background: 'rgba(50, 200, 100, 0.2)',
                          color: 'rgba(80, 255, 80, 0.9)',
                          padding: '10px',
                          borderRadius: '10px',
                          fontSize: 12,
                          fontWeight: 700,
                          textAlign: 'center',
                          border: '1px solid rgba(50, 200, 100, 0.4)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          ✓ Owned
                        </div>
                      ) : (
                        <button
                          disabled={!canAfford}
                          style={{
                            background: canAfford
                              ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 107, 53, 0.2))'
                              : 'rgba(100, 100, 100, 0.2)',
                            border: `2px solid ${canAfford ? 'rgba(255, 215, 0, 0.5)' : 'rgba(100, 100, 100, 0.3)'}`,
                            color: canAfford ? '#ffd700' : 'rgba(150, 150, 150, 0.7)',
                            fontSize: isMobile ? 11 : 12,
                            fontWeight: 800,
                            padding: isMobile ? '10px' : '12px 16px',
                            borderRadius: '10px',
                            cursor: canAfford ? 'pointer' : 'not-allowed',
                            transition: 'all 0.3s ease',
                            width: '100%',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {canAfford ? '🛒 Buy Now' : '❌ Insufficient'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
