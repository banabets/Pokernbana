import { DataTypes, Model } from 'sequelize';
import sequelize from '../../src/database.js';

export type TransactionType =
  | 'game_buyin'      // Compra de fichas para entrar a una mesa
  | 'game_win'        // Ganancia en una mano
  | 'game_loss'       // Pérdida en una mano
  | 'store_purchase'  // Compra en la tienda
  | 'store_refund'    // Reembolso de la tienda
  | 'crypto_deposit'  // Depósito de criptomonedas
  | 'crypto_withdrawal' // Retiro de criptomonedas
  | 'crypto_swap'     // Intercambio entre criptomonedas
  | 'bonus'           // Bono o regalo
  | 'referral'        // Ganancia por referidos
  | 'subscription'    // Pago de suscripción
  | 'tip';            // Propina al dealer

export type TransactionStatus =
  | 'pending'         // Pendiente de confirmación
  | 'confirmed'       // Confirmada
  | 'failed'          // Fallida
  | 'cancelled';      // Cancelada

export interface TransactionAttributes {
  id: string;
  userId: string;
  type: TransactionType;
  status: TransactionStatus;

  // Montos
  amount: number;           // Monto en la moneda del juego (fichas)
  cryptoAmount?: number;    // Monto en criptomoneda (si aplica)
  usdValue?: number;        // Valor equivalente en USD

  // Información de criptomonedas (futuro)
  tokenSymbol?: string;     // BTC, ETH, SOL, etc.
  blockchain?: string;      // ethereum, solana, polygon, etc.
  transactionHash?: string; // Hash de la transacción blockchain
  walletAddress?: string;   // Dirección de wallet

  // Contexto del juego
  roomId?: string;
  handNumber?: number;
  gameSessionId?: string;

  // Metadata
  description?: string;
  metadata?: Record<string, any>; // JSON para datos adicionales

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
  confirmedAt?: Date;
  processedAt?: Date;
}

export interface TransactionCreationAttributes extends Omit<TransactionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Transaction extends Model<TransactionAttributes, TransactionCreationAttributes> implements TransactionAttributes {
  public id!: string;
  public userId!: string;
  public type!: TransactionType;
  public status!: TransactionStatus;

  // Montos
  public amount!: number;
  public cryptoAmount?: number;
  public usdValue?: number;

  // Información de criptomonedas
  public tokenSymbol?: string;
  public blockchain?: string;
  public transactionHash?: string;
  public walletAddress?: string;

  // Contexto del juego
  public roomId?: string;
  public handNumber?: number;
  public gameSessionId?: string;

  // Metadata
  public description?: string;
  public metadata?: Record<string, any>;

  // Timestamps
  public createdAt?: Date;
  public updatedAt?: Date;
  public confirmedAt?: Date;
  public processedAt?: Date;

  // Métodos de instancia
  public async confirm(): Promise<void> {
    this.status = 'confirmed';
    this.confirmedAt = new Date();
    await this.save();
  }

  public async fail(): Promise<void> {
    this.status = 'failed';
    await this.save();
  }

  public async process(): Promise<void> {
    this.processedAt = new Date();
    await this.save();
  }

  public isCryptoTransaction(): boolean {
    return this.type.startsWith('crypto_');
  }

  public isGameTransaction(): boolean {
    return this.type.startsWith('game_');
  }

  public isStoreTransaction(): boolean {
    return this.type.startsWith('store_');
  }
}

Transaction.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM(
        'game_buyin', 'game_win', 'game_loss', 'store_purchase', 'store_refund',
        'crypto_deposit', 'crypto_withdrawal', 'crypto_swap', 'bonus',
        'referral', 'subscription', 'tip'
      ),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'failed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    },

    // Montos
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: -999999.99,
        max: 999999.99
      }
    },
    cryptoAmount: {
      type: DataTypes.DECIMAL(36, 18), // Para tokens con alta precisión
      allowNull: true
    },
    usdValue: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },

    // Información de criptomonedas
    tokenSymbol: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    blockchain: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    transactionHash: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true
    },
    walletAddress: {
      type: DataTypes.STRING(100),
      allowNull: true
    },

    // Contexto del juego
    roomId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'rooms',
        key: 'id'
      }
    },
    handNumber: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    gameSessionId: {
      type: DataTypes.UUID,
      allowNull: true
    },

    // Metadata
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    },

    // Timestamps
    confirmedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'Transaction',
    tableName: 'transactions',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['type'] },
      { fields: ['status'] },
      { fields: ['created_at'] },
      { fields: ['transaction_hash'] },
      { fields: ['room_id'] },
      { fields: ['token_symbol'] },
      { fields: ['blockchain'] }
    ]
  }
);

export default Transaction;
