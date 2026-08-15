const forge = require('node-forge');
const dotenv = require('dotenv');

dotenv.config();

const IDENTITY_SERVICE_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:3001';

let cachedPublicKeyInfo = null;

const fetchPublicKey = async () => {
  if (cachedPublicKeyInfo) return cachedPublicKeyInfo;
  
  try {
    const url = `${IDENTITY_SERVICE_URL}/api/blindsign/public-key`;
    console.log(`Fetching public key from: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch public key, status: ${response.status}`);
    }
    const data = await response.json();
    cachedPublicKeyInfo = data;
    return cachedPublicKeyInfo;
  } catch (error) {
    console.error('Error fetching public key from Identity Service:', error);
    throw error;
  }
};

const verifyToken = async (tokenMessageHex, tokenSignatureHex) => {
  try {
    const publicKeyInfo = await fetchPublicKey();
    
    // Parse BigIntegers
    const M = new forge.jsbn.BigInteger(tokenMessageHex, 16);
    const S = new forge.jsbn.BigInteger(tokenSignatureHex, 16);
    const e = new forge.jsbn.BigInteger(publicKeyInfo.e, 16);
    const n = new forge.jsbn.BigInteger(publicKeyInfo.n, 16);
    
    // S^e mod N should equal M
    const decryptedM = S.modPow(e, n);
    
    return decryptedM.equals(M);
  } catch (error) {
    console.error('Token signature verification failed:', error);
    return false;
  }
};

module.exports = {
  verifyToken,
  fetchPublicKey, // Export for testing
};
