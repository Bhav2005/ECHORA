const bcrypt = require('bcryptjs');

class Admin {
  constructor({ id, username, passwordHash, createdAt }) {
    this.id = id;
    this.username = username;
    this.passwordHash = passwordHash;
    this.createdAt = createdAt || new Date();
  }

  async verifyPassword(password) {
    return bcrypt.compare(password, this.passwordHash);
  }

  static fromRow(row) {
    return new Admin({
      id: row.id,
      username: row.username,
      passwordHash: row.password_hash,
      createdAt: row.created_at,
    });
  }
}

module.exports = Admin;
