const crypto = require('crypto');
const { pool } = require('../db/complaintDb');

const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

const calculateHash = (id, category, department, building, content, tokenMessage, previousHash, createdAt) => {
  const dataString = `${id}|${category}|${department}|${building}|${content}|${tokenMessage}|${previousHash}|${createdAt}`;
  return crypto.createHash('sha256').update(dataString).digest('hex');
};

const getLatestBlockHash = async (client) => {
  const dbClient = client || pool;
  const result = await dbClient.query(
    'SELECT block_hash FROM complaints ORDER BY created_at DESC, id DESC LIMIT 1'
  );
  if (result.rows.length === 0) {
    return GENESIS_HASH;
  }
  return result.rows[0].block_hash;
};

const verifyChainIntegrity = async () => {
  const result = await pool.query(
    'SELECT id, category, department, building, content, token_message, previous_hash, block_hash, created_at FROM complaints ORDER BY created_at ASC, id ASC'
  );

  let expectedPreviousHash = GENESIS_HASH;

  for (let i = 0; i < result.rows.length; i++) {
    const block = result.rows[i];
    
    // 1. Verify previous_hash matches the running hash
    if (block.previous_hash !== expectedPreviousHash) {
      return {
        valid: false,
        error: `Integrity broken at block ID: ${block.id}. Expected previous_hash: ${expectedPreviousHash}, found: ${block.previous_hash}`,
      };
    }

    // 2. Re-calculate hash and check if it matches block_hash
    const calculated = calculateHash(
      block.id,
      block.category,
      block.department,
      block.building,
      block.content,
      block.token_message,
      block.previous_hash,
      new Date(block.created_at).toISOString() // Ensure consistent date string format
    );

    if (block.block_hash !== calculated) {
      return {
        valid: false,
        error: `Integrity broken at block ID: ${block.id}. Calculated hash: ${calculated}, stored hash: ${block.block_hash}`,
      };
    }

    expectedPreviousHash = block.block_hash;
  }

  return { valid: true };
};

module.exports = {
  calculateHash,
  getLatestBlockHash,
  verifyChainIntegrity,
  GENESIS_HASH,
};
