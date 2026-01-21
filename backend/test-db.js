import { pool } from './utils/pg.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

async function testConnection() {
  console.log('Testing database connection...');
  console.log('DB Config:', {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    // Don't log password in production
    password: process.env.NODE_ENV === 'production' ? '***' : process.env.DB_PASSWORD,
  });

  const client = await pool.connect();
  try {
    // Test basic query
    const res = await client.query('SELECT NOW() as current_time, version() as version');
    console.log('✅ Database connection successful!');
    console.log('Database time:', res.rows[0].current_time);
    console.log('PostgreSQL version:', res.rows[0].version.split(' ')[1]);
    
    // Test if tables exist
    const tables = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    console.log('\n📋 Database tables:', tables.rows.map(row => row.table_name).join(', ') || 'No tables found');
    
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    if (err.code === '28P01') {
      console.error('Authentication failed. Please check your database credentials.');
    } else if (err.code === '3D000') {
      console.error('Database does not exist. Did you create it?');
      console.log('Try running: createdb ' + process.env.DB_NAME);
    } else if (err.code === 'ECONNREFUSED') {
      console.error('Connection refused. Is PostgreSQL running on port', process.env.DB_PORT, '?');
    }
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

testConnection().catch(console.error);
