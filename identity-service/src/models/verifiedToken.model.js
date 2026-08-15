const crypto = require('crypto');

class VerifiedToken {
  constructor(tokenHash, email, createdAt = new Date()) {
    this.tokenHash = tokenHash;
    this.email = email;
    this.createdAt = createdAt;
  }

  static validateHash(blindedMessage, storedHash) {
    const computed = crypto.createHash('sha256').update(blindedMessage).digest('hex');
    return computed === storedHash;
  }

  static fromRow(row) {
    return new VerifiedToken(row.token_hash, row.email, row.created_at);
  }
}

module.exports = VerifiedToken;
