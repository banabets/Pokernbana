import React, { useState } from 'react'
import { ClientEvents } from 'shared/protocol'

interface StoreProps {
  socket: any
  openStore: boolean
  setOpenStore: (open: boolean) => void
  skin: 'green' | 'blue' | 'purple' | 'gold' | 'crystal' | 'red' | 'black' | 'rainbow' | 'neon' | 'sunset' | 'ocean' | 'lava' | 'ice' | 'forest' | 'royal' | 'galaxy' | 'diamond' | 'platinum' | 'emerald'
  setSkin: (skin: 'green' | 'blue' | 'purple' | 'gold' | 'crystal' | 'red' | 'black' | 'rainbow' | 'neon' | 'sunset' | 'ocean' | 'lava' | 'ice' | 'forest' | 'royal' | 'galaxy' | 'diamond' | 'platinum' | 'emerald') => void
  theme: 'casino' | 'beach' | 'space' | 'neon' | 'cyberpunk' | 'dark' | 'sunset' | 'matrix' | 'fire' | 'ocean' | 'purple'
  setTheme: (theme: 'casino' | 'beach' | 'space' | 'neon' | 'cyberpunk' | 'dark' | 'sunset' | 'matrix' | 'fire' | 'ocean' | 'purple') => void
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
  const [selectedCategory, setSelectedCategory] = useState('memberships')

