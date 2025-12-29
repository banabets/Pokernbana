import { initializeDatabase } from '../database/models/index.js';
import { UserService } from './services/UserService.js';
import { TransactionService } from './services/TransactionService.js';

// Importar script de migración
import { runMigrations } from './migration-runner.js';
import * as dotenv from 'dotenv';

// Cargar configuración
dotenv.config({ path: '../config.env' });

export class DatabaseManager {
  private static initialized = false;

  // Inicializar la base de datos
  static async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('📊 Database already initialized');
      return;
    }

    try {
      console.log('🚀 Initializing database...');

      // Inicializar conexión y modelos
      await initializeDatabase();

      // Ejecutar migraciones de datos existentes
      console.log('🔄 Running data migrations...');
      await runMigrations();

      // Verificar usuarios después de migración
      const existingUsers = await UserService.getOnlineUsers();
      console.log(`👥 Found ${existingUsers.length} users in database after migration`);

      // Si no hay usuarios, crear algunos por defecto
      if (existingUsers.length === 0) {
        console.log('🆕 Creating default users...');

        const defaultUsers = [
          {
            username: 'Player123',
            gameBalance: 2000,
            avatar: '🙂',
            subscriptionLevel: 'free' as const,
            storeCredits: 500,
            passwordHash: undefined,
            emailVerified: false,
            twoFactorEnabled: false,
            isWalletConnected: false,
            cryptoBalance: 0,
            loginAttempts: 0,
            totalEarnings: 0,
            gamesPlayed: 0,
            gamesWon: 0,
            winRate: 0,
            isOnline: false
          },
          {
            username: 'Banana',
            gameBalance: 10000,
            avatar: '🍌',
            subscriptionLevel: 'gold' as const,
            storeCredits: 10000,
            passwordHash: undefined,
            emailVerified: false,
            twoFactorEnabled: false,
            isWalletConnected: false,
            cryptoBalance: 0,
            loginAttempts: 0,
            totalEarnings: 5000,
            gamesPlayed: 25,
            gamesWon: 15,
            winRate: 60,
            isOnline: false
          }
        ];

        for (const userData of defaultUsers) {
          try {
            await UserService.createUser(userData);
            console.log(`✅ Created user: ${userData.username}`);
          } catch (error) {
            console.log(`⚠️ Could not create user ${userData.username}:`, error instanceof Error ? error.message : String(error));
          }
        }
      }

      this.initialized = true;
      console.log('✅ Database initialization completed successfully');

    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  // Obtener estadísticas de la base de datos
  static async getStats(): Promise<{
    users: number;
    transactions: number;
    onlineUsers: number;
  }> {
    try {
      const onlineUsers = await UserService.getOnlineUsers();
      const transactionStats = await TransactionService.getTransactionStats();

      return {
        users: onlineUsers.length, // Esto debería ser un count total, no solo online
        transactions: transactionStats.totalTransactions,
        onlineUsers: onlineUsers.length
      };
    } catch (error) {
      console.error('❌ Error getting database stats:', error);
      throw error;
    }
  }

  // Limpiar usuarios offline antiguos (maintenance)
  static async cleanupOfflineUsers(): Promise<void> {
    try {
      // Esta función se puede implementar más tarde para limpiar usuarios offline
      console.log('🧹 Cleanup completed (placeholder)');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }
}

// Función de utilidad para usar en el servidor
export const initDatabase = () => DatabaseManager.initialize();
export const getDatabaseStats = () => DatabaseManager.getStats();
export const cleanupDatabase = () => DatabaseManager.cleanupOfflineUsers();
