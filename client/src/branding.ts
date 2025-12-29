// Configuración de branding para Poker Night by Banabets
export const BRANDING = {
  name: "Poker Night by Banabets",
  subtitle: "Texas Hold'em • Real Time • Multiplayer",
  fullTitle: "Poker Night by Banabets - Texas Hold'em Real Time Multiplayer",
  description: "Texas Hold'em Real Time Multiplayer Poker Game",
  tagline: "Play online with friends, custom themes, AI bots, and more!",

  // SEO
  meta: {
    title: "Poker Night by Banabets - Texas Hold'em Real Time Multiplayer",
    description: "Poker Night by Banabets - Texas Hold'em Real Time Multiplayer Poker Game. Play online with friends, custom themes, AI bots, and more!",
    keywords: "poker, texas holdem, online poker, multiplayer poker, poker night, real time poker, poker game, banabets"
  },

  // Social
  social: {
    twitter: "@PokerNightBN",
    discord: "discord.gg/pokernight",
    website: "https://pokernight.banabets.com"
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
