const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'echora_identity',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'identitypassword',
});

const initDb = async () => {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        session_token VARCHAR(64),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS issued_tokens (
        id SERIAL PRIMARY KEY,
        token_hash VARCHAR(64) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Identity database initialized successfully (PostgreSQL)');
  } catch (error) {
    console.error('Error initializing Identity database:', error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  initDb,
};