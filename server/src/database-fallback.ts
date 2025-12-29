import { UserService } from './services/UserService.js';
import { TransactionService } from './services/TransactionService.js';

// Fallback para desarrollo sin PostgreSQL
// Este archivo permite que el servidor funcione sin base de datos conectada

export class DatabaseFallback {
  private static initialized = false;
  private static users = new Map<string, any>();
  private static transactions: any[] = [];

  static async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('📊 Database fallback already initialized');
      return;
    }

    try {
      console.log('🔄 Initializing database fallback mode...');

      // Crear usuarios por defecto en memoria
      const defaultUsers = [
        {
          id: 'fallback-user-1',
          username: 'Player123',
          gameBalance: 2000,
          avatar: '🙂',
          subscriptionLevel: 'free' as const,
          storeCredits: 500,
          isOnline: false,
          totalEarnings: 0,
          gamesPlayed: 0,
          gamesWon: 0,
          winRate: 0
        },
        {
          id: 'fallback-user-2',
          username: 'Banana',
          gameBalance: 10000,
          avatar: '🍌',
          subscriptionLevel: 'gold' as const,
          storeCredits: 10000,
          isOnline: false,
          totalEarnings: 0,
          gamesPlayed: 0,
          gamesWon: 0,
          winRate: 0
        }
      ];

      for (const user of defaultUsers) {
        this.users.set(user.id, user);
        this.users.set(user.username, user); // Para búsqueda por username
      }

      this.initialized = true;
      console.log('✅ Database fallback initialized successfully');
      console.log(`👥 Created ${defaultUsers.length} default users in memory`);

    } catch (error) {
      console.error('❌ Database fallback initialization failed:', error);
      throw error;
    }
  }

  static async getUserById(id: string) {
    return this.users.get(id) || null;
  }

  static async getUserByUsername(username: string) {
    return this.users.get(username) || null;
  }

  static async updateUserBalance(userId: string, amount: number) {
    const user = this.users.get(userId);
    if (!user) return null;

    user.gameBalance += amount;
    if (amount > 0) {
      user.totalEarnings += amount;
    }

    console.log(`💰 Fallback: Updated balance for ${user.username}: ${amount > 0 ? '+' : ''}${amount}`);
    return user;
  }

  static async updateUserStats(userId: string, gameWon: boolean) {
    const user = this.users.get(userId);
    if (!user) return null;

    user.gamesPlayed += 1;
    if (gameWon) {
      user.gamesWon += 1;
    }
    user.winRate = (user.gamesWon / user.gamesPlayed) * 100;

    return user;
  }

  static async getOnlineUsers() {
    return Array.from(this.users.values()).filter(u => u.isOnline);
  }

  static async getLeaderboard(limit = 50) {
    return Array.from(this.users.values())
      .filter(u => u.totalEarnings > 0)
      .sort((a, b) => b.totalEarnings - a.totalEarnings)
      .slice(0, limit);
  }

  static getStats() {
    return {
      users: this.users.size,
      transactions: this.transactions.length,
      onlineUsers: Array.from(this.users.values()).filter(u => u.isOnline).length
    };
  }
}

// Funciones de compatibilidad
export const initDatabase = () => DatabaseFallback.initialize();
export const getDatabaseStats = () => DatabaseFallback.getStats();

// Re-exportar servicios con fallback
export { UserService } from './services/UserService.js';
export { TransactionService } from './services/TransactionService.js';
