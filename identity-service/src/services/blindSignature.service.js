const forge = require('node-forge');
const { loadOrCreateKeys } = require('../config/keys');

let privateKey = null;
let publicKey = null;

const initKeys = () => {
  const keys = loadOrCreateKeys();
  privateKey = keys.privateKey;
  publicKey = keys.publicKey;
};

const getPublicKeyInfo = () => {
  if (!publicKey) {
    initKeys();
  }
  return {
    pem: forge.pki.publicKeyToPem(publicKey),
    n: publicKey.n.toString(16), // Modulus as hex string
    e: publicKey.e.toString(16), // Exponent as hex string
  };
};

const signBlindedMessage = (blindedMessageHex) => {
  if (!privateKey) {
    initKeys();
  }
  try {
    const T = new forge.jsbn.BigInteger(blindedMessageHex, 16);
    const d = privateKey.d;
    const n = privateKey.n;
    
    // S' = T^d mod N
    const S_prime = T.modPow(d, n);
    return S_prime.toString(16); // Return signed blinded message as hex string
  } catch (error) {
    console.error('Error signing blinded message:', error);
    throw new Error('Failed to sign blinded token');
  }
};

// Initialize keys on startup
initKeys();

module.exports = {
  getPublicKeyInfo,
  signBlindedMessage,
};
