const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'complaintpassword',
  database: process.env.DB_NAME || 'echora_complaint',
});

const initDb = async () => {
  const client = await pool.connect();

  try {
    // Admins table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Complaints table
    await client.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id UUID PRIMARY KEY,
        category VARCHAR(100) NOT NULL,
        department VARCHAR(100) NOT NULL,
        building VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        evidence_url VARCHAR(500),
        token_message VARCHAR(512) UNIQUE NOT NULL,
        token_signature VARCHAR(512) NOT NULL,
        mailbox_id VARCHAR(64) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING',
        previous_hash VARCHAR(64) NOT NULL,
        block_hash VARCHAR(64) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Unique index on mailbox_id
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_mailbox_id
      ON complaints(mailbox_id);
    `);

    // Replies table
    await client.query(`
      CREATE TABLE IF NOT EXISTS replies (
        id SERIAL PRIMARY KEY,
        mailbox_id VARCHAR(64) NOT NULL,
        sender VARCHAR(10) NOT NULL
          CHECK (sender IN ('ADMIN', 'USER')),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Admin outcome log table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_outcomes (
        id SERIAL PRIMARY KEY,
        complaint_id UUID NOT NULL,
        outcome VARCHAR(255) NOT NULL,
        notes TEXT,
        status VARCHAR(20) DEFAULT 'PENDING',
        admin_username VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Used tokens to prevent double spending
    await client.query(`
      CREATE TABLE IF NOT EXISTS used_tokens (
        token_hash VARCHAR(64) PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed default admin if none exists
    const adminCheck = await client.query(
      'SELECT * FROM admins LIMIT 1'
    );

    if (adminCheck.rows.length === 0) {
      const defaultUsername = 'admin';
      const defaultPassword = 'admin123';

      const hash = await bcrypt.hash(defaultPassword, 10);

      await client.query(
        `INSERT INTO admins (username, password_hash)
         VALUES ($1, $2)`,
        [defaultUsername, hash]
      );

      console.log(
        `Default admin user seeded: username='${defaultUsername}', password='${defaultPassword}'`
      );
    }

    console.log(
      'Complaint database initialized successfully (PostgreSQL)'
    );

  } catch (error) {
    console.error(
      'Error initializing Complaint database:',
      error
    );
    throw error;

  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  initDb,
};