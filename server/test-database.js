// Script de prueba para la base de datos
// Ejecutar con: node test-database.js

const { Client } = require('pg');
require('dotenv').config({ path: './config.env' });

async function testDatabaseConnection() {
  console.log('🧪 Testing database connection...');
  console.log('📊 Configuration:');
  console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`   Port: ${process.env.DB_PORT || '5432'}`);
  console.log(`   Database: ${process.env.DB_NAME || 'poker_game'}`);
  console.log(`   User: ${process.env.DB_USER || 'poker_user'}`);

  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'poker_game',
    user: process.env.DB_USER || 'poker_user',
    password: process.env.DB_PASSWORD || 'poker_password',
  });

  try {
    console.log('\n🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!');

    // Probar una consulta simple
    console.log('\n📋 Testing basic query...');
    const result = await client.query('SELECT version()');
    console.log('📊 PostgreSQL version:', result.rows[0].version);

    // Verificar si las tablas existen
    console.log('\n📋 Checking tables...');
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    if (tables.rows.length > 0) {
      console.log('📊 Existing tables:');
      tables.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('⚠️ No tables found. You may need to run migrations.');
    }

    console.log('\n✅ Database test completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Make sure PostgreSQL is running');
    console.log('   2. Create the database if it doesn\'t exist:');
    console.log('      createdb poker_game');
    console.log('   3. Run the server to create tables automatically');
    console.log('   4. Or run migrations manually');

  } catch (error) {
    console.error('\n❌ Database connection failed:');
    console.error('Error:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Troubleshooting:');
      console.log('   1. Make sure PostgreSQL is installed and running');
      console.log('   2. Check if the database exists: createdb poker_game');
      console.log('   3. Verify connection settings in config.env');
    }

    if (error.code === '42P01') {
      console.log('\n🔧 Tables don\'t exist yet. This is normal on first run.');
    }

  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed.');
  }
}

// Ejecutar la prueba
testDatabaseConnection().catch(console.error);
