const forge = require('node-forge');
const { getPublicKeyInfo, signBlindedMessage } = require('../../src/services/blindSignature.service');

describe('Blind Signature Service Unit Tests', () => {
  it('should retrieve RSA public key info (PEM, n, e)', () => {
    const keyInfo = getPublicKeyInfo();
    expect(keyInfo).toHaveProperty('pem');
    expect(keyInfo).toHaveProperty('n');
    expect(keyInfo).toHaveProperty('e');
    expect(keyInfo.pem).toContain('-----BEGIN PUBLIC KEY-----');
    expect(typeof keyInfo.n).toBe('string');
    expect(typeof keyInfo.e).toBe('string');
  });

  it('should correctly sign a blinded message and allow unblinded verification', () => {
    const keyInfo = getPublicKeyInfo();
    const n = new forge.jsbn.BigInteger(keyInfo.n, 16);
    const e = new forge.jsbn.BigInteger(keyInfo.e, 16);

    // 1. Secret message m
    const secretMessage = "echora-anonymous-token-12345";
    const md = forge.md.sha256.create();
    md.update(secretMessage, 'utf8');
    const m = new forge.jsbn.BigInteger(md.digest().toHex(), 16);

    // 2. Blinding factor r
    const rHex = "123456789abcdef0123456789abcdef0123456789abcdef0";
    const r = new forge.jsbn.BigInteger(rHex, 16);

    // 3. Blinded message T = m * r^e mod n
    const r_pow_e = r.modPow(e, n);
    const T = m.multiply(r_pow_e).mod(n);
    const T_hex = T.toString(16);

    // 4. Identity Service signs T -> S' = T^d mod n
    const S_prime_hex = signBlindedMessage(T_hex);
    expect(S_prime_hex).toBeDefined();

    // 5. Unblind S' -> S = S' * r^-1 mod n
    const S_prime = new forge.jsbn.BigInteger(S_prime_hex, 16);
    const r_inv = r.modInverse(n);
    const S = S_prime.multiply(r_inv).mod(n);

    // 6. Verify signature: S^e mod n == m
    const decrypted_m = S.modPow(e, n);
    expect(decrypted_m.equals(m)).toBe(true);
  });
});
