import sequelize from '../../src/database.js';
import User from './User.js';
import Room from './Room.js';
import Transaction from './Transaction.js';
import { getErrorMessage } from '../../src/types.js';

// Definir asociaciones entre modelos

// Un usuario puede crear múltiples salas
User.hasMany(Room, {
  foreignKey: 'hostId',
  as: 'hostedRooms'
});

Room.belongsTo(User, {
  foreignKey: 'hostId',
  as: 'host'
});

// Un usuario puede tener múltiples transacciones
User.hasMany(Transaction, {
  foreignKey: 'userId',
  as: 'transactions'
});

Transaction.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Una sala puede tener múltiples transacciones
Room.hasMany(Transaction, {
  foreignKey: 'roomId',
  as: 'transactions'
});

Transaction.belongsTo(Room, {
  foreignKey: 'roomId',
  as: 'room'
});

// Exportar todos los modelos
export {
  sequelize,
  User,
  Room,
  Transaction
};

// Función para inicializar la base de datos
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Probar conexión
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sincronizar modelos (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('🔄 Database synchronized successfully.');
    }

    console.log('🎯 Database initialized successfully.');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Función para crear índices adicionales si es necesario
export const createIndexes = async (): Promise<void> => {
  try {
    // Índices adicionales para optimización
    await sequelize.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_user_type
      ON transactions (user_id, type, created_at DESC);
    `);

    await sequelize.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rooms_status_created
      ON rooms (status, created_at DESC);
    `);

    await sequelize.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_online_lastseen
      ON users (is_online, last_seen DESC);
    `);

    console.log('📊 Additional indexes created successfully.');
  } catch (error) {
    console.warn('⚠️ Some indexes might already exist:', getErrorMessage(error));
  }
};

export default sequelize;
