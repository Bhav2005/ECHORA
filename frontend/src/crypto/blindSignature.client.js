// Cryptographic client operations using JavaScript BigInt
// Blinds and unblinds RSA signatures to preserve anonymity.

/**
 * Calculates modular exponentiation: (base^exp) % mod
 */
export function modPow(base, exp, mod) {
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

/**
 * Computes modular multiplicative inverse of a mod m using Extended Euclidean Algorithm
 */
export function modInverse(a, m) {
  let m0 = m;
  let y = 0n, x = 1n;
  if (m === 1n) return 0n;
  
  let tempA = a;
  let tempM = m;

  while (tempA > 1n) {
    if (tempM === 0n) return 0n; // Avoid division by zero
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

/**
 * Calculates greatest common divisor
 */
function gcd(a, b) {
  while (b !== 0n) {
    let t = b;
    b = a % b;
    a = t;
  }
  return a;
}

/**
 * Generates a cryptographically secure random BigInt
 */
export function getRandomBigInt(bytesCount = 32) {
  const array = new Uint8Array(bytesCount);
  window.crypto.getRandomValues(array);
  let hex = '';
  for (let i = 0; i < array.length; i++) {
    hex += array[i].toString(16).padStart(2, '0');
  }
  return BigInt('0x' + hex);
}

/**
 * Performs client-side blinding of a message
 * T = (M * r^e) % N
 */
export function blindMessage(messageBigInt, publicKeyInfo) {
  const N = BigInt('0x' + publicKeyInfo.n);
  const e = BigInt('0x' + publicKeyInfo.e);

  // Generate a random blinding factor r < N, gcd(r, N) = 1
  let r = getRandomBigInt(32);
  while (r >= N || gcd(r, N) !== 1n) {
    r = getRandomBigInt(32);
  }

  // Calculate r^e mod N
  const rPowerE = modPow(r, e, N);

  // Calculate T = (M * r^e) mod N
  const T = (messageBigInt * rPowerE) % N;

  return {
    blindedMessageHex: T.toString(16),
    blindingFactor: r.toString(16),
  };
}

/**
 * Unblinds the signed response received from server
 * S = (S' * r^-1) % N
 */
export function unblindSignature(signedBlindedHex, blindingFactorHex, publicKeyInfo) {
  const N = BigInt('0x' + publicKeyInfo.n);
  const S_prime = BigInt('0x' + signedBlindedHex);
  const r = BigInt('0x' + blindingFactorHex);

  // Calculate r^-1 mod N
  const rInverse = modInverse(r, N);

  // Calculate S = (S' * r^-1) mod N
  const S = (S_prime * rInverse) % N;

  return S.toString(16);
}
