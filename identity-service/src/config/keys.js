const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

const KEYS_DIR = path.join(__dirname, '../../keys');
const PRIVATE_KEY_PATH = path.join(KEYS_DIR, 'private.pem');
const PUBLIC_KEY_PATH = path.join(KEYS_DIR, 'public.pem');

let privateKey = null;
let publicKey = null;

const loadOrCreateKeys = () => {
  if (!fs.existsSync(KEYS_DIR)) {
    fs.mkdirSync(KEYS_DIR, { recursive: true });
  }

  if (fs.existsSync(PRIVATE_KEY_PATH) && fs.existsSync(PUBLIC_KEY_PATH)) {
    const privateKeyPem = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
    const publicKeyPem = fs.readFileSync(PUBLIC_KEY_PATH, 'utf8');
    privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  } else {
    console.log('[Keys Config] Generating brand new 2048-bit RSA keys...');
    const { pki } = forge;
    const keypair = pki.rsa.generateKeyPair({ bits: 2048, workers: -1 });
    
    const privateKeyPem = pki.privateKeyToPem(keypair.privateKey);
    const publicKeyPem = pki.publicKeyToPem(keypair.publicKey);
    
    fs.writeFileSync(PRIVATE_KEY_PATH, privateKeyPem, 'utf8');
    fs.writeFileSync(PUBLIC_KEY_PATH, publicKeyPem, 'utf8');
    
    privateKey = keypair.privateKey;
    publicKey = keypair.publicKey;
  }

  return { privateKey, publicKey };
};

module.exports = {
  loadOrCreateKeys,
  PRIVATE_KEY_PATH,
  PUBLIC_KEY_PATH,
};
