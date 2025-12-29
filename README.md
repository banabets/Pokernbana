# Poker Night by Banabets

**Texas Hold'em • Real Time Multiplayer**

A complete, production-ready Texas Hold'em poker game with advanced features including real-time multiplayer, AI bots, customizable themes, and comprehensive game mechanics.

## ✨ Features

### 🎯 Core Game Features
- **Complete Texas Hold'em Rules**: Full implementation with preflop, flop, turn, river, and showdown
- **Real-time Multiplayer**: Socket.io-powered real-time communication
- **AI Bots**: Intelligent bot opponents with configurable difficulty
- **Multiple Tables**: Create and join different poker tables
- **Tournament Mode Ready**: Extensible architecture for tournaments

### 🎨 User Experience
- **Beautiful 3D UI**: Immersive table design with realistic animations
- **Multiple Themes**: Casino, Neon, Cyberpunk, Beach, Space, and more
- **Responsive Design**: Works on desktop and mobile devices
- **Smooth Animations**: Card dealing, chip movements, and visual effects
- **Real-time Chat**: Global and table-specific chat systems

### 🛠️ Advanced Features
- **Customizable Avatars**: Emoji, GIF, and custom image support
- **Leaderboard System**: Track player earnings and rankings
- **Store System**: Purchase themes and customizations with in-game currency
- **Sound Effects**: Audio feedback for game actions
- **Online Player Count**: See how many players are online

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern web browser

### Installation & Development

1. **Install all dependencies:**
```bash
npm run install:all
```

2. **Start development servers:**
```bash
npm run dev
```
This will start both the client (http://localhost:5173+) and server (http://localhost:4000) simultaneously.
Note: Client port may vary (5174, 5175, etc.) if default port is occupied.

### Manual Setup

**Server (Port 4000):**
```bash
cd server
npm install
npm run dev
```

**Client (Port 5173):**
```bash
cd client
npm install
npm run dev
```

### Troubleshooting

If you encounter dependency issues with the client:
```bash
cd client
rm -rf node_modules package-lock.json
npm install --force
```

### 🔧 Quick Status Check

To see the current URLs without starting the servers:
```bash
npm run status
```

This will show you the expected URLs (client port may vary).

## 🎮 How to Play

1. **Open your browser** and go to: `http://localhost:5173` (or the port shown in your terminal)
2. **Create or join a table** from the lobby
3. **Customize your experience** with themes and avatars
4. **Play poker** using the action buttons (Fold, Check, Call, Bet, Raise)
5. **Chat with other players** using the chat panel

### 🔍 Finding the Correct URL

When you start the client, look for this line in your terminal:
```
➜  Local:   http://localhost:517X/
```

Where `517X` is the actual port (could be 5173, 5174, 5175, etc.). Use that URL in your browser.

## 📁 Project Structure

```
pokerfull/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── styles/        # CSS and theme files
│   │   └── types/         # TypeScript type definitions
│   ├── public/            # Static assets
│   └── dist/              # Build output
├── server/                # Node.js backend
│   └── src/
│       ├── bot/          # AI bot logic
│       ├── game/         # Game engine components
│       └── *.ts          # Server files
└── shared/               # Shared TypeScript types and protocols
    └── protocol.ts       # WebSocket event definitions
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Styled Components** for CSS-in-JS theming
- **Socket.io Client** for real-time communication

### Backend
- **Node.js** with Express
- **Socket.io** for WebSocket communication
- **TypeScript** for type safety

### Game Engine
- Custom poker hand evaluation algorithm
- Real-time game state management
- Intelligent bot AI with configurable strategies

## 🎮 How to Play

1. **Join or Create a Table**: Choose from available tables or create your own
2. **Customize Your Experience**: Select themes, avatars, and table settings
3. **Play Poker**: Use the action buttons to fold, check, call, bet, or raise
4. **Chat and Socialize**: Use the chat system to communicate with other players
5. **Track Your Progress**: Check the leaderboard to see your ranking

## 🔧 Development Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run build` - Build both client and server for production
- `npm run start` - Start the production server
- `npm run preview` - Preview the built client

## 🚨 Known Issues & Improvements

See the analysis below for identified areas for improvement and planned enhancements.

<!-- Force Railway redeploy - Updated: 2024-01-17 -->
