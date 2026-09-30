const forge = require('node-forge');
const tokenVerificationService = require('../../src/services/tokenVerification.service');

describe('Token Verification Service Unit Tests', () => {
  let keypair;
  let publicKeyInfo;

  beforeAll(() => {
    keypair = forge.pki.rsa.generateKeyPair({ bits: 1024 });
    publicKeyInfo = {
      pem: forge.pki.publicKeyToPem(keypair.publicKey),
      n: keypair.publicKey.n.toString(16),
      e: keypair.publicKey.e.toString(16),
    };
  });

  it('should return true for a valid RSA token message and signature pair', async () => {
    jest.spyOn(tokenVerificationService, 'fetchPublicKey').mockResolvedValue(publicKeyInfo);

    const messageHex = '1234567890abcdef1234567890abcdef';
    const M = new forge.jsbn.BigInteger(messageHex, 16);
    const S = M.modPow(keypair.privateKey.d, keypair.privateKey.n);

    const isValid = await tokenVerificationService.verifyToken(messageHex, S.toString(16));
    expect(isValid).toBe(true);
  });

  it('should return false for an invalid signature', async () => {
    jest.spyOn(tokenVerificationService, 'fetchPublicKey').mockResolvedValue(publicKeyInfo);

    const messageHex = '1234567890abcdef';
    const invalidSignatureHex = '9999999999ffffff';

    const isValid = await tokenVerificationService.verifyToken(messageHex, invalidSignatureHex);
    expect(isValid).toBe(false);
  });
});
