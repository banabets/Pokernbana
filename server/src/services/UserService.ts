import { User, Transaction } from '../../database/models/index.js';
import { UserAttributes, UserCreationAttributes } from '../../database/models/User.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export class UserService {
  // Crear un nuevo usuario
  static async createUser(userData: Omit<UserCreationAttributes, 'id'>): Promise<User> {
    try {
      // Generar hash de contraseña si se proporciona
      if (userData.passwordHash) {
        const saltRounds = 12;
        userData.passwordHash = await bcrypt.hash(userData.passwordHash, saltRounds);
      }

      const user = await User.create(userData);

      console.log(`👤 User created: ${user.username} (${user.id})`);
      return user;
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw error;
    }
  }

  // Buscar usuario por ID
  static async findById(id: string): Promise<User | null> {
    try {
      return await User.findByPk(id);
    } catch (error) {
      console.error('❌ Error finding user by ID:', error);
      throw error;
    }
  }

  // Buscar usuario por username
  static async findByUsername(username: string): Promise<User | null> {
    try {
      return await User.findOne({ where: { username } });
    } catch (error) {
      console.error('❌ Error finding user by username:', error);
      throw error;
    }
  }

  // Buscar usuario por email
  static async findByEmail(email: string): Promise<User | null> {
    try {
      return await User.findOne({ where: { email } });
    } catch (error) {
      console.error('❌ Error finding user by email:', error);
      throw error;
    }
  }

  // Actualizar balance del usuario
  static async updateBalance(userId: string, amount: number): Promise<User | null> {
    try {
      const user = await User.findByPk(userId);
      if (!user) return null;

      await user.updateBalance(amount);

      // Crear transacción para el registro
      const transactionType = amount > 0 ? 'game_win' : 'game_loss';
      await Transaction.create({
        userId,
        type: transactionType as any,
        status: 'confirmed' as any,
        amount: Math.abs(amount),
        description: `${amount > 0 ? 'Won' : 'Lost'} $${Math.abs(amount)} in game`
      });

      console.log(`💰 Balance updated for user ${userId}: ${amount > 0 ? '+' : ''}${amount}`);
      return user;
    } catch (error) {
      console.error('❌ Error updating balance:', error);
      throw error;
    }
  }

  // Actualizar estadísticas del usuario
  static async updateStats(userId: string, gameWon: boolean): Promise<User | null> {
    try {
      const user = await User.findByPk(userId);
      if (!user) return null;

      await user.updateStats(gameWon);

      console.log(`📊 Stats updated for user ${userId}: ${gameWon ? 'Won' : 'Lost'} game`);
      return user;
    } catch (error) {
      console.error('❌ Error updating stats:', error);
      throw error;
    }
  }

  // Actualizar avatar
  static async updateAvatar(userId: string, avatar: string): Promise<User | null> {
    try {
      const user = await User.findByPk(userId);
      if (!user) return null;

      user.avatar = avatar;
      await user.save();

      console.log(`🎭 Avatar updated for user ${userId}`);
      return user;
    } catch (error) {
      console.error('❌ Error updating avatar:', error);
      throw error;
    }
  }

  // Actualizar username
  static async updateUsername(userId: string, newUsername: string): Promise<User | null> {
    try {
      // Verificar si el username ya existe
      const existingUser = await User.findOne({ where: { username: newUsername } });
      if (existingUser && existingUser.id !== userId) {
        throw new Error('Username already taken');
      }

      const user = await User.findByPk(userId);
      if (!user) return null;

      user.username = newUsername;
      await user.save();

      console.log(`👤 Username updated for user ${userId}: ${newUsername}`);
      return user;
    } catch (error) {
      console.error('❌ Error updating username:', error);
      throw error;
    }
  }

  // Actualizar estado online
  static async setOnlineStatus(userId: string, online: boolean): Promise<User | null> {
    try {
      const user = await User.findByPk(userId);
      if (!user) return null;

      await user.setOnlineStatus(online);

      console.log(`🔗 User ${userId} is now ${online ? 'online' : 'offline'}`);
      return user;
    } catch (error) {
      console.error('❌ Error updating online status:', error);
      throw error;
    }
  }

  // Obtener usuarios online
  static async getOnlineUsers(): Promise<User[]> {
    try {
      return await User.findAll({
        where: { isOnline: true },
        order: [['lastSeen', 'DESC']]
      });
    } catch (error) {
      console.error('❌ Error getting online users:', error);
      throw error;
    }
  }

  // Obtener leaderboard
  static async getLeaderboard(limit: number = 50): Promise<User[]> {
    try {
      return await User.findAll({
        where: {
          totalEarnings: { [require('sequelize').Op.gt]: 0 }
        },
        order: [['totalEarnings', 'DESC']],
        limit
      });
    } catch (error) {
      console.error('❌ Error getting leaderboard:', error);
      throw error;
    }
  }

  // Verificar contraseña
  static async verifyPassword(userId: string, password: string): Promise<boolean> {
    try {
      const user = await User.findByPk(userId);
      if (!user || !user.passwordHash) return false;

      return await bcrypt.compare(password, user.passwordHash);
    } catch (error) {
      console.error('❌ Error verifying password:', error);
      throw error;
    }
  }

  // Cambiar contraseña
  static async changePassword(userId: string, newPassword: string): Promise<boolean> {
    try {
      const user = await User.findByPk(userId);
      if (!user) return false;

      const saltRounds = 12;
      user.passwordHash = await bcrypt.hash(newPassword, saltRounds);
      await user.save();

      console.log(`🔒 Password changed for user ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Error changing password:', error);
      throw error;
    }
  }

  // Migrar datos de usuario existentes (desde localStorage/simulaciones)
  static async migrateUserData(userData: {
    username: string;
    balance?: number;
    avatar?: string;
    subscription?: string;
    storeCredits?: number;
  }): Promise<User> {
    try {
      // Verificar si el usuario ya existe
      let user = await this.findByUsername(userData.username);

      if (user) {
        // Actualizar datos existentes
        user.gameBalance = userData.balance || user.gameBalance;
        user.avatar = userData.avatar || user.avatar;
        user.subscriptionLevel = (userData.subscription as any) || user.subscriptionLevel;
        user.storeCredits = userData.storeCredits || user.storeCredits;
        await user.save();

        console.log(`📦 User data migrated: ${user.username} (existing)`);
        return user;
      } else {
        // Crear nuevo usuario
        return await this.createUser({
          username: userData.username || `user_${Date.now()}`,
          gameBalance: userData.balance || 2000,
          avatar: userData.avatar || '🙂',
          subscriptionLevel: (userData.subscription as any) || 'free',
          storeCredits: userData.storeCredits || 500,
          passwordHash: undefined, // Sin contraseña inicialmente
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
        });
      }
    } catch (error) {
      console.error('❌ Error migrating user data:', error);
      throw error;
    }
  }
}