  // Productos del casino
  const products: Product[] = [
    // Table Skins
    { id: 'green-felt', name: 'Green Felt', description: 'Classic casino green', price: 0, icon: '', preview: '🟢', category: 'tables', rarity: 'common', owned: skin === 'green' },
    { id: 'blue-felt', name: 'Blue Felt', description: 'Elegant blue velvet', price: 100, icon: '', preview: '🔵', category: 'tables', rarity: 'rare', owned: skin === 'blue' },
    { id: 'purple-felt', name: 'Purple Felt', description: 'Royal purple luxury', price: 200, icon: '', preview: '🟣', category: 'tables', rarity: 'epic', owned: skin === 'purple' },
    { id: 'red-felt', name: 'Red Felt', description: 'Bold crimson passion', price: 150, icon: '', preview: '🔴', category: 'tables', rarity: 'rare', owned: skin === 'red' },
    { id: 'black-felt', name: 'Black Felt', description: 'Mysterious midnight', price: 250, icon: '', preview: '⚫', category: 'tables', rarity: 'epic', owned: skin === 'black' },
    { id: 'gold-felt', name: 'Gold Felt', description: 'Premium gold edition', price: 500, icon: '', preview: '🟡', category: 'tables', rarity: 'legendary', owned: skin === 'gold' },
    { id: 'crystal-felt', name: 'Crystal Felt', description: 'Diamond crystal shine', price: 800, icon: '', preview: '✨', category: 'tables', rarity: 'legendary', owned: skin === 'crystal' },

    // Themes
    { id: 'casino-theme', name: 'Casino Classic', description: 'Traditional casino feel', price: 0, icon: '', preview: '🎰', category: 'themes', rarity: 'common', owned: theme === 'casino' },
    { id: 'neon-theme', name: 'Neon Cyber', description: 'Futuristic neon lights', price: 0, icon: '', preview: '⚡', category: 'themes', rarity: 'common', owned: theme === 'neon' },
    { id: 'dark-theme', name: 'Dark Mode', description: 'Easy on the eyes', price: 0, icon: '', preview: '🌙', category: 'themes', rarity: 'common', owned: theme === 'dark' },
    { id: 'beach-theme', name: 'Beach Paradise', description: 'Tropical island vibes', price: 150, icon: '', preview: '🌴', category: 'themes', rarity: 'rare', owned: theme === 'beach' },
    { id: 'space-theme', name: 'Space Explorer', description: 'Cosmic adventure', price: 250, icon: '', preview: '🌌', category: 'themes', rarity: 'rare', owned: theme === 'space' },
    { id: 'cyberpunk-theme', name: 'Cyberpunk', description: 'High-tech future', price: 500, icon: '', preview: '💾', category: 'themes', rarity: 'epic', owned: theme === 'cyberpunk' },
    { id: 'sunset-theme', name: 'Sunset Bliss', description: 'Golden hour magic', price: 300, icon: '', preview: '🌆', category: 'themes', rarity: 'rare', owned: theme === 'sunset' },
    { id: 'matrix-theme', name: 'Matrix Code', description: 'Digital rain effect', price: 600, icon: '', preview: '📊', category: 'themes', rarity: 'epic', owned: theme === 'matrix' },
    { id: 'fire-theme', name: 'Fire Storm', description: 'Burning hot effects', price: 400, icon: '', preview: '🌋', category: 'themes', rarity: 'epic', owned: theme === 'fire' },
    { id: 'ocean-theme', name: 'Ocean Deep', description: 'Underwater mystery', price: 350, icon: '', preview: '🐠', category: 'themes', rarity: 'rare', owned: theme === 'ocean' },
    { id: 'purple-theme', name: 'Purple Night', description: 'Black and purple elegance', price: 450, icon: '', preview: '💜', category: 'themes', rarity: 'epic', owned: theme === 'purple' },

    // Avatars
    { id: 'avatar-king', name: 'Poker King', description: 'Rule the tables', price: 300, icon: '', preview: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHBzZHppcGN1a2E1cmpiZHM3eXRpcm9ldzBxZWNlb2p1d3ljZnEwdSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5rIswVA3x6xw0jEuKh/giphy.gif', category: 'avatars', rarity: 'epic' },
    { id: 'avatar-queen', name: 'Poker Queen', description: 'Elegant and fierce', price: 250, icon: '', preview: 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExZmhwbTZrZDdzdnpvODd5MHE3OXI5MWttdjJrODcwYm5odXpnMDR5ayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LdzhWzAObvhtWAMSfj/giphy.gif', category: 'avatars', rarity: 'rare' },
    { id: 'avatar-joker', name: 'Joker Wild', description: 'Chaos and fun', price: 400, icon: '', preview: 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWpjZjhla2l5OXh4ZXF0dWs1ZTg1aXFqNzZkOTRtNTVxcTdwcjBodSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/yOt4iUfeWtk88/giphy.gif', category: 'avatars', rarity: 'epic' },
    { id: 'avatar-robot', name: 'AI Assistant', description: 'Future is here', price: 350, icon: '', preview: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExYmhvemVobDl2ZnZ4emIxcTVjMmMycW8zZjE5ZTFleW94M2tnNG91NiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5k5vZwRFZR5aZeniqb/giphy.gif', category: 'avatars', rarity: 'rare' },
    { id: 'avatar-alien', name: 'Space Visitor', description: 'From another world', price: 500, icon: '', preview: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExYXNxbnpvcmFlb2V5M2g3OG5lM2RsYmp0Z3o2OXUyNnphczh4bm13NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/RD3NWYui3Hq66klIXo/giphy.gif', category: 'avatars', rarity: 'legendary' },
    { id: 'avatar-detective', name: 'Poker Detective', description: 'Solve the game', price: 280, icon: '', preview: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbHVpbDRyN3prNXJsc3Frdnpna2gxaTdneHFhNWN3NjI2ZWlzNW43eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/WmoN5PijdSE7JiwOFG/giphy.gif', category: 'avatars', rarity: 'rare' },
    { id: 'avatar-ninja', name: 'Shadow Ninja', description: 'Stealth and precision', price: 320, icon: '', preview: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXVtbWg0MTcyOGNqaGtxMjFoaHRkbnI3MDVrYWd3cTRzanozOWM3dSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/2sXdH0WGO0q7JsJGGp/giphy.gif', category: 'avatars', rarity: 'epic' },
    { id: 'avatar-wizard', name: 'Magic Wizard', description: 'Mystical powers', price: 380, icon: '', preview: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2RnZTR3NXh4bGw2NWltZHJrOWZkbXNlb3F6YTI3ODd4cjBrb3M5bCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0ExsgrTuACbtPaqQ/giphy.gif', category: 'avatars', rarity: 'epic' },
    { id: 'avatar-superhero', name: 'Casino Hero', description: 'Save the day', price: 450, icon: '', preview: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDBxZHZwenhxOWJlZWp1eWF6MHF2ODluZGN5N200eW1xaGFidHl6MiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ShZ1AHZ1AKyt2/giphy.gif', category: 'avatars', rarity: 'legendary' },
    { id: 'avatar-pirate', name: 'Treasure Pirate', description: 'Hunt for gold', price: 290, icon: '', preview: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHhxMDFocGNzcnRidHJ0aHY0OXNvcHBvOGRoc244MXQ0bmVza3dwdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ildLrpK7sOV9ky6NOf/giphy.gif', category: 'avatars', rarity: 'rare' }
  ]

  const categories = [
    { id: 'memberships', name: 'Memberships', count: 4 },
    { id: 'tables', name: 'Tables', count: products.filter(p => p.category === 'tables').length },
    { id: 'themes', name: 'Themes', count: products.filter(p => p.category === 'themes').length },
    { id: 'avatars', name: 'Avatars', count: products.filter(p => p.category === 'avatars').length }
  ]

  // Información de subscripciones premium
  const subscriptionPlans = [
    {
      level: 'free' as SubscriptionLevel,
      name: 'FREE',
      price: '$0',
      color: 'rgba(150, 150, 150, 0.8)',
      icon: '',
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
      icon: '',
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
      icon: '',
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
      icon: '',
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
      icon: '',
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
      monthlyCredits: 9999,
      freeItems: 99,
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
      addNotification(`Purchased ${product.name}!`)

      if (product.category === 'tables') {
        setSkin(product.id.replace('-felt', '') as any)
      } else if (product.category === 'themes') {
        setTheme(product.id.replace('-theme', '') as any)
      } else if (product.category === 'avatars') {
        // Aquí se guardaría el avatar en el perfil del usuario
        addNotification(`Avatar ${product.name} purchased!`)
      }
    } else {
      addNotification('Not enough store credits!')
    }
  }

  const subscribeToPlan = (plan: typeof subscriptionPlans[0]) => {
    if (plan.level === 'free') {
      setSubscription('free')
      addNotification('Switched to Free plan')
    } else {
      setSubscription(plan.level)
      addNotification(`Subscribed to ${plan.name} plan!`)
    }

    if (socket && socket.connected) {
      socket.emit(ClientEvents.UPDATE_SUBSCRIPTION, plan.level)
      console.log('CLIENT: Subscription updated to:', plan.level)
    }

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

  const getThemePreviewBackground = (themeName: string) => {
    const themes: { [key: string]: string } = {
      'casino': 'radial-gradient(120% 100% at 50% 20%, #2d8b2d 0%, #0f5a0f 65%)',
      'beach': 'linear-gradient(135deg, #87CEEB 0%, #FFE4B5 50%, #FFA500 100%)',
      'space': 'radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      'neon': 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      'cyberpunk': 'linear-gradient(135deg, #00f5ff 0%, #ff00ff 50%, #ff0080 100%)',
      'dark': 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
      'sunset': 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #ff9ff3 100%)',
      'matrix': 'linear-gradient(135deg, #000000 0%, #00ff00 50%, #000000 100%)',
      'fire': 'linear-gradient(135deg, #ff4500 0%, #ff6347 50%, #ffa500 100%)',
      'ocean': 'linear-gradient(135deg, #001f3f 0%, #0074d9 50%, #7fdbff 100%)',
      'purple': 'linear-gradient(135deg, #1a0033 0%, #4a0080 50%, #8b00ff 100%)'
    }
    return themes[themeName] || themes['casino']
  }

  if (!openStore) return null

  const isMobile = window.innerWidth <= 768

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
          maxHeight: isMobile ? '75vh' : '80vh',
          overflow: 'hidden',
          backdropFilter: 'blur(15px)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(255, 255, 255, 0.05)',
          animation: 'storeEntrance 0.5s ease-out',
          position: 'relative',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y'
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => setOpenStore(false)}
          style={{
            position: 'absolute',
            top: isMobile ? '8px' : '12px',
            right: isMobile ? '12px' : '16px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: isMobile ? 18 : 20,
            fontWeight: 600,
            cursor: 'pointer',
            padding: isMobile ? '6px 10px' : '8px 12px',
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
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: isMobile ? '16px 16px 12px 16px' : '20px 32px 16px 32px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: isMobile ? 20 : 28,
              fontWeight: 800,
              color: '#ffffff',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              letterSpacing: '0.5px',
              lineHeight: '1.2'
            }}>
              Casino Store
            </h1>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '4px'
          }}>
            <div style={{
              fontSize: isMobile ? 14 : 16,
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>Credits:</span>
              <span style={{ color: '#ffffff', fontWeight: 700 }}>{storeCredits.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div style={{
          display: 'flex',
          gap: isMobile ? '6px' : '8px',
          padding: isMobile ? '12px 16px' : '16px 32px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          overflowX: 'auto',
          scrollbarWidth: 'thin'
        }}>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                background: selectedCategory === category.id
                  ? 'rgba(255, 255, 255, 0.15)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${selectedCategory === category.id ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                color: selectedCategory === category.id ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                fontSize: isMobile ? 12 : 14,
                fontWeight: 600,
                cursor: 'pointer',
                padding: isMobile ? '8px 12px' : '10px 16px',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== category.id) {
                  (e.target as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== category.id) {
                  (e.target as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                }
              }}
            >
              {category.name}
              <span style={{
                marginLeft: '6px',
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '2px 6px',
                borderRadius: '8px',
                fontSize: isMobile ? 9 : 10,
                fontWeight: 700
              }}>
                {category.count}
              </span>
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div
          style={{
            padding: isMobile ? '16px' : '24px 32px',
            maxHeight: isMobile ? '420px' : '400px',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent',
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
            gridTemplateColumns: selectedCategory === 'memberships'
              ? (isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))')
              : (isMobile
                ? 'repeat(auto-fill, minmax(140px, 1fr))'
                : 'repeat(auto-fill, minmax(180px, 1fr))'),
            gap: isMobile ? '12px' : '16px',
            animation: 'fadeInGrid 0.5s ease-out'
          }}>
            {selectedCategory === 'memberships' ? (
              subscriptionPlans.map(plan => {
                const isActive = subscription === plan.level
                return (
                  <div
                    key={plan.level}
                    onClick={() => subscribeToPlan(plan)}
                    style={{
                      background: isActive
                        ? 'rgba(50, 200, 100, 0.1)'
                        : 'rgba(255, 255, 255, 0.03)',
                      border: `2px solid ${isActive ? 'rgba(50, 200, 100, 0.4)' : plan.color}`,
                      borderRadius: '16px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.transform = 'translateY(-4px)'
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.transform = 'translateY(0)'
                    }}
                  >
                    {isActive && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(50, 200, 100, 0.9)',
                        color: '#ffffff',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}>
                        Active
                      </div>
                    )}

                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                      <h3 style={{
                        margin: '0 0 8px 0',
                        fontSize: '24px',
                        fontWeight: 800,
                        color: plan.color,
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                      }}>
                        {plan.name}
                      </h3>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        color: '#ffffff'
                      }}>
                        {plan.price}
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      {plan.benefits.map((benefit, index) => (
                        <div
                          key={index}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            marginBottom: '6px',
                            fontSize: 12,
                            color: 'rgba(255, 255, 255, 0.8)',
                            lineHeight: '1.4'
                          }}
                        >
                          <span style={{ color: plan.color }}>✓</span>
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      disabled={isActive}
                      style={{
                        background: isActive
                          ? 'rgba(50, 200, 100, 0.2)'
                          : 'rgba(255, 255, 255, 0.1)',
                        border: `1px solid ${isActive ? 'rgba(50, 200, 100, 0.3)' : 'rgba(255, 255, 255, 0.3)'}`,
                        color: isActive ? 'rgba(80, 255, 80, 0.8)' : '#ffffff',
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '10px',
                        borderRadius: '8px',
                        cursor: isActive ? 'default' : 'pointer',
                        transition: 'all 0.3s ease',
                        width: '100%',
                        textTransform: 'uppercase'
                      }}
                    >
                      {isActive ? 'Current Plan' : plan.level === 'free' ? 'Select' : 'Subscribe'}
                    </button>
                  </div>
                )
              })
            ) : (
              products.filter(product => product.category === selectedCategory).map(product => {
              const canAfford = storeCredits >= product.price || product.price === 0
              const isOwned = product.owned

              return (
                <div
                  key={product.id}
                  onClick={() => !isOwned && canAfford && buyProduct(product)}
                  style={{
                    background: isOwned
                      ? 'rgba(50, 200, 100, 0.1)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${isOwned ? 'rgba(50, 200, 100, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                    borderRadius: '12px',
                    padding: isMobile ? '14px' : '18px',
                    cursor: isOwned ? 'default' : canAfford ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    backdropFilter: 'blur(5px)',
                    opacity: isOwned ? 1 : canAfford ? 1 : 0.6
                  }}
                  onMouseEnter={(e) => {
                    if (!isOwned && canAfford) {
                      (e.target as HTMLElement).style.transform = 'translateY(-4px)'
                      ;(e.target as HTMLElement).style.boxShadow = '0 8px 20px rgba(255, 255, 255, 0.2)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isOwned && canAfford) {
                      (e.target as HTMLElement).style.transform = 'translateY(0)'
                      ;(e.target as HTMLElement).style.boxShadow = 'none'
                    }
                  }}
                >
                  {/* Rarity Badge */}
                  {product.rarity !== 'common' && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: getRarityColor(product.rarity),
                      color: '#ffffff',
                      padding: '3px 8px',
                      borderRadius: '8px',
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      {product.rarity}
                    </div>
                  )}

                  {/* Owned Badge */}
                  {isOwned && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      background: 'rgba(50, 200, 100, 0.9)',
                      color: '#ffffff',
                      padding: '3px 8px',
                      borderRadius: '8px',
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      Owned
                    </div>
                  )}

                  {/* Preview */}
                  {product.category === 'themes' ? (
                    <div className="theme-preview" style={{
                      marginBottom: '12px',
                      height: isMobile ? '80px' : '120px',
                      background: getThemePreviewBackground(product.id.replace('-theme', '')),
                      borderRadius: '12px',
                      border: `2px solid ${isOwned ? 'rgba(50, 200, 100, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: isOwned ? 'default' : canAfford ? 'pointer' : 'not-allowed'
                    }}>
                      <div className="theme-preview-label" style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '8px',
                        background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 600,
                        textAlign: 'center'
                      }}>
                        {product.name}
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      marginBottom: '12px',
                      fontSize: isMobile ? '40px' : '56px',
                      height: isMobile ? '60px' : '80px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {product.preview.startsWith('http') ? (
                        <img
                          src={product.preview}
                          alt={product.name}
                          loading="lazy"
                          decoding="async"
                        style={{
                          width: isMobile ? '60px' : '80px',
                          height: isMobile ? '60px' : '80px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          border: '2px solid rgba(255, 255, 255, 0.3)'
                        }}
                      />
                    ) : (
                      <span>{product.preview}</span>
                    )}
                    </div>
                  )}

                  {/* Product Info */}
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{
                      margin: '0 0 6px 0',
                      fontSize: isMobile ? '14px' : '16px',
                      fontWeight: 700,
                      color: '#ffffff',
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                    }}>
                      {product.name}
                    </h3>

                    <p style={{
                      margin: '0 0 12px 0',
                      fontSize: isMobile ? '11px' : '12px',
                      color: 'rgba(200, 200, 200, 0.8)',
                      lineHeight: '1.4',
                      minHeight: isMobile ? '28px' : '32px'
                    }}>
                      {product.description}
                    </p>

                    {/* Price */}
                    <div style={{
                      marginBottom: '12px',
                      fontSize: isMobile ? '16px' : '18px',
                      fontWeight: 700,
                      color: product.price === 0 ? 'rgba(80, 255, 80, 0.9)' : '#ffffff'
                    }}>
                      {product.price === 0 ? 'FREE' : `${product.price} Credits`}
                    </div>

                    {/* Buy Button */}
                    {isOwned ? (
                      <div style={{
                        background: 'rgba(50, 200, 100, 0.2)',
                        color: 'rgba(80, 255, 80, 0.9)',
                        padding: '8px',
                        borderRadius: '8px',
                        fontSize: 12,
                        fontWeight: 600,
                        textAlign: 'center',
                        border: '1px solid rgba(50, 200, 100, 0.3)',
                        textTransform: 'uppercase'
                      }}>
                        Owned
                      </div>
                    ) : (
                      <button
                        disabled={!canAfford}
                        style={{
                          background: canAfford
                            ? 'rgba(255, 255, 255, 0.1)'
                            : 'rgba(100, 100, 100, 0.2)',
                          border: `1px solid ${canAfford ? 'rgba(255, 255, 255, 0.3)' : 'rgba(100, 100, 100, 0.3)'}`,
                          color: canAfford ? '#ffffff' : 'rgba(150, 150, 150, 0.7)',
                          fontSize: isMobile ? '11px' : '12px',
                          fontWeight: 600,
                          padding: isMobile ? '8px' : '10px 16px',
                          borderRadius: '8px',
                          cursor: canAfford ? 'pointer' : 'not-allowed',
                          transition: 'all 0.3s ease',
                          width: '100%',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                        onMouseEnter={(e) => {
                          if (canAfford) {
                            (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.15)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (canAfford) {
                            (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.1)'
                          }
                        }}
                      >
                        {canAfford ? (product.category === 'bonuses' ? 'Claim' : 'Buy Now') : 'Insufficient'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
