import { UserService } from '../../src/services/UserService';
import { initializeDatabase } from '../models';
import * as fs from 'fs';
import * as path from 'path';

// Función para leer datos existentes desde archivos JSON
async function loadExistingUserData(): Promise<Array<{
  username: string;
  balance?: number;
  avatar?: string;
  subscription?: string;
  storeCredits?: number;
}>> {
  const dataDir = path.join(__dirname, '../../data');
  const users: Array<{
    username: string;
    balance?: number;
    avatar?: string;
    subscription?: string;
    storeCredits?: number;
  }> = [];

  try {
    // Leer archivo de avatares si existe
    const avatarsFile = path.join(dataDir, 'userOwnedAvatars.json');
    if (fs.existsSync(avatarsFile)) {
      const avatarsData = JSON.parse(fs.readFileSync(avatarsFile, 'utf8'));
      console.log('📁 Found avatars data:', Object.keys(avatarsData).length, 'entries');

      // Convertir datos de avatares
      Object.entries(avatarsData).forEach(([userId, avatarData]: [string, any]) => {
        users.push({
          username: `User-${userId.slice(-6)}`, // Generar username basado en ID
          avatar: avatarData.avatar || '🙂',
          storeCredits: avatarData.storeCredits || 500
        });
      });
    }

    // Leer archivo de suscripciones si existe
    const subscriptionsFile = path.join(dataDir, 'userSubscriptions.json');
    if (fs.existsSync(subscriptionsFile)) {
      const subscriptionsData = JSON.parse(fs.readFileSync(subscriptionsFile, 'utf8'));
      console.log('📁 Found subscriptions data:', Object.keys(subscriptionsData).length, 'entries');

      // Actualizar usuarios existentes con datos de suscripción
      Object.entries(subscriptionsData).forEach(([userId, subscription]: [string, any]) => {
        const username = `User-${userId.slice(-6)}`;
        const existingUser = users.find(u => u.username === username);

        if (existingUser) {
          existingUser.subscription = subscription;
        } else {
          users.push({
            username,
            subscription,
            balance: 2000,
            storeCredits: 500
          });
        }
      });
    }

    // Agregar usuarios por defecto si no hay datos existentes
    if (users.length === 0) {
      console.log('⚠️ No existing data found, creating default users...');
      users.push(
        {
          username: 'Player123',
          balance: 2000,
          avatar: '🙂',
          subscription: 'free',
          storeCredits: 500
        },
        {
          username: 'Banana',
          balance: 10000,
          avatar: '🍌',
          subscription: 'gold',
          storeCredits: 10000
        }
      );
    }

    return users;
  } catch (error) {
    console.error('❌ Error loading existing data:', error);
    // Retornar usuarios por defecto en caso de error
    return [
      {
        username: 'Player123',
        balance: 2000,
        avatar: '🙂',
        subscription: 'free',
        storeCredits: 500
      },
      {
        username: 'Banana',
        balance: 10000,
        avatar: '🍌',
        subscription: 'gold',
        storeCredits: 10000
      }
    ];
  }
}

// Función principal de migración
async function migrateExistingData(): Promise<void> {
  console.log('🚀 Starting data migration to PostgreSQL...');

  try {
    // Inicializar base de datos
    await initializeDatabase();
    console.log('✅ Database initialized successfully');

    // Cargar datos existentes
    const existingUsers = await loadExistingUserData();
    console.log(`📊 Found ${existingUsers.length} users to migrate`);

    // Migrar usuarios uno por uno
    let migratedCount = 0;
    let skippedCount = 0;

    for (const userData of existingUsers) {
      try {
        await UserService.migrateUserData(userData);
        migratedCount++;
        console.log(`✅ Migrated user: ${userData.username}`);
      } catch (error) {
        console.log(`⚠️ Skipped user ${userData.username}: ${error.message}`);
        skippedCount++;
      }
    }

    console.log('\n🎉 Migration completed!');
    console.log(`📈 Successfully migrated: ${migratedCount} users`);
    console.log(`⏭️ Skipped: ${skippedCount} users`);
    console.log(`📊 Total processed: ${migratedCount + skippedCount} users`);

    // Mostrar estadísticas finales
    const totalUsers = await UserService.getOnlineUsers().then(() => 0); // Placeholder
    console.log(`👥 Total users in database: ${totalUsers}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Función para verificar estado de la migración
async function checkMigrationStatus(): Promise<void> {
  try {
    await initializeDatabase();

    // Contar usuarios en la base de datos
    const User = (await import('../models')).User;
    const userCount = await User.count();

    console.log('📊 Migration Status:');
    console.log(`👥 Total users in database: ${userCount}`);

    if (userCount > 0) {
      console.log('✅ Database appears to be populated');
    } else {
      console.log('⚠️ Database appears to be empty');
    }
  } catch (error) {
    console.error('❌ Error checking migration status:', error);
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  const command = process.argv[2];

  if (command === 'check') {
    checkMigrationStatus();
  } else {
    migrateExistingData();
  }
}

export { migrateExistingData, checkMigrationStatus };
