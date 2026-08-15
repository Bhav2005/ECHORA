// Comprehensive Cryptographic and Algorithmic Verification Script
// Tests RSA Blind Signatures, SHA-256 Hash Chaining, and k-Anonymity threshold logic.

const forge = require('node-forge');
const crypto = require('crypto');

// ==========================================
// 1. CLIENT CRYPTO CODE (Equivalent to client-side JS)
// ==========================================

function clientModPow(base, exp, mod) {
  let res = 1n;
  base = base % mod;
  while (exp > 0n) {
    if (exp % 2n === 1n) {
      res = (res * base) % mod;
    }
    base = (base * base) % mod;
    exp = exp / 2n;
  }
  return res;
}

function clientModInverse(a, m) {
  let m0 = m;
  let y = 0n, x = 1n;
  if (m === 1n) return 0n;
  let tempA = a;
  let tempM = m;
  while (tempA > 1n) {
    let q = tempA / tempM;
    let t = tempM;
    tempM = tempA % tempM;
    tempA = t;
    t = y;
    y = x - q * y;
    x = t;
  }
  if (x < 0n) x = x + m0;
  return x;
}

function clientGcd(a, b) {
  while (b !== 0n) {
    let t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function clientGetRandomBigInt() {
  // Mock secure random bytes in Node
  const buf = crypto.randomBytes(32);
  return BigInt('0x' + buf.toString('hex'));
}

// Blinds M: T = (M * r^e) % N
function clientBlindMessage(messageBigInt, publicKeyInfo) {
  const N = BigInt('0x' + publicKeyInfo.n);
  const e = BigInt('0x' + publicKeyInfo.e);

  let r = clientGetRandomBigInt();
  while (r >= N || clientGcd(r, N) !== 1n) {
    r = clientGetRandomBigInt();
  }

  const rPowerE = clientModPow(r, e, N);
  const T = (messageBigInt * rPowerE) % N;

  return {
    blindedMessageHex: T.toString(16),
    blindingFactor: r.toString(16),
  };
}

// Unblinds S': S = (S' * r^-1) % N
function clientUnblindSignature(signedBlindedHex, blindingFactorHex, publicKeyInfo) {
  const N = BigInt('0x' + publicKeyInfo.n);
  const S_prime = BigInt('0x' + signedBlindedHex);
  const r = BigInt('0x' + blindingFactorHex);

  const rInverse = clientModInverse(r, N);
  const S = (S_prime * rInverse) % N;

  return S.toString(16);
}

// ==========================================
// 2. BACKEND CRYPTO CODE
// ==========================================

// Server-side signing: S' = T^d % N
function serverSignBlindedMessage(blindedMessageHex, privateKey) {
  const T = new forge.jsbn.BigInteger(blindedMessageHex, 16);
  const d = privateKey.d;
  const n = privateKey.n;
  const S_prime = T.modPow(d, n);
  return S_prime.toString(16);
}

// Server-side verification: S^e % N == M
function serverVerifySignature(messageHex, signatureHex, publicKeyInfo) {
  const M = new forge.jsbn.BigInteger(messageHex, 16);
  const S = new forge.jsbn.BigInteger(signatureHex, 16);
  const e = new forge.jsbn.BigInteger(publicKeyInfo.e, 16);
  const n = new forge.jsbn.BigInteger(publicKeyInfo.n, 16);

  const decryptedM = S.modPow(e, n);
  return decryptedM.equals(M);
}

// ==========================================
// 3. HASH CHAIN CODE
// ==========================================

const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

function calculateBlockHash(id, category, department, building, content, tokenMessage, previousHash, createdAt) {
  const dataString = `${id}|${category}|${department}|${building}|${content}|${tokenMessage}|${previousHash}|${createdAt}`;
  return crypto.createHash('sha256').update(dataString).digest('hex');
}

// ==========================================
// 4. K-ANONYMITY FILTER CODE
// ==========================================

const K_THRESHOLD = 5;

function filterKAnonymity(data) {
  // Excludes group keys that have < K entries
  return data.filter(item => item.count >= K_THRESHOLD);
}

// ==========================================
// RUN TEST SUITE
// ==========================================

async function runTests() {
  console.log('--- STARTING ECHORA CRYPTOGRAPHIC & ALGORITHMIC TEST SUITE ---\n');

  // ----------------------------------------
  // TEST 1: RSA Blind Signature Verification
  // ----------------------------------------
  console.log('[Test 1] Testing RSA Blind Signature Protocol...');

  // A. Generate Keypair
  console.log('  Generating RSA key pair (2048-bit)...');
  const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048, workers: -1 });
  const publicKeyInfo = {
    n: keypair.publicKey.n.toString(16),
    e: keypair.publicKey.e.toString(16),
  };

  // B. Client: Generate unblinded token content (message M)
  const tokenMsgBigInt = clientGetRandomBigInt();
  const tokenMsgHex = tokenMsgBigInt.toString(16);
  console.log('  Client generated secret message M.');

  // C. Client: Blind message
  const { blindedMessageHex, blindingFactor } = clientBlindMessage(tokenMsgBigInt, publicKeyInfo);
  console.log('  Client blinded secret message M to blinded token T.');

  // D. Server: Sign blinded message
  const signedBlindedHex = serverSignBlindedMessage(blindedMessageHex, keypair.privateKey);
  console.log("  Server signed blinded token T to S'.");

  // E. Client: Unblind signature
  const unblindedSignatureHex = clientUnblindSignature(signedBlindedHex, blindingFactor, publicKeyInfo);
  console.log('  Client unblinded signature S.');

  // F. Server verification
  const isVerified = serverVerifySignature(tokenMsgHex, unblindedSignatureHex, publicKeyInfo);
  console.log(`  Verifying (M, S) against server public key... Result: ${isVerified ? '✅ VERIFIED' : '❌ FAILED'}`);

  if (!isVerified) throw new Error('RSA Blind Signature protocol check failed!');
  console.log();

  // ----------------------------------------
  // TEST 2: SHA-256 Hash Chaining
  // ----------------------------------------
  console.log('[Test 2] Testing Tamper-Evident Hash Chain...');

  // Block 1 (First Complaint)
  const block1 = {
    id: crypto.randomUUID(),
    category: 'HR Grievance',
    department: 'Engineering & Dev',
    building: 'Building B',
    content: 'Unfair treatment',
    tokenMessage: tokenMsgHex,
    previous_hash: GENESIS_HASH,
    created_at: new Date().toISOString()
  };
  block1.block_hash = calculateBlockHash(
    block1.id, block1.category, block1.department, block1.building, block1.content, block1.tokenMessage, block1.previous_hash, block1.created_at
  );
  console.log(`  Block 1 created. HASH: ${block1.block_hash.substring(0, 16)}...`);

  // Block 2 (Second Complaint)
  const block2 = {
    id: crypto.randomUUID(),
    category: 'Safety Hazard',
    department: 'Operations & Facilities',
    building: 'Building C',
    content: 'Exposed wires near exit',
    tokenMessage: clientGetRandomBigInt().toString(16),
    previous_hash: block1.block_hash, // Chained
    created_at: new Date().toISOString()
  };
  block2.block_hash = calculateBlockHash(
    block2.id, block2.category, block2.department, block2.building, block2.content, block2.tokenMessage, block2.previous_hash, block2.created_at
  );
  console.log(`  Block 2 created. HASH: ${block2.block_hash.substring(0, 16)}... (Chained to Block 1)`);

  // Chain Audit Verification
  const verifyChain = (blocks) => {
    let runningPrevHash = GENESIS_HASH;
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (b.previous_hash !== runningPrevHash) return { valid: false, error: `Block ${i + 1} previous hash mismatch` };

      const calc = calculateBlockHash(b.id, b.category, b.department, b.building, b.content, b.tokenMessage, b.previous_hash, b.created_at);
      if (b.block_hash !== calc) return { valid: false, error: `Block ${i + 1} block hash mismatch` };

      runningPrevHash = b.block_hash;
    }
    return { valid: true };
  };

  const audit1 = verifyChain([block1, block2]);
  console.log(`  Chain Audit... Result: ${audit1.valid ? '✅ VALID' : '❌ CORRUPT'} ${audit1.error || ''}`);
  if (!audit1.valid) throw new Error('Chaining verify failed!');

  // Attempt Tampering
  console.log('  [TAMPER ATTACK] Modifying Block 1 content to "Everything is fine"...');
  block1.content = 'Everything is fine';
  const audit2 = verifyChain([block1, block2]);
  console.log(`  Chain Audit post-tamper... Result: ${audit2.valid ? '✅ VALID' : '❌ CORRUPT'} (Detection details: ${audit2.error})`);

  if (audit2.valid) throw new Error('Ledger failed to detect content tampering!');
  console.log();

  // ----------------------------------------
  // TEST 3: k-Anonymity Gate
  // ----------------------------------------
  console.log('[Test 3] Testing k-Anonymity Gate Threshold (k=5)...');

  const rawAggregateStats = [
    { department: 'Engineering & Dev', count: 6 },
    { department: 'Marketing & Sales', count: 1 }, // Vulnerable group
    { department: 'Operations & Facilities', count: 5 },
    { department: 'Finance & Admin', count: 3 } // Vulnerable group
  ];

  console.log('  Raw dashboard aggregate groups:', rawAggregateStats);
  const filteredStats = filterKAnonymity(rawAggregateStats);
  console.log('  k-Anonymity (k=5) active. Filtered output groups:', filteredStats);

  // Assertions
  const hasMarketing = filteredStats.some(s => s.department === 'Marketing & Sales');
  const hasFinance = filteredStats.some(s => s.department === 'Finance & Admin');
  const hasEngineering = filteredStats.some(s => s.department === 'Engineering & Dev');

  if (hasMarketing || hasFinance) throw new Error('k-Anonymity gate failed to filter vulnerable divisions with counts < 5!');
  if (!hasEngineering) throw new Error('k-Anonymity gate filtered valid group with count >= 5!');

  console.log('  k-Anonymity filter... Result: ✅ VALID\n');

  console.log('--- ALL CORE MATHEMATICAL AND ALGORITHMIC TESTS PASSED! ---');
}

runTests().catch(err => {
  console.error('\n❌ TEST SUITE RUN FAILURE:', err.message);
  process.exit(1);
});
