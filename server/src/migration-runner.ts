import { UserService } from './services/UserService.js';
import { TransactionService } from './services/TransactionService.js';
import * as fs from 'fs';
import * as path from 'path';

// Función para migrar datos existentes a PostgreSQL
export async function runMigrations(): Promise<void> {
  console.log('🚀 Starting data migration to PostgreSQL...');

  try {
    // Verificar si ya se hizo la migración
    const migrationFlag = path.join(__dirname, '../../data/migration_complete.flag');

    if (fs.existsSync(migrationFlag)) {
      console.log('✅ Migration already completed, skipping...');
      return;
    }

    // Leer datos existentes de archivos JSON
    const dataDir = path.join(__dirname, '../../data');
    const usersToMigrate: Array<{
      username: string;
      balance?: number;
      avatar?: string;
      subscription?: string;
      storeCredits?: number;
    }> = [];

    // Migrar suscripciones
    const subscriptionsFile = path.join(dataDir, 'userSubscriptions.json');
    if (fs.existsSync(subscriptionsFile)) {
      console.log('📁 Migrating user subscriptions...');
      const subscriptionsData = JSON.parse(fs.readFileSync(subscriptionsFile, 'utf8'));

      Object.entries(subscriptionsData).forEach(([userId, subscription]: [string, any]) => {
        const username = `User-${userId.slice(-6)}`;
        usersToMigrate.push({
          username,
          subscription,
          balance: 2000,
          avatar: '🙂',
          storeCredits: 500
        });
      });

      console.log(`📊 Found ${Object.keys(subscriptionsData).length} user subscriptions to migrate`);
    }

    // Migrar créditos de tienda si existe
    const storeCreditsFile = path.join(dataDir, 'userStoreCredits.json');
    if (fs.existsSync(storeCreditsFile)) {
      console.log('📁 Migrating store credits...');
      const storeCreditsData = JSON.parse(fs.readFileSync(storeCreditsFile, 'utf8'));

      Object.entries(storeCreditsData).forEach(([userId, credits]: [string, any]) => {
        const username = `User-${userId.slice(-6)}`;
        const existingUser = usersToMigrate.find(u => u.username === username);

        if (existingUser) {
          existingUser.storeCredits = credits;
        } else {
          usersToMigrate.push({
            username,
            storeCredits: credits,
            balance: 2000,
            avatar: '🙂'
          });
        }
      });

      console.log(`📊 Found ${Object.keys(storeCreditsData).length} store credit entries to migrate`);
    }

    // Agregar usuarios por defecto si no hay datos
    if (usersToMigrate.length === 0) {
      console.log('🆕 No existing data found, creating default users...');
      usersToMigrate.push(
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

    // Migrar usuarios
    console.log(`👥 Migrating ${usersToMigrate.length} users to PostgreSQL...`);
    let migratedCount = 0;
    let skippedCount = 0;

    for (const userData of usersToMigrate) {
      try {
        await UserService.migrateUserData(userData);
        migratedCount++;
        console.log(`✅ Migrated user: ${userData.username}`);
      } catch (error: any) {
        // Si el usuario ya existe, intentar actualizarlo
        if (error.message?.includes('already taken')) {
          try {
            const existingUser = await UserService.findByUsername(userData.username);
            if (existingUser) {
              // Actualizar datos del usuario existente
              if (userData.balance && userData.balance !== existingUser.gameBalance) {
                await UserService.updateBalance(existingUser.id, userData.balance - existingUser.gameBalance);
              }
              if (userData.subscription && userData.subscription !== existingUser.subscriptionLevel) {
                existingUser.subscriptionLevel = userData.subscription as any;
                await existingUser.save();
              }
              if (userData.storeCredits && userData.storeCredits !== existingUser.storeCredits) {
                existingUser.storeCredits = userData.storeCredits;
                await existingUser.save();
              }
              if (userData.avatar && userData.avatar !== existingUser.avatar) {
                existingUser.avatar = userData.avatar;
                await existingUser.save();
              }
              migratedCount++;
              console.log(`🔄 Updated existing user: ${userData.username}`);
            }
          } catch (updateError) {
            console.log(`⚠️ Could not update user ${userData.username}: ${updateError instanceof Error ? updateError.message : String(updateError)}`);
            skippedCount++;
          }
        } else {
          console.log(`⚠️ Skipped user ${userData.username}: ${error instanceof Error ? error.message : String(error)}`);
          skippedCount++;
        }
      }
    }

    // Crear archivo de flag para marcar migración como completada
    fs.writeFileSync(migrationFlag, new Date().toISOString());
    console.log('📝 Migration completion flag created');

    console.log('\n🎉 Migration completed!');
    console.log(`📈 Successfully migrated: ${migratedCount} users`);
    console.log(`⏭️ Skipped: ${skippedCount} users`);
    console.log(`📊 Total processed: ${migratedCount + skippedCount} users`);

    // Estadísticas finales
    const onlineUsers = await UserService.getOnlineUsers();
    console.log(`👥 Total users in database: ${onlineUsers.length}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Ejecutar migración si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => {
      console.log('✅ Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}
