import { DataTypes, Model } from 'sequelize';
import sequelize from '../../src/database.js';

export interface UserAttributes {
  id: string;
  username: string;
  email?: string;
  passwordHash?: string;
  subscriptionLevel: 'free' | 'bronze' | 'silver' | 'gold' | 'diamond';
  avatar?: string;
  avatarBorder?: string;
  avatarDecorations?: string[];
  gameBalance: number;
  storeCredits: number;
  totalEarnings: number;
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  bestHand?: string;
  isOnline: boolean;
  lastSeen?: Date;
  createdAt?: Date;
  updatedAt?: Date;

  // Campos preparados para criptomonedas (futuro)
  walletAddress?: string;
  blockchainType?: 'ethereum' | 'solana' | 'polygon' | 'bitcoin';
  isWalletConnected: boolean;
  cryptoBalance: number; // En USD para simplificar

  // Campos de seguridad
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: Date;
  loginAttempts: number;
  lockedUntil?: Date;
}

export interface UserCreationAttributes extends Omit<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public username!: string;
  public email?: string;
  public passwordHash?: string;
  public subscriptionLevel!: 'free' | 'bronze' | 'silver' | 'gold' | 'diamond';
  public avatar?: string;
  public avatarBorder?: string;
  public avatarDecorations?: string[];
  public gameBalance!: number;
  public storeCredits!: number;
  public totalEarnings!: number;
  public gamesPlayed!: number;
  public gamesWon!: number;
  public winRate!: number;
  public bestHand?: string;
  public isOnline!: boolean;
  public lastSeen?: Date;
  public createdAt?: Date;
  public updatedAt?: Date;

  // Campos preparados para criptomonedas
  public walletAddress?: string;
  public blockchainType?: 'ethereum' | 'solana' | 'polygon' | 'bitcoin';
  public isWalletConnected!: boolean;
  public cryptoBalance!: number;

  // Campos de seguridad
  public emailVerified!: boolean;
  public twoFactorEnabled!: boolean;
  public lastLoginAt?: Date;
  public loginAttempts!: number;
  public lockedUntil?: Date;

  // Métodos de instancia
  public async updateBalance(amount: number): Promise<void> {
    this.gameBalance += amount;
    if (amount > 0) {
      this.totalEarnings += amount;
    }
    await this.save();
  }

  public async updateStats(gameWon: boolean): Promise<void> {
    this.gamesPlayed += 1;
    if (gameWon) {
      this.gamesWon += 1;
    }
    this.winRate = (this.gamesWon / this.gamesPlayed) * 100;
    await this.save();
  }

  public async setOnlineStatus(online: boolean): Promise<void> {
    this.isOnline = online;
    if (!online) {
      this.lastSeen = new Date();
    }
    await this.save();
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
        is: /^[a-zA-Z0-9_-]+$/ // Solo letras, números, guiones y underscores
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    subscriptionLevel: {
      type: DataTypes.ENUM('free', 'bronze', 'silver', 'gold', 'diamond'),
      allowNull: false,
      defaultValue: 'free'
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '🙂'
    },
    avatarBorder: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: 'none'
    },
    avatarDecorations: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    gameBalance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 2000
    },
    storeCredits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 500
    },
    totalEarnings: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    gamesPlayed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    gamesWon: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    winRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0
    },
    bestHand: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    isOnline: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    lastSeen: {
      type: DataTypes.DATE,
      allowNull: true
    },

    // Campos preparados para criptomonedas
    walletAddress: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    blockchainType: {
      type: DataTypes.ENUM('ethereum', 'solana', 'polygon', 'bitcoin'),
      allowNull: true
    },
    isWalletConnected: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    cryptoBalance: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
      defaultValue: 0
    },

    // Campos de seguridad
    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    twoFactorEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    loginAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    lockedUntil: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    indexes: [
      { unique: true, fields: ['username'] },
      { unique: true, fields: ['email'] },
      { fields: ['subscription_level'] },
      { fields: ['is_online'] },
      { fields: ['total_earnings'] },
      { fields: ['wallet_address'] }
    ]
  }
);

export default User;
