const { calculateHash, GENESIS_HASH } = require('../../src/services/hashChain.service');

describe('HashChain Service Unit Tests', () => {
  it('should have a 64-zero string GENESIS_HASH', () => {
    expect(GENESIS_HASH).toEqual('0'.repeat(64));
  });

  it('should generate a deterministic SHA-256 block hash for given inputs', () => {
    const id = 1;
    const category = 'Academic';
    const department = 'Computer Science';
    const building = 'Engineering Hall';
    const content = 'Test complaint details';
    const tokenMessage = 'token-msg-123';
    const previousHash = GENESIS_HASH;
    const createdAt = '2026-09-30T10:00:00.000Z';

    const hash1 = calculateHash(id, category, department, building, content, tokenMessage, previousHash, createdAt);
    const hash2 = calculateHash(id, category, department, building, content, tokenMessage, previousHash, createdAt);

    expect(typeof hash1).toBe('string');
    expect(hash1.length).toEqual(64); // SHA256 hex string length
    expect(hash1).toEqual(hash2);
  });

  it('should generate different hashes when input parameters change', () => {
    const baseParams = [1, 'Academic', 'CS', 'Hall A', 'Content', 'tok-1', GENESIS_HASH, '2026-09-30T10:00:00.000Z'];
    const hashOriginal = calculateHash(...baseParams);

    const modifiedParams = [1, 'Academic', 'CS', 'Hall A', 'Tampered Content', 'tok-1', GENESIS_HASH, '2026-09-30T10:00:00.000Z'];
    const hashModified = calculateHash(...modifiedParams);

    expect(hashOriginal).not.toEqual(hashModified);
  });
});
