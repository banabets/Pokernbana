import { Transaction, User } from '../../database/models/index.js';
import { TransactionAttributes, TransactionType, TransactionStatus } from '../../database/models/Transaction.js';
import { v4 as uuidv4 } from 'uuid';

export class TransactionService {
  // Crear una nueva transacción
  static async createTransaction(transactionData: Omit<TransactionAttributes, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    try {
      const transaction = await Transaction.create(transactionData);

      console.log(`💳 Transaction created: ${transaction.type} - ${transaction.amount} for user ${transaction.userId}`);
      return transaction;
    } catch (error) {
      console.error('❌ Error creating transaction:', error);
      throw error;
    }
  }

  // Obtener transacciones de un usuario
  static async getUserTransactions(
    userId: string,
    limit: number = 50,
    offset: number = 0,
    type?: TransactionType
  ): Promise<Transaction[]> {
    try {
      const whereClause: any = { userId };
      if (type) {
        whereClause.type = type;
      }

      return await Transaction.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        include: [{
          model: User,
          as: 'user',
          attributes: ['username', 'avatar']
        }]
      });
    } catch (error) {
      console.error('❌ Error getting user transactions:', error);
      throw error;
    }
  }

  // Obtener transacciones por tipo
  static async getTransactionsByType(type: TransactionType, limit: number = 100): Promise<Transaction[]> {
    try {
      return await Transaction.findAll({
        where: { type },
        order: [['createdAt', 'DESC']],
        limit,
        include: [{
          model: User,
          as: 'user',
          attributes: ['username', 'avatar']
        }]
      });
    } catch (error) {
      console.error('❌ Error getting transactions by type:', error);
      throw error;
    }
  }

  // Confirmar una transacción
  static async confirmTransaction(transactionId: string): Promise<Transaction | null> {
    try {
      const transaction = await Transaction.findByPk(transactionId);
      if (!transaction) return null;

      await transaction.confirm();
      console.log(`✅ Transaction confirmed: ${transactionId}`);
      return transaction;
    } catch (error) {
      console.error('❌ Error confirming transaction:', error);
      throw error;
    }
  }

  // Marcar transacción como fallida
  static async failTransaction(transactionId: string, reason?: string): Promise<Transaction | null> {
    try {
      const transaction = await Transaction.findByPk(transactionId);
      if (!transaction) return null;

      await transaction.fail();

      if (reason) {
        transaction.metadata = { ...transaction.metadata, failureReason: reason };
        await transaction.save();
      }

      console.log(`❌ Transaction failed: ${transactionId}`);
      return transaction;
    } catch (error) {
      console.error('❌ Error failing transaction:', error);
      throw error;
    }
  }

  // Procesar transacción (marcar como procesada)
  static async processTransaction(transactionId: string): Promise<Transaction | null> {
    try {
      const transaction = await Transaction.findByPk(transactionId);
      if (!transaction) return null;

      await transaction.process();
      console.log(`⚙️ Transaction processed: ${transactionId}`);
      return transaction;
    } catch (error) {
      console.error('❌ Error processing transaction:', error);
      throw error;
    }
  }

  // Obtener estadísticas de transacciones
  static async getTransactionStats(userId?: string): Promise<{
    totalTransactions: number;
    totalVolume: number;
    cryptoVolume: number;
    gameVolume: number;
    storeVolume: number;
  }> {
    try {
      const whereClause = userId ? { userId } : {};

      const transactions = await Transaction.findAll({
        where: whereClause,
        attributes: ['type', 'amount', 'cryptoAmount']
      });

      const stats = {
        totalTransactions: transactions.length,
        totalVolume: 0,
        cryptoVolume: 0,
        gameVolume: 0,
        storeVolume: 0
      };

      transactions.forEach(tx => {
        stats.totalVolume += Math.abs(tx.amount);

        if (tx.isCryptoTransaction()) {
          stats.cryptoVolume += Math.abs(tx.cryptoAmount || tx.amount);
        } else if (tx.isGameTransaction()) {
          stats.gameVolume += Math.abs(tx.amount);
        } else if (tx.isStoreTransaction()) {
          stats.storeVolume += Math.abs(tx.amount);
        }
      });

      return stats;
    } catch (error) {
      console.error('❌ Error getting transaction stats:', error);
      throw error;
    }
  }

  // Métodos específicos para el juego de poker

  // Registrar compra de fichas (buy-in)
  static async recordBuyIn(
    userId: string,
    amount: number,
    roomId?: string
  ): Promise<Transaction> {
    return await this.createTransaction({
      userId,
      type: 'game_buyin',
      status: 'confirmed',
      amount,
      roomId,
      description: `Buy-in for $${amount} in ${roomId ? 'room ' + roomId : 'game'}`
    });
  }

  // Registrar ganancia en una mano
  static async recordWin(
    userId: string,
    amount: number,
    roomId: string,
    handNumber: number
  ): Promise<Transaction> {
    return await this.createTransaction({
      userId,
      type: 'game_win',
      status: 'confirmed',
      amount,
      roomId,
      handNumber,
      description: `Won $${amount} in hand #${handNumber}`
    });
  }

  // Registrar pérdida en una mano
  static async recordLoss(
    userId: string,
    amount: number,
    roomId: string,
    handNumber: number
  ): Promise<Transaction> {
    return await this.createTransaction({
      userId,
      type: 'game_loss',
      status: 'confirmed',
      amount: -amount, // Negativo para pérdidas
      roomId,
      handNumber,
      description: `Lost $${amount} in hand #${handNumber}`
    });
  }

  // Registrar compra en la tienda
  static async recordStorePurchase(
    userId: string,
    itemName: string,
    cost: number
  ): Promise<Transaction> {
    return await this.createTransaction({
      userId,
      type: 'store_purchase',
      status: 'confirmed',
      amount: -cost, // Negativo porque es un gasto
      description: `Purchased ${itemName} for $${cost}`,
      metadata: { itemName }
    });
  }

  // Métodos preparados para criptomonedas (futuro)

  // Registrar depósito de criptomonedas
  static async recordCryptoDeposit(
    userId: string,
    tokenSymbol: string,
    blockchain: string,
    amount: number,
    usdValue: number,
    transactionHash: string,
    walletAddress: string
  ): Promise<Transaction> {
    return await this.createTransaction({
      userId,
      type: 'crypto_deposit',
      status: 'pending', // Los depósitos de crypto necesitan confirmación
      amount: usdValue,
      cryptoAmount: amount,
      usdValue,
      tokenSymbol,
      blockchain,
      transactionHash,
      walletAddress,
      description: `Deposited ${amount} ${tokenSymbol} ($${usdValue})`
    });
  }

  // Registrar retiro de criptomonedas
  static async recordCryptoWithdrawal(
    userId: string,
    tokenSymbol: string,
    blockchain: string,
    amount: number,
    usdValue: number,
    walletAddress: string
  ): Promise<Transaction> {
    return await this.createTransaction({
      userId,
      type: 'crypto_withdrawal',
      status: 'pending',
      amount: -usdValue,
      cryptoAmount: -amount,
      usdValue,
      tokenSymbol,
      blockchain,
      walletAddress,
      description: `Withdrew ${amount} ${tokenSymbol} ($${usdValue})`
    });
  }

  // Buscar transacción por hash de blockchain
  static async findByTransactionHash(transactionHash: string): Promise<Transaction | null> {
    try {
      return await Transaction.findOne({ where: { transactionHash } });
    } catch (error) {
      console.error('❌ Error finding transaction by hash:', error);
      throw error;
    }
  }

  // Obtener balance total de un usuario (incluyendo cripto)
  static async getUserBalanceSummary(userId: string): Promise<{
    gameBalance: number;
    cryptoBalance: number;
    totalValue: number;
    pendingTransactions: number;
  }> {
    try {
      const user = await User.findByPk(userId);
      if (!user) throw new Error('User not found');

      // Obtener transacciones pendientes
      const pendingTransactions = await Transaction.count({
        where: {
          userId,
          status: 'pending'
        }
      });

      return {
        gameBalance: user.gameBalance,
        cryptoBalance: user.cryptoBalance,
        totalValue: user.gameBalance + user.cryptoBalance,
        pendingTransactions
      };
    } catch (error) {
      console.error('❌ Error getting user balance summary:', error);
      throw error;
    }
  }
}
