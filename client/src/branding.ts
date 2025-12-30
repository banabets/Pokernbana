// Configuración de branding para Poker Night
export const BRANDING = {
  name: "Poker Night",
  subtitle: "Texas Hold'em • Real Time • Multiplayer",
  fullTitle: "Poker Night - Texas Hold'em Real Time Multiplayer",
  description: "Texas Hold'em Real Time Multiplayer Poker Game",
  tagline: "Play online with friends, custom themes, AI bots, and more!",

  // SEO
  meta: {
    title: "Poker Night - Texas Hold'em Real Time Multiplayer",
    description: "Poker Night - Texas Hold'em Real Time Multiplayer Poker Game. Play online with friends, custom themes, AI bots, and more!",
    keywords: "poker, texas holdem, online poker, multiplayer poker, poker night, real time poker, poker game"
  },

  // Social
  social: {
    twitter: "@PokerNight",
    discord: "discord.gg/pokernight",
    website: "https://pokernight.com"
  },

  // Features highlights
  features: [
    "Texas Hold'em Real Time",
    "Multiplayer Online",
    "AI Bots Opponents",
    "Custom Themes",
    "Real-time Chat",
    "Tournament Ready"
  ]
} as const;

// Función helper para obtener el título completo
export const getFullTitle = () => `${BRANDING.name} - ${BRANDING.subtitle}`;

// Función helper para obtener la descripción completa
export const getFullDescription = () =>
  `${BRANDING.name} - ${BRANDING.description}. ${BRANDING.tagline}`;

export default BRANDING;
